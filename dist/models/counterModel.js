import { Schema, model } from "mongoose";
const counterSchema = new Schema({
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
const Counter = model("Counter", counterSchema);
export default Counter;
//# sourceMappingURL=counterModel.js.map