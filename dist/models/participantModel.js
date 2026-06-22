import { Schema, model } from "mongoose";
const schema = new Schema({
    firstName: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        default: "",
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        default: "",
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        default: "",
    },
    phone: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        default: "",
    },
    gender: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        default: "",
    },
    rrr: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        default: "",
    },
    rank: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        default: "",
    },
    title: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        default: "",
    },
    status: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        default: "pending",
    },
    ST_NAME: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        default: "",
    },
    ST_ID: {
        type: Number,
        required: true,
        trim: true,
        lowercase: true,
        default: 0,
    },
    REGION: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        default: "",
    },
    tagId: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        default: "",
    },
    INName: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        default: "",
    },
    INID: {
        type: Number,
        required: true,
        trim: true,
        lowercase: true,
        default: 0,
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
schema.virtual("name").get(function () {
    return `${this.firstName} ${this.lastName}`;
});
schema
    .index({ email: 1 }, { unique: true })
    .index({ phone: 1 }, { unique: true })
    .index({ rrr: 1 }, { unique: true });
const Participant = model("Participant", schema);
export default Participant;
//# sourceMappingURL=participantModel.js.map