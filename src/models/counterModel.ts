import { Schema, model } from "mongoose";

interface CounterPayload {
  name: string;
  sequence: number;
}

const counterSchema = new Schema<CounterPayload>({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  sequence: {
    type: Number,
    required: true,
    default: 0,
  },
});

const Counter = model<CounterPayload>("Counter", counterSchema);

export default Counter;
