// Import necessary dependencies
const express = require("express"); // Express web framework
const http = require("http"); // HTTP server
const mongoose = require("mongoose"); // MongoDB ODM
const { Server } = require("socket.io"); // Socket.IO for real-time communication
const cors = require("cors"); // Cross-Origin Resource Sharing middleware
const { nanoid } = require("nanoid"); // Unique ID generator
const { default: axios } = require("axios"); // HTTP client for external API calls
// Unused imports that could be removed
const { User } = require("lucide-react"); // (Unused) React icon component
const { send } = require("vite"); // (Unused) Vite function
const { SocketAddress } = require("net"); // (Unused) Node.js net module
const { useTransition } = require("react"); // (Unused) React hook

// Array to track online users globally
const globalOnlineUsers = [];

// Initialize Express app
const app = express();
const httpServer = http.createServer(app); // Create HTTP server using Express app

// Initialize Socket.IO with CORS configuration for frontend access
const socket = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173", // Allow frontend origin (Vite default port)
    methods: ["GET", "POST"], // Allow specific HTTP methods
  },
});

// Middleware setup
app.use(express.json()); // Parse JSON request bodies
app.use(cors()); // Enable CORS for all routes

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/ChatOrbit")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB Error: ", err.message));

// ========== DATABASE SCHEMAS ==========

// User Schema - defines user data structure
const usersSchema = new mongoose.Schema({
  uid: { type: String, required: true }, // User ID (from Firebase)
  userName: { type: String, required: true }, // User's display name
  email: { type: String, required: true }, // User's email
  password: { type: String, required: true }, // Password (generated with nanoid)
  socketId: { type: String, default: "" }, // Current socket ID (empty if offline)
  photoUrl: { type: String }, // User's profile photo URL
});

// Message Schema - defines structure of chat messages
const messagesSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId, // Reference to sender user
    required: true,
    ref: "users",
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId, // Reference to receiver user
    required: true,
    ref: "users",
  },
  content: { type: String, required: true }, // Message text
  timeSent: { type: Date, default: Date.now }, // Timestamp
  isDelieverd: { type: Boolean, default: false }, // Delivery status
  isSeen: { type: Boolean, default: false }, // Read status
});

// Offline Message Schema - for messages sent when receiver is offline
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

// Create models from schemas
const Users = mongoose.model("users", usersSchema);
const Messages = mongoose.model("messages", messagesSchema);
const offlineMessages = mongoose.model(
  "offlineMessages",
  offlineMessagesSchema
);

// ========== SOCKET.IO LOGIC ==========

