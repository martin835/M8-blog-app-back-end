import BlogPostModel from "./models.js";
import express from "express";
import createError from "http-errors";
import q2m from "query-to-mongo";
import blogPostsCommentsRouter from "./comments/index.js";
import likesModel from "./likesModel.js";
import UsersModel from "../users/model.js";

const blogPostsRouter = express.Router();

//1 POST a BlogPost
blogPostsRouter.post("/", async (req, res, next) => {
  try {
    console.log("📨 PING - POST REQUEST");

    const newBlogPost = new BlogPostModel(req.body);

    await newBlogPost.save();

    res.send(newBlogPost._id);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

//2 GET ALL BlogPosts
blogPostsRouter.get("/", async (req, res, next) => {
  try {
    console.log("➡️ PING - GET ALL REQUEST");
    console.log("REQ QUERY: ", req.query);
    console.log("QUERY-TO-MONGO: ", q2m(req.query));
    const mongoQuery = q2m(req.query);

    const { total, data } = await BlogPostModel.findBlogs(mongoQuery);

    res.send({
      links: mongoQuery.links(
        `http://localhost:${process.env.PORT}/blogPosts`,
        total
      ),
      total,
      totalPages: Math.ceil(total / mongoQuery.options.limit),
      data,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

//3 GET ONE BlogPost
blogPostsRouter.get("/:blogPostId", async (req, res, next) => {
  try {
    console.log("➡️ PING - GET ONE REQUEST");

    const blogPost = await BlogPostModel.findById(
      req.params.blogPostId
    ).populate({ path: "author" });

    if (blogPost) {
      res.send(blogPost);
    } else {
      next(
        createError(
          404,
          `Blog post with id ${req.params.blogPostId} not found :(`
        )
      );
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

//4 EDIT ONE BlogPost
blogPostsRouter.put("/:blogPostId", async (req, res, next) => {
  try {
    console.log("➡️ PING - REQUEST");
    let dataToInsert = {};
    const temp = { $set: {} };
    if (req.body.author) {
      for (let key in req.body.author) {
        temp.$set[`author.${key}`] = req.body.author[key];
      }
    }
    if (req.body.readTimeValue) {
      for (let key in req.body.author) {
        temp.$set[`author.${key}`] = req.body.author[key];
      }
    }

    const { author, ...rest } = req.body;

    dataToInsert = { ...rest, ...temp };
    console.log(dataToInsert);

    const updatedBlogPost = await BlogPostModel.findByIdAndUpdate(
      req.params.blogPostId,
      dataToInsert,
      { new: true, runValidators: true }
    );
    if (updatedBlogPost) {
      res.send(updatedBlogPost);
    } else {
      next(
        createError(
          404,
          `Blog post with id ${req.params.blogPostId} not found :(`
        )
      );
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

//5 DELETE ONE BlogPost
blogPostsRouter.delete("/:blogPostId", async (req, res, next) => {
  try {
    console.log("➡️ PING - DELETE BlogPost REQUEST");
    const deleteBlogPost = await BlogPostModel.findByIdAndDelete(
      req.params.blogPostId
    );
    if (deleteBlogPost) {
      res.status(204).send();
    } else {
      next(
        createError(
          404,
          `Blog post with id ${req.params.blogPostId} not found :(`
        )
      );
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

//6 POST LIKE TO BLOG POST

blogPostsRouter.post("/:blogPostId/likes", async (req, res, next) => {
  console.log("👍 PING - LIKE REQUEST");
  try {
    // we are going to receive bookId and quantity from req.body
    const { userId } = req.body;

    // 0. Does blog post exist?

    const blogPost = await BlogPostModel.findById(req.params.blogPostId);
    if (!blogPost)
      return next(
        createError(404, `Blog post with id ${req.params.blogPostId} not found`)
      );

    // 1. Does user exist?

    const user = await UsersModel.findById(userId);
    if (!user)
      return next(createError(404, `User with id ${userId} not found`));

    // 2. Is the blog post already liked by specified userId?
    const isBlogPostLiked = await BlogPostModel.findOne({
      _id: req.params.blogPostId,
      "likes.userId": user._id,
    });

    if (isBlogPostLiked) {
      // 3.1 If it is there --> remove like

      const modifiedLikes = await BlogPostModel.findOneAndUpdate(
        {
          _id: req.params.blogPostId,
        },
        {
          $pull: { likes: { userId: userId } }, // in JS --> find index of the element --> products[index].quantity += quantity
        },
        {
          new: true,
        }
      );
      res.send(modifiedLikes);
    } else {
      // 3.2 If it is not --> add like
      const modifiedLikes = await BlogPostModel.findOneAndUpdate(
        { _id: req.params.blogPostId }, // WHAT we want to modify
        { $push: { likes: { userId: user._id } } }, // HOW we want to modify the record
        {
          new: true, // OPTIONS
          upsert: true, // if the like of that blog post is not found --> just create it automagically please
        }
      );
      res.send(modifiedLikes);
    }
  } catch (error) {
    next(error);
  }
});

export default blogPostsRouter;
