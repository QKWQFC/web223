import mongoose, {
    Document,
    Schema
} from 'mongoose';

enum NFT_STATUS{
    ON_SALE = 'ON_SALE',
    OWN = 'OWN',
    BANNED = 'BANNED'
}

interface INFTMint {
    contractId: string;
    blockHeight?: number;
    mintBody: MintBody;
    price?: string;
    status?: NFT_STATUS
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
    price: {
        type: String,
        require: false,
        default: '0'
    },
    status: {
        type: String,
        require: true,
        default: 'OWN'
    }
});

interface INftMintDocument extends INFTMint, Document {}

const NftMint = mongoose.model < INftMintDocument > ('NftMint', NftSchema);

export default NftMint;

export {
    INFTMint,
    MintBody,
    NFT_STATUS
}