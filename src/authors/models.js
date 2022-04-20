import mongoose from "mongoose";

const { Schema, model } = mongoose;

const authorSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String },
    avatar: { type: String, required: true },
  },
  { timestamps: true }
);

export default model("author", authorSchema);
