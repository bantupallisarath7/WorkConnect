import React, { useState } from "react";
import {
  Star,
  IndianRupee,
  ArrowRight,
  Users,
  BadgeCheck,
} from "lucide-react";
import ConnectorMaxCard from "./ConnectorMaxCard";

const ConnectorMinCard = () => {
  const [showDetails, setShowDetails] = useState(false);

  const connector = {
    name: "Sarath Kumar",
    rating: 4.5,
    totalJobs: 120,
    commissionRate: 5,
    isAvailable: true,
    skills: [
      { name: "mason", wage: 1100, count: 20 },
      { name: "carpenter", wage: 1500, count: 6 },
      { name: "driver", wage: 1000, count: 9 },
    ],
  };

  return (
    <>
      <div
        className="group w-full bg-white rounded-2xl border border-gray-200 shadow-sm
        p-4 sm:p-5 hover:shadow-xl hover:-translate-y-1 transition duration-300"
      >
        {/* TOP SECTION */}
        <div className="flex justify-between items-start gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-1">
              {connector.name}
              <BadgeCheck size={16} className="text-orange-500" />
            </h3>

            <p className="text-xs text-gray-500 mt-1">
              Trusted Connector
            </p>

            {/* Availability */}
            <span
              className={`mt-1 inline-block text-xs px-2 py-0.5 rounded-full font-medium ${connector.isAvailable
                  ? "bg-green-100 text-green-600"
                  : "bg-red-100 text-red-500"
                }`}
            >
              {connector.isAvailable ? "Available" : "Busy"}
            </span>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1 text-yellow-500 text-sm font-medium bg-yellow-50 px-2 py-1 rounded-md">
            <Star size={14} fill="currentColor" />
            {connector.rating}
          </div>
        </div>

        {/* META INFO */}
        <div className="flex flex-wrap items-center gap-3 mt-3 text-xs sm:text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Users size={14} />
            {connector.totalJobs}+ jobs
          </div>

          <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full text-xs font-medium">
            {connector.commissionRate}% commission
          </span>
        </div>

        {/* SKILLS PREVIEW */}
        <div className="mt-4 flex flex-wrap gap-2">
          {connector.skills.slice(0, 3).map((skill) => (
            <div
              key={skill.name}
              className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full text-xs sm:text-sm"
            >
              <span className="capitalize text-gray-900 font-medium">
                {skill.name}
              </span>

              {/* Wage */}
              <span className="flex items-center text-green-600 font-semibold">
                <IndianRupee size={12} />
                {skill.wage}
              </span>

              {/* Count */}
              <span className="text-gray-500 text-xs">
                ({skill.count})
              </span>
            </div>
          ))}
        </div>

        {/* FOOTER */}
        <div className="mt-5 flex items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            {connector.skills.length}+ worker types available
          </p>

          <button
            onClick={() => setShowDetails(true)}
            className="flex items-center gap-2 bg-orange-500 text-white 
            px-4 py-2 rounded-lg font-semibold text-sm
            hover:bg-orange-600 active:scale-95 transition"
          >
            View Workers
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* MODAL */}
      {showDetails && (
        <ConnectorMaxCard
          mediator={connector}
          onClose={() => setShowDetails(false)}
        />
      )}
    </>
  );
};

export default ConnectorMinCard;