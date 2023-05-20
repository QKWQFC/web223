import { IUser } from 'common/models/User';
import express, {
  Request,
  Response,
} from 'express';
const router = express.Router()
import axios from 'axios';
import {
  MongoClient,
  Db
} from 'mongodb';
import querystring from 'querystring';



router.get('/kakao', (req: Request, res: Response) => {
  const url = `https://kauth.kakao.com/oauth/authorize?client_id=${process.env.KAKAO_APP_CLIENT_ID}&redirect_uri=${process.env.KAKAO_APP_REDIRECT_URI}&response_type=code`
  res.redirect(url);
});

router.get('/kakao/callback', async (req: Request, res: Response) => {
  const code = req.query.code as string;
  const tokenRequest = await axios.post('https://kauth.kakao.com/oauth/token', querystring.stringify({
    grant_type: 'authorization_code',
    client_id: process.env.KAKAO_APP_CLIENT_ID,
    redirect_uri: process.env.KAKAO_APP_REDIRECT_URI,
    code,
  }), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
    }
  });

  const accessToken = tokenRequest.data.access_token;
  const userInfo = await verify(accessToken)
  res.json(userInfo)
});

router.get('/kakao/verify', async (req: Request, res: Response) => {
  const accessToken = req.headers['x-2to3-accesstoken']
  console.log(accessToken)
  if (!accessToken || Array.isArray(accessToken)) {
    res.json({
      code: '-1',
      data: {
        msg: `accessToken undefined ${accessToken}`
      }
    })
    return
  }
  const userInfo = await verify(accessToken)
  res.json(userInfo);
})

const verify = async (accessToken: string): Promise<IUser> => {
  const profileRequest = await axios.get('https://kapi.kakao.com/v2/user/me', {
    headers: {
      Authorization: 'Bearer ' + accessToken
    }
  });

  const profile = profileRequest.data;

  const client = new MongoClient('mongodb://localhost:27017');
  await client.connect();
  const db: Db = client.db('2to3');

  let user: IUser | null = await db.collection('user').findOne({
    userId: profile.id
  }) as IUser | null;
  if (user) {
    const result = await db.collection('user').findOneAndUpdate({
      userId: profile.id
    }, {
      $set: {
        accessToken: accessToken
      }
    }, {
      returnDocument: 'after',
    })
    const userInfo = result.value as unknown as IUser | null
    return userInfo || user
  } else {
    user = {
      userId: profile.id,
      accessToken,
    }
    const response = await axios.post(`${process.env.WALLET_BASE_URL}/api/wallet/create`, user);
    const userInfo = response.data
    return userInfo
  }
}


module.exports = router;
