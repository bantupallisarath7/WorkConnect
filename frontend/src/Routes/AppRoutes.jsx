import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import Layout from "../components/Layout";
import ProtectedRoutes from "./ProtectedRoutes";

import Home from "../Pages/LandingPage/Home";
import Signin from "../Pages/LandingPage/Signin";
import Signup from "../Pages/LandingPage/Signup";
import ForgotPassword from "../Pages/LandingPage/ForgotPassword";
import ResetPassword from "../Pages/LandingPage/ResetPassword";
import About from "../Pages/LandingPage/About";

import HomeSection from "../Pages/SearchPage/HomeSection";
import MyBookings from "../Pages/User/MyBookings";
import Profile from "../Pages/User/Profile";
import Dashboard from "../Pages/User/Dashboard";
import BookingPage from "../Pages/User/BookingPage";

import PartnerSignup from "../Pages/Partner/Signup";
import PartnerSignin from "../Pages/Partner/Signin";
import PartnerDashboard from "../Pages/Partner/Dashboard";
import PartnerProfile from "../Pages/Partner/Profile";

import ManageWorkers from "../Pages/Partner/ManageWorkers";
import ManageBookings from "../Pages/Partner/ManageBookings";
import PartnerEarnings from "../Pages/Partner/Earnings";
import PartnerReviews from "../Pages/Partner/Reviews";
import HelpPage from "../Pages/Partner/HelpPage";

const AppRoutes = () => {
  const currentUser = useSelector((state) => state.auth.currentUser);

  const getRedirectPath = (role) => {
    switch (role) {
      case "user":
        return "/dashboard";
      case "connector":
        return "/connector-dashboard";
      case "worker":
        return "/worker-dashboard";
      default:
        return "/";
    }
  };

  return (
    <Routes>
      <Route element={<Layout />}>

        <Route
          path="/"
          element={
            currentUser
              ? <Navigate to={getRedirectPath(currentUser.role)} />
              : <Home />
          }
        />

        <Route path="/signin" element={<Signin />} />

        <Route
          path="/signup"
          element={
            currentUser
              ? <Navigate to={getRedirectPath(currentUser.role)} />
              : <Signup />
          }
        />

        //Workers routes
        <Route path="/worker-signup" element={<PartnerSignup role="worker" />} />
        <Route
          path="/worker-signin"
          element={<PartnerSignin role="worker" />}
        />


        <Route path="/about" element={<About />} />

        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        // Connectors routes
        <Route path="/connector-signup" element={<PartnerSignup role="connector" />} />
        <Route
          path="/connector-signin"
          element={<PartnerSignin role="connector" />}
        />




        <Route path="/search" element={<HomeSection />} />

        <Route element={<ProtectedRoutes allowedRoles={["user"]} />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/mybookings" element={<MyBookings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/booking" element={<BookingPage />} />
        </Route>

        <Route element={<ProtectedRoutes allowedRoles={["connector"]} />}>
          <Route path="/connector-dashboard" element={<PartnerDashboard />} />
          <Route path="/connector-profile" element={<PartnerProfile />} />
          <Route path="/manage-bookings" element={<ManageBookings />} />
          <Route path="/manage-workers" element={<ManageWorkers />} />
          <Route path="/connector-earnings" element={<PartnerEarnings />} />
          <Route path="/connector-reviews" element={<PartnerReviews />} />

        </Route>

        <Route element={<ProtectedRoutes allowedRoles={["worker"]} />}>
          <Route path="/worker-dashboard" element={<PartnerDashboard />} />
          <Route path="/worker-profile" element={<PartnerProfile />} />
          <Route path="/worker-bookings" element={<ManageBookings />} />
          <Route path="/worker-earnings" element={<PartnerEarnings />} />
          <Route path="/worker-reviews" element={<PartnerReviews />} />

        </Route>
        <Route element={<ProtectedRoutes allowedRoles={["user", "connector", "worker"]} />}>
          <Route path="/help" element={<HelpPage />} />
        </Route>

      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;