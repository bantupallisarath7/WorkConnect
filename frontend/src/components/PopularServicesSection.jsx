import React, { useState } from "react";
import { X } from "lucide-react";

import electricianImg from "../assets/workers/electrician.png";
import plumberImg from "../assets/workers/plumber.png";
import carpenterImg from "../assets/workers/carpenter.png";
import driverImg from "../assets/workers/driver.png";
import masonImg from "../assets/workers/mason.png";
import painterImg from "../assets/workers/painter.png";
import welderImg from "../assets/workers/welder.png";
import mechanicImg from "../assets/workers/mechanic.png";
import helperImg from "../assets/workers/helper.png";
import useLockScroll from "../utils/useLockScroll.js";
import { useNavigate } from "react-router-dom";

const services = [
    {
        title: "Electrician",
        desc: "Wiring, repairs, installations and more.",
        img: electricianImg,
    },
    {
        title: "Plumber",
        desc: "Pipe fixing, leakage repair, fittings.",
        img: plumberImg,
    },
    {
        title: "Carpenter",
        desc: "Furniture work, wood repairs and custom jobs.",
        img: carpenterImg,
    },
    {
        title: "Driver",
        desc: "Hire drivers for local and long trips.",
        img: driverImg,
    },
    {
        title: "Mason",
        desc: "Brickwork, construction and cement work.",
        img: masonImg,
    },
    {
        title: "Painter",
        desc: "Wall painting, polishing and finishing.",
        img: painterImg,
    },
    {
        title: "Welder",
        desc: "Metal welding and fabrication services.",
        img: welderImg,
    },
    {
        title: "Mechanic",
        desc: "Vehicle repair and maintenance services.",
        img: mechanicImg,
    },
    {
        title: "Helper",
        desc: "General assistance for daily work tasks.",
        img: helperImg,
    },
];

const PopularServices = () => {
    const [selectedService, setSelectedService] = useState(null);
    const navigate = useNavigate();
    useLockScroll(selectedService);

    return (
        <section className="py-16 px-5 bg-gray-100">
            <div className="max-w-6xl mx-auto">

                {/* Heading */}
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                    Popular Services
                </h2>

                {/* Cards */}
                <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

                    {services.map((service) => (
                        <div
                            key={service.title}
                            onClick={() => setSelectedService(service)}
                            className="flex items-center gap-5 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                        >
                            <img
                                src={service.img}
                                alt={service.title}
                                className="w-20 h-20 object-contain"
                            />

                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">
                                    {service.title}
                                </h3>
                                <p className="text-gray-500 text-sm mt-1">
                                    {service.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

            </div>

            {/* MODAL */}
            {selectedService && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

                    <div className="bg-white rounded-2xl p-6 w-[90%] max-w-md relative shadow-xl">

                        {/* CLOSE BUTTON */}
                        <button
                            onClick={() => setSelectedService(null)}
                            className="absolute top-3 right-3 text-gray-500 hover:text-black"
                        >
                            <X size={20} />
                        </button>

                        {/* IMAGE */}
                        <img
                            src={selectedService.img}
                            alt={selectedService.title}
                            className="w-24 h-24 object-contain mx-auto"
                        />

                        {/* TITLE */}
                        <h3 className="text-xl font-bold text-center mt-4">
                            {selectedService.title}
                        </h3>

                        {/* DESCRIPTION */}
                        <p className="text-gray-600 text-center mt-2">
                            {selectedService.desc}
                        </p>

                        {/* EXTRA INFO */}
                        <p className="text-sm text-gray-500 text-center mt-3">
                            Skilled professionals available near your location for quick service.
                        </p>

                        {/* ACTION BUTTON */}
                        <button
                            onClick={() => {
                                navigate("/search", {
                                    state: { search: selectedService.title }
                                });
                                setSelectedService(null);
                            }}
                            className="mt-5 w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition">
                            Find {selectedService.title}
                        </button>

                    </div>
                </div>
            )}

        </section>
    );
};

export default PopularServices;