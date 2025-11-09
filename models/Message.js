const { Schema, model } = require("mongoose");
const Joi = require("joi");
const mongoose = require("mongoose");

const handleMongooseError = require("../helpers/handleMongooseError.js");

const messageSchema = new Schema(
  {
    isCallInfo: {
      type: Boolean,
    },
    isAnswered: {
      type: Boolean,
    },
    isEnded: {
      type: Boolean,
      required: () => {
        return this.isCallInfo && this.isAnswered;
      },
    },
    duration: {
      type: Number,
      required: () => {
        return this.isCallInfo && this.isEnded;
      },
    },
    messageText: {
      type: String,
    },
    messageImage: {
      type: String,
      default: null,
      validate: {
        validator: function () {
          return this.isCallInfo || this.messageText || this.messageImage;
        },
        message: "MessageText or messageImage is required.",
      },
    },
    seenIds: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
        },
      ],
    },
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "conversation",
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    editedAt: {
      type: Date,
      default: undefined,
    },
  },
  {
    timestamps: { createdAt: "sentAt" },
    versionKey: false,
  }
);

messageSchema.pre("save", (next) => {
  if (this.isNew) {
    this.editedAt = undefined;
  }
  next();
});
messageSchema.post("save", handleMongooseError);
const createMessageSchema = Joi.object({
  senderId: Joi.string().required(),
  conversationId: Joi.string().required(),
  messageText: Joi.string(),
  messageImage: Joi.string(),
  seenIds: Joi.array().items(Joi.string()),
}).or("messageImage", "messageText");

const editMessageSchema = Joi.object({
  _id: Joi.string().required(),
  messageText: Joi.string(),
  messageImage: Joi.string(),
}).or("messageText", "messageImage");

const editMessageSeenSchema = Joi.object({
  userId: Joi.string().required(),
});

const deleteMessageSchema = Joi.object({
  _id: Joi.string().required(),
});

const Message = model("message", messageSchema);

module.exports = {
  Message,
  createMessageSchema,
  editMessageSchema,
  editMessageSeenSchema,
  deleteMessageSchema,
};
