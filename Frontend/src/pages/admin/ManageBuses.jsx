"use client";

import { useState, useEffect } from "react";
import { getAllBuses, createBus, updateBus, deleteBus } from "../../../services/adminService";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

const ManageBuses = () => {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    busNumber: "",
    yatayatName: "",
    totalSeats: "",
    price: "", // Keep price here as base vehicle price or moved to route
  });
  const [isEditing, setIsEditing] = useState(false);
  const [currentBusId, setCurrentBusId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchBuses = async () => {
    setLoading(true);
    try {
      const response = await getAllBuses();
      if (response.success && response.data) {
        setBuses(response.data);
      }
    } catch (error) {
      toast.error('Error fetching buses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuses();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddBus = () => {
    setFormData({
      busNumber: "", yatayatName: "", totalSeats: "", price: "",
    });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleEditBus = (bus) => {
    setFormData({
      busNumber: bus.busNumber,
      yatayatName: bus.yatayatName || "",
      totalSeats: bus.totalSeats,
      price: bus.price,
    });
    setCurrentBusId(bus._id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDeleteBus = async (busId) => {
    if (window.confirm("Are you sure you want to delete this bus?")) {
      try {
        const response = await deleteBus(busId);
        if (response.success) {
          toast.success('Bus deleted');
          setBuses(buses.filter((bus) => bus._id !== busId));
        }
      } catch (error) {
        toast.error('Failed to delete bus');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const busData = {
      ...formData,
      totalSeats: Number(formData.totalSeats),
      price: Number(formData.price),
    };

    try {
      if (isEditing) {
        const response = await updateBus(currentBusId, busData);
        if (response.success) {
          toast.success('Bus details updated');
          fetchBuses();
        }
      } else {
        const response = await createBus(busData);
        if (response.success) {
          toast.success('Bus added successfully');
          fetchBuses();
        }
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const filteredBuses = buses.filter((bus) => 
    bus.busNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (bus.yatayatName && bus.yatayatName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
        <div className="flex flex-col justify-center items-center h-64 gap-4">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#59f20d]"></div>
            <p className="text-[#a6ba9c] text-xs font-black uppercase tracking-widest animate-pulse">Loading Buses...</p>
        </div>
    )
  }

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
            <h2 className="text-white text-3xl font-black uppercase tracking-tighter leading-none mb-2">Bus <br/>Registration</h2>
            <p className="text-[#a6ba9c] text-xs font-semibold opacity-60">Register your fleet vehicles here before assigning them to routes.</p>
        </div>
        <button
            onClick={handleAddBus}
            className="bg-[#59f20d] text-[#0d140a] px-8 py-4 rounded-2xl font-black text-[10px] tracking-[0.3em] uppercase transition-all shadow-[0_0_20px_rgba(89,242,13,0.2)] hover:bg-white active:scale-95"
        >
            Register New Bus
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search by bus number or company..."
              className="w-full bg-[#1c2619] border border-[#2e3928] rounded-2xl px-6 py-4 text-white text-[10px] font-black tracking-widest uppercase focus:border-[#59f20d] outline-none transition-all placeholder-white/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#1c2619] border border-[#2e3928] rounded-[32px] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-[#0d140a]/40 border-b border-[#2e3928]">
                {["Bus Number", "Company", "Capacity", "Base Price", "Actions"].map((h) => (
                  <th key={h} className="px-8 py-5 text-left text-[9px] font-black text-[#a6ba9c] uppercase tracking-[0.3em]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2e3928]/40">
              {filteredBuses.map((bus) => (
                <tr key={bus._id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-8 py-5">
                    <span className="text-[11px] font-black text-[#59f20d] uppercase tracking-widest leading-none">#{bus.busNumber}</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-xs font-black text-white uppercase">{bus.yatayatName || 'Generic'}</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-xs font-black text-white uppercase">{bus.totalSeats} SEATS</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-[10px] font-black text-[#59f20d] uppercase tracking-widest">NPR {bus.price}</span>
                  </td>
                  <td className="px-8 py-5 text-right space-x-6">
                    <button onClick={() => handleEditBus(bus)} className="text-[10px] font-black uppercase tracking-widest text-[#a6ba9c] hover:text-white transition-colors">Edit</button>
                    <button onClick={() => handleDeleteBus(bus._id)} className="text-[10px] font-black uppercase tracking-widest text-[#a6ba9c] hover:text-red-500 transition-colors">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#0d140a]/90 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-[#1c2619] border border-[#2e3928] rounded-[40px] w-full max-w-xl overflow-hidden shadow-2xl p-10 md:p-12">
              <h3 className="text-white text-3xl font-black uppercase tracking-tighter mb-10 leading-none">{isEditing ? "Edit Vehicle" : "Register Vehicle"}</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-[#a6ba9c] uppercase tracking-widest ml-1 opacity-60">Bus Number</label>
                        <input name="busNumber" value={formData.busNumber} onChange={handleInputChange} required className="w-full bg-[#0d140a]/60 border border-[#2e3928] rounded-xl p-4 text-white text-xs focus:border-[#59f20d] outline-none" placeholder="BA 1 K 1234" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-[#a6ba9c] uppercase tracking-widest ml-1 opacity-60">Company Name</label>
                        <input name="yatayatName" value={formData.yatayatName} onChange={handleInputChange} className="w-full bg-[#0d140a]/60 border border-[#2e3928] rounded-xl p-4 text-white text-xs focus:border-[#59f20d] outline-none" placeholder="Makalu Yatayat" />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-[#a6ba9c] uppercase tracking-widest ml-1 opacity-60">Total Capacity</label>
                        <input name="totalSeats" type="number" value={formData.totalSeats} onChange={handleInputChange} required className="w-full bg-[#0d140a]/60 border border-[#2e3928] rounded-xl p-4 text-white text-xs focus:border-[#59f20d] outline-none" placeholder="e.g. 40" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-[#a6ba9c] uppercase tracking-widest ml-1 opacity-60">Base Price (NPR)</label>
                        <input name="price" type="number" value={formData.price} onChange={handleInputChange} required className="w-full bg-[#0d140a]/60 border border-[#2e3928] rounded-xl p-4 text-white text-xs focus:border-[#59f20d] outline-none" placeholder="e.g. 1200" />
                    </div>
                </div>
                <div className="pt-8 flex gap-4">
                  <button type="submit" className="flex-1 bg-[#59f20d] text-[#0d140a] font-black py-5 rounded-2xl text-[10px] tracking-[0.4em] uppercase hover:bg-white transition-all shadow-[0_0_20px_rgba(89,242,13,0.3)]">Save Vehicle</button>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-10 bg-[#2e3928] text-white font-black py-5 rounded-2xl text-[10px] tracking-[0.4em] uppercase transition-all">Cancel</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageBuses;