import { useState } from 'react'
import { X, Copy, Check } from 'lucide-react'
import { TAGS } from '../lib/helpers'
import { callClaude, buildMessages } from '../lib/api'
import { useApp } from '../lib/AppContext'

const SYSTEM = `You are summarizing a developer's work log entries. Some entries include screenshots — describe what you see in them if it's relevant.

Generate a clean, structured summary with exactly these three sections (markdown headers):

## What I worked on
Concise bullet points of key tasks and deliverables.

## Obstacles & how I solved them
Blockers encountered and how they were resolved. Reference screenshots where relevant. If none, write "No major blockers this period."

## Learnings & growth
Skills, insights, personal growth. If none, write "No explicit reflections this period."

Be specific. Use the person's own words where possible. Reference any screenshots you see.`

export default function SummarizePanel({ logs, projectId, projectName, onClose }) {
  const { saveHistory } = useApp()
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  async function generate() {
    setLoading(true)
    setError('')
    setSummary('')
    try {
      const logEntries = logs.map(l => ({ label: TAGS[l.tag].label, date: l.date, blocks: l.blocks, content: l.content }))
      const messages = await buildMessages(SYSTEM, logEntries, true)
      const text = await callClaude(messages, 1200)
      setSummary(text)
      saveHistory({ type: 'summary', projectId, projectName, content: text, logIds: logs.map(l => l.id) })
    } catch (e) {
      setError(e.message || 'Failed to generate. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function copy() {
    navigator.clipboard.writeText(summary)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function renderMarkdown(text) {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('## ')) return <h3 key={i} className="text-sm font-medium text-cocoa-text mt-4 mb-1.5 first:mt-0">{line.slice(3)}</h3>
      if (line.startsWith('- ')) return <li key={i} className="text-sm text-cocoa-text leading-relaxed ml-3 list-disc">{line.slice(2)}</li>
      if (line.trim() === '') return null
      return <p key={i} className="text-sm text-cocoa-text leading-relaxed">{line}</p>
    })
  }

  return (
    <div className="fixed inset-0 bg-cocoa-text/20 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-card-bg rounded-2xl border border-border-warm w-full max-w-lg max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-warm">
          <div>
            <h2 className="text-sm font-medium text-cocoa-text">Summary</h2>
            <p className="text-xs text-muted-taupe mt-0.5">{logs.length} log{logs.length > 1 ? 's' : ''} selected</p>
          </div>
          <button onClick={onClose} className="text-muted-taupe hover:text-cocoa-text"><X size={16} /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {!summary && !loading && !error && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-sm text-muted-taupe mb-1">Generate a structured summary of your selected logs.</p>
              <p className="text-xs text-muted-taupe mb-4 opacity-70">Screenshots will be included for context.</p>
              <button onClick={generate} className="btn-primary">Generate summary</button>
            </div>
          )}
          {loading && (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <div className="flex gap-1">
                {[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-sage-primary animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}
              </div>
              <p className="text-xs text-muted-taupe">Analysing logs and screenshots...</p>
            </div>
          )}
          {error && <div className="text-sm text-tag-obstacle-text bg-tag-obstacle-bg rounded-lg p-3">{error}</div>}
          {summary && <div className="space-y-0.5">{renderMarkdown(summary)}</div>}
        </div>

        {summary && (
          <div className="px-5 py-3 border-t border-border-warm flex justify-between items-center">
            <button onClick={generate} className="text-xs text-muted-taupe hover:text-cocoa-text">Regenerate</button>
            <button onClick={copy} className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5">
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
