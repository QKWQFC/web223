import express, {
    Request,
    Response,
} from 'express';
import axios from 'axios';
const router = express.Router()
import { IUser } from 'common/models/User';

import {ObjectId} from 'mongodb'

import {
    MintBody,
} from 'common/models/NFTMint'

import {
    insertNftDocument,
    approveMintDocument,
    updateNftDocument,
} from 'common/dao/nft'

import {
    getSequenceValue,
    getSerialNumberOfNFT,
    getSequenceNumberOfNFT
} from 'common/dao/sequence'

import {
    TransferBody
} from 'common/models/NftTransfer'
import { SerialBody } from 'common/models/Sequence';

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
interface Royalty {
    [receiverId: string]: number
}
interface CustomContract extends Contract {
    nft_mint: (args: {
        callbackUrl: string;
        token_id: string;
        metadata: any;
        receiver_id: string;
        perpetual_royalties: Royalty;
    }, gas: number, amount: number) => Promise < void > ;
    nft_metadata: () => Promise < any > ;
}

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

async function createSeries(contractId:string, serialBody: SerialBody){
    const masterAccount = await getMasterAccount()
    // Initializing our contract APIs by contract name and configuration
    const contract = new Contract(masterAccount, contractId, {
        viewMethods:[],
        changeMethods: ['create_series'],
    }) as any;
    const seqNo = await getSerialNumberOfNFT(contractId, serialBody)
    await contract.create_series(
        {
            args: {
                id: `${seqNo}`,
                price: `${serialBody.price}`,
                perpetual_royalties: {
                    [`${serialBody.providerId}`]: "10000"
                },
                metadata: {
                    title: serialBody.title,
                    description: serialBody.description,
                    media: serialBody.media
                }
            },
            gas:'30000000000000',
            amount: utils.format.parseNearAmount('0.1')
        }
    );
    
}

async function mintNFT(receiverId: string, contractId: string, mintBody: MintBody): Promise<boolean> {
    // Initialize connection to the NEAR testnet
    const masterAccount = await getMasterAccount()
    // Initializing our contract APIs by contract name and configuration
    const contract = new Contract(masterAccount, contractId, {
        // View methods are read-only – they don't modify the state, but usually return some value
        viewMethods: [],
        // Change methods can modify the state, but you don't receive the returned value when called
        changeMethods: ['nft_mint'],
    }) as any;

    mintBody.receiverId = receiverId
    mintBody.approved = false
    const inserted: ObjectId | null = await insertNftDocument({
        contractId: contractId,
        mintBody: mintBody
    })
    if(!inserted){
        return false
    }
    const seqNo = await getSequenceNumberOfNFT(contractId)
    
    // Mints a new token and returns it
    await contract.nft_mint(
        {
            callbackUrl:`http://localhost:3003/web3/nft/contracts/${contractId}/mint/callback`,
            meta: inserted.toHexString(),
            args: {
                id : `${seqNo}`,
                token_id: mintBody.tokenId,
                receiver_id: receiverId,
            },
            gas:'300000000000000',
            amount: utils.format.parseNearAmount('0.1')
        }
    );
        // TODO : callbackURL when deploy on internet.
        // /contracts/:id/mint/callback?meta=:token_id
    await axios.get(`http://localhost:3003/web3/nft/contracts/${contractId}/mint/callback?meta=${inserted.toHexString()}`)
    return true
}

async function getMetadata(contractId: string) {
    const contractAccount = await getContractAccount(contractId)

    // Initializing our contract APIs by contract name and configuration
    const contract = new Contract(contractAccount, config.contractName, {
        viewMethods: ['nft_metadata'],
        changeMethods: [],
    }) as CustomContract; // Cast the Contract object to your new interface

    const metadata = await contract.nft_metadata();

    return metadata
}

