import React, { useState } from "react";
import { Star, BadgeCheck, Briefcase, IndianRupee } from "lucide-react";
import useLockScroll from "../utils/useLockScroll";
import WorkerMaxCard from "./WorkerMaxCard";
import PublicProfile from "../Pages/Partner/PublicProfile";

const WorkerCard = ({ data }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  useLockScroll(showDetails);
  useLockScroll(showProfile)

  const worker = {
    ...data,
    name: data?.name,
    rating: data?.rating || 0,
    totalJobs: data?.totalJobs || 0,
    skills: data?.skills || [],
    isAvailable: data?.availability?.isAvailable,
  };

  // pick valid skills
  const validSkills = worker.skills?.filter((s) => s.name) || [];

  return (
    <>
      <div className="group bg-white rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100">

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div
            onClick={() => setShowProfile(true)}
            className="flex items-center gap-3 cursor-pointer group/header"
          >

            <div className="w-11 h-11 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-lg">
              {worker.name?.charAt(0) || "W"}
            </div>

            <div>
              <h3 className="text-base font-semibold text-gray-900 flex items-center gap-1 group-hover/header:text-blue-600 transition">
                {worker.name || "N/A"}
                <BadgeCheck size={16} className="text-blue-500" />
              </h3>

              <p className="text-xs text-gray-500">
                Worker
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-yellow-500 text-sm bg-yellow-50 px-2 py-1 rounded-md">
            <Star size={14} fill="currentColor" />
            {worker.rating}
          </div>
        </div>

        {/* META */}
        <div className="flex items-center justify-between mt-4 text-sm">
          <div className="flex items-center gap-1 text-gray-600">
            <Briefcase size={14} />
            {worker.totalJobs}+ jobs
          </div>

          <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs font-medium">
            Worker
          </span>
        </div>

        {/* SKILLS */}
        <div className="mt-4 space-y-2">

          {validSkills.length === 0 ? (
            <p className="text-xs text-gray-400">No skills added</p>
          ) : (
            validSkills.slice(0, 3).map((skill, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-gray-50 hover:bg-blue-50 px-3 py-2 rounded-lg text-sm transition"
              >
                {/* LEFT */}
                <div className="flex items-center gap-2">
                  <span className="capitalize text-gray-900 font-medium">
                    {skill.name}
                  </span>

                  <div className="flex items-center gap-3 text-gray-500 text-xs rounded-full px-2 py-0.5 bg-gray-200">

                    <div className="flex items-center gap-1">
                      <Briefcase size={12} />
                      <span>{skill.experience} yrs</span>
                    </div>

                  </div>
                </div>

                {/* RIGHT */}
                <div className="flex items-center text-green-600 font-semibold">
                  <IndianRupee size={14} />
                  {skill.wage}
                </div>
              </div>
            ))
          )}

          {/* + MORE */}
          {validSkills.length > 3 && (
            <p className="text-xs text-blue-500 font-medium pl-1">
              +{validSkills.length - 3} more skills
            </p>
          )}

        </div>

        {/* FOOTER */}
        <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">

          <p className="text-xs text-gray-500">
            {validSkills.length} skills available
          </p>

          <button
            onClick={() => setShowDetails(true)}
            className="flex items-center gap-2 bg-blue-500 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-blue-600 transition shadow-sm"
          >
            Book now
          </button>

        </div>
      </div>

      {showDetails && (
        <WorkerMaxCard
          worker={worker}
          onClose={() => setShowDetails(false)}
        />
      )}

      {showProfile && (
        <PublicProfile
          worker={worker}
          onClose={() => setShowProfile(false)}
        />
      )}
    </>
  );
};

export default WorkerCard;