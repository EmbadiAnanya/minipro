import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Save, 
  Send, 
  Plus, 
  Trash2, 
  GripVertical, 
  Settings, 
  Palette, 
  Eye, 
  Layout, 
  Type, 
  Briefcase, 
  Code2, 
  ChevronRight,
  Monitor,
  Smartphone,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Download,
  Github,
  Linkedin,
  Mail,
  Globe,
  Upload
} from 'lucide-react'
import DeveloperTemplate from '../templates/DeveloperTemplate'

const Builder = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [portfolio, setPortfolio] = useState({
    template: 'developer',
    theme: { name: 'blue', primaryColor: '#3b82f6', fontFamily: 'Inter', darkMode: false },
    branding: { profileImage: '', bannerImage: '', tagline: '' },
    socials: { github: '', linkedin: '', email: '', phone: '', website: '' },
    sections: [
      { id: '1', type: 'hero', title: "I'm a Full Stack Developer", content: { subtitle: "Building scalable web applications." }, order: 0 },
      { id: '2', type: 'about', title: 'About Me', content: { text: "I'm a passionate developer with experience in React and Node.js." }, order: 1 },
      { id: '3', type: 'projects', title: 'My Work', content: { projects: [] }, order: 2 },
      { id: '4', type: 'skills', title: 'My Skills', content: { skills: [] }, order: 3 }
    ],
    status: 'draft',
    publicUrl: ''
  })
  
  const [activeTab, setActiveTab] = useState('sections') // 'sections', 'design', 'socials', 'branding'
  const [activeSectionId, setActiveSectionId] = useState(null)
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [previewDevice, setPreviewDevice] = useState('desktop')
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [saveStatus, setSaveStatus] = useState(null) // 'success', 'error', null
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } }
        const { data } = await axios.get('/api/portfolios/my', config)
        if (data && data.length > 0) {
          // Use the first portfolio for now in the builder
          const activePortfolio = data[0]
          const sectionsWithIds = activePortfolio.sections.map(s => ({ ...s, id: s._id || Math.random().toString(36).substr(2, 9) }))
          
          // Ensure all required fields exist to prevent crashes
          setPortfolio({ 
            ...activePortfolio, 
            sections: sectionsWithIds,
            socials: activePortfolio.socials || { github: '', linkedin: '', email: '', phone: '', website: '' },
            branding: activePortfolio.branding || { profileImage: '', bannerImage: '', tagline: '' },
            theme: activePortfolio.theme || { name: 'blue', primaryColor: '#3b82f6', fontFamily: 'Inter', darkMode: false }
          })
        }
      } catch (err) {
        console.log('No portfolio found, using default')
      }
    }
    fetchPortfolio()
  }, [user.token])

  const handleImageUpload = async (file, type, projectIdx = null) => {
    if (!file) return
    
    // Check file type and size
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('File size should be less than 2MB')
      return
    }

    // Instant Preview (Local)
    const previewUrl = URL.createObjectURL(file)
    if (type === 'profileImage') {
      setPortfolio(prev => ({ ...prev, branding: { ...prev.branding, profileImage: previewUrl } }))
    } else if (type === 'bannerImage') {
      setPortfolio(prev => ({ ...prev, branding: { ...prev.branding, bannerImage: previewUrl } }))
    } else if (type === 'projectImage' && projectIdx !== null) {
      const newSections = [...portfolio.sections]
      const section = newSections.find(s => s.id === activeSectionId)
      if (section && section.content.projects[projectIdx]) {
        section.content.projects[projectIdx].image = previewUrl
        setPortfolio(prev => ({ ...prev, sections: newSections }))
      }
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('image', file)

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user.token}`
        }
      }

      const { data } = await axios.post('/api/upload', formData, config)
      const cloudinaryUrl = data.url

      // Update state with Cloudinary URL
      if (type === 'profileImage') {
        setPortfolio(prev => ({ ...prev, branding: { ...prev.branding, profileImage: cloudinaryUrl } }))
      } else if (type === 'bannerImage') {
        setPortfolio(prev => ({ ...prev, branding: { ...prev.branding, bannerImage: cloudinaryUrl } }))
      } else if (type === 'projectImage' && projectIdx !== null) {
        setPortfolio(prev => ({
          ...prev,
          sections: prev.sections.map(s => {
            if (s.id === activeSectionId) {
              const updatedProjects = [...s.content.projects]
              updatedProjects[projectIdx].image = cloudinaryUrl
              return { ...s, content: { ...s.content, projects: updatedProjects } }
            }
            return s
          })
        }))
      }
      
      setSaveStatus('success')
      setTimeout(() => setSaveStatus(null), 3000)
    } catch (err) {
      console.error('Upload error:', err)
      setSaveStatus('error')
      setErrorMessage(err.response?.data?.message || 'Failed to upload image')
    } finally {
      setIsUploading(false)
      URL.revokeObjectURL(previewUrl) // Clean up memory
    }
  }

  const handleSave = async (status = 'draft') => {
    if (!portfolio.publicUrl) {
      alert("Please enter a public username");
      return;
    }
    setIsSaving(true)
    setSaveStatus(null)
    setErrorMessage('')
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } }
      const payload = { ...portfolio, status }
      // Remove local IDs before sending to backend if backend uses Mongoose _ids
      const cleanedSections = payload.sections.map(({ id, ...rest }) => rest)
      const { data } = await axios.post('/api/portfolios', { ...payload, sections: cleanedSections }, config)
      setPortfolio({ ...data, sections: data.sections.map(s => ({ ...s, id: s._id })) })
      setSaveStatus('success')
      setTimeout(() => setSaveStatus(null), 3000)
      if (status === 'pending') navigate('/dashboard')
    } catch (err) {
      console.error(err)
      setSaveStatus('error')
      setErrorMessage(err.response?.data?.message || 'Failed to save portfolio')
    } finally {
      setIsSaving(false)
    }
  }

  const updateSection = (id, newContent) => {
    setPortfolio(prev => ({
      ...prev,
      sections: prev.sections.map(s => s.id === id ? { ...s, content: { ...s.content, ...newContent } } : s)
    }))
  }

  const updateSectionTitle = (id, newTitle) => {
    setPortfolio(prev => ({
      ...prev,
      sections: prev.sections.map(s => s.id === id ? { ...s, title: newTitle } : s)
    }))
  }

  const addSection = (type) => {
    const newSection = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      title: type.charAt(0).toUpperCase() + type.slice(1),
      content: type === 'projects' ? { projects: [] } : type === 'skills' ? { skills: [] } : {},
      order: portfolio.sections.length
    }
    setPortfolio(prev => ({ ...prev, sections: [...prev.sections, newSection] }))
    setActiveSectionId(newSection.id)
  }

  const removeSection = (id) => {
    setPortfolio(prev => ({
      ...prev,
      sections: prev.sections.filter(s => s.id !== id).map((s, idx) => ({ ...s, order: idx }))
    }))
    if (activeSectionId === id) setActiveSectionId(null)
  }

  const toggleDarkMode = () => {
    setPortfolio(prev => ({
      ...prev,
      theme: { ...prev.theme, darkMode: !prev.theme.darkMode }
    }))
  }

  const handleInlineUpdate = (sectionId, field, value) => {
    setPortfolio(prev => ({
      ...prev,
      sections: prev.sections.map(s => {
        if (s.id === sectionId || s._id === sectionId) {
          if (field === 'title') {
            return { ...s, title: value }
          }
          if (field === 'content') {
            return { ...s, content: { ...s.content, ...value } }
          }
        }
        return s
      })
    }))
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-slate-100 overflow-hidden">
      {/* Left Sidebar: Controls */}
      <div className="w-80 bg-white border-r border-slate-200 flex flex-col shadow-lg z-20">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Layout className="w-5 h-5 text-blue-600" />
            Portfolio Editor
          </h2>
          <div className="mt-4 flex bg-slate-100 p-1 rounded-xl overflow-x-auto no-scrollbar">
            <button 
              onClick={() => setActiveTab('sections')}
              className={`flex-1 min-w-[70px] py-2 text-[10px] font-bold rounded-lg transition-all ${activeTab === 'sections' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Sections
            </button>
            <button 
              onClick={() => setActiveTab('design')}
              className={`flex-1 min-w-[70px] py-2 text-[10px] font-bold rounded-lg transition-all ${activeTab === 'design' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Design
            </button>
            <button 
              onClick={() => setActiveTab('socials')}
              className={`flex-1 min-w-[70px] py-2 text-[10px] font-bold rounded-lg transition-all ${activeTab === 'socials' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Socials
            </button>
            <button 
              onClick={() => setActiveTab('branding')}
              className={`flex-1 min-w-[70px] py-2 text-[10px] font-bold rounded-lg transition-all ${activeTab === 'branding' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Branding
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {activeTab === 'sections' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Your Sections</span>
                <button onClick={() => addSection('projects')} className="text-blue-600 hover:bg-blue-50 p-1 rounded-md transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              
              <AnimatePresence>
                {portfolio.sections.sort((a, b) => a.order - b.order).map((section) => (
                  <motion.div 
                    key={section.id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className={`group border rounded-xl p-3 transition-all cursor-pointer ${activeSectionId === section.id ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-slate-100 hover:border-slate-300 bg-white'}`}
                    onClick={() => setActiveSectionId(section.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <GripVertical className="w-4 h-4 text-slate-300 cursor-grab" />
                        <span className="text-sm font-semibold text-slate-700 truncate max-w-[120px]">{section.title}</span>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => { e.stopPropagation(); removeSection(section.id); }}
                          className="p-1 text-slate-400 hover:text-red-500 rounded-md"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {activeSectionId && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-200"
                >
                  <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Settings className="w-4 h-4 text-blue-600" />
                    Edit {portfolio.sections.find(s => s.id === activeSectionId)?.type}
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">Section Title</label>
                      <input 
                        type="text"
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        value={portfolio.sections.find(s => s.id === activeSectionId)?.title || ''}
                        onChange={(e) => updateSectionTitle(activeSectionId, e.target.value)}
                      />
                    </div>
                    {/* Dynamic Inputs based on type */}
                    {portfolio.sections.find(s => s.id === activeSectionId)?.type === 'hero' && (
                      <div>
                        <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">Subtitle</label>
                        <input 
                          type="text"
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          value={portfolio.sections.find(s => s.id === activeSectionId)?.content?.subtitle || ''}
                          onChange={(e) => updateSection(activeSectionId, { subtitle: e.target.value })}
                        />
                      </div>
                    )}
                    {portfolio.sections.find(s => s.id === activeSectionId)?.type === 'about' && (
                      <div>
                        <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">About Text</label>
                        <textarea 
                          rows="4"
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                          value={portfolio.sections.find(s => s.id === activeSectionId)?.content?.text || ''}
                          onChange={(e) => updateSection(activeSectionId, { text: e.target.value })}
                        />
                      </div>
                    )}
                    {portfolio.sections.find(s => s.id === activeSectionId)?.type === 'skills' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-bold uppercase text-slate-400">Skills List</label>
                          <button 
                            onClick={() => {
                              const currentSkills = portfolio.sections.find(s => s.id === activeSectionId)?.content?.skills || [];
                              updateSection(activeSectionId, { skills: [...currentSkills, { name: 'New Skill', level: 80 }] });
                            }}
                            className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded"
                          >
                            + Add Skill
                          </button>
                        </div>
                        {(portfolio.sections.find(s => s.id === activeSectionId)?.content?.skills || []).map((skill, idx) => (
                          <div key={idx} className="bg-white p-3 rounded-xl border border-slate-100 space-y-2">
                            <div className="flex gap-2">
                              <input 
                                type="text"
                                className="flex-1 bg-slate-50 border-none rounded-lg px-2 py-1 text-xs"
                                value={skill.name}
                                onChange={(e) => {
                                  const newSkills = [...(portfolio.sections.find(s => s.id === activeSectionId)?.content?.skills || [])];
                                  newSkills[idx].name = e.target.value;
                                  updateSection(activeSectionId, { skills: newSkills });
                                }}
                              />
                              <button 
                                onClick={() => {
                                  const newSkills = (portfolio.sections.find(s => s.id === activeSectionId)?.content?.skills || []).filter((_, i) => i !== idx);
                                  updateSection(activeSectionId, { skills: newSkills });
                                }}
                                className="text-red-400 hover:text-red-600"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                            <input 
                              type="range"
                              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                              value={skill.level || 0}
                              onChange={(e) => {
                                const newSkills = [...(portfolio.sections.find(s => s.id === activeSectionId)?.content?.skills || [])];
                                newSkills[idx].level = parseInt(e.target.value);
                                updateSection(activeSectionId, { skills: newSkills });
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                    {portfolio.sections.find(s => s.id === activeSectionId)?.type === 'projects' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-bold uppercase text-slate-400">Projects List</label>
                          <button 
                            onClick={() => {
                              const currentProjects = portfolio.sections.find(s => s.id === activeSectionId)?.content?.projects || [];
                              updateSection(activeSectionId, { projects: [...currentProjects, { title: 'New Project', description: '', tech: [], link: '', github: '', image: '' }] });
                            }}
                            className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded"
                          >
                            + Add Project
                          </button>
                        </div>
                        {(portfolio.sections.find(s => s.id === activeSectionId)?.content?.projects || []).map((project, idx) => (
                          <div key={idx} className="bg-white p-4 rounded-xl border border-slate-100 space-y-3">
                            <div className="flex justify-between items-center">
                              <input 
                                type="text"
                                className="font-bold text-sm bg-transparent border-none p-0 focus:ring-0 w-full"
                                value={project.title}
                                onChange={(e) => {
                                  const newProjects = [...(portfolio.sections.find(s => s.id === activeSectionId)?.content?.projects || [])];
                                  newProjects[idx].title = e.target.value;
                                  updateSection(activeSectionId, { projects: newProjects });
                                }}
                              />
                              <button 
                                onClick={() => {
                                  const newProjects = (portfolio.sections.find(s => s.id === activeSectionId)?.content?.projects || []).filter((_, i) => i !== idx);
                                  updateSection(activeSectionId, { projects: newProjects });
                                }}
                                className="text-red-400 hover:text-red-600 ml-2"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            <textarea 
                              placeholder="Project description"
                              className="w-full bg-slate-50 border-none rounded-lg p-2 text-xs resize-none"
                              rows="2"
                              value={project.description}
                              onChange={(e) => {
                                const newProjects = [...(portfolio.sections.find(s => s.id === activeSectionId)?.content?.projects || [])];
                                newProjects[idx].description = e.target.value;
                                updateSection(activeSectionId, { projects: newProjects });
                              }}
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <input 
                                type="text"
                                placeholder="Live Link"
                                className="bg-slate-50 border-none rounded-lg p-2 text-[10px]"
                                value={project.link}
                                onChange={(e) => {
                                  const newProjects = [...(portfolio.sections.find(s => s.id === activeSectionId)?.content?.projects || [])];
                                  newProjects[idx].link = e.target.value;
                                  updateSection(activeSectionId, { projects: newProjects });
                                }}
                              />
                              <input 
                                type="text"
                                placeholder="GitHub Link"
                                className="bg-slate-50 border-none rounded-lg p-2 text-[10px]"
                                value={project.github}
                                onChange={(e) => {
                                  const newProjects = [...(portfolio.sections.find(s => s.id === activeSectionId)?.content?.projects || [])];
                                  newProjects[idx].github = e.target.value;
                                  updateSection(activeSectionId, { projects: newProjects });
                                }}
                              />
                            </div>
                            <div className="space-y-2">
                              <div className="w-full h-24 rounded-lg bg-slate-50 border border-dashed border-slate-200 overflow-hidden relative group">
                                {project.image ? (
                                  <>
                                    <img src={project.image} alt="project preview" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                      <Upload className="w-4 h-4 text-white" />
                                    </div>
                                  </>
                                ) : (
                                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-1">
                                    <Upload className="w-4 h-4" />
                                    <span className="text-[8px] font-bold uppercase">Upload Project Image</span>
                                  </div>
                                )}
                                <input 
                                  type="file" 
                                  className="absolute inset-0 opacity-0 cursor-pointer"
                                  accept="image/*"
                                  onChange={(e) => handleImageUpload(e.target.files[0], 'projectImage', idx)}
                                />
                              </div>
                              <input 
                                type="text"
                                placeholder="Or paste image URL"
                                className="w-full bg-slate-50 border-none rounded-lg p-2 text-[10px]"
                                value={project.image}
                                onChange={(e) => {
                                  const newProjects = [...(portfolio.sections.find(s => s.id === activeSectionId)?.content?.projects || [])];
                                  newProjects[idx].image = e.target.value;
                                  updateSection(activeSectionId, { projects: newProjects });
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {activeTab === 'design' && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 block">Color Palette</span>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'blue', label: 'Classic Blue', color: '#3b82f6' },
                    { id: 'purple', label: 'Royal Purple', color: '#8b5cf6' },
                    { id: 'neon', label: 'Modern Neon', color: '#a3e635' },
                    { id: 'light', label: 'Clean Light', color: '#0f172a' },
                    { id: 'dark', label: 'Deep Dark', color: '#f8fafc' }
                  ].map(t => (
                    <button 
                      key={t.id}
                      onClick={() => setPortfolio(prev => ({ ...prev, theme: { ...prev.theme, name: t.id, primaryColor: t.color } }))}
                      className={`p-3 rounded-xl border-2 transition-all text-left ${portfolio.theme.name === t.id ? 'border-blue-500 bg-blue-50' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                    >
                      <div className="w-6 h-6 rounded-full mb-2" style={{ backgroundColor: t.color }} />
                      <div className="text-[10px] font-bold uppercase">{t.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 block">Typography</span>
                <div className="space-y-2">
                  {['Inter', 'Poppins', 'Roboto', 'Playfair Display', 'Monospace'].map(f => (
                    <button 
                      key={f}
                      onClick={() => setPortfolio(prev => ({ ...prev, theme: { ...prev.theme, fontFamily: f } }))}
                      className={`w-full p-3 rounded-xl border-2 transition-all text-left flex items-center justify-between ${portfolio.theme.fontFamily === f ? 'border-blue-500 bg-blue-50' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                    >
                      <span style={{ fontFamily: f }} className="text-sm">{f}</span>
                      {portfolio.theme.fontFamily === f && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'socials' && (
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">Connect Accounts</span>
              {[
                { id: 'github', icon: <Github className="w-4 h-4" />, label: 'GitHub URL' },
                { id: 'linkedin', icon: <Linkedin className="w-4 h-4" />, label: 'LinkedIn URL' },
                { id: 'email', icon: <Mail className="w-4 h-4" />, label: 'Email Address' },
                { id: 'website', icon: <Globe className="w-4 h-4" />, label: 'Personal Website' }
              ].map(s => (
                <div key={s.id}>
                  <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 flex items-center gap-2">
                    {s.icon} {s.label}
                  </label>
                  <input 
                    type="text"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={portfolio.socials?.[s.id] || ''}
                    onChange={(e) => setPortfolio(prev => ({ 
                      ...prev, 
                      socials: { ...(prev.socials || {}), [s.id]: e.target.value } 
                    }))}
                    placeholder={`https://${s.id}.com/username`}
                  />
                </div>
              ))}
            </div>
          )}

          {activeTab === 'branding' && (
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">Visual Branding</span>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">Profile Image</label>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-slate-100 border-2 border-slate-200 overflow-hidden flex items-center justify-center relative group">
                      {portfolio.branding?.profileImage ? (
                        <>
                          <img src={portfolio.branding.profileImage} alt="preview" className="w-full h-full object-cover" />
                          {isUploading && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /></div>}
                        </>
                      ) : (
                        <span className="text-2xl text-slate-300">👤</span>
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <label className="block">
                        <span className="sr-only">Choose profile photo</span>
                        <input 
                          type="file" 
                          className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e.target.files[0], 'profileImage')}
                        />
                      </label>
                      <input 
                        type="text"
                        className="w-full bg-white border border-slate-100 rounded-lg px-3 py-1.5 text-[10px] focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        value={portfolio.branding?.profileImage || ''}
                        onChange={(e) => setPortfolio(prev => ({ 
                          ...prev, 
                          branding: { ...(prev.branding || {}), profileImage: e.target.value } 
                        }))}
                        placeholder="Or paste URL here"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">Banner/Cover Image</label>
                <div className="space-y-3">
                  <div className="w-full h-24 rounded-xl bg-slate-100 border-2 border-slate-200 overflow-hidden relative group">
                    {portfolio.branding?.bannerImage ? (
                      <>
                        <img src={portfolio.branding.bannerImage} alt="banner preview" className="w-full h-full object-cover" />
                        {isUploading && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" /></div>}
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-1">
                        <Upload className="w-6 h-6" />
                        <span className="text-[10px] font-bold uppercase">Upload Banner</span>
                      </div>
                    )}
                    <input 
                      type="file" 
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e.target.files[0], 'bannerImage')}
                    />
                  </div>
                  <input 
                    type="text"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={portfolio.branding?.bannerImage || ''}
                    onChange={(e) => setPortfolio(prev => ({ 
                      ...prev, 
                      branding: { ...(prev.branding || {}), bannerImage: e.target.value } 
                    }))}
                    placeholder="Or paste banner image URL"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50/50">
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => handleSave('draft')}
              disabled={isSaving}
              className="w-full py-3 px-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition-all disabled:opacity-50"
            >
              {isSaving ? <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
              Save Draft
            </button>
            <button 
              onClick={() => window.print()}
              className="w-full py-3 px-4 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-200 transition-all"
            >
              <Download className="w-4 h-4" />
              Export PDF
            </button>
            <button 
              onClick={() => handleSave('pending')}
              disabled={isSaving}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              Submit for Review
            </button>
          </div>
        </div>
      </div>

      {/* Main Content: Preview */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Toolbar */}
        <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-10">
          <div className="flex items-center gap-6">
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button 
                onClick={() => setPreviewDevice('desktop')}
                className={`p-1.5 rounded-md transition-all ${previewDevice === 'desktop' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setPreviewDevice('mobile')}
                className={`p-1.5 rounded-md transition-all ${previewDevice === 'mobile' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>
            <div className="h-4 w-px bg-slate-200" />
            <div className="text-sm font-medium text-slate-500 flex items-center gap-2">
              Status: 
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                portfolio.status === 'approved' ? 'bg-green-100 text-green-700' : 
                portfolio.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                'bg-slate-100 text-slate-600'
              }`}>
                {portfolio.status}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mr-4 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
              <span className="text-slate-400">/p/</span>
              <input 
                type="text"
                placeholder="ananya"
                className="bg-transparent border-none focus:ring-0 w-24 text-slate-900 p-0"
                value={portfolio.publicUrl || ""}
                onChange={(e) => {
                  const value = e.target.value.replace(/\s+/g, "").toLowerCase();
                  setPortfolio(prev => ({ ...prev, publicUrl: value }));
                }}
              />
              <span className="text-slate-300">.portfoliopro.com</span>
            </div>
            {saveStatus === 'success' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center text-green-600 gap-1 text-sm font-bold">
                <CheckCircle2 className="w-4 h-4" />
                Saved
              </motion.div>
            )}
            {saveStatus === 'error' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center text-red-600 gap-1 text-sm font-bold">
                <XCircle className="w-4 h-4" />
                {errorMessage || 'Error'}
              </motion.div>
            )}
          </div>
        </div>

        {/* Live Preview Engine */}
        <div className="flex-1 p-8 bg-slate-200 overflow-y-auto custom-scrollbar flex justify-center">
          <motion.div 
            layout
            className={`bg-white shadow-2xl transition-all duration-500 overflow-hidden ${previewDevice === 'mobile' ? 'w-[375px] rounded-[3rem] border-[8px] border-slate-900' : 'w-full rounded-xl'}`}
            style={{ height: previewDevice === 'mobile' ? '667px' : 'fit-content', minHeight: '100%' }}
          >
            {portfolio.template === 'developer' && (
              <DeveloperTemplate 
                portfolio={portfolio} 
                isEditing={true} 
                onUpdate={handleInlineUpdate}
              />
            )}
          </motion.div>
        </div>

        {/* Floating Help */}
        <div className="absolute bottom-8 right-8">
          <button className="w-12 h-12 bg-white shadow-xl rounded-full flex items-center justify-center text-slate-600 hover:text-blue-600 transition-all hover:scale-110 border border-slate-100">
            <AlertTriangle className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default Builder
