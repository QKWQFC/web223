import mongoose, {
    Document,
    Schema
} from 'mongoose';

interface INFTTransfer {
    contractId: string;
    blockHeight?: number;
    transferBody: TransferBody;
}

interface TransferBody {
    tokenId : string;
    receiverId : string;
    approved?: boolean;
}

const NftTransferSchema: Schema = new Schema({
    contractId: {
        type: String,
        required: true,
    },
    blockHeight: {
        type: BigInt,
        required: true,
        default: 0
    },
    transferBody: {
        type: Object,
        required: true,
    },
    approved: {
        type: Boolean,
        required: false,
        default: false
    }
});

interface INftTransferDocument extends INFTTransfer, Document {}

const NftTransfer = mongoose.model < INftTransferDocument > ('NftTransfer', NftTransferSchema);

export default NftTransfer;

export {
    INFTTransfer,
    TransferBody
}