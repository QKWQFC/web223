import express, {
    Request,
    Response,
} from 'express';

import axios from 'axios';

import {
    connect,
    Contract,
    keyStores,
    Account,
    utils
} from 'near-api-js';

const {
    KeyPairEd25519,
} = require('@near-js/crypto');

const oneYoctoNEARInString = utils.format.parseNearAmount('0.000000000000000000000001');

const router = express.Router()

// Initializing KeyStore
const NETWORK_ID = process.env.NETWORK_ID || 'testnet'
const MASTER_ACCOUNT_ID = process.env.MASTER_ACCOUNT_ID || ''
const MASTER_ACCOUNT_PRIVATE = process.env.MASTER_ACCOUNT_PRIVATE!!
const masterKeyPair = new KeyPairEd25519(MASTER_ACCOUNT_PRIVATE)
const keyStore = new keyStores.InMemoryKeyStore()
keyStore.setKey(NETWORK_ID, MASTER_ACCOUNT_ID, masterKeyPair)
// Set up some config variables
const config = {
    networkId: 'testnet', // Change this to 'mainnet' for actual transactions
    nodeUrl: 'https://rpc.testnet.near.org', // Overwrite this if you're using 'mainnet'
    walletUrl: 'https://wallet.testnet.near.org', // Overwrite this if you're using 'mainnet'
    helperUrl: 'https://helper.testnet.near.org',
    contractName: process.env.NFT_CONTRACT_ID!!, // get the contract id from environment variables
    keyStore: keyStore
};

async function getContractAccount(contractId: string): Promise < Account > {
    
    const near = await connect({
        networkId: config.networkId,
        nodeUrl: config.nodeUrl,
        deps: {
            keyStore: keyStore
        },
        masterAccount: MASTER_ACCOUNT_ID
    });
    const contractAccount = await near.account(contractId)

    return contractAccount
}
async function getMasterAccount(): Promise < Account > {
    return getContractAccount(MASTER_ACCOUNT_ID)
}


router.put('/contracts/:id/deposit', async (req: Request, res: Response)=>{
    const contractId = req.params.id
    const depositBody = req.body
    
    const masterAccount = await getMasterAccount()

    const contract = new Contract(masterAccount, contractId, {
        viewMethods: [],
        changeMethods: ['storage_deposit'],
    }) as any;

    await contract.nft_tokens_for_owner({
        args: {
            account_id: depositBody['account_id'],
        },
        gas:'300000000000000',
        amount: oneYoctoNEARInString
    });
    
    res.json({})
})


module.exports = router