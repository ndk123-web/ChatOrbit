import React from "react";
import { useContext } from "react";
import { myContext } from "../sessionProvider/myContext";

const FeatureSection = () => {
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
      <div className="py-16 px-8 relative z-10">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          Why Choose ChatOrbit?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-white/20 transform transition-all duration-700 delay-${
                index * 200
              } ${
                appear
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-12"
              }`}
            >
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 w-12 h-12 rounded-xl flex items-center justify-center text-white mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-indigo-200">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default FeatureSection;
