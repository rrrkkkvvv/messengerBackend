const { Schema, model } = require("mongoose");
const Joi = require("joi");
const mongoose = require("mongoose");

const handleMongooseError = require("../helpers/handleMongooseError.js");
const { userInfoSchema } = require("./User.js");
const { editedAt } = require("./Message.js");

const conversationSchema = new Schema(
  {
    userIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],
    isGroup: { type: Boolean },
    name: {
      type: String,
      required: () => {
        return this.isGroup ? true : false;
      },
    },
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: () => {
        return this.isGroup ? true : false;
      },
    },
    avatarURL: {
      type: String,
      default: null,
    },
  },
  { versionKey: false, timestamps: true }
);

conversationSchema.post("save", handleMongooseError);
const getConversationDataSchema = Joi.object({
  isGroup: Joi.boolean(),
  _id: Joi.string().required(),
});
const createGroupConversationSchema = Joi.object({
  userIds: Joi.array().items(Joi.string()).min(1).required(),

  name: Joi.string().required(),
  creatorId: Joi.string().required(),
});
// const createGroupConversationSchema = Joi.object({
//   userIds: Joi.array().items(Joi.string()).min(2).required(),
//   isGroup: Joi.boolean().default(false),

//   name: Joi.alternatives().conditional("isGroup", {
//     is: true,
//     then: Joi.string().required(),
//     otherwise: Joi.forbidden(),
//   }),
//   creatorId: Joi.alternatives().conditional("isGroup", {
//     is: true,
//     then: Joi.string().required(),
//     otherwise: Joi.forbidden(),
//   }),
// });

const kickUserSchema = Joi.object({
  conversationId: Joi.string().required(),
  kickedUserId: Joi.string().required(),
});

const addUsersSchema = Joi.object({
  conversationId: Joi.string().required(),
  users: Joi.array().items(Joi.string()).min(1).required(),
});

const leaveConversationSchema = Joi.object({
  conversationId: Joi.string().required(),
});

const updateGroupConversationSchema = Joi.object({
  _id: Joi.string().required(),
  name: Joi.string().optional(),
  avatar: Joi.object({
    fileBuffer: Joi.array().items(Joi.number()).allow(null),
  }).optional(),
  creatorId: Joi.string(),
});

const deleteConversationSchema = Joi.object({
  conversationId: Joi.string().required(),
});

const messageSchema = Joi.object({
  messageText: Joi.string().allow("").optional(),
  messageImage: Joi.object({
    fileBuffer: Joi.array().items(Joi.number()).allow(null),
  }).optional(),
});

const sendMessageSchema = Joi.object({
  conversationId: Joi.string().required(),
  message: messageSchema.required(),
});

const updateMessageSchema = Joi.object({
  conversationId: Joi.string().required(),
  message: messageSchema
    .keys({
      _id: Joi.string().required(),
      sender: userInfoSchema.optional(),
      messageImage: Joi.alternatives()
        .try(
          Joi.object({
            fileBuffer: Joi.array().items(Joi.number()).allow(null),
          }),
          Joi.string(),
          Joi.valid(""),
          Joi.valid(null)
        )
        .optional(),
      seenIds: Joi.array().items(Joi.string()),
      conversationId: Joi.string(),
      senderId: Joi.string(),
      editedAt: Joi.date().optional(),
      updatedAt: Joi.date(),
      sentAt: Joi.date(),
    })
    .required(),
});

const deleteMessageSchema = Joi.object({
  conversationId: Joi.string().required(),
  messageId: Joi.string().required(),
});
const Conversation = model("conversation", conversationSchema);
module.exports = {
  Conversation,
  createGroupConversationSchema,
  deleteConversationSchema,
  updateGroupConversationSchema,
  leaveConversationSchema,
  addUsersSchema,
  kickUserSchema,
  deleteMessageSchema,
  updateMessageSchema,
  sendMessageSchema,
  getConversationDataSchema,
};
