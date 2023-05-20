import express, {
    Request,
    Response,
} from 'express';
const router = express.Router()
const axios = require('axios')
import { CONFIG } from '../config/conf'
import { connect, Account, keyStores, KeyPair, utils } from 'near-api-js';
import { IUser } from 'common/models/User';

router.get('',  async (req : Request, res : Response) => {
    console.log(CONFIG)
    const userInfo = await axios.get(`${process.env.AUTH_BASE_URL}/auth/kakao/verify`,{
        headers: {
            'x-2to3-accesstoken': req.headers['x-2to3-accesstoken']
          }
    })
    if(!userInfo){
        res.json({code:'-1',data:{msg:'user not exist'}})
        return
    }
    const { walletAddress, userId } = userInfo.data as IUser;
  
    const keyStore = new keyStores.InMemoryKeyStore();
    const near = await connect({ ...CONFIG, keyStore });
  
    const account = new Account(near.connection, walletAddress!!);
    const state = await account.state();
  
    res.json({
        state,
        walletAddress,
        userId: userId
    });
  })

  module.exports = router;