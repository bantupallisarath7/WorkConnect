import React, { useState } from "react";
import {
  Star,
  Users,
  BadgeCheck,
  IndianRupee,
} from "lucide-react";
import ConnectorMaxCard from "./ConnectorMaxCard";
import useLockScroll from "../utils/useLockScroll";
import PublicProfile from "../Pages/Partner/PublicProfile";

const ConnectorCard = ({ data }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  useLockScroll(showDetails);
  useLockScroll(showProfile)

  const connector = {
    ...data,
    name: data?.name,
    rating: data?.rating || 0,
    totalJobs: data?.totalJobs || 0,
    commissionRate: data?.commissionRate || 0,
    workers: data?.workers || [],
  };
  const validWorkers = connector.workers.filter(
    (w) => w.count > 0
  );
  return (
    <>
      <div className="group bg-white rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100">

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div
            onClick={() => setShowProfile(true)}
            className="flex items-center gap-3 cursor-pointer group/header"
          >

            <div className="w-11 h-11 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-semibold text-lg">
              {connector.name?.charAt(0) || "C"}
            </div>

            <div>
              <h3 className="text-base font-semibold text-gray-900 flex items-center gap-1 group-hover/header:text-orange-600 transition">
                {connector.name || "N/A"}
                <BadgeCheck size={16} className="text-orange-500" />
              </h3>
              <p className="text-xs text-gray-500">Connector</p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-yellow-500 text-sm bg-yellow-50 px-2 py-1 rounded-md">
            <Star size={14} fill="currentColor" />
            {connector.rating}
          </div>
        </div>

        {/* META */}
        <div className="flex items-center justify-between mt-4 text-sm">
          <div className="flex items-center gap-1 text-gray-600">
            <Users size={14} />
            {connector.totalJobs}+ jobs
          </div>

          <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full text-xs font-medium">
            {connector.commissionRate}% commission
          </span>
        </div>

        {/* SKILLS */}
        <div className="mt-4 space-y-2">

          {validWorkers.length === 0 ? (
            <p className="text-xs text-gray-400">No workers available</p>
          ) : (
            validWorkers.slice(0, 4).map((worker) => (
              <div
                key={worker._id || worker.skill}
                className="flex items-center justify-between bg-gray-50 hover:bg-orange-50 px-3 py-2 rounded-lg text-sm transition"
              >
                {/* LEFT */}
                <div className="flex items-center gap-2">
                  <span className="capitalize text-gray-900 font-medium">
                    {worker.skill}
                  </span>
                  <span className="flex items-center gap-1 text-gray-500 text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                    <Users size={12} />
                    {worker.count}
                  </span>
                </div>

                
                <div className="flex items-center text-green-600 font-semibold">
                  <IndianRupee size={14} />
                  {worker.wage}
                </div>
              </div>
            ))
          )}

          {/* + MORE */}
          {validWorkers.length > 4 && (
            <p className="text-xs text-orange-500 font-medium pl-1">
              +{validWorkers.length - 4} more services
            </p>
          )}

        </div>

        {/* FOOTER */}
        <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">

          <p className="text-xs text-gray-500">
            {validWorkers.length} services available
          </p>

          <button
            onClick={() => setShowDetails(true)}
            className="flex items-center gap-2 bg-orange-500 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-orange-600 transition shadow-sm"
          >
            Book Now
          </button>

        </div>
      </div>

      {showDetails && (
        <ConnectorMaxCard
          connector={connector}
          onClose={() => setShowDetails(false)}
        />
      )}
      {showProfile && (
        <PublicProfile
          connector={connector}
          onClose={() => setShowProfile(false)}
        />
      )}
    </>
  );
};

export default ConnectorCard;