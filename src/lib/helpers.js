export const TAGS = {
  process: {
    label: 'Process',
    hint: 'How did you do it? Tools used, steps taken, buttons clicked. This becomes training material for the next person.',
    badgeClass: 'tag-process',
  },
  obstacle: {
    label: 'Obstacle',
    hint: 'What blocked you? How did you get unstuck? Pitfalls and bugs others should know about.',
    badgeClass: 'tag-obstacle',
  },
  retro: {
    label: 'Retro / Learning',
    hint: 'What did you learn? How did you grow? Achievements, feelings, skills — like a journal entry.',
    badgeClass: 'tag-retro',
  },
}

export function formatDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}
