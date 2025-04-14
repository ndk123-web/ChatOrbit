import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const NavBar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const navElement = document.getElementById("mobile-menu");
      if (
        navElement &&
        !navElement.contains(event.target) &&
        !event.target.closest('button[aria-label="Toggle menu"]')
      ) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav className="relative z-20 py-6 px-8 flex justify-between items-center">
      {/* Logo Section */}
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

      {/* Hamburger Menu Icon - Animated */}
      <button
        onClick={toggleMenu}
        className="md:hidden text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded p-1"
        aria-label="Toggle menu"
        aria-expanded={menuOpen}
      >
        <div className="relative w-6 h-6">
          <span
            className={`absolute h-0.5 w-6 bg-white transform transition-all duration-300 ease-in-out ${
              menuOpen ? "rotate-45 translate-y-2.5" : ""
            }`}
            style={{ top: "30%" }}
          ></span>
          <span
            className={`absolute h-0.5 w-6 bg-white transform transition-all duration-300 ease-in-out ${
              menuOpen ? "opacity-0" : "opacity-100"
            }`}
            style={{ top: "50%" }}
          ></span>
          <span
            className={`absolute h-0.5 w-6 bg-white transform transition-all duration-300 ease-in-out ${
              menuOpen ? "-rotate-45 -translate-y-2.5" : ""
            }`}
            style={{ top: "70%" }}
          ></span>
        </div>
      </button>

      {/* Desktop Navigation Links */}
      <div className="hidden md:flex space-x-4">
        <Link
          to="/login"
          className="py-2 px-4 text-indigo-100 hover:text-white transition-colors"
        >
          Login
        </Link>
        <Link
          to="/signup"
          className="py-2 px-6 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700
                   text-white font-medium rounded-xl transition-all duration-300 transform hover:scale-105"
        >
          Sign Up
        </Link>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          menuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMenuOpen(false)}
      ></div>

      {/* Mobile Menu Dropdown */}
      <div
        id="mobile-menu"
        className={`fixed top-0 right-0 h-full w-64 bg-gradient-to-b from-indigo-900 to-purple-900 shadow-2xl transform transition-all duration-300 ease-in-out md:hidden ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Mobile Menu Header */}
        <div className="flex justify-between items-center p-6 border-b border-indigo-700">
          <span className="text-xl font-bold text-white">Menu</span>
          <button
            onClick={() => setMenuOpen(false)}
            className="text-white focus:outline-none"
            aria-label="Close menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Mobile Menu Links */}
        <div className="flex flex-col p-6 space-y-6">
          <Link
            to="/login"
            className="py-2 px-4 text-center text-white hover:bg-indigo-700 rounded-lg transition-colors duration-200"
            onClick={() => setMenuOpen(false)}
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="py-3 px-6 text-center bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700
                     text-white font-medium rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
            onClick={() => setMenuOpen(false)}
          >
            Sign Up
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
