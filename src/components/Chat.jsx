import React, { useEffect, useState, useContext, useRef } from "react";
import {
  Send,
  Search,
  MoreVertical,
  Phone,
  Video,
  Users,
  Menu,
  X,
  ArrowLeft,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router";
import { onAuthStateChanged, getAuth, signOut } from "firebase/auth";
import { app } from "../firebaseConfig/config";
import { myContext } from "../sessionProvider/myContext";
import axios from "axios";
import io from "socket.io-client";

const Chat = () => {
  // STATE MANAGEMENT
  // ------------------------------
  const [message, setMessage] = useState(""); // Stores the current message being typed
  const [sidebarOpen, setSidebarOpen] = useState(true); // Controls sidebar visibility on mobile
  const auth = getAuth(app); // Firebase authentication instance
  const [activeChat, setActiveChat] = useState("67ffda38e4e5f6b7c5923aaa"); // Currently selected chat (MongoDB ID)
  const navigate = useNavigate(); // React Router navigation hook
  const { userDetails, setUserDetails } = useContext(myContext); // User context for global user state
  const [AllUsers, setAllUsers] = useState([]); // List of all available chat users
  const [userSessionMessages, setUserSessionMessages] = useState([]); // Messages for current chat session
  const [onlineUsers, setOnlineUsers] = useState([]); // Tracks which users are currently online
  const SOCKET_URL = "http://localhost:3000"; // Socket.io server URL
  const socketRef = useRef(null); // Persistent reference to socket connection

  // Find the currently active user object from AllUsers array
  const activeUser = AllUsers.find((user) => user._id === activeChat);

  // INITIAL SETUP EFFECT
  // ------------------------------
  // Handles authentication state and initial data loading
  useEffect(() => {
    // Set up Firebase auth state listener
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // If not logged in, redirect to login page
        navigate("/");
        return;
      }

      try {
        // Fetch all users from the backend
        const response = await axios.get("http://localhost:3000/getAllUsers", {
          headers: { "Content-Type": "application/json" },
        });
        // Filter out the current user from the users list
        const finalData = response.data.filter((u) => u.uid !== user.uid);
        setAllUsers(finalData);

        // Update global user context with current user info
        setUserDetails({
          userName: user.displayName || user.email,
          photoUrl: user.photoURL || "user.png",
        });

        // Initialize socket connection - only if not already connected
        if (!socketRef.current) {
          socketRef.current = io(SOCKET_URL);
        }
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    });

    // Cleanup function to unsubscribe from auth state changes when component unmounts
    return () => {
      unsub();
    };
  }, []); // Empty dependency array means this runs once on component mount

  // SOCKET EVENT HANDLERS SETUP
  // ------------------------------
  // Sets up all socket event listeners when socket is created
  useEffect(() => {
    // Skip if socket isn't initialized or user isn't logged in
    if (!socketRef.current || !auth.currentUser) return;

    // Handler for successful socket connection
    const handleConnect = async () => {
      console.log("Socket Connected: ", socketRef.current.id);

      try {
        // Associate the socket ID with the user in the backend
        socketRef.current.emit("setSocketId", {
          uid: auth.currentUser.uid,
          socketId: socketRef.current.id,
        });

        // Request the list of currently online users
        socketRef.current.emit("searchOnlineUsers", "SignalToGetOnlineUsers");
      } catch (error) {
        console.error("Error Updating Socket ID:", error);
      }
    };

    // Handler for receiving new messages
    const handleReceiveMessage = ({ message }) => {
      console.log("Message Received: ", message);
      // Add the new message to the messages state
      setUserSessionMessages((prevMessages) => [...prevMessages, message]);
    };

    // Handler for receiving list of online users
    const handleOnlineUsers = ({ onlineUsers }) => {
      console.log("Online Users: ", onlineUsers);
      setOnlineUsers(onlineUsers);
    };

    // Register all event handlers with socket.io
    socketRef.current.on("connect", handleConnect);
    socketRef.current.on("receiverMessage", handleReceiveMessage);
    socketRef.current.on("getOnlineUsers", handleOnlineUsers);

    // If socket is already connected, immediately request online users
    if (socketRef.current.connected) {
      socketRef.current.emit("searchOnlineUsers", "SignalToGetOnlineUsers");
    }

    // Cleanup function to remove event listeners when component unmounts or dependencies change
    return () => {
      if (socketRef.current) {
        socketRef.current.off("connect", handleConnect);
        socketRef.current.off("receiverMessage", handleReceiveMessage);
        socketRef.current.off("getOnlineUsers", handleOnlineUsers);
      }
    };
  }, [socketRef.current]); // Only re-run when socket reference changes

  // ACTIVE CHAT CHANGE HANDLER
  // ------------------------------
  // Handles fetching messages when user switches to a different chat
  useEffect(() => {
    // Skip if socket isn't initialized, user isn't logged in, or no active user is selected
    if (!socketRef.current || !auth.currentUser || !activeUser) return;

    // Remove any existing message listeners to prevent duplicates
    socketRef.current.off("currentSessionMessages");

    // Tell the server which chat session we're now in
    socketRef.current.emit("setCurrentSession", {
      sender: auth.currentUser.uid,
      receiver: activeUser.uid,
    });

    // Handler for receiving messages for the current chat session
    const handleMessages = ({ messages }) => {
      if (messages) {
        console.log("Current Session Messages: ", messages);
        // Only update state if messages actually changed
        setUserSessionMessages((prevMessages) => {
          if (
            prevMessages.length !== messages.length ||
            JSON.stringify(prevMessages) !== JSON.stringify(messages)
          ) {
            return messages;
          }
          return prevMessages;
        });
      } else {
        console.log("No Messages Found for Current Session");
      }
    };

    // Set up listener for current session messages
    socketRef.current.on("currentSessionMessages", handleMessages);

    // Refresh users list to get latest data
    const fetchUsersAgain = async () => {
      try {
        const response = await axios.get("http://localhost:3000/getAllUsers", {
          headers: { "Content-Type": "application/json" },
        });
        const finalUsers = response.data.filter(
          (user) => user.uid !== auth.currentUser.uid
        );
        setAllUsers(finalUsers);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };
    fetchUsersAgain();

    // Cleanup function to remove event listeners when component unmounts or active chat changes
    return () => {
      if (socketRef.current) {
        socketRef.current.off("currentSessionMessages", handleMessages);
      }
    };
  }, [activeChat]); // Re-run when active chat changes

  // EVENT HANDLERS
  // ------------------------------
  // Handle sending a new message
  const handleSendMessage = async (e) => {
    e.preventDefault(); // Prevent form submission default behavior

    // Don't send if message is empty, no active user is selected, or socket isn't connected
    if (message.trim() === "" || !activeUser || !socketRef.current) {
      return;
    }

    // Emit the message to the server
    socketRef.current.emit("sendMessage", {
      sender: auth.currentUser.uid,
      receiver: activeUser.uid,
      message: message,
    });

    // Clear the message input
    setMessage("");
  };

  // Toggle sidebar visibility (for mobile view)
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Handle user logout
  const handleLogout = async () => {
    try {
      // Disconnect socket before logging out
      if (socketRef.current) {
        socketRef.current.disconnect();
        console.log("Socket Disconnected");
      }
      // Sign out from Firebase
      await signOut(auth);
      // Redirect to login page
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // UI RENDERING
  // ------------------------------
  return (
    <div className="flex h-screen bg-gradient-to-br from-indigo-900 to-purple-900 text-white overflow-hidden">
      {/* Sidebar with user list - responsive behavior based on sidebarOpen state */}
      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-300 ease-in-out absolute md:relative z-20 md:z-auto w-full md:w-1/4 lg:w-1/5 h-full flex flex-col bg-indigo-900 bg-opacity-95 md:bg-opacity-50 backdrop-blur-md border-r border-indigo-800`}
      >
        {/* Current user profile section */}
        <div className="p-4 flex items-center justify-between bg-indigo-800 bg-opacity-30">
          <div className="flex items-center">
            <div className="relative">
              <img
                src={userDetails.photoUrl}
                alt="Your avatar"
                className="w-10 h-10 rounded-full object-cover"
              />
              {/* Online status indicator */}
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-indigo-900"></div>
            </div>
            <span className="ml-3 font-medium">{userDetails.userName}</span>
          </div>
          <div className="flex gap-2">
            <button
              className="p-2 rounded-full hover:bg-indigo-700 transition-colors text-indigo-300 hover:text-white"
              onClick={handleLogout}
              title="Logout"
            >
              <LogOut size={18} />
            </button>
            <button className="p-2 rounded-full hover:bg-indigo-700 transition-colors">
              <Users size={18} />
            </button>
            {/* Close sidebar button - only visible on mobile */}
            <button
              className="md:hidden p-2 rounded-full hover:bg-indigo-700 transition-colors"
              onClick={toggleSidebar}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Search bar */}
        <div className="p-4 border-b border-indigo-800">
          <div className="relative">
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full bg-indigo-800 bg-opacity-30 p-2 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <Search
              className="absolute left-3 top-2.5 text-indigo-300"
              size={18}
            />
          </div>
        </div>

        {/* Users list - scrollable */}
        <div className="flex-1 overflow-y-auto">
          {AllUsers.map((user) => (
            <div
              key={user._id}
              className={`flex items-center p-4 cursor-pointer transition-colors hover:bg-indigo-800 hover:bg-opacity-30 ${
                activeChat === user._id ? "bg-indigo-800 bg-opacity-40" : ""
              }`}
              onClick={() => {
                setActiveChat(user._id);
                // Close sidebar automatically on mobile when selecting a chat
                if (window.innerWidth < 768) {
                  setSidebarOpen(false);
                }
              }}
            >
              <div className="relative">
                <img
                  src={user.photoUrl || "user.png"}
                  alt={user.userName}
                  className="w-12 h-12 rounded-full object-cover"
                />
                {/* Online status indicator - green if online, gray if offline */}
                <div
                  className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-indigo-900 ${
                    user?.socketId !== "" ? "bg-green-500" : "bg-gray-400"
                  }`}
                ></div>
              </div>
              <div className="ml-3 flex-1">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">{user.userName}</h3>
                  {/* Time indicator - commented out in original code */}
                  {/* <span className="text-xs text-indigo-300">12.45 PM</span> */}
                </div>
                <div className="flex justify-between items-center mt-1">
                  {/* Last message preview - commented out in original code */}
                  {/* <p className="text-sm text-indigo-300 truncate w-36 md:w-28 lg:w-36">
                    {user.lastMessage || "No Recent Messages "}
                  </p> */}

                  {/* Unread message counter */}
                  {user.unread > 0 && (
                    <span className="bg-purple-500 text-white rounded-full text-xs px-2 py-0.5">
                      {user.unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col w-full">
        {/* Chat header with active user info */}
        <div className="p-4 border-b border-indigo-800 bg-indigo-800 bg-opacity-30 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center">
            {/* Menu button to open sidebar on mobile */}
            <button
              className="mr-2 md:hidden p-2 rounded-full hover:bg-indigo-700 transition-colors"
              onClick={toggleSidebar}
            >
              <Menu size={18} />
            </button>
            <div className="relative">
              <img
                src={activeUser?.photoUrl || "user.png"}
                alt={activeUser?.userName}
                className="w-10 h-10 rounded-full object-cover"
              />
              {/* Online status indicator for active user */}
              <div
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-indigo-900 ${
                  activeUser?.socketId !== "" ? "bg-green-500" : "bg-gray-400"
                }`}
              ></div>
            </div>
            <div className="ml-3">
              <h3 className="font-medium">{activeUser?.userName}</h3>
              <p className="text-xs text-indigo-300">
                {activeUser?.socketId !== "" ? "Online" : "Offline"}
              </p>
            </div>
          </div>
          {/* Action buttons in chat header */}
          <div className="flex gap-2 md:gap-4">
            <button
              onClick={handleLogout}
              className="p-2 rounded-full hover:bg-indigo-700 transition-colors text-indigo-300 hover:text-white sm:hidden"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
            <button className="p-2 rounded-full hover:bg-indigo-700 transition-colors hidden sm:block">
              <Phone size={18} />
            </button>
            <button className="p-2 rounded-full hover:bg-indigo-700 transition-colors hidden sm:block">
              <Video size={18} />
            </button>
            <button className="p-2 rounded-full hover:bg-indigo-700 transition-colors">
              <MoreVertical size={18} />
            </button>
          </div>
        </div>

        {/* Messages container - scrollable */}
        <div className="flex-1 p-4 overflow-y-auto bg-gradient-to-br from-indigo-900 to-purple-900 bg-opacity-50">
          <div className="space-y-4">
            {userSessionMessages.map((chat) => (
              <div
                key={chat._id}
                className={`flex ${
                  chat.sender === activeChat ? "justify-start" : "justify-end"
                }`}
              >
                {/* Message bubble with different styling for sent vs received */}
                <div
                  className={`max-w-xs sm:max-w-sm md:max-w-md rounded-lg p-3 ${
                    chat.sender === activeChat
                      ? "bg-indigo-800 bg-opacity-60 rounded-tl-none" // Received messages styling
                      : "bg-purple-600 rounded-tr-none" // Sent messages styling
                  }`}
                >
                  <p className="break-words">{chat.content}</p>
                  {/* Time indicator - commented out in original code */}
                  {/* <p className="text-right text-xs mt-1 text-indigo-300">
                    6.00 PM
                  </p> */}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Message input form */}
        <form
          onSubmit={handleSendMessage}
          className="p-4 border-t border-indigo-800 bg-indigo-900 bg-opacity-30 backdrop-blur-md"
        >
          <div className="flex items-center">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-indigo-800 bg-opacity-50 rounded-l-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-3 rounded-r-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all hover:scale-105"
            >
              <Send size={20} />
            </button>
          </div>
        </form>
      </div>

      {/* Decorative background effects */}
      <div className="orb-container fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="orb1 absolute w-64 h-64 bg-purple-500 rounded-full filter blur-3xl opacity-20 top-1/4 -left-32 animate-float-slow"></div>
        <div className="orb2 absolute w-96 h-96 bg-indigo-500 rounded-full filter blur-3xl opacity-20 bottom-1/4 -right-48 animate-float-medium"></div>
        <div className="orb3 absolute w-40 h-40 bg-pink-500 rounded-full filter blur-3xl opacity-10 top-3/4 left-1/2 animate-float-fast"></div>
      </div>

      {/* CSS animations for the floating orbs */}
      <style jsx>{`
        @keyframes float-slow {
          0%,
          100% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(-20px) translateX(20px);
          }
        }
        @keyframes float-medium {
          0%,
          100% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(30px) translateX(-30px);
          }
        }
        @keyframes float-fast {
          0%,
          100% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(-15px) translateX(15px);
          }
        }
        .animate-float-slow {
          animation: float-slow 15s ease-in-out infinite;
        }
        .animate-float-medium {
          animation: float-medium 12s ease-in-out infinite;
        }
        .animate-float-fast {
          animation: float-fast 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Chat;
