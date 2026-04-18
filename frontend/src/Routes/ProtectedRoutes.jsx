import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoutes = ({ allowedRoles }) => {
  const currentUser = useSelector((state) => state.auth.currentUser);

  if (!currentUser) {
    if (allowedRoles.includes("worker")) return <Navigate to="/worker-signin" />;
    if (allowedRoles.includes("connector")) return <Navigate to="/connector-signin" />;
    return <Navigate to="/signin" />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/" />;
  }

  return <Outlet />;
};

export default ProtectedRoutes;