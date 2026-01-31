import React, { useState } from "react";

const EmergencyForm = ({ onSubmit }) => {
  const [emergencyType, setEmergencyType] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!emergencyType || !location) {
      alert("Please select emergency type and enter location.");
      return;
    }

    const emergencyData = {
      emergencyType,
      description,
      location,
      time: new Date().toLocaleTimeString(),
    };

    onSubmit(emergencyData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="max-w-md w-full p-6 bg-zinc-900 rounded-2xl shadow-lg border border-zinc-800">
        
        <h2 className="text-2xl font-bold text-red-500 mb-4 text-center">
          Emergency Details
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Emergency Type */}
          <select
            value={emergencyType}
            onChange={(e) => setEmergencyType(e.target.value)}
            className="w-full p-3 rounded-lg bg-zinc-800 text-white border border-zinc-700"
          >
            <option value="">Select Emergency Type</option>
            <option value="Heart Attack">Heart Attack</option>
            <option value="Accident">Accident</option>
            <option value="Severe Injury">Severe Injury</option>
            <option value="Breathing Issue">Breathing Issue</option>
            <option value="Other">Other</option>
          </select>

          {/* Description */}
          <textarea
            placeholder="Brief description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 rounded-lg bg-zinc-800 text-white border border-zinc-700"
            rows="3"
          />

          {/* Location */}
          <input
            type="text"
            placeholder="Enter your location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full p-3 rounded-lg bg-zinc-800 text-white border border-zinc-700"
          />

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 transition-all py-3 rounded-xl font-semibold"
          >
            Continue
          </button>
        </form>

        <p className="text-xs text-zinc-400 mt-4 text-center">
          ⚠️ This app provides guidance only. Please seek professional medical help.
        </p>
      </div>
    </div>
  );
};

export default EmergencyForm;
