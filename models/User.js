const { Schema, model } = require("mongoose");
const Joi = require("joi");
const handleMongooseError = require("../helpers/handleMongooseError.js");
const emailRegexp = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

const userSchema = new Schema(
  {
    email: {
      type: String,
      match: emailRegexp,
      required: [true, "Email is required"],
      unique: true,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      unique: false,
    },

    avatarURL: {
      type: String,
      default: null,
    },
    token: {
      type: String,
      default: null,
    },
    googleId: {
      type: String,
      default: null,
    },
    password: {
      type: String,
      required: () => {
        return false;
      },
    },
  },
  { versionKey: false, timestamps: true }
);

userSchema.post("save", handleMongooseError);
const userInfoSchema = Joi.object({
  _id: Joi.string().required(),
  email: Joi.string().pattern(emailRegexp).required().max(254),
  name: Joi.string().required().max(90),
  avatarURL: Joi.string().allow(null),
  conversationId: Joi.string().allow(null),
  isTyping: Joi.string().allow(null),
});
const signUpSchema = Joi.object({
  email: Joi.string().pattern(emailRegexp).required().max(254),
  name: Joi.string().required().max(90),
  password: Joi.string().required(),
});
const editUserAvatarSchema = Joi.object({
  avatarURL: Joi.string().allow(null),
});
const signInSchema = Joi.object({
  email: Joi.string().pattern(emailRegexp).required(),
  password: Joi.string().required(),
});
const googleAuthSchema = Joi.object({
  googleToken: Joi.string().required(),
});
const updateProfileSchema = Joi.object({
  name: Joi.string().optional(),
  avatar: Joi.object({
    fileBuffer: Joi.alternatives().try(
      Joi.array().items(Joi.number()),
      Joi.valid(null)
    ),
  }).optional(),
});
const User = model("user", userSchema);
module.exports = {
  User,
  signUpSchema,
  signInSchema,
  googleAuthSchema,
  editUserAvatarSchema,
  updateProfileSchema,
  userInfoSchema,
};
