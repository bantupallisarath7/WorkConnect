import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { CheckCircle, AlertTriangle, GlobeOff, ShieldX, SearchX, ClipboardList } from "lucide-react";
import { Phone, MapPin, Calendar, IndianRupee, Users } from "lucide-react";
import axios from "axios";
import SimpleLoader from "../../components/SimpleLoader";
import formatError from "../../utils/formatError.js";
import useLockScroll from "../../utils/useLockScroll.js";
import { useSelector } from "react-redux";

const ManageBookings = () => {

  const location = useLocation();
  const [filter, setFilter] = useState(location.state?.filter || "pending");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [otpModal, setOtpModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [error, setError] = useState(null);

  const { currentUser } = useSelector((state) => state.auth);

  const [successModal, setSuccessModal] = useState({
    show: false,
    title: "",
    message: "",
  });

  const [confirmCancel, setConfirmCancel] = useState({
    show: false,
    booking: null,
  });
  const [actionLoading, setActionLoading] = useState({
    accept: null,
    cancel: null,
    verify: false,
  });



  useLockScroll(successModal.show);
  useLockScroll(otpModal);
  useLockScroll(confirmCancel.show);



  const buttonStyles = {
    network: "bg-red-500 hover:bg-red-600",
    server: "bg-orange-500 hover:bg-orange-600",
    auth: "bg-yellow-500 hover:bg-yellow-600",
    not_found: "bg-blue-500 hover:bg-blue-600",
    general: "bg-gray-500 hover:bg-gray-600",
  };

  useEffect(() => {
    if (location.state?.filter) {
      setFilter(location.state.filter);
    }
  }, [location.state]);

  const bookingsConfig = {
    connector: {
      title: "Manage Bookings",
      subtitle: "Handle bookings from your customers",
    },

    worker: {
      title: "My Bookings",
      subtitle: "Track and manage your assigned work",
    },
  };

  //  SAFE ACCESS (important)
  const config = bookingsConfig[currentUser?.role]
  // FETCH BOOKINGS
  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(
        `http://localhost:7265/api/booking/partner/all`,
        { withCredentials: true }
      );

      setBookings(res.data.bookings || []);
    } catch (error) {
      setError(formatError(error, "Failed to load bookings"));
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
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
    setError(null);
    setActionLoading((prev) => ({ ...prev, accept: booking._id }));
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
      setSuccessModal({
        show: true,
        title: "Booking Accepted",
        message: "You have successfully accepted the booking.",
      });
    } catch (error) {
      setError(formatError(error, "Failed to accept booking"));
    } finally {
      setActionLoading((prev) => ({ ...prev, accept: null }));
    }
  };

  // ✅ CANCEL
  const handleCancel = async (booking) => {
    setError(null);
    setActionLoading((prev) => ({ ...prev, cancel: booking._id }));
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
      setSuccessModal({
        show: true,
        title: "Booking Cancelled",
        message: "The booking has been cancelled successfully.",
      });
    } catch (error) {
      setError(formatError(error, "Failed to cancel booking"));
    } finally {
      setActionLoading((prev) => ({ ...prev, cancel: null }));
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

    if (otp.includes("") || finalOtp.length !== 4) {
      setOtpError("Please enter a valid 4-digit OTP");
      return;
    }
    setActionLoading((prev) => ({ ...prev, verify: true }));
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
      setSelectedBooking(null);
      setOtp(["", "", "", ""]);

      setSuccessModal({
        show: true,
        title: "Verification Successful",
        message:
          "The work has been successfully verified. The booking will be marked as fully completed after the scheduled duration.",
      });
    } catch (error) {
      setOtpError(error.response?.data?.message || "Invalid OTP");
    } finally {
      setActionLoading((prev) => ({ ...prev, verify: false }));
    }
  };

  useEffect(() => {
    if (otpModal) {
      setTimeout(() => {
        document.getElementById("otp-0")?.focus();
      }, 100);
    }
  }, [otpModal]);

  const getWorkersData = (booking) => {
    // Connector flow (multiple workers)
    if (booking.workers?.length > 0) {
      return booking.workers.map((w) => ({
        skill: w.skill,
        count: w.count,
        wage: w.wage,
      }));
    }

    // Worker flow (single worker)
    if (booking.workerDetails?.skill) {
      return [
        {
          skill: booking.workerDetails.skill,
          count: 1,
          wage: booking.workerDetails.wage,
        },
      ];
    }

    return [];
  };

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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {config.title}
            </h1>
            <p className="text-sm text-gray-500">
              {config.subtitle}
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
          <div className="min-h-[60vh] flex justify-center items-center py-16">
            <SimpleLoader text="Loading bookings..." />
          </div>
        )}

        {!loading && error && (
          <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">

            {/* ICON */}
            <div
              className={`p-5 rounded-full shadow-sm ${error.type === "network"
                ? "bg-red-100 text-red-500"
                : error.type === "server"
                  ? "bg-orange-100 text-orange-500"
                  : error.type === "auth"
                    ? "bg-yellow-100 text-yellow-600"
                    : error.type === "not_found"
                      ? "bg-blue-100 text-blue-500"
                      : "bg-gray-100 text-gray-600"
                }`}
            >
              {error.type === "network" && <GlobeOff size={36} />}
              {error.type === "server" && <AlertTriangle size={36} />}
              {error.type === "auth" && <ShieldX size={36} />}
              {error.type === "not_found" && <SearchX size={36} />}
              {error.type === "general" && <AlertTriangle size={36} />}
            </div>

            {/* TITLE */}
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              {error.type === "network" && "No Internet Connection"}
              {error.type === "server" && "Server Error"}
              {error.type === "auth" && "Access Denied"}
              {error.type === "not_found" && "Not Found"}
              {error.type === "general" && "Something went wrong"}
            </h3>

            {/* MESSAGE */}
            <p className="text-sm text-gray-500 mt-2 max-w-sm">
              {error.message}
            </p>

            {/* RETRY */}
            <button
              onClick={fetchBookings}
              className={`mt-5 px-5 py-2 text-white text-sm rounded-lg ${buttonStyles[error.type]}`}
            >
              Retry
            </button>
          </div>
        )}

        {/* BOOKINGS */}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredBookings.map((b) => (
              <div
                key={b._id}
                className="group relative bg-white rounded-2xl border border-gray-100 
                  shadow-sm hover:shadow-xl hover:-translate-y-[4px] 
                  transition-all duration-300 p-5 flex flex-col justify-between overflow-hidden"
              >

                {/* subtle gradient glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300 bg-gradient-to-br from-orange-50 via-transparent to-transparent pointer-events-none"></div>

                {/* HEADER */}
                <div className="flex justify-between items-start relative z-10">
                  <div>
                    <h2 className="font-semibold text-gray-900 text-base tracking-tight">
                      {b.contactName}
                    </h2>

                    <p className="text-xs text-gray-500 mt-1">
                      Booked by:{" "}
                      <span className="font-medium text-gray-700">
                        {b.customer?.name || b.contactName || "N/A"}
                      </span>
                    </p>

                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <Phone size={12} /> {b.contactPhone}
                    </p>
                  </div>

                  {/* STATUS */}
                  <span
                    className={`text-[11px] px-3 py-1 rounded-full font-medium capitalize flex items-center gap-1 shadow-sm backdrop-blur-sm
                    ${statusStyles[b.status] || "bg-gray-100 text-gray-600"}`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
                    {b.status}
                  </span>
                </div>

                {/* WORKERS */}
                <div className="text-sm text-gray-700 space-y-2 border-t pt-3 mt-3 relative z-10">
                  {getWorkersData(b).length > 0 ? (
                    getWorkersData(b).map((w, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between bg-gray-50 hover:bg-orange-50 px-3 py-2 rounded-lg transition"
                      >
                        {/* LEFT */}
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 capitalize">
                            {w.skill}
                          </span>

                          <span className="flex items-center gap-1 text-gray-500 text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                            <Users size={12} />
                            {w.count}
                          </span>
                        </div>

                        {/* RIGHT */}
                        <span className="text-gray-700 font-semibold">
                          ₹{w.wage}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-xs text-center">
                      No worker assigned
                    </p>
                  )}
                </div>

                {/* ADDRESS + DATE */}
                <div className="text-xs text-gray-500 space-y-2 border-t pt-3 mt-3 relative z-10">
                  <p className="flex gap-2 items-start">
                    <MapPin size={12} className="mt-[2px]" />
                    <span className="leading-tight">
                      {formatAddress(b.address)}
                    </span>
                  </p>

                  <p className="flex gap-2 items-center">
                    <Calendar size={12} />
                    {new Date(b.bookingDate).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>

                  {/* MEALS */}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Meals Provided</span>
                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${b.mealProvided
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-100 text-gray-500"
                        }`}
                    >
                      {b.mealProvided ? "Yes" : "No"}
                    </span>
                  </div>

                  {/* SITE INSTRUCTIONS */}
                  <div>
                    <p className="text-gray-500 mb-1">Site Instructions</p>

                    {b.notes ? (
                      <div className="text-gray-700 bg-gray-50 border border-gray-200 rounded-lg p-2 leading-snug">
                        {b.notes}
                      </div>
                    ) : (
                      <p className="text-[11px] text-gray-400">
                        No instructions provided
                      </p>
                    )}
                  </div>

                </div>


                {/* TOTAL BREAKDOWN */}
                <div className="border-t pt-3 mt-3 space-y-1 text-xs relative z-10">

                  <div className="flex justify-between text-gray-600">
                    <span>Workers cost</span>
                    <span className="font-medium">₹{b.labourCost || 0}</span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>Commission</span>
                    <span className="font-medium">₹{b.commission || 0}</span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>Travel Charges</span>
                    <span className="font-medium">₹{b.travelCharges || 0}</span>
                  </div>

                  {/* TOTAL */}
                  <div className="flex justify-between items-center pt-2 mt-2 border-t border-gray-200">
                    <span className="text-sm font-semibold text-gray-900">
                      Total
                    </span>

                    <span className="flex items-center gap-1 font-bold text-gray-900 text-sm">
                      <IndianRupee size={14} /> {b.totalAmount}
                    </span>
                  </div>
                </div>

                {/* ACTIONS */}
                {b.status === "pending" && (
                  <div className="flex gap-2 pt-3 relative z-10">
                    <button
                      onClick={() => handleAccept(b)}
                      disabled={actionLoading.accept === b._id}
                      className="flex-1 h-10 bg-green-500 text-white text-sm font-semibold rounded-lg transition disabled:opacity-60"
                    >
                      {actionLoading.accept === b._id ? "Accepting..." : "Accept"}
                    </button>

                    <button
                      onClick={() => setConfirmCancel({ show: true, booking: b })}
                      disabled={actionLoading.cancel === b._id}
                      className="flex-1 h-10 bg-red-50 text-red-600 text-sm font-semibold rounded-lg transition disabled:opacity-60"
                    >
                      {actionLoading.cancel === b._id ? "Cancelling..." : "Cancel"}
                    </button>
                  </div>
                )}

                {b.status === "accepted" && (
                  <div className="flex gap-2 pt-3 relative z-10">
                    <button
                      onClick={() => {
                        setSelectedBooking(b);
                        setOtpModal(true);
                        setOtp(["", "", "", ""]);
                        setOtpError("");
                      }}
                      className="flex-1 h-10 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition shadow-sm hover:shadow-md"
                    >
                      Verify
                    </button>

                    <button
                      onClick={() => setConfirmCancel({ show: true, booking: b })}
                      className="flex-1 h-10 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold rounded-lg transition"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {b.status === "completed" && (
                  <div className="pt-3 relative z-10">
                    <div className="flex items-center justify-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl py-2.5 px-3 text-sm font-medium shadow-sm">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-green-500 text-white text-xs">
                        ✓
                      </span>
                      <span>Booking Completed Successfully</span>
                    </div>
                  </div>
                )}

                {b.status === "cancelled" && (
                  <div className="pt-3 relative z-10">
                    <div className="flex items-center justify-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl py-2.5 px-3 text-sm font-medium shadow-sm">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-xs">
                        ✕
                      </span>
                      <span>Booking Cancelled</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* EMPTY */}
        {!loading && !error && filteredBookings.length === 0 && (
          <div className="min-h-[60vh] flex flex-col items-center mt-20 text-center">
            <div className="bg-orange-100 p-5 rounded-full shadow-sm">
              <ClipboardList size={32} className="text-orange-500" />
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
                disabled={actionLoading.verify}
                className="flex-1 h-11 bg-orange-500 text-white rounded-lg font-semibold transition disabled:opacity-60"
              >
                {actionLoading.verify ? "Verifying..." : "Verify"}
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

      {confirmCancel.show && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-xl text-center">

            <h2 className="text-lg font-semibold text-gray-900">
              Cancel Booking?
            </h2>

            <p className="text-sm text-gray-500 mt-2">
              Are you sure you want to cancel this booking?
            </p>

            <div className="flex gap-3 mt-6">
              {/* NO */}
              <button
                onClick={() => setConfirmCancel({ show: false, booking: null })}
                className="flex-1 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium"
              >
                No
              </button>

              {/* YES */}
              <button
                onClick={async () => {
                  const booking = confirmCancel.booking;
                  setConfirmCancel({ show: false, booking: null });

                  if (booking) {
                    await handleCancel(booking);
                  }
                }}
                disabled={actionLoading.cancel === confirmCancel.booking?._id}
                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium"
              >
                {actionLoading.cancel === confirmCancel.booking?._id
                  ? "Cancelling..."
                  : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {successModal.show && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">

          {/* Card */}
          <div className="w-full max-w-[90%] sm:max-w-sm bg-white rounded-2xl p-6 text-center shadow-2xl animate-[fadeIn_0.25s_ease]">

            <CheckCircle
              className="text-green-500 mx-auto mb-3"
              size={50}
            />

            <h2 className="text-lg font-semibold mb-2">
              {successModal.title}
            </h2>

            <p className="text-sm text-gray-500 mb-5">
              {successModal.message}
            </p>

            <button
              onClick={() => {
                setSuccessModal({
                  show: false,
                  title: "",
                  message: "",
                })
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