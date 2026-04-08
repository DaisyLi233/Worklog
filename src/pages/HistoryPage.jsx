import { useState, useRef, useEffect } from 'react'
import { FileText, Star, AlignLeft, Trash2, Download, Pencil } from 'lucide-react'
import { useApp } from '../lib/AppContext'
import ConfirmDialog from '../components/ConfirmDialog'

const TABS = [
  { key: 'summary', label: 'Summary', icon: AlignLeft },
  { key: 'kt', label: 'Knowledge Transfer', icon: FileText },
  { key: 'pr', label: 'Performance Report', icon: Star },
]

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function renderMarkdown(text) {
  return text.split('\n').map((line, i) => {
    if (line.startsWith('## ')) return <h3 key={i} className="text-sm font-medium text-cocoa-text mt-4 mb-1.5 first:mt-0">{line.slice(3)}</h3>
    if (line.startsWith('# ')) return <h2 key={i} className="text-base font-medium text-cocoa-text mt-2 mb-2">{line.slice(2)}</h2>
    if (line.startsWith('- ') || line.startsWith('* ')) return <li key={i} className="text-sm text-cocoa-text leading-relaxed ml-4 list-disc">{line.slice(2)}</li>
    if (line.match(/^\d+\./)) return <li key={i} className="text-sm text-cocoa-text leading-relaxed ml-4 list-decimal">{line.replace(/^\d+\.\s*/, '')}</li>
    if (line.trim() === '') return <div key={i} className="h-2" />
    return <p key={i} className="text-sm text-cocoa-text leading-relaxed">{line}</p>
  })
}

function downloadPDF(entry) {
  const typeLabel = entry.type === 'summary' ? 'Summary' : entry.type === 'kt' ? 'Knowledge Transfer' : 'Performance Report'
  const displayTitle = entry.title || entry.projectName

  const htmlContent = entry.content.split('\n').map(line => {
    if (line.startsWith('## ')) return `<h2>${line.slice(3)}</h2>`
    if (line.startsWith('# ')) return `<h1>${line.slice(2)}</h1>`
    if (line.startsWith('- ') || line.startsWith('* ')) return `<li>${line.slice(2)}</li>`
    if (line.match(/^\d+\./)) return `<li>${line.replace(/^\d+\.\s*/, '')}</li>`
    if (line.trim() === '') return '<br/>'
    return `<p>${line}</p>`
  }).join('\n')

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"/>
<title>${displayTitle} — ${typeLabel}</title>
<style>
  body { font-family: Georgia, serif; color: #3E3631; max-width: 720px; margin: 40px auto; padding: 0 24px; line-height: 1.7; }
  h1 { font-size: 22px; font-weight: 500; margin-bottom: 4px; }
  h2 { font-size: 17px; font-weight: 500; margin-top: 28px; margin-bottom: 8px; border-bottom: 1px solid #E8E2D9; padding-bottom: 4px; }
  p { font-size: 14px; margin: 6px 0; }
  li { font-size: 14px; margin: 4px 0; }
  ul, ol { padding-left: 20px; }
  .meta { font-size: 12px; color: #8C857D; margin-bottom: 32px; margin-top: 4px; }
  .badge { display: inline-block; font-size: 11px; padding: 2px 8px; border-radius: 99px; background: #F1F9F1; color: #6D8F6D; border: 1px solid #D2EAD2; margin-right: 6px; }
</style></head>
<body>
<h1>${displayTitle}</h1>
<div class="meta">
  <span class="badge">${typeLabel}</span>
  Generated ${formatDate(entry.createdAt)}
</div>
${htmlContent}
</body></html>`

  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const win = window.open(url, '_blank')
  if (win) { win.onload = () => { win.print(); URL.revokeObjectURL(url) } }
}

function InlineRename({ value, onSave }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const inputRef = useRef()

  useEffect(() => { if (editing) inputRef.current?.focus() }, [editing])
  useEffect(() => { setDraft(value) }, [value])

  function commit() {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== value) onSave(trimmed)
    else setDraft(value)
    setEditing(false)
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setDraft(value); setEditing(false) } }}
        onClick={e => e.stopPropagation()}
        className="text-sm font-medium text-cocoa-text bg-transparent outline-none border-b border-sage-primary w-full max-w-xs"
      />
    )
  }

  return (
    <div className="flex items-center gap-1.5 group/rename min-w-0">
      <span className="text-sm font-medium text-cocoa-text truncate">{value}</span>
      <button
        onClick={e => { e.stopPropagation(); setEditing(true) }}
        className="opacity-0 group-hover/rename:opacity-60 hover:!opacity-100 transition-opacity flex-shrink-0"
      >
        <Pencil size={11} className="text-muted-taupe" />
      </button>
    </div>
  )
}

export default function HistoryPage() {
  const { history, deleteHistory, renameHistory } = useApp()
  const [activeTab, setActiveTab] = useState('summary')
  const [expanded, setExpanded] = useState(null)
  const [confirmingId, setConfirmingId] = useState(null)

  const filtered = history.filter(h => h.type === activeTab)

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b border-border-warm flex-shrink-0">
        <h1 className="text-base font-medium text-cocoa-text">History</h1>
        <p className="text-xs text-muted-taupe mt-0.5">All your generated reports, saved automatically</p>
      </div>

      <div className="flex border-b border-border-warm flex-shrink-0 px-6">
        {TABS.map(tab => {
          const Icon = tab.icon
          const count = history.filter(h => h.type === tab.key).length
          return (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setExpanded(null) }}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm border-b-2 transition-colors -mb-px
                ${activeTab === tab.key
                  ? 'border-sage-primary text-cocoa-text font-medium'
                  : 'border-transparent text-muted-taupe hover:text-cocoa-text'}`}
            >
              <Icon size={13} />
              {tab.label}
              {count > 0 && (
                <span className="ml-1 text-xs bg-app-bg text-muted-taupe px-1.5 py-0.5 rounded-full">{count}</span>
              )}
            </button>
          )
        })}
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-3">
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-sm text-muted-taupe">No {TABS.find(t => t.key === activeTab)?.label.toLowerCase()} reports yet.</p>
            <p className="text-xs text-muted-taupe mt-1 opacity-70">Generate one from a project and it will appear here.</p>
          </div>
        )}

        {filtered.map(entry => (
          <div key={entry.id} className="card overflow-hidden">
            <div
              className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-app-bg/50 transition-colors"
              onClick={() => setExpanded(expanded === entry.id ? null : entry.id)}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="flex-shrink-0">
                  {entry.type === 'summary' && <AlignLeft size={14} className="text-muted-taupe" />}
                  {entry.type === 'kt' && <FileText size={14} className="text-tag-process-text" />}
                  {entry.type === 'pr' && <Star size={14} className="text-tag-retro-text" />}
                </div>
                <div className="min-w-0 flex-1">
                  <InlineRename
                    value={entry.title || entry.projectName}
                    onSave={title => renameHistory(entry.id, title)}
                  />
                  <p className="text-xs text-muted-taupe mt-0.5">{entry.projectName} · {formatDate(entry.createdAt)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                <button
                  onClick={e => { e.stopPropagation(); downloadPDF(entry) }}
                  className="flex items-center gap-1 text-xs text-muted-taupe hover:text-cocoa-text transition-colors px-2 py-1 rounded hover:bg-app-bg"
                >
                  <Download size={12} />
                  PDF
                </button>
                <button
                  onClick={e => { e.stopPropagation(); setConfirmingId(entry.id) }}
                  className="p-1 text-muted-taupe hover:text-tag-obstacle-text transition-colors"
                >
                  <Trash2 size={13} />
                </button>
                <span className="text-muted-taupe text-xs select-none">{expanded === entry.id ? '▲' : '▼'}</span>
              </div>
            </div>

            {expanded === entry.id && (
              <div className="px-4 pb-4 pt-1 border-t border-border-warm">
                <div className="space-y-0.5 mt-2">
                  {renderMarkdown(entry.content)}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      {confirmingId && (
        <ConfirmDialog
          message="Delete this report? This can't be undone."
          onConfirm={() => { deleteHistory(confirmingId); setConfirmingId(null) }}
          onCancel={() => setConfirmingId(null)}
        />
      )}
    </div>
  )
}
