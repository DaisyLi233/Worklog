import { createContext, useContext, useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { saveImage, deleteImages } from './imageDB'

const AppContext = createContext(null)

// Bump this version whenever the data shape changes — clears stale localStorage
const DATA_VERSION = '2'

const INITIAL_PROJECTS = [
  { id: '1', name: 'IBM Internship S25', color: '#8DA68D', createdAt: '2025-03-01' },
  { id: '2', name: 'Side project', color: '#8D7BCC', createdAt: '2025-02-01' },
]

const INITIAL_LOGS = [
  { id: uuidv4(), projectId: '1', tag: 'process', date: '2025-04-07', blocks: [{ type: 'text', content: 'Set up the CI/CD pipeline on IBM Cloud. Go to Toolchains > Create > Custom, then link the GitHub repo. Set deploy stage to trigger on main branch push only.' }] },
  { id: uuidv4(), projectId: '1', tag: 'obstacle', date: '2025-04-07', blocks: [{ type: 'text', content: 'Build kept failing due to missing env vars. IBM Cloud does not inherit .env automatically — add each var manually under Environment Properties in the deploy stage.' }] },
  { id: uuidv4(), projectId: '1', tag: 'retro', date: '2025-04-08', blocks: [{ type: 'text', content: 'First week done! Feeling more confident navigating IBM internal tools. Biggest growth: asking for help earlier instead of spending hours stuck.' }] },
  { id: uuidv4(), projectId: '1', tag: 'process', date: '2025-04-09', blocks: [{ type: 'text', content: 'Learned how to use Carbon design system. Components live in @carbon/react. Use <Button kind="primary"> for main CTAs. Storybook is at /storybook locally.' }] },
  { id: uuidv4(), projectId: '1', tag: 'retro', date: '2025-04-10', blocks: [{ type: 'text', content: 'Got positive feedback from manager on the onboarding flow PR. First feature I owned end to end. Achievement unlocked.' }] },
]

function load(key, fallback) {
  try {
    // If data version doesn't match, wipe and return fallback
    const version = localStorage.getItem('wl_version')
    if (version !== DATA_VERSION) {
      localStorage.clear()
      localStorage.setItem('wl_version', DATA_VERSION)
      return fallback
    }
    const s = localStorage.getItem(key)
    return s ? JSON.parse(s) : fallback
  } catch {
    return fallback
  }
}

export function AppProvider({ children }) {
  const [projects, setProjects] = useState(() => load('wl_projects', INITIAL_PROJECTS))
  const [logs, setLogs] = useState(() => load('wl_logs', INITIAL_LOGS))
  const [history, setHistory] = useState(() => load('wl_history', []))

  useEffect(() => { localStorage.setItem('wl_projects', JSON.stringify(projects)) }, [projects])
  useEffect(() => { localStorage.setItem('wl_logs', JSON.stringify(logs)) }, [logs])
  useEffect(() => { localStorage.setItem('wl_history', JSON.stringify(history)) }, [history])

  function addProject(name) {
    const colors = ['#8DA68D', '#8D7BCC', '#D16D6D', '#C4956A', '#6DA0D1']
    const color = colors[projects.length % colors.length]
    const project = { id: uuidv4(), name, color, createdAt: new Date().toISOString() }
    setProjects(prev => [...prev, project])
    return project
  }

  function renameProject(id, name) {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, name } : p))
  }

  async function addLog({ projectId, tag, blocks }) {
    const cleanBlocks = []
    for (const block of blocks) {
      if (block.type === 'image' && block.src) {
        await saveImage(block.id, block.src)
        cleanBlocks.push({ type: 'image', id: block.id, caption: block.caption || '' })
      } else {
        cleanBlocks.push(block)
      }
    }
    const log = {
      id: uuidv4(),
      projectId,
      tag,
      blocks: cleanBlocks,
      date: new Date().toISOString().split('T')[0],
    }
    setLogs(prev => [log, ...prev])
    return log
  }

  function deleteLog(id) {
    setLogs(prev => {
      const log = prev.find(l => l.id === id)
      if (log) {
        const imageIds = (log.blocks || []).filter(b => b.type === 'image').map(b => b.id)
        if (imageIds.length) deleteImages(imageIds)
      }
      return prev.filter(l => l.id !== id)
    })
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
    setHistory(prev => [entry, ...prev])
    return entry
  }

  function renameHistory(id, title) {
    setHistory(prev => prev.map(h => h.id === id ? { ...h, title } : h))
  }

  function deleteHistory(id) {
    setHistory(prev => prev.filter(h => h.id !== id))
  }

  return (
    <AppContext.Provider value={{
      projects, logs, history,
      addProject, renameProject,
      addLog, deleteLog, getProjectLogs,
      saveHistory, renameHistory, deleteHistory,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() { return useContext(AppContext) }
