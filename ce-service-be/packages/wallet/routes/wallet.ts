require('dotenv').config();
import express, {
    Request,
    Response,
    NextFunction
} from 'express';
import {
    getNextSequenceValue
} from 'common/dao/sequence'
import {
    insertUserDocument
} from 'common/dao/user'
import { IUser } from 'common/models/User';

var router = express.Router();
const {
    KeyPairEd25519,
} = require('@near-js/crypto');
const {
    connect,
    keyStores,
} = require("near-api-js");

const NETWORK_ID = process.env.NETWORK_ID
const NODE_URL = process.env.NEAR_NODE_URL
const MASTER_ACCOUNT_ID = process.env.MASTER_ACCOUNT_ID
const MASTER_ACCOUNT_PRIVATE = process.env.MASTER_ACCOUNT_PRIVATE
const masterKeyPair = new KeyPairEd25519(MASTER_ACCOUNT_PRIVATE)
const keyStore = new keyStores.InMemoryKeyStore()

keyStore.setKey(NETWORK_ID, MASTER_ACCOUNT_ID, masterKeyPair)

const config = {
    keyStore,
    networkId: NETWORK_ID,
    nodeUrl: NODE_URL,
};

router.post('/create', async function (req: Request, res: Response, next: NextFunction) {
    const uniqueNo = await getNextSequenceValue('walletInc')
    const reqUser : IUser = req.body
    const accoundId = `${uniqueNo}.${MASTER_ACCOUNT_ID}`
    const keyPair = KeyPairEd25519.fromRandom(); // private key 
    
    const near = await connect({
        networkId: config.networkId,
        nodeUrl: config.nodeUrl,
        deps: {
            keyStore: config.keyStore
        },
        masterAccount: MASTER_ACCOUNT_ID
    });

    // Create Near Account
    const masterAccount = await near.account(MASTER_ACCOUNT_ID)
    await masterAccount.createAccount(accoundId, keyPair.publicKey, '100000000000000000000000'); // 0.1 near

    // Update User DB
    const userInfo : IUser =  {
        seqNo: uniqueNo,
        userId: reqUser.userId,
        email: reqUser.email,
        walletAddress: accoundId,
        privateKey: keyPair.secretKey,
        publicKey: keyPair.publicKey
    }
    await insertUserDocument(userInfo)

    res.json(userInfo)
});

module.exports = router;