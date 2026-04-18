import React, { useState, useMemo } from "react";
import {
  Users,
  Minus,
  Plus,
  X,
  Star,
  BadgeCheck,
  IndianRupee,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const ConnectorMaxCard = ({ connector, onClose }) => {
  const navigate = useNavigate();

  const [quantities, setQuantities] = useState(
    (connector.workers || [])
      .filter((w) => w.count > 0)
      .reduce((acc, worker) => {
        acc[worker.skill] = 0;
        return acc;
      }, {})
  );
  const validWorkers = useMemo(() => {
    return (connector.workers || []).filter((w) => w.count > 0);
  }, [connector]);

  const handleChange = (worker, delta) => {
    setQuantities((prev) => {
      const current = prev[worker.skill] || 0;

      return {
        ...prev,
        [worker.skill]: Math.max(
          0,
          Math.min(worker.count, current + delta)
        ),
      };
    });
  };

  const totalCost = useMemo(() => {
    return validWorkers.reduce((total, worker) => {
      return total + quantities[worker.skill] * worker.wage;
    }, 0);
  }, [quantities, validWorkers]);

  const selectedSummary = validWorkers
    .filter((worker) => quantities[worker.skill] > 0)
    .map((worker) => `${quantities[worker.skill]} ${worker.skill}`)
    .join(" • ");

  const hasSelection = totalCost > 0;

  const handleConfirm = () => {
    const workersPayload = validWorkers
      .filter((w) => quantities[w.skill] > 0)
      .map((w) => ({
        worker: w._id,
        skill: w.skill,   // ✅ needed for UI
        wage: w.wage,     // ✅ needed for frontend calculation
        count: quantities[w.skill],
      }));

    if (workersPayload.length === 0) return;

    navigate("/booking", {
      state: {
        partner: connector,
        partnerType: "connector",
        bookingData: {
          workers: workersPayload,
        },
        totalCost,
      },
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 px-3">

      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">

        {/* HEADER */}
        <div className="flex justify-between items-center px-5 py-4 border-b">

          <div>
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-1">
              {connector.name}
              <BadgeCheck size={14} className="text-orange-500" />
            </h2>

            <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
              <span className="flex items-center gap-1 text-yellow-500">
                <Star size={12} fill="currentColor" />
                {connector.rating || 0}
              </span>
              <span>{connector.totalJobs || 0}+ jobs</span>
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

          {validWorkers.map((worker) => (
            <div
              key={worker._id || worker.skill}
              className="flex justify-between items-center bg-gray-50 hover:bg-gray-100 shadow-md rounded-xl px-3 py-2"
            >
              {/* LEFT */}
              <div>
                <p className="text-sm font-medium text-gray-900 capitalize">
                  {worker.skill}
                </p>

                <div className="flex items-center gap-2 mt-1">
                  <span className="flex items-center gap-1 text-gray-600 text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                    <Users size={12} />
                    {worker.count} available
                  </span>
                </div>

                <p className="text-green-600 text-sm font-semibold flex items-center">
                  ₹{worker.wage}
                  <span className="text-gray-400 text-xs ml-1">/day</span>
                </p>
              </div>

              {/* CONTROLS */}
              <div className="flex items-center gap-2 bg-white shadow-md rounded-full px-2 py-1">

                <button
                  onClick={() => handleChange(worker, -1)}
                  disabled={quantities[worker.skill] === 0}
                  className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-40"
                >
                  <Minus size={14} />
                </button>

                <span className="w-5 text-center text-sm font-semibold">
                  {quantities[worker.skill]}
                </span>

                <button
                  onClick={() => handleChange(worker, 1)}
                  disabled={quantities[worker.skill] === worker.count}
                  className="p-1 rounded-full bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-40"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          ))}

        </div>

        {/* FOOTER */}
        <div className="px-4 py-3 border-t bg-white">

          {selectedSummary && (
            <p className="text-xs text-gray-500 mb-2 truncate">
              {selectedSummary}
            </p>
          )}

          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Total</span>
            <span className="text-lg font-bold text-green-600">
              ₹{totalCost}
            </span>
          </div>

          <button
            onClick={handleConfirm}
            disabled={!hasSelection}
            className={`w-full py-2.5 rounded-lg text-sm font-semibold ${hasSelection
              ? "bg-orange-500 text-white hover:bg-orange-600"
              : "bg-gray-200 text-gray-500"
              }`}
          >
            Book Now
          </button>
        </div>

      </div>
    </div>
  );
};

export default ConnectorMaxCard;