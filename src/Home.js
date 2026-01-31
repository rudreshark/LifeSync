import React from "react";

const Home = ({ onStartEmergency }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="max-w-md w-full p-6 bg-zinc-900 rounded-2xl shadow-lg border border-zinc-800">
        
        {/* App Title */}
        <h1 className="text-3xl font-bold text-center text-red-500 mb-4">
          Emergency Assist
        </h1>

        {/* Subtitle */}
        <p className="text-center text-zinc-300 mb-6">
          Get immediate guidance and locate nearby medical help during emergencies.
        </p>

        {/* Emergency Button */}
        <button
          onClick={onStartEmergency}
          className="w-full bg-red-600 hover:bg-red-700 transition-all duration-200 text-white font-semibold py-4 rounded-xl text-lg"
        >
          🚨 I Need Emergency Help
        </button>

        {/* Disclaimer */}
        <p className="text-xs text-zinc-400 mt-6 text-center">
          ⚠️ This application provides first-contact assistance only.  
          It does NOT replace professional medical care.
        </p>
      </div>
    </div>
  );
};

export default Home;
