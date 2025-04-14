import React from "react";
import { Link } from "react-router-dom";

const NavBar = () => {
  return (
    <>
      <nav className="relative z-10 py-6 px-8 flex justify-between items-center">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center mr-3">
            <svg
              className="w-6 h-6 text-white"
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
          <span className="text-2xl font-bold text-white">ChatOrbit</span>
        </div>
        <div className="flex space-x-4">
          <Link
            to="/login"
            className="py-2 px-4 text-indigo-100 hover:text-white transition-colors"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="py-2 px-6 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700
                     text-white font-medium rounded-xl transition-all duration-300 transform hover:scale-[1.02]"
          >
            Sign Up
          </Link>
        </div>
      </nav>
    </>
  );
};

export default NavBar;
