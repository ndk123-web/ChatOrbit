import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <>
      <footer className="py-8 px-8 relative z-10 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
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
          <div className="flex space-x-6">
            <a
              href="#"
              className="text-indigo-200 hover:text-white transition-colors"
            >
              Terms
            </a>
            <a
              href="#"
              className="text-indigo-200 hover:text-white transition-colors"
            >
              Privacy
            </a>
            <a
              href="#"
              className="text-indigo-200 hover:text-white transition-colors"
            >
              Help
            </a>
            <a
              href="#"
              className="text-indigo-200 hover:text-white transition-colors"
            >
              Contact
            </a>
          </div>
          <div className="mt-4 md:mt-0 text-indigo-300 text-sm">
            © 2025 ChatOrbit. All rights reserved.
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
