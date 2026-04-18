import React, { useState } from "react";
import { ChevronDown, Search, HelpCircle, MessageCircle, Mail, Phone, } from "lucide-react";

const faqs = [
  {
    section: "Booking",
    items: [
      {
        q: "How do I book a worker?",
        a: "Select your area from the navbar, browse available workers or connectors, and click Book Now."
      },
      {
        q: "Can I pre-book a worker?",
        a: "No. Bookings are only allowed for today, similar to food delivery apps."
      },
      {
        q: "Why can't I see workers?",
        a: "Workers appear only if they are available and in your selected area."
      }
    ]
  },
  {
    section: "Availability",
    items: [
      {
        q: "How does availability work?",
        a: "Workers and connectors toggle availability daily. Only available users are visible."
      },
      {
        q: "Connector vs Worker?",
        a: "Connectors manage multiple workers, while workers are individual service providers."
      }
    ]
  },
  {
    section: "Booking Flow",
    items: [
      {
        q: "What happens after booking?",
        a: "Connector bookings go to pending → accepted → OTP generated → work starts after verification."
      },
      {
        q: "What is OTP?",
        a: "OTP is used to verify worker arrival at your location before starting work."
      }
    ]
  },
  {
    section: "Work Completion",
    items: [
      {
        q: "When does work complete?",
        a: "After 8 hours automatically or when the customer marks it completed."
      },
      {
        q: "Can I finish early?",
        a: "Yes, customers can manually complete the job anytime."
      }
    ]
  },
  {
    section: "Payments",
    items: [
      {
        q: "How do I pay?",
        a: "Payments are handled offline directly between customer and worker/connector."
      }
    ]
  }
];

const HelpPage = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const [search, setSearch] = useState("");

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const filteredFaqs = faqs.map((section) => ({
    ...section,
    items: section.items.filter((item) =>
      item.q.toLowerCase().includes(search.toLowerCase())
    )
  }));

  return (
    <div className="bg-gray-50 min-h-screen">

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">

        {/* HEADER (MATCHED STYLE) */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Help & Support
          </h1>
          <p className="text-sm text-gray-500">
            Find answers to common questions about booking and workflow
          </p>
        </div>

        {/* SEARCH BAR (MATCH YOUR INPUT STYLE) */}
        <div className="relative max-w-6xl">
          <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search your question..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-12 rounded-xl bg-white border border-gray-200 shadow-sm
              pl-11 pr-4 text-sm text-gray-700
              outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>

        {/* FAQ CONTENT */}
        <div className="space-y-6">
          {filteredFaqs.map((section, sIndex) => (
            <div key={sIndex}>

              {/* SECTION TITLE */}
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                {section.section}
              </h2>

              {/* ITEMS */}
              <div className="space-y-3">
                {section.items.map((item, index) => {
                  const globalIndex = `${sIndex}-${index}`;
                  const isOpen = openIndex === globalIndex;

                  return (
                    <div
                      key={globalIndex}
                      className="group bg-white border border-gray-100 rounded-xl shadow-sm 
                        hover:shadow-md transition-all"
                    >
                      {/* QUESTION */}
                      <button
                        onClick={() => toggle(globalIndex)}
                        className="w-full flex justify-between items-center p-4 text-left"
                      >
                        <div className="flex items-center gap-2">
                          <HelpCircle size={16} className="text-orange-500" />
                          <span className="text-sm font-medium text-gray-900">
                            {item.q}
                          </span>
                        </div>

                        <ChevronDown
                          className={`transition-transform text-gray-400 ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {/* ANSWER */}
                      {isOpen && (
                        <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed">
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* CONTACT SUPPORT */}
<div className="mt-10">
  <h2 className="text-lg font-semibold text-gray-900 mb-3">
    Still need help?
  </h2>

  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">

    {/* CHAT */}
    <div className="group bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition cursor-pointer">
      <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mb-3">
        <MessageCircle className="text-orange-500" size={18} />
      </div>

      <h3 className="text-sm font-semibold text-gray-900">
        Chat with us
      </h3>

      <p className="text-xs text-gray-500 mt-1">
        Get instant help from our support team
      </p>

      <button className="mt-4 text-sm font-medium text-orange-500 hover:underline">
        Start Chat
      </button>
    </div>

    {/* EMAIL */}
    <div className="group bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition">
      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-3">
        <Mail className="text-blue-500" size={18} />
      </div>

      <h3 className="text-sm font-semibold text-gray-900">
        Email support
      </h3>

      <p className="text-xs text-gray-500 mt-1">
        We usually respond within 24 hours
      </p>

      <a
        href="mailto:support@yourapp.com"
        className="mt-4 inline-block text-sm font-medium text-blue-500 hover:underline"
      >
        support@yourapp.com
      </a>
    </div>

    {/* PHONE */}
    <div className="group bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition">
      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mb-3">
        <Phone className="text-green-500" size={18} />
      </div>

      <h3 className="text-sm font-semibold text-gray-900">
        Call us
      </h3>

      <p className="text-xs text-gray-500 mt-1">
        Available from 9 AM – 8 PM
      </p>

      <a
        href="tel:+919876543210"
        className="mt-4 inline-block text-sm font-medium text-green-600 hover:underline"
      >
        +91 7330935579
      </a>
    </div>

  </div>
</div>

        {/* EMPTY STATE */}
        {filteredFaqs.every((s) => s.items.length === 0) && (
          <div className="min-h-[40vh] flex flex-col items-center justify-center text-center">

            <div className="bg-orange-100 p-5 rounded-full shadow-sm mb-4">
              <Search size={28} className="text-orange-500" />
            </div>

            <h3 className="text-lg font-semibold text-gray-900">
              No results found
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              Try searching with different keywords
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default HelpPage;