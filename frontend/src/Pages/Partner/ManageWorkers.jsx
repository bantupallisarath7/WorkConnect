import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Trash2, Edit, Users, GlobeOff, AlertTriangle, ShieldX, SearchX } from "lucide-react";
import { useSelector } from "react-redux";
import SimpleLoader from "../../components/SimpleLoader";
import formatError from "../../utils/formatError.js";
import useLockScroll from "../../utils/useLockScroll.js";

const ManageWorkers = () => {
    const [workers, setWorkers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const { currentUser } = useSelector((state) => state.auth);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [openSkills, setOpenSkills] = useState(false);
    const [search, setSearch] = useState("");
    useLockScroll(isModalOpen);

    const skills = [
        "Mason", "Painter", "Helper", "Carpenter", "Electrician",
        "Plumber", "Welder", "Tile Setter", "Steel Fixer",
        "Concrete Worker", "Labour", "Supervisor", "Driver",
        "Fabricator", "Scaffolder"
    ];

    const buttonStyles = {
        network: "bg-red-500 hover:bg-red-600",
        server: "bg-orange-500 hover:bg-orange-600",
        auth: "bg-yellow-500 hover:bg-yellow-600",
        not_found: "bg-blue-500 hover:bg-blue-600",
        general: "bg-gray-500 hover:bg-gray-600",
    };

    const [form, setForm] = useState({
        skill: "",
        count: "",
        wage: "",
    });

    // FETCH
    const fetchWorkers = async () => {
        setLoading(true);
        setError(null);

        try {
            const res = await axios.get(
                `https://workconnect-0306.onrender.com/api/connector/workers/${currentUser._id}`,
                { withCredentials: true }
            );

            if (res.data.success) {
                setWorkers(res.data.data);
            } else {
                setError("Failed to load workers");
            }
        } catch (error) {
            setError(formatError(error, "Failed to load workers"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWorkers();
    }, []);

    // ADD
    const handleAdd = async () => {
        if (!form.skill || !form.count || !form.wage) return;

        setLoading(true);
        setError(null);
        try {
            const res = await axios.post(
                "https://workconnect-0306.onrender.com/api/connector/workers/create",
                {
                    skill: form.skill,
                    count: Number(form.count),
                    wage: Number(form.wage),
                },
                { withCredentials: true }
            );

            if (res.data.success) {
                setWorkers([...workers, res.data.data]);
            }

            setForm({ skill: "", count: "", wage: "" });
            setIsModalOpen(false);
        } catch (error) {
            setError(formatError(error, "Failed to add worker"));
        } finally {
            setLoading(false);
        }
    };

    // DELETE
    const handleDelete = async (id) => {
        setLoading(true);
        setError(null);
        try {
            await axios.delete(
                `https://workconnect-0306.onrender.com/api/connector/workers/${id}`,
                { withCredentials: true }
            );

            setWorkers(workers.filter((w) => w._id !== id));
        } catch (error) {
            setError(formatError(error, "Failed to delete worker"));
        } finally {
            setLoading(false);
        }
    };

    // EDIT
    const handleEdit = (worker) => {
        setEditId(worker._id);
        setForm({
            skill: worker.skill,
            count: worker.count,
            wage: worker.wage,
        });
        setIsModalOpen(true);
    };

    // UPDATE
    const handleSave = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.put(
                `https://workconnect-0306.onrender.com/api/connector/workers/${editId}`,
                {
                    skill: form.skill,
                    count: Number(form.count),
                    wage: Number(form.wage),
                },
                { withCredentials: true }
            );

            if (res.data.success) {
                setWorkers(
                    workers.map((w) =>
                        w._id === editId ? res.data.data : w
                    )
                );
            }

            setEditId(null);
            setIsModalOpen(false);
        } catch (error) {
            setError(formatError(error, "Failed to update worker"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const handleClick = (e) => {
            if (!e.target.closest(".skill-dropdown")) {
                setOpenSkills(false);
            }
        };
        document.addEventListener("click", handleClick);
        return () => document.removeEventListener("click", handleClick);
    }, []);

    return (
        <div className="p-4 md:p-6 space-y-6 relative">

            {/* HEADER */}
            <div className="max-w-6xl mx-auto">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Manage Workers
                </h2>
                <p className="text-sm text-gray-500">
                    Add and manage your workforce
                </p>
            </div>

            {/* PRIORITY RENDERING */}

            {/* 1. LOADING */}
            {loading && (
                <div className="min-h-[60vh] flex justify-center items-center py-16">
                    <SimpleLoader text="Loading workers..." />
                </div>
            )}

            {/* 2. ERROR */}
            {!loading && error && (
                <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">

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
                        onClick={fetchWorkers}
                        className={`mt-5 px-5 py-2 text-white text-sm rounded-lg ${buttonStyles[error.type]}`}
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* 3. EMPTY */}
            {!loading && !error && workers.length === 0 && (
                <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
                    <div className="bg-orange-100 text-orange-500 p-5 rounded-full shadow-sm">
                        <Users size={32} />
                    </div>

                    <h3 className="mt-5 text-lg sm:text-xl font-semibold text-gray-900">
                        No workers added yet
                    </h3>

                    <p className="mt-2 text-sm text-gray-500 max-w-sm">
                        Start by adding your workforce to manage skills and wages.
                    </p>

                    <button
                        onClick={() => {
                            setForm({ skill: "", count: "", wage: "" });
                            setEditId(null);
                            setIsModalOpen(true);
                        }}
                        className="mt-6 px-6 py-2.5 bg-orange-500 text-white text-sm rounded-lg shadow hover:bg-orange-600"
                    >
                        Add Workers
                    </button>
                </div>
            )}

            {/* 4. DATA */}
            {!loading && !error && workers.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {workers.map((worker) => (
                        <div
                            key={worker._id}
                            className="bg-white rounded-2xl p-5 shadow-md hover:shadow-xl transition"
                        >
                            <div className="flex justify-between">
                                <div>
                                    <h3 className="font-semibold">{worker.skill}</h3>
                                    <p className="text-sm text-gray-500">
                                        {worker.count} workers
                                    </p>
                                    <p className="text-green-600 font-bold mt-2">
                                        ₹{worker.wage}
                                    </p>
                                </div>

                                <div className="flex gap-2 items-center">
                                    <button
                                        onClick={() => handleEdit(worker)}
                                        className="p-2 bg-blue-50 text-blue-500 rounded-lg hover:bg-blue-100"
                                    >
                                        <Edit size={16} />
                                    </button>

                                    <button
                                        onClick={() => handleDelete(worker._id)}
                                        className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* FLOAT BUTTON */}
            <button
                onClick={() => {
                    setForm({ skill: "", count: "", wage: "" });
                    setEditId(null);
                    setIsModalOpen(true);
                }}
                className="fixed bottom-6 right-6 bg-orange-500 hover:bg-orange-600 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center"
            >
                <Plus size={22} />
            </button>
            {/* MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">

                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md space-y-4">

                        <h2 className="text-lg font-semibold">
                            {editId ? "Edit Worker" : "Add Worker"}
                        </h2>

                        {/* SKILL */}
                        <div className="relative skill-dropdown">
                            {/* INPUT BOX */}
                            <input
                                value={search || form.skill || ""}
                                placeholder="Select or type skill..."
                                onFocus={() => setOpenSkills(true)}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setForm(prev => ({ ...prev, skill: e.target.value }));
                                }}
                                className="w-full px-4 py-2 rounded-xl bg-gray-100 focus:ring-2 focus:ring-orange-400 outline-none"
                            />

                            {/* DROPDOWN */}
                            {openSkills && (
                                <div className="absolute mt-2 w-full bg-white rounded-xl shadow-xl border border-gray-100 max-h-48 overflow-y-auto z-50">

                                    {/* FILTERED LIST */}
                                    {skills
                                        .filter(s =>
                                            s.toLowerCase().includes(search.toLowerCase())
                                        )
                                        .map((skill) => (
                                            <div
                                                key={skill}
                                                onClick={() => {
                                                    setForm(prev => ({ ...prev, skill }));
                                                    setSearch("");
                                                    setOpenSkills(false);
                                                }}
                                                className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-gray-700"
                                            >
                                                {skill}
                                            </div>
                                        ))}

                                    {/* ADD CUSTOM OPTION */}
                                    {search &&
                                        !skills.some(
                                            (s) => s.toLowerCase() === search.toLowerCase()
                                        ) && (
                                            <div
                                                onClick={() => {
                                                    setForm(prev => ({ ...prev, skill: search }));
                                                    setSearch("");
                                                    setOpenSkills(false);
                                                }}
                                                className="px-4 py-2 cursor-pointer text-orange-600 font-medium hover:bg-orange-50 flex items-center gap-2"
                                            >
                                                <Plus size={16} /> Add "{search}"
                                            </div>
                                        )}

                                </div>
                            )}
                        </div>

                        {/* COUNT */}
                        <input
                            type="number"
                            placeholder="Count"
                            value={form.count}
                            onChange={(e) =>
                                setForm({ ...form, count: e.target.value })
                            }
                            className="w-full px-4 py-2 rounded-xl bg-gray-100 focus:ring-2 focus:ring-orange-400 outline-none"
                        />

                        {/* WAGE */}
                        <input
                            type="number"
                            placeholder="Wage"
                            value={form.wage}
                            onChange={(e) =>
                                setForm({ ...form, wage: e.target.value })
                            }
                            className="w-full px-4 py-2 rounded-xl bg-gray-100 focus:ring-2 focus:ring-orange-400 outline-none"
                        />

                        {/* ACTIONS */}
                        <div className="flex justify-end gap-3 pt-2">

                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={editId ? handleSave : handleAdd}
                                disabled={loading}
                                className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-xl shadow-md disabled:opacity-60"
                            >
                                {loading
                                    ? "Saving..."
                                    : editId
                                        ? "Save"
                                        : "Add"}
                            </button>

                        </div>

                    </div>
                </div>
            )}

        </div>
    );
};

export default ManageWorkers;