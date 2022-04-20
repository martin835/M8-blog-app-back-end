import mongoose from "mongoose";

const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    nickName: { type: String, required: true },
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String, required: true },
    dateOfBirth: { type: Date },
    age: { type: Number, min: 18, max: 65 },
  },
  {
    timestamps: true, // adds and manages automatically createdAt and updatedAt fields
  }
);

export default model("User", userSchema);
