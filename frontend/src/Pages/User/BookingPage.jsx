import React, { useState, useMemo, useEffect } from "react";
import { IndianRupee, Utensils, X, CheckCircle } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import useLockScroll from "../../utils/useLockScroll";

const BookingPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const partner = state?.partner;
  const partnerType = state?.partnerType;
  const bookingData = state?.bookingData || {};
  const workers = bookingData?.workers || [];
  const workerDetails = bookingData?.workerDetails || null;


  const isConnector = partnerType === "connector";
  const isWorker = partnerType === "worker";
  const totalCost = state?.totalCost || 0;

  useEffect(() => {
    if (!partner) {
      navigate("/dashboard", { replace: true });
    }
  }, [partner, navigate]);

  const [formData, setFormData] = useState({
    address: "",
    mealsProvided: false,
    travelCharges: "",
    contactName: "",
    contactPhone: "",
    paymentMethod: "cash",
    notes: "",
  });

  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!partner) return null;
  // Labour Cost
  const labourCost = useMemo(() => {
    if (isConnector) {
      return workers.reduce((sum, w) => {
        return sum + (Number(w.count) || 0) * (Number(w.wage) || 0);
      }, 0);
    }

    if (isWorker) {
      return totalCost || 0; // already calculated
    }

    return 0;
  }, [workers, isConnector, isWorker, totalCost]);


  //  Commission
  const commission = useMemo(() => {
    // Only connectors have commission
    if (!isConnector) return 0;

    const rate = Number(partner?.commissionRate);

    // Validate rate (avoid NaN, negative, etc.)
    if (!rate || rate <= 0) return 0;

    return (labourCost * rate) / 100;
  }, [labourCost, partner?.commissionRate, isConnector]);

  const travelCharges = useMemo(() => {
    const val = Number(formData.travelCharges);
    return isNaN(val) || val < 0 ? 0 : val;
  }, [formData.travelCharges]);

  const finalTotal = useMemo(() => {
    return labourCost + commission + travelCharges;
  }, [labourCost, commission, travelCharges]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };



  const validateForm = () => {
    let newErrors = {};

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (!formData.contactName.trim()) {
      newErrors.contactName = "Contact name is required";
    }

    if (!formData.contactPhone.trim()) {
      newErrors.contactPhone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.contactPhone)) {
      newErrors.contactPhone = "Enter valid 10-digit phone";
    }

    if (Number(formData.travelCharges) < 0) {
      newErrors.travelCharges = "Invalid amount";
    }

    if (isConnector && workers.length === 0) {
      newErrors.workers = "Select at least one worker";
    }

    if (isWorker && !workerDetails?.skill) {
      newErrors.worker = "Invalid worker selection";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };



  const handleSubmit = async () => {

    if (!validateForm()) return;

    try {
      setLoading(true);

      const payload = {
        partnerId: partner._id,

        ...(isConnector && { workers }),
        ...(isWorker && { workerDetails }),

        address: {
          addressLine: formData.address.trim(),
          city: "",
          state: "",
          pincode: "",
          country: "India",
        },

        contactName: formData.contactName.trim(),
        contactPhone: formData.contactPhone,
        mealsProvided: formData.mealsProvided,
        travelCharges: Number(formData.travelCharges) || 0,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes?.trim(),
      };

      const res = await axios.post(
        "http://localhost:7265/api/booking/create",
        payload,
        { withCredentials: true }
      );

      if (res.data.success) {
        setShowSuccess(true);
      }

    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-gray-100 min-h-screen px-4 sm:px-6 md:px-10 py-6">
        <div className="max-w-6xl mx-auto">

          {/* HEADER */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Confirm Booking
              </h1>
              <p className="text-sm text-gray-500">
                Review your selection and fill details
              </p>
            </div>

            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full hover:bg-gray-200 transition"
            >
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* LEFT SIDE */}
            <div className="lg:col-span-2 space-y-6">

              {/* ADDRESS */}
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Work Location
                </h3>
                <input
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter work site address"
                  className="w-full bg-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-400"
                />
                {errors.address && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.address}
                  </p>
                )}
              </div>

              {/* WORK DETAILS */}
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Work Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  <label className="flex items-center gap-2 text-sm font-medium">
                    <input
                      type="checkbox"
                      name="mealsProvided"
                      checked={formData.mealsProvided}
                      onChange={handleChange}
                      className="h-4 w-4 accent-orange-500"
                    />
                    <Utensils size={16} />
                    Meals Provided
                  </label>

                  <div>
                    <label className="text-sm font-medium">
                      Travel Charges
                    </label>
                    <input
                      type="number"
                      name="travelCharges"
                      value={formData.travelCharges}
                      onChange={handleChange}
                      placeholder="Optional"
                      className="mt-1 w-full bg-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-400"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">
                      Contact Person
                    </label>
                    <input
                      name="contactName"
                      value={formData.contactName}
                      onChange={handleChange}
                      placeholder="Contact Name"
                      className="mt-1 w-full bg-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-400"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="contactPhone"
                      value={formData.contactPhone}
                      onChange={handleChange}
                      placeholder="Phone Number"
                      className="mt-1 w-full bg-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-400"
                    />
                    {errors.contactPhone && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.contactPhone}
                      </p>
                    )}
                  </div>

                </div>
              </div>

              {/* PAYMENT */}
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Payment Method
                </h3>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  className="w-full bg-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-400"
                >
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                  <option value="bank">Bank Transfer</option>
                </select>
              </div>

              {/* NOTES */}
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Additional Instructions
                </h3>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Any site requirements..."
                  className="w-full bg-gray-100 rounded-xl px-4 py-3 text-sm min-h-[100px] outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
            </div>

            {/* RIGHT SIDE SUMMARY */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-2xl shadow-xl p-6 h-fit sticky top-24">

              <h3 className="font-semibold text-white mb-3">
                {partner.name}
              </h3>

              <div className="space-y-2 text-sm text-white">
                {isConnector &&
                  workers.map((w) => (
                    <div key={w.worker} className="flex justify-between">
                      <span>
                        {w.skill} × {w.count}
                      </span>
                      <span>₹{w.wage}</span>
                    </div>
                  ))}

                {isWorker && workerDetails && (
                  <div className="flex justify-between">
                    <span>{workerDetails.skill}</span>
                    <span>₹{totalCost}</span>
                  </div>
                )}
              </div>

              <div className="border-t my-4"></div>

              <div className="flex justify-between text-sm">
                <span>Labour Cost</span>
                <span>₹{totalCost}</span>
              </div>

              {isConnector && (
                <div className="flex justify-between text-sm">
                  <span>Commission ({partner.commissionRate}%)</span>
                  <span>₹{commission}</span>
                </div>
              )}

              <div className="flex justify-between text-sm mb-4">
                <span>Travel Charges</span>
                <span>₹{formData.travelCharges || 0}</span>
              </div>

              <div className="flex justify-between font-bold text-lg mb-5">
                <span>Total</span>
                <span className="flex items-center">
                  <IndianRupee size={18} />
                  {finalTotal}
                </span>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition disabled:opacity-70"
              >
                {loading ? "Booking..." : "Confirm Booking"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SUCCESS MODAL */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">

          {/* Card */}
          <div className=" w-full max-w-[90%] sm:max-w-sm bg-white rounded-2xl p-6 text-center shadow-2xl animate-[fadeIn_0.25s_ease]">

            <CheckCircle
              className="text-green-500 mx-auto mb-3"
              size={50}
            />

            <h2 className="text-lg font-semibold mb-2">
              Booking Successful
            </h2>

            <p className="text-sm text-gray-500 mb-5">
              Your workers have been booked successfully.
            </p>

            <button
              onClick={() => {
                setShowSuccess(false);
                navigate("/mybookings", { replace: true });
              }}
              className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default BookingPage;