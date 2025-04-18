import {
  GithubAuthProvider,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { app } from "../firebaseConfig/config";
import { getAuth } from "firebase/auth";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [appear, setAppear] = useState(false);

  const navigate = useNavigate();
  const auth = getAuth(app);

  useEffect(() => {
    // Animation effect on mount
    setAppear(true);
  }, []);

  const DBWork = async (response) => {
    try {
      // console.log(response);
      const serverResponse = await axios.post(
        "http://localhost:3000/signUp",
        {
          uid: response.user.uid,
          email: response.user.email,
          userName: response.user.displayName || response.user.email,
          photoUrl: response.user.photoURL,
        }, // body
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Server Response: ", serverResponse.data);

      if (serverResponse?.data?.message === "Success") {
        navigate("/chat"); // Navigate to chat page after signup
      } else if (serverResponse?.data?.message === "User Exist") {
        navigate("/login");
      } else {
        navigate("/");
      }
      // navigate("/chat");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    try {
      const response = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await DBWork(response);
      setLoading(true);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    setError("");
    const provider = new GoogleAuthProvider();

    try {
      const response = await signInWithPopup(auth, provider);
      await DBWork(response);
      navigate("/chat");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGithubSignup = async () => {
    setLoading(true);
    setError("");
    const provider = new GithubAuthProvider();

    try {
      const response = await signInWithPopup(auth, provider);
      await DBWork(response);
      navigate("/chat");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900">
      {/* Background neon elements */}
      <div className="absolute top-20 left-20 w-48 h-48 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="absolute top-40 right-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-20 left-1/3 w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

      <div
        className={`bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-96 border border-white/20 transform transition-all duration-700 ${
          appear ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
        }`}
      >
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-2">ChatOrbit</h2>
          <p className="text-indigo-200">Create an account to get started</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-indigo-100">
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                className="w-full p-3 pl-4 bg-white/5 border border-indigo-300/30 rounded-xl 
                           focus:outline-none focus:ring-2 focus:ring-indigo-400 
                           text-white placeholder-indigo-200/70 transition-all duration-300"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-indigo-100">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                className="w-full p-3 pl-4 bg-white/5 border border-indigo-300/30 rounded-xl 
                           focus:outline-none focus:ring-2 focus:ring-indigo-400
                           text-white placeholder-indigo-200/70 transition-all duration-300"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-indigo-100">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type="password"
                className="w-full p-3 pl-4 bg-white/5 border border-indigo-300/30 rounded-xl 
                           focus:outline-none focus:ring-2 focus:ring-indigo-400
                           text-white placeholder-indigo-200/70 transition-all duration-300"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-400/10 text-red-300 p-3 rounded-lg text-sm animate-fadeIn">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700
                      text-white font-medium py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02]
                      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                      ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Creating Account...
              </div>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        <div className="relative flex items-center justify-center my-6">
          <div className="w-full border-t border-indigo-300/30"></div>
          <div className="px-4 text-sm text-indigo-200 bg-transparent">or</div>
          <div className="w-full border-t border-indigo-300/30"></div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handleGoogleSignup}
            disabled={loading}
            className="flex items-center justify-center py-2.5 px-4 bg-white/10 hover:bg-white/20 
                       rounded-xl transition-all duration-300 border border-white/20 group"
          >
            <svg
              className="w-5 h-5 mr-2"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M21.8,10H12v4h5.7c-0.5,2.5-2.5,4.3-5.7,4.3c-3.4,0-6.2-2.8-6.2-6.3s2.8-6.3,6.2-6.3c1.5,0,2.9,0.5,4,1.5l3-3 c-1.8-1.7-4.2-2.8-7-2.8C5.9,1.5,1.5,5.9,1.5,12s4.4,10.5,10.5,10.5c8.8,0,10.5-8.3,9.7-12.5z"
                fill="#ffffff"
              />
            </svg>
            <span className="text-white">Google</span>
          </button>

          <button
            onClick={handleGithubSignup}
            disabled={loading}
            className="flex items-center justify-center py-2.5 px-4 bg-white/10 hover:bg-white/20 
                       rounded-xl transition-all duration-300 border border-white/20 group"
          >
            <svg
              className="w-5 h-5 mr-2"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12,2C6.48,2,2,6.48,2,12c0,4.42,2.87,8.17,6.84,9.5c0.5,0.09,0.68-0.22,0.68-0.48c0-0.24-0.01-0.87-0.01-1.71c-2.78,0.6-3.37-1.34-3.37-1.34c-0.45-1.15-1.11-1.46-1.11-1.46c-0.91-0.62,0.07-0.61,0.07-0.61c1,0.07,1.53,1.03,1.53,1.03c0.89,1.53,2.34,1.09,2.91,0.83c0.09-0.65,0.35-1.09,0.63-1.34c-2.22-0.25-4.55-1.11-4.55-4.94c0-1.09,0.39-1.99,1.03-2.69c-0.1-0.25-0.45-1.27,0.1-2.64c0,0,0.84-0.27,2.75,1.02c0.8-0.22,1.65-0.33,2.5-0.34c0.85,0,1.7,0.12,2.5,0.34c1.91-1.29,2.75-1.02,2.75-1.02c0.55,1.37,0.2,2.39,0.1,2.64c0.64,0.7,1.03,1.6,1.03,2.69c0,3.84-2.34,4.68-4.57,4.93c0.36,0.31,0.68,0.92,0.68,1.85c0,1.34-0.01,2.42-0.01,2.75c0,0.27,0.18,0.58,0.69,0.48C19.14,20.16,22,16.42,22,12C22,6.48,17.52,2,12,2z"
                fill="#ffffff"
              />
            </svg>
            <span className="text-white">GitHub</span>
          </button>
        </div>

        <div className="mt-6 text-center text-sm text-indigo-200">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-indigo-300 hover:text-white transition-colors"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
