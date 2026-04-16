import React from 'react'
import { motion } from 'framer-motion'
import { Mail, Github, Linkedin, ExternalLink, Globe, Phone } from 'lucide-react'

const DeveloperTemplate = ({ portfolio, isEditing = false, onUpdate = null }) => {
  const { theme, socials, branding, sections } = portfolio

  const fontStyles = {
    'Inter': 'font-sans',
    'Poppins': 'font-sans tracking-tight',
    'Roboto': 'font-sans',
    'Playfair Display': 'font-serif',
    'Monospace': 'font-mono'
  }

  const themeStyles = {
    light: 'bg-white text-slate-900',
    dark: 'bg-slate-900 text-white',
    blue: 'bg-blue-50 text-slate-900',
    purple: 'bg-purple-50 text-slate-900',
    neon: 'bg-black text-lime-400'
  }

  const formatUrl = (url) => {
    if (!url) return ''
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('mailto:') || url.startsWith('tel:')) {
      return url
    }
    return `https://${url}`
  }

  const handleInlineEdit = (sectionId, field, value) => {
    if (onUpdate) {
      onUpdate(sectionId, field, value)
    }
  }

  const renderSection = (section) => {
    const sectionMotion = {
      initial: { opacity: 0, y: 20 },
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: true },
      transition: { duration: 0.6 }
    }

    const editableProps = (field, placeholder, isContent = false) => ({
      contentEditable: isEditing,
      suppressContentEditableWarning: true,
      placeholder: placeholder,
      onBlur: (e) => {
        const value = e.target.innerText
        if (isContent) {
          handleInlineEdit(section.id, 'content', { [field]: value })
        } else {
          handleInlineEdit(section.id, 'title', value)
        }
      },
      className: isEditing ? 'hover:outline-dashed hover:outline-1 hover:outline-blue-400 focus:outline-blue-500 rounded px-1 transition-all' : ''
    })

    switch (section.type) {
      case 'hero':
        return (
          <motion.section 
            key={section.id} 
            {...sectionMotion}
            className="py-24 px-6 text-center relative overflow-hidden"
          >
            {branding?.bannerImage && (
              <div className="absolute inset-0 -z-10 opacity-10">
                <img src={branding.bannerImage} alt="banner" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="mb-8 flex justify-center">
              {branding?.profileImage ? (
                <img src={branding.profileImage} alt="profile" className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl" />
              ) : (
                <div className="w-32 h-32 rounded-full bg-slate-200 flex items-center justify-center border-4 border-white shadow-xl">
                  <span className="text-4xl">👋</span>
                </div>
              )}
            </div>
            <h1 
              {...editableProps('title', 'Your Title')}
              className={`text-6xl font-black mb-6 leading-tight ${editableProps('title', 'Your Title').className}`}
              style={{ color: theme.primaryColor }}
            >
              {section.title}
            </h1>
            <p 
              {...editableProps('subtitle', 'Your Subtitle', true)}
              className={`text-2xl max-w-2xl mx-auto mb-10 opacity-80 ${editableProps('subtitle', 'Your Subtitle', true).className}`}
            >
              {section.content?.subtitle}
            </p>
            <div className="flex justify-center gap-6">
              {socials?.github && (
                <a 
                  href={isEditing ? '#' : formatUrl(socials.github)} 
                  onClick={isEditing ? (e) => e.preventDefault() : undefined}
                  target="_blank" 
                  rel="noreferrer" 
                  className={`hover:scale-110 transition-transform ${isEditing ? 'cursor-default' : ''}`}
                >
                  <Github className="w-6 h-6" />
                </a>
              )}
              {socials?.linkedin && (
                <a 
                  href={isEditing ? '#' : formatUrl(socials.linkedin)} 
                  onClick={isEditing ? (e) => e.preventDefault() : undefined}
                  target="_blank" 
                  rel="noreferrer" 
                  className={`hover:scale-110 transition-transform ${isEditing ? 'cursor-default' : ''}`}
                >
                  <Linkedin className="w-6 h-6" />
                </a>
              )}
              {socials?.email && (
                <a 
                  href={isEditing ? '#' : `mailto:${socials.email}`} 
                  onClick={isEditing ? (e) => e.preventDefault() : undefined}
                  className={`hover:scale-110 transition-transform ${isEditing ? 'cursor-default' : ''}`}
                >
                  <Mail className="w-6 h-6" />
                </a>
              )}
              {socials?.website && (
                <a 
                  href={isEditing ? '#' : formatUrl(socials.website)} 
                  onClick={isEditing ? (e) => e.preventDefault() : undefined}
                  target="_blank" 
                  rel="noreferrer" 
                  className={`hover:scale-110 transition-transform ${isEditing ? 'cursor-default' : ''}`}
                >
                  <Globe className="w-6 h-6" />
                </a>
              )}
            </div>
          </motion.section>
        )
      case 'about':
        return (
          <motion.section key={section.id} {...sectionMotion} className="py-20 px-6 max-w-4xl mx-auto">
            <h2 
              {...editableProps('title', 'About Me')}
              className={`text-4xl font-bold mb-10 inline-block border-b-4 pb-2 ${editableProps('title', 'About Me').className}`}
              style={{ borderColor: theme.primaryColor }}
            >
              {section.title}
            </h2>
            <div 
              {...editableProps('text', 'Tell your story...', true)}
              className={`text-xl leading-relaxed opacity-90 ${editableProps('text', 'Tell your story...', true).className}`}
            >
              {section.content?.text}
            </div>
          </motion.section>
        )
      case 'projects':
        return (
          <motion.section key={section.id} {...sectionMotion} className="py-20 px-6 max-w-6xl mx-auto">
            <h2 
              {...editableProps('title', 'My Projects')}
              className={`text-4xl font-bold mb-16 text-center ${editableProps('title', 'My Projects').className}`}
            >
              {section.title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {(section.content?.projects || []).map((project, idx) => (
                <motion.div 
                  key={idx} 
                  whileHover={{ y: -10 }}
                  className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 transition-all flex flex-col h-full group"
                >
                  <div className="h-56 bg-slate-200 overflow-hidden">
                    {project.image ? (
                      <img src={project.image} alt={project.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <Code2 className="w-12 h-12" />
                      </div>
                    )}
                  </div>
                  <div className="p-8 flex-1 flex flex-col text-slate-900">
                    <h3 className="font-bold text-2xl mb-3">{project.title}</h3>
                    <p className="text-slate-600 mb-6 flex-1">{project.description}</p>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {(project.tech || []).map((t, i) => (
                        <span key={i} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold uppercase tracking-wider">{t}</span>
                      ))}
                    </div>
                    <div className="flex gap-4">
                      {project.link && (
                        <a 
                          href={isEditing ? '#' : formatUrl(project.link)} 
                          onClick={isEditing ? (e) => e.preventDefault() : undefined}
                          target="_blank" 
                          rel="noreferrer" 
                          className={`flex-1 py-3 bg-slate-900 text-white text-center rounded-xl font-bold text-sm hover:bg-black transition-colors flex items-center justify-center gap-2 ${isEditing ? 'cursor-default' : ''}`}
                        >
                          <ExternalLink className="w-4 h-4" /> Demo
                        </a>
                      )}
                      {project.github && (
                        <a 
                          href={isEditing ? '#' : formatUrl(project.github)} 
                          onClick={isEditing ? (e) => e.preventDefault() : undefined}
                          target="_blank" 
                          rel="noreferrer" 
                          className={`p-3 bg-slate-100 text-slate-900 rounded-xl hover:bg-slate-200 transition-colors ${isEditing ? 'cursor-default' : ''}`}
                        >
                          <Github className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )
      case 'skills':
        return (
          <motion.section key={section.id} {...sectionMotion} className="py-20 px-6 max-w-4xl mx-auto text-center">
            <h2 
              {...editableProps('title', 'My Skills')}
              className={`text-4xl font-bold mb-12 ${editableProps('title', 'My Skills').className}`}
            >
              {section.title}
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              {(section.content?.skills || []).map((skill, idx) => (
                <div key={idx} className="group relative">
                  <div className="px-6 py-3 bg-white shadow-lg rounded-2xl font-bold text-slate-900 border border-slate-100 hover:border-slate-300 transition-all flex flex-col items-center">
                    {skill.name}
                    {skill.level && (
                      <div className="mt-2 w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${skill.level}%`, backgroundColor: theme.primaryColor }} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        )
      default:
        return null
    }
  }

  return (
    <div className={`min-h-full transition-all duration-500 ${themeStyles[theme.name || 'blue']} ${fontStyles[theme.fontFamily || 'Inter']}`}>
      <div className="max-w-screen-xl mx-auto">
        {sections.sort((a, b) => a.order - b.order).map(renderSection)}
      </div>
    </div>
  )
}

const Code2 = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
  </svg>
)

export default DeveloperTemplate
