const http = require("http");
const { Server } = require("socket.io");
const express = require("express");

const { corsConfig } = require("./config.js");

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: corsConfig,
});

module.exports = { app, io, server };
