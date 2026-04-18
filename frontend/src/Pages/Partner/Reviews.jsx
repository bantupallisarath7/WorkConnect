import React, { useState, useEffect } from "react";
import {
  Star,
  AlertTriangle,
  GlobeOff,
  ShieldX,
  SearchX,
  MessageSquare,
  User,
  Calendar,
  ThumbsUp,
  ThumbsUpIcon
} from "lucide-react";
import axios from "axios";
import { useSelector } from "react-redux";
import SimpleLoader from "../../components/SimpleLoader.jsx";
import formatError from "../../utils/formatError.js";

const Reviews = () => {
  const { currentUser } = useSelector((state) => state.auth);

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const config = {
    connector: {
      title: "Reviews",
      subtitle: "Feedback from your customers",
    },
    worker: {
      title: "My Reviews",
      subtitle: "What customers say about your work",
    },
  }[currentUser?.role];

  const buttonStyles = {
    network: "bg-red-500 hover:bg-red-600",
    server: "bg-orange-500 hover:bg-orange-600",
    auth: "bg-yellow-500 hover:bg-yellow-600",
    not_found: "bg-blue-500 hover:bg-blue-600",
    general: "bg-gray-500 hover:bg-gray-600",
  };

  const fetchReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(
        "http://localhost:7265/api/review/all",
        { withCredentials: true }
      );
      setReviews(res.data.reviews || []);
    } catch (err) {
      setError(formatError(err, "Failed to load reviews"));
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  return (
    <div className="p-4 md:p-6 space-y-6">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            {config.title}
          </h1>
          <p className="text-sm text-gray-500">
            {config.subtitle}
          </p>
        </div>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="min-h-[60vh] flex justify-center items-center">
          <SimpleLoader text="Loading reviews..." />
        </div>
      )}

      {/* ERROR */}
      {!loading && error && (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
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

          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            {error.message}
          </h3>

          <button
            onClick={fetchReviews}
            className={`mt-5 px-5 py-2 text-white text-sm rounded-lg ${buttonStyles[error.type]}`}
          >
            Retry
          </button>
        </div>
      )}

      {/* DATA */}
      {!loading && !error && (
        <>
          {reviews.length === 0 ? (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">

              <div className="bg-orange-100 p-6 rounded-full shadow-sm">
                <MessageSquare size={32} className="text-orange-500" />
              </div>

              <h3 className="mt-5 font-semibold text-lg text-gray-900">
                No reviews yet
              </h3>

              <p className="text-sm text-gray-500 mt-2 max-w-sm">
                {currentUser?.role === "connector"
                  ? "Customers haven’t left feedback yet."
                  : "Complete more jobs to start receiving reviews."}
              </p>
              <button
                onClick={fetchReviews}
                className="mt-6 px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg"
              >
                Refresh
              </button>
            </div>
          ) : (
            <div className="space-y-4">

              {reviews.map((r) => (
                <div
                  key={r._id}
                  className="group relative bg-white rounded-2xl border border-gray-100 p-5 
    shadow-sm hover:shadow-lg hover:-translate-y-[2px] 
    transition-all duration-300"
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

                    {/* HELPFUL COUNT */}
                    <div className="flex items-center gap-1">
                      <ThumbsUp size={15} className="text-orange-600" /> <span className="font-medium text-gray-700">{r.helpfulCount || 0}</span>
                      <span>helpful</span>
                    </div>
                  </div>
                </div>
              ))}

            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Reviews;