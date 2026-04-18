import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import ConnectorCard from "../../components/ConnectorCard.jsx";
import WorkerCard from "../../components/WokerCard.jsx";
import {
    Construction, Paintbrush, HelpingHand, Hammer, Zap, Droplets, Flame,
    Grid, Shield, Building, Users, ClipboardCheck, Truck, Settings, Wrench, Search, X,
    GlobeOff, AlertTriangle, ShieldX, SearchX
} from "lucide-react";
import formatError from "../../utils/formatError.js";
import SimpleLoader from "../../components/SimpleLoader";

const workers = [
    { name: "Mason", icon: Construction },
    { name: "Painter", icon: Paintbrush },
    { name: "Helper", icon: HelpingHand },
    { name: "Carpenter", icon: Hammer },
    { name: "Electrician", icon: Zap },
    { name: "Plumber", icon: Droplets },
    { name: "Welder", icon: Flame },
    { name: "Tile Setter", icon: Grid },
    { name: "Steel Fixer", icon: Shield },
    { name: "Concrete Worker", icon: Building },
    { name: "Labour", icon: Users },
    { name: "Supervisor", icon: ClipboardCheck },
    { name: "Driver", icon: Truck },
    { name: "Fabricator", icon: Settings },
    { name: "Scaffolder", icon: Wrench },
];

