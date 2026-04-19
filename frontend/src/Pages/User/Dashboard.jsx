import React, { useEffect, useState } from "react";
import {
  Construction, Paintbrush, HelpingHand, Hammer, Zap, Droplets, Flame,
  Grid, Shield, Building, Users, ClipboardCheck, Truck, Settings, Wrench,
  GlobeOff, ServerCrash, ShieldX, SearchX, FileSearch, AlertTriangle, MapPin
} from "lucide-react";
import axios from "axios";
import WorkerCard from "../../components/WokerCard";
import ConnectorCard from "../../components/ConnectorCard";
import { useMemo } from "react";
import formatError from "../../utils/formatError.js";
import SimpleLoader from "../../components/SimpleLoader";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const workersList = [
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
  { name: "Laborer", icon: Users },
  { name: "Supervisor", icon: ClipboardCheck },
  { name: "Driver", icon: Truck },
  { name: "Fabricator", icon: Settings },
  { name: "Scaffolder", icon: Wrench },
];

const Dashboard = () => {
  const [connectors, setConnectors] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [error, setError] = useState(null);
  const selectedCity = useSelector((state) => state.location.city);
  const [loadingConnectors, setLoadingConnectors] = useState(false);
  const [loadingWorkers, setLoadingWorkers] = useState(false);
  const [activeTab, setActiveTab] = useState("worker");

  const navigate = useNavigate();

  const buttonStyles = {
    network: "bg-red-500 hover:bg-red-600",
    server: "bg-orange-500 hover:bg-orange-600",
    auth: "bg-yellow-500 hover:bg-yellow-600",
    not_found: "bg-blue-500 hover:bg-blue-600",
    general: "bg-gray-500 hover:bg-gray-600",
  };


  // FETCH CONNECTORS
  const fetchConnectors = async () => {
    setLoadingConnectors(true);
    setError(null);
    try {
      const res = await axios.get(
        `https://workconnect-0306.onrender.com/api/connector/top-connectors?city=${selectedCity}`,
        {
          withCredentials: true
        }
      );
      setConnectors(res.data.connectors || []);
    } catch (error) {
      setError(formatError(error, "Failed to load top connectors"))
    } finally {
      setLoadingConnectors(false);
    }
  };

  // FETCH WORKERS
  const fetchWorkers = async () => {
    setLoadingWorkers(true);
    setError(null);
    try {
      const res = await axios.get(
        `https://workconnect-0306.onrender.com/api/connector/top-workers?city=${selectedCity}`,
        { withCredentials: true }
      );
      setWorkers(res.data.workers || []);
    } catch (error) {
      setError(formatError(error, "Failed to load top workers"))
    } finally {
      setLoadingWorkers(false);
    }
  };
  const fetchDashboard = () => {
    fetchConnectors();
    fetchWorkers();
  }

  useEffect(() => {
    if (selectedCity) {
      fetchConnectors();
      fetchWorkers();
    }

  }, [selectedCity]);

  const validConnectors = useMemo(() => {
    return connectors.filter((connector) =>
      connector.workers?.some((w) => w.count > 0)
    );
  }, [connectors]);

  // PRIORITY RENDERING
  if (!selectedCity) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center text-center px-4">

        {/* ICON */}
        <div
          className="p-5 rounded-full shadow-sm bg-orange-50 text-orange-500"
        >
          <MapPin size={36} />
        </div>

        {/* TITLE */}
        <h3 className="mt-4 text-lg font-semibold text-gray-900">
          Select your city
        </h3>

        {/* MESSAGE */}
        <p className="text-sm text-gray-500 mt-2 max-w-sm">
          Choose your location from the navbar to see available workers near you.
        </p>

        {/* RETRY */}
        <button
          onClick={() => {
            document.dispatchEvent(new Event("openLocation"));
          }}
          className="mt-5 px-5 py-2 text-white text-sm rounded-lg bg-orange-500 hover:bg-orange-600"
        >
          Choose Location
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">

        {/* WORKER CATEGORIES */}
        <div className="mt-4">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-5">
            Popular Worker Categories
          </h2>

          <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide">
            {workersList.map((worker, index) => {
              const Icon = worker.icon;
              return (
                <div
                  key={index}
                  onClick={() => navigate("/search")}
                  className="flex flex-col items-center min-w-[80px] cursor-pointer group"
                >
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-orange-100 flex items-center justify-center shadow-sm group-hover:scale-110 transition">
                    <Icon className="text-orange-500" size={24} />
                  </div>

                  <p className="text-xs md:text-sm mt-2 text-gray-700 text-center">
                    {worker.name}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
        {error && (
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
              {error.type === "server" && <ServerCrash size={36} />}
              {error.type === "auth" && <ShieldX size={36} />}
              {error.type === "not_found" && <FileSearch size={36} />}
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
              onClick={fetchDashboard}
              className={`mt-5 px-5 py-2 text-white text-sm rounded-lg ${buttonStyles[error.type]}`}
            >
              Retry
            </button>
          </div>
        )}

        {!error && (
          <>
            {/* TOP CONNECTORS */}
            <div className="mt-10 mb-10">

              {/* HEADER + FILTER BUTTONS */}
              <div className="flex items-center justify-between mb-4 gap-2">

                <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 truncate">
                  {activeTab === "worker" ? "Top Workers" : "Top Connectors"}
                </h2>

                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-full shrink-0">
                  {["worker", "connector"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`whitespace-nowrap px-4 py-1 text-sm rounded-full transition ${activeTab === tab
                        ? tab === "worker"
                          ? "bg-white shadow text-blue-500 font-medium"
                          : "bg-white shadow text-orange-500 font-medium"
                        : "text-gray-600"
                        }`}
                    >
                      {tab === "worker" ? "Workers" : "Connectors"}
                    </button>
                  ))}
                </div>
              </div>

              {/* CONTENT */}
              {(loadingWorkers || loadingConnectors) ? (
                <div className="min-h-[40vh] flex justify-center items-center py-16">
                  <SimpleLoader
                    text={
                      activeTab === "worker"
                        ? "Loading Top Workers..."
                        : "Loading Top Connectors..."
                    }
                  />
                </div>
              ) : (
                <div
                  className="grid gap-4 md:gap-6"
                  style={{
                    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                  }}
                >
                  {activeTab === "worker" ? (
                    workers.length === 0 ? (
                      //  WORKER EMPTY STATE
                      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">

                        <div className="bg-orange-100 p-5 rounded-full shadow-sm text-orange-500 mb-4">
                          <Users size={32} />
                        </div>

                        <p className="text-lg font-semibold text-gray-800">
                          No workers available {selectedCity && `in ${selectedCity}`}
                        </p>

                        <p className="text-gray-500 text-sm mt-1 max-w-sm">
                          No workers are available right now in your area. Try exploring other categories or check back later.
                        </p>

                        <button
                          onClick={fetchDashboard}
                          className="mt-5 px-5 py-2 rounded-lg bg-orange-500 text-white text-sm hover:bg-orange-600"
                        >
                          Refresh
                        </button>
                      </div>
                    ) : (
                      workers.map((worker) => (
                        <WorkerCard key={worker._id} data={worker} />
                      ))
                    )
                  ) : validConnectors.length === 0 ? (
                    //  CONNECTOR EMPTY STATE
                    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">

                      <div className="bg-orange-100 p-5 rounded-full shadow-sm text-orange-500 mb-4">
                        <SearchX size={32} />
                      </div>

                      <p className="text-lg font-semibold text-gray-800">
                        No connectors available {selectedCity && `in ${selectedCity}`}
                      </p>

                      <p className="text-gray-500 text-sm mt-1 max-w-sm">
                        No connectors are available right now in your area. Please check back later or try refreshing.
                      </p>

                      <button
                        onClick={fetchDashboard}
                        className="mt-5 px-5 py-2 rounded-lg bg-orange-500 text-white text-sm hover:bg-orange-600"
                      >
                        Refresh
                      </button>
                    </div>
                  ) : (
                    validConnectors.map((connector) => (
                      <ConnectorCard key={connector._id} data={connector} />
                    ))
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;