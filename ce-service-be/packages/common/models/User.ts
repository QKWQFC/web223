import mongoose, { Document, Schema } from 'mongoose';

interface IUser {
  seqNo?: number;
  userId: string;
  accessToken?: string;
  email?: string;
  walletAddress?: string;
  privateKey?: string;
  publicKey?: string;
}

const UserSchema: Schema = new Schema({
  seqNo:{ type: Number, required: true, unique: true },
  userId: { type: String, required: true },
  accessToken: { type: String, required: false},
  email: { type: String, required: false, unique: true },
  walletAddress: { type: String, required: true, unique: true },
  privateKey: { type: String, required: true, unique: true },
  publicKey: { type: String, required: true, unique: true },
});

interface IUserDocument extends IUser, Document {}

const User = mongoose.model<IUserDocument>('User', UserSchema);

export default User;

export {
  IUser
}