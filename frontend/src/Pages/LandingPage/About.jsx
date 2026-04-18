import React from "react";
import { Users, Shield, Zap, User, Briefcase, Network } from "lucide-react";
import { useNavigate } from "react-router-dom";

const About = () => {
  const navigate = useNavigate()
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* HERO */}
      <section className="text-center py-16 px-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          About WorkConnect
        </h1>
        <p className="mt-4 text-gray-500 max-w-2xl mx-auto">
          A platform built to connect customers, connectors, and workers in one seamless ecosystem.
        </p>
      </section>

      {/* CORE MODEL */}
      <section className="max-w-6xl mx-auto px-4 py-12 grid md:grid-cols-3 gap-8">

        {/* CUSTOMER */}
        <div className="bg-white p-6 rounded-2xl shadow-md text-center">
          <User className="mx-auto text-orange-500" size={32} />
          <h3 className="mt-4 text-lg font-semibold">Customers</h3>
          <p className="text-gray-500 mt-2 text-sm">
            Easily find and book skilled workers for daily needs with a simple and reliable experience.
          </p>
        </div>

        {/* CONNECTOR */}
        <div className="bg-white p-6 rounded-2xl shadow-md text-center">
          <Network className="mx-auto text-orange-500" size={32} />
          <h3 className="mt-4 text-lg font-semibold">Connectors</h3>
          <p className="text-gray-500 mt-2 text-sm">
            Act as a bridge by managing groups of workers and connecting them with customers efficiently.
          </p>
        </div>

        {/* WORKER */}
        <div className="bg-white p-6 rounded-2xl shadow-md text-center">
          <Briefcase className="mx-auto text-orange-500" size={32} />
          <h3 className="mt-4 text-lg font-semibold">Workers</h3>
          <p className="text-gray-500 mt-2 text-sm">
            Receive job opportunities, manage bookings, and grow income with consistent work access.
          </p>
        </div>

      </section>

      {/* MISSION */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Our Mission
          </h2>
          <p className="mt-4 text-gray-500 leading-relaxed">
            We aim to empower local workers, simplify hiring for customers, and create earning opportunities through connectors. WorkConnect brings structure to an unorganized workforce by leveraging technology.
          </p>
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-6xl mx-auto px-4 py-12 grid md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-md text-center">
          <Users className="mx-auto text-orange-500" size={32} />
          <h3 className="mt-4 text-lg font-semibold">Organized Workforce</h3>
          <p className="text-gray-500 mt-2 text-sm">
            Structured system for managing workers through connectors.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md text-center">
          <Shield className="mx-auto text-orange-500" size={32} />
          <h3 className="mt-4 text-lg font-semibold">Secure & Trusted</h3>
          <p className="text-gray-500 mt-2 text-sm">
            Verified users, OTP confirmations, and transparent processes.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md text-center">
          <Zap className="mx-auto text-orange-500" size={32} />
          <h3 className="mt-4 text-lg font-semibold">Fast Booking</h3>
          <p className="text-gray-500 mt-2 text-sm">
            Quick and seamless booking experience for urgent needs.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-16 px-4">
        <h2 className="text-2xl font-bold text-gray-900">
          Join WorkConnect Today
        </h2>
        <p className="text-gray-500 mt-2">
          Whether you're a customer, connector, or worker, we’ve got you covered.
        </p>
        <button
          onClick={() => navigate("/signin")}
          className="mt-6 bg-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-600">
          Get Started
        </button>
      </section>
    </div>
  );
};

export default About;