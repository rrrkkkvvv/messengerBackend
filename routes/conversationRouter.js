const express = require("express");
const { updateProfileSchema } = require("../models/User.js");
const validateBody = require("../helpers/validateBody.js");
const authenticate = require("../middlewares/authenticate.js");
const {
  createGroupConversationSchema,
  updateGroupConversationSchema,
  leaveConversationSchema,
  addUsersSchema,
  kickUserSchema,
  deleteConversationSchema,
  sendMessageSchema,
  updateMessageSchema,
  deleteMessageSchema,
  getConversationDataSchema,
} = require("../models/Conversation.js");
const upload = require("../helpers/multerUploader.js");

const {
  updateGroup,
  leaveConversation,
  addUsers,
  kickUser,
  removeConversation,
  sendMessage,
  updateMessage,
  deleteMessage,
  createGroupConversation,
  getConversationData,
} = require("../controllers/conversationControllers.js");

const conversationRouter = express.Router();

conversationRouter.get(
  "/getData",
  validateBody(getConversationDataSchema),
  authenticate,

  getConversationData
);
conversationRouter.post(
  "/createGroupConversation",
  validateBody(createGroupConversationSchema),
  authenticate,
  createGroupConversation
);
conversationRouter.post(
  "/createGroupConversation",
  validateBody(createGroupConversationSchema),
  authenticate,
  createGroupConversation
);
conversationRouter.post(
  "/kickUser",
  authenticate,
  validateBody(kickUserSchema),
  kickUser
);

conversationRouter.post(
  "/addUsers",
  authenticate,
  validateBody(addUsersSchema),
  addUsers
);

conversationRouter.post(
  "/leave",
  authenticate,
  validateBody(leaveConversationSchema),
  leaveConversation
);

conversationRouter.put(
  "/updateGroup",
  authenticate,
  upload.fields([{ name: "avatar", maxCount: 1 }]),

  // validateBody(updateGroupConversationSchema),
  updateGroup
);

conversationRouter.delete(
  "/deleteConversation",
  authenticate,
  validateBody(deleteConversationSchema),
  removeConversation
);
conversationRouter.post(
  "/sendMessage",
  authenticate,
  upload.fields([{ name: "messageImage", maxCount: 1 }]),

  // validateBody(sendMessageSchema),
  sendMessage
);

conversationRouter.put(
  "/updateMessage",
  authenticate,
  // validateBody(updateMessageSchema),
  upload.fields([{ name: "messageImage", maxCount: 1 }]),

  updateMessage
);

conversationRouter.delete(
  "/deleteMessage",
  authenticate,
  validateBody(deleteMessageSchema),
  deleteMessage
);
module.exports = conversationRouter;
