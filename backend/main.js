// Express and dependencies
const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const cors = require("cors");
const { nanoid } = require("nanoid");
const { default: axios } = require("axios");
const { User } = require("lucide-react");
const { send } = require("vite");
const { SocketAddress } = require("net");

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
// Socket Connection Logic
// When a new client socket is connected, log the event
socket.on("connection", (clientSocket) => {
  console.log(
    "Client Socket Connected where ID: ",
    clientSocket.id,
    " and socket object is: ",
    clientSocket
  );

  // When the client requests to set the socketId in the database
  clientSocket.on("setSocketId", async ({ uid, socketId }) => {
    try {
      // Find the user in the database
      const userExist = await Users.findOne({ uid });

      // If the user exists, update the socketId in the database
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

  // When the client sends a message to the server
  clientSocket.on("sendMessage", async ({ sender, receiver, message }) => {
    // console.log(
    //   `Sender ${sender} Receiver ${receiver} message ${message}`
    // );

    try {
      // Find the receiver in the database
      const receiverExist = await Users.findOne({ uid: receiver });
      // Find the sender in the database
      const senderExist = await Users.findOne({ uid: sender });

      // If the receiver does not exist in the database, log an error
      if (!receiverExist) {
        console.log(`Receiver with uid ${receiver} not found in DB`);
        return;
      }

      console.log(
        `Sender ${senderExist} Receiver ${receiverExist} message ${message}`
      );

      // If the receiver is online, emit a message to the receiver's socket
      if (receiverExist.socketId !== "") {
        console.log(`Receiver ${receiver} exists and Online`);

        // Emit a message to the receiver's socket
        socket
          .to(receiverExist.socketId)
          .emit("receiverMessage", { message: message });

        // Save the message in the database
        const newMessage = new Messages({
          sender: senderExist._id,
          receiver: receiverExist._id,
          content: message,
        });
        await newMessage.save();
        console.log(
          `Message saved in DB for Receiver ${receiver} with message ${message}`
        );
      } else {
        console.log(`Receiver ${receiver} exists but Offline`);

        // Save the message as an offline message in the database
        const newOfflineMessage = new offlineMessages({
          sender: senderExist._id,
          receiver: receiverExist._id,
          content: message,
        });
        await newOfflineMessage.save();
        console.log(`Offline message saved for ${receiver}`);
      }
    } catch (err) {
      console.log(`Error while sending message: ${err.message}`);
    }
  });

  clientSocket.on("setCurrentSession", async ({ sender, receiver }) => {
    const senderExist = await Users.findOne({ uid: sender });
    const receiverExist = await Users.findOne({ uid: receiver });
    if (senderExist && receiverExist) {
      const messages = await Messages.find({
        sender: senderExist._id,
        receiver: receiverExist._id,
      })
        .populate("sender")
        .populate("receiver");
      console.log(`Message between ${sender} and ${receiver} is: `, messages);
      // Send to both users individually
      [senderExist.socketId, receiverExist.socketId].forEach((id) => {
        socket.to(id).emit("currentSessionMessages", { messages });
      });
    } else {
      console.log("Either Sender or Receiver Not Found in DB");
    }
  });

  // When the client disconnects, log the event
  clientSocket.on("disconnect", async () => {
    console.log("User disconnected:", clientSocket.id);

    // Delete the socketId from the database for the disconnected user
    await Users.updateOne(
      { socketId: clientSocket.id },
      { $set: { socketId: "" } }
    );
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

// app.put("/setSocketId", async (req, res) => {
//   try {
//     const { socketId, uid } = req.body;
//     const userExist = await Users.findOne({ uid });
//     if (userExist) {
//       userExist.socketId = String(socketId);
//       await userExist.save();
//       console.log(`User uid ${uid} is Updated In DB`);
//       return res.json({ message: "Success" });
//     } else {
//       return res.json({ message: "User Not Found" });
//     }
//   } catch (err) {
//     return res.json({ message: "error", error: err.message });
//   }
// });

// app.put("/removeSocketId", async (req, res) => {
//   try {
//     const { uid } = req.body;
//     const userExist = await Users.findOne({ uid });
//     if (userExist) {
//       userExist.socketId = "";
//       await userExist.save();
//       console.log(`User uid ${uid} is Deleted In DB`);
//       return res.json({ message: "Success" });
//     } else {
//       return res.json({ message: "User Not Found" });
//     }
//   } catch (err) {
//     return res.json({ message: "error", error: err.message });
//   }
// });

// app.post("/sendMessage", async (req, res) => {
//   const { sender, receiver, message } = req.body;

//   try {
//     console.log(`Sender ${sender} , Receiver ${receiver} , message ${message}`);
//     return res.json({ message: "Success" });
//   } catch (err) {
//     return res.json({ message: "error", error: err.message });
//   }
// });

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
