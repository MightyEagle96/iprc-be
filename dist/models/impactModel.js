import { Schema, model } from "mongoose";
const schema = new Schema({
    ageGrade: {
        type: String,
        enum: ["10-19", "20-25", "26-30", "31-36", "37+"],
        required: true,
    },
    registrationNumber: {
        type: Number,
        required: true,
        unique: true,
    },
    firstName: {
        type: String,
        lowercase: true,
        required: true,
        trim: true,
    },
    lastName: {
        type: String,
        lowercase: true,
        required: true,
        trim: true,
    },
    gender: {
        type: String,
        lowercase: true,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        lowercase: true,
        required: true,
        trim: true,
    },
    phoneNumber: {
        type: String,
        required: true,
        trim: true,
    },
    memberOfRccg: {
        type: Boolean,
        required: true,
    },
    classCategory: {
        type: String,
        enum: ["A", "B", "C"],
        required: true,
    },
}, {
    timestamps: true,
});
schema
    .index({ phoneNumber: 1 }, { unique: true })
    .index({ email: 1 }, { unique: true });
const Impact = model("Impact", schema);
export default Impact;
//# sourceMappingURL=impactModel.js.map