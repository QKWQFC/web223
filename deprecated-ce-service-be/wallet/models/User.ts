import mongoose, { Document, Schema } from 'mongoose';

interface IUser {
  userId: string;
  email: string;
}

const UserSchema: Schema = new Schema({
  userId: { type: String, required: true },
  email: { type: String, required: true, unique: true },
});

interface IUserDocument extends IUser, Document {}

const User = mongoose.model<IUserDocument>('User', UserSchema);

export default User;