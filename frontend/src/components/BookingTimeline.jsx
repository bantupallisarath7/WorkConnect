import React from "react";
import { CheckCircle } from "lucide-react";

const steps = [
  "Booking Placed",
  "Booking Accepted",
  "Workers Assigned",
  "Work Started",
  "Completed",
];

const BookingTimeline = ({ status, bookingDate, manualComplete }) => {
  const getCurrentStep = () => {
    switch (status) {
      case "pending":
        return 2;
      case "accepted":
        return 3;
      case "inProgress":
        return 4;
      case "completed":
        return 5;
      case "cancelled":
        return -1;
      default:
        return 2;
    }
  };
  const isAfter8Hours = (bookingDate) => {
    if (!bookingDate) return false;

    const start = new Date(bookingDate).getTime();
    const now = new Date().getTime();

    const diffHours = (now - start) / (1000 * 60 * 60);

    return diffHours >= 8;
  };

  const currentStep = getCurrentStep();



  // ❌ CANCELLED STATE (Improved)
  if (status === "cancelled") {
    return (
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
        <h3 className="text-base font-semibold text-gray-900 mb-4">
          Booking Status
        </h3>

        <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl">
          <span className="text-lg">❌</span>
          <p className="text-sm font-medium">
            This booking has been cancelled
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">

      {/* HEADER */}
      <div className="mb-6">
        <h3 className="text-base font-semibold text-gray-900">
          Booking Progress
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          Track the current status of your booking
        </p>
      </div>

      {/* TIMELINE */}
      <div className="relative">
        {steps.map((step, index) => {

          const isFinalCompleted =
            status === "completed" ||
            (status === "inProgress" &&
              (manualComplete || isAfter8Hours(bookingDate)));

          const isCompleted = (i) => {
            if (isFinalCompleted) return true;
            return i < currentStep - 1;
          };

          const isActive = (i) => {
            if (isFinalCompleted) return false;
            return i === currentStep - 1;
          };

          const isUpcoming = (i) => {
            if (isFinalCompleted) return false;
            return i > currentStep - 1;
          };

          // ✅ CALL functions here
          const completed = isCompleted(index);
          const active = isActive(index);
          const upcoming = isUpcoming(index);

          return (
            <div key={index} className="flex items-start gap-4 relative">

              {/* LINE */}
              {index !== steps.length - 1 && (
                <span
                  className={`absolute left-[11px] top-7 w-[2px] h-[calc(100%-8px)]
            ${index < currentStep - 1
                      ? "bg-green-500"
                      : "bg-gray-200"
                    }`}
                />
              )}

              {/* STEP ICON */}
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0
          transition-all duration-300
          ${completed
                    ? "bg-green-500 text-white"
                    : active
                      ? "bg-orange-500 text-white ring-4 ring-orange-100"
                      : "bg-gray-200 text-gray-400"
                  }`}
              >
                {completed ? (
                  <CheckCircle size={14} />
                ) : (
                  <span className="text-[10px] font-semibold">
                    {index + 1}
                  </span>
                )}
              </div>

              {/* CONTENT */}
              <div className="pb-8 flex-1">

                {/* TITLE */}
                <p
                  className={`text-sm sm:text-base font-medium
            ${completed
                      ? "text-green-600"
                      : active
                        ? "text-orange-600"
                        : "text-gray-500"
                    }`}
                >
                  {step}
                </p>

                {/* STATUS TEXT */}
                <p className="text-xs mt-1">
                  {completed && (
                    <span className="text-green-500">Completed</span>
                  )}

                  {active && (
                    <span className="text-orange-500 font-medium">
                      In progress
                    </span>
                  )}

                  {upcoming && (
                    <span className="text-gray-400">Pending</span>
                  )}
                </p>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BookingTimeline;