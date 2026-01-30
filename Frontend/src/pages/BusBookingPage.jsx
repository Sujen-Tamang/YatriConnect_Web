"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getAllBuses } from "../../services/busService";
import { getActiveCityBuses } from "../../services/cityBusService";

const BusBookingPage = () => {
  const [viewType, setViewType] = useState("intercity"); // "intercity" | "citybus"
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [allBuses, setAllBuses] = useState([]);
  const [allCityBuses, setAllCityBuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("departureTime");
  const [sortedBuses, setSortedBuses] = useState([]);

  const navigate = useNavigate();

  const allLocations = [
    "Kathmandu",
    "Pokhara",
    "Chitwan",
    "Butwal",
    "Biratnagar",
    "Dharan",
    "Birgunj",
    "Nepalgunj",
  ];

  const getAvailableToLocations = () =>
    from ? allLocations.filter((l) => l !== from) : allLocations;

  const getAvailableFromLocations = () =>
    to ? allLocations.filter((l) => l !== to) : allLocations;

  useEffect(() => {
    setDate(new Date().toISOString().split("T")[0]);
  }, []);

  useEffect(() => {
    const fetchBuses = async () => {
      setLoading(true);
      setError(null);
      try {
        if (viewType === "intercity") {
          const response = await getAllBuses();
          if (response.success) {
            setAllBuses(response.data || []);
          } else {
            throw new Error(response.message || "Failed to fetch buses");
          }
        } else {
          const response = await getActiveCityBuses();
          if (response.success) {
            setAllCityBuses(response.data || []);
          } else {
            throw new Error(response.message || "Failed to fetch city buses");
          }
        }
      } catch (err) {
        setError(err.message || "An error occurred while fetching buses.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBuses();
  }, [viewType]);

  useEffect(() => {
    if (viewType === "intercity") {
      let filteredBuses = [...allBuses];
      if (from) filteredBuses = filteredBuses.filter((bus) => bus.route?.from?.toLowerCase() === from.toLowerCase());
      if (to) filteredBuses = filteredBuses.filter((bus) => bus.route?.to?.toLowerCase() === to.toLowerCase());
      setSortedBuses(sortBuses(filteredBuses, sortBy));
    } else {
      setSortedBuses(sortBuses([...allCityBuses], sortBy));
    }
  }, [allBuses, allCityBuses, from, to, date, sortBy, viewType]);

  const handleSearch = async (e) => {
    e.preventDefault();
    setError(null);
    if (sortedBuses.length === 0) {
      let msg = "No buses found";
      if (from && to) {
        msg = `No buses found for ${from} to ${to}`;
        if (date) msg += ` on ${formatDate(date)}`;
      }
      setError(msg);
    }
  };

  const sortBuses = (busList, criterion) =>
    [...busList].sort((a, b) => {
      switch (criterion) {
        case "price":
          return a.price - b.price;
        case "departureTime":
          return convertTimeToMinutes(a.schedule.departure) - convertTimeToMinutes(b.schedule.departure);
        case "availableSeats":
          return b.availableSeats - a.availableSeats;
        default:
          return 0;
      }
    });

  const convertTimeToMinutes = (timeString) => {
    const [time, period] = timeString.split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    if (period === "PM" && hours !== 12) hours += 12;
    else if (period === "AM" && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const handleBookNow = (bus) => {
    navigate(`/book/details`, { state: { bus, journeyDate: date } });
  };

  const getUniqueCityRoutes = (buses) => {
    const unique = new Map();
    buses.forEach(bus => {
      if (bus.route?.from && bus.route?.to) {
        const key = `${bus.route.from}-${bus.route.to}`;
        if (!unique.has(key)) {
          unique.set(key, { ...bus, activeCount: 1 });
        } else {
          unique.get(key).activeCount += 1;
        }
      }
    });
    return Array.from(unique.values());
  };

  return (
    <div className="min-h-screen bg-[#0d140a]">
      {/* Hero Header */}
      <section className="relative py-14 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#59f20d]/8 via-transparent to-transparent"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#59f20d]/5 rounded-full blur-3xl"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-2 bg-[#59f20d]/10 border border-[#59f20d]/20 rounded-full px-4 py-1.5 mb-4">
              <span className="material-symbols-outlined text-[#59f20d] text-sm">search</span>
              <span className="text-[#59f20d] text-sm font-medium">Find & Book</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
              Book Your <span className="text-[#59f20d]">{viewType === "intercity" ? "Bus" : "City Bus"}</span>
            </h1>
            <p className="text-[#a6ba9c] text-lg max-w-2xl mx-auto mb-6">
              Search for buses between cities or find local active city buses in Nepal and book your seats instantly
            </p>

            {/* Toggle View */}
            {/* <div className="flex justify-center max-w-md mx-auto bg-[#1c2619] p-1.5 rounded-xl border border-[#2e3928]">
                <button
                  onClick={() => setViewType("intercity")}
                  className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-all ${
                    viewType === "intercity" 
                      ? "bg-[#59f20d] text-[#0d140a] shadow-[0_0_15px_rgba(89,242,13,0.3)]" 
                      : "text-[#a6ba9c] hover:text-white"
                  }`}
                >
                  City to City
                </button>
                <button
                  onClick={() => setViewType("citybus")}
                  className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-all ${
                    viewType === "citybus" 
                      ? "bg-[#59f20d] text-[#0d140a] shadow-[0_0_15px_rgba(89,242,13,0.3)]" 
                      : "text-[#a6ba9c] hover:text-white"
                  }`}
                >
                  City Buses
                </button>
            </div> */}
          </motion.div>

          {viewType === "intercity" && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-[#1c2619] border border-[#2e3928] rounded-2xl overflow-hidden shadow-[0_20px_60px_-10px_rgba(0,0,0,0.5)]">
                <form onSubmit={handleSearch} className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* From */}
                    <div>
                      <label className="flex items-center gap-1.5 text-[#a6ba9c] text-sm font-medium mb-2">
                        <span className="material-symbols-outlined text-[#59f20d] text-lg">trip_origin</span>
                        From
                      </label>
                      <select
                        value={from}
                        onChange={(e) => setFrom(e.target.value)}
                        className="w-full px-3 py-2.5 bg-[#0d140a] border border-[#2e3928] rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#59f20d]/50 focus:border-[#59f20d] transition-colors appearance-none"
                        required
                      >
                        <option value="" disabled>Select Departure</option>
                        {getAvailableFromLocations().map((l) => (
                          <option key={`from-${l}`} value={l}>{l}</option>
                        ))}
                      </select>
                    </div>
                    {/* To */}
                    <div>
                      <label className="flex items-center gap-1.5 text-[#a6ba9c] text-sm font-medium mb-2">
                        <span className="material-symbols-outlined text-[#59f20d] text-lg">location_on</span>
                        To
                      </label>
                      <select
                        value={to}
                        onChange={(e) => setTo(e.target.value)}
                        className="w-full px-3 py-2.5 bg-[#0d140a] border border-[#2e3928] rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#59f20d]/50 focus:border-[#59f20d] transition-colors appearance-none"
                        required
                      >
                        <option value="" disabled>Select Destination</option>
                        {getAvailableToLocations().map((l) => (
                          <option key={`to-${l}`} value={l}>{l}</option>
                        ))}
                      </select>
                    </div>
                    {/* Date */}
                    <div>
                      <label className="flex items-center gap-1.5 text-[#a6ba9c] text-sm font-medium mb-2">
                        <span className="material-symbols-outlined text-[#59f20d] text-lg">calendar_today</span>
                        Date
                      </label>
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full px-3 py-2.5 bg-[#0d140a] border border-[#2e3928] rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#59f20d]/50 focus:border-[#59f20d] transition-colors [color-scheme:dark]"
                        min={new Date().toISOString().split("T")[0]}
                        required
                      />
                    </div>
                    {/* Search Button */}
                    <div className="flex items-end">
                      <button
                        type="submit"
                        className="w-full bg-[#59f20d] text-[#0d140a] font-bold py-2.5 px-4 rounded-lg hover:bg-[#4ed40b] shadow-[0_0_15px_rgba(89,242,13,0.2)] hover:shadow-[0_0_25px_rgba(89,242,13,0.4)] transition-all flex items-center justify-center gap-2"
                        disabled={loading}
                      >
                        {loading ? (
                          <span className="flex items-center gap-2">
                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Searching...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg">search</span>
                            Search Buses
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                  {error && (
                    <div className="mt-4 bg-red-900/30 border border-red-500/30 text-red-400 p-4 rounded-lg flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg">error</span>
                      <p className="text-sm">{error}</p>
                    </div>
                  )}
                </form>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Results Section */}
      <section className="pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {sortedBuses.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">Available {viewType === "intercity" ? "Buses" : "City Buses"}</h2>
                  <p className="text-[#a6ba9c] text-sm mt-1">
                    {from && to && viewType === "intercity" ? (
                      <>Showing results for <span className="text-[#59f20d] font-medium">{from}</span> to <span className="text-[#59f20d] font-medium">{to}</span></>
                    ) : (
                      <>{sortedBuses.length} buses currently active</>
                    )}
                  </p>
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 bg-[#1c2619] border border-[#2e3928] rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#59f20d]/50 focus:border-[#59f20d] transition-colors appearance-none pr-8"
                >
                  <option value="departureTime">Sort by Departure</option>
                  <option value="price">Sort by Price</option>
                  <option value="availableSeats">Sort by Seats</option>
                </select>
              </div>

              <div className="space-y-4">
                {viewType === "intercity" ? (
                  sortedBuses.map((bus, index) => (
                    <motion.div
                      key={bus.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="bg-[#1c2619] border border-[#2e3928] rounded-xl p-6 hover:border-[#59f20d]/30 transition-all duration-300 group"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        {/* Bus Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="size-10 bg-[#59f20d]/10 rounded-lg flex items-center justify-center group-hover:bg-[#59f20d]/20 transition-colors">
                              <span className="material-symbols-outlined text-[#59f20d]">directions_bus</span>
                            </div>
                            <div>
                              <span className="text-lg font-bold text-white">{bus.busNumber}</span>
                              {bus.yatayatName && <span className="text-[#a6ba9c] text-sm ml-2">• {bus.yatayatName}</span>}
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                            <div className="flex items-center gap-1.5 text-[#a6ba9c]">
                              <span className="material-symbols-outlined text-[#59f20d]/60 text-base">schedule</span>
                              <span>Departs: <span className="text-white font-medium">{bus.schedule?.departure || 'N/A'}</span></span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[#a6ba9c]">
                              <span className="material-symbols-outlined text-[#59f20d]/60 text-base">schedule</span>
                              <span>Arrives: <span className="text-white font-medium">{bus.schedule?.arrival || 'N/A'}</span></span>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-[#a6ba9c]">
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">route</span>
                              {bus.route?.from || bus.route?.routeName || bus.yatayatName} {bus.route?.to ? `→ ${bus.route.to}` : ''}
                            </span>
                            {(bus.route?.distance || bus.distance) && <span>• {bus.route?.distance || bus.distance} km</span>}
                            {bus.route?.duration && <span>• {Math.floor(bus.route.duration / 60)}h {bus.route.duration % 60}m</span>}
                          </div>
                        </div>

                        {/* Price & Action */}
                        <div className="flex flex-col items-end gap-3">
                          <div className="flex items-center gap-5">
                            <div className="text-right">
                              <p className="text-[#a6ba9c] text-xs">Price</p>
                              <p className="text-[#59f20d] font-bold text-xl">NPR {bus.price}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[#a6ba9c] text-xs">Seats</p>
                              <p className={`font-bold text-lg ${bus.availableSeats > 5 ? "text-[#59f20d]" : "text-red-400"}`}>
                                {bus.availableSeats}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleBookNow(bus)}
                            className="bg-[#59f20d] text-[#0d140a] font-bold px-6 py-2.5 rounded-lg hover:bg-[#4ed40b] shadow-[0_0_12px_rgba(89,242,13,0.2)] hover:shadow-[0_0_20px_rgba(89,242,13,0.4)] transition-all transform hover:-translate-y-0.5"
                          >
                            Book Now
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  getUniqueCityRoutes(sortedBuses).map((routeData, index) => (
                    <motion.div
                      key={routeData.id}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      onClick={() => navigate('/busTracking')}
                      className="bg-[#1c2619] border border-[#2e3928] rounded-2xl p-6 hover:border-[#3b82f6]/50 transition-all cursor-pointer group shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-3">
                          <div className="bg-[#3b82f6]/10 px-3 py-1.5 rounded-lg border border-[#3b82f6]/20">
                            <span className="text-[#3b82f6] font-bold text-sm">Route ID: {routeData.busNumber.split('-')[0] || "Active"}</span>
                          </div>
                          <span className="text-[#a6ba9c] text-sm">Every 15 mins</span>
                        </div>
                        <div className="flex items-center">
                          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-[#34d399]/10 rounded-full border border-[#34d399]/20 text-[#34d399] text-xs font-bold">
                            <div className="w-1.5 h-1.5 flex rounded-full bg-[#34d399]"></div>
                            ACTIVE ({routeData.activeCount} Buses)
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {/* Graphical Timeline */}
                        <div className="flex flex-col items-center w-6">
                          <div className="w-4 h-4 rounded-full border-2 border-[#3b82f6] flex items-center justify-center">
                            <div className="w-2 h-2 bg-[#3b82f6] rounded-full"></div>
                          </div>
                          <div className="w-0.5 h-10 bg-[#374151] my-1 group-hover:bg-[#3b82f6]/50 transition-colors"></div>
                          <span className="material-symbols-outlined text-[#a6ba9c] text-lg group-hover:text-[#3b82f6] transition-colors">location_on</span>
                        </div>

                        {/* Location Data */}
                        <div className="flex flex-col justify-between h-[76px] flex-1">
                          <div className="mb-2">
                            <p className="text-[#6b7280] text-xs font-semibold uppercase tracking-wider mb-0.5">Origin</p>
                            <p className="text-white font-bold text-lg">{routeData.route.from}</p>
                          </div>
                          <div>
                            <p className="text-[#6b7280] text-xs font-semibold uppercase tracking-wider mb-0.5">Destination</p>
                            <p className="text-white font-bold text-lg">{routeData.route.to}</p>
                          </div>
                        </div>

                        {/* Navigate Chevron */}
                        <div className="ml-auto flex items-center justify-center w-12 h-12 rounded-full bg-[#0d140a] group-hover:bg-[#3b82f6]/10 border border-[#2e3928] group-hover:border-[#3b82f6]/30 transition-all">
                          <span className="material-symbols-outlined text-[#a6ba9c] text-2xl group-hover:text-[#3b82f6] transition-colors transform group-hover:translate-x-0.5">arrow_forward</span>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {!loading && sortedBuses.length === 0 && (viewType === 'citybus' || (from && to)) && (
            <div className="text-center py-16">
              <div className="size-20 bg-[#1c2619] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#2e3928]">
                <span className="material-symbols-outlined text-[#a6ba9c] text-4xl">search_off</span>
              </div>
              <h3 className="text-white text-xl font-bold mb-2">{viewType === "intercity" ? "No Buses Found" : "No Active City Buses"}</h3>
              <p className="text-[#a6ba9c]">
                {viewType === "intercity"
                  ? `No buses found for ${from} to ${to}${date && typeof formatDate === 'function' ? ` on ${formatDate(date)}` : ''}`
                  : "There are currently no active city buses running."}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default BusBookingPage;