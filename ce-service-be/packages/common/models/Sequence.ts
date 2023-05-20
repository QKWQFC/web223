import mongoose, {
    Document,
    Schema
} from 'mongoose';

interface ISequence {
    sequenceName: string;
    seqNo: number;
}

const SequenceSchema: Schema = new Schema({
    sequenceName: {
        type: String,
        required: true,
        unique: true
    },
    seqNo: {
        type: Number,
        required: true,
        default: 0
    },
});

interface ISequenceDocument extends ISequence, Document {}

const Sequence = mongoose.model < ISequenceDocument > ('Sequence', SequenceSchema);

export default Sequence;

export {
    ISequence
}