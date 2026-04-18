import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { Lock, Loader2, ArrowLeft } from "lucide-react";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset link.");
    }
  }, [token]);

  const validate = () => {
    if (!password || !confirmPassword) {
      return "Both fields are required";
    }
    if (password.length < 6) {
      return "Password must be at least 6 characters";
    }
    if (password !== confirmPassword) {
      return "Passwords do not match";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      setMessage("");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await axios.post(
        `http://localhost:7265/api/auth/reset-password/${token}`,
        { password }
      );

      setMessage(res.data.message || "Password reset successful");
      setPassword("");
      setConfirmPassword("");

      setTimeout(() => navigate("/signin"), 2000);

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Invalid or expired reset link"
      );
      setMessage("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-10">

      <div className="max-w-md mx-auto">

        {/* BACK BUTTON */}
        <button
          onClick={() => navigate("/signin")}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-orange-500 transition mb-8"
        >
          <ArrowLeft size={16} />
          Back to Login
        </button>

        {/* HEADER */}
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            Reset Password
          </h2>
          <p className="text-gray-500 mt-3 text-sm sm:text-base">
            Create a new secure password for your account
          </p>
        </div>

        {/* CARD */}
        <div className="bg-white/80 backdrop-blur-md border border-gray-200 rounded-3xl shadow-xl p-6 sm:p-8 transition">

          <form className="space-y-5" onSubmit={handleSubmit}>

            {/* PASSWORD */}
            <div className="flex items-center bg-gray-100 rounded-xl px-3 focus-within:ring-2 focus-within:ring-orange-400 transition">
              <Lock size={18} className="text-gray-500" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New password"
                className="w-full bg-transparent outline-none px-2 py-3 text-sm sm:text-base"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-xs text-gray-500 hover:text-gray-700 ml-2 whitespace-nowrap"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            {/* CONFIRM PASSWORD */}
            <div className="flex items-center bg-gray-100 rounded-xl px-3 focus-within:ring-2 focus-within:ring-orange-400 transition">
              <Lock size={18} className="text-gray-500" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Confirm password"
                className="w-full bg-transparent outline-none px-2 py-3 text-sm sm:text-base"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
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
              disabled={loading || !token}
              className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold hover:from-orange-600 active:scale-95 transition duration-150 disabled:opacity-70"
            >
              {loading ? (
                "Resetting..."
              ) : (
                "Reset Password"
              )}
            </button>

          </form>

          {/* FOOTER INFO */}
          {message && (
            <p className="mt-6 text-center text-gray-500 text-sm">
              Redirecting to login...
            </p>
          )}
        </div>

        {/* SMALL FOOTER */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Secure password reset • LabourConnect
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;