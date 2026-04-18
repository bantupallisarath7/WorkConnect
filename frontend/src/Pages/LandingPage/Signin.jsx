import React, { useState } from "react";
import { Mail, Lock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import Navbar from "./Navbar";
import axios from "axios";
import { signInStart, signInSuccess, signInFailure } from "../../../redux/auth/authSlice";


const Signin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const validate = () => {
    if (!email || !password) {
      setError("Email and password are required");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      dispatch(signInStart());
      const res = await axios.post(
        "https://workconnect-0306.onrender.com/api/auth/signin",
        { email, password },
        { withCredentials: true }
      );
      if (res.data.success === false) {
        dispatch(signInFailure(res.data.message));
        return;
      }
      dispatch(signInSuccess(res.data.user));
      navigate("/dashboard");
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Something went wrong. Please try again."
      );
      dispatch(signInFailure(err.response?.data?.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* FIXED WRAPPER */}
      <div className="flex justify-center items-start md:items-center min-h-[calc(100dvh-5rem)] px-4 py-6">
        <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-lg p-5 sm:p-6 md:p-8">

          {/* Header */}
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Welcome Back
            </h2>
            <p className="text-gray-500 mt-2 text-sm">
              Login to continue using WorkConnect
            </p>
          </div>

          {/* Form */}
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>

            {/* Email */}
            <div
              className={`flex items-center bg-gray-100 rounded-xl px-3 border
              ${error ? "border-red-400" : "border-transparent"}
              focus-within:ring-2 focus-within:ring-orange-400 transition`}>
              <Mail size={18} className="text-gray-500" />
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full bg-transparent outline-none px-2 py-3 text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password */}
            <div className="flex flex-col">
              <div className={`flex items-center bg-gray-100 rounded-xl px-3 border
              ${error ? "border-red-400" : "border-transparent"}
              focus-within:ring-2 focus-within:ring-orange-400 transition`}>
                <Lock size={18} className="text-gray-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="w-full bg-transparent outline-none px-2 py-3 text-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs text-gray-500 hover:text-gray-700 ml-2 whitespace-nowrap"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              {error && (
                <span className="text-red-500 text-xs text-center mt-2 animate-pulse">
                  {error}
                </span>
              )}
            </div>

            {/* Options */}
            <div className="flex justify-between items-center text-sm text-gray-500">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="accent-orange-500" />
                Remember me
              </label>

              <Link
                to="/forgot-password"
                className="hover:text-orange-500 transition"
              >
                Forgot password?
              </Link>
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 active:scale-95 transition duration-150 disabled:opacity-70"
            >
              {loading ? "Logging in..." : "Continue"}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-sm text-gray-500 mt-5">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-orange-500 font-medium hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signin;