// Handle new socket connections
socket.on("connection", (clientSocket) => {
  console.log(
    "Client Socket Connected where ID: ",
    clientSocket.id,
    " and socket object is: ",
    clientSocket
  );

  // Event: Associate a socket ID with a user in the database
  clientSocket.on("setSocketId", async ({ uid, socketId }) => {
    try {
      // Find the user by Firebase UID
      const userExist = await Users.findOne({ uid });

      // If user exists, update their socketId (marks them as online)
      if (userExist) {
        userExist.socketId = String(socketId);
        await userExist.save();
        console.log(
          `User with uid ${uid} is Updated In DB with socketId ${socketId}`
        );
      } else {
        console.log(`User with uid ${uid} not found in DB`);
      }
    } catch (err) {
      console.log(`Error while setting socketId: ${err.message}`);
    }
  });

  // Event: Handle sending messages between users
  clientSocket.on("sendMessage", async ({ sender, receiver, message }) => {
    try {
      // Find both the sender and receiver users
      const receiverExist = await Users.findOne({ uid: receiver });
      const senderExist = await Users.findOne({ uid: sender });

      // If receiver doesn't exist, abort
      if (!receiverExist) {
        console.log(`Receiver with uid ${receiver} not found in DB`);
        return;
      }

      console.log(
        `Sender ${senderExist} Receiver ${receiverExist} message ${message}`
      );

      // If both users exist, create and save the message
      if (receiverExist && senderExist) {
        console.log(`Receiver ${receiver} exists and Online`);

        // Create a new message document
        const newMessage = new Messages({
          sender: senderExist._id,
          receiver: receiverExist._id,
          content: message,
        });
        await newMessage.save();

        // Send message to both sender and receiver sockets for real-time display
        socket
          .to(receiverExist.socketId)
          .to(senderExist.socketId)
          .emit("receiverMessage", { message: newMessage });

        console.log(
          `Message saved in DB for Receiver ${receiver} with message ${message}`
        );
      }
    } catch (err) {
      console.log(`Error while sending message: ${err.message}`);
    }
  });

  // Event: Set up current chat session and load message history
  clientSocket.on("setCurrentSession", async ({ sender, receiver }) => {
    try {
      // Find both users in database
      const senderExist = await Users.findOne({ uid: sender });
      const receiverExist = await Users.findOne({ uid: receiver });

      if (senderExist && receiverExist) {
        // Query for messages between these two users (in either direction)
        const messages = await Messages.find({
          $or: [
            { sender: senderExist._id, receiver: receiverExist._id },
            { sender: receiverExist._id, receiver: senderExist._id },
          ],
        });

        console.log(`Message between ${sender} and ${receiver} is: `, messages);

        // Send message history to both users' sockets
        [senderExist.socketId, receiverExist.socketId].forEach((id) => {
          socket.to(id).emit("currentSessionMessages", { messages });
        });
      } else {
        console.log("Either Sender or Receiver Not Found in DB");
      }
    } catch (error) {
      console.log(`Error in setCurrentSession: ${error.message}`);
    }
  });

  // Event: Get list of online users
  clientSocket.on("searchOnlineUsers", async () => {
    try {
      // Get all users from database
      const allUsers = await Users.find({});
      // Filter to only those with non-empty socketId (online users)
      const onlineUsers = allUsers.filter((user) => {
        return user.socketId !== "";
      });

      console.log("Online Users: ", onlineUsers);
      // Broadcast list of online users to all clients
      socket.emit("getOnlineUsers", { onlineUsers });
    } catch (error) {
      console.log(`Error in searchOnlineUsers: ${error.message}`);
    }
  });

  // Event: Handle user disconnection
  clientSocket.on("disconnect", async () => {
    console.log("User disconnected:", clientSocket.id);

    try {
      // Clear socketId in database when user disconnects (marks them as offline)
      await Users.updateOne(
        { socketId: clientSocket.id },
        { $set: { socketId: "" } }
      );
      console.log(`SocketID ${clientSocket.id} is deleted in DB.`);
    } catch (error) {
      console.log(`Error during disconnect: ${error.message}`);
    }
  });
});

// ========== HTTP ENDPOINTS ==========

// User signup route
app.post("/signUp", async (req, res) => {
  const { uid, email, userName, photoUrl } = req.body;
  try {
    // Check if user already exists
    const userExist = await Users.findOne({ uid });
    if (userExist) return res.json({ message: "User Exist" });

    // Create new user
    const user = new Users({
      uid,
      userName,
      email,
      password: nanoid(12), // Generate random password
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

// Commented out routes - not currently in use
/*
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

app.post("/sendMessage", async (req, res) => {
  const { sender, receiver, message } = req.body;

  try {
    console.log(`Sender ${sender} , Receiver ${receiver} , message ${message}`);
    return res.json({ message: "Success" });
  } catch (err) {
    return res.json({ message: "error", error: err.message });
  }
});
*/

// User sign-in route
app.get("/signIn", async (req, res) => {
  const uid = req.query.uid;
  try {
    // Check if user exists
    const userExist = await Users.findOne({ uid });
    res.json({ message: userExist ? "Success" : "Not Exist" });
  } catch (err) {
    res.json({ message: "error", err: err.message });
  }
});

// Get all users route
app.get("/getAllUsers", async (req, res) => {
  try {
    const allUsers = await Users.find({});
    res.json(allUsers);
  } catch (err) {
    console.log("Error in User Fetching: ", err.message);
  }
});

// Start the server
httpServer.listen(3000, () => console.log("SERVER LISTENING ON PORT 3000"));
