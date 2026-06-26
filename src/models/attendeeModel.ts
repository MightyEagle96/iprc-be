import { Schema, model } from "mongoose";

export interface AttendeePayload {
  username: string;
  name: string;
  gender: string;
  email: string;
  province: string;
  phoneNumber: string;
  accredited: boolean;
  timeAccredited: Date;
}

const schema = new Schema<AttendeePayload>({
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

const Attendee = model<AttendeePayload>("Attendee", schema);

export default Attendee;
