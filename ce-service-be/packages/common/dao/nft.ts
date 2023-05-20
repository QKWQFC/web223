import {
    MongoClient,
    Db,
    ObjectId
} from 'mongodb';

import Nft, {
    INFTMint
} from '../models/NftMint';

async function insertNftDocument(nftInfo: INFTMint): Promise < ObjectId | null > {
    const client = new MongoClient('mongodb://localhost:27017');
    await client.connect();

    const db: Db = client.db('2to3');
    const nft = await db.collection(nftInfo.contractId).findOne<INFTMint>({"mintBody.tokenId":nftInfo.mintBody.tokenId})
    if(!nft){
        const insertedDoc = await db.collection(nftInfo.contractId).insertOne(nftInfo);
        return insertedDoc.insertedId
    }
    return null
    await client.close();
    
}

async function approveMintDocument(contractId: string, nftId: string, blockHeight: number): Promise < void > {
    const client = new MongoClient('mongodb://localhost:27017');
    await client.connect();

    const db: Db = client.db('2to3');
    
    await db.collection(contractId).findOneAndUpdate({
        _id: new ObjectId(nftId)
    }, {
        $set: {
            blockHeight : blockHeight,
            "mintBody.approved": true
        }
    }, {
        upsert: true
    });
    await client.close();
}


async function updateNftDocument(contractId: string, tokenId: string, receiverId: string, blockHeight: number): Promise < void > {
    const client = new MongoClient('mongodb://localhost:27017');
    await client.connect();

    const db: Db = client.db('2to3');

    await db.collection(contractId).findOneAndUpdate({
        contractId: contractId,
        "mintBody.tokenId": tokenId
    }, {
        $set: {
            blockHeight : blockHeight,
            "mintBody.receiverId":receiverId,
            "mintBody.approved": true
        }
    }, {
        upsert: true
    });
    await client.close();
}

export {
    insertNftDocument,
    approveMintDocument,
    updateNftDocument
}