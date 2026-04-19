import React, { useState, useMemo, useEffect } from "react";
import { ClipboardList, Users, Home, Wallet, Star, AlertTriangle, GlobeOff, ShieldX, SearchX } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import SimpleLoader from "../../components/SimpleLoader";
import { useSelector } from "react-redux";
import formatError from "../../utils/formatError.js";

const Dashboard = () => {
    const [selectedDate, setSelectedDate] = useState("all");
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const { currentUser } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const [error, setError] = useState(null);




    const buttonStyles = {
        network: "bg-red-500 hover:bg-red-600",
        server: "bg-orange-500 hover:bg-orange-600",
        auth: "bg-yellow-500 hover:bg-yellow-600",
        not_found: "bg-blue-500 hover:bg-blue-600",
        general: "bg-gray-500 hover:bg-gray-600",
    };

    const dashboardConfig = {
        connector: {
            title: "Dashboard",
            subtitle: "Overview of your bookings and earnings",
            route: "/manage-bookings",
        },

        worker: {
            title: "My Dashboard",
            subtitle: "Track your jobs and earnings",
            route: "/worker-bookings",
        },
    };
    const config = dashboardConfig[currentUser?.role];

    // FETCH BOOKINGS FROM API
    const fetchBookings = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get(
                "https://workconnect-0306.onrender.com/api/booking/partner/all",
                { withCredentials: true }
            );
            setBookings(res.data.bookings || []);
        } catch (error) {
            setError(formatError(error, "Failed to load dashboard"));
            setBookings([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const filteredBookings = useMemo(() => {
        if (selectedDate === "all") return bookings;

        const today = new Date().toISOString().split("T")[0];

        const yesterdayDate = new Date();
        yesterdayDate.setDate(yesterdayDate.getDate() - 1);
        const yesterday = yesterdayDate.toISOString().split("T")[0];

        return bookings.filter((b) => {
            const bookingDate = b.bookingDate?.split("T")[0];

            if (selectedDate === "today") {
                return bookingDate === today;
            }

            if (selectedDate === "yesterday") {
                return bookingDate === yesterday;
            }

            return false;
        });
    }, [selectedDate, bookings]);

    // STATS (UNCHANGED UI)
    const stats = useMemo(() => {
        const totalBookings = filteredBookings.length;
        const completedBookings = filteredBookings.filter(
            (b) => b.status === "completed"
        );

        const completedJobs = completedBookings.length;

        const earnings = completedBookings.reduce((total, b) => {
            if (currentUser?.role === "connector") {
                return total + (Number(b.commission) || 0);
            } else {
                return total + (Number(b.labourCost) || 0);
            }
        }, 0);

        const rating = `${currentUser?.rating} ⭐`;

        return [
            { title: "Total Bookings", value: totalBookings, icon: <ClipboardList /> },
            { title: "Completed Jobs", value: completedJobs, icon: <Home /> },
            { title: "Earnings", value: `₹${earnings}`, icon: <Wallet /> },
            { title: "Rating", value: rating, icon: <Star /> },
        ];
    }, [filteredBookings, currentUser]);


    const statusStyles = {
        pending: "bg-yellow-100 text-yellow-700",
        accepted: "bg-blue-100 text-blue-700",
        completed: "bg-green-100 text-green-700",
        cancelled: "bg-red-100 text-red-700",
    };

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

                {/* DATE FILTER */}
                <div className="flex gap-2 bg-gray-100 p-1 rounded-full">
                    <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-full w-fit mx-auto sm:mx-0">

                        <button
                            onClick={() => setSelectedDate("all")}
                            className={`px-4 py-1 text-sm rounded-full transition ${selectedDate === "all"
                                ? "bg-white shadow text-orange-500 font-medium"
                                : "text-gray-600 hover:text-gray-900"
                                }`}
                        >
                            All
                        </button>

                        <button
                            onClick={() => setSelectedDate("today")}
                            className={`px-4 py-1 text-sm rounded-full transition ${selectedDate === "today"
                                ? "bg-white shadow text-orange-500 font-medium"
                                : "text-gray-600 hover:text-gray-900"
                                }`}
                        >
                            Today
                        </button>

                        <button
                            onClick={() => setSelectedDate("yesterday")}
                            className={`px-4 py-1 text-sm rounded-full transition ${selectedDate === "yesterday"
                                ? "bg-white shadow text-orange-500 font-medium"
                                : "text-gray-600 hover:text-gray-900"
                                }`}
                        >
                            Yesterday
                        </button>

                    </div>
                </div>

            </div>

            {/* LOADING */}
            {loading && (
                <div className="min-h-[60vh] flex justify-center items-center py-16">
                    <SimpleLoader text="Loading dashboard..." />
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

            {/* STATS */}
            {!loading && !error && (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {stats.map((item, i) => (
                            <div
                                key={i}
                                className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition flex items-center gap-4"
                            >
                                <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-orange-100 text-orange-500">
                                    {item.icon}
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">{item.title}</p>
                                    <h2 className="text-xl font-bold text-gray-900">
                                        {item.value}
                                    </h2>
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* BOOKINGS */}
                    <div className="bg-white rounded-2xl shadow-sm p-5">

                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-gray-800">
                                Recent Bookings
                            </h2>

                            <button className="text-sm text-orange-500 hover:underline"
                                onClick={() => navigate(config.route)}
                            >
                                View All
                            </button>
                        </div>

                        <div className="overflow-x-auto">

                            {/* EMPTY STATE */}
                            {!error && filteredBookings.length === 0 ? (
                                <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">

                                    {/* ICON */}
                                    <div className="bg-orange-100 p-5 rounded-full shadow-sm">
                                        <ClipboardList size={32} className="text-orange-500" />
                                    </div>

                                    {/* TITLE */}
                                    <p className="text-lg font-semibold text-gray-800">
                                        {selectedDate === "today"
                                            ? "No bookings today"
                                            : selectedDate === "yesterday"
                                                ? "No bookings yesterday"
                                                : "No recent bookings"}
                                    </p>

                                    {/* DESCRIPTION */}
                                    <p className="text-gray-500 text-sm mt-1 max-w-sm">
                                        {selectedDate === "today"
                                            ? "You don’t have any bookings scheduled for today. New bookings will appear here."
                                            : selectedDate === "yesterday"
                                                ? "No bookings were recorded yesterday. Try checking other dates."
                                                : "You haven’t received any bookings yet. Once customers book services, they will appear here."}
                                    </p>

                                    {/* ACTION BUTTON */}
                                    <button
                                        onClick={() => setSelectedDate("all")}
                                        className="mt-5 px-5 py-2 rounded-lg bg-orange-500 text-white text-sm hover:bg-orange-600"
                                    >
                                        View All Bookings
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {filteredBookings.slice(0, 5).map((b) => (
                                        <div
                                            key={b._id}
                                            className="bg-gray-50 hover:bg-white border border-gray-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 transition"
                                        >
                                            {/* LEFT */}
                                            <div className="flex flex-col gap-1">
                                                <p className="font-medium text-gray-800">
                                                    {b.customer?.name || "N/A"}
                                                </p>

                                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                                    {/* Connector workers */}
                                                    {b.workers?.length > 0 &&
                                                        b.workers.map((w, i) => (
                                                            <div
                                                                key={i}
                                                                className="flex items-center gap-1.5 bg-gray-100 border border-gray-200 px-2 py-1 rounded-full text-xs font-medium text-gray-700"
                                                            >
                                                                <span className="capitalize">{w.skill}</span>

                                                                <span className="flex items-center gap-1 text-gray-500">
                                                                    <Users size={12} />
                                                                    {w.count}
                                                                </span>
                                                            </div>
                                                        ))}

                                                    {/* Worker flow */}
                                                    {(!b.workers || b.workers.length === 0) &&
                                                        b.workerDetails?.skill && (
                                                            <div className="flex items-center gap-1.5 bg-gray-100 border border-gray-200 px-2 py-1 rounded-full text-xs font-medium text-gray-700">
                                                                <span className="capitalize">{b.workerDetails.skill}</span>

                                                                <span className="flex items-center gap-1 text-gray-500">
                                                                    <Users size={12} />
                                                                    1
                                                                </span>
                                                            </div>
                                                        )}

                                                    {/* Fallback */}
                                                    {(!b.workers || b.workers.length === 0) &&
                                                        !b.workerDetails?.skill && (
                                                            <span className="text-xs text-gray-400">N/A</span>
                                                        )}
                                                </div>
                                            </div>

                                            {/* RIGHT */}
                                            <div className="flex items-center justify-between sm:justify-end gap-3">
                                                <span
                                                    className={`text-xs px-3 py-1 rounded-full font-medium capitalize ${statusStyles[b.status] || "bg-gray-100 text-gray-600"
                                                        }`}
                                                >
                                                    {b.status}
                                                </span>

                                                <button
                                                    onClick={() =>
                                                        navigate(config?.route, {
                                                            state: { filter: b.status }
                                                        })
                                                    }
                                                    className="text-xs text-orange-500 font-medium hover:underline"
                                                >
                                                    View
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                        </div>

                    </div>

                </>
            )}
        </div>
    );
};

export default Dashboard;