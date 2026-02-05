"use client"

import { useState, useEffect } from "react"
import { Line } from "react-chartjs-2"
import { getAllPayments, getPaymentStats } from "../../../services/adminService"
import { motion, AnimatePresence } from "framer-motion"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js"

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const STATUS_THEMES = {
  Paid: "bg-[#59f20d]/10 text-[#59f20d] border-[#59f20d]/30",
  completed: "bg-[#59f20d]/10 text-[#59f20d] border-[#59f20d]/30",
  initiated: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  Pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  Refunded: "bg-red-500/10 text-red-500 border-red-500/30",
  failed: "bg-red-500/10 text-red-500 border-red-500/30",
}

const Payments = () => {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterDate, setFilterDate] = useState("")
  const [sortConfig, setSortConfig] = useState({ key: "createdAt", direction: "desc" })
  const [selectedPayment, setSelectedPayment] = useState(null)
  
  const [summaryStats, setSummaryStats] = useState({
    totalRevenue: 0,
    completedCount: 0,
    pendingCount: 0,
    failedCount: 0,
  })

  const [chartDataState, setChartDataState] = useState({
    labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"],
    datasets: [{
      label: "Revenue",
      data: [0, 0, 0, 0, 0],
      borderColor: "#59f20d",
      backgroundColor: "rgba(89, 242, 13, 0.05)",
      borderWidth: 3,
      pointRadius: 4,
      pointBackgroundColor: "#59f20d",
      tension: 0.4,
      fill: true,
    }]
  })

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [paymentsRes, statsRes] = await Promise.all([
          getAllPayments(),
          getPaymentStats()
        ])

        if (paymentsRes.success) {
          setTransactions(paymentsRes.data)
          
          const total = paymentsRes.data.filter(p => p.status === 'completed' || p.status === 'Paid').reduce((sum, p) => sum + p.amount, 0)
          const completed = paymentsRes.data.filter(p => p.status === 'completed' || p.status === 'Paid').length
          const pending = paymentsRes.data.filter(p => p.status === 'initiated' || p.status === 'Pending').length
          const failed = paymentsRes.data.filter(p => p.status === 'failed' || p.status === 'Refunded').length
          
          setSummaryStats({
            totalRevenue: total,
            completedCount: completed,
            pendingCount: pending,
            failedCount: failed,
          })

          const last7 = paymentsRes.data
            .filter(p => p.status === 'completed' || p.status === 'Paid')
            .slice(0, 7)
            .reverse()

          setChartDataState({
            labels: last7.map(p => new Date(p.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })),
            datasets: [{
              label: "Daily Revenue",
              data: last7.map(p => p.amount),
              borderColor: "#59f20d",
              backgroundColor: "rgba(89, 242, 13, 0.1)",
              borderWidth: 4,
              pointRadius: 6,
              pointBackgroundColor: "#0d140a",
              pointBorderColor: "#59f20d",
              pointBorderWidth: 2,
              tension: 0.4,
              fill: true,
            }]
          })
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleSort = (key) => {
    let direction = "asc"
    if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc"
    setSortConfig({ key, direction })
  }

  const sortedTransactions = [...transactions].sort((a, b) => {
    const getVal = (obj, path) => path.split(".").reduce((o, k) => (o || {})[k], obj)
    const aV = getVal(a, sortConfig.key)
    const bV = getVal(b, sortConfig.key)
    if (aV < bV) return sortConfig.direction === "asc" ? -1 : 1
    if (aV > bV) return sortConfig.direction === "asc" ? 1 : -1
    return 0
  })

  const filteredTransactions = sortedTransactions.filter((p) => {
    const matchesSearch = 
      p.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.booking?.bookingId?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" ? true : p.status === filterStatus
    const matchesDate = filterDate ? new Date(p.createdAt).toISOString().split('T')[0] === filterDate : true
    return matchesSearch && matchesStatus && matchesDate
  })

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1c2619",
        titleFont: { size: 12, weight: 'bold' },
        bodyFont: { size: 12 },
        padding: 12,
        borderColor: "#2e3928",
        borderWidth: 1,
        displayColors: false,
      }
    },
    scales: {
      x: { 
        grid: { display: false },
        ticks: { color: "#a6ba9c", font: { size: 10, weight: '900' } }
      },
      y: { 
        grid: { color: "rgba(166, 186, 156, 0.05)" },
        ticks: { 
          color: "#a6ba9c", 
          font: { size: 10, weight: '900' },
          callback: (v) => "NPR " + v 
        }
      }
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#59f20d]"></div>
        <p className="text-[#a6ba9c] text-xs font-black uppercase tracking-widest animate-pulse">Loading Transactions...</p>
      </div>
    )
  }

  return (
    <div className="space-y-10 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-white text-3xl font-black uppercase tracking-tighter leading-none mb-2">Transaction<br/>History</h2>
          <p className="text-[#a6ba9c] text-xs font-semibold opacity-60">Monitor all incoming payments and real-time revenue.</p>
        </div>
        <div className="flex gap-4">
          <div className="px-6 py-4 bg-[#1c2619] border border-[#2e3928] rounded-[24px] shadow-2xl">
            <p className="text-[9px] text-[#a6ba9c] font-black uppercase tracking-widest opacity-40 mb-1">Total Revenue</p>
            <p className="text-xl font-black text-[#59f20d]">NPR {summaryStats.totalRevenue.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Completed", val: summaryStats.completedCount, color: "text-[#59f20d]", bg: "bg-[#59f20d]/5" },
          { label: "Pending", val: summaryStats.pendingCount, color: "text-yellow-400", bg: "bg-yellow-400/5" },
          { label: "Failed", val: summaryStats.failedCount, color: "text-red-500", bg: "bg-red-500/5" },
          { label: "Total Transactions", val: transactions.length, color: "text-white", bg: "bg-white/5" },
        ].map((s, i) => (
          <div key={i} className={`p-6 ${s.bg} border border-[#2e3928] rounded-[28px] flex flex-col gap-1`}>
            <span className={`text-2xl font-black ${s.color}`}>{s.val}</span>
            <span className="text-[9px] font-black text-[#a6ba9c] uppercase tracking-widest opacity-40">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#1c2619] border border-[#2e3928] rounded-[32px] p-8 shadow-2xl h-[400px]"
      >
        <div className="flex justify-between items-center mb-10">
          <h3 className="text-white text-xl font-black uppercase tracking-tighter">Revenue Overview</h3>
          <div className="px-4 py-2 bg-[#0d140a] rounded-xl border border-[#2e3928] text-[9px] font-black text-[#59f20d] uppercase tracking-widest">Live Updates</div>
        </div>
        <div className="h-full pb-16">
          <Line options={chartOptions} data={chartDataState} />
        </div>
      </motion.div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative group bg-[#1c2619] border border-[#2e3928] rounded-2xl overflow-hidden focus-within:border-[#59f20d]/50 transition-colors">
          <input
            type="search"
            className="w-full bg-transparent py-4 px-6 text-white text-xs placeholder-[#a6ba9c]/20 focus:outline-none"
            placeholder="Search by ID, User, or Reference..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="bg-[#1c2619] border border-[#2e3928] rounded-2xl overflow-hidden focus-within:border-[#59f20d]/50 transition-colors">
          <input
            type="date"
            className="w-full bg-transparent py-4 px-6 text-white text-[10px] font-black uppercase tracking-widest focus:outline-none"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>
        <div className="bg-[#1c2619] border border-[#2e3928] rounded-2xl overflow-hidden focus-within:border-[#59f20d]/50 transition-colors">
          <select
            className="w-full bg-transparent py-4 px-6 text-white text-[10px] font-black uppercase tracking-widest focus:outline-none cursor-pointer"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">Filter: ALL STATUS</option>
            <option value="completed">Completed</option>
            <option value="Paid">Paid</option>
            <option value="initiated">Initiated</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#1c2619] border border-[#2e3928] rounded-[32px] overflow-hidden shadow-2xl"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-[#0d140a]/40 border-b border-[#2e3928]">
                {["Transaction ID", "User", "Bus Name", "Date", "Total", "Gateway", "Status", "Action"].map((h, i) => (
                  <th 
                    key={h} 
                    className="px-8 py-5 text-left text-[9px] font-black text-[#a6ba9c] uppercase tracking-[0.3em]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2e3928]/40">
              {filteredTransactions.map((p) => (
                <tr key={p._id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-8 py-5">
                    <span className="text-[10px] font-black text-[#59f20d] leading-none tracking-wider uppercase">
                      {(p.transactionId || p.pidx)?.slice(-12) || "WAITING"}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-white">{p.user?.name || "Guest"}</span>
                      <span className="text-[9px] font-black text-[#a6ba9c] uppercase tracking-widest mt-1 opacity-40">{p.user?.email}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-xs text-white/60 font-medium">{p.booking?.bus?.yatayatName || "Intercity Bus"}</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-[10px] text-white font-black uppercase tracking-widest">{new Date(p.createdAt).toLocaleDateString()}</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-sm font-black text-white">NPR {p.amount}</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-[9px] font-black text-[#a6ba9c] uppercase tracking-widest bg-white/5 py-1 px-3 rounded-lg border border-white/10">{p.payment_method}</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`text-[8px] px-2.5 py-1 rounded-full font-black uppercase tracking-widest border ${STATUS_THEMES[p.status] || "bg-white/5 text-white border-white/10"}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button 
                      onClick={() => setSelectedPayment(p)}
                      className="text-[10px] font-black uppercase tracking-[0.2em] text-[#a6ba9c] hover:text-[#59f20d] transition-colors"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Details Modal */}
      <AnimatePresence>
        {selectedPayment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="absolute inset-0 bg-[#0d140a]/90 backdrop-blur-md" 
               onClick={() => setSelectedPayment(null)}
            ></motion.div>
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
               className="relative bg-[#1c2619] border border-[#2e3928] rounded-[40px] w-full max-w-xl overflow-hidden shadow-2xl p-10 md:p-12"
            >
              <h3 className="text-white text-3xl font-black uppercase tracking-tighter leading-none mb-10">Payment <br/>Details</h3>
              <div className="space-y-6">
                <div className="p-6 bg-[#090e07]/40 rounded-3xl border border-[#2e3928] flex justify-between items-center">
                  <span className="text-[10px] font-black text-[#a6ba9c] uppercase tracking-widest">Transaction Status</span>
                  <span className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest border ${STATUS_THEMES[selectedPayment.status]}`}>{selectedPayment.status}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 bg-[#1c2619] border border-[#2e3928] rounded-3xl">
                    <p className="text-[9px] font-black text-[#a6ba9c] uppercase tracking-widest opacity-40 mb-2">Gateway</p>
                    <p className="text-sm font-black text-[#59f20d] uppercase">{selectedPayment.payment_method}</p>
                  </div>
                  <div className="p-6 bg-[#1c2619] border border-[#2e3928] rounded-3xl">
                    <p className="text-[9px] font-black text-[#a6ba9c] uppercase tracking-widest opacity-40 mb-2">Amount Paid</p>
                    <p className="text-sm font-black text-white">NPR {selectedPayment.amount}</p>
                  </div>
                </div>
                <div className="p-8 bg-[#0d140a] rounded-3xl border border-[#2e3928] space-y-4">
                  <div className="flex justify-between">
                    <span className="text-[9px] text-[#a6ba9c] font-black uppercase tracking-widest">Transaction ID</span>
                    <span className="text-[10px] text-white font-mono">{selectedPayment.transactionId || "WAITING"}</span>
                  </div>
                  <div className="flex justify-between border-t border-[#2e3928]/40 pt-4">
                    <span className="text-[9px] text-[#a6ba9c] font-black uppercase tracking-widest">Gateway Reference</span>
                    <span className="text-[10px] text-white font-mono">{selectedPayment.pidx || "N/A"}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedPayment(null)}
                className="w-full mt-10 bg-[#59f20d] text-[#0d140a] font-black py-5 rounded-2xl text-[10px] tracking-[0.4em] uppercase transition-all active:scale-95"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Payments
