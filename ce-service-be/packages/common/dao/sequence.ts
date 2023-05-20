import Sequence from '../models/Sequence';
import {
    ISequence,
    SerialBody
} from 'common/models/Sequence';
import {
    MongoClient,
    Db,
} from 'mongodb';

async function getSerialNumberOfNFT(contractId: string, serialBody: SerialBody): Promise < number > {
    const sequenceName = 'seqInc'
    const client = new MongoClient('mongodb://localhost:27017');
    await client.connect();
    let serialNumber = 0
    const db: Db = client.db('2to3');
    const sequenceDocument = await db.collection('sequence').findOne<ISequence>({
        sequenceName: sequenceName,
        contractId: contractId
    });
    if (!sequenceDocument) {
        const latestSerial = await getSequenceValue(sequenceName, contractId)
        await db.collection('sequence').insertOne({
            sequenceName: sequenceName,
            sequence_value: latestSerial,
            contractId: contractId,
            serialBody: serialBody
        })
        serialNumber = latestSerial
    } else {
        console.log( sequenceDocument)
        serialNumber = sequenceDocument.sequence_value
    }
    await client.close()
    return serialNumber
}

async function getSequenceNumberOfNFT(contractId: string): Promise < number > {
    const sequenceName = 'seqInc'
    const client = new MongoClient('mongodb://localhost:27017');
    await client.connect();
    let serialNumber = 0
    const db: Db = client.db('2to3');
    const sequenceDocument = await db.collection('sequence').findOne<ISequence>({
        sequenceName: sequenceName,
        contractId: contractId
    });
    if (!sequenceDocument) {
        const latestSerial = await getSequenceValue(sequenceName, contractId)
        await db.collection('sequence').insertOne({
            sequenceName: sequenceName,
            sequence_value: latestSerial,
            contractId: contractId,
        })
        serialNumber = latestSerial
    } else {
        console.log( sequenceDocument)
        serialNumber = sequenceDocument.sequence_value
    }
    await client.close()
    return serialNumber
}

async function getSequenceValue(sequenceName: string = 'productid', contractId: string): Promise < number > {
    const client = new MongoClient('mongodb://localhost:27017');
    await client.connect();

    const db: Db = client.db('2to3');

    const sequenceDocument = await db.collection('sequence').findOne<ISequence>({
        sequenceName: sequenceName
    }, {
        sort: {
            sequence_value: -1
        },
    });

    if (!sequenceDocument) {
        return 0
    }

    await client.close();

    return sequenceDocument.sequence_value;
}

async function getNextSequenceValue(sequenceName: string = 'productid'): Promise < number > {
    const client = new MongoClient('mongodb://localhost:27017');
    await client.connect();

    const db: Db = client.db('2to3');

    const sequenceDocument = await db.collection('sequence').findOneAndUpdate({
        sequenceName: sequenceName
    }, {
        $inc: {
            sequence_value: 1
        }
    }, {
        sort: {
            sequence_value: -1
        },
        returnDocument: 'after',
        upsert: true
    });

    await client.close();

    if (!sequenceDocument.value) {
        throw new Error('Failed to get the next sequence value');
    }

    return sequenceDocument.value.sequence_value;
}

export {
    getNextSequenceValue,
    getSequenceNumberOfNFT,
    getSequenceValue,
    getSerialNumberOfNFT
}