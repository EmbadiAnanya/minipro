import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import DeveloperTemplate from '../templates/DeveloperTemplate'
import { motion } from 'framer-motion'
import { AlertCircle } from 'lucide-react'

const PublicViewer = () => {
  const { publicUrl } = useParams()
  const [portfolio, setPortfolio] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchPublicPortfolio = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = userInfo ? {
          headers: { Authorization: `Bearer ${userInfo.token}` }
        } : {};

        const { data } = await axios.get(`/api/portfolios/public/${publicUrl}`, config)
        setPortfolio(data)
      } catch (err) {
        setError(err.response?.data?.message || 'Portfolio not found')
      } finally {
        setLoading(false)
      }
    }
    fetchPublicPortfolio()
  }, [publicUrl])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
    </div>
  )

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-12 rounded-3xl shadow-xl border border-slate-100 text-center max-w-lg"
      >
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-4">Wait a second!</h1>
        <p className="text-slate-600 leading-relaxed mb-8">{error}</p>
        <a href="/" className="inline-block bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all">
          Go Home
        </a>
      </motion.div>
    </div>
  )

  return (
    <div className="min-h-screen">
      {portfolio.template === 'developer' && <DeveloperTemplate portfolio={portfolio} />}
      
      {/* Footer / Branding */}
      <footer className="py-12 bg-slate-50 border-t border-slate-200 text-center">
        <p className="text-sm text-slate-500 flex items-center justify-center gap-2">
          Built with 
          <span className="font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            PortfolioPro
          </span>
        </p>
      </footer>
    </div>
  )
}

export default PublicViewer
