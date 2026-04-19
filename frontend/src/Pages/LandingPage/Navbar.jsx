import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";


const Navbar = () => {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate()

    useEffect(() => {
        document.body.style.overflow = open ? "hidden" : "auto";
    }, [open]);

    return (
        <header className="fixed top-0 w-full z-50 bg-gray-900 backdrop-blur-md border-b border-white/10">

            <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between text-white">

                <div
                    onClick={() => navigate("/")}
                    className="flex items-center gap-2 group cursor-pointer transition-transform duration-200 active:scale-95 select-none"
                >
                    {/* LOGO */}
                    <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 bg-gray-900 rounded-xl flex items-center justify-center 
                    shadow-lg border border-white/10 transition-transform duration-200 hover:scale-105"
                    >
                        <img
                            src={logo}
                            alt="WC Logo"
                            className="w-4/5 h-4/5 object-contain"
                        />
                    </div>
                    {/* Brand Name */}
                    <h1 className="text-xl md:text-2xl font-bold tracking-tight flex items-center leading-none">
                        <span className="text-white group-hover:text-gray-200 transition-colors">Work</span>
                        <span className="text-orange-400">Connect</span>
                        <span className=" sm:block w-1.5 h-1.5 bg-orange-400 rounded-full ml-1 animate-pulse"></span>
                    </h1>
                </div>

                {/* Desktop Menu */}
                <nav className="hidden md:flex items-center gap-8 text-sm font-medium">

                    <Link to="/" className="relative group">
                        Home
                        <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-orange-400 transition-all duration-300 group-hover:w-full"></span>
                    </Link>

                    <Link to="/worker-signup" className="relative group">
                        Join as Worker
                        <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-orange-400 transition-all duration-300 group-hover:w-full"></span>
                    </Link>

                    <Link to="/connector-signup" className="relative group">
                        Join as Connector
                        <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-orange-400 transition-all duration-300 group-hover:w-full"></span>
                    </Link>

                    <Link to="/about" className="relative group">
                        About
                        <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-orange-400 transition-all duration-300 group-hover:w-full"></span>
                    </Link>

                    <Link to="/signin">
                        <button className="bg-orange-500 px-5 py-2 rounded-md hover:bg-orange-600 transition duration-150">
                            Sign in
                        </button>
                    </Link>

                </nav>

                {/* Mobile Toggle Button */}
                <button
                    onClick={() => setOpen(!open)}
                    aria-label="Toggle menu"
                    className="md:hidden p-2 rounded-md hover:bg-white/10 transition"
                >
                    {open ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Overlay */}
            {open && (
                <div
                    className="fixed inset-0 bg-black/50 md:hidden"
                    onClick={() => setOpen(false)}
                />
            )}

            {/* Mobile Menu */}
            <div
                className={`md:hidden absolute left-4 right-4 top-16 bg-gray-900 border border-white/10 rounded-xl shadow-xl transition-all duration-300 ease-in-out ${open
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-2 pointer-events-none"
                    }`}
            >
                <div className="flex flex-col p-4 gap-4 text-sm text-white">
                    {[
                        { name: "Home", path: "/" },
                        { name: "Join as Worker", path: "/worker-signup" },
                        { name: "Join as Connector", path: "/connector-signup" },
                        { name: "About", path: "/about" },
                    ].map((item) => (
                        <Link
                            key={item.name}
                            to={item.path}
                            onClick={() => setOpen(false)}
                            className="relative group"
                        >
                            {item.name}
                            <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-orange-400 transition-all duration-300 group-hover:w-full"></span>
                        </Link>
                    ))}

                    <Link to="/signin" onClick={() => setOpen(false)}>
                        <button className="mt-2 w-full bg-orange-500 py-2 rounded-md font-medium hover:bg-orange-600 transition duration-150">
                            Sign in
                        </button>
                    </Link>
                </div>
            </div>
        </header>
    );
};

export default Navbar;