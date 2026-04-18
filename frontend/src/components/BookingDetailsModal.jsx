import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  MapPin,
  Calendar,
  Phone,
  Users,
  IndianRupee,
  X,
  CheckCircle,
} from "lucide-react";

import formatError from "../utils/formatError";
import useLockScroll from "../utils/useLockScroll";

const BookingDetailsModal = ({ booking, onClose, onUpdate }) => {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [otpModal, setOtpModal] = useState(false);

  const [loading, setLoading] = useState({
    accept: false,
    cancel: false,
    verify: false,
  });

  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  useLockScroll(true);

  useEffect(() => {
    if (otpModal) {
      setTimeout(() => document.getElementById("otp-0")?.focus(), 100);
    }
  }, [otpModal]);

  const formatAddress = (addr) =>
    [addr?.addressLine, addr?.city, addr?.state, addr?.pincode]
      .filter(Boolean)
      .join(", ");

  const getWorkers = () => {
    if (booking.workers?.length) return booking.workers;
    if (booking.workerDetails) return [booking.workerDetails];
    return [];
  };

  // ---------------- ACCEPT ----------------
  const handleAccept = async () => {
    setLoading((p) => ({ ...p, accept: true }));
    try {
      await axios.post(
        `https://workconnect-0306.onrender.com/api/booking/accept/${booking._id}`,
        {},
        { withCredentials: true }
      );

      onUpdate?.(booking._id, "accepted");

      setSuccess({
        title: "Booking Accepted",
        message: "You accepted this booking.",
      });
    } catch (err) {
      setError(formatError(err, "Failed to accept"));
    } finally {
      setLoading((p) => ({ ...p, accept: false }));
    }
  };

  // ---------------- CANCEL ----------------
  const handleCancel = async () => {
    setLoading((p) => ({ ...p, cancel: true }));
    try {
      await axios.post(
        `https://workconnect-0306.onrender.com/api/booking/cancel/${booking._id}`,
        {},
        { withCredentials: true }
      );

      onUpdate?.(booking._id, "cancelled");

      setSuccess({
        title: "Cancelled",
        message: "Booking cancelled successfully",
      });
    } catch (err) {
      setError(formatError(err, "Failed to cancel"));
    } finally {
      setLoading((p) => ({ ...p, cancel: false }));
    }
  };

  //  OTP CHANGE
  const handleOtpChange = (val, i) => {
    if (!/^[0-9]?$/.test(val)) return;

    const newOtp = [...otp];
    newOtp[i] = val;
    setOtp(newOtp);

    if (val && i < 3) document.getElementById(`otp-${i + 1}`)?.focus();
  };

  // VERIFY
  const handleVerify = async () => {
    const finalOtp = otp.join("");

    if (finalOtp.length !== 4) {
      setOtpError("Enter 4 digit OTP");
      return;
    }

    setLoading((p) => ({ ...p, verify: true }));
    try {
      await axios.post(
        `https://workconnect-0306.onrender.com/api/booking/verify/${booking._id}`,
        { otp: finalOtp },
        { withCredentials: true }
      );

      onUpdate?.(booking._id, "completed");

      setOtpModal(false);
      setSuccess({
        title: "Verified",
        message: "Booking completed successfully",
      });
    } catch (err) {
      setOtpError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading((p) => ({ ...p, verify: false }));
    }
  };

  return (
    <>
      {/* BACKDROP */}
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
        <div className="bg-white w-full max-w-xl rounded-2xl p-5 relative">

          {/* CLOSE */}
          <button onClick={onClose} className="absolute right-3 top-3">
            <X />
          </button>

          {/* HEADER */}
          <h2 className="text-lg font-semibold">{booking.partnerName}</h2>

          <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
            <Phone size={12} /> {booking.contactPhone}
          </p>

          <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
            <MapPin size={12} /> {formatAddress(booking.address)}
          </p>

          {/* WORKERS */}
          <div className="mt-4 space-y-2">
            {getWorkers().map((w, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="flex items-center gap-1">
                  <Users size={12} /> {w.skill}
                </span>
                <span>₹{w.wage}</span>
              </div>
            ))}
          </div>

          {/* ACTIONS */}
          <div className="flex gap-2 mt-5">

            {booking.status === "pending" && (
              <>
                <button
                  onClick={handleAccept}
                  disabled={loading.accept}
                  className="flex-1 bg-green-500 text-white py-2 rounded-lg"
                >
                  {loading.accept ? "Accepting..." : "Accept"}
                </button>

                <button
                  onClick={handleCancel}
                  disabled={loading.cancel}
                  className="flex-1 bg-red-500 text-white py-2 rounded-lg"
                >
                  Cancel
                </button>
              </>
            )}

            {booking.status === "accepted" && (
              <button
                onClick={() => setOtpModal(true)}
                className="w-full bg-orange-500 text-white py-2 rounded-lg"
              >
                Verify OTP
              </button>
            )}
          </div>
        </div>
      </div>

      {/* OTP MODAL */}
      {otpModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-xl">

            <h3 className="font-semibold text-center">Enter OTP</h3>

            <div className="flex gap-2 mt-4">
              {otp.map((d, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  value={d}
                  onChange={(e) => handleOtpChange(e.target.value, i)}
                  maxLength={1}
                  className="w-10 h-10 border text-center"
                />
              ))}
            </div>

            {otpError && (
              <p className="text-red-500 text-xs mt-2">{otpError}</p>
            )}

            <button
              onClick={handleVerify}
              disabled={loading.verify}
              className="w-full mt-4 bg-orange-500 text-white py-2 rounded-lg"
            >
              {loading.verify ? "Verifying..." : "Verify"}
            </button>
          </div>
        </div>
      )}

      {/* SUCCESS MODAL */}
      {success && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl text-center">
            <CheckCircle className="mx-auto text-green-500" size={40} />
            <h3 className="font-semibold mt-2">{success.title}</h3>
            <p className="text-sm text-gray-500">{success.message}</p>

            <button
              onClick={() => setSuccess(null)}
              className="mt-4 bg-orange-500 text-white px-4 py-2 rounded-lg"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default BookingDetailsModal;