import mongoose from "mongoose";

const { Schema, model } = mongoose;

const blogPostSchema = new Schema(
  {
    category: { type: String, required: true },
    title: { type: String, required: true },
    cover: { type: String, required: true },
    readTime: {
      value: { type: Number, min: 0, max: 60, required: true },
      unit: { type: String },
    },
    author: { type: Schema.Types.ObjectId, ref: "author" },
    content: { type: String, required: true },
    comments: [
      {
        comment: { type: String, required: true },
        rate: { type: Number, min: 1, max: 5, required: true },
        commentDate: { type: Date, required: true },
      },
    ],
    likes: [
      {
        userId: { type: mongoose.Types.ObjectId, ref: "User" },
        _id: false,
      },
    ],
  },
  { timestamps: true }
);

blogPostSchema.static("findBlogs", async function (mongoQuery) {
  const total = await this.countDocuments(mongoQuery.criteria);
  const data = await this.find(mongoQuery.criteria)
    .limit(mongoQuery.options.limit || 10)
    .skip(mongoQuery.options.skip || 0)
    .sort(mongoQuery.options.sort)
    .populate({ path: "author" });

  return { total, data };
});

export default model("blogPost", blogPostSchema);
