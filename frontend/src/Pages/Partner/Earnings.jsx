import React, { useState, useEffect, useMemo } from "react";
import { IndianRupee, Calendar, ClipboardList, AlertTriangle, GlobeOff, ShieldX, SearchX } from "lucide-react";
import axios from "axios";
import { useSelector } from "react-redux";
import SimpleLoader from "../../components/SimpleLoader";
import formatError from "../../utils/formatError.js";

const Earnings = () => {
    const { currentUser } = useSelector((state) => state.auth);

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState("all");
    const [error, setError] = useState(null);

    const config = {
        connector: {
            title: "Earnings",
            subtitle: "Track your commission and income",
        },
        worker: {
            title: "My Earnings",
            subtitle: "Track your job earnings",
        },
    }[currentUser?.role];

    const buttonStyles = {
        network: "bg-red-500 hover:bg-red-600",
        server: "bg-orange-500 hover:bg-orange-600",
        auth: "bg-yellow-500 hover:bg-yellow-600",
        not_found: "bg-blue-500 hover:bg-blue-600",
        general: "bg-gray-500 hover:bg-gray-600",
    };

    // ✅ FETCH
    const fetchBookings = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get(
                "http://localhost:7265/api/booking/partner/all",
                { withCredentials: true }
            );
            setBookings(res.data.bookings || []);
        } catch (err) {
            setError(formatError(err, "Failed to load earnings"));
            setBookings([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    // ✅ FILTER
    const filteredBookings = useMemo(() => {
        const completed = bookings.filter(b => b.status === "completed");

        if (selectedDate === "all") return completed;

        const today = new Date().toISOString().split("T")[0];

        const yesterdayDate = new Date();
        yesterdayDate.setDate(yesterdayDate.getDate() - 1);
        const yesterday = yesterdayDate.toISOString().split("T")[0];

        return completed.filter((b) => {
            const date = b.bookingDate?.split("T")[0];

            if (selectedDate === "today") return date === today;
            if (selectedDate === "yesterday") return date === yesterday;

            return false;
        });
    }, [bookings, selectedDate]);

    // ✅ TOTAL EARNINGS
    const totalEarnings = useMemo(() => {
        return filteredBookings.reduce((sum, b) => {
            return currentUser?.role === "connector"
                ? sum + (Number(b.commission) || 0)
                : sum + (Number(b.labourCost) || 0);
        }, 0);
    }, [filteredBookings, currentUser]);

    return (
        <div className="p-4 md:p-6 space-y-6">

            {/* HEADER */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {config.title}
                    </h1>
                    <p className="text-sm text-gray-500">
                        {config.subtitle}
                    </p>
                </div>

                {/* FILTER */}
                <div className="flex gap-2 bg-gray-100 p-1 rounded-full">
                    {["all", "today", "yesterday"].map((f) => (
                        <button
                            key={f}
                            onClick={() => setSelectedDate(f)}
                            className={`px-4 py-1 text-sm rounded-full transition ${selectedDate === f
                                ? "bg-white shadow text-orange-500 font-medium"
                                : "text-gray-600"
                                }`}
                        >
                            {f === "all"
                                ? "All"
                                : f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* LOADING */}
            {loading && (
                <div className="min-h-[60vh] flex justify-center items-center">
                    <SimpleLoader text="Loading earnings..." />
                </div>
            )}

            {/* ERROR */}
            {!loading && error && (
                <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">

                    <div className="p-5 rounded-full bg-red-100 text-red-500">
                        {error.type === "network" && <GlobeOff size={36} />}
                        {error.type === "server" && <AlertTriangle size={36} />}
                        {error.type === "auth" && <ShieldX size={36} />}
                        {error.type === "not_found" && <SearchX size={36} />}
                    </div>

                    <h3 className="mt-4 font-semibold text-lg">
                        {error.message}
                    </h3>

                    <button
                        onClick={fetchBookings}
                        className={`mt-5 px-5 py-2 text-white rounded-lg ${buttonStyles[error.type]}`}
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* DATA */}
            {!loading && !error && (
                <>
                    {/* SUMMARY CARD */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">
                                Total Earnings
                            </p>
                            <h2 className="text-2xl font-bold text-gray-900">
                                ₹{totalEarnings}
                            </h2>
                        </div>

                        <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-orange-100 text-orange-500">
                            <IndianRupee />
                        </div>
                    </div>

                    {/* LIST */}
                    {filteredBookings.length === 0 ? (
                        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">

                            <div className="bg-orange-100 p-5 rounded-full">
                                <ClipboardList className="text-orange-500" size={32} />
                            </div>

                            <h3 className="mt-4 font-semibold text-lg">
                                {selectedDate === "today"
                                    ? "No earnings today"
                                    : selectedDate === "yesterday"
                                        ? "No earnings yesterday"
                                        : "No earnings yet"}
                            </h3>

                            <p className="text-gray-500 text-sm mt-2">
                                {selectedDate === "all"
                                    ? "Complete bookings to start earning."
                                    : "Try switching filters to view earnings."}
                            </p>
                            <button
                                onClick={fetchBookings}
                                className="mt-6 px-6 py-2.5 bg-orange-500 text-white text-sm rounded-lg shadow hover:bg-orange-600">
                                refresh
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredBookings.map((b) => (
                                <div
                                    key={b._id}
                                    className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex justify-between items-center"
                                >
                                    <div>
                                        <p className="font-medium text-gray-800">
                                            {b.customer?.name || "Customer"}
                                        </p>

                                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                            <Calendar size={12} />
                                            {new Date(b.bookingDate).toLocaleDateString()}
                                        </p>
                                    </div>

                                    <p className="font-bold text-gray-900">
                                        ₹
                                        {currentUser?.role === "connector"
                                            ? b.commission
                                            : b.labourCost}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Earnings;