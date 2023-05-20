import mongoose, { Document, Schema } from 'mongoose';

interface IWallet {
  walletId: string;
  publicKey: string;
  privateKey: string;
}

const WalletSchema: Schema = new Schema({
  walletId: { type: String, required: true, unique: true },
  publicKey: { type: String, required: true, unique: true },
  privateKey: { type: String, required: true, unique: true },
});

interface IWalletDocument extends IWallet, Document {}

const Wallet = mongoose.model<IWalletDocument>('Wallet', WalletSchema);

export default Wallet;