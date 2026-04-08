import { createContext, useContext, useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'

const AppContext = createContext(null)
const IS_DEV = import.meta.env.DEV

// In dev: writes the given data back to public/data/<key>.json via the Vite plugin.
// In prod (Vercel): no-op — data is read-only from the committed JSON files.
async function persist(key, data) {
  if (!IS_DEV) return
  await fetch('/api/save-data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, data }),
  })
}

export function AppProvider({ children }) {
  const [projects, setProjects] = useState([])
  const [logs, setLogs] = useState([])
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/data/projects.json').then(r => r.json()),
      fetch('/data/logs.json').then(r => r.json()),
      fetch('/data/history.json').then(r => r.json()),
    ]).then(([p, l, h]) => {
      setProjects(p)
      setLogs(l)
      setHistory(h)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-app-bg">
        <span className="text-sm text-muted-taupe">Loading...</span>
      </div>
    )
  }

  function addProject(name) {
    const colors = ['#8DA68D', '#8D7BCC', '#D16D6D', '#C4956A', '#6DA0D1']
    const color = colors[projects.length % colors.length]
    const project = { id: uuidv4(), name, color, createdAt: new Date().toISOString() }
    const next = [...projects, project]
    setProjects(next)
    persist('projects', next)
    return project
  }

  function renameProject(id, name) {
    const next = projects.map(p => p.id === id ? { ...p, name } : p)
    setProjects(next)
    persist('projects', next)
  }

  function addLog({ projectId, tag, blocks }) {
    const log = {
      id: uuidv4(),
      projectId,
      tag,
      // Images are stored as inline base64 src — no IndexedDB needed
      blocks: blocks.map(b =>
        b.type === 'image'
          ? { type: 'image', id: b.id, src: b.src || '', caption: b.caption || '' }
          : b
      ),
      date: new Date().toISOString().split('T')[0],
    }
    const next = [log, ...logs]
    setLogs(next)
    persist('logs', next)
    return log
  }

  function deleteLog(id) {
    const next = logs.filter(l => l.id !== id)
    setLogs(next)
    persist('logs', next)
  }

  function getProjectLogs(projectId) {
    return logs.filter(l => l.projectId === projectId)
  }

  function saveHistory({ type, projectId, projectName, content, logIds }) {
    const entry = {
      id: uuidv4(), type, projectId, projectName,
      title: projectName, content,
      logIds: logIds || [],
      createdAt: new Date().toISOString(),
    }
    const next = [entry, ...history]
    setHistory(next)
    persist('history', next)
    return entry
  }

  function renameHistory(id, title) {
    const next = history.map(h => h.id === id ? { ...h, title } : h)
    setHistory(next)
    persist('history', next)
  }

  function deleteHistory(id) {
    const next = history.filter(h => h.id !== id)
    setHistory(next)
    persist('history', next)
  }

  return (
    <AppContext.Provider value={{
      projects, logs, history,
      readonly: !IS_DEV,
      addProject, renameProject,
      addLog, deleteLog, getProjectLogs,
      saveHistory, renameHistory, deleteHistory,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() { return useContext(AppContext) }
