import React, { useState } from "react";
import { Star, X, CheckCircle } from "lucide-react";
import axios from "axios";
import useLockScroll from "../utils/useLockScroll";

const tagsList = [
    "punctual",
    "professional",
    "skilled",
    "excellent",
    "late",
    "rude",
    "poor_quality",
];

const ReviewModal = ({ booking, onClose }) => {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(null);
    const [comment, setComment] = useState("");
    const [selectedTags, setSelectedTags] = useState([]);
    const [loading, setLoading] = useState(false);

    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    useLockScroll(success);

    const toggleTag = (tag) => {
        setSelectedTags((prev) =>
            prev.includes(tag)
                ? prev.filter((t) => t !== tag)
                : [...prev, tag]
        );
    };

    const handleSubmit = async () => {
        if (!rating) {
            return setError("Please select rating");
        }

        try {
            setLoading(true);
            setError(null);

            await axios.post(
                "http://localhost:7265/api/review/",
                {
                    reviewedUser: booking.partnerId,
                    booking: booking._id,
                    rating,
                    comment,
                    reviewerRole: "connector",
                    tags: selectedTags,
                },
                { withCredentials: true }
            );

            setSuccess(true);

            setTimeout(() => {
                setSuccess(false);
                onClose();
            }, 1800);
        } catch (err) {
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                "Something went wrong. Try again.";

            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* MAIN MODAL */}
            {!success && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">

                    <div className="w-full max-w-md bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden">

                        {/* HEADER */}
                        <div className="flex justify-between items-center px-4 sm:px-5 py-3 sm:py-4 border-b">
                            <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                                Add Review
                            </h3>
                            <button onClick={onClose}>
                                <X size={18} />
                            </button>
                        </div>

                        {/* CONTENT */}
                        <div className="p-4 sm:p-5 space-y-5">

                            {/* Rating */}
                            <div>
                                <p className="text-sm font-medium mb-2">Rating</p>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            size={26}
                                            className={`cursor-pointer transition ${(hover || rating) >= star
                                                ? "text-yellow-400 fill-yellow-400"
                                                : "text-gray-300"
                                                }`}
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHover(star)}
                                            onMouseLeave={() => setHover(null)}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Tags */}
                            <div>
                                <p className="text-sm font-medium mb-2">Tags</p>
                                <div className="flex flex-wrap gap-2">
                                    {tagsList.map((tag) => (
                                        <button
                                            key={tag}
                                            onClick={() => toggleTag(tag)}
                                            className={`text-xs px-3 py-1 rounded-full border transition ${selectedTags.includes(tag)
                                                ? "bg-orange-500 text-white border-orange-500"
                                                : "bg-gray-100 text-gray-600"
                                                }`}
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Comment */}
                            <div>
                                <p className="text-sm font-medium mb-2">Comment</p>
                                <textarea
                                    rows={3}
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                                    placeholder="Share your experience..."
                                />
                            </div>

                            {/* ERROR */}
                            {error && (
                                <p className="text-sm text-red-500 bg-red-50 p-2 rounded-lg">
                                    {error}
                                </p>
                            )}

                            {/* BUTTON */}
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="w-full py-2.5 rounded-xl font-medium transition bg-orange-500 hover:bg-orange-600 text-white"
                            >
                                {loading ? "Submitting..." : "Submit Review"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* SUCCESS MODAL */}
            {success && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="bg-white w-full max-w-sm rounded-2xl p-6 text-center shadow-xl animate-fadeIn">

                        <CheckCircle className="mx-auto text-green-500 mb-3" size={40} />

                        <h2 className="text-lg font-semibold text-gray-800">
                            Review Submitted!
                        </h2>

                        <p className="text-sm text-gray-500 mt-1">
                            Thanks for your feedback
                        </p>
                    </div>
                </div>
            )}
        </>
    );
};

export default ReviewModal;