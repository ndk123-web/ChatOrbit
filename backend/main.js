// Express and dependencies
const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const cors = require("cors");
const { nanoid } = require("nanoid");
const { default: axios } = require("axios");
const { User } = require("lucide-react");

const app = express();
const httpServer = http.createServer(app);

// here cors is important
const socket = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

app.use(express.json());
app.use(cors());

// MongoDB connection
mongoose
  .connect("mongodb://localhost:27017/ChatOrbit")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB Error: ", err.message));

// User schema
const usersSchema = new mongoose.Schema({
  uid: { type: String, required: true },
  userName: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  socketId: { type: String, default: "" },
  photoUrl: { type: String },
});

// Message schema
const messagesSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "users",
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "users",
  },
  content: { type: String, required: true },
  timeSent: { type: Date, default: Date.now },
  isDelieverd: { type: Boolean, default: false },
  isSeen: { type: Boolean, default: false },
});

// Offline message schema
const offlineMessagesSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "users",
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "users",
  },
  content: { type: String, required: true },
  timeSent: { type: Date, default: Date.now },
});

// Models
const Users = mongoose.model("users", usersSchema);
const Messages = mongoose.model("messages", messagesSchema);
const offlineMessages = mongoose.model(
  "offlineMessages",
  offlineMessagesSchema
);

// Socket Logic
socket.on("connection", (clientSocket) => {
  console.log("Client Socket Connected where ID: ", clientSocket.id);

  // This is for when Browser tab or Browser windoe closed by user
  clientSocket.on("disconnect", async () => {
    console.log("User disconnected:", clientSocket.id);
    // database me socketId ko null kar
    await Users.updateOne({ socketId: clientSocket.id }, { $set: { socketId: "" } });
    console.log(`SocketID ${clientSocket.id} is deleted in DB.`);
  });
});

// User signup
app.post("/signUp", async (req, res) => {
  const { uid, email, userName, photoUrl } = req.body;
  try {
    const userExist = await Users.findOne({ uid });
    if (userExist) return res.json({ message: "User Exist" });

    const user = new Users({
      uid,
      userName,
      email,
      password: nanoid(12),
      photoUrl: photoUrl || "",
    });
    await user.save();
    res.json({ message: "Success" });
  } catch (err) {
    res.json({ message: "error", error: err.message });
  }
});

// Test endpoint
app.get("/", (req, res) => res.send("Hello This is Backend"));

app.put("/setSocketId", async (req, res) => {
  try {
    const { socketId, uid } = req.body;
    const userExist = await Users.findOne({ uid });
    if (userExist) {
      userExist.socketId = String(socketId);
      await userExist.save();
      console.log(`User uid ${uid} is Updated In DB`);
      return res.json({ message: "Success" });
    } else {
      return res.json({ message: "User Not Found" });
    }
  } catch (err) {
    return res.json({ message: "error", error: err.message });
  }
});

app.put("/removeSocketId", async (req, res) => {
  try {
    const { uid } = req.body;
    const userExist = await Users.findOne({ uid });
    if (userExist) {
      userExist.socketId = "";
      await userExist.save();
      console.log(`User uid ${uid} is Deleted In DB`);
      return res.json({ message: "Success" });
    } else {
      return res.json({ message: "User Not Found" });
    }
  } catch (err) {
    return res.json({ message: "error", error: err.message });
  }
});

// User sign-in
app.get("/signIn", async (req, res) => {
  const uid = req.query.uid;
  try {
    const userExist = await Users.findOne({ uid });
    res.json({ message: userExist ? "Success" : "Not Exist" });
  } catch (err) {
    res.json({ message: "error", err: err.message });
  }
});

// Get all users
app.get("/getAllUsers", async (req, res) => {
  try {
    const allUsers = await Users.find({});
    res.json(allUsers);
  } catch (err) {
    console.log("Error in User Fetching: ", err.message);
  }
});

// Start server
httpServer.listen(3000, () => console.log("SERVER LISTENING ON PORT 3000"));
