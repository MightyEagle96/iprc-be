import { Schema, model } from "mongoose";

type status = "pending" | "approved" | "rejected";
export interface IParticipant {
  firstName: string;
  lastName: string;
  middleName: string;
  email: string;
  phone: string;
  rrr: string;
  tagId: string;
  rank: string;
  title: string;
  gender: string;
  dateOfBirth: string;
  ST_NAME: string;
  ST_ID: number;
  REGION: string;
  INName: string;
  INID: number;
  status: status;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<IParticipant>(
  {
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
  },
  {
    timestamps: true,
  },
);

schema
  .index({ email: 1 }, { unique: true })
  .index({ phone: 1 }, { unique: true })
  .index({ rrr: 1 }, { unique: true });

const Participant = model<IParticipant>("Participant", schema);
export default Participant;