router.post('/contracts/:id', async (req: Request <{id: string}> , res: Response) => {
    const contractId = req.params.id
    const serialBody = req.body
    if(!serialBody){
        res.status(400).send('Bad Request: `serialBody` Missing or invalid in body ');
        return
    }
    await createSeries(contractId, serialBody)
    res.json({})
})

router.post('/contracts/:id/mint', async (req: Request < {
    id: string
} > , res: Response) => {
    const mintBody: MintBody = req.body
    const contractId = req.params.id
    if (!mintBody.tokenId || !contractId) {
        res.status(400).send('Bad Request: Missing or invalid ');
        return;
    }
    const result = await mintNFT(process.env.MASTER_ACCOUNT_ID!!, contractId, mintBody);
    if(result){
        res.json({})
    }
    else {
        res.status(400).send(`Bad Request: Already exist token ${mintBody.tokenId}`);
    }
    
})

router.get('/contracts/:id/mint/callback', async (req: Request , res: Response) => {
    const contractId = req.params.id
    const nftId = req.query.meta as string
    const contractAccount = await getContractAccount(contractId)
    const status = await contractAccount.connection.provider.status()
    await approveMintDocument(contractId, nftId, status.sync_info.latest_block_height)
    res.json({})
})

router.get('/contracts/:id/metadata', async (req: Request < {
    id: string
} > , res: Response) => {
    const contractId = req.params.id
    if (!contractId) {
        res.json({
            code: '-1',
            data: {
                msg: 'contractId not exist'
            }
        })
    }
    const metaData = await getMetadata(contractId)
    res.json(metaData)
})

router.post('/contracts/:id/transfer', async (req: Request < {
    id: string,
} > , res: Response) => {
    const contractId = req.params.id
    const transferBody = req.body as TransferBody
    const masterAccount = await getMasterAccount()

    const contract = new Contract(masterAccount, contractId, {
        viewMethods: [],
        changeMethods: ['nft_transfer'],
    }) as any;

    await contract.nft_transfer({
        args: {
            callbackUrl: `http://localhost:3003/web3/nft/contracts/${contractId}/tokens/${transferBody.tokenId}/transfer/callback`,
            meta: transferBody.receiverId,
            receiver_id: transferBody.receiverId,
            token_id: transferBody.tokenId
        },
        gas:'300000000000000',
        amount: oneYoctoNEARInString
    });

    await axios.get(`http://localhost:3003/web3/nft/contracts/${contractId}/tokens/${transferBody.tokenId}/transfer/callback?meta=${transferBody.receiverId}`)
    res.json({})
})

router.get('/contracts/:id/tokens/:token_id/transfer/callback', async (req: Request , res: Response) => {
    const contractId = req.params.id
    const token_id = req.params.token_id
    const receiver_id = req.query.meta as string
    const contractAccount = await getContractAccount(contractId)
    const status = await contractAccount.connection.provider.status()
    updateNftDocument(contractId, token_id, receiver_id, status.sync_info.latest_block_height)
    res.json({})
})

router.get('/contracts/:id/tokens', async (req: Request, res: Response)=>{
    const contractId = req.params.id
    const userInfo = await axios.get(`${process.env.AUTH_BASE_URL}/auth/kakao/verify`,{
        headers: {
            'x-2to3-accesstoken': req.headers['x-2to3-accesstoken']
          }
    })
    if(!userInfo){
        res.json({code:'-1',data:{msg:'user not exist'}})
        return
    }
    const { walletAddress } = userInfo.data as IUser;

    const masterAccount = await getMasterAccount()

    const contract = new Contract(masterAccount, contractId, {
        viewMethods: ['nft_tokens_for_owner'],
        changeMethods: [],
    }) as any;
    console.log(walletAddress)
    const nftTokens = await contract.nft_tokens_for_owner({
        args: {
            account_id: walletAddress,
            from_index: '0',
            limit: 10,
        },
        gas:'300000000000000'
    });
    
    res.json(nftTokens)
})

module.exports = router