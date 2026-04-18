import React, { useEffect, useState } from "react";
import { Mail, Phone, MapPin, Star, Edit, CheckCircle, AlertTriangle, GlobeOff, ShieldX, SearchX } from "lucide-react";
import axios from "axios";
import SimpleLoader from "../../components/SimpleLoader";
import formatError from "../../utils/formatError";
import useLockScroll from "../../utils/useLockScroll"

const Profile = () => {
    const [user, setUser] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [form, setForm] = useState({});
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [showSuccess, setShowSuccess] = useState(false);
    const [error, setError] = useState(null);
    const [bookings, setBookings] = useState([]);

    useLockScroll(showSuccess);


    const buttonStyles = {
        network: "bg-red-500 hover:bg-red-600",
        server: "bg-orange-500 hover:bg-orange-600",
        auth: "bg-yellow-500 hover:bg-yellow-600",
        not_found: "bg-blue-500 hover:bg-blue-600",
        general: "bg-gray-500 hover:bg-gray-600",
    };

    const fetchProfile = async () => {
        setError(null);
        try {
            setInitialLoading(true);
            const res = await axios.get(
                "https://workconnect-0306.onrender.com/api/user/profile",
                { withCredentials: true }
            );
            setUser(res.data.user);
            setForm(res.data.user);
        } catch (error) {
            setError(formatError(error, "Failed to fetch profile"))
        } finally {
            setInitialLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
        fetchBookings();
    }, []);

    const handleChange = (key, value) => {
        setForm({ ...form, [key]: value });
    };

    const handleSave = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.put(
                "https://workconnect-0306.onrender.com/api/user/profile",
                form,
                { withCredentials: true }
            );
            setUser(res.data.user);
            setEditMode(false);
            setShowSuccess(true);
        } catch (error) {
            setError(formatError(error, "Failed to update profile"))
        } finally {
            setLoading(false);
        }
    };


    const fetchBookings = async () => {
        setError(null);
        try {
            const res = await axios.get(
                "https://workconnect-0306.onrender.com/api/booking/all",
                { withCredentials: true }
            );
            setBookings(res.data.bookings || []);
        } catch (error) {
            setError(formatError(error, "Error fetching bookings"));
            setBookings([]);
        }
    };

    const totalBookings = bookings.length || 0;

    const completedBookings = bookings.filter(
        (b) => b.status === "completed"
    ).length || 0;

    if (initialLoading) {
        return (
            <div className="bg-gray-50 min-h-[calc(100vh-64px)] flex items-center justify-center">
                <SimpleLoader text="Loading profile.." />
            </div>
        );
    }

    return (
        <>
            {/* 2. ERROR */}
            {!initialLoading && error && (
                <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center text-center px-4">

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
                        onClick={fetchProfile}
                        className={`mt-5 px-5 py-2 text-white text-sm rounded-lg ${buttonStyles[error.type]}`}
                    >
                        Retry
                    </button>
                </div>
            )}
            {!initialLoading && !error && (
                <>
                    <div className="bg-gray-50 min-h-screen px-4 py-6">
                        <div className="max-w-5xl mx-auto space-y-6">
                            <div className="bg-white rounded-3xl shadow-md p-6 flex flex-col sm:flex-row items-center gap-5">
                                <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 text-2xl font-bold shadow-inner">
                                    {user?.name?.charAt(0)}
                                </div>

                                <div className="flex-1 text-center sm:text-left">
                                    {editMode ? (
                                        <input
                                            value={form.name || ""}
                                            onChange={(e) => handleChange("name", e.target.value)}
                                            className="bg-gray-100 px-3 py-1 rounded-lg outline-none focus:ring-2 focus:ring-orange-400"
                                        />
                                    ) : (
                                        <h2 className="text-2xl font-bold text-gray-900">
                                            {user.name}
                                        </h2>
                                    )}

                                    <p className="text-gray-500 text-sm capitalize">
                                        {user.role}
                                    </p>

                                    {(user.role === "worker" || user.role === "connector") && (
                                        <div className="flex gap-4 mt-2 text-sm">
                                            <span className="flex items-center gap-1 text-yellow-500 font-medium">
                                                <Star size={16} fill="currentColor" />
                                                {user.rating || 0}
                                            </span>
                                            <span className="text-gray-600">
                                                {user.totalJobs || 0} Jobs
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={() => {
                                        setEditMode(!editMode);
                                        setForm(user);
                                    }}
                                    className="bg-orange-500 text-white px-4 py-2 rounded-xl shadow hover:bg-orange-600 transition"
                                >
                                    {editMode ? "Cancel" : "Edit"}
                                </button>
                            </div>

                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="md:col-span-2 bg-white rounded-3xl shadow-md p-6 space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Personal Info
                                    </h3>

                                    <div className="flex items-center gap-3">
                                        <Mail size={18} className="text-gray-400" />
                                        {user.email}
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Phone size={18} className="text-gray-400" />
                                        {editMode ? (
                                            <input
                                                value={form.phone || ""}
                                                onChange={(e) =>
                                                    handleChange("phone", e.target.value)
                                                }
                                                className="bg-gray-100 px-3 py-1 rounded-lg"
                                            />
                                        ) : (
                                            user.phone || "Not added"
                                        )}
                                    </div>

                                    {/* LOCATION */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <MapPin size={18} className="text-gray-400" />
                                            <p className="text-sm  text-gray-400">Address</p>
                                        </div>

                                        <div className="space-y-3">

                                            {editMode ? (
                                                <input
                                                    value={form.location?.addressLine || ""}
                                                    onChange={(e) =>
                                                        setForm({
                                                            ...form,
                                                            location: {
                                                                ...form.location,
                                                                addressLine: e.target.value,
                                                            },
                                                        })
                                                    }
                                                    placeholder="Street / Area"
                                                    className="bg-gray-100 px-3 py-2 rounded-lg w-full outline-none focus:ring-2 focus:ring-orange-400"
                                                />
                                            ) : (
                                                <p
                                                    className={`${user.location?.addressLine ? "text-gray-900" : "text-gray-400"
                                                        }`}
                                                >
                                                    {user.location?.addressLine || "Street/Area Not added"}
                                                </p>
                                            )}

                                            <div className="grid grid-cols-2 gap-3">
                                                {editMode ? (
                                                    <>
                                                        <input
                                                            value={form.location?.city || ""}
                                                            onChange={(e) =>
                                                                setForm({
                                                                    ...form,
                                                                    location: {
                                                                        ...form.location,
                                                                        city: e.target.value,
                                                                    },
                                                                })
                                                            }
                                                            placeholder="City"
                                                            className="bg-gray-100 px-3 py-2 rounded-lg w-full outline-none focus:ring-2 focus:ring-orange-400"
                                                        />
                                                        <input
                                                            value={form.location?.state || ""}
                                                            onChange={(e) =>
                                                                setForm({
                                                                    ...form,
                                                                    location: {
                                                                        ...form.location,
                                                                        state: e.target.value,
                                                                    },
                                                                })
                                                            }
                                                            placeholder="State"
                                                            className="bg-gray-100 px-3 py-2 rounded-lg w-full outline-none focus:ring-2 focus:ring-orange-400"
                                                        />
                                                    </>
                                                ) : (
                                                    <>
                                                        <p
                                                            className={`${user.location?.city ? "text-gray-900" : "text-gray-400"
                                                                }`}
                                                        >
                                                            {user.location?.city || "City not set"}
                                                        </p>

                                                        <p
                                                            className={`${user.location?.state ? "text-gray-900" : "text-gray-400"
                                                                }`}
                                                        >
                                                            {user.location?.state || "State not set"}
                                                        </p>
                                                    </>
                                                )}
                                            </div>

                                            {editMode ? (
                                                <input
                                                    value={form.location?.pincode || ""}
                                                    onChange={(e) =>
                                                        setForm({
                                                            ...form,
                                                            location: {
                                                                ...form.location,
                                                                pincode: e.target.value,
                                                            },
                                                        })
                                                    }
                                                    placeholder="Pincode"
                                                    className="bg-gray-100 px-3 py-2 rounded-lg w-full outline-none focus:ring-2 focus:ring-orange-400"
                                                />
                                            ) : (
                                                <p
                                                    className={`${user.location?.pincode ? "text-gray-900" : "text-gray-400"
                                                        }`}
                                                >
                                                    {user.location?.pincode || "Pincode Not added"}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-5">
                                    <div className="bg-white rounded-3xl shadow-md p-5 text-center">
                                        <p className="text-2xl font-bold">
                                            {totalBookings}
                                        </p>
                                        <p className="text-sm text-gray-500">Bookings</p>
                                    </div>

                                    <div className="bg-white rounded-3xl shadow-md p-5 text-center">
                                        <p className="text-2xl font-bold">
                                            {completedBookings}
                                        </p>
                                        <p className="text-sm text-gray-500">Completed Bookings</p>
                                    </div>
                                </div>
                            </div>

                            {editMode && (
                                <button
                                    onClick={handleSave}
                                    disabled={loading}
                                    className="w-full bg-green-500 text-white py-3 rounded-2xl shadow-md hover:bg-green-600 transition disabled:opacity-70 flex items-center justify-center gap-2"
                                >
                                    {loading ? "Saving..." : "Save Changes"}
                                </button>
                            )}
                        </div>
                    </div>

                    <style>
                        {`
                            .animate-scaleIn {
                            animation: scaleIn 0.25s ease forwards;
                            }
                            @keyframes scaleIn {
                            from { transform: scale(0.9); opacity: 0; }
                            to { transform: scale(1); opacity: 1; }
                            }
                        `}
                    </style>

                    {showSuccess && (
                        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
                            <div className="bg-white rounded-3xl shadow-xl p-6 w-full max-w-sm text-center animate-scaleIn">
                                <CheckCircle className="text-green-500 mx-auto mb-3" size={40} />
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Profile Updated
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Your profile updated successfully.
                                </p>
                                <button
                                    onClick={() => setShowSuccess(false)}
                                    className="mt-5 w-full bg-orange-500 text-white py-2 rounded-xl hover:bg-orange-600 transition"
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </>
    );
};

export default Profile;