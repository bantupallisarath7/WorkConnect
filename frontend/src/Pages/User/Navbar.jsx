import React, { useState, useEffect, useRef } from "react";
import {
  MapPin, Search, X, ChevronDown, CheckCircle
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { signOutFailure, signOutStart, signOutSuccess, } from "../../../redux/auth/authSlice";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import SimpleLoader from "../../components/SimpleLoader";
import { setCity } from "../../../redux/location/locationSlice";
import useLockScroll from "../../utils/useLockScroll";
const locations = [
  "Hyderabad",
  "Visakhapatnam",
  "Bengaluru",
  "Chennai",
  "Delhi",
];

const Navbar = () => {
  const [openLocation, setOpenLocation] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const [searchLocation, setSearchLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [showLogoutSuccess, setShowLogoutSuccess] = useState(false);

  const { currentUser } = useSelector((state) => state.auth);
  useLockScroll(openLocation);


  const navigate = useNavigate();
  const profileRef = useRef();
  const dispatch = useDispatch();
  const selectedLocation = useSelector((state) => state.location.city);

  const user = {
    name: currentUser?.name || "User",
  };

  // Lock scroll when location sidebar is open
  useEffect(() => {
    document.body.style.overflow = openLocation ? "hidden" : "auto";
  }, [openLocation]);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setOpenProfile(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredLocations = locations.filter((loc) =>
    loc.toLowerCase().includes(searchLocation.toLowerCase())
  );

  const signout = async () => {
    setOpenProfile(false);
    setLoading(true);
    try {
      dispatch(signOutStart());

      const res = await axios.post(
        "https://workconnect-0306.onrender.com/api/auth/signout",
        {},
        { withCredentials: true }
      );

      if (res.data.success === false) {
        dispatch(signOutFailure(res.data.message));
        return;
      }
      setShowLogoutSuccess(true);
    } catch (error) {
      dispatch(signOutFailure(error.message));
    } finally{
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showLogoutSuccess) {
      const timer = setTimeout(() => {
        dispatch(signOutSuccess());
        navigate("/signin", { replace: true });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [showLogoutSuccess]);

  return (
    <>
      {/* GLOBAL LOADER */}
      {loading && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <SimpleLoader text="Signing you out..." />
        </div>
      )}

      {/* NAVBAR */}
      <header className="fixed top-0 w-full z-50 bg-gray-900/95 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between text-white">

          {/* LEFT */}
          <div className="flex items-center gap-3 md:gap-5">

            {/* LOGO */}
            <div
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 group cursor-pointer transition-transform duration-200 active:scale-95"
            >
              {/* Brand Name */}
              <h1 className="text-xl md:text-2xl font-bold tracking-tight flex items-center">
                <span className="text-white group-hover:text-gray-200 transition-colors">Work</span>
                <span className="text-orange-400">Connect</span>
                <span className=" sm:block w-1.5 h-1.5 bg-orange-400 rounded-full ml-1 animate-pulse"></span>
              </h1>
            </div>

            {/* LOCATION (DESKTOP) */}
            <button
              onClick={() => setOpenLocation(true)}
              className="hidden md:flex items-center gap-1 text-sm text-gray-300 hover:text-orange-400 transition"
            >
              <MapPin size={16} />
              {selectedLocation ? selectedLocation : "Select your location"}
              <ChevronDown size={16} />
            </button>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-3 md:gap-5">

            {/* SEARCH */}
            <button
              className="hover:text-orange-400 active:scale-95 transition"
              onClick={() => navigate("/search")}
            >
              <Search size={20} />
            </button>

            {/* LOCATION ICON (MOBILE) */}
            <button
              onClick={() => setOpenLocation(true)}
              className="md:hidden hover:text-orange-400 active:scale-95 transition"
            >
              <MapPin size={20} />
            </button>

            {/* PROFILE */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setOpenProfile(!openProfile)}
                className="flex items-center gap-2 hover:text-orange-400 transition cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-orange-400 flex items-center justify-center text-gray-900 font-bold text-sm">
                  {user.name.charAt(0)}
                </div>

                {/* NAME (DESKTOP ONLY) */}
                <span className="hidden md:block text-sm font-medium">
                  {user.name}
                </span>
              </button>

              {/* DROPDOWN */}
              {openProfile && (
                <div className="absolute right-0 mt-3 w-44 bg-white text-gray-800 rounded-xl shadow-lg overflow-hidden animate-dropdown">

                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    My Profile
                  </Link>

                  <Link
                    to="/mybookings"
                    className="block px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    My Bookings
                  </Link>
                  <Link
                    to="/help"
                    className="block px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    Help & Support
                  </Link>

                  <button
                    disabled={loading}
                    onClick={signout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 disabled:opacity-50"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* LOCATION SIDEBAR */}
      {openLocation && (
        <>
          {/* OVERLAY */}
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setOpenLocation(false)}
          />

          {/* SIDEBAR */}
          <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-gray-900 text-white z-50 shadow-xl p-5 flex flex-col animate-slideIn">

            {/* HEADER */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">
                Select Location
              </h2>
              <button onClick={() => setOpenLocation(false)}>
                <X />
              </button>
            </div>

            {/* SEARCH */}
            <div className="flex items-center bg-gray-800 rounded-xl px-3 focus-within:ring-2 focus-within:ring-orange-400">
              <Search size={18} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search location"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="w-full bg-transparent outline-none px-2 py-3 text-sm text-white"
              />
            </div>

            {/* LIST */}
            <div className="mt-4 overflow-y-auto flex-1">
              {filteredLocations.map((loc, i) => (
                <div
                  key={i}
                  onClick={() => {
                    dispatch(setCity(loc));
                    setOpenLocation(false);
                  }}
                  className={`px-3 py-2 rounded-lg cursor-pointer transition ${selectedLocation === loc
                    ? "bg-orange-500/20 text-orange-400"
                    : "text-gray-300 hover:bg-orange-500/10 hover:text-orange-400"
                    }`}
                >
                  {loc}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Animations */}
      <style>
        {`
        .animate-slideIn {
          animation: slideIn 0.25s ease forwards;
        }
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }

        .animate-dropdown {
          animation: dropdown 0.2s ease forwards;
        }
        @keyframes dropdown {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-5px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        `}
      </style>

      {/* SUCCESS MODAL */}
      {showLogoutSuccess && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">

          {/* Card */}
          <div className=" w-full max-w-[90%] sm:max-w-sm bg-white rounded-2xl p-6 text-center shadow-2xl animate-[fadeIn_0.25s_ease]">

            <CheckCircle
              className="text-green-500 mx-auto mb-3"
              size={50}
            />

            <h2 className="text-lg font-semibold mb-2">
              Logged Out Successfully
            </h2>

            <p className="text-sm text-gray-500 mb-5">
              Redirecting to login...
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;