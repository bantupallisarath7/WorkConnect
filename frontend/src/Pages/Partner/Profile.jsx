import React, { useEffect, useState } from "react";
import { Mail, Phone, MapPin, Star, CheckCircle, AlertTriangle, GlobeOff, ShieldX, SearchX } from "lucide-react";
import axios from "axios";
import SimpleLoader from "../../components/SimpleLoader.jsx";
import { useDispatch } from "react-redux";
import { signInSuccess } from "../../../redux/auth/authSlice.js";
import formatError from "../../utils/formatError.js";
import useLockScroll from "../../utils/useLockScroll.js";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();

  useLockScroll(showSuccess);

  const buttonStyles = {
    network: "bg-red-500 hover:bg-red-600",
    server: "bg-orange-500 hover:bg-orange-600",
    auth: "bg-yellow-500 hover:bg-yellow-600",
    not_found: "bg-blue-500 hover:bg-blue-600",
    general: "bg-gray-500 hover:bg-gray-600",
  };

  const [openSkillsIndex, setOpenSkillsIndex] = useState(null);
  const [search, setSearch] = useState("");

  const skillOptions = [
    "Mason", "Painter", "Helper", "Carpenter", "Electrician",
    "Plumber", "Welder", "Tile Setter", "Steel Fixer",
    "Concrete Worker", "Labour", "Supervisor", "Driver",
    "Fabricator", "Scaffolder"
  ];

  useEffect(() => {
    const handleClick = (e) => {
      if (!e.target.closest(".skill-dropdown")) {
        setOpenSkillsIndex(null);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const fetchProfile = async () => {
    setInitialLoading(true);
    setError(null);
    try {
      const res = await axios.get(
        "https://workconnect-0306.onrender.com/api/user/profile",
        { withCredentials: true }
      );
      setUser(res.data.user);
      setForm(res.data.user);
      dispatch(signInSuccess(res.data.user));
    } catch (error) {
      setError(formatError(error, "Failed to load profile"));
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        ...form,
        commissionRate:
          form.commissionRate !== undefined
            ? Number(form.commissionRate)
            : undefined,
      };

      const res = await axios.put(
        "https://workconnect-0306.onrender.com/api/user/profile",
        payload,
        { withCredentials: true }
      );

      setUser(res.data.user);
      setEditMode(false);
      setShowSuccess(true);
    } catch (error) {
      setError(formatError(error, "Failed to update profile"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {initialLoading && (
        <div className="min-h-[calc(100vh-64px)] flex justify-center items-center py-16">
          <SimpleLoader text="Loading profile..." />
        </div>
      )}
      {/* 2. ERROR */}
      {!initialLoading && error && (
        <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center text-center px-4">

          {/* ICON */}
          <div
            className={`p-5 rounded-full shadow-sm ${error.type === "network"
              ? "bg-red-100 text-red-500"
              : error.type === "server"
                ? "bg-orange-100 text-orange-500"
                : error.type === "auth"
                  ? "bg-yellow-100 text-yellow-600"
                  : error.type === "not_found"
                    ? "bg-blue-100 text-blue-500"
                    : "bg-gray-100 text-gray-600"
              }`}
          >
            {error.type === "network" && <GlobeOff size={36} />}
            {error.type === "server" && <AlertTriangle size={36} />}
            {error.type === "auth" && <ShieldX size={36} />}
            {error.type === "not_found" && <SearchX size={36} />}
            {error.type === "general" && <AlertTriangle size={36} />}
          </div>

          {/* TITLE */}
          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            {error.type === "network" && "No Internet Connection"}
            {error.type === "server" && "Server Error"}
            {error.type === "auth" && "Access Denied"}
            {error.type === "not_found" && "Not Found"}
            {error.type === "general" && "Something went wrong"}
          </h3>

          {/* MESSAGE */}
          <p className="text-sm text-gray-500 mt-2 max-w-sm">
            {error.message}
          </p>

          {/* RETRY */}
          <button
            onClick={fetchProfile}
            className={`mt-5 px-5 py-2 text-white text-sm rounded-lg ${buttonStyles[error.type]}`}
          >
            Retry
          </button>
        </div>
      )}
      {!initialLoading && !error && (
        <>
          <div className="bg-gray-50 min-h-screen px-4 py-6">
            <div className="max-w-5xl mx-auto space-y-6">

              {/* HEADER */}
              <div className="bg-white rounded-3xl shadow-md p-6 flex flex-col sm:flex-row items-center gap-5">
                <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 text-2xl font-bold">
                  {user.name?.charAt(0)}
                </div>

                <div className="flex-1 text-center sm:text-left">
                  {editMode ? (
                    <input
                      value={form.name || ""}
                      onChange={(e) => handleChange("name", e.target.value)}
                      className="bg-gray-100 px-3 py-1 rounded-lg outline-none focus:ring-2 focus:ring-orange-400"
                    />
                  ) : (
                    <h2 className="text-2xl font-bold text-gray-900">
                      {user.name}
                    </h2>
                  )}

                  <div className="flex items-center justify-center sm:justify-start gap-3 mt-1 flex-wrap">
                    <p className="text-gray-500 text-sm capitalize">
                      {user.role}
                    </p>

                    {/* AVAILABILITY BADGE */}
                    {user.role !== "user" && (
                      <span
                        className={`flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full ${user.availability?.isAvailable
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-500"
                          }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${user.availability?.isAvailable
                            ? "bg-green-500"
                            : "bg-red-500"
                            }`}
                        ></span>

                        {user.availability?.isAvailable
                          ? "Available"
                          : "Not Available"}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-4 mt-2 text-sm justify-center sm:justify-start">
                    <span className="flex items-center gap-1 text-yellow-500 font-medium">
                      <Star size={16} fill="currentColor" />
                      {user.rating || 0}
                    </span>
                    <span className="text-gray-600">
                      {user.totalJobs || 0} Jobs
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setEditMode(!editMode);
                    setForm(user);
                  }}
                  className="bg-orange-500 text-white px-4 py-2 rounded-xl hover:bg-orange-600"
                >
                  {editMode ? "Cancel" : "Edit"}
                </button>
              </div>

              {/* MAIN GRID */}
              <div className="grid md:grid-cols-3 gap-6">

                {/* LEFT */}
                <div className="md:col-span-2 bg-white rounded-3xl shadow-md p-6 space-y-5">

                  <h3 className="text-lg font-semibold text-gray-900">
                    Personal Info
                  </h3>

                  <div className="flex items-center gap-3">
                    <Mail size={18} className="text-gray-400" />
                    {user.email}
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone size={18} className="text-gray-400" />
                    {editMode ? (
                      <input
                        value={form.phone || ""}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        className="bg-gray-100 px-3 py-1 rounded-lg outline-none focus:ring-2 focus:ring-orange-400"
                      />
                    ) : (
                      user.phone || "Not added"
                    )}
                  </div>

                  {/* LOCATION */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin size={18} className="text-gray-400" />
                      <p className="text-sm font-medium text-gray-500">Address</p>
                    </div>

                    <div className="space-y-3">

                      {editMode ? (
                        <input
                          value={form.location?.addressLine || ""}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              location: {
                                ...form.location,
                                addressLine: e.target.value,
                              },
                            })
                          }
                          placeholder="Street / Area"
                          className="bg-gray-100 px-3 py-2 rounded-lg w-full outline-none focus:ring-2 focus:ring-orange-400"
                        />
                      ) : (
                        <p
                          className={`${user.location?.addressLine ? "text-gray-900" : "text-gray-400"
                            }`}
                        >
                          {user.location?.addressLine || "Street/Area Not added"}
                        </p>
                      )}

                      <div className="grid grid-cols-2 gap-3">
                        {editMode ? (
                          <>
                            <input
                              value={form.location?.city || ""}
                              onChange={(e) =>
                                setForm({
                                  ...form,
                                  location: {
                                    ...form.location,
                                    city: e.target.value,
                                  },
                                })
                              }
                              placeholder="City"
                              className="bg-gray-100 px-3 py-2 rounded-lg w-full outline-none focus:ring-2 focus:ring-orange-400"
                            />
                            <input
                              value={form.location?.state || ""}
                              onChange={(e) =>
                                setForm({
                                  ...form,
                                  location: {
                                    ...form.location,
                                    state: e.target.value,
                                  },
                                })
                              }
                              placeholder="State"
                              className="bg-gray-100 px-3 py-2 rounded-lg w-full outline-none focus:ring-2 focus:ring-orange-400"
                            />
                          </>
                        ) : (
                          <>
                            <p
                              className={`${user.location?.city ? "text-gray-900" : "text-gray-400"
                                }`}
                            >
                              {user.location?.city || "City not set"}
                            </p>

                            <p
                              className={`${user.location?.state ? "text-gray-900" : "text-gray-400"
                                }`}
                            >
                              {user.location?.state || "State not set"}
                            </p>
                          </>
                        )}
                      </div>

                      {editMode ? (
                        <input
                          value={form.location?.pincode || ""}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              location: {
                                ...form.location,
                                pincode: e.target.value,
                              },
                            })
                          }
                          placeholder="Pincode"
                          className="bg-gray-100 px-3 py-2 rounded-lg w-full outline-none focus:ring-2 focus:ring-orange-400"
                        />
                      ) : (
                        <p
                          className={`${user.location?.pincode ? "text-gray-900" : "text-gray-400"
                            }`}
                        >
                          {user.location?.pincode || "Pincode Not added"}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* EXPERIENCE */}
                  {user.role === "connector" && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Experience</p>
                      {editMode ? (
                        <input
                          type="number"
                          value={form.experience || 0}
                          onChange={(e) =>
                            handleChange("experience", e.target.value)
                          }
                          className="bg-gray-100 px-3 py-2 rounded-lg"
                        />
                      ) : (
                        <p>{user.experience} years</p>
                      )}
                    </div>
                  )}

                  {/* COMMISSION */}
                  {user.role === "connector" && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Commission (%)</p>
                      {editMode ? (
                        <input
                          type="number"
                          value={form.commissionRate || 0}
                          onChange={(e) =>
                            handleChange("commissionRate", e.target.value)
                          }
                          className="bg-gray-100 px-3 py-2 rounded-lg"
                        />
                      ) : (
                        <p>{user.commissionRate || 0}%</p>
                      )}
                    </div>
                  )}

                </div>

                {/* RIGHT */}
                <div className="flex flex-col gap-5">
                  <div className="bg-white rounded-3xl shadow-md p-5 text-center">
                    <p className="text-2xl font-bold">
                      {user.totalJobs || 0}
                    </p>
                    <p className="text-sm text-gray-500">Total Jobs</p>
                  </div>

                  <div className="bg-white rounded-3xl shadow-md p-5 text-center">
                    <p className="text-2xl font-bold">
                      {user.rating || 0}
                    </p>
                    <p className="text-sm text-gray-500">Rating</p>
                  </div>

                  {/* COMMISSION CARD */}
                  {user.role === "connector" && (
                    <div className="bg-white rounded-3xl shadow-md p-5 text-center">
                      <p className="text-2xl font-bold">
                        {user.commissionRate || 0}%
                      </p>
                      <p className="text-sm opacity-90">Commission Rate</p>
                    </div>
                  )}
                </div>
              </div>

              {/* PREMIUM SKILLS CARD */}
              {user.role === "worker" && (
                <div className="bg-white rounded-3xl shadow-md p-6 space-y-5">

                  {/* HEADER */}
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Skills</h3>
                      <p className="text-sm text-gray-500">Manage your expertise and pricing</p>
                    </div>

                    {editMode && (
                      <button
                        onClick={() =>
                          setForm({
                            ...form,
                            skills: [
                              ...(form.skills || []),
                              { name: "", experience: 0, wage: 0 },
                            ],
                          })
                        }
                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition"
                      >
                        Add
                      </button>
                    )}
                  </div>

                  {/* COLUMN HEADERS (DESKTOP ONLY) */}
                  <div className="grid grid-cols-3 gap-4 text-xs font-semibold text-gray-500 px-2">
                    <p>Skill</p>
                    <p>Experience</p>
                    <p>Wage</p>
                  </div>

                  {/* EMPTY STATE */}
                  {!editMode && (!user.skills || user.skills.length === 0) && (
                    <div className="text-center py-6 text-gray-400 text-sm">
                      No skills added yet
                    </div>
                  )}

                  {/* SKILLS LIST */}
                  <div className="space-y-3">
                    {(editMode ? form.skills : user.skills)?.map((skill, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-3 md:grid-cols-3 gap-3 items-center bg-gray-50 p-3 rounded-xl"
                      >

                        {/* NAME */}
                        <div className="relative skill-dropdown">
                          {editMode ? (
                            <>
                              <input
                                placeholder="Select or type skill..."
                                value={
                                  openSkillsIndex === index
                                    ? search
                                    : skill.name || ""
                                }
                                onFocus={() => {
                                  setOpenSkillsIndex(index);
                                  setSearch(skill.name || "");
                                }}
                                onChange={(e) => {
                                  setSearch(e.target.value);
                                  const updated = [...form.skills];
                                  updated[index].name = e.target.value;
                                  setForm({ ...form, skills: updated });
                                }}
                                className="w-full bg-white px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-orange-400 outline-none"
                              />

                              {/* DROPDOWN */}
                              {openSkillsIndex === index && (
                                <div className="absolute z-50 mt-2 w-full bg-white rounded-xl shadow-xl max-h-48 overflow-y-auto">

                                  {/* FILTERED OPTIONS */}
                                  {skillOptions
                                    .filter((s) =>
                                      s.toLowerCase().includes(search.toLowerCase())
                                    )
                                    .map((option) => (
                                      <div
                                        key={option}
                                        onClick={() => {
                                          const updated = [...form.skills];
                                          updated[index].name = option;
                                          setForm({ ...form, skills: updated });
                                          setOpenSkillsIndex(null);
                                          setSearch("");
                                        }}
                                        className="px-4 py-2 cursor-pointer hover:bg-gray-100 hover:text-orange-500"
                                      >
                                        {option}
                                      </div>
                                    ))}

                                  {/* ADD CUSTOM */}
                                  {search &&
                                    !skillOptions.some(
                                      (s) => s.toLowerCase() === search.toLowerCase()
                                    ) && (
                                      <div
                                        onClick={() => {
                                          const updated = [...form.skills];
                                          updated[index].name = search;
                                          setForm({ ...form, skills: updated });
                                          setOpenSkillsIndex(null);
                                          setSearch("");
                                        }}
                                        className="px-4 py-2 cursor-pointer text-orange-600 font-medium hover:bg-orange-50"
                                      >
                                        + Add "{search}"
                                      </div>
                                    )}
                                </div>
                              )}
                            </>
                          ) : (
                            <p className="font-medium text-gray-800">{skill.name}</p>
                          )}
                        </div>

                        {/* EXPERIENCE */}
                        <div>
                          {editMode ? (
                            <input
                              type="number"
                              placeholder="Years"
                              value={skill.experience || 0}
                              onChange={(e) => {
                                const updated = [...form.skills];
                                updated[index].experience = Number(e.target.value);
                                setForm({ ...form, skills: updated });
                              }}
                              className="w-full bg-white px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-orange-400 outline-none"
                            />
                          ) : (
                            <p className="text-gray-700">{skill.experience} yrs</p>
                          )}
                        </div>

                        {/* WAGE */}
                        <div>
                          {editMode ? (
                            <input
                              type="number"
                              placeholder="₹ Amount"
                              value={skill.wage || 0}
                              onChange={(e) => {
                                const updated = [...form.skills];
                                updated[index].wage = Number(e.target.value);
                                setForm({ ...form, skills: updated });
                              }}
                              className="w-full bg-white px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-orange-400 outline-none"
                            />
                          ) : (
                            <p className="text-gray-700 font-medium">₹{skill.wage}</p>
                          )}
                        </div>

                      </div>
                    ))}
                  </div>
                </div>
              )}

              {editMode && (
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="w-full bg-green-500 text-white py-3 rounded-2xl hover:bg-green-600"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              )}
            </div>
          </div>
          {/* SUCCESS MODAL */}
          {showSuccess && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
              <div className="bg-white rounded-3xl shadow-xl p-6 w-full max-w-sm text-center animate-scaleIn">
                <CheckCircle className="text-green-500 mx-auto mb-3" size={40} />
                <h2 className="text-lg font-semibold text-gray-900">
                  Profile Updated
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Your profile updated successfully.
                </p>
                <button
                  onClick={() => setShowSuccess(false)}
                  className="mt-5 w-full bg-orange-500 text-white py-2 rounded-xl hover:bg-orange-600"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default Profile;