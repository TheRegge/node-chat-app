/**
 * ------------------------------------------------
 *
 * NODE CHAT SERVER (Back end)
 * Sets up an Express node server
 * for socketio connections
 *
 * ------------------------------------------------
 */
const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const Filters = require("bad-words");

const {
  generateMessage,
  generateLocationMessage
} = require("./utils/messages");
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
} = require("./utils/users");

// ------------------------------------------------
// Server setup
// ------------------------------------------------
const app = express();
const server = http.createServer(app);
const io = socketio(server);
const port = process.env.PORT || 3000;

// Express config paths
const publicDirectoryPath = path.join(__dirname, "../public");

// Setup static directory to serve
app.use(express.static(publicDirectoryPath));

// ------------------------------------------------
//
// Client socket event listeners
//
// ------------------------------------------------

// New client connection listener
io.on("connection", socket => {
  console.log("New webSocket connection");

  // Listen to user joinning the chat
  socket.on("join", (options, callback) => {
    const { error, user } = addUser({ id: socket.id, ...options });

    if (error) {
      return callback(error);
    }

    socket.join(user.room);
    socket.emit("message", generateMessage("Admin", "Welcome!"));
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        generateMessage("Admin", `${user.username} has joined!`)
      );
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room)
    });

    callback();
  });

  // Listen to client messages
  socket.on("sendMessage", (message, callback) => {
    const filter = new Filters();
    const user = getUser(socket.id);

    if (filter.isProfane(message)) {
      return callback("Profanity is not allowed");
    }
    io.to(user.room).emit("message", generateMessage(user.username, message));
    callback();
  });

  // Listent to client sending location
  socket.on("sendLocation", (coords, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit(
      "locationMessage",
      generateLocationMessage(user.username, coords)
    );
    callback();
  });

  // Listen to client disconnecting
  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessage("Admin", `${user.username} has left.`)
      );
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room)
      });
    }
  });
});

// ------------------------------------------------
// Start server
// ------------------------------------------------
server.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
