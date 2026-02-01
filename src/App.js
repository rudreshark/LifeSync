import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Hospital, LogOut, MapPin, Phone, Shield, Menu, X, Ambulance, ChevronRight, Bed, Phone as PhoneIcon } from 'lucide-react';

export default function LifeSyncApp() {
  // 1. STATE MANAGEMENT (Persistence Simulation)
  const [userRole, setUserRole] = useState(() => {
    try {
      return localStorage.getItem('role') || null;
    } catch {
      return null;
    }
  });
  const [isUserRegistered, setIsUserRegistered] = useState(() => {
    try {
      return localStorage.getItem('isRegistered') === 'true';
    } catch {
      return false;
    }
  });
  const [currentPage, setCurrentPage] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [sosStarted, setSosStarted] = useState(false);
  const [position, setPosition] = useState(null);
  const [watchId, setWatchId] = useState(null);
  const [notificationStatus, setNotificationStatus] = useState({});
  const [userData, setUserData] = useState(() => {
    try {
      const stored = localStorage.getItem('userData');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // 2. LOGIN HANDLER
  const handleLogin = (role) => {
    localStorage.setItem('role', role);
    setUserRole(role);
    
    // Check if user is registered, if not go to registration
    if (role === 'user' && !isUserRegistered) {
      setCurrentPage('register');
    } else {
      setCurrentPage('home');
    }
  };

  const handleRegistration = (data) => {
    localStorage.setItem('userData', JSON.stringify(data));
    localStorage.setItem('isRegistered', 'true');
    setUserData(data);
    setIsUserRegistered(true);
    setCurrentPage('home');
  };

  const handleLogout = () => {
    localStorage.clear();
    setUserRole(null);
    setIsUserRegistered(false);
    setUserData(null);
    setCurrentPage('login');
  };

  // SOS / Notifications
  const emergencyContacts = () => {
    // gather up to 5 contacts from stored userData or defaults
    const contacts = [];
    if (userData?.emergencyContact1 && userData?.emergencyPhone1) contacts.push({ name: userData.emergencyContact1, phone: userData.emergencyPhone1 });
    if (userData?.emergencyContact2 && userData?.emergencyPhone2) contacts.push({ name: userData.emergencyContact2, phone: userData.emergencyPhone2 });
    // fill with defaults if less than 5
    while (contacts.length < 5) {
      contacts.push({ name: `Contact ${contacts.length + 1}`, phone: `+91 90000 0000${contacts.length}` });
    }
    return contacts.slice(0,5);
  };

  const [calculatedHospitals, setCalculatedHospitals] = useState([]);
  const [mapRef, setMapRef] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Search for REAL nearby hospitals using Google Places API
  const searchNearbyHospitals = async (userPos) => {
    if (!userPos || !window.google) {
      console.log('Waiting for Google Maps API...');
      return;
    }

    try {
      const userLocation = new window.google.maps.LatLng(userPos.coords.latitude, userPos.coords.longitude);
      const service = new window.google.maps.places.PlacesService(
        document.createElement('div')
      );

      const request = {
        location: userLocation,
        radius: 5000, // 5km radius
        type: 'hospital',
        rankBy: 'distance'
      };

      service.nearbySearch(request, (results, status) => {
        if (status === 'OK' && results) {
          // Get top 3 hospitals
          const topHospitals = results.slice(0, 3).map((place, idx) => {
            const distance = window.google.maps.geometry.spherical.computeDistanceBetween(
              userLocation,
              place.geometry.location
            ) / 1000; // Convert to km

            // Estimate time: assume 30 km/hour average speed in city
            const estimatedTime = Math.ceil((distance / 30) * 60);

            return {
              name: place.name,
              address: place.vicinity || 'Address not available',
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
              dist: `${distance.toFixed(1)}km`,
              time: `${estimatedTime} mins`,
              distValue: distance,
              rating: place.rating || 'N/A',
              icuAvail: Math.floor(Math.random() * 15) + 1, // Random ICU beds for simulation
              ambulance: '+91 98765 1000' + idx,
              toll: '1800-HOSPITAL-' + idx,
              placeId: place.place_id,
              isOpenNow: place.opening_hours?.open_now ? 'Open' : 'Check Hours'
            };
          });

          setCalculatedHospitals(topHospitals);
          console.log('Found Real Hospitals:', topHospitals);
        } else {
          console.error('Places Search Error:', status);
        }
      });
    } catch (error) {
      console.error('Error searching hospitals:', error);
    }
  };

  // Initialize map with proper error checking
  useEffect(() => {
    if (currentPage === 'map' && position && window.google) {
      const mapElement = document.getElementById('map');
      
      if (!mapElement) {
        console.error('Map element not found');
        return;
      }

      if (mapRef && mapLoaded) {
        return; // Map already initialized
      }

      try {
        const map = new window.google.maps.Map(mapElement, {
          zoom: 15,
          center: { lat: position.coords.latitude, lng: position.coords.longitude },
          mapTypeId: 'roadmap'
        });

        // User marker (Blue)
        new window.google.maps.Marker({
          position: { lat: position.coords.latitude, lng: position.coords.longitude },
          map: map,
          title: 'Your Location',
          icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
        });

        // Hospital markers (Red)
        calculatedHospitals.forEach((hospital, idx) => {
          new window.google.maps.Marker({
            position: { lat: hospital.lat, lng: hospital.lng },
            map: map,
            title: `${idx + 1}. ${hospital.name}`,
            label: `${idx + 1}`,
            icon: 'http://maps.google.com/mapfiles/ms/icons/hospital.png'
          });

          // Add info window
          const infowindow = new window.google.maps.InfoWindow({
            content: `<div style="padding:10px">
              <strong>${hospital.name}</strong><br/>
              ${hospital.address}<br/>
              Distance: ${hospital.dist}
            </div>`
          });

          const marker = new window.google.maps.Marker({
            position: { lat: hospital.lat, lng: hospital.lng },
            map: map,
            title: hospital.name
          });

          marker.addListener('click', () => {
            infowindow.open(map, marker);
          });
        });

        setMapRef(map);
        setMapLoaded(true);
      } catch (error) {
        console.error('Map initialization error:', error);
      }
    }
  }, [currentPage, position, calculatedHospitals, mapRef, mapLoaded]);

  const nearestHospitals = calculatedHospitals.length > 0 ? calculatedHospitals : [];

  const notifyAll = (pos) => {
    if (!pos) return;
    
    // Build message with location and hospital details
    const coords = `${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`;
    const mapsLink = `https://www.google.com/maps?q=${pos.coords.latitude},${pos.coords.longitude}`;
    const timestamp = new Date().toLocaleTimeString();
    
    const contacts = emergencyContacts();
    const status = {};

    // Simulate sending SMS to emergency contacts
    contacts.forEach((c, i) => {
      const msg = `EMERGENCY ALERT!\nName: ${userData?.name || 'Unknown'}\nAge: ${userData?.age || 'N/A'}\nBlood: ${userData?.bloodGroup || 'N/A'}\nLocation: ${coords}\nTime: ${timestamp}\nMap: ${mapsLink}`;
      
      // Simulate SMS sending
      status[`contact_${i}`] = {
        to: c.phone,
        name: c.name,
        status: 'SMS Sent',
        message: msg,
        timestamp: timestamp,
        location: coords
      };
      
      // Log to console to simulate backend
      console.log(`SMS to ${c.name} (${c.phone}):`, msg);
    });

    // Notify nearest hospitals with ambulance details
    nearestHospitals.forEach((h, i) => {
      const msg = `INCOMING EMERGENCY!\nPatient: ${userData?.name || 'Unknown'}\nAge: ${userData?.age || 'N/A'}\nBlood: ${userData?.bloodGroup || 'N/A'}\nLocation: ${coords}\nTime: ${timestamp}\nMap: ${mapsLink}\nHospital: ${h.name}\nETA: ${h.time}`;
      
      status[`hospital_${i}`] = {
        to: h.ambulance,
        name: h.name,
        status: 'Alert Sent',
        message: msg,
        timestamp: timestamp,
        location: coords,
        hospital: h.name
      };
      
      // Log to console to simulate backend
      console.log(`Alert to ${h.name} (${h.ambulance}):`, msg);
    });

    setNotificationStatus(status);
  };

  const startSOS = async () => {
    if (!('geolocation' in navigator)) {
      alert('Geolocation not supported in this browser');
      return;
    }

    setSosStarted(true);

    // Request high accuracy position first
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition(pos);
        notifyAll(pos);
        // Search for REAL nearby hospitals using Google Places API
        searchNearbyHospitals(pos);
      },
      (err) => {
        console.error('Geolocation error:', err.message);
        alert('Unable to get location. Please enable location services.');
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    );

    // Start watching for continuous location updates
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition(pos);
      },
      (err) => {
        console.error('Watch error:', err.message);
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );
    setWatchId(id);
  };

  const stopSOS = () => {
    if (watchId !== null && navigator.geolocation.clearWatch) {
      navigator.geolocation.clearWatch(watchId);
    }
    setWatchId(null);
    setSosStarted(false);
    setNotificationStatus({});
  };

  // 3. UI COMPONENTS

  // --- REGISTRATION SCREEN ---
  if (userRole === 'user' && !isUserRegistered && currentPage === 'register') {
    return (
      <RegistrationForm onSubmit={handleRegistration} onBack={() => {
        setUserRole(null);
        localStorage.clear();
      }} />
    );
  }
  
  // --- LOGIN SCREEN ---
  if (!userRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-slate-50 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-red-100 rounded-full"><Shield className="text-red-600 w-10 h-10" /></div>
          </div>
          <h1 className="text-4xl font-black text-center text-slate-800 mb-2">LifeSync</h1>
          <p className="text-center text-slate-500 mb-8">Emergency Medical Assistance</p>
          
          <div className="space-y-4">
            <button onClick={() => handleLogin('user')} className="w-full flex items-center justify-between p-5 bg-gradient-to-r from-red-50 to-red-100 hover:from-red-100 hover:to-red-150 border-2 border-red-200 rounded-2xl transition-all group">
              <div className="flex items-center gap-4">
                <User className="text-red-600 w-6 h-6" />
                <span className="font-bold text-slate-700">Citizen Portal</span>
              </div>
              <ChevronRight className="text-red-600 w-5 h-5" />
            </button>

            <button onClick={() => handleLogin('hospital')} className="w-full flex items-center justify-between p-5 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-150 border-2 border-blue-200 rounded-2xl transition-all group">
              <div className="flex items-center gap-4">
                <Hospital className="text-blue-600 w-6 h-6" />
                <span className="font-bold text-slate-700">Hospital Staff</span>
              </div>
              <ChevronRight className="text-blue-600 w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- CITIZEN PORTAL ---
  if (userRole === 'user') {
    return (
      <div className="min-h-screen bg-white text-slate-900 relative overflow-hidden">
        {/* Sliding Menu Overlay */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} className="fixed inset-0 z-50 bg-white w-3/4 shadow-2xl p-6">
              <div className="flex justify-between mb-10">
                <span className="font-black text-red-600 text-xl">LifeSync</span>
                <X onClick={() => setIsMenuOpen(false)} />
              </div>
              <nav className="space-y-6">
                <div onClick={() => {setCurrentPage('profile'); setIsMenuOpen(false)}} className="flex items-center gap-4 text-lg font-bold cursor-pointer hover:text-red-600 transition"><User /> Profile</div>
                <div onClick={() => {setCurrentPage('nearest'); setIsMenuOpen(false)}} className="flex items-center gap-4 text-lg font-bold cursor-pointer hover:text-red-600 transition"><Hospital /> Nearest Hospitals</div>
                
                <div className="pt-4 border-t">
                  <div className="text-xs font-bold text-slate-400 uppercase mb-4">Emergency Services</div>
                  <button onClick={() => { window.location.href = 'tel:112'; setIsMenuOpen(false); }} className="w-full flex items-center gap-4 p-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition mb-3">
                    <Phone className="w-5 h-5" /> Call 112
                  </button>
                </div>
                
                <div onClick={handleLogout} className="flex items-center gap-4 text-lg font-bold text-red-600 cursor-pointer hover:text-red-700 transition"><LogOut /> Log Out</div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <header className="p-6 flex justify-between items-center">
          <Menu onClick={() => setIsMenuOpen(true)} className="w-8 h-8 cursor-pointer" />
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
        </header>

        {/* Dynamic Pages */}
        <main className="p-6">
          {currentPage === 'home' && (
            <div className="flex flex-col items-center justify-center py-12">
              <h2 className="text-2xl font-black mb-2">Ready for Assistance</h2>
              <p className="text-slate-400 mb-6">Press the SOS button to alert contacts and nearby hospitals</p>

              <motion.button 
                whileTap={{ scale: 0.95 }}
                animate={sosStarted ? { scale: [1, 1.06, 1] } : {}}
                transition={{ repeat: sosStarted ? Infinity : 0, duration: 1 }}
                onClick={() => (sosStarted ? stopSOS() : startSOS())}
                className={`w-72 h-72 rounded-full flex flex-col items-center justify-center text-white text-5xl font-black shadow-2xl transition-colors ${sosStarted ? 'bg-orange-500' : 'bg-red-600 shadow-red-200'}`}
              >
                <span className="text-3xl">{sosStarted ? 'ACTIVE' : 'SOS'}</span>
                <span className="text-sm font-medium mt-2">{sosStarted ? 'Sending location...' : 'Tap to alert'}</span>
              </motion.button>

              {sosStarted && (
                <div className="mt-6 w-full max-w-3xl">
                  <div className="bg-white p-4 rounded-2xl shadow mb-4">
                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <div>
                        <p className="text-xs text-slate-500">Live Location (GPS Precise)</p>
                        <p className="font-bold text-sm">{position ? `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}` : 'Acquiring...'}</p>
                        <p className="text-xs text-slate-400">Accuracy: {position ? `±${position.coords.accuracy.toFixed(0)}m` : 'N/A'}</p>
                      </div>
                      <div className="text-right flex gap-2">
                        {position && (
                          <button onClick={() => setCurrentPage('map')} className="text-sm text-blue-600 font-semibold bg-blue-50 px-3 py-1 rounded-lg hover:bg-blue-100">📍 View Map</button>
                        )}
                        {position && (
                          <a className="text-sm text-blue-600 font-semibold bg-blue-50 px-3 py-1 rounded-lg hover:bg-blue-100" href={`https://www.google.com/maps?q=${position.coords.latitude},${position.coords.longitude}`} target="_blank" rel="noreferrer">🗺️ GMaps</a>
                        )}
                        <button onClick={stopSOS} className="text-sm text-white font-bold bg-red-600 px-3 py-1 rounded-lg hover:bg-red-700">Stop</button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {nearestHospitals.map((h, i) => (
                      <div key={i} className="p-4 bg-white rounded-2xl shadow flex flex-col md:flex-row md:justify-between md:items-center">
                        <div>
                          <h4 className="font-bold text-slate-900">{h.name}</h4>
                          <p className="text-sm text-slate-500">{h.address}</p>
                          <p className="text-xs text-green-600 font-semibold mt-1">📍 {h.dist} • {h.time} away</p>
                          <div className="flex gap-3 mt-2">
                            <div className="flex items-center gap-2 bg-green-50 p-2 rounded-lg">
                              <Bed className="w-4 h-4 text-green-600" />
                              <div>
                                <p className="text-xs text-slate-500">ICU Beds</p>
                                <p className="font-bold text-green-600">{h.icuAvail}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 bg-blue-50 p-2 rounded-lg">
                              <Ambulance className="w-4 h-4 text-blue-600" />
                              <div>
                                <p className="text-xs text-slate-500">Ambulance</p>
                                <p className="font-bold text-blue-600 text-sm">{h.ambulance}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 md:mt-0 md:text-right">
                          <div className="text-sm text-slate-600 mb-2">Status: <span className="font-semibold text-green-600">{notificationStatus[`hospital_${i}`]?.status || (notificationStatus[`hospital_${i}`] ? notificationStatus[`hospital_${i}`].status : 'notified')}</span></div>
                          <button onClick={() => { window.location.href = `tel:${h.ambulance}`; setNotificationStatus(prev => ({ ...prev, [`hospital_${i}`]: { ...(prev[`hospital_${i}`]||{}), status: 'called' } })); }} className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-xl font-bold">
                            Call Ambulance
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 bg-white p-3 rounded-2xl shadow">
                    <h5 className="font-bold mb-2">Notifications</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {Object.keys(notificationStatus).length === 0 && <div className="text-sm text-slate-500">Notifications will appear here once dispatched.</div>}
                      {Object.entries(notificationStatus).map(([k,v]) => (
                        <div key={k} className="p-2 bg-slate-50 rounded-lg">
                          <div className="text-xs text-slate-500">{v.name}</div>
                          <div className="font-bold text-sm">{v.to}</div>
                          <div className="text-xs text-slate-600">{v.status}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentPage === 'profile' && (
            <div className="animate-in slide-in-from-bottom duration-300">
              <div className="flex gap-3 mb-6">
                <button onClick={() => setCurrentPage('home')} className="flex-1 text-slate-400 font-bold py-2 px-4 bg-slate-100 hover:bg-slate-200 rounded-lg transition">← Back</button>
                <button onClick={() => setCurrentPage('home')} className="flex-1 text-white font-bold py-2 px-4 bg-red-600 hover:bg-red-700 rounded-lg transition">Home</button>
              </div>
              <h2 className="text-3xl font-black mb-6">Your Profile</h2>
              <div className="bg-slate-50 p-6 rounded-3xl space-y-4">
                <div className="bg-white p-4 rounded-2xl">
                  <label className="text-xs font-bold text-slate-400 uppercase">Name</label>
                  <p className="font-bold text-lg">{userData?.name || 'Not set'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-2xl">
                    <label className="text-xs font-bold text-slate-400 uppercase">Age</label>
                    <p className="font-bold">{userData?.age || 'N/A'}</p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl">
                    <label className="text-xs font-bold text-slate-400 uppercase">Blood Group</label>
                    <p className="font-bold text-red-600 text-lg">{userData?.bloodGroup || 'N/A'}</p>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-2xl">
                  <label className="text-xs font-bold text-slate-400 uppercase">Phone</label>
                  <p className="font-bold">{userData?.phone || 'Not set'}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl">
                  <label className="text-xs font-bold text-slate-400 uppercase">Email</label>
                  <p className="font-bold">{userData?.email || 'Not set'}</p>
                </div>
                <div className="pt-4 border-t">
                  <label className="text-xs font-bold text-slate-400 uppercase">Emergency Contacts</label>
                  <div className="space-y-2 mt-3">
                    {userData?.emergencyContact1 && (
                      <div className="text-sm font-medium bg-white p-3 rounded-lg border border-slate-200">
                        <p className="font-bold">{userData.emergencyContact1}</p>
                        <p className="text-slate-600">{userData.emergencyPhone1}</p>
                      </div>
                    )}
                    {userData?.emergencyContact2 && (
                      <div className="text-sm font-medium bg-white p-3 rounded-lg border border-slate-200">
                        <p className="font-bold">{userData.emergencyContact2}</p>
                        <p className="text-slate-600">{userData.emergencyPhone2}</p>
                      </div>
                    )}
                  </div>
                </div>
                <button onClick={() => {
                  handleLogout();
                }} className="w-full mt-6 bg-red-100 hover:bg-red-200 text-red-600 font-bold py-3 rounded-xl transition-colors">
                  Logout
                </button>
              </div>
            </div>
          )}

          {currentPage === 'nearest' && (
            <div>
              <button onClick={() => setCurrentPage('home')} className="mb-6 text-slate-400 font-bold">← Back</button>
              <h2 className="text-3xl font-black mb-6">Top 3 Facilities</h2>
              <div className="space-y-4">
                {[
                  { name: 'City General Hospital', dist: '1.2km', beds: '4', time: '5 mins', address: '123 Medical St, Downtown', ambulance: '+91 98765 10001', toll: '1800-CITY-911', icuAvail: 4 },
                  { name: 'St. Mary ICU Center', dist: '2.5km', beds: '2', time: '9 mins', address: '456 Healthcare Ave, North Zone', ambulance: '+91 98765 10002', toll: '1800-MARY-911', icuAvail: 2 },
                  { name: 'Metro Health Complex', dist: '3.8km', beds: '12', time: '12 mins', address: '789 Wellness Rd, Metro Circle', ambulance: '+91 98765 10003', toll: '1800-METRO-911', icuAvail: 12 }
                ].map((h, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-5 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-slate-900">{h.name}</h4>
                        <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                          <MapPin className="w-4 h-4" /> {h.address}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-blue-600 font-black text-lg">{h.time}</p>
                        <p className="text-xs text-slate-400">{h.dist}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t">
                      <div className="flex items-center gap-2 bg-green-50 p-2 rounded-lg">
                        <Bed className="w-4 h-4 text-green-600" />
                        <div>
                          <p className="text-xs text-slate-500">ICU Beds</p>
                          <p className="font-bold text-green-600">{h.icuAvail}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 bg-blue-50 p-2 rounded-lg">
                        <Ambulance className="w-4 h-4 text-blue-600" />
                        <div>
                          <p className="text-xs text-slate-500">Ambulance</p>
                          <p className="font-bold text-blue-600 text-sm">Available</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t space-y-2">
                      <div className="flex items-center gap-2 text-slate-700">
                        <PhoneIcon className="w-4 h-4 text-orange-600" />
                        <span className="text-sm font-semibold">{h.ambulance}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-700">
                        <Phone className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-semibold">{h.toll}</span>
                      </div>
                    </div>

                    <button className="w-full mt-3 bg-red-600 hover:bg-red-700 text-white py-2 rounded-xl font-bold text-sm transition-colors">
                      Call Ambulance
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  // --- MAP PAGE ---
  if (userRole === 'user' && currentPage === 'map') {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex justify-between items-center p-4 bg-red-600 text-white">
          <h2 className="font-bold">Live Location & Hospitals</h2>
          <button onClick={() => setCurrentPage('home')} className="text-white hover:text-gray-200">✕</button>
        </div>
        <div id="map" style={{ width: '100%', height: 'calc(100vh - 60px)' }} />
      </div>
    );
  }

  // --- HOSPITAL STAFF VIEW ---
  if (userRole === 'hospital') {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-6">
        <header className="flex justify-between items-center mb-10">
          <div><h2 className="text-xl font-black">Staff Control</h2><p className="text-xs text-slate-400 underline decoration-green-500">Live Station Active</p></div>
          <LogOut onClick={handleLogout} className="text-slate-500" />
        </header>

        <div className="space-y-6">
          <div className="bg-slate-800 p-6 rounded-3xl border border-red-500/30 animate-pulse">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 bg-red-600 rounded-full"></div>
              <h3 className="font-bold text-red-500">ACTIVE INBOUND SOS</h3>
            </div>
            <p className="text-sm text-slate-300 mb-4 font-mono uppercase tracking-tighter">Patient: John Doe (Male, 28) <br/>Loc: 17.3850° N, 78.4867° E</p>
            <button className="w-full bg-red-600 py-4 rounded-xl font-bold flex items-center justify-center gap-2">
              <MapPin /> TRACK ON MAP
            </button>
          </div>

          <div className="bg-slate-800 p-6 rounded-3xl">
            <h3 className="font-bold mb-4 flex items-center gap-2"><Ambulance className="w-5 h-5" /> Dispatch Unit</h3>
            <label className="text-[10px] text-slate-400 uppercase font-bold">Assign Driver Number</label>
            <div className="flex gap-2 mt-1">
              <input type="tel" placeholder="+91 00000 00000" className="flex-1 bg-slate-700 border-none rounded-xl p-3 text-sm" />
              <button className="bg-blue-600 px-4 rounded-xl font-bold font-sm">SEND</button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

// --- REGISTRATION FORM COMPONENT ---
function RegistrationForm({ onSubmit, onBack }) {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    bloodGroup: '',
    phone: '',
    email: '',
    emergencyContact1: '',
    emergencyPhone1: '',
    emergencyContact2: '',
    emergencyPhone2: '',
  });

  const [step, setStep] = useState(1);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.age || !formData.bloodGroup || !formData.phone) {
      alert('Please fill all required fields');
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-slate-50 p-6">
      <div className="max-w-md mx-auto mt-10">
        <button onClick={onBack} className="mb-6 text-slate-600 font-bold flex items-center gap-2">
          ← Back
        </button>

        <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
          <h1 className="text-3xl font-black text-slate-800 mb-2">Setup Profile</h1>
          <p className="text-slate-500 mb-6">Complete your profile for emergency assistance</p>

          {/* Progress Bar */}
          <div className="flex gap-2 mb-8">
            {[1, 2].map((s) => (
              <div key={s} className={`h-1 flex-1 rounded-full transition-all ${s <= step ? 'bg-red-600' : 'bg-slate-200'}`} />
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Full Name *</label>
                <input type="text" name="name" placeholder="Your full name" value={formData.name} onChange={handleChange} className="w-full mt-1 p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-red-600" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Age *</label>
                  <input type="number" name="age" placeholder="Age" value={formData.age} onChange={handleChange} className="w-full mt-1 p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-red-600" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Blood Group *</label>
                  <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className="w-full mt-1 p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-red-600">
                    <option value="">Select</option>
                    <option>O+</option>
                    <option>O-</option>
                    <option>A+</option>
                    <option>A-</option>
                    <option>B+</option>
                    <option>B-</option>
                    <option>AB+</option>
                    <option>AB-</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Phone *</label>
                <input type="tel" name="phone" placeholder="+91 XXXXX XXXXX" value={formData.phone} onChange={handleChange} className="w-full mt-1 p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-red-600" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
                <input type="email" name="email" placeholder="your@email.com" value={formData.email} onChange={handleChange} className="w-full mt-1 p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-red-600" />
              </div>
              <button onClick={() => setStep(2)} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl mt-6">
                Next
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 mb-4">Emergency Contacts</h3>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Contact 1 Name *</label>
                <input type="text" name="emergencyContact1" placeholder="Contact name" value={formData.emergencyContact1} onChange={handleChange} className="w-full mt-1 p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-red-600" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Contact 1 Phone *</label>
                <input type="tel" name="emergencyPhone1" placeholder="+91 XXXXX XXXXX" value={formData.emergencyPhone1} onChange={handleChange} className="w-full mt-1 p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-red-600" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Contact 2 Name</label>
                <input type="text" name="emergencyContact2" placeholder="Contact name" value={formData.emergencyContact2} onChange={handleChange} className="w-full mt-1 p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-red-600" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Contact 2 Phone</label>
                <input type="tel" name="emergencyPhone2" placeholder="+91 XXXXX XXXXX" value={formData.emergencyPhone2} onChange={handleChange} className="w-full mt-1 p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-red-600" />
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(1)} className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-3 rounded-xl">
                  Back
                </button>
                <button onClick={handleSubmit} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl">
                  Complete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}