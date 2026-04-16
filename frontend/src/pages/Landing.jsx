import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Rocket, Palette, ShieldCheck, Zap } from 'lucide-react'

const Landing = () => {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-32 sm:pt-32 sm:pb-40">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 blur-3xl opacity-20 pointer-events-none">
          <div className="aspect-[1155/678] w-[72rem] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc]" />
        </div>
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 sm:text-7xl mb-6">
              Your Professional Portfolio, <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Perfected and Published.
              </span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-600 max-w-2xl mx-auto">
              Build a stunning personal showcase in minutes. Customize, moderate, and launch your brand with ease. The ultimate platform for developers, designers, and creators.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                to="/register"
                className="rounded-xl bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-lg hover:bg-blue-700 transition-all hover:scale-105"
              >
                Start Building Free
              </Link>
              <Link to="/login" className="text-lg font-semibold leading-6 text-slate-900 hover:text-blue-600 flex items-center">
                Sign In <span className="ml-2">→</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard 
              icon={<Palette className="w-8 h-8 text-blue-600" />}
              title="Modern Builder"
              description="Live preview engine with drag-and-drop section arrangement."
            />
            <FeatureCard 
              icon={<Rocket className="w-8 h-8 text-indigo-600" />}
              title="One-Click Publish"
              description="Get a unique shareable URL once your portfolio is approved."
            />
            <FeatureCard 
              icon={<ShieldCheck className="w-8 h-8 text-green-600" />}
              title="Secure Moderation"
              description="Robust admin workflow ensures high-quality public portfolios."
            />
            <FeatureCard 
              icon={<Zap className="w-8 h-8 text-yellow-600" />}
              title="Dynamic Templates"
              description="Switch between developer, designer, and student layouts."
            />
          </div>
        </div>
      </section>
    </div>
  )
}

const FeatureCard = ({ icon, title, description }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100"
  >
    <div className="mb-4">{icon}</div>
    <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
    <p className="text-slate-600 leading-relaxed">{description}</p>
  </motion.div>
)

export default Landing
