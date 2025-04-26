# ChatOrbit ( Real-time Chat Application )

A feature-rich real-time chat application built with React, Socket.IO, Node.js, and Firebase authentication.

![Chat Application Screenshot](https://github.com/ndk123-web/ChatOrbit/blob/main/public/DemoDesign.png)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Socket.IO Implementation](#socketio-implementation)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Contributing](#contributing)

## 🔭 Overview

This project is a real-time chat application that demonstrates the power of Socket.IO for bidirectional communication between clients and servers. Users can authenticate with Firebase, message other users in real-time, and see online/offline status indicators.

The primary focus of this application is to showcase how Socket.IO integrates with a modern web development stack to create a seamless real-time communication experience.

Currently, this project uses a **monolithic backend** for simplicity and rapid development. The frontend follows a modular structure with React components organized for scalability. Future updates will refactor the backend into a modular structure for better maintainability.

## ✨ Features

- **Real-time Messaging**: Instant message delivery without page refreshes
- **User Authentication**: Secure login and registration with Firebase Auth
- **Online Status Indicators**: See which users are currently online
- **Responsive Design**: Works seamlessly across desktop and mobile devices
- **User Session Management**: Persistent sessions with automatic reconnection
- **Message History**: Access previous conversations upon login
- **Modern UI**: Clean and intuitive interface with Tailwind CSS

## 🛠️ Tech Stack

### Frontend

- **React**: Component-based UI library for building the interface
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Socket.IO Client**: Real-time bidirectional event-based communication
- **Axios**: Promise-based HTTP client for API requests
- **Lucide React**: Icon library for UI elements

### Backend

- **Node.js**: JavaScript runtime for server-side code
- **Express**: Web application framework for Node.js
- **Socket.IO**: Real-time event-based server-client communication
- **Mongoose**: MongoDB object modeling for Node.js
- **Cors**: Cross-Origin Resource Sharing middleware

### Database

- **MongoDB**: NoSQL database for storing users and messages

### Authentication

- **Firebase Authentication**: User authentication service

## 🔌 Socket.IO Implementation

The core focus of this application is the Socket.IO implementation, which enables real-time communication between users.

### Connection Setup

```javascript
// Server-side
io.on("connection", (socket) => {
  console.log("New client connected");

  // Handle events
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Client-side
const socket = io("http://localhost:3000");
```

### Key Socket Events

| Event Name               | Description                                           |
| ------------------------ | ----------------------------------------------------- |
| `setSocketId`            | Associates a user's Firebase UID with their Socket ID |
| `searchOnlineUsers`      | Requests a list of currently online users             |
| `setCurrentSession`      | Establishes a chat session between two users          |
| `sendMessage`            | Sends a message to a specific recipient               |
| `receiverMessage`        | Receives incoming messages from other users           |
| `currentSessionMessages` | Gets message history for current chat session         |
| `getOnlineUsers`         | Returns a list of online users                        |

### Real-time User Status

The application tracks user online status by:

1. Associating each user's Firebase UID with their Socket ID on connection
2. Maintaining a user-socket mapping in the MongoDB database
3. Broadcasting status changes to all connected clients
4. Updating the UI with visual indicators of online/offline status

### Message Flow

1. User A sends a message through the client interface
2. Client emits `sendMessage` event with sender, receiver, and message data
3. Server receives the event and:
   - Stores the message in MongoDB
   - Emits `receiverMessage` event to both sender and receiver
4. Both clients receive the message and update their UI in real-time

## 📁 Project Structure

```
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Chat.jsx       # Main chat component
│   │   │   └── NavBar.jsx
│   │   │   └── FeatureSection.jsx
│   │   │   └── HeroSection.jsx
│   │   │   └── Login.jsx
│   │   │   └── SignUp.jsx
│   │   │
│   │   ├── firebaseConfig/config.js
│   │   ├── sessionProvider/myContext.js
│   │   ├── routes/route.js
│   │   └── ...
│   └── package.json
│
├── backend/
│   ├── main.js
│   └── package.json
│
└── README.md
```

Unlike a typical production application with separated controllers, models, and routes, this project uses a monolithic structure for the backend with all functionality contained in a single `index.js` file.

## 🚀 Installation

### Prerequisites

- Node.js (v14 or newer)
- MongoDB
- Firebase account

### Setting up the Frontend

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Create .env file with Firebase config
touch .env
```

Configure `.env` with your Firebase credentials:

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Setting up the Backend

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# No .env file needed as configuration is hardcoded in index.js
```

## 🏃‍♂️ Running the Application

### Start the Backend Server

```bash
cd server
node index.js
```

### Start the Frontend Development Server

```bash
cd client
npm run dev  # Assuming Vite is used (port 5173)
```

The application should be available at `http://localhost:5173`.

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

# ChatOrbit - Real-Time Chat App

## Tech Stack
- Frontend: React.js (Vite)
- Backend: Node.js + Express.js + Socket.IO
- Database: MongoDB (Docker Container)
- Authentication: Firebase
- Docker & Docker Compose

---

## Prerequisites
- WSL (Ubuntu recommended)
- Docker installed (`docker --version`)
- Docker Compose installed (`docker-compose --version`)

---

## Project Structure
```
ChatOrbit/
|-- client/ (React frontend)
|-- server/ (Node.js backend)
|-- docker-compose.yml
|-- README.md
```

---

## Setup Instructions

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd ChatOrbit
```

### 2. Environment Setup

#### 2.1 Create .env for React (Frontend)
Inside `client/` folder:
```bash
touch .env
```

Add the following:
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```


### 3. Run Docker Compose
```bash
docker-compose up --build
```

It will:
- Build React app
- Build Node.js backend
- Start MongoDB container


---

## Access the App
- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend API: [http://localhost:3000](http://localhost:3000)


---

## Common Problems (Especially in WSL)

| Problem | Solution |
| :------ | :------- |
| Backend crashes | Go inside container, run `npm install`, restart container |
| node_modules missing | Adjust volume settings or rebuild with `--build` |
| MongoDB connection issues | Ensure `mongodb` service healthy in Docker |
| Ports busy | Kill old containers `docker ps` + `docker kill <container-id>` |


---

## Docker Commands Help
```bash
docker-compose down  # stop everything
docker-compose up --build  # build and start fresh
docker-compose logs -f  # see logs live
docker exec -it <container-id> bash  # enter inside container
```


---

## Services Overview

| Service  | Role  | Port |
| :------ | :--- | :--- |
| frontend | React frontend | 5173 |
| backend  | Node.js server + Socket.IO | 3000 |
| mongodb  | Database | 27017 |


---

# Notes:
- Always check `.env` files before starting.
- Frontend talks to backend via `http://localhost:3000`.
- Socket.IO real-time connection also via backend server.
- MongoDB runs in Docker internal network.


---

# Final Summary
- Ek hi command: `docker-compose up --build`
- localhost:5173 open karo browser me.
- Chat fully real-time chalega.

---

# Made with ❤️ - ChatOrbit Team

