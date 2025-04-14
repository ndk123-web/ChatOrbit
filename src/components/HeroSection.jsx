import React from "react";
import { Link } from "react-router";
import { useContext } from "react";
import { myContext } from "../sessionProvider/myContext";

const HeroSection = () => {
  const {
    isLoggedIn,
    setIsLoggedIn,
    appear,
    setAppear,
    features,
    setFeatures,
  } = useContext(myContext);
  return (
    <>
      <div className="flex-1 flex flex-col md:flex-row items-center justify-center px-8 relative z-10">
        <div
          className={`md:w-1/2 text-center md:text-left transform transition-all duration-700 ${
            appear ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
          }`}
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
            Connect with the{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-300">
              Universe
            </span>
          </h1>
          <p className="text-xl text-indigo-200 mb-8 max-w-lg">
            ChatOrbit brings your conversations to life in a beautiful,
            intuitive interface. Chat with friends, family, and colleagues from
            anywhere in the world.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              to="/signup"
              className="w-full sm:w-auto py-3 px-8 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700
                         text-white font-medium rounded-xl transition-all duration-300 transform hover:scale-[1.02] text-center"
            >
              Get Started
            </Link>
            <Link
              to="/about"
              className="w-full sm:w-auto py-3 px-8 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl 
                         transition-all duration-300 border border-white/20 text-center"
            >
              Learn More
            </Link>
          </div>
        </div>
        <div
          className={`md:w-1/2 mt-12 md:mt-0 transform transition-all duration-1000 delay-300 ${
            appear ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
          }`}
        >
          <div className="bg-white/10 backdrop-blur-lg p-4 rounded-2xl shadow-2xl border border-white/20 max-w-md mx-auto">
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center mr-2">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                </div>
                <span className="text-lg font-bold text-white">ChatOrbit</span>
              </div>
              <div className="flex items-center text-indigo-200 text-sm">
                <span>Online</span>
                <div className="ml-2 w-2 h-2 bg-green-400 rounded-full"></div>
              </div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 max-h-80 overflow-y-auto">
              <div className="flex flex-col space-y-3">
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
                    A
                  </div>
                  <div className="ml-2 bg-white/10 rounded-lg rounded-tl-none p-3 text-indigo-100">
                    Hey there! Welcome to ChatOrbit. How are you today?
                  </div>
                </div>
                <div className="flex items-start justify-end">
                  <div className="mr-2 bg-indigo-600/70 rounded-lg rounded-tr-none p-3 text-white">
                    I'm great! Just checking out this new chat app.
                  </div>
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-400 flex items-center justify-center text-white font-bold">
                    U
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
                    A
                  </div>
                  <div className="ml-2 bg-white/10 rounded-lg rounded-tl-none p-3 text-indigo-100">
                    Awesome! ChatOrbit has real-time messaging, file sharing,
                    and works on any device.
                  </div>
                </div>
                <div className="flex items-start justify-end">
                  <div className="mr-2 bg-indigo-600/70 rounded-lg rounded-tr-none p-3 text-white">
                    That sounds perfect for what I need!
                  </div>
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-400 flex items-center justify-center text-white font-bold">
                    U
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 relative">
              <input
                type="text"
                placeholder="Type a message..."
                className="w-full p-3 pl-4 bg-white/5 border border-indigo-300/30 rounded-xl 
                           focus:outline-none focus:ring-2 focus:ring-indigo-400 
                           text-white placeholder-indigo-200/70"
                readOnly
              />
              <button className="absolute right-3 top-3 text-indigo-300 hover:text-white transition-colors">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HeroSection;
