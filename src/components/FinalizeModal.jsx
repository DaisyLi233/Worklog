import { useState } from 'react'
import { X, Copy, Check, FileText, Star } from 'lucide-react'
import { TAGS } from '../lib/helpers'
import { callClaude, buildMessages } from '../lib/api'
import { useApp } from '../lib/AppContext'

const KT_SYSTEM = name => `You are generating a Knowledge Transfer document for the project "${name}". This will be handed to the next intern or team member.

You will receive work logs including screenshots. Describe what you see in screenshots when they show important technical details (e.g. "As shown in the screenshot, navigate to Settings > Deploy > Environment Properties").

Generate a well-structured KT document in markdown. Let the content guide the structure. Include:
- Key tools and systems (with specific step-by-step instructions)
- Non-obvious processes and workflows
- Known pitfalls, bugs, and gotchas
- Dependencies, contacts, and resources

Be specific and practical. A new person should be able to follow this document independently.`

const PR_SYSTEM = name => `You are generating a Performance Report for someone who just completed their work on "${name}". This is a personal document — make them feel proud and help them articulate their growth.

Generate a warm but professional report with these sections (markdown):

## What I accomplished
Key contributions and deliverables — framed as achievements.

## Hard skills developed
Technical skills learned or strengthened, with specific examples.

## Soft skills & personal growth
Interpersonal, communication, or mindset growth observed in the logs.

## Highlights
2-3 moments or wins worth remembering and talking about in interviews.

Be specific, warm, and encouraging. Use their own words and experiences where possible.`

export default function FinalizeModal({ project, logs, onClose }) {
  const { saveHistory } = useApp()
  const [activeReport, setActiveReport] = useState(null)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  async function generate(type) {
    setActiveReport(type)
    setLoading(true)
    setError('')
    setContent('')
    try {
      const relevant = type === 'kt'
        ? logs.filter(l => l.tag === 'process' || l.tag === 'obstacle')
        : logs
      const includeImages = type === 'kt'
      const logEntries = relevant.map(l => ({ label: TAGS[l.tag].label, date: l.date, blocks: l.blocks, content: l.content }))
      const system = type === 'kt' ? KT_SYSTEM(project.name) : PR_SYSTEM(project.name)
      const messages = await buildMessages(system, logEntries, includeImages)
      const text = await callClaude(messages, 1800)
      setContent(text)
      saveHistory({ type, projectId: project.id, projectName: project.name, content: text, logIds: logs.map(l => l.id) })
    } catch (e) {
      setError(e.message || 'Failed to generate. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function copy() {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function renderMarkdown(text) {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('## ')) return <h3 key={i} className="text-sm font-medium text-cocoa-text mt-4 mb-1.5 first:mt-0">{line.slice(3)}</h3>
      if (line.startsWith('# ')) return <h2 key={i} className="text-base font-medium text-cocoa-text mt-2 mb-2">{line.slice(2)}</h2>
      if (line.startsWith('- ') || line.startsWith('* ')) return <li key={i} className="text-sm text-cocoa-text leading-relaxed ml-3 list-disc">{line.slice(2)}</li>
      if (line.match(/^\d+\./)) return <li key={i} className="text-sm text-cocoa-text leading-relaxed ml-3 list-decimal">{line.replace(/^\d+\.\s*/, '')}</li>
      if (line.trim() === '') return <div key={i} className="h-1" />
      return <p key={i} className="text-sm text-cocoa-text leading-relaxed">{line}</p>
    })
  }

  const ktCount = logs.filter(l => l.tag === 'process' || l.tag === 'obstacle').length

  return (
    <div className="fixed inset-0 bg-cocoa-text/20 flex items-center justify-center z-50 p-4">
      <div className="bg-card-bg rounded-2xl border border-border-warm w-full max-w-2xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-warm">
          <div>
            <h2 className="text-base font-medium text-cocoa-text">Finalize project</h2>
            <p className="text-xs text-muted-taupe mt-0.5">{project.name} · {logs.length} logs</p>
          </div>
          <button onClick={onClose} className="text-muted-taupe hover:text-cocoa-text"><X size={16} /></button>
        </div>

        {!activeReport && (
          <div className="p-6 flex flex-col gap-3">
            <p className="text-xs text-muted-taupe mb-1">Choose which report to generate:</p>
            <button onClick={() => generate('kt')} className="card p-4 text-left hover:shadow-card-hover transition-all">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-tag-process-bg flex items-center justify-center flex-shrink-0">
                  <FileText size={14} className="text-tag-process-text" />
                </div>
                <div>
                  <p className="text-sm font-medium text-cocoa-text">Knowledge Transfer</p>
                  <p className="text-xs text-muted-taupe mt-0.5 leading-relaxed">Technical handoff for the next person. AI will read your screenshots and reference them in the document.</p>
                  <div className="flex gap-1.5 mt-2 flex-wrap items-center">
                    <span className="tag-badge tag-process">Process logs</span>
                    <span className="tag-badge tag-obstacle">Obstacle logs</span>
                    <span className="text-xs text-muted-taupe">· {ktCount} entries · screenshots included</span>
                  </div>
                </div>
              </div>
            </button>

            <button onClick={() => generate('pr')} className="card p-4 text-left hover:shadow-card-hover transition-all">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-tag-retro-bg flex items-center justify-center flex-shrink-0">
                  <Star size={14} className="text-tag-retro-text" />
                </div>
                <div>
                  <p className="text-sm font-medium text-cocoa-text">Performance Report</p>
                  <p className="text-xs text-muted-taupe mt-0.5 leading-relaxed">Your personal growth story. Achievements, skills developed, highlights to feel proud of.</p>
                  <div className="flex gap-1.5 mt-2 flex-wrap items-center">
                    <span className="tag-badge tag-process">Process</span>
                    <span className="tag-badge tag-obstacle">Obstacle</span>
                    <span className="tag-badge tag-retro">Retro / Learning</span>
                    <span className="text-xs text-muted-taupe">· {logs.length} entries</span>
                  </div>
                </div>
              </div>
            </button>
          </div>
        )}

        {activeReport && (
          <>
            <div className="px-6 pt-4 pb-3 flex items-center gap-3 border-b border-border-warm">
              <button onClick={() => { setActiveReport(null); setContent('') }} className="text-xs text-muted-taupe hover:text-cocoa-text">← Back</button>
              <span className="text-sm font-medium text-cocoa-text">
                {activeReport === 'kt' ? 'Knowledge Transfer' : 'Performance Report'}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {loading && (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="flex gap-1">
                    {[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-sage-primary animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}
                  </div>
                  <p className="text-xs text-muted-taupe">
                    {activeReport === 'kt' ? 'Reading logs and screenshots...' : 'Generating performance report...'}
                  </p>
                </div>
              )}
              {error && <div className="text-sm text-tag-obstacle-text bg-tag-obstacle-bg rounded-lg p-3">{error}</div>}
              {content && <div className="space-y-0.5">{renderMarkdown(content)}</div>}
            </div>
            {content && (
              <div className="px-6 py-3 border-t border-border-warm flex justify-between items-center">
                <button onClick={() => generate(activeReport)} className="text-xs text-muted-taupe hover:text-cocoa-text">Regenerate</button>
                <button onClick={copy} className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5">
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
