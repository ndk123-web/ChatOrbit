# ChatOrbit - Real-time Chat Application

A feature-rich real-time chat application built with React, Socket.IO, Node.js, and Firebase authentication.

![Chat Application Screenshot](https://github.com/ndk123-web/ChatOrbit/blob/main/public/DemoDesign.png)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Socket.IO Implementation](#socketio-implementation)
- [Project Structure](#project-structure)
- [Installation](#installation)
  - [Prerequisites](#prerequisites)
  - [Environment Setup](#environment-setup)
  - [Setup with Docker](#setup-with-docker)
  - [Manual Setup](#manual-setup)
- [Running the Application](#running-the-application)
- [Common Issues & Troubleshooting](#common-issues--troubleshooting)
- [Contributing](#contributing)

## 🔭 Overview

ChatOrbit is a real-time chat application that demonstrates the power of Socket.IO for bidirectional communication between clients and servers. Users can authenticate with Firebase, message other users in real-time, and see online/offline status indicators.

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

### Deployment

- **Docker & Docker Compose**: Containerization and orchestration

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
ChatOrbit/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Chat.jsx       # Main chat component
│   │   │   ├── NavBar.jsx
│   │   │   ├── FeatureSection.jsx
│   │   │   ├── HeroSection.jsx
│   │   │   ├── Login.jsx
│   │   │   └── SignUp.jsx
│   │   │
│   │   ├── firebaseConfig/config.js
│   │   ├── sessionProvider/myContext.js
│   │   ├── routes/route.js
│   │   └── ...
│   └── package.json
│   └── dockerfile
│   └── docker-compose.yml
│
├── backend/
│   ├── main.js
│   └── package.json
│   └── dockerfile
│
├── docker-compose.yml
└── README.md
```

Unlike a typical production application with separated controllers, models, and routes, this project uses a monolithic structure for the backend with all functionality contained in a single file.

## 🚀 Installation

### Prerequisites

- Node.js (v14 or newer)
- MongoDB
- Firebase account
- For Docker setup: Docker and Docker Compose
- For WSL users: Ubuntu recommended

### Environment Setup

#### Frontend Environment (.env)

Create a `.env` file in the `client/` directory:

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Setup with Docker

The easiest way to get started is using Docker Compose:

```bash
# Clone the repository
git clone <repository-url>
cd ChatOrbit

# Set up environment variables (as described above)

# Build and start the containers
docker-compose up --build
```

### Manual Setup

#### Frontend Setup

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install
```

#### Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install
```

## 🏃‍♂️ Running the Application

### With Docker

```bash
docker-compose up
```

### Without Docker

#### Start the Backend Server

```bash
cd server
node main.js
```

#### Start the Frontend Development Server

```bash
cd client
npm run dev  # Vite development server (port 5173)
```

### Access the Application

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend API: [http://localhost:3000](http://localhost:3000)

## Common Issues & Troubleshooting

| Problem                   | Solution                                                            |
| :------------------------ | :------------------------------------------------------------------ |
| Backend crashes           | Go inside container, run `npm install`, restart container           |
| node_modules missing      | Adjust volume settings or rebuild with `--build`                    |
| MongoDB connection issues | Ensure `mongodb` service is healthy in Docker                       |
| Ports busy                | Kill old containers with `docker ps` + `docker kill <container-id>` |

### Useful Docker Commands

```bash
docker-compose down  # stop everything
docker-compose up --build  # build and start fresh
docker-compose logs -f  # see logs live
docker exec -it <container-id> bash  # enter inside container
```

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

Made with ❤️ by the Me
