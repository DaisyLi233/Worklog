import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { TAGS, formatDate } from '../lib/helpers'
import ConfirmDialog from './ConfirmDialog'
import { useApp } from '../lib/AppContext'

function ImageBlockDisplay({ block }) {
  if (!block.src) return null
  return (
    <div>
      <img
        src={block.src}
        alt={block.caption || 'screenshot'}
        className="max-h-40 max-w-full rounded-lg border border-border-warm object-contain"
      />
      {block.caption && (
        <p className="text-xs text-muted-taupe italic mt-1">{block.caption}</p>
      )}
    </div>
  )
}

export default function LogCard({ log, selected, onToggle, onDelete }) {
  const { readonly } = useApp()
  const tag = TAGS[log.tag]
  const blocks = log.blocks || [{ type: 'text', content: log.content || '' }]
  const [confirming, setConfirming] = useState(false)

  return (
    <div
      onClick={() => onToggle(log.id)}
      className={`card p-4 cursor-pointer transition-all group
        ${selected ? 'ring-1 ring-sage-primary bg-sage-light/30' : 'hover:shadow-card-hover'}`}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 w-4 h-4 flex-shrink-0 rounded border transition-colors flex items-center justify-center
          ${selected ? 'bg-sage-primary border-sage-primary' : 'border-border-warm'}`}>
          {selected && (
            <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
              <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-muted-taupe">{formatDate(log.date)}</span>
            <span className={`tag-badge ${tag.badgeClass}`}>{tag.label}</span>
          </div>

          <div className="flex flex-col gap-2">
            {blocks.map((block, i) => (
              block.type === 'text'
                ? block.content?.trim()
                  ? <p key={i} className="text-sm text-cocoa-text leading-relaxed whitespace-pre-wrap">{block.content}</p>
                  : null
                : <ImageBlockDisplay key={block.id || i} block={block} />
            ))}
          </div>
        </div>

        {!readonly && (
          <button
            onClick={e => { e.stopPropagation(); setConfirming(true) }}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-muted-taupe hover:text-tag-obstacle-text flex-shrink-0"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>
      {confirming && (
        <ConfirmDialog
          message="Delete this log entry? This can't be undone."
          onConfirm={() => onDelete(log.id)}
          onCancel={() => setConfirming(false)}
        />
      )}
    </div>
  )
}
