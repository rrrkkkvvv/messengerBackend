const { Schema, model } = require("mongoose");
const Joi = require("joi");
const mongoose = require("mongoose");

const handleMongooseError = require("../helpers/handleMongooseError");

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
  },
  { versionKey: false, timestamps: true }
);

conversationSchema.post("save", handleMongooseError);

const createConversationSchema = Joi.object({
  userIds: Joi.array().items(Joi.string()).min(2).required(),
  isGroup: Joi.boolean().default(false),

  name: Joi.alternatives().conditional("isGroup", {
    is: true,
    then: Joi.string().required(),
    otherwise: Joi.forbidden(),
  }),
});
const deleteConversationSchema = Joi.object({
  _id: Joi.string().required(),
});

const Conversation = model("conversation", conversationSchema);
module.exports = {
  Conversation,
  createSchema: createConversationSchema,
  deleteSchema: deleteConversationSchema,
};
