import React, { useState } from "react";
import { Search, MapPin } from "lucide-react";
import PopularServices from "../../components/PopularServicesSection";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCity } from "../../../redux/location/locationSlice"

const Home = () => {
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  return (
    <div className="bg-white text-gray-900">

      {/* HERO */}
      <section className="min-h-[85vh] md:min-h-[90vh] flex items-center justify-center px-5">
        <div className="max-w-5xl mx-auto text-center px-2">

          {/* MAIN HEADER */}
          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight tracking-tight">
            Find Trusted Workers Near You
          </h1>

          {/* SUBTEXT */}
          <p className="mt-4 text-gray-600 text-base md:text-lg max-w-2xl mx-auto">
            Search and connect with verified workers in your area quickly and easily.
          </p>

          {/* SEARCH BAR */}
          <div className="mt-10 bg-white border border-gray-200 rounded-2xl shadow-lg p-3 sm:p-4 flex flex-col md:flex-row gap-3">

            {/* LOCATION */}
            <div className="flex items-center flex-1 bg-gray-100 rounded-xl px-3 focus-within:ring-2 focus-within:ring-orange-400 transition">
              <MapPin className="text-gray-500" size={18} />
              <input
                type="text"
                value={location}
                placeholder="Enter your location"
                className="w-full bg-transparent outline-none px-2 py-3 text-sm md:text-base"
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            {/* SEARCH */}
            <div className="flex items-center flex-1 bg-gray-100 rounded-xl px-3 focus-within:ring-2 focus-within:ring-orange-400 transition">
              <Search className="text-gray-500" size={18} />
              <input
                type="text"
                value={search}
                placeholder="Search workers (e.g. electrician, driver)"
                className="w-full bg-transparent outline-none px-2 py-3 text-sm md:text-base"
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* BUTTON */}
            <button className="w-full md:w-auto bg-orange-500 px-6 md:px-8 py-3 rounded-xl text-white font-semibold hover:bg-orange-600 active:scale-95 transition"
              onClick={() => {
                if (!location.trim() || !search.trim()) {
                  return;
                }
                dispatch(setCity(location));
                navigate("/search", {
                  state: { search }
                });
              }}>
              Search
            </button>
          </div>

          {/* SCROLL HINT */}
          <p className="mt-10 text-gray-400 text-sm">
            Explore services below ↓
          </p>

        </div>
      </section>

      {/* POPULAR SERVICES */}
      <section className="bg-gray-50">
        <PopularServices />
      </section>

    </div>
  );
};

export default Home;