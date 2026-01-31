import React from "react";

const Dashboard = ({ emergencyData, aiGuidance, nearbyHospitals }) => {
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <h1 className="text-3xl font-bold text-red-500 text-center">
          Emergency Dashboard
        </h1>

        {/* Emergency Summary */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h2 className="text-xl font-semibold mb-2">Emergency Summary</h2>
          <p><strong>Type:</strong> {emergencyData.emergencyType}</p>
          <p><strong>Location:</strong> {emergencyData.location}</p>
          <p><strong>Time:</strong> {emergencyData.time}</p>
          {emergencyData.description && (
            <p><strong>Description:</strong> {emergencyData.description}</p>
          )}
        </div>

        {/* AI Guidance */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h2 className="text-xl font-semibold mb-2">Immediate Guidance</h2>
          <p className="text-zinc-300 whitespace-pre-line">
            {aiGuidance || "AI guidance will appear here."}
          </p>
        </div>

        {/* Nearby Hospitals */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h2 className="text-xl font-semibold mb-3">Nearby Medical Help</h2>

          {nearbyHospitals && nearbyHospitals.length > 0 ? (
            <ul className="space-y-2">
              {nearbyHospitals.map((hospital, index) => (
                <li
                  key={index}
                  className="p-3 bg-zinc-800 rounded-lg"
                >
                  <p className="font-semibold">{hospital.name}</p>
                  <p className="text-sm text-zinc-300">{hospital.address}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-zinc-400">Fetching nearby hospitals...</p>
          )}
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-zinc-400 text-center">
          ⚠️ This application is for first-contact assistance only and does not replace emergency services.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
