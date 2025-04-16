const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const { type } = require("os");
const { ref } = require("process");
const { Server } = require("socket.io");
const cors = require("cors");
const { nanoid } = require("nanoid");

// Create an express app
const app = express();

// Create an http server instance
const httpServer = http.createServer(app);

// Create a new instance of the Server class
const socket = new Server(httpServer);

// Add middleware to parse JSON bodies
app.use(express.json());

// Allow CORS
app.use(cors());

// Connect to the MongoDB database
mongoose
  .connect("mongodb://localhost:27017/ChatOrbit")
  .then(() => console.log("Successfully MongoDB Connected"))
  .catch((err) => console.log("Error in MongoDB: ", err.message));

// Create a schema for the users collection
const usersSchema = new mongoose.Schema({
  // The unique identifier for the user
  uid: { type: String, required: true },
  // The user's name
  userName: { type: String, required: true },
  // The user's email address
  email: { type: String, required: true },
  // The user's password
  password: { type: String, required: true },
  // The user's socket id
  socketId: { type: String, default: "" },
  // The user's photo URL
  photoUrl: { type: String },
});

// Create a schema for the messages collection
const messagesSchema = new mongoose.Schema({
  // The user who sent the message
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    // The type of the sender is a reference to the users collection
    ref: "users",
  },
  // The user who received the message
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    // The type of the receiver is a reference to the users collection
    ref: "users",
  },
  // The content of the message
  content: { type: String, required: true },
  // The time the message was sent
  timeSent: { type: Date, required: true, default: Date.now },
  // Whether or not the message was delivered
  isDelieverd: { type: Boolean, required: true, default: false },
  // Whether or not the message was seen
  isSeen: { type: Boolean, required: true, default: false },
});

// Create a schema for the offline messages collection
const offlineMessagesSchema = new mongoose.Schema({
  // The user who sent the message
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    // The type of the sender is a reference to the users collection
    ref: "users",
  },
  // The user who received the message
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    // The type of the receiver is a reference to the users collection
    ref: "users",
  },
  // The content of the message
  content: { type: String, required: true },
  // The time the message was sent
  timeSent: { type: Date, required: true, default: Date.now },
});

// Create a model for the users collection
const Users = new mongoose.model("users", usersSchema);
// Create a model for the messages collection
const Messages = new mongoose.model("messages", messagesSchema);
// Create a model for the offline messages collection
const offlineMessages = new mongoose.model(
  "offlineMessages",
  offlineMessagesSchema
);

// Create an endpoint to sign up a user
app.post("/signUp", async (req, res) => {
  const { uid, email, userName, photoUrl } = req.body;

  try {
    // Create a new user
    const user = new Users({
      uid: uid,
      userName: userName,
      email: email,
      password: nanoid(12),
      photoUrl: photoUrl || "",
    });

    // Save the user to the database
    await user.save();
    // Return a success message
    res.json({ message: "Success" });
  } catch (err) {
    // Return an error message
    res.json({ message: "error", error: err.message });
  }
});

// Create an endpoint to test the server
app.get("/", (req, res) => {
  res.send("Hello This is Backend");
});

app.get("/signIn", async (req, res) => {
  const uid = req.query.uid;
  try {
    const userExist = await Users.findOne({ uid: uid });
    if (userExist) {
      return res.json({ message: "Success" });
    } else {
      return res.json({ message: "Not Exist" });
    }
  } catch (err) {
    return res.json({ message: "error", err: err.message });
  }
});

app.get("/getAllUsers", async (req, res) => {
  try {
    const allUsers = await Users.find({});
    return res.json(allUsers);
  } catch (err) {
    console.log("Error in User Fetching: ", err.message);
  }
});

// Listen for connections on port 3000
httpServer.listen(3000, () => {
  console.log("SERVER LISTENING ON PORT 3000");
});
