import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LogOut, User, Layout, Shield } from 'lucide-react'

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="glass sticky top-0 z-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                PortfolioPro
              </span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/dashboard" className="text-slate-600 hover:text-blue-600 flex items-center px-3 py-2 rounded-md text-sm font-medium">
                  <Layout className="w-4 h-4 mr-2" />
                  Dashboard
                </Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="text-slate-600 hover:text-blue-600 flex items-center px-3 py-2 rounded-md text-sm font-medium">
                    <Shield className="w-4 h-4 mr-2" />
                    Admin
                  </Link>
                )}
                <div className="flex items-center px-3 py-2 text-sm font-medium text-slate-700">
                  <User className="w-4 h-4 mr-2" />
                  {user.name}
                </div>
                <button
                  onClick={logout}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-slate-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  Login
                </Link>
                <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm transition-all">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
