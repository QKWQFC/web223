import mongoose, {
    Document,
    Schema
} from 'mongoose';

// MUST: Refactoring 

interface ISequence {
    sequenceName: string;
    sequence_value: number;
    contractId: string;
    serialBody?: SerialBody;
}

interface SerialBody {
    title: string;
    description: string;
    providerId: string;
    media: string;
    price: number;
}

const SequenceSchema: Schema = new Schema({
    sequenceName: {
        type: String,
        required: true,
        unique: true
    },
    sequence_value: {
        type: Number,
        required: true,
        default: 0
    },
    sequenceId: {
        type: String,
        required: true,
        unique: true
    },
    serialBody: {
        type: Object,
        required: false
    }

});

interface ISequenceDocument extends ISequence, Document {}

const Sequence = mongoose.model < ISequenceDocument > ('Sequence', SequenceSchema);

export default Sequence;

export {
    ISequence,
    SerialBody
}