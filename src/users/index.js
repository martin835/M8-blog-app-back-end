import express from "express";
import createError from "http-errors";
import UsersModel from "./model.js";
import BlogPostModel from "../blogPosts/models.js";
import LikesModel from "../blogPosts/likesModel.js";
import { generateAccessToken } from "../auth/tools.js";
import { JWTAuthMiddleware } from "../auth/JWTMiddleware.js";

const usersRouter = express.Router();

usersRouter.post("/", async (req, res, next) => {
  try {
    const newUser = new UsersModel(req.body); // here happens validation of req.body, if it is not ok Mongoose will throw an error (if it is ok user it it NOT saved in db yet)

    const { _id } = await newUser.save(); // this is the line in which the interaction with the db happens
    res.status(201).send({ _id });
  } catch (error) {
    next(error);
  }
});

usersRouter.get("/", async (req, res, next) => {
  try {
    const users = await UsersModel.find();
    res.send(users);
  } catch (error) {
    next(error);
  }
});

usersRouter.get("/me", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const user = await UsersModel.findById(req.user._id);
    if (user) {
      res.send(user);
    } else {
      next(createError(401, `User with id ${req.user._id} not found!`));
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.get("/googleLogin");
usersRouter.get("/googleRedirect");

usersRouter.get("/:userId", async (req, res, next) => {
  try {
    const user = await UsersModel.findById(req.params.userId);
    if (user) {
      res.send(user);
    } else {
      next(createError(404, `User with id ${req.params.userId} not found!`));
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.put("/:userId", async (req, res, next) => {
  try {
    const updatedUser = await UsersModel.findByIdAndUpdate(
      req.params.userId, // WHO
      req.body, // HOW
      { new: true, runValidators: true } // OPTIONS by default findByIdAndUpdate returns the record pre-modification, if you want to get back the newly updated record you should use the option new: true
      // by default validation is off here, if you want to have it --> runValidators: true as an option
    );

    // ****************** ALTERNATIVE METHOD *******************
    // const user = await UsersModel.findById(req.params.userId)

    // user.firstName = "John"

    // await user.save()

    if (updatedUser) {
      res.send(updatedUser);
    } else {
      next(createError(404, `User with id ${req.params.userId} not found!`));
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.delete("/:userId", async (req, res, next) => {
  try {
    const deletedUser = await UsersModel.findByIdAndDelete(req.params.userId);
    if (deletedUser) {
      res.status(204).send();
    } else {
      next(createError(404, `User with id ${req.params.userId} not found!`));
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.post("/login", async (req, res, next) => {
  console.log(" LOGIN REQUEST");
  try {
    // 1. Obtain credentials
    const { email, password } = req.body;
    //2 . Verify credentials
    const user = await UsersModel.checkCredentials(email, password);

    if (user) {
      //3. If credentials are OK we are going to generate access Token and send it as a response

      const accessToken = await generateAccessToken({
        _id: user._id,
        role: user.role,
      });

      res.send({ accessToken });
    } else {
      //4. if credentials NOT OK - throw error  (401)
      next(createError(401, `Credentials are not OK!`));
    }
  } catch (error) {
    next(error);
  }
});

export default usersRouter;
