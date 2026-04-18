return (
  <BrowserRouter>
    <Routes>
      {/* Public routes (only if not logged in) */}
      {!currentUser && (
        <>
          <Route path="/" element={<LandingPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/connector/signup" element={<ConnectorSignup />} />
          <Route path="/connector/signin" element={<ConnectorSignin />} />
        </>
      )}

      {/* Protected routes (only if logged in) */}
      {currentUser && (
        <Route element={<UserLayout />}>
          <Route path="/search" element={<SearchPage />} />
          <Route path="/mybookings" element={<MyBookings />} />
          <Route path="/help" element={<Help />} />
          <Route path="/profile" element={<Profile />} />
          {/* Redirect any attempt to go back to "/" */}
          <Route path="/" element={<Navigate to="/search" />} />
          <Route path="/signin" element={<Navigate to="/search" />} />
          <Route path="/signup" element={<Navigate to="/search" />} />
          <Route path="/signout" element={<Navigate to="/search" />} />
          <Route path="/connector/signup" element={<Navigate to="/search" />} />
          <Route path="/connector/signin" element={<Navigate to="/search" />} />
        </Route>
      )}
    </Routes>
    <ToastContainer position="top-center" />
  </BrowserRouter>

    import React, { useState, useEffect, useMemo } from "react";
import { CheckCircle } from "lucide-react";
import {
  Phone,
  MapPin,
  Calendar,
  IndianRupee,
} from "lucide-react";
import axios from "axios";
import SimpleLoader from "../../components/SimpleLoader";
import formatError from "../../utils/formatError"; // make sure path is correct

const ManageBookings = () => {
  const [filter, setFilter] = useState("pending");
  const [bookings, setBookings] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [otpModal, setOtpModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  // FETCH BOOKINGS
  const fetchBookings = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await axios.get(
        `http://localhost:7265/api/booking/connector/all`,
        { withCredentials: true }
      );

      setBookings(res.data.bookings || []);
    } catch (error) {
      setError(formatError(error, "Failed to load bookings"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      setError(null);

      try {
        await axios.post(
          "http://localhost:7265/api/booking/auto-cancel-old",
          {},
          { withCredentials: true }
        );

        await fetchBookings();
      } catch (error) {
        setError(formatError(error, "Failed to initialize bookings"));
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  // FILTER BOOKINGS
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => b.status === filter);
  }, [bookings, filter]);

  // FORMAT ADDRESS
  const formatAddress = (addr) => {
    if (!addr) return "";
    return [
      addr.addressLine,
      addr.city,
      addr.state,
      addr.pincode,
    ]
      .filter(Boolean)
      .join(", ");
  };

  // ACCEPT
  const handleAccept = async (booking) => {
    try {
      await axios.post(
        `http://localhost:7265/api/booking/accept/${booking._id}`,
        {},
        { withCredentials: true }
      );

      setBookings((prev) =>
        prev.map((b) =>
          b._id === booking._id ? { ...b, status: "accepted" } : b
        )
      );
    } catch (error) {
      setError(formatError(error, "Failed to accept booking"));
    }
  };

  // ✅ CANCEL
  const handleCancel = async (booking) => {
    try {
      await axios.post(
        `http://localhost:7265/api/booking/cancel/${booking._id}`,
        {},
        { withCredentials: true }
      );

      setBookings((prev) =>
        prev.map((b) =>
          b._id === booking._id ? { ...b, status: "cancelled" } : b
        )
      );
    } catch (error) {
      setError(formatError(error, "Failed to cancel booking"));
    }
  };

  // ✅ OTP INPUT
  const handleOtpChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 3) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }

    if (!value && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  // ✅ VERIFY OTP
  const handleVerifyOtp = async () => {
    const finalOtp = otp.join("");

    if (finalOtp.length !== 4 || otp.includes("")) {
      setOtpError("Please enter a valid 4-digit OTP");
      return;
    }

    try {
      setOtpError("");

      await axios.post(
        `http://localhost:7265/api/booking/verify/${selectedBooking._id}`,
        { otp: finalOtp },
        { withCredentials: true }
      );

      setBookings((prev) =>
        prev.map((b) =>
          b._id === selectedBooking._id
            ? { ...b, status: "completed" }
            : b
        )
      );

      setOtpModal(false);
      setOtp(["", "", "", ""]);

      setTimeout(() => {
        setShowSuccess(true);
      }, 300);
    } catch (error) {
      setOtpError(
        error.response?.data?.message || "Invalid OTP"
      );
    }
  };

  useEffect(() => {
    if (otpModal) {
      setTimeout(() => {
        document.getElementById("otp-0")?.focus();
      }, 100);
    }
  }, [otpModal]);

  const statusStyles = {
    pending: "bg-yellow-100 text-yellow-700",
    accepted: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };

  return (
    <>
      <div className="p-4 md:p-6 space-y-6">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Manage Bookings
            </h1>
            <p className="text-sm text-gray-500">
              Handle your incoming bookings
            </p>
          </div>

          <div className="w-full sm:w-auto flex overflow-x-auto sm:overflow-visible items-center gap-2 bg-gray-100 p-1 rounded-full scrollbar-hide">
            {["pending", "accepted", "completed", "cancelled"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`whitespace-nowrap px-4 py-1 text-sm rounded-full transition ${filter === f
                    ? "bg-white shadow text-orange-500 font-medium"
                    : "text-gray-600"
                  }`}
              >
                {f === "pending"
                  ? "New"
                  : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* ✅ LOADING */}
        {loading && (
          <div className="min-h-[60vh] flex justify-center items-center">
            <SimpleLoader text="Loading bookings..." />
          </div>
        )}

        {/* ✅ ERROR */}
        {!loading && error && (
          <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">

            <h3 className="text-lg font-semibold">
              {error.type === "network" && "No Internet Connection"}
              {error.type === "server" && "Server Error"}
              {error.type === "auth" && "Access Denied"}
              {error.type === "not_found" && "Not Found"}
              {error.type === "general" && "Something went wrong"}
            </h3>

            <p className="text-sm text-gray-500 mt-2">
              {error.message}
            </p>

            <button
              onClick={fetchBookings}
              className="mt-5 px-5 py-2 bg-red-500 text-white rounded-lg"
            >
              Retry
            </button>
          </div>
        )}

        {/* ✅ DATA */}
        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {filteredBookings.map((b) => (
                <div key={b._id} className="bg-white rounded-2xl border p-5">
                  {/* SAME UI — untouched */}
                  {/* (keeping your full card exactly same) */}
                  ...
                </div>
              ))}
            </div>

            {/* EMPTY */}
            {filteredBookings.length === 0 && (
              <div className="flex flex-col items-center mt-20 text-center">
                <div className="bg-orange-50 p-5 rounded-full">
                  <Calendar size={32} className="text-orange-500" />
                </div>

                <h3 className="mt-5 font-semibold text-lg">
                  No bookings found
                </h3>

                <p className="mt-2 text-sm text-gray-500 max-w-sm">
                  There are no bookings available in this section right now.
                </p>

                <button
                  onClick={fetchBookings}
                  className="mt-6 px-6 py-2 bg-orange-500 text-white rounded-lg"
                >
                  Refresh
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* OTP + SUCCESS MODALS (UNCHANGED) */}
      {/* keep your existing modal code exactly same */}

    </>
  );
};

export default ManageBookings;


  );

import React, { useState, useEffect, useMemo } from "react";
import { CheckCircle } from "lucide-react";
import {
  Phone,
  MapPin,
  Calendar,
  IndianRupee,
} from "lucide-react";
import axios from "axios";

const ManageBookings = () => {
  const [filter, setFilter] = useState("pending");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [otpModal, setOtpModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);


  // ✅ FETCH BOOKINGS
  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `http://localhost:7265/api/booking/connector/all`,
        { withCredentials: true }
      );

      setBookings(res.data.bookings || []);
    } catch (err) {
      console.error(err);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        // ✅ First cancel old bookings
        await axios.post(
          "http://localhost:7265/api/booking/auto-cancel-old",
          {},
          { withCredentials: true }
        );

        // ✅ Then fetch updated bookings
        await fetchBookings();
      } catch (err) {
        console.error(err);
      }
    };

    init();
  }, []);

  // ✅ FILTER BOOKINGS
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => b.status === filter);
  }, [bookings, filter]);

  // ✅ FORMAT ADDRESS
  const formatAddress = (addr) => {
    if (!addr) return "";
    return [
      addr.addressLine,
      addr.city,
      addr.state,
      addr.pincode,
    ]
      .filter(Boolean)
      .join(", ");
  };

  // ✅ ACCEPT
  const handleAccept = async (booking) => {
    try {
      await axios.post(
        `http://localhost:7265/api/booking/accept/${booking._id}`,
        {},
        { withCredentials: true }
      );

      setBookings((prev) =>
        prev.map((b) =>
          b._id === booking._id ? { ...b, status: "accepted" } : b
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ CANCEL
  const handleCancel = async (booking) => {
    try {
      await axios.post(
        `http://localhost:7265/api/booking/cancel/${booking._id}`,
        {},
        { withCredentials: true }
      );

      setBookings((prev) =>
        prev.map((b) =>
          b._id === booking._id ? { ...b, status: "cancelled" } : b
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ OTP INPUT
  const handleOtpChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 3) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }

    // 👇 handle backspace
    if (!value && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  // ✅ VERIFY OTP
  const handleVerifyOtp = async () => {
    const finalOtp = otp.join("");

    if (finalOtp.length !== 4 || otp.includes("")) {
      setOtpError("Please enter a valid 4-digit OTP");
      return;
    }

    try {
      setOtpError("");

      await axios.post(
        `http://localhost:7265/api/booking/verify/${selectedBooking._id}`,
        { otp: finalOtp },
        { withCredentials: true }
      );

      setBookings((prev) =>
        prev.map((b) =>
          b._id === selectedBooking._id
            ? { ...b, status: "completed" }
            : b
        )
      );

      setOtpModal(false);
      setOtp(["", "", "", ""]);
      setTimeout(() => {
        setShowSuccess(true);
      }, 300);
    } catch (err) {
      console.error(err);
      setOtpError(err.response?.data?.message || "Invalid OTP");
    }
  };

  useEffect(() => {
    if (otpModal) {
      setTimeout(() => {
        document.getElementById("otp-0")?.focus();
      }, 100);
    }
  }, [otpModal]);

  const statusStyles = {
    pending: "bg-yellow-100 text-yellow-700",
    accepted: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };

  return (
    <>
      <div className="p-4 md:p-6 space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Manage Bookings
            </h1>
            <p className="text-sm text-gray-500">
              Handle your incoming bookings
            </p>
          </div>

          {/* FILTER (UNCHANGED as requested) */}
          <div className="w-full sm:w-auto flex overflow-x-auto sm:overflow-visible items-center gap-2 bg-gray-100 p-1 rounded-full scrollbar-hide">
            {["pending", "accepted", "completed", "cancelled"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`whitespace-nowrap px-4 py-1 text-sm rounded-full transition ${filter === f
                  ? "bg-white shadow text-orange-500 font-medium"
                  : "text-gray-600"
                  }`}
              >
                {f === "pending"
                  ? "New"
                  : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>


        {/* LOADING */}
        {loading && (
          <p className="text-center text-gray-500 mt-10">
            Loading bookings...
          </p>
        )}

        {/* BOOKINGS */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredBookings.map((b) => (
              <div
                key={b._id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-[2px] transition-all duration-300 p-5 flex flex-col justify-between"
              >
                {/* HEADER */}
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="font-semibold text-gray-800 text-base">
                      {b.contactName}
                    </h2>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <Phone size={12} /> {b.contactPhone}
                    </p>
                  </div>

                  <span
                    className={`text-[11px] px-3 py-1 rounded-full font-medium capitalize flex items-center gap-1 w-fit ${statusStyles[b.status] || "bg-gray-100 text-gray-600"
                      }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                    {b.status}
                  </span>
                </div>

                {/* WORKERS */}
                <div className="text-sm text-gray-700 space-y-1 border-t pt-3 mt-3">
                  {b.workers.map((w, i) => (
                    <p key={i} className="flex justify-between">
                      <span>
                        {w.skill} × {w.count}
                      </span>
                      <span className="text-gray-500">
                        ₹{w.wage}
                      </span>
                    </p>
                  ))}
                </div>

                {/* ADDRESS + DATE */}
                <div className="text-xs text-gray-500 space-y-1 border-t pt-3 mt-3">
                  <p className="flex gap-2">
                    <MapPin size={12} /> {formatAddress(b.address)}
                  </p>
                  <p className="flex gap-2">
                    <Calendar size={12} />   {new Date(b.bookingDate).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric"
                    })}

                  </p>
                </div>

                {/* TOTAL BREAKDOWN */}
                <div className="border-t pt-3 mt-3 space-y-1">

                  {/* Travel Charges */}
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Workers cost</span>
                    <span>₹{b.labourCost || 0}</span>
                  </div>

                  {/* Commission */}
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Commission</span>
                    <span>₹{b.commission || 0}</span>
                  </div>
                  {/* Travel Charges */}
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Travel Charges</span>
                    <span>₹{b.travelCharges || 0}</span>
                  </div>
                  {/* Total */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-900 font-semibold">Total</span>
                    <span className="flex items-center gap-1 font-semibold text-gray-800">
                      <IndianRupee size={14} /> {b.totalAmount}
                    </span>
                  </div>

                </div>

                {/* ACTIONS */}
                {b.status === "pending" && (
                  <div className="flex gap-2 pt-3">
                    <button
                      onClick={() => handleAccept(b)}
                      className="flex-1 h-10 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-lg transition"
                    >
                      Accept
                    </button>

                    <button
                      onClick={() => handleCancel(b)}
                      className="flex-1 h-10 bg-red-100 hover:bg-red-200 text-red-600 text-sm font-semibold rounded-lg transition"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {b.status === "accepted" && (
                  <div className="flex gap-2 pt-3">
                    <button
                      onClick={() => {
                        setSelectedBooking(b);
                        setOtpModal(true);
                        setOtp(["", "", "", ""]);
                        setOtpError("");
                      }}
                      className="flex-1 h-10 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition"
                    >
                      Verify
                    </button>

                    <button
                      onClick={() => handleCancel(b)}
                      className="flex-1 h-10 bg-red-100 hover:bg-red-200 text-red-600 text-sm font-semibold rounded-lg transition"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {b.status === "completed" && (
                  <div className="pt-3">
                    <div className="flex items-center justify-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl py-2.5 px-3 text-sm font-medium shadow-sm">

                      {/* ICON */}
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-green-500 text-white text-xs">
                        ✓
                      </span>

                      {/* TEXT */}
                      <span>Booking Completed Successfully</span>
                    </div>
                  </div>
                )}

                {b.status === "cancelled" && (
                  <div className="pt-3">
                    <div className="flex items-center justify-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl py-2.5 px-3 text-sm font-medium shadow-sm">

                      {/* ICON */}
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-xs">
                        ✕
                      </span>

                      {/* TEXT */}
                      <span>Booking Cancelled</span>
                    </div>
                  </div>
                )}
              </div>
            ))}


          </div>
        )}

        {/* EMPTY */}
        {!loading && filteredBookings.length === 0 && (
          <div className="flex flex-col items-center mt-20 text-center">
            <div className="bg-orange-50 p-5 rounded-full">
              <Calendar size={32} className="text-orange-500" />
            </div>

            <h3 className="mt-5 font-semibold text-lg">
              No bookings found
            </h3>

            <p className="mt-2 text-sm text-gray-500 max-w-sm">
              There are no bookings available in this section right now.
            </p>

            <button
              onClick={fetchBookings}
              className="mt-6 px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg"
            >
              Refresh
            </button>
          </div>
        )}
      </div>

      {/* OTP MODAL */}
      {otpModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white p-6 rounded-2xl shadow-xl text-center animate-[fadeIn_0.2s_ease]">
            <h2 className="text-xl font-semibold">
              Verify OTP
            </h2>

            <p className="text-sm text-gray-500">
              Enter OTP from customer
            </p>

            <div className="flex justify-center gap-3 mt-6">
              {otp.map((d, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  value={d}
                  onChange={(e) =>
                    handleOtpChange(e.target.value, i)
                  }
                  maxLength={1}
                  className="w-12 h-12 text-center border border-gray-300 rounded-lg text-lg font-semibold focus:ring-2 focus:ring-orange-400 outline-none"
                />
              ))}
            </div>

            {otpError && (
              <p className="text-red-500 text-xs mt-3">
                {otpError}
              </p>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleVerifyOtp}
                className="flex-1 h-11 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition"
              >
                Verify
              </button>

              <button
                onClick={() => {
                  setOtpModal(false);
                  setOtp(["", "", "", ""]);
                  setOtpError("");
                }}
                className="flex-1 h-11 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">

          {/* Card */}
          <div className="
            w-full 
            max-w-[90%] 
            sm:max-w-sm 
            bg-white 
            rounded-2xl 
            p-6 
            text-center 
            shadow-2xl
            animate-[fadeIn_0.25s_ease]
          ">

            <CheckCircle
              className="text-green-500 mx-auto mb-3"
              size={50}
            />

            <h2 className="text-lg font-semibold mb-2">
              Verification Successful
            </h2>

            <p className="text-sm text-gray-500 mb-5">
              The work has been successfully verified. The booking will be marked as fully completed after the scheduled duration.
            </p>

            <button
              onClick={() => {
                setShowSuccess(false);
              }}
              className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ManageBookings;