import React, { useEffect, useState } from "react";
import { Users, IndianRupee, MapPin, Calendar, GlobeOff, AlertTriangle, ShieldX, SearchX } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import SimpleLoader from "../../components/SimpleLoader";
import BookingDetails from "../../components/BookingDetails";
import formatError from "../../utils/formatError";
import useLockScroll from "../../utils/useLockScroll";
import ReviewModal from "../../components/ReviewModal";

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

const getAmountColor = (status) => {
    switch (status) {
        case "accepted":
            return "text-blue-600";
        case "inProgress":
            return "text-orange-600"
        case "completed":
            return "text-green-600";
        case "cancelled":
            return "text-red-500";
        case "pending":
            return "text-yellow-600";
        default:
            return "text-gray-900";
    }
};

const MyBookings = () => {
    const navigate = useNavigate();

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [error, setError] = useState(null);
    const [reviewBooking, setReviewBooking] = useState(null);
    const [filter, setFilter] = useState("all");


    useLockScroll(selectedBooking);
    useLockScroll(reviewBooking);


    const fetchBookings = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get(
                "http://localhost:7265/api/booking/all",
                { withCredentials: true }
            );
            setBookings(res.data.bookings || []);
        } catch (error) {
            setError(formatError(error, "Error fetching bookings"));
            setBookings([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const filteredBookings = bookings.filter((b) => {
        if (filter === "all") return true;

        const today = new Date().toDateString();
        return new Date(b.bookingDate).toDateString() === today;
    });


    const buttonStyles = {
        network: "bg-red-500 hover:bg-red-600",
        server: "bg-orange-500 hover:bg-orange-600",
        auth: "bg-yellow-500 hover:bg-yellow-600",
        not_found: "bg-blue-500 hover:bg-blue-600",
        general: "bg-gray-500 hover:bg-gray-600",
    };

    return (
        <div className="bg-white min-h-screen">

            <div className="max-w-6xl mx-auto px-4 py-5 flex items-center justify-between gap-3">

                {/* LEFT SIDE */}
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                        My Bookings
                    </h2>
                    <p className="text-sm text-gray-500 sm:block">
                        Your recent and past bookings
                    </p>
                </div>

                {/* RIGHT SIDE FILTER */}
                <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-full">
                    {["all", "today"].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 sm:px-4 py-1 text-xs sm:text-sm rounded-full transition ${filter === f
                                    ? "bg-white shadow text-orange-500 font-medium"
                                    : "text-gray-600"
                                }`}
                        >
                            {f === "all" ? "All" : "Today"}
                        </button>
                    ))}
                </div>

            </div>

            {/* 1. LOADING */}
            {loading && (
                <div className="min-h-[60vh] flex justify-center items-center py-16">
                    <SimpleLoader text="Loading your bookings..." />
                </div>
            )}

            {/* 2. ERROR */}
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

            {/* Booking List */}
            {!loading && !error && filteredBookings.length > 0 && (
                <div className="max-w-6xl mx-auto px-4 space-y-4 pb-10">
                    {filteredBookings.map((booking) => (
                        <div
                            key={booking._id}
                            className="group bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-lg hover:-translate-y-[2px] transition-all duration-300 cursor-pointer active:scale-[0.99]"
                        >
                            {/* TOP */}
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 tracking-tight">
                                        {booking.partnerName || "N/A"}
                                    </h3>

                                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                                        <Calendar size={12} />
                                        {new Date(booking.bookingDate).toLocaleDateString("en-IN")}
                                    </div>
                                </div>

                                {/* STATUS */}
                                <span
                                    className={`flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full font-medium capitalize ${getStatusStyle(booking.status)}`}
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
                                    {booking.status === "inProgress" ? "in progress" : booking.status}
                                </span>
                            </div>

                            {/* SKILL (handles both flows correctly) */}
                            <div className="mt-2 flex flex-wrap gap-2">
                                {booking.workers?.length > 0 ? (
                                    booking.workers.map((w, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 border border-gray-200 text-xs text-gray-700"
                                        >
                                            <Users size={12} className="text-gray-500" />

                                            <span className="capitalize">{w.skill}</span>

                                            {w.count > 1 && (
                                                <span className="text-[10px] bg-gray-300 text-gray-700 px-1.5 rounded-full">
                                                    {w.count}
                                                </span>
                                            )}
                                        </div>
                                    ))
                                ) : booking.workerDetails?.skill ? (
                                    <div
                                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 border border-gray-200 text-xs text-gray-700"
                                    >
                                        <Users size={12} className="text-gray-500" />
                                        <span className="capitalize">{booking.workerDetails.skill}</span>
                                    </div>
                                ) : (
                                    <span className="text-xs text-gray-400">No service</span>
                                )}
                            </div>

                            {/* LOCATION */}
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1 truncate">
                                <MapPin size={12} />
                                {booking.address?.addressLine || "N/A"}
                            </div>

                            {/* BOTTOM */}
                            <div className="flex justify-between items-center mt-4">

                                {/* AMOUNT */}
                                <div
                                    className={`flex items-center text-base font-bold ${getAmountColor(
                                        booking.status
                                    )}`}
                                >
                                    <IndianRupee size={14} className="mr-1" />
                                    {booking.totalAmount}
                                </div>

                                {/* ACTION BUTTONS */}
                                <div className="flex items-center gap-3">

                                    {/* ✅ Review Button (ONLY AFTER COMPLETION) */}
                                    {booking.status === "completed" && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setReviewBooking(booking);
                                            }}
                                            className="text-xs text-green-600 font-medium hover:underline"
                                        >
                                            Add Review
                                        </button>
                                    )}

                                    {/* View Details */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedBooking(booking);
                                        }}
                                        className="text-xs text-orange-500 font-medium hover:underline"
                                    >
                                        View Details
                                    </button>

                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!loading && !error && filteredBookings.length === 0 && (
                <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
                    <div className="bg-orange-50 text-orange-500 p-5 rounded-full shadow-sm">
                        <Calendar size={32} />
                    </div>

                    <h3 className="mt-5 text-lg sm:text-xl font-semibold text-gray-900">
                        No bookings yet
                    </h3>

                    <p className="mt-2 text-sm text-gray-500 max-w-sm">
                        Looks like you haven’t made any bookings. Start exploring services and book your first one.
                    </p>

                    <button
                        onClick={() => navigate("/search")}
                        className="mt-6 px-6 py-2.5 bg-orange-500 text-white text-sm font-medium rounded-lg shadow hover:bg-orange-600 transition"
                    >
                        Explore Services
                    </button>
                </div>
            )}

            {/* ✅ MODAL (no UI change, just overlay) */}
            {selectedBooking && (
                <BookingDetails
                    booking={selectedBooking}
                    onClose={() => setSelectedBooking(null)}
                    refreshBookings={fetchBookings}
                />
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

export default MyBookings;