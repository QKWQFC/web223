import {
    MongoClient,
    Db,
} from 'mongodb';

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
        returnDocument: 'after',
        upsert: true
    });

    await client.close();

    if (!sequenceDocument.value) {
        throw new Error('Failed to get the next sequence value');
    }

    return sequenceDocument.value.sequence_value;
}

export {getNextSequenceValue}