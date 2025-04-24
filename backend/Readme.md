# Chat Application Backend

A Node.js backend server for the real-time chat application, handling user authentication, messaging, and real-time communication via Socket.IO.

## 📋 Overview

This backend provides the necessary API endpoints and socket event handlers to power the real-time chat application. It manages user sessions, stores messages, and handles real-time communication between users.

Currently, this project uses a **monolithic backend** for simplicity and rapid development. The frontend follows a modular structure with React components organized for scalability. Future updates will refactor the backend into a modular structure for better maintainability.

## 🛠️ Technologies Used

- **Node.js**: JavaScript runtime environment
- **Express**: Web application framework
- **Socket.IO**: Real-time bidirectional event-based communication
- **MongoDB**: NoSQL database for data storage
- **Mongoose**: MongoDB object modeling
- **CORS**: Cross-Origin Resource Sharing middleware
- **Nanoid**: Unique ID generation for passwords

## 🔌 Socket.IO Implementation

The core of this backend is the Socket.IO implementation which handles real-time messaging.

### Socket Events

| Event Name          | Description                                           |
| ------------------- | ----------------------------------------------------- |
| `connection`        | Triggered when a new client connects                  |
| `setSocketId`       | Associates a user's Firebase UID with their Socket ID |
| `sendMessage`       | Handles message sending between users                 |
| `setCurrentSession` | Loads message history for a specific chat             |
| `searchOnlineUsers` | Gets the list of currently online users               |
| `disconnect`        | Handles user disconnection                            |

### Event Flow

1. **Connection**: User connects and gets a socket ID
2. **setSocketId**: Socket ID is associated with the user in the database
3. **setCurrentSession**: When opening a chat, message history is loaded
4. **sendMessage**: Messages are sent, saved to DB, and delivered to recipients
5. **searchOnlineUsers**: Online status is tracked and broadcasted
6. **disconnect**: User goes offline, socket ID is removed from DB

## 🗄️ Data Models

### User Model

```javascript
{
  uid: String,           // Firebase UID
  userName: String,      // Display name
  email: String,         // Email address
  password: String,      // Generated password
  socketId: String,      // Current socket ID (empty if offline)
  photoUrl: String       // Profile picture URL
}
```

### Message Model

```javascript
{
  sender: ObjectId,      // Reference to sender user
  receiver: ObjectId,    // Reference to receiver user
  content: String,       // Message content
  timeSent: Date,        // Timestamp
  isDelieverd: Boolean,  // Delivery status
  isSeen: Boolean        // Read status
}
```

## 🌐 API Endpoints

| Endpoint       | Method | Description              |
| -------------- | ------ | ------------------------ |
| `/`            | GET    | Test endpoint            |
| `/signUp`      | POST   | Register a new user      |
| `/signIn`      | GET    | Check if a user exists   |
| `/getAllUsers` | GET    | Get all registered users |

## 🚀 Setup & Installation

1. **Prerequisites**

   - Node.js (v14 or newer)
   - MongoDB (local or Atlas)

2. **Installation**

   ```bash
   # Clone the repository
   git clone <repo-url>

   # Navigate to project directory
   cd chat-app-backend

   # Install dependencies
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file with the following variables:

   ```
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/ChatOrbit
   CLIENT_URL=http://localhost:5173
   ```

4. **Running the Server**

   ```bash
   # Start the server
   npm start

   # For development with auto-restart
   npm run dev
   ```

## 📝 Code Structure

Currently, all code is in a single file (`index.js`), which includes:

- Server setup (Express, HTTP, Socket.IO)
- Database connection and models
- Socket event handlers
- HTTP API endpoints

## 🔮 Future Improvements

1. Implement a more structured approach with separate files for:

   - Models
   - Routes
   - Socket handlers
   - Controllers

2. Add authentication middleware
3. Implement better error handling
4. Add unit and integration tests
5. Include data validation
