import React, { useState } from "react";
import { Mail, Loader2, ArrowLeft } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError("Email is required");
      setMessage("");
      return;
    }

    if (!validateEmail(email)) {
      setError("Enter a valid email address");
      setMessage("");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:7265/api/auth/forgot-password",
        { email }
      );

      setMessage(res.data.message || "Reset link sent to your email");
      setEmail("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Something went wrong. Try again."
      );
      setMessage("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-10">

      {/* CONTAINER */}
      <div className="max-w-md mx-auto">

        {/* BACK BUTTON */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-orange-500 transition mb-8"
        >
          <ArrowLeft size={16} />
          Back to Login
        </button>

        {/* HEADER */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            Forgot Password
          </h1>
          <p className="text-gray-500 mt-3 text-sm sm:text-base">
            Enter your email and we'll send you a secure reset link
          </p>
        </div>

        {/* CARD */}
        <div className="bg-white/80 backdrop-blur-md border border-gray-200 rounded-3xl shadow-xl p-6 sm:p-8 transition">

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* INPUT */}
            <div
              className={`flex items-center bg-gray-100 rounded-xl px-3 border
              ${error ? "border-red-400" : "border-transparent"}
              focus-within:ring-2 focus-within:ring-orange-400 transition`}
            >
              <Mail size={18} className="text-gray-500" />
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full bg-transparent outline-none px-2 py-3 text-sm sm:text-base text-gray-900 placeholder-gray-400"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
              />
            </div>

            {/* ERROR */}
            {error && (
              <p className="text-red-500 text-sm text-center animate-pulse">
                {error}
              </p>
            )}

            {/* SUCCESS */}
            {message && (
              <p className="text-green-600 text-sm text-center font-medium">
                {message}
              </p>
            )}

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 active:scale-95 transition duration-150 disabled:opacity-70"
            >
              {loading ? (
                "Sending..."
              ) : (
                "Send Reset Link"
              )}
            </button>
          </form>

          {/* INFO */}
          {message && (
            <p className="mt-6 text-center text-gray-500 text-sm leading-relaxed">
              Check your email and follow the instructions to reset your password.
            </p>
          )}
        </div>

        {/* FOOTER */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Secure password recovery powered by LabourConnect
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;