const HomeSection = () => {
    const navigate = useNavigate();
    const currentUser = useSelector((state) => state.auth.currentUser);
    const selectedCity = useSelector((state) => state.location.city);

    const locationHook = useLocation();
    const initialSearch = locationHook.state?.search || "";

    const [search, setSearch] = useState(initialSearch);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Infinite scroll states
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    const inputRef = useRef();
    const isFetchingRef = useRef(false);
    const [roleFilter, setRoleFilter] = useState("worker");

    const buttonStyles = {
        network: "bg-red-500 hover:bg-red-600",
        server: "bg-orange-500 hover:bg-orange-600",
        auth: "bg-yellow-500 hover:bg-yellow-600",
        not_found: "bg-blue-500 hover:bg-blue-600",
        general: "bg-gray-500 hover:bg-gray-600",
    };

    const fetchPartners = async () => {
        if (!selectedCity) return;
        if (isFetchingRef.current) return;
        isFetchingRef.current = true;

        if (page === 1) setLoading(true);
        else setLoadingMore(true);
        setError(null);

        try {
            const params = new URLSearchParams({
                search: search || selectedCategory,
                city: selectedCity,
                page,
                limit: 10,
            });

            const res = await fetch(
                `https://workconnect-0306.onrender.com/api/user/search/connectors?${params.toString()}`
            );

            const data = await res.json();
            if (data.success) {
                // Append instead of replace
                setPartners((prev) =>
                    page === 1 ? data.data : [...prev, ...data.data]
                );

                // Stop if no more data
                if (data.data.length < 10) {
                    setHasMore(false);
                }

            }
        } catch (error) {
            setError(formatError(error, "Error fetching connectors"));
            if (page === 1) setPartners([]);
        } finally {
            if (page === 1) setLoading(false);
            else setLoadingMore(false);

            isFetchingRef.current = false;
        }
    };

    const filteredPartners = partners.filter(
        (item) => item.role === roleFilter
    );

    useEffect(() => {
        setPage(1);
        setPartners([]);
        setHasMore(true);
    }, [search, selectedCategory, selectedCity]);

    useEffect(() => {
        if (selectedCity) {
            fetchPartners();
        }
    }, [page, selectedCity, search, selectedCategory]);

    // Scroll detection
    useEffect(() => {
        const handleScroll = () => {
            if (
                window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 &&
                hasMore &&
                !loading &&
                !loadingMore &&
                partners.length > 0
            ) {
                setPage((prev) => prev + 1);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [hasMore, loading, loadingMore]);

    // Booking Flow
    const handleBookNow = (worker) => {
        if (!currentUser) {
            navigate("/signin", { state: { from: "/booking", worker } });
        } else {
            navigate("/booking", { state: { worker } });
        }
    };
    useEffect(() => {
        if (initialSearch) {
            window.scrollTo({ top: 0, behavior: "instant" });
        }
    }, []);
    return (
        <section className="bg-white min-h-screen">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">

                {/* Search Bar */}
                <div className="sticky top-20 bg-white z-20 py-4">
                    <div className="relative max-w-2xl mx-auto">
                        <input
                            ref={inputRef}
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search workers (e.g. electrician, driver)"
                            className="w-full h-12 sm:h-14 rounded-full bg-gray-100 
                                pl-5 pr-20 text-gray-700 text-sm sm:text-base
                                border border-gray-200 shadow-sm
                                outline-none focus:ring-2 focus:ring-orange-400 focus:bg-white"
                        />

                        {search && (
                            <button
                                onClick={() => {
                                    setSearch("");
                                    inputRef.current.focus();
                                }}
                                className="absolute right-14 top-1/2 -translate-y-1/2
                                text-gray-400 hover:text-gray-700 transition"
                            >
                                <X size={18} />
                            </button>
                        )}

                        <button
                            className="absolute right-2 top-1/2 -translate-y-1/2
                            bg-orange-500 text-white p-2 rounded-full"
                        >
                            <Search size={18} />
                        </button>
                    </div>
                </div>

                {/* Categories */}
                {!search.trim() && (
                    <div className="pt-6">
                        <h2 className="text-xl font-bold mb-6">
                            Popular Worker Categories
                        </h2>
                        <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
                            {workers.map((worker, index) => {
                                const Icon = worker.icon;
                                return (
                                    <div
                                        key={index}
                                        onClick={() =>
                                            setSelectedCategory(
                                                worker.name === selectedCategory ? "" : worker.name
                                            )
                                        }
                                        className="flex flex-col items-center min-w-[80px] cursor-pointer group"
                                    >
                                        <div
                                            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-sm transition
                                                ${selectedCategory === worker.name
                                                    ? "bg-orange-500 text-white"
                                                    : "bg-orange-100 text-orange-500"
                                                }`}
                                        >
                                            <Icon size={22} />
                                        </div>
                                        <p className="text-xs mt-2 text-center">{worker.name}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* 1. LOADING */}
                {loading && page === 1 && (
                    <div className="min-h-[60vh] flex justify-center items-center py-16">
                        <SimpleLoader text="Loading result..." />
                    </div>
                )}

                {!loading && error && (
                    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">

                        {/* ICON */}
                        <div
                            className={`p-5 rounded-full shadow-sm ${error.type === "network"
                                ? "bg-red-50 text-red-500"
                                : error.type === "server"
                                    ? "bg-orange-50 text-orange-500"
                                    : error.type === "auth"
                                        ? "bg-yellow-50 text-yellow-600"
                                        : error.type === "not_found"
                                            ? "bg-blue-50 text-blue-500"
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
                            onClick={() => {
                                setPage(1);
                                setHasMore(true);
                                fetchPartners()
                            }}
                            className={`mt-5 px-5 py-2 text-white text-sm rounded-lg ${buttonStyles[error.type]}`}
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* Results */}
                {!loading && !error && (
                    <div className="mt-10 mb-10">
                        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">

                            {/* LEFT - Title */}
                            <h3 className="text-lg font-semibold">
                                Search Results
                            </h3>

                            {/* RIGHT - Filter Buttons */}
                            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-full">
                                {["worker", "connector"].map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => setRoleFilter(f)}
                                        className={`whitespace-nowrap px-4 py-1 text-sm rounded-full transition ${roleFilter === f
                                            ? f === "worker"
                                                ? "bg-white shadow text-blue-500 font-medium"
                                                : "bg-white shadow text-orange-500 font-medium"
                                            : "text-gray-600"
                                            }`}
                                    >
                                        {f === "worker" ? "Workers" : "Connectors"}
                                    </button>
                                ))}
                            </div>

                        </div>

                        <div
                            className="grid gap-4 md:gap-6"
                            style={{
                                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                            }}
                        >
                            {roleFilter === "worker" ? (
                                filteredPartners.length === 0 ? (
                                    // ✅ WORKER EMPTY STATE
                                    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">

                                        <div className="bg-orange-100 p-5 rounded-full shadow-sm text-orange-500 mb-4">
                                            <Users size={32} />
                                        </div>

                                        <p className="text-lg font-semibold text-gray-800">
                                            No workers available {selectedCity && `in ${selectedCity}`}
                                        </p>

                                        <p className="text-gray-500 text-sm mt-1 max-w-sm">
                                            {search || selectedCategory
                                                ? "We couldn’t find any workers matching your search or selected category. Try using different keywords or filters."
                                                : "No workers are available right now in your area. Try exploring other categories or check back later."}
                                        </p>

                                        <button
                                            onClick={() => {
                                                setSearch("");
                                                setSelectedCategory("");
                                            }}
                                            className="mt-5 px-5 py-2 rounded-lg bg-orange-500 text-white text-sm hover:bg-orange-600"
                                        >
                                            Clear Filters
                                        </button>
                                    </div>
                                ) : (
                                    filteredPartners.map((item) => (
                                        <WorkerCard key={item._id} data={item} />
                                    ))
                                )
                            ) : (
                                filteredPartners.length === 0 ? (
                                    // ✅ CONNECTOR EMPTY STATE
                                    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">

                                        <div className="bg-orange-100 p-5 rounded-full shadow-sm text-orange-500 mb-4">
                                            <SearchX size={32} />
                                        </div>

                                        <p className="text-lg font-semibold text-gray-800">
                                            No connectors available {selectedCity && `in ${selectedCity}`}
                                        </p>

                                        <p className="text-gray-500 text-sm mt-1 max-w-sm">
                                            {search || selectedCategory
                                                ? "No connectors match your current search or filters. Try adjusting your search terms."
                                                : "No connectors are available right now in your area. Please check back later or explore other options."}
                                        </p>

                                        <button
                                            onClick={() => {
                                                setSearch("");
                                                setSelectedCategory("");
                                            }}
                                            className="mt-5 px-5 py-2 rounded-lg bg-orange-500 text-white text-sm hover:bg-orange-600"
                                        >
                                            Clear Filters
                                        </button>
                                    </div>
                                ) : (
                                    filteredPartners.map((item) => (
                                        <ConnectorCard key={item._id} data={item} />
                                    ))
                                )
                            )}
                        </div>

                        {/* Bottom Loader */}
                        {loadingMore && (
                            <p className="text-center text-gray-500 mt-6">
                                Loading more...
                            </p>
                        )}
                    </div>
                )}

            </div>
        </section>
    );
};

export default HomeSection;