import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { X, CheckCircle } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import SimpleLoader from "../../components/SimpleLoader";

import {
  signOutFailure,
  signOutStart,
  signOutSuccess,
  updateAvailability,
} from "../../../redux/auth/authSlice";
import useLockScroll from "../../utils/useLockScroll";

const Navbar = ({ role }) => {
  const [openProfilePanel, setOpenProfilePanel] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toggleLoading, setToggleLoading] = useState(false);
  const [showLogoutSuccess, setShowLogoutSuccess] = useState(false);
  const [logoutRole, setLogoutRole] = useState(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentUser } = useSelector((state) => state.auth);
  const available = currentUser?.availability?.isAvailable || false;

  useLockScroll(showLogoutSuccess);
  useLockScroll(openProfilePanel);

  const roleConfig = {
    connector: {
      dashboard: "/connector-dashboard",
      menu: [
        { name: "Profile", path: "/connector-profile" },
        { name: "Manage Workers", path: "/manage-workers" },
        { name: "Manage Bookings", path: "/manage-bookings" },
        { name: "Earnings", path: "/connector-earnings" },
        { name: "Reviews", path: "/connector-reviews" },
        { name: "Help", path: "/help" },
      ],
      defaultName: "Connector",
    },

    worker: {
      dashboard: "/worker-dashboard",
      menu: [
        { name: "Profile", path: "/worker-profile" },
        { name: "My Bookings", path: "/worker-bookings" },
        { name: "Earnings", path: "/worker-earnings" },
        { name: "Reviews", path: "/worker-reviews" },
        { name: "Help", path: "/help" },
      ],
      defaultName: "Worker",
    },
  };

  const config = roleConfig[role];

  const formatAddress = (location) => {
    if (!location) return "Add address";

    const { addressLine, city, state } = location;

    return [addressLine, city, state]
      .filter(Boolean)
      .join(", ");
  };

  const user = {
    name: currentUser?.name || "Connector",
    address: formatAddress(currentUser?.location),
  };

  const handleToggle = async () => {
    if (toggleLoading) return;

    const newStatus = !available;

    dispatch(updateAvailability(newStatus));

    try {
      setToggleLoading(true);

      const res = await axios.put(
        "https://workconnect-0306.onrender.com/api/connector/availability",
        { isAvailable: newStatus },
        { withCredentials: true }
      );

      if (!res.data.success) {
        dispatch(updateAvailability(!newStatus));
      }

    } catch (err) {
      dispatch(updateAvailability(!newStatus));
    } finally {
      setToggleLoading(false);
    }
  };

  const handleLogout = async () => {
    setOpenProfilePanel(false);
    setLoading(true);
    setLogoutRole(currentUser?.role);
    try {
      dispatch(signOutStart());
      await axios.post(
        "https://workconnect-0306.onrender.com/api/auth/signout",
        {},
        { withCredentials: true }
      );
      setShowLogoutSuccess(true);
    } catch (error) {
      dispatch(signOutFailure(error.message));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (showLogoutSuccess && logoutRole) {
      const timer = setTimeout(() => {
        dispatch(signOutSuccess());
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [showLogoutSuccess, logoutRole]);
  return (
    <>

      {loading && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <SimpleLoader text="Signing you out..." />
        </div>
      )}

      <header className="fixed top-0 w-full z-50 bg-gray-900/95 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between text-white">

          {/* LEFT */}
          <div className="flex items-center gap-4 md:gap-6">
            
            <div
              onClick={() => navigate(config.dashboard)}
              className="flex items-center gap-2 group cursor-pointer transition-transform duration-200 active:scale-95 select-none"
            >
              {/* Brand Name */}
              <h1 className="text-xl md:text-2xl font-bold tracking-tight flex items-center">
                <span className="text-white group-hover:text-gray-200 transition-colors">Work</span>
                <span className="text-orange-400">Connect</span>
                <span className=" sm:block w-1.5 h-1.5 bg-orange-400 rounded-full ml-1 animate-pulse"></span>
              </h1>
            </div>

            {/* Address Section */}
            <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-white/10">
              <p
                title={user.address}
                className="text-xs md:text-sm text-gray-400 max-w-[200px] truncate italic"
              >
                {user.address}
              </p>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-6">

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-300">
                {available ? "Available" : "Offline"}
              </span>

              <button
                onClick={handleToggle}
                disabled={toggleLoading}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition 
                  ${available ? "bg-green-500" : "bg-gray-600"} 
                  ${toggleLoading ? "opacity-50 cursor-not-allowed" : ""}
                `}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${available ? "translate-x-6" : "translate-x-0"
                    }`}
                />
              </button>
            </div>

            <button
              onClick={() => setOpenProfilePanel(true)}
              className="flex items-center gap-2 hover:text-orange-400 transition"
            >
              <div className="w-8 h-8 rounded-full bg-orange-400 flex items-center justify-center text-gray-900 font-bold text-sm">
                {user.name.charAt(0)}
              </div>

              <span className="hidden md:block text-sm font-medium">
                {user.name}
              </span>
            </button>

          </div>
        </div>
      </header>

      {openProfilePanel && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setOpenProfilePanel(false)}
          />

          <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-gray-900 text-white z-50 shadow-xl p-5 flex flex-col animate-slideIn">

            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-semibold">Menu</h2>
              <button onClick={() => setOpenProfilePanel(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="bg-gray-800 p-4 rounded-xl mb-4">
              <p className="text-lg font-semibold">{user.name}</p>
              <p className="text-sm text-gray-400 break-words">
                {user.address}
              </p>
            </div>

            <div className="flex flex-col gap-2 text-sm">
              {config.menu.map((item, index) => (
                <Link
                  key={index}
                  to={item.path}
                  onClick={() => setOpenProfilePanel(false)}
                  className="px-3 py-2 rounded-lg hover:bg-orange-500/10 hover:text-orange-400"
                >
                  {item.name}
                </Link>
              ))}
            </div>

            <button
              onClick={handleLogout}
              className="mt-auto bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg"
            >
              Logout
            </button>
          </div>
        </>
      )}

      <style>
        {`
        .animate-slideIn {
          animation: slideIn 0.25s ease forwards;
        }
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
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