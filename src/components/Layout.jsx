import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { Plus, BookOpen, Clock, Check, Pencil } from 'lucide-react'
import { useApp } from '../lib/AppContext'

function ProjectItem({ project, active, onNavigate }) {
  const { renameProject } = useApp()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(project.name)
  const inputRef = useRef()

  useEffect(() => { if (editing) inputRef.current?.focus() }, [editing])

  function commit() {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== project.name) renameProject(project.id, trimmed)
    else setDraft(project.name)
    setEditing(false)
  }

  return (
    <div className={`group flex items-center gap-2 px-3 py-2 rounded-lg transition-colors cursor-pointer
      ${active ? 'bg-card-bg text-cocoa-text font-medium shadow-sm' : 'text-muted-taupe hover:bg-card-bg hover:text-cocoa-text'}`}
      onClick={() => !editing && onNavigate()}
    >
      <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ backgroundColor: project.color }} />
      {editing ? (
        <input
          ref={inputRef}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setDraft(project.name); setEditing(false) } }}
          onClick={e => e.stopPropagation()}
          className="flex-1 text-sm bg-transparent outline-none border-b border-sage-primary text-cocoa-text"
        />
      ) : (
        <span className="flex-1 truncate text-sm">{project.name}</span>
      )}
      {!editing && (
        <button
          onClick={e => { e.stopPropagation(); setEditing(true) }}
          className="opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity p-0.5 text-muted-taupe"
        >
          <Pencil size={11} />
        </button>
      )}
    </div>
  )
}

export default function Layout({ children }) {
  const { projects, addProject } = useApp()
  const { projectId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')

  function handleAdd(e) {
    e.preventDefault()
    if (!newName.trim()) return
    const p = addProject(newName.trim())
    setNewName('')
    setAdding(false)
    navigate(`/project/${p.id}`)
  }

  const onHistory = location.pathname === '/history'

  return (
    <div className="flex h-screen overflow-hidden bg-app-bg">
      <aside className="w-56 flex-shrink-0 bg-sidebar-bg border-r border-border-warm flex flex-col">
        <div className="px-5 py-5 border-b border-border-warm">
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-sage-primary" />
            <span className="font-serif text-base text-cocoa-text">WorkLog</span>
          </div>
          <p className="text-xs text-muted-taupe mt-1">Your private work journal</p>
        </div>

        <button
          onClick={() => navigate('/history')}
          className={`flex items-center gap-2 mx-3 mt-3 px-3 py-2 rounded-lg text-sm transition-colors
            ${onHistory ? 'bg-card-bg text-cocoa-text font-medium shadow-sm' : 'text-muted-taupe hover:bg-card-bg hover:text-cocoa-text'}`}
        >
          <Clock size={14} />
          History
        </button>

        <div className="px-4 pt-4 pb-1">
          <p className="text-[10px] uppercase tracking-widest text-muted-taupe font-medium">Projects</p>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 pb-2 flex flex-col gap-0.5">
          {projects.map(p => (
            <ProjectItem
              key={p.id}
              project={p}
              active={p.id === projectId && !onHistory}
              onNavigate={() => navigate(`/project/${p.id}`)}
            />
          ))}

          {adding ? (
            <form onSubmit={handleAdd} className="mt-1 px-1">
              <input
                autoFocus
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === 'Escape' && setAdding(false)}
                placeholder="Project name..."
                className="w-full text-sm bg-card-bg border border-border-warm rounded-lg px-3 py-1.5 text-cocoa-text placeholder:text-muted-taupe outline-none"
              />
              <div className="flex gap-1.5 mt-1.5">
                <button type="submit" className="btn-primary py-1 px-3 text-xs">Create</button>
                <button type="button" onClick={() => setAdding(false)} className="btn-secondary py-1 px-3 text-xs">Cancel</button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setAdding(true)}
              className="flex items-center gap-2 px-3 py-2 text-xs text-muted-taupe hover:text-cocoa-text transition-colors mt-1"
            >
              <Plus size={13} />
              New project
            </button>
          )}
        </nav>

        <div className="px-4 py-3 border-t border-border-warm">
          <p className="text-xs text-muted-taupe">All logs are private to you</p>
        </div>
      </aside>

      <main className="flex-1 overflow-hidden flex flex-col min-w-0">
        {children}
      </main>
    </div>
  )
}
