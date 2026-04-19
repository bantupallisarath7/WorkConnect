import React, { useEffect, useState } from "react";
import {
  Calendar,
  MapPin,
  IndianRupee,
  X,
  Users, CheckCircle
} from "lucide-react";
import BookingTimeline from "./BookingTimeline";
import axios from "axios";
import formatError from "../utils/formatError";
import SimpleLoader from "../components/SimpleLoader";
import { useNavigate } from "react-router-dom";

// FINAL STATUS COLORS (CONSISTENT)
const getStatusStyle = (status) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-700";
    case "accepted":
      return "bg-blue-100 text-blue-700";
    case "inProgress":
      return "bg-orange-100 text-orange-700";
    case "completed":
      return "bg-green-100 text-green-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

const BookingDetails = ({ booking, onClose,refreshBookings }) => {
  const [otp, setOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(true)
  const [error, setError] = useState(null);
  const [manualComplete, setManualComplete] = useState(false);
  const [reviewBooking, setReviewBooking] = useState(null);

  const [otpLoading, setOtpLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);

  if (!booking) return null;

  const getOtp = async () => {
    setOtpLoading(true);
    setError("");
    try {
      const res = await axios.get(
        `https://workconnect-0306.onrender.com/api/booking/get-otp/${booking._id}`,
        { withCredentials: true }
      );
      setOtp(res.data.otp);
      setOtpVerified(res.data.otpVerified);
    } catch (error) {
      setError(formatError(error, "Error fetching otp"));
      setOtp("");
    } finally {
      setOtpLoading(false);
    }
  }

  useEffect(() => {
    if (booking.status === "accepted") {
      getOtp();
    }
  }, [booking]);

  const isAfter8Hours = (bookingDate) => {
    if (!bookingDate) return false;

    const start = new Date(bookingDate).getTime();
    const now = Date.now();

    return (now - start) >= 8 * 60 * 60 * 1000;
  };

  const handleManualComplete = async () => {
    try {
      setActionLoading(true);

      await axios.post(
        `https://workconnect-0306.onrender.com/api/booking/complete/${booking._id}`,
        { manual: true },
        { withCredentials: true }
      );

      setManualComplete(true);
      setReviewBooking(booking);
    } catch (error) {
      setError(formatError(error, "Failed to complete booking"));
    } finally {
      setActionLoading(false);
    }
  };


  const handleCancelBooking = async () => {
    try {
      setCancelLoading(true);

      await axios.post(
        `https://workconnect-0306.onrender.com/api/booking/cancel/${booking._id}`,
        {},
        { withCredentials: true }
      );
      setCancelSuccess(true);
    } catch (error) {
      setError(formatError(error, "Failed to cancel booking"));
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">

      {/* MODAL */}
      <div className="w-full max-w-sm sm:max-w-md md:max-w-xl lg:max-w-2xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col">

        {/* HEADER */}
        <div className="px-4 sm:px-5 py-3 sm:py-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Booking Details
          </h2>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="px-3 sm:px-5 py-4 sm:py-5 space-y-4 sm:space-y-5 overflow-y-auto bg-gray-50">

          {/* OTP SECTION (ONLY FOR ACCEPTED) */}
          {booking.status === "accepted" && (
            <div className="relative bg-white rounded-3xl p-5 shadow-md overflow-hidden">

              {/* LOADER STATE */}
              {otpLoading ? (
                <div className="flex justify-center items-center py-10">
                  <SimpleLoader text="Loading OTP..." />
                </div>
              ) : otp ? (
                <>
                  {/* HEADER */}
                  <div className="text-center mb-4">
                    <p className="text-sm font-semibold text-gray-900">
                      Share this OTP with connector
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Required to verify and complete your booking
                    </p>
                  </div>

                  {/* OTP BOX */}
                  <div className="flex justify-center gap-3 mb-4">
                    {otp.split("").map((digit, i) => (
                      <div
                        key={i}
                        className="w-10 h-12 sm:w-12 sm:h-14 md:w-14 md:h-16 flex items-center justify-center 
                      bg-gray-900 text-white rounded-xl text-xl sm:text-2xl font-bold 
                      shadow-md tracking-widest"
                      >
                        {digit}
                      </div>
                    ))}
                  </div>

                  {/* FOOT NOTE */}
                  <p className="text-[11px] text-gray-400 text-center mt-3">
                    Do not share this code with anyone else
                  </p>
                </>
              ) : (
                <p className="text-sm text-gray-500 text-center py-6">
                  OTP not available
                </p>
              )}

            </div>
          )}

          {/* MAIN INFO */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100">
            <div className="flex justify-between items-start gap-3">

              {/* LEFT CONTENT */}
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 break-words leading-snug">
                  {booking.partnerName}
                </h2>

                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4 text-xs text-gray-500 mt-2 break-words">

                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {new Date(booking.bookingDate).toLocaleDateString()}
                  </span>

                  <span className="flex items-center gap-1 truncate">
                    <MapPin size={12} />
                    <span className="truncate">
                      {booking.address?.addressLine || "N/A"}
                    </span>
                  </span>

                </div>
              </div>

              {/* STATUS (ALWAYS RIGHT) */}
              <div className="flex-shrink-0">
                <span
                  className={`text-xs px-3 py-1 rounded-full font-medium capitalize flex items-center gap-1 whitespace-nowrap ${getStatusStyle(
                    booking.status
                  )}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
                  {booking.status === "inProgress" ? "In Progress" : booking.status}
                </span>
              </div>

            </div>
          </div>

          <BookingTimeline
            status={booking.status}
            bookingDate={booking.workDate}
            manualComplete={manualComplete}
          />

          {/* WORKERS */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">
              Workers Assigned
            </h3>

            {booking.workers?.length > 0 ? (
              <div className="space-y-3">
                {booking.workers.map((worker, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900 capitalize">
                        {worker.skill}
                      </p>
                      <p className="text-xs text-gray-500">
                        ₹{worker.wage}/day
                      </p>
                    </div>

                    <div className="flex items-center gap-1 text-xs bg-gray-200 px-2 py-0.5 rounded-full text-gray-700">
                      <Users size={12} />
                      {worker.count}
                    </div>
                  </div>
                ))}
              </div>
            ) : booking.workerDetails ? (
              // HANDLE SINGLE WORKER
              <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                <div>
                  <p className="text-sm font-medium text-gray-900 capitalize">
                    {booking.workerDetails.skill}
                  </p>
                  <p className="text-xs text-gray-500">
                    ₹{booking.workerDetails.wage}/day
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs bg-gray-200 px-2 py-0.5 rounded-full text-gray-700">
                  <Users size={12} />
                  1
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center">
                No workers assigned
              </p>
            )}
          </div>

          {/* ADDITIONAL DETAILS */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">
              Additional Details
            </h3>

            {/*  Meals */}
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-gray-600">Meals Provided</span>
              <span
                className={`text-xs font-medium px-2.5 py-1 rounded-full ${booking.mealsProvided
                  ? "bg-green-100 text-green-600"
                  : "bg-gray-100 text-gray-500"
                  }`}
              >
                {booking.mealsProvided ? "Yes" : "No"}
              </span>
            </div>

            {/* Notes */}
            <div>
              <p className="text-sm text-gray-600 mb-1">Site Instructions</p>

              {booking.notes ? (
                <div className="text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-xl p-3">
                  {booking.notes}
                </div>
              ) : (
                <p className="text-xs text-gray-400">No instructions provided</p>
              )}
            </div>
          </div>

          {/* PAYMENT */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-2xl p-4 sm:p-5 shadow-sm">
            <h3 className="text-sm font-semibold mb-4 opacity-80">
              Payment Summary
            </h3>

            <div className="flex justify-between text-sm mb-2">
              <span>Labour Cost</span>
              <span className="flex items-center font-semibold">
                <IndianRupee size={14} className="mr-1" />
                {booking.labourCost || 0}
              </span>
            </div>

            <div className="flex justify-between text-sm mb-2">
              <span>Commission</span>
              <span className="flex items-center font-semibold">
                <IndianRupee size={14} className="mr-1" />
                {booking.commission || 0}
              </span>
            </div>

            <div className="flex justify-between text-sm mb-2">
              <span>Travel</span>
              <span className="flex items-center font-semibold">
                <IndianRupee size={14} className="mr-1" />
                {booking.travelCharges || 0}
              </span>
            </div>

            <div className="border-t border-white/20 mt-4 pt-4 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="flex items-center">
                <IndianRupee size={16} className="mr-1" />
                {booking.totalAmount || 0}
              </span>
            </div>
          </div>

          {booking.status === "inProgress" &&
            !manualComplete && !isAfter8Hours(booking.workDate) && (
              <>

                <button
                  onClick={handleManualComplete}
                  disabled={actionLoading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl font-medium"
                >
                  {actionLoading ? "updating..." : "Mark Work as Completed"}
                </button>

                <p className="text-xs text-gray-400 text-center">
                  Will auto-complete after 8 hours
                </p>

              </>
            )}

          {["pending", "accepted"].includes(booking.status) && (
            <div className="mt-4">
              <button
                onClick={() => setShowCancelConfirm(true)}
                disabled={cancelLoading}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl font-medium transition"
              >
                {cancelLoading ? "Cancelling..." : "Cancel Booking"}
              </button>

              <p className="text-xs text-gray-400 text-center mt-1">
                You can cancel only before work starts
              </p>
            </div>
          )}
        </div>
      </div>

      {showCancelConfirm && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-[90%] sm:max-w-sm rounded-2xl shadow-xl p-5">

            <h2 className="text-lg font-semibold text-gray-900">
              Cancel Booking?
            </h2>

            <p className="text-sm text-gray-500 mt-2">
              Are you sure you want to cancel this booking?
            </p>

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium"
              >
                No
              </button>

              <button
                onClick={async () => {
                  setShowCancelConfirm(false);
                  await handleCancelBooking();
                }}
                disabled={cancelLoading}
                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium"
              >
                {cancelLoading ? "Cancelling..." : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
      {cancelSuccess && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">

          {/* Card */}
          <div className="w-full max-w-[90%] sm:max-w-sm bg-white rounded-2xl p-6 text-center shadow-2xl animate-[fadeIn_0.25s_ease]">

            <CheckCircle
              className="text-green-500 mx-auto mb-3"
              size={50}
            />

            <h2 className="text-lg font-semibold mb-2">
              Booking Cancelled
            </h2>

            <p className="text-sm text-gray-500 mb-5">
              Your booking has been cancelled successfully.
            </p>

            <button
              onClick={() => {
                setCancelSuccess(false);
                refreshBookings?.()
                onClose?.(); 
              }}
              className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {reviewBooking && (
        <ReviewModal
          booking={reviewBooking}
          onClose={() => setReviewBooking(null)}
        />
      )}
    </div>
  );
};

export default BookingDetails;