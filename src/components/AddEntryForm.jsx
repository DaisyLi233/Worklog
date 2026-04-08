import { useState, useRef } from 'react'
import { ImagePlus, X, GripVertical, Plus } from 'lucide-react'
import { TAGS } from '../lib/helpers'
import { v4 as uuidv4 } from 'uuid'

function readFilesAsBlocks(files) {
  return Promise.all(
    Array.from(files)
      .filter(f => f.type.startsWith('image/'))
      .map(file => new Promise(resolve => {
        const reader = new FileReader()
        reader.onload = ev => resolve({ id: uuidv4(), type: 'image', src: ev.target.result, caption: '' })
        reader.readAsDataURL(file)
      }))
  )
}

function TextBlock({ block, onChange, onAddImageAfter, onDelete, showDelete, onDropFiles }) {
  const [dragging, setDragging] = useState(false)

  function handleDragOver(e) {
    if ([...e.dataTransfer.items].some(i => i.kind === 'file' && i.type.startsWith('image/'))) {
      e.preventDefault()
      e.stopPropagation()
      setDragging(true)
    }
  }

  async function handleDrop(e) {
    e.preventDefault()
    e.stopPropagation()
    setDragging(false)
    const files = [...e.dataTransfer.files].filter(f => f.type.startsWith('image/'))
    if (files.length) onDropFiles(block.id, files)
  }

  return (
    <div
      className={`group relative flex gap-2 items-start rounded-lg transition-colors
        ${dragging ? 'bg-sage-light ring-1 ring-sage-primary' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget)) setDragging(false) }}
      onDrop={handleDrop}
    >
      <div className="flex-shrink-0 mt-2 opacity-0 group-hover:opacity-30 transition-opacity cursor-grab">
        <GripVertical size={14} className="text-muted-taupe" />
      </div>
      <div className="flex-1">
        <textarea
          value={block.content}
          onChange={e => onChange(block.id, e.target.value)}
          placeholder={dragging ? 'Drop screenshot here...' : 'Write here... (or drag & drop a screenshot)'}
          rows={3}
          className="w-full text-sm text-cocoa-text placeholder:text-muted-taupe bg-transparent resize-none leading-relaxed outline-none"
          onInput={e => {
            e.target.style.height = 'auto'
            e.target.style.height = e.target.scrollHeight + 'px'
          }}
        />
        <div className="flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onAddImageAfter(block.id)}
            className="flex items-center gap-1 text-xs text-muted-taupe hover:text-cocoa-text transition-colors"
          >
            <ImagePlus size={12} />
            Add screenshot
          </button>
          {showDelete && (
            <button
              onClick={() => onDelete(block.id)}
              className="text-xs text-muted-taupe hover:text-tag-obstacle-text transition-colors ml-auto"
            >
              Remove block
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function ImageBlock({ block, onDelete, onCaptionChange }) {
  return (
    <div className="group relative flex gap-2 items-start">
      <div className="flex-shrink-0 mt-2 opacity-0 group-hover:opacity-30 transition-opacity">
        <GripVertical size={14} className="text-muted-taupe" />
      </div>
      <div className="flex-1">
        <div className="relative inline-block">
          <img
            src={block.src}
            alt={block.caption || 'screenshot'}
            className="max-h-48 max-w-full rounded-lg border border-border-warm object-contain"
          />
          <button
            onClick={() => onDelete(block.id)}
            className="absolute -top-2 -right-2 bg-cocoa-text text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X size={10} />
          </button>
        </div>
        <input
          value={block.caption || ''}
          onChange={e => onCaptionChange(block.id, e.target.value)}
          placeholder="Add a caption (optional)"
          className="block mt-1.5 text-xs text-muted-taupe placeholder:text-muted-taupe/60 bg-transparent outline-none w-full italic"
        />
      </div>
    </div>
  )
}

export default function AddEntryForm({ projectId, onSave, onCancel }) {
  const [tag, setTag] = useState('process')
  const [blocks, setBlocks] = useState([{ id: uuidv4(), type: 'text', content: '' }])
  const [saving, setSaving] = useState(false)
  const [globalDragging, setGlobalDragging] = useState(false)
  const fileRef = useRef()
  const pendingInsertAfter = useRef(null)

  function insertImageBlocksAfter(afterId, newImageBlocks) {
    setBlocks(prev => {
      const idx = prev.findIndex(b => b.id === afterId)
      const insertAt = idx >= 0 ? idx + 1 : prev.length
      const next = [...prev]
      next.splice(insertAt, 0, ...newImageBlocks)
      return next
    })
  }

  async function handleDropFiles(afterId, files) {
    setGlobalDragging(false)
    const newBlocks = await readFilesAsBlocks(files)
    insertImageBlocksAfter(afterId, newBlocks)
  }

  function updateText(id, content) {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, content } : b))
  }

  function updateCaption(id, caption) {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, caption } : b))
  }

  function deleteBlock(id) {
    setBlocks(prev => {
      const next = prev.filter(b => b.id !== id)
      if (next.length === 0) return [{ id: uuidv4(), type: 'text', content: '' }]
      if (next[next.length - 1].type === 'image') {
        return [...next, { id: uuidv4(), type: 'text', content: '' }]
      }
      return next
    })
  }

  function addTextBlock() {
    setBlocks(prev => [...prev, { id: uuidv4(), type: 'text', content: '' }])
  }

  function addImageAfter(afterId) {
    pendingInsertAfter.current = afterId
    fileRef.current.click()
  }

  async function handleFiles(e) {
    const files = Array.from(e.target.files)
    if (!files.length) return
    const insertAfterId = pendingInsertAfter.current
    pendingInsertAfter.current = null
    const newBlocks = await readFilesAsBlocks(files)
    insertImageBlocksAfter(insertAfterId || blocks[blocks.length - 1].id, newBlocks)
    e.target.value = ''
  }

  // Global drop zone for the whole form — drops after the last text block
  function handleGlobalDragOver(e) {
    if ([...e.dataTransfer.items].some(i => i.kind === 'file' && i.type.startsWith('image/'))) {
      e.preventDefault()
      setGlobalDragging(true)
    }
  }

  async function handleGlobalDrop(e) {
    e.preventDefault()
    setGlobalDragging(false)
    const files = [...e.dataTransfer.files].filter(f => f.type.startsWith('image/'))
    if (!files.length) return
    const lastTextBlock = [...blocks].reverse().find(b => b.type === 'text')
    if (lastTextBlock) {
      const newBlocks = await readFilesAsBlocks(files)
      insertImageBlocksAfter(lastTextBlock.id, newBlocks)
    }
  }

  async function handleSave() {
    const hasContent = blocks.some(b =>
      (b.type === 'text' && b.content.trim()) || b.type === 'image'
    )
    if (!hasContent || saving) return
    setSaving(true)
    try {
      await onSave({ projectId, tag, blocks })
    } finally {
      setSaving(false)
    }
  }

  const tagInfo = TAGS[tag]
  const textBlocks = blocks.filter(b => b.type === 'text')

  return (
    <div
      className={`card p-4 transition-colors ${globalDragging ? 'ring-1 ring-sage-primary bg-sage-light/20' : ''}`}
      onDragOver={handleGlobalDragOver}
      onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget)) setGlobalDragging(false) }}
      onDrop={handleGlobalDrop}
    >
      <div className="flex gap-2 mb-3 flex-wrap">
        {Object.entries(TAGS).map(([key, t]) => (
          <button
            key={key}
            onClick={() => setTag(key)}
            className={`tag-badge transition-all ${tag === key ? `tag-${key}` : 'bg-app-bg text-muted-taupe border-border-warm hover:border-muted-taupe'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <p className="text-xs text-muted-taupe mb-3 leading-relaxed">{tagInfo.hint}</p>

      <div className="flex flex-col gap-3 min-h-[80px]">
        {blocks.map(block => (
          block.type === 'text'
            ? <TextBlock
                key={block.id}
                block={block}
                onChange={updateText}
                onAddImageAfter={addImageAfter}
                onDelete={deleteBlock}
                showDelete={textBlocks.length > 1}
                onDropFiles={handleDropFiles}
              />
            : <ImageBlock
                key={block.id}
                block={block}
                onDelete={deleteBlock}
                onCaptionChange={updateCaption}
              />
        ))}
      </div>

      {globalDragging && (
        <div className="mt-3 flex items-center justify-center py-3 border border-dashed border-sage-primary rounded-lg">
          <p className="text-xs text-sage-primary">Drop screenshot to add</p>
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-border-warm flex items-center gap-3">
        <button
          onClick={addTextBlock}
          className="flex items-center gap-1.5 text-xs text-muted-taupe hover:text-cocoa-text transition-colors"
        >
          <Plus size={13} />
          Add text block
        </button>
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
        <div className="flex-1" />
        <button onClick={onCancel} className="btn-secondary text-xs py-1.5 px-3">Cancel</button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary text-xs py-1.5 px-3 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save entry'}
        </button>
      </div>
    </div>
  )
}
