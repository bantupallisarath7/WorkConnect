import React, { useEffect, useMemo, useState } from "react";
import { X, Star, MapPin, ThumbsUp, User, Calendar, AlertTriangle, GlobeOff, ShieldX, SearchX } from "lucide-react";
import axios from "axios";
import { useSelector } from "react-redux";
import SimpleLoader from "../../components/SimpleLoader";
import formatError from "../../utils/formatError";

const PublicProfile = ({ connector, worker, onClose }) => {
    const user = connector || worker;
    const isConnector = !!connector;
    const currentUser = useSelector((state) => state.auth);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);


    // Normalize services/skills
    const services = useMemo(() => {
        if (isConnector) {
            return (connector?.workers || []).filter((w) => w.count > 0);
        }
        return worker?.skills || [];
    }, [connector, worker]);


    const fetchReviews = async () => {
        if (!user?._id) return;
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get(
                `https://workconnect-0306.onrender.com/api/review/partner/${user._id}`,
                { withCredentials: true }
            );
            setReviews(res.data.reviews || []);
        } catch (err) {
            setError(formatError(err, "Failed to load reviews"));
            console.log(err);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchReviews();
    }, [user?._id]);


    // Rating Breakdown (safe)
    const ratingStats = useMemo(() => {
        const counts = [0, 0, 0, 0, 0];
        reviews.forEach((r) => {
            if (r.rating >= 1 && r.rating <= 5) {
                counts[r.rating - 1]++;
            }
        });
        const total = reviews.length || 1;
        return counts.map((c) => (c / total) * 100);
    }, [reviews]);


    //  Helpful
    const handleHelpful = async (reviewId) => {
        if (!reviewId) return;
        setError(null);
        try {
            const res = await axios.patch(
                `https://workconnect-0306.onrender.com/api/review/${reviewId}/helpful`,
                {},
                { withCredentials: true }
            );

            const { helpfulCount, liked } = res.data;

            setReviews((prev) =>
                prev.map((r) =>
                    r._id === reviewId
                        ? { ...r, helpfulCount, isLiked: liked }
                        : r
                )
            );
        } catch (err) {
            setError(formatError(err, "Failed to update helpful like "));
            console.log(err);
        }
    };
    const buttonStyles = {
        network: "bg-red-500 hover:bg-red-600",
        server: "bg-orange-500 hover:bg-orange-600",
        auth: "bg-yellow-500 hover:bg-yellow-600",
        not_found: "bg-blue-500 hover:bg-blue-600",
        general: "bg-gray-500 hover:bg-gray-600",
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-3 z-50">

            {/* MODAL */}
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl max-h-[85vh] flex flex-col">

                {/* CLOSE BUTTON (FIXED) */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 sm:top-4 sm:right-4 z-50 backdrop-blur hover:bg-white p-2 rounded-full transition"
                >
                    <X size={18} />
                </button>

                {/* HEADER */}
                <div className={`sticky top-0 z-40 ${isConnector ? "bg-orange-200" : "bg-blue-200"} backdrop-blur`}>

                    <div className="flex flex-col items-center pt-6 pb-5 px-6">

                        {/* AVATAR */}
                        <div className={`w-20 h-20 rounded-full bg-white flex items-center justify-center ${isConnector ? "text-orange-600" : "text-blue-600"} text-2xl font-bold shadow-md`}>
                            {user?.name?.charAt(0)}
                        </div>

                        {/* NAME */}
                        <h2 className="mt-3 text-lg font-semibold text-gray-900 text-center">
                            {user?.name}
                        </h2>

                        {/* LOCATION */}
                        <div className="flex items-center gap-1 text-xs text-gray-700 mt-1">
                            <MapPin size={13} />
                            {user?.location?.city || "Location not set"}
                        </div>

                        {/* STATS */}
                        <div className="flex gap-5 mt-3 text-xs text-gray-700 flex-wrap justify-center">

                            <span className="flex items-center gap-1 text-orange-500 font-medium">
                                <Star size={14} className="fill-orange-400" />
                                {user?.rating || 0}
                            </span>

                            <span>{user?.totalJobs || 0} Jobs</span>

                            <span>
                                {isConnector
                                    ? `${user?.commissionRate || 0}% commission`
                                    : `${services.length} Skills`}
                            </span>

                        </div>

                    </div>
                </div>

                {/* SCROLLABLE BODY */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth">

                    {loading && (
                        <div className="min-h-[40vh] flex justify-center items-center py-16">
                            <SimpleLoader text={"Loading reviews..."} />
                        </div>
                    )}

                    {/* ERROR */}
                    {!loading && error && (
                        <div className="min-h-[40vh] flex flex-col items-center justify-center text-center px-4">

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
                                onClick={fetchReviews}
                                className={`mt-5 px-5 py-2 text-white text-sm rounded-lg ${buttonStyles[error.type]}`}
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    {!loading && !error && (
                        <>
                            {/* RATING BREAKDOWN */}
                            {reviews.length > 0 && (
                                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">

                                    <h3 className="text-sm font-semibold text-gray-900 mb-3">
                                        Rating Breakdown
                                    </h3>

                                    <div className="space-y-2">
                                        {[5, 4, 3, 2, 1].map((star) => {
                                            const percentage = ratingStats[star - 1];

                                            return (
                                                <div key={star} className="flex items-center gap-2">

                                                    {/* STAR + NUMBER */}
                                                    <div className="flex items-center gap-1 w-10 text-xs text-gray-700">
                                                        <Star size={14} className="text-orange-400 fill-orange-400" />
                                                        <span>{star}</span>
                                                    </div>

                                                    {/* BAR */}
                                                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-orange-400 transition-all duration-400"
                                                            style={{ width: `${percentage}%` }}
                                                        />
                                                    </div>

                                                    {/* % (light, not distracting) */}
                                                    <span className="text-[10px] text-gray-400 w-8 text-right">
                                                        {Math.round(percentage)}%
                                                    </span>

                                                </div>
                                            );
                                        })}
                                    </div>

                                </div>
                            )}

                            {/* REVIEWS */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                                    Reviews
                                </h3>

                                {reviews.length === 0 ? (
                                    <div className="bg-gray-50 rounded-xl p-6 text-center text-xs text-gray-400">
                                        No reviews yet
                                    </div>
                                ) : (
                                    <div className="space-y-3">

                                        {reviews.map((r) => (
                                            <div
                                                key={r._id}
                                                className="group relative bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-lg hover:-translate-y-[2px] transition-all duration-300"
                                            >
                                                {/* subtle glow */}
                                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-gradient-to-br from-orange-50 via-transparent to-transparent pointer-events-none"></div>

                                                {/* HEADER */}
                                                <div className="flex justify-between items-start relative z-10">

                                                    {/* LEFT */}
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-11 h-11 rounded-full bg-orange-100 flex items-center justify-center shadow-sm">
                                                            <User size={18} className="text-orange-600" />
                                                        </div>

                                                        <div>
                                                            <p className="font-semibold text-gray-900 flex items-center gap-2">
                                                                {r.reviewer?.name || "Anonymous"}
                                                            </p>

                                                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                                <Calendar size={12} />
                                                                {new Date(r.createdAt).toLocaleDateString("en-IN")}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* RATING */}
                                                    <div className="flex items-center gap-1">

                                                        {/*  Desktop (show full stars) */}
                                                        <div className="hidden sm:flex items-center gap-1">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star
                                                                    key={i}
                                                                    size={16}
                                                                    className={
                                                                        i < r.rating
                                                                            ? "text-orange-400 fill-orange-400"
                                                                            : "text-gray-300"
                                                                    }
                                                                />
                                                            ))}
                                                        </div>

                                                        {/* Mobile (show single star + number) */}
                                                        <div className="flex sm:hidden items-center gap-1 text-sm font-semibold text-orange-500">
                                                            <Star size={14} className="fill-orange-400 text-orange-400" />
                                                            {r.rating}
                                                        </div>

                                                    </div>
                                                </div>

                                                {/* TAGS */}
                                                {r.tags?.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 mt-3 relative z-10">
                                                        {r.tags.map((tag, i) => (
                                                            <span
                                                                key={i}
                                                                className="text-[11px] px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 capitalize"
                                                            >
                                                                {tag.replace("_", " ")}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* COMMENT */}
                                                <p className="text-sm text-gray-600 mt-3 leading-relaxed relative z-10">
                                                    {r.comment || "No comment provided"}
                                                </p>

                                                {/* FOOTER */}
                                                <div className="flex justify-between items-center mt-4 pt-3 border-t text-xs text-gray-500 relative z-10">

                                                    {/* LEFT: HELPFUL */}
                                                    <button
                                                        onClick={() => handleHelpful(r._id)}
                                                        className={`flex items-center gap-1 transition
                                                        ${r.isLiked ? "text-orange-500" : "text-gray-500 hover:text-orange-600"}`}
                                                    >
                                                        <ThumbsUp
                                                            size={15}
                                                            className={r.isLiked ? "fill-orange-400" : ""}
                                                        />

                                                        <span className="font-medium">{r.helpfulCount || 0}</span>

                                                        <span>
                                                            {r.isLiked ? "You found this helpful" : "Helpful"}
                                                        </span>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PublicProfile;