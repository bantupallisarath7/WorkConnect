import React, { useState, useMemo } from "react";
import { X, Star, BadgeCheck, IndianRupee, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";

const WorkerMaxCard = ({ worker, onClose }) => {
  const navigate = useNavigate();

  const [selectedSkill, setSelectedSkill] = useState(null);

  const validSkills = useMemo(() => {
    return (worker.skills || []).filter((s) => s.name);
  }, [worker.skills]);

  const totalCost = selectedSkill ? selectedSkill.wage : 0;

  const handleConfirm = () => {
    if (!selectedSkill) return;

    navigate("/booking", {
      state: {
        partner: worker,
        partnerType: "worker",

        bookingData: {
          workerDetails: {
            skill: selectedSkill.name, // ✅ match backend
          },
        },

        totalCost: Number(selectedSkill.wage) || 0,
      },
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 px-3">

      {/* CARD */}
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">

        {/* HEADER */}
        <div className="flex justify-between items-center px-5 py-4 border-b">

          <div>
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-1">
              {worker.name}
              <BadgeCheck size={14} className="text-blue-500" />
            </h2>

            <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
              <span className="flex items-center gap-1 text-yellow-500">
                <Star size={12} fill="currentColor" />
                {worker.rating || 0}
              </span>
              <span>{worker.totalJobs || 0}+ jobs</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <X size={16} />
          </button>
        </div>

        {/* BODY */}
        <div className="overflow-y-auto px-4 py-3 space-y-3">

          <h3 className="text-sm font-semibold text-gray-700">
            Select Skill
          </h3>

          {validSkills.length === 0 ? (
            <p className="text-xs text-gray-400">No skills available</p>
          ) : (
            validSkills.map((skill, i) => (
              <div
                key={i}
                onClick={() => setSelectedSkill(skill)}
                className={`flex justify-between items-center px-3 py-3 rounded-xl cursor-pointer transition border
                  ${selectedSkill?.name === skill.name
                    ? "bg-blue-100 border-blue-300"
                    : "bg-gray-50 hover:bg-gray-100 border-transparent"
                  }`}
              >
                {/* LEFT */}
                <div className="flex flex-col">
                  <p className="text-sm font-semibold text-gray-900 capitalize">
                    {skill.name}
                  </p>

                  <div className="flex items-center gap-3 text-gray-500 text-xs rounded-full px-2 py-0.5 bg-gray-200">

                    <div className="flex items-center gap-1">
                      <Briefcase size={12} />
                      <span>{skill.experience} yrs</span>
                    </div>

                  </div>
                </div>

                {/* RIGHT */}
                <div className="text-green-600 font-semibold flex items-center">
                  <IndianRupee size={14} />
                  {skill.wage}
                </div>
              </div>
            ))
          )}
        </div>

        {/* FOOTER */}
        <div className="px-4 py-3 border-t bg-white">

          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Total</span>
            <span className="text-lg font-bold text-green-600">
              ₹{totalCost}
            </span>
          </div>

          <button
            onClick={handleConfirm}
            disabled={!selectedSkill}
            className={`w-full py-2.5 rounded-lg text-sm font-semibold transition ${selectedSkill
              ? "bg-blue-500 text-white hover:bg-blue-600"
              : "bg-gray-200 text-gray-500"
              }`}
          >
            Book Worker
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkerMaxCard;