import { loadImage } from './imageDB'

const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY

// Build multimodal content array from blocks, loading images from IndexedDB
export async function blocksToContent(blocks, includeImages = true) {
  const parts = []
  for (const block of blocks) {
    if (block.type === 'text' && block.content?.trim()) {
      parts.push({ type: 'text', text: block.content })
    } else if (block.type === 'image' && includeImages) {
      // Get the image — prefer block.src (if still in memory), else load from IndexedDB
      const dataUrl = block.src || await loadImage(block.id)
      if (dataUrl) {
        const [meta, data] = dataUrl.split(',')
        const mediaType = meta.match(/:(.*?);/)?.[1] || 'image/png'
        parts.push({ type: 'image', source: { type: 'base64', media_type: mediaType, data } })
        if (block.caption?.trim()) {
          parts.push({ type: 'text', text: `[Screenshot caption: ${block.caption}]` })
        }
      }
    }
  }
  return parts.length > 0 ? parts : [{ type: 'text', text: '(no content)' }]
}

// Build the messages array for a multimodal prompt
export async function buildMessages(systemText, logs, includeImages = true) {
  const content = [{ type: 'text', text: systemText + '\n\n' }]
  for (const log of logs) {
    content.push({ type: 'text', text: `\n[${log.label} · ${log.date}]\n` })
    const parts = await blocksToContent(
      log.blocks || [{ type: 'text', content: log.content || '' }],
      includeImages
    )
    content.push(...parts)
  }
  return [{ role: 'user', content }]
}

export async function callClaude(messagesOrPrompt, maxTokens = 1200) {
  const messages = typeof messagesOrPrompt === 'string'
    ? [{ role: 'user', content: messagesOrPrompt }]
    : messagesOrPrompt

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: maxTokens, messages }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message || `API error ${res.status}`)
  }

  const data = await res.json()
  return data.content?.map(b => b.text || '').join('') || ''
}
