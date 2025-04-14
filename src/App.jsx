import { useEffect } from "react";
import { Link } from "react-router-dom";

import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import HeroSection from "./components/HeroSection";
import FeatureSection from "./components/FeatureSection";

import { useContext } from "react";
import { myContext } from "./sessionProvider/myContext";

const Home = () => {
  const {
    isLoggedIn,
    setIsLoggedIn,
    appear,
    setAppear,
    features,
    setFeatures,
  } = useContext(myContext);

  useEffect(() => {
    // Animation effect on mount
    setAppear(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 flex flex-col">
      {/* Background neon elements */}
      <div className="absolute top-20 left-20 w-48 h-48 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="absolute top-40 right-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-20 left-1/3 w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

      {/* Navigation */}
      <NavBar />

      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <FeatureSection />

      {/* Footer */}
      <Footer />
      
    </div>
  );
};

export default Home;
