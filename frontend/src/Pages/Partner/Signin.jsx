import React, { useState } from "react";
import { Mail, Lock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";
import {
  signInStart,
  signInSuccess,
  signInFailure,
} from "../../../redux/auth/authSlice";

const Signin = ({ role }) => {
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const roleConfig = {
    connector: {
      title: "Connector Sign in",
      subtitle: "Continue managing your network",
      redirect: "/connector/dashboard",
      signup: "/connector-signup",
    },
    worker: {
      title: "Worker Sign in",
      subtitle: "Continue your work",
      redirect: "/worker/dashboard",
      signup: "/worker-signup",
    },
  };

  const config = roleConfig[role];



  const validate = () => {
    const { email, password } = formData;

    if (!email || !password) {
      setError("Email and password are required");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Enter a valid email");
      return false;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }

    setError("");
    return true;
  };

  // ✅ SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      dispatch(signInStart());

      const res = await axios.post(
        "http://localhost:7265/api/auth/signin",
        { ...formData, role },
        { withCredentials: true }
      );

      if (res?.data?.success === false) {
        setError(res.data.message);
        dispatch(signInFailure(res.data.message));
        return;
      }

      dispatch(signInSuccess(res.data.user));

      navigate(config.redirect);

    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "Something went wrong. Please try again.";

      setError(msg);
      dispatch(signInFailure(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="flex items-center justify-center px-5 min-h-[calc(100vh-64px)]">

        <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-lg p-5 sm:p-6 md:p-8">

          {/* HEADER */}
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              {config.title}
            </h2>
            <p className="text-gray-500 mt-2 text-sm">
              {config.subtitle}
            </p>
          </div>

          {/* FORM */}
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>

            {/* EMAIL */}
            <div className={`flex items-center bg-gray-100 rounded-xl px-3 border
              ${error ? "border-red-400" : "border-transparent"}
              focus-within:ring-2 focus-within:ring-orange-400 transition`}>
              <Mail size={18} className="text-gray-500" />
              <input
                type="email"
                placeholder="Email Address"
                className="w-full bg-transparent px-2 py-3 outline-none text-sm"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            {/* PASSWORD */}
            <div className="flex flex-col">
              <div className={`flex items-center bg-gray-100 rounded-xl px-3 border
              ${error ? "border-red-400" : "border-transparent"}
              focus-within:ring-2 focus-within:ring-orange-400 transition`}>
                <Lock size={18} className="text-gray-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="w-full bg-transparent px-2 py-3 outline-none text-sm"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs text-gray-500 ml-2"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              {/* ERROR */}
              {error && (
                <p className="text-red-500 text-xs text-center mt-2 animate-pulse">
                  {error}
                </p>
              )}
            </div>

            {/* OPTIONS */}
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

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 active:scale-95 transition duration-150 disabled:opacity-70"
            >
              {loading ? "Logging in..." : "Continue"}
            </button>
          </form>

          {/* FOOTER */}
          <p className="text-center text-sm text-gray-500 mt-5">
            Don't have an account?{" "}
            <Link
              to={config.signup}
              className="text-orange-500 font-medium hover:underline"
            >
              {role === "connector" ? "Join as Connector" : "Join as Worker"}
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
};

export default Signin;