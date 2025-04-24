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
  const [message, setMessage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const auth = getAuth(app);
  const [activeChat, setActiveChat] = useState("67ffda38e4e5f6b7c5923aaa");
  const navigate = useNavigate();
  const { userDetails, setUserDetails } = useContext(myContext);
  const [AllUsers, setAllUsers] = useState([]);
  const [userSessionMessages, setUserSessionMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const SOCKET_URL = "http://localhost:3000";
  const socketRef = useRef(null); // declare socket reference

  // Get active user from AllUsers
  const activeUser = AllUsers.find((user) => user._id === activeChat);

  // Initial setup - auth state and socket connection
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/");
        return;
      }

      try {
        const response = await axios.get("http://localhost:3000/getAllUsers", {
          headers: { "Content-Type": "application/json" },
        });
        const finalData = response.data.filter((u) => u.uid !== user.uid);
        setAllUsers(finalData);

        setUserDetails({
          userName: user.displayName || user.email,
          photoUrl: user.photoURL || "user.png",
        });

        // Create socket connection - only once
        if (!socketRef.current) {
          socketRef.current = io(SOCKET_URL);
        }
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    });

    return () => {
      unsub();
    };
  }, []);

  // Setup socket event listeners - only when socket is created
  useEffect(() => {
    if (!socketRef.current || !auth.currentUser) return;

    // Socket connect handler
    const handleConnect = async () => {
      console.log("Socket Connected: ", socketRef.current.id);

      try {
        socketRef.current.emit("setSocketId", {
          uid: auth.currentUser.uid,
          socketId: socketRef.current.id,
        });

        socketRef.current.emit("searchOnlineUsers", "SignalToGetOnlineUsers");
      } catch (error) {
        console.error("Error Updating Socket ID:", error);
      }
    };

    // Message receiver handler
    const handleReceiveMessage = ({ message }) => {
      console.log("Message Received: ", message);
      setUserSessionMessages((prevMessages) => [...prevMessages, message]);
    };

    // Online users handler
    const handleOnlineUsers = ({ onlineUsers }) => {
      console.log("Online Users: ", onlineUsers);
      setOnlineUsers(onlineUsers);
    };

    // Register event handlers
    socketRef.current.on("connect", handleConnect);
    socketRef.current.on("receiverMessage", handleReceiveMessage);
    socketRef.current.on("getOnlineUsers", handleOnlineUsers);

    // Initial search for online users
    if (socketRef.current.connected) {
      socketRef.current.emit("searchOnlineUsers", "SignalToGetOnlineUsers");
    }

    // Cleanup function
    return () => {
      if (socketRef.current) {
        socketRef.current.off("connect", handleConnect);
        socketRef.current.off("receiverMessage", handleReceiveMessage);
        socketRef.current.off("getOnlineUsers", handleOnlineUsers);
      }
    };
  }, [socketRef.current]);

  // Handle active chat change - fetch messages for the current session
  // Handle active chat change - fetch messages for the current session
  useEffect(() => {
    if (!socketRef.current || !auth.currentUser || !activeUser) return;

    // Clear any previous listeners first
    socketRef.current.off("currentSessionMessages");

    // Set up session with server
    socketRef.current.emit("setCurrentSession", {
      sender: auth.currentUser.uid,
      receiver: activeUser.uid,
    });

    // Define handler function
    const handleMessages = ({ messages }) => {
      if (messages) {
        console.log("Current Session Messages: ", messages);
        // Only update if the messages are different
        setUserSessionMessages((prevMessages) => {
          // Check if the new messages array is different from current
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

    // Set up the listener
    socketRef.current.on("currentSessionMessages", handleMessages);

    // Fetch users information without setting up more event listeners
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

    // Clean up on unmount or when activeChat changes
    return () => {
      if (socketRef.current) {
        socketRef.current.off("currentSessionMessages", handleMessages);
      }
    };
  }, [activeChat]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (message.trim() === "" || !activeUser || !socketRef.current) {
      return;
    }

    socketRef.current.emit("sendMessage", {
      sender: auth.currentUser.uid,
      receiver: activeUser.uid,
      message: message,
    });

    setMessage("");
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = async () => {
    try {
      if (socketRef.current) {
        socketRef.current.disconnect();
        console.log("Socket Disconnected");
      }
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-indigo-900 to-purple-900 text-white overflow-hidden">
      {/* Sidebar - Mobile: absolute positioned overlay, Desktop: fixed width */}
      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-300 ease-in-out absolute md:relative z-20 md:z-auto w-full md:w-1/4 lg:w-1/5 h-full flex flex-col bg-indigo-900 bg-opacity-95 md:bg-opacity-50 backdrop-blur-md border-r border-indigo-800`}
      >
        {/* User profile */}
        <div className="p-4 flex items-center justify-between bg-indigo-800 bg-opacity-30">
          <div className="flex items-center">
            <div className="relative">
              <img
                src={userDetails.photoUrl}
                alt="Your avatar"
                className="w-10 h-10 rounded-full object-cover"
              />
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
            <button
              className="md:hidden p-2 rounded-full hover:bg-indigo-700 transition-colors"
              onClick={toggleSidebar}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Search */}
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

        {/* Chats list */}
        <div className="flex-1 overflow-y-auto">
          {AllUsers.map((user) => (
            <div
              key={user._id}
              className={`flex items-center p-4 cursor-pointer transition-colors hover:bg-indigo-800 hover:bg-opacity-30 ${
                activeChat === user._id ? "bg-indigo-800 bg-opacity-40" : ""
              }`}
              onClick={() => {
                setActiveChat(user._id);
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
                <div
                  className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-indigo-900 ${
                    user?.socketId !== "" ? "bg-green-500" : "bg-gray-400"
                  }`}
                ></div>
              </div>
              <div className="ml-3 flex-1">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">{user.userName}</h3>
                  <span className="text-xs text-indigo-300">12.45 PM</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-sm text-indigo-300 truncate w-36 md:w-28 lg:w-36">
                    {user.lastMessage || "No Recent Messages "}
                  </p>
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

      {/* Chat area */}
      <div className="flex-1 flex flex-col w-full">
        {/* Chat header */}
        <div className="p-4 border-b border-indigo-800 bg-indigo-800 bg-opacity-30 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center">
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

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto bg-gradient-to-br from-indigo-900 to-purple-900 bg-opacity-50">
          <div className="space-y-4">
            {userSessionMessages.map((chat) => (
              <div
                key={chat._id}
                className={`flex ${
                  chat.sender === activeChat ? "justify-start" : "justify-end"
                }`}
              >
                <div
                  className={`max-w-xs sm:max-w-sm md:max-w-md rounded-lg p-3 ${
                    chat.sender === activeChat
                      ? "bg-indigo-800 bg-opacity-60 rounded-tl-none"
                      : "bg-purple-600 rounded-tr-none"
                  }`}
                >
                  <p className="break-words">{chat.content}</p>
                  <p className="text-right text-xs mt-1 text-indigo-300">
                    6.00 PM
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Message input */}
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

      {/* Neon orbs effect */}
      <div className="orb-container fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="orb1 absolute w-64 h-64 bg-purple-500 rounded-full filter blur-3xl opacity-20 top-1/4 -left-32 animate-float-slow"></div>
        <div className="orb2 absolute w-96 h-96 bg-indigo-500 rounded-full filter blur-3xl opacity-20 bottom-1/4 -right-48 animate-float-medium"></div>
        <div className="orb3 absolute w-40 h-40 bg-pink-500 rounded-full filter blur-3xl opacity-10 top-3/4 left-1/2 animate-float-fast"></div>
      </div>

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
