import {
    MongoClient,
    Db,
} from 'mongodb';

import User, {IUser} from 'common/models/User'

async function insertUserDocument(userInfo: IUser): Promise<void> {
    const client = new MongoClient('mongodb://localhost:27017');
    await client.connect();
    
    const db: Db = client.db('2to3');
  
    await db.collection('user').insertOne(userInfo);
  
    await client.close();
  }
  
  export {
    insertUserDocument
  }