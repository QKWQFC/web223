require('dotenv').config();
var express = require('express');
var router = express.Router();
const sha256 = require("js-sha256");
const {
    KeyPairEd25519,
    KeyType,
    PublicKey,
    Signature
} = require('@near-js/crypto');
const {
    connect,
    KeyPair,
    keyStores,
    utils
} = require("near-api-js");
const nearAPI = require('near-api-js');

const NETWORK_ID = process.env.NETWORK_ID
const NODE_URL = process.env.NODE_URL
const MASTER_ACCOUNT_ID = process.env.MASTER_ACCOUNT_ID
const MASTER_ACCOUNT_PRIVATE = process.env.MASTER_ACCOUNT_PRIVATE
const masterKeyPair = new KeyPairEd25519(MASTER_ACCOUNT_PRIVATE)
const keyStore = new keyStores.InMemoryKeyStore()

keyStore.setKey(NETWORK_ID, MASTER_ACCOUNT_ID, masterKeyPair)

const config = {
    keyStore,
    networkId: NETWORK_ID,
    nodeUrl: "https://rpc.testnet.near.org",
};

function createRegexPattern(networkId) {
    const networkIdPattern = networkId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // 특수 문자를 이스케이프합니다
    const regexString = `.*\\.${networkIdPattern}`;
    return new RegExp(regexString);
  }

router.post('/create', async function (req, res, next) {
    const createWallet = req.body
    const keyPair = KeyPairEd25519.fromRandom(); // private key 

    const near = await connect({
        networkId: config.networkId,
        nodeUrl: config.nodeUrl,
        deps: {
            keyStore: config.keyStore
        },
        masterAccount: MASTER_ACCOUNT_ID
    });

    const regex = createRegexPattern(NETWORK_ID);
    if (!createWallet.id.match(regex)) {
        return res.json({
            msg: 'error'
        })
    }
    const masterAccount = await near.account(MASTER_ACCOUNT_ID)
    const account = await masterAccount.createAccount(createWallet.id, keyPair.publicKey, '100000000000000000000000');
    
    res.json({
        accoundId: createWallet.id,
        publicKey: keyPair.publicKey,
        privateKey: keyPair.secretKey
    })
});

module.exports = router;