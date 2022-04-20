import mongoose from "mongoose";

const { Schema, model } = mongoose;

const likesSchema = new Schema(
  {
    users: [
      {
        userId: { type: mongoose.Types.ObjectId, ref: "User" },
        _id: false,
      },
    ],
    blogPostId: { type: mongoose.Types.ObjectId, ref: "BlogPost" },
  },
  { timestamps: true }
);

export default model("Likes", likesSchema);
