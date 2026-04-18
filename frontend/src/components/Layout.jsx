import React from "react";
import { Outlet } from "react-router-dom";
import PublicNavbar from "../Pages/LandingPage/Navbar";
import Navbar from "../Pages/User/Navbar";
import PartnerNavbar from "../Pages/Partner/Navbar";
import { useSelector } from "react-redux";

const Layout = () => {
  const { currentUser } = useSelector((state) => state.auth);

  const renderNavbar = () => {
    if (!currentUser) return <PublicNavbar />;

    switch (currentUser.role) {
      case "user":
        return <Navbar />;
      case "connector":
        return <PartnerNavbar role="connector" />;
      case "worker":
        return <PartnerNavbar role="worker" />;
      default:
        return <PublicNavbar />;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {renderNavbar()}

      <main className="pt-20 px-4 sm:px-6 md:px-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;