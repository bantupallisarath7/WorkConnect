import React from "react";
import Navbar from "./Navbar";
import Home from "./Home";
const LandingPage = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <main className="pt-16 md:pt-20">
        <Home />
      </main>
    </div>
  );
};

export default LandingPage;