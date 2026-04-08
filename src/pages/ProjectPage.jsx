import { useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { Plus, Sparkles, Archive } from 'lucide-react'
import { useApp } from '../lib/AppContext'
import LogCard from '../components/LogCard'
import AddEntryForm from '../components/AddEntryForm'
import SummarizePanel from '../components/SummarizePanel'
import FinalizeModal from '../components/FinalizeModal'

export default function ProjectPage() {
  const { projectId } = useParams()
  const { projects, getProjectLogs, addLog, deleteLog } = useApp()
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState(new Set())
  const [showSummarize, setShowSummarize] = useState(false)
  const [showFinalize, setShowFinalize] = useState(false)

  const project = projects.find(p => p.id === projectId)
  if (!project) return <Navigate to="/" replace />

  const logs = getProjectLogs(projectId)

  function toggleSelect(id) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  function handleSave(data) {
    addLog(data)
    setShowForm(false)
  }

  const selectedLogs = logs.filter(l => selected.has(l.id))

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border-warm flex-shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: project.color }} />
            <h1 className="text-base font-medium text-cocoa-text">{project.name}</h1>
          </div>
          <p className="text-xs text-muted-taupe mt-0.5 ml-4">{logs.length} log{logs.length !== 1 ? 's' : ''}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowForm(s => !s)}
            className="btn-secondary flex items-center gap-1.5 text-xs py-1.5 px-3"
          >
            <Plus size={13} />
            Add entry
          </button>
          <button
            onClick={() => setShowFinalize(true)}
            className="btn-finalize flex items-center gap-1.5 text-xs py-1.5 px-3"
          >
            <Archive size={13} />
            Finalize project
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-3">
        {showForm && (
          <AddEntryForm
            projectId={projectId}
            onSave={handleSave}
            onCancel={() => setShowForm(false)}
          />
        )}

        {logs.length === 0 && !showForm && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-10 h-10 rounded-xl bg-sage-light flex items-center justify-center mb-3">
              <Sparkles size={18} className="text-sage-primary" />
            </div>
            <p className="text-sm text-cocoa-text font-medium mb-1">No logs yet</p>
            <p className="text-xs text-muted-taupe mb-4 max-w-xs leading-relaxed">
              Start logging your work — processes, obstacles, and learnings. The more you log, the better your KT and Performance Report will be.
            </p>
            <button onClick={() => setShowForm(true)} className="btn-primary text-xs py-1.5 px-4">
              Add first entry
            </button>
          </div>
        )}

        {logs.map(log => (
          <LogCard
            key={log.id}
            log={log}
            selected={selected.has(log.id)}
            onToggle={toggleSelect}
            onDelete={deleteLog}
          />
        ))}
      </div>

      {logs.length > 0 && (
        <div className="px-6 py-3 border-t border-border-warm flex items-center gap-3 flex-shrink-0">
          <p className="text-xs text-muted-taupe flex-1">
            {selected.size > 0
              ? `${selected.size} log${selected.size > 1 ? 's' : ''} selected`
              : 'Select logs to summarize'}
          </p>
          {selected.size > 0 && (
            <>
              <button
                onClick={() => setSelected(new Set())}
                className="text-xs text-muted-taupe hover:text-cocoa-text transition-colors"
              >
                Clear
              </button>
              <button
                onClick={() => setShowSummarize(true)}
                className="btn-primary flex items-center gap-1.5 text-xs py-1.5 px-3"
              >
                <Sparkles size={12} />
                Summarize
              </button>
            </>
          )}
        </div>
      )}

      {showSummarize && (
        <SummarizePanel
          logs={selectedLogs}
          projectId={project.id}
          projectName={project.name}
          onClose={() => setShowSummarize(false)}
        />
      )}

      {showFinalize && (
        <FinalizeModal
          project={project}
          logs={logs}
          onClose={() => setShowFinalize(false)}
        />
      )}
    </div>
  )
}
