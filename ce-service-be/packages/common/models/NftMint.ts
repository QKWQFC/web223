import mongoose, {
    Document,
    Schema
} from 'mongoose';

interface INFTMint {
    contractId: string;
    blockHeight?: number;
    mintBody: MintBody;
}

interface MintBody {
    tokenId ? : string;
    title: string;
    description: string;
    providerId: string; // 실제 돈을 받는 사람
    receiverId: string; // NFT 를 갖은 사람
    media: string;
    approved?: boolean;
}

const NftSchema: Schema = new Schema({
    contractId: {
        type: String,
        required: true,
    },
    blockHeight: {
        type: BigInt,
        required: true,
        default: 0
    },
    mintBody: {
        type: Object,
        required: true,
    },
    approved: {
        type: Boolean,
        required: false,
        default: false
    }
});

interface INftMintDocument extends INFTMint, Document {}

const NftMint = mongoose.model < INftMintDocument > ('NftMint', NftSchema);

export default NftMint;

export {
    INFTMint,
    MintBody
}