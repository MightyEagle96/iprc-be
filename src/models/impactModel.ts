import { Schema, model } from "mongoose";

export interface ImpactPayload {
  registrationNumber: number;
  firstName: string;
  lastName: string;
  gender: string;
  email: string;
  phoneNumber: string;
  memberOfRccg: boolean;
  ageGrade: string;
  classCategory: ClassCategory;
}

//export type AgeGrade = "10-19" | "20-25" | "31-36" | "37+";

export type ClassCategory = "A" | "B" | "C";

const schema = new Schema<ImpactPayload>(
  {
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
  },
  {
    timestamps: true,
  },
);

schema
  .index({ phoneNumber: 1 }, { unique: true })
  .index({ email: 1 }, { unique: true });

const Impact = model<ImpactPayload>("Impact", schema);

export default Impact;
