import BlogPostModel from "../models.js";
import express from "express";
import createError from "http-errors";
import q2m from "query-to-mongo";

const blogPostsCommentsRouter = express.Router();

//6  POST a COMMENT to a BlogPost
blogPostsCommentsRouter.post(
  "/:blogPostId/comments",
  async (req, res, next) => {
    try {
      console.log("➡️ PING - POST a COMMENT REQUEST");

      const newComment = {
        ...req.body,
        commentDate: new Date(),
      };

      const blogPost = await BlogPostModel.findByIdAndUpdate(
        req.params.blogPostId,
        { $push: { comments: newComment } },
        { new: true, runValidators: true }
      );

      if (blogPost) {
        res.send(blogPost);
      } else {
        next(
          createError(
            404,
            `Blog post with id ${req.params.blogPostId} not found!`
          )
        );
      }
    } catch (error) {
      console.log(error);
    }
  }
);

//7 GET COMMENTS for  a BlogPost
blogPostsCommentsRouter.get("/:blogPostId/comments", async (req, res, next) => {
  try {
    console.log("➡️ PING - GET ALL COMMENTs REQUEST");

    const blogPostComments = await BlogPostModel.findById(
      req.params.blogPostId
    );
    if (blogPostComments) {
      res.send(blogPostComments.comments);
    } else {
      next(
        createError(
          404,
          `Blog post with id ${req.params.blogPostId} not found!`
        )
      );
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});
//8 GET ONE COMMENT from a BlogPost
blogPostsCommentsRouter.get(
  "/:blogPostId/comments/:commentId",
  async (req, res, next) => {
    try {
      console.log("➡️ PING - GET a COMMENT REQUEST");

      const blogPost = await BlogPostModel.findById(req.params.blogPostId);
      if (blogPost) {
        const comment = blogPost.comments.find(
          (comment) => comment._id.toString() === req.params.commentId
        );

        if (comment) {
          res.send(comment);
        } else {
          next(
            createError(
              404,
              `Comment with id ${req.params.commentId} not found!`
            )
          );
        }
      } else {
        next(
          createError(
            404,
            `Blog post with id ${req.params.blogPostId} not found!`
          )
        );
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);
//9 EDIT a COMMENT in a BlogPost
blogPostsCommentsRouter.put(
  "/:blogPostId/comments/:commentId",
  async (req, res, next) => {
    try {
      console.log("➡️ PING - EDIT a COMMENT REQUEST");

      const blogPost = await BlogPostModel.findById(req.params.blogPostId);
      if (blogPost) {
        const index = blogPost.comments.findIndex(
          (comment) => comment._id.toString() === req.params.commentId
        );
        if (index !== -1) {
          blogPost.comments[index] = {
            ...blogPost.comments[index].toObject(),
            ...req.body,
          };

          await blogPost.save();

          res.send(blogPost);
        } else {
          next(
            createError(
              404,
              `Comment with id ${req.params.commentId} not found!`
            )
          );
        }
      } else {
        next(
          createError(
            404,
            `Blog post with id ${req.params.blogPostId} not found!`
          )
        );
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);
//10 DELETE A COMMENT in a BlogPost
blogPostsCommentsRouter.delete(
  "/:blogPostId/comments/:commentId",
  async (req, res, next) => {
    try {
      console.log("➡️ PING - DELETE a COMMENT REQUEST");

      const modifiedBlogPost = await BlogPostModel.findByIdAndUpdate(
        req.params.blogPostId, //what
        { $pull: { comments: { _id: req.params.commentId } } }, //how
        { new: true } //options
      );
      if (modifiedBlogPost) {
        res.send(modifiedBlogPost);
      } else {
        next(
          createError(
            404,
            `Blog post with id ${req.params.blogPostId} not found!`
          )
        );
      }
    } catch (error) {
      console.log(error);
    }
  }
);

export default blogPostsCommentsRouter;
