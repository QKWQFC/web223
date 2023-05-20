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

import {
    onSaleNFTDocument
} from 'common/dao/nft'
import { getUserDocumentByNearAccount } from 'common/dao/user';

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

interface DepositBody {
    accountId : string;
    amount : string;
}
router.post('/contracts/:id/deposit', async (req: Request, res: Response)=>{
    const contractId = req.params.id
    const depositBody : DepositBody = req.body
    const accountId = depositBody.accountId
    if(!accountId){
        res.status(400).send('Bad Request: `account_id` Missing or invalid in body ');
        return
    }
    const masterAccount = await getMasterAccount()

    const contract = new Contract(masterAccount, accountId, {
        viewMethods: [],
        changeMethods: ['storage_deposit'],
    }) as any;
    
    await contract.storage_deposit({
        args: {
            account_id: MASTER_ACCOUNT_ID,
        },
        gas:'300000000000000',
        amount: utils.format.parseNearAmount(depositBody.amount)
    });
    
    res.json({})
})

interface ApproveBody {
    tokenId: string;
    accountId: string;
    salePrice : string;
}

router.post('/contracts/:id/approve', async (req: Request, res: Response)=>{
    const contractId = req.params.id
    const approveBody : ApproveBody = req.body
    const accountId = approveBody.accountId
    if(!accountId){
        res.status(400).send('Bad Request: `account_id` Missing or invalid in body ');
        return
    }
    const masterAccount = await getMasterAccount()
    
    const contract = new Contract(masterAccount, contractId, {
        viewMethods: [],
        changeMethods: ['nft_approve'],
    }) as any;

    await contract.nft_approve({
        args: {
            account_id: accountId,
            token_id: approveBody.tokenId,
            msg: JSON.stringify({sale_conditions: utils.format.parseNearAmount(approveBody.salePrice)})
        },
        gas:'300000000000000',
        amount: utils.format.parseNearAmount("0.0004") // 최소 amount 
    });

    const contractAccount = await getContractAccount(contractId)
    const status = await contractAccount.connection.provider.status()
    
    await onSaleNFTDocument(contractId, approveBody.tokenId, approveBody.salePrice, status.sync_info.latest_block_height)
    
    res.json({})
})

interface OfferBody {
    accountId: string;
    marketId : string;
    tokenId: string;
    purchasePrice: string;
}

router.post('/contracts/:id/offer', async (req: Request, res: Response)=>{
    const contractId = req.params.id
    const offerBody : OfferBody = req.body
    const accountId = offerBody.accountId
    if(!accountId){
        res.status(400).send('Bad Request: `account_id` Missing or invalid in body ');
        return
    }
    //
    const userInfo = await getUserDocumentByNearAccount(accountId)
    if(userInfo){
        const keyPair = new KeyPairEd25519(userInfo?.privateKey!!)
        keyStore.setKey(NETWORK_ID,accountId, keyPair)
    }
    //
    const account = await getContractAccount(accountId)

    const contract = new Contract(account, offerBody.marketId, {
        viewMethods: [],
        changeMethods: ['offer'],
    }) as any;

    await contract.offer({
        args: {
            nft_contract_id: contractId,
            token_id: offerBody.tokenId,
        },
        gas:'300000000000000',
        amount: utils.format.parseNearAmount(offerBody.purchasePrice)
    });
    
    res.json({})
})

module.exports = router