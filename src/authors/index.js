import BlogPostModel from "./models.js";
import express from "express";
import createError from "http-errors";
import q2m from "query-to-mongo";
import blogPostsCommentsRouter from "../blogPosts/comments/index.js";
import AuthorModel from "./models.js";

const authorsRouter = express.Router();

//1 Post Author
authorsRouter.post("/", async (req, res, next) => {
  console.log("📨 PING - POST REQUEST");
  try {
    const newAuthor = new AuthorModel(req.body);
    const { _id } = await newAuthor.save();
    res.status(201).send({ _id });
  } catch (error) {
    next(error);
  }
});
//2 Get all Authors
authorsRouter.get("/", async (req, res, next) => {
  try {
  } catch (error) {
    next(error);
  }
});
//3 Get One Author
authorsRouter.get("/:id", async (req, res, next) => {
  try {
  } catch (error) {
    next(error);
  }
});
//4 Edit an Author
authorsRouter.put("/:id", async (req, res, next) => {
  try {
  } catch (error) {
    next(error);
  }
});
//5 Delete an Author
authorsRouter.delete("/:id", async (req, res, next) => {
  try {
  } catch (error) {
    next(error);
  }
});

export default authorsRouter;
