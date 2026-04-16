import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Eye, 
  ExternalLink, 
  MessageSquare,
  Clock,
  Filter,
  Users,
  LayoutGrid,
  FileText
} from 'lucide-react'

const AdminDashboard = () => {
  const { user } = useAuth()
  const [portfolios, setPortfolios] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('pending')
  const [moderatingId, setModeratingId] = useState(null)
  const [feedback, setFeedback] = useState('')

  const fetchPortfolios = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } }
      const { data } = await axios.get('/api/portfolios/admin/all', config)
      setPortfolios(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPortfolios()
  }, [user.token])

  const handleModerate = async (id, status) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } }
      await axios.put(`/api/portfolios/admin/moderate/${id}`, { status, feedback }, config)
      setModeratingId(null)
      setFeedback('')
      fetchPortfolios()
    } catch (err) {
      console.error(err)
    }
  }

  const filteredPortfolios = portfolios.filter(p => p.status === activeTab)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-600" />
            Admin Moderation Panel
          </h1>
          <p className="text-slate-600 mt-2">Review and manage user portfolio submissions.</p>
        </div>
        
        <div className="flex gap-4">
          <StatCard icon={<Users className="w-4 h-4" />} label="Total Users" value={new Set(portfolios.map(p => p.user?._id)).size} />
          <StatCard icon={<FileText className="w-4 h-4" />} label="Pending Reviews" value={portfolios.filter(p => p.status === 'pending').length} />
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-slate-100 px-8 py-4 bg-slate-50/50">
          <TabButton 
            active={activeTab === 'pending'} 
            onClick={() => setActiveTab('pending')}
            icon={<Clock className="w-4 h-4" />}
            label="Pending"
            count={portfolios.filter(p => p.status === 'pending').length}
          />
          <TabButton 
            active={activeTab === 'approved'} 
            onClick={() => setActiveTab('approved')}
            icon={<CheckCircle className="w-4 h-4" />}
            label="Approved"
            count={portfolios.filter(p => p.status === 'approved').length}
          />
          <TabButton 
            active={activeTab === 'rejected'} 
            onClick={() => setActiveTab('rejected')}
            icon={<XCircle className="w-4 h-4" />}
            label="Rejected"
            count={portfolios.filter(p => p.status === 'rejected').length}
          />
        </div>

        <div className="p-8">
          {loading ? (
            <div className="py-20 text-center text-slate-400">Loading portfolios...</div>
          ) : filteredPortfolios.length === 0 ? (
            <div className="py-20 text-center text-slate-400 flex flex-col items-center">
              <LayoutGrid className="w-12 h-12 mb-4 opacity-20" />
              <p>No portfolios found in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <AnimatePresence>
                {filteredPortfolios.map((p) => (
                  <motion.div 
                    key={p._id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all group"
                  >
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">
                          {p.user?.name?.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 truncate max-w-[150px]">{p.user?.name}</h3>
                          <p className="text-xs text-slate-500">{p.user?.email}</p>
                        </div>
                      </div>

                      <div className="space-y-3 mb-6">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500 uppercase font-bold tracking-wider">Template</span>
                          <span className="text-slate-900 font-medium capitalize">{p.template}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500 uppercase font-bold tracking-wider">Public URL</span>
                          <span className="text-blue-600 font-bold truncate max-w-[120px]">@{p.publicUrl}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500 uppercase font-bold tracking-wider">Views</span>
                          <span className="text-slate-900 font-bold">{p.views || 0}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <a 
                          href={`/p/${p.publicUrl || ""}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex-1 py-2.5 px-3 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          Preview
                        </a>
                        {p.status === 'pending' && (
                          <button 
                            onClick={() => setModeratingId(p._id)}
                            className="flex-1 py-2.5 px-3 bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
                          >
                            <Shield className="w-4 h-4" />
                            Moderate
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Moderation Drawer */}
                    <AnimatePresence>
                      {moderatingId === p._id && (
                        <motion.div 
                          initial={{ height: 0 }}
                          animate={{ height: 'auto' }}
                          exit={{ height: 0 }}
                          className="bg-white border-t border-slate-200 overflow-hidden"
                        >
                          <div className="p-6 space-y-4">
                            <div>
                              <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">Feedback (Optional)</label>
                              <textarea 
                                rows="3"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                                placeholder="Why are you approving or rejecting this?"
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                              />
                            </div>
                            <div className="flex gap-3">
                              <button 
                                onClick={() => handleModerate(p._id, 'approved')}
                                className="flex-1 py-3 bg-green-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-green-600 transition-colors shadow-lg shadow-green-100"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Approve
                              </button>
                              <button 
                                onClick={() => handleModerate(p._id, 'rejected')}
                                className="flex-1 py-3 bg-red-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-red-600 transition-colors shadow-lg shadow-red-100"
                              >
                                <XCircle className="w-4 h-4" />
                                Reject
                              </button>
                            </div>
                            <button 
                              onClick={() => setModeratingId(null)}
                              className="w-full py-2 text-[10px] font-bold uppercase text-slate-400 hover:text-slate-600 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const TabButton = ({ active, onClick, icon, label, count }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${active ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
  >
    {icon}
    {label}
    <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[10px] ${active ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-500'}`}>
      {count}
    </span>
  </button>
)

const StatCard = ({ icon, label, value }) => (
  <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 min-w-[160px]">
    <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
      {icon}
    </div>
    <div>
      <div className="text-[10px] font-bold uppercase text-slate-400">{label}</div>
      <div className="text-xl font-bold text-slate-900">{value}</div>
    </div>
  </div>
)

export default AdminDashboard
