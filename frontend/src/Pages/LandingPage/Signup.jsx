import React, { useState, useEffect } from "react";
import { Mail, Lock, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import useLockScroll from "../../utils/useLockScroll.js";

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  useLockScroll(showOTPModal);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const role = "user";
  const [formError, setFormError] = useState("");

  const [otp, setOtp] = useState(["", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [error, setError] = useState("");
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);


  const navigate = useNavigate();

  // Validation
  const validateForm = () => {
    const { name, email, password } = formData;

    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Invalid email");
      return;
    }
    if (!password) {
      setError("Password is required");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setError("");
    return null;
  };

  // Signup
  const handleSignup = async (e) => {
    e.preventDefault();

    if (loading) return;

    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      setLoading(true);
      setFormError("");

      const res = await axios.post(
        "https://workconnect-0306.onrender.com/api/auth/signup",
        { ...formData, role }, // dynamic role
        { withCredentials: true }
      );

      if (res?.data?.success) {
        setShowOTPModal(true);
      } else {
        setFormError(res?.data?.message || "Signup failed");
      }

    } catch (err) {
      setFormError(
        err?.response?.data?.message || err.message || "Signup failed"
      );
    } finally {
      setLoading(false);
    }
  };

  // OTP Change
  const handleOtpChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < otp.length - 1) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  // Backspace navigation
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  // Verify OTP
  const handleVerify = async () => {
    const enteredOtp = otp.join("");

    // Important validation
    if (enteredOtp.length !== otp.length) {
      setError("Please enter complete OTP");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await axios.post(
        "https://workconnect-0306.onrender.com/api/auth/verify-otp",
        {
          email: formData.email,
          otp: enteredOtp,
        }
      );

      if (res?.data?.success) {
        setVerified(true);

        // Redirect after success
        setTimeout(() => {
          navigate("/signin");
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Enter correct OTP");
    } finally {
      setLoading(false);
    }
  };

  // Better Timer (fixed bug)
  useEffect(() => {
    if (!showOTPModal) return;

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showOTPModal]);

  // Reset modal state
  useEffect(() => {
    if (!showOTPModal) {
      setTimer(60);
      setOtp(["", "", "", ""]);
      setError("");
      setVerified(false);
    }
  }, [showOTPModal]);

  // Prevent scroll
  useEffect(() => {
    document.body.style.overflow = showOTPModal ? "hidden" : "auto";
  }, [showOTPModal]);

  // Focus first OTP input
  useEffect(() => {
    if (showOTPModal) {
      setTimeout(() => {
        document.getElementById("otp-0")?.focus();
      }, 100);
    }
  }, [showOTPModal]);

  // Resend OTP
  const handleResend = async () => {
    if (loading) return;

    try {
      setLoading(true);
      setTimer(60);

      await axios.post("https://workconnect-0306.onrender.com/api/auth/resend-otp", {
        email: formData.email,
      });

      setOtp(["", "", "", ""]);
      setError("");
      setVerified(false);
    } catch (err) {
      setError("Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="flex items-center justify-center px-5 min-h-[calc(100vh-64px)]">
        <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-lg p-5 sm:p-6 md:p-8">

          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Create an Account
            </h2>
            <p className="text-gray-500 mt-2 text-sm">
              Join WorkConnect to find trusted workers
            </p>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleSignup}>

            <div className={`flex items-center bg-gray-100 rounded-xl px-3 border
              ${error ? "border-red-400" : "border-transparent"}
              focus-within:ring-2 focus-within:ring-orange-400 transition`}>
              <User size={18} className="text-gray-500" />
              <input
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full bg-transparent outline-none px-2 py-3 text-sm"
              />
            </div>

            <div className={`flex items-center bg-gray-100 rounded-xl px-3 border
              ${error ? "border-red-400" : "border-transparent"}
              focus-within:ring-2 focus-within:ring-orange-400 transition`}>
              <Mail size={18} className="text-gray-500" />
              <input
                type="email"
                placeholder="Email Address"
                disabled={showOTPModal}   // lock email
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full bg-transparent outline-none px-2 py-3 text-sm"
              />
            </div>

            <div className={`flex items-center bg-gray-100 rounded-xl px-3 border
              ${error ? "border-red-400" : "border-transparent"}
              focus-within:ring-2 focus-within:ring-orange-400 transition`}>
              <Lock size={18} className="text-gray-500" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full bg-transparent outline-none px-2 py-3 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-xs text-gray-500 ml-2 whitespace-nowrap"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            {formError && (
              <p className="text-red-500 text-sm text-center animate-pulse">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 active:scale-95 transition duration-150 disabled:opacity-70"
            >
              {loading ? "Processing..." : "Create"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{" "}
            <Link
              to="/signin"
              className="text-orange-500 font-medium hover:underline"
            >
              Signin
            </Link>
          </p>

        </div>
      </div>

      {showOTPModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="w-full max-w-md bg-gray-900 text-white rounded-2xl shadow-2xl p-5 sm:p-6 md:p-8">

            <div className="text-center">
              <h3 className="text-2xl font-bold">Verify your email</h3>
              <p className="text-sm text-gray-400 mt-1">
                Enter the OTP sent to your email
              </p>
            </div>

            <div className="mt-4 bg-gray-800 rounded-xl px-3 py-2 text-sm text-gray-300 text-center">
              {formData.email}
            </div>

            <div className="flex justify-center gap-2 sm:gap-3 mt-6">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(e.target.value, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-center text-lg md:text-xl bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none"
                />
              ))}
            </div>

            {error && (
              <p className="text-red-400 text-sm text-center mt-4">{error}</p>
            )}

            {verified && (
              <p className="text-green-400 text-center mt-4 text-lg">
                Verified Successfully
              </p>
            )}

            <div className="text-center mt-4">
              {timer > 0 ? (
                <p className="text-gray-400 text-sm">
                  Resend OTP in {timer}s
                </p>
              ) : (
                <button
                  onClick={handleResend}
                  className="text-orange-400 text-sm hover:underline"
                >
                  Resend OTP
                </button>
              )}
            </div>

            <button
              onClick={handleVerify}
              disabled={otp.some((d) => d === "") || loading}
              className={`w-full mt-5 py-3 rounded-xl font-semibold transition duration-150 ${otp.some((d) => d === "")
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-orange-500 hover:bg-orange-600 text-white"
                }`}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            <button
              onClick={() => {
                setShowOTPModal(false);
                setOtp(["", "", "", ""]);
              }}
              className="w-full mt-2 text-gray-400 text-sm hover:underline"
            >
              Cancel
            </button>

          </div>
        </div>
      )}
    </div>
  );
};

export default Signup;