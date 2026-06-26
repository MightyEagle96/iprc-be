import { Schema, model } from "mongoose";
const schema = new Schema({
    username: { type: String, lowercase: true, required: true, trim: true },
    name: { type: String, lowercase: true, required: true, trim: true },
    gender: { type: String, lowercase: true, required: true, trim: true },
    email: { type: String, lowercase: true, required: true, trim: true },
    province: { type: String, lowercase: true, required: true, trim: true },
    phoneNumber: { type: String, lowercase: true, required: true, trim: true },
    accredited: { type: Boolean, default: false },
    timeAccredited: { type: Date },
});
schema.index({ username: 1 }, { unique: true });
schema.index({ email: 1 }, { unique: true });
const Attendee = model("Attendee", schema);
export default Attendee;
//# sourceMappingURL=attendeeModel.js.map