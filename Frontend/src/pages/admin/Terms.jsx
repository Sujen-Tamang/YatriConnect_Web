import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { getLegalDocBySlug, upsertLegalDoc } from "../../../services/adminService"
import { toast } from "react-toastify"

const Terms = () => {
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDoc = async () => {
      const res = await getLegalDocBySlug("terms")
      if (res.success && res.data) {
        setContent(res.data.content)
      } else {
        setContent(`1. Terms of Service...`)
      }
      setLoading(false)
    }
    fetchDoc()
  }, [])

  const handleUpdate = async () => {
    const res = await upsertLegalDoc({
      title: "Term and Condition",
      slug: "terms",
      content,
      status: "active"
    })
    if (res.success) {
      toast.success("TERMS UPDATED SUCCESSFULLY")
    } else {
      toast.error("FAILED TO UPDATE TERMS")
    }
  }

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-64 gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#59f20d]"></div>
        <p className="text-[#a6ba9c] text-xs font-black uppercase tracking-widest animate-pulse">Loading Terms...</p>
    </div>
  )

  return (
    <div className="space-y-10 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
            <h2 className="text-white text-3xl font-black uppercase tracking-tighter leading-none mb-2">Terms &<br/>Conditions</h2>
            <p className="text-[#a6ba9c] text-xs font-semibold opacity-60">Manage your application's service terms and user agreements.</p>
        </div>
        <button
            onClick={handleUpdate}
            className="bg-[#59f20d] text-[#0d140a] px-8 py-4 rounded-2xl font-black text-[10px] tracking-[0.3em] uppercase transition-all shadow-[0_0_20px_rgba(89,242,13,0.2)] hover:bg-white active:scale-95"
        >
            Save Changes
        </button>
      </div>

      {/* Editor Interface */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#1c2619] border border-[#2e3928] rounded-[32px] overflow-hidden shadow-2xl p-8 space-y-8">
        <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black text-[#59f20d] uppercase tracking-[0.4em]">Content Editor</h3>
            <span className="text-[9px] font-black text-[#a6ba9c] uppercase tracking-widest opacity-40 italic">Last Updated: Recently</span>
        </div>

        <div className="relative group">
            <textarea 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-[400px] bg-[#0d140a]/60 border border-[#2e3928] rounded-[24px] p-10 text-[#a6ba9c] text-sm font-medium leading-[1.8] focus:border-[#59f20d] outline-none transition-all resize-none custom-scrollbar"
                placeholder="Type your terms and conditions here..."
            />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
                { label: "Scope", val: "GLOBAL", color: "text-white" },
                { label: "Visibility", val: "PUBLIC", color: "text-white" },
                { label: "Status", val: "ACTIVE", color: "text-[#59f20d]" },
            ].map((s, i) => (
                <div key={i} className="p-6 bg-[#0d140a]/40 border border-[#2e3928]/40 rounded-2xl flex flex-col gap-1">
                    <span className={`text-xl font-black ${s.color}`}>{s.val}</span>
                    <span className="text-[9px] font-black text-[#a6ba9c] uppercase tracking-widest opacity-30">{s.label}</span>
                </div>
            ))}
        </div>
      </motion.div>
    </div>
  )
}

export default Terms
