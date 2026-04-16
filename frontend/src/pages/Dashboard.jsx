import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import { motion } from 'framer-motion'
import { Plus, Eye, Edit3, BarChart3, CheckCircle, Clock, AlertCircle, LayoutGrid, Users, MessageSquare } from 'lucide-react'

const Dashboard = () => {
  const { user } = useAuth()
  const [portfolios, setPortfolios] = useState([])
  const [explorePortfolios, setExplorePortfolios] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const config = {
          headers: { Authorization: `Bearer ${user.token}` }
        }
        // Fetch User's Portfolios
        const { data: myData } = await axios.get('/api/portfolios/my', config)
        setPortfolios(myData)
      } catch (err) {
        console.log('Error fetching portfolios')
      }

      try {
        // Fetch Approved Portfolios for Explore section
        const { data: exploreData } = await axios.get('/api/portfolios/explore')
        setExplorePortfolios(exploreData)
      } catch (err) {
        console.error('Failed to fetch explore portfolios')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [user.token])

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'pending': return <Clock className="w-5 h-5 text-yellow-500" />
      case 'rejected': return <AlertCircle className="w-5 h-5 text-red-500" />
      default: return <Clock className="w-5 h-5 text-slate-400" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700 border-green-200'
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-slate-100 text-slate-600 border-slate-200'
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Welcome back, {user.name}!</h1>
          <p className="text-slate-600 mt-1">Manage your portfolios and track their performance.</p>
        </div>
        {!loading && (
          <Link
            to="/builder"
            className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold shadow-md hover:bg-blue-700 transition-all hover:scale-105"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create New Portfolio
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content: Your Portfolios */}
        <div className="lg:col-span-2 space-y-12">
          <section>
            <div className="flex items-center gap-2 mb-6">
              <LayoutGrid className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-slate-900">Your Portfolios</h2>
            </div>
            {portfolios.length > 0 ? (
              <div className="space-y-6">
                {portfolios.map((portfolio) => (
                  <motion.div 
                    key={portfolio._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100"
                  >
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 rounded-xl">
                          <Layout className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-slate-900 capitalize">{portfolio.template} Portfolio</h3>
                          <div className={`mt-1 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(portfolio.status)}`}>
                            {getStatusIcon(portfolio.status)}
                            <span className="capitalize">{portfolio.status}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Link
                          to="/builder"
                          className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-700 border border-slate-200 rounded-xl font-bold text-sm hover:bg-slate-100 transition-all"
                        >
                          <Edit3 className="w-4 h-4 text-blue-600" />
                          Edit
                        </Link>
                        {portfolio.status === 'approved' && (
                          <Link
                            to={`/p/${portfolio.publicUrl || ""}`}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all"
                          >
                            <Eye className="w-4 h-4" />
                            Live
                          </Link>
                        )}
                      </div>
                    </div>

                    {portfolio.feedback && (
                      <div className={`mb-8 p-6 rounded-2xl border flex gap-4 ${
                        portfolio.status === 'rejected' ? 'bg-red-50 border-red-100' : 'bg-blue-50 border-blue-100'
                      }`}>
                        {portfolio.status === 'rejected' ? (
                          <AlertCircle className="w-6 h-6 text-red-500 shrink-0" />
                        ) : (
                          <MessageSquare className="w-6 h-6 text-blue-500 shrink-0" />
                        )}
                        <div>
                          <h4 className={`text-sm font-bold mb-1 ${
                            portfolio.status === 'rejected' ? 'text-red-800' : 'text-blue-800'
                          }`}>
                            {portfolio.status === 'rejected' ? 'Feedback from Admin:' : 'Comment from Admin:'}
                          </h4>
                          <p className={`text-sm leading-relaxed ${
                            portfolio.status === 'rejected' ? 'text-red-700' : 'text-blue-700'
                          }`}>
                            {portfolio.feedback}
                          </p>
                        </div>
                      </div>
                    )}

                    {portfolio.status === 'pending' && (
                      <div className="mb-8 p-6 bg-yellow-50 rounded-2xl border border-yellow-100 flex gap-4">
                        <Clock className="w-6 h-6 text-yellow-500 shrink-0" />
                        <div>
                          <h4 className="text-sm font-bold text-yellow-800 mb-1">In Review</h4>
                          <p className="text-sm text-yellow-700 leading-relaxed">Our admins are currently reviewing your portfolio. This usually takes 24 hours.</p>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-6 border-t border-slate-50">
                      <StatCard icon={<Eye className="w-4 h-4" />} label="Total Views" value={portfolio.views || 0} />
                      <StatCard icon={<BarChart3 className="w-4 h-4" />} label="Public URL" value={`@${portfolio.publicUrl || 'unset'}`} />
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              !loading && (
                <div className="bg-white p-12 rounded-2xl shadow-sm border border-dashed border-slate-300 text-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">No portfolio yet</h3>
                  <p className="text-slate-500 mb-6">Create your first professional portfolio to get started.</p>
                  <Link to="/builder" className="text-blue-600 font-semibold hover:underline">Start Building →</Link>
                </div>
              )
            )}
          </section>

          {/* Explore Section: Show approved portfolios by other users */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <Users className="w-6 h-6 text-indigo-600" />
              <h2 className="text-2xl font-bold text-slate-900">Explore Portfolios</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {explorePortfolios.length > 0 ? (
                explorePortfolios.map((p) => (
                  <Link key={p._id} to={`/p/${p.publicUrl}`} className="group block bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center font-bold text-indigo-600">
                          {p.user?.name?.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900">{p.user?.name}</h4>
                          <p className="text-xs text-slate-500 capitalize">{p.template}</p>
                        </div>
                      </div>
                      <Eye className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors" />
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-1">
                      <BarChart3 className="w-3 h-3" />
                      {p.views || 0} views
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-slate-400 text-sm">No approved portfolios yet.</p>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-3xl shadow-lg text-white">
            <h3 className="text-xl font-bold mb-2">Build Your Brand</h3>
            <p className="text-blue-100 text-sm leading-relaxed mb-6">
              Your portfolio is the first thing recruiters see. Keep it updated with your latest projects and skills.
            </p>
            <div className="space-y-4">
              <Step icon={<CheckCircle className="w-4 h-4" />} text="Register & Design" active={true} />
              <Step icon={<Clock className="w-4 h-4" />} text="Submit for Review" active={portfolios.some(p => p.status === 'pending' || p.status === 'approved')} />
              <Step icon={<Users className="w-4 h-4" />} text="Get Approved & Go Live" active={portfolios.some(p => p.status === 'approved')} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const Step = ({ icon, text, active }) => (
  <div className={`flex items-center gap-3 text-sm font-bold ${active ? 'text-white' : 'text-blue-300 opacity-50'}`}>
    {icon}
    {text}
  </div>
)

const StatCard = ({ icon, label, value }) => (
  <div className="bg-slate-50 p-4 rounded-xl">
    <div className="flex items-center gap-2 text-slate-500 mb-1">
      {icon}
      <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
    </div>
    <div className="text-lg font-bold text-slate-900 truncate">{value}</div>
  </div>
)

const Layout = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
)

export default Dashboard
