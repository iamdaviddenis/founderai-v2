import { useState, useEffect, useCallback } from 'react'

const KEY = 'founderai_v1'

const DEFAULT_STATE = {
  xp: 0,
  completedMissions: [],   // [{ id, title, xp, cat, completedAt }]
  completedChapters: [],   // [{ num, title, xp, completedAt, summary }]
  promptHistory: [],       // [{ prompt, score, completedAt }]
  streakDates: [],         // ['2026-03-20', ...]  — one entry per day
  chatHistory: [],         // [{ role, content }]
}

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return DEFAULT_STATE
    return { ...DEFAULT_STATE, ...JSON.parse(raw) }
  } catch { return DEFAULT_STATE }
}

function save(state) {
  try { localStorage.setItem(KEY, JSON.stringify(state)) } catch {}
}

export function useStore() {
  const [state, setState] = useState(() => load())

  // Persist on every change
  useEffect(() => { save(state) }, [state])

  const update = useCallback((patch) => {
    setState(prev => {
      const next = typeof patch === 'function' ? patch(prev) : { ...prev, ...patch }
      return next
    })
  }, [])

  // ── Computed values ──
  const totalXp = state.xp
  const builtCount = state.completedMissions.length + state.completedChapters.length
  const streak = computeStreak(state.streakDates)
  const streakDates = state.streakDates
  const level = computeLevel(totalXp)
  const nextLevelXp = level.next
  const xpIntoLevel = totalXp - level.minXp
  const xpForLevel = level.next - level.minXp
  const xpPct = Math.min(Math.round((xpIntoLevel / xpForLevel) * 100), 100)

  // ── Actions ──
  function completeMission(mission) {
    const today = todayStr()
    update(prev => ({
      xp: prev.xp + mission.xp,
      completedMissions: [
        ...prev.completedMissions,
        { id: mission.id, title: mission.title, xp: mission.xp, cat: mission.cat, completedAt: new Date().toISOString() }
      ],
      streakDates: addStreakDate(prev.streakDates, today),
    }))
  }

  function completeChapter(chapter, summary) {
    const today = todayStr()
    update(prev => ({
      xp: prev.xp + chapter.xp,
      completedChapters: [
        ...prev.completedChapters,
        { num: chapter.num, title: chapter.title, xp: chapter.xp, completedAt: new Date().toISOString(), summary }
      ],
      streakDates: addStreakDate(prev.streakDates, today),
    }))
  }

  function addPromptHistory(entry) {
    update(prev => ({
      promptHistory: [entry, ...prev.promptHistory].slice(0, 50)
    }))
  }

  function setChatHistory(history) {
    update({ chatHistory: history })
  }

  function resetAll() {
    setState(DEFAULT_STATE)
    localStorage.removeItem(KEY)
  }

  const isMissionDone = (id) => state.completedMissions.some(m => m.id === id)
  const isChapterDone = (num) => state.completedChapters.some(c => c.num === num)

  // Skill breakdown from real data
  const skills = {
    prompting: {
      count: state.completedMissions.filter(m => m.cat === 'prompt').length + state.promptHistory.length,
      pct: Math.min(state.completedMissions.filter(m => m.cat === 'prompt').length * 12 + state.promptHistory.length * 5, 100),
    },
    automation: {
      count: state.completedMissions.filter(m => m.cat === 'system').length,
      pct: Math.min(state.completedMissions.filter(m => m.cat === 'system').length * 18, 100),
    },
    reading: {
      count: state.completedChapters.length,
      pct: Math.min(Math.round((state.completedChapters.length / 14) * 100), 100),
    },
    strategy: {
      count: state.completedMissions.filter(m => m.cat === 'strategy').length,
      pct: Math.min(state.completedMissions.filter(m => m.cat === 'strategy').length * 15, 100),
    },
  }

  // All built items merged and sorted newest first
  const builtItems = [
    ...state.completedMissions.map(m => ({ label: m.title, xp: m.xp, date: m.completedAt, type: 'mission' })),
    ...state.completedChapters.map(c => ({ label: `Ch.${c.num}: ${c.title}`, xp: c.xp, date: c.completedAt, type: 'chapter' })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date))

  return {
    state,
    // raw arrays (needed by Book and Progress directly)
    completedChapters: state.completedChapters,
    completedMissions: state.completedMissions,
    // computed
    totalXp, builtCount, streak, streakDates,
    level, xpPct, xpIntoLevel, xpForLevel, nextLevelXp,
    skills, builtItems,
    // checkers
    isMissionDone, isChapterDone,
    // actions
    completeMission, completeChapter, addPromptHistory, setChatHistory, resetAll,
  }
}

// ── Helpers ──
function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function addStreakDate(dates, today) {
  if (dates.includes(today)) return dates
  return [...dates, today]
}

function computeStreak(dates) {
  if (!dates.length) return 0
  const sorted = [...new Set(dates)].sort().reverse()
  const today = todayStr()
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  if (sorted[0] !== today && sorted[0] !== yesterday) return 0
  let streak = 1
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1])
    const curr = new Date(sorted[i])
    const diff = (prev - curr) / 86400000
    if (diff === 1) streak++
    else break
  }
  return streak
}

function computeLevel(xp) {
  const levels = [
    { name: 'Operator', minXp: 0, next: 500, color: '#6effc0' },
    { name: 'Builder', minXp: 500, next: 1200, color: '#a78bfa' },
    { name: 'Architect', minXp: 1200, next: 2500, color: '#fbbf24' },
    { name: 'Strategist', minXp: 2500, next: 9999, color: '#f87171' },
  ]
  for (let i = levels.length - 1; i >= 0; i--) {
    if (xp >= levels[i].minXp) return levels[i]
  }
  return levels[0]
}
      completedChapters: [
        ...prev.completedChapters,
        { num: chapter.num, title: chapter.title, xp: chapter.xp, completedAt: new Date().toISOString(), summary }
      ],
      streakDates: addStreakDate(prev.streakDates, today),
    }))
  }

  function addPromptHistory(entry) {
    update(prev => ({
      promptHistory: [entry, ...prev.promptHistory].slice(0, 50)
    }))
  }

  function setChatHistory(history) {
    update({ chatHistory: history })
  }

  function resetAll() {
    setState(DEFAULT_STATE)
    localStorage.removeItem(KEY)
  }

  const isMissionDone = (id) => state.completedMissions.some(m => m.id === id)
  const isChapterDone = (num) => state.completedChapters.some(c => c.num === num)

  // Skill breakdown from real data
  const skills = {
    prompting: {
      count: state.completedMissions.filter(m => m.cat === 'prompt').length + state.promptHistory.length,
      pct: Math.min(state.completedMissions.filter(m => m.cat === 'prompt').length * 12 + state.promptHistory.length * 5, 100),
    },
    automation: {
      count: state.completedMissions.filter(m => m.cat === 'system').length,
      pct: Math.min(state.completedMissions.filter(m => m.cat === 'system').length * 18, 100),
    },
    reading: {
      count: state.completedChapters.length,
      pct: Math.min(Math.round((state.completedChapters.length / 14) * 100), 100),
    },
    strategy: {
      count: state.completedMissions.filter(m => m.cat === 'strategy').length,
      pct: Math.min(state.completedMissions.filter(m => m.cat === 'strategy').length * 15, 100),
    },
  }

  // All built items merged and sorted newest first
  const builtItems = [
    ...state.completedMissions.map(m => ({ label: m.title, xp: m.xp, date: m.completedAt, type: 'mission' })),
    ...state.completedChapters.map(c => ({ label: `Ch.${c.num}: ${c.title}`, xp: c.xp, date: c.completedAt, type: 'chapter' })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date))

  return {
    state,
    // computed
    totalXp, builtCount, streak, streakDates,
    level, xpPct, xpIntoLevel, xpForLevel, nextLevelXp,
    skills, builtItems,
    // checkers
    isMissionDone, isChapterDone,
    // actions
    completeMission, completeChapter, addPromptHistory, setChatHistory, resetAll,
  }
}

// ── Helpers ──
function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function addStreakDate(dates, today) {
  if (dates.includes(today)) return dates
  return [...dates, today]
}

function computeStreak(dates) {
  if (!dates.length) return 0
  const sorted = [...new Set(dates)].sort().reverse()
  const today = todayStr()
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  if (sorted[0] !== today && sorted[0] !== yesterday) return 0
  let streak = 1
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1])
    const curr = new Date(sorted[i])
    const diff = (prev - curr) / 86400000
    if (diff === 1) streak++
    else break
  }
  return streak
}

function computeLevel(xp) {
  const levels = [
    { name: 'Operator', minXp: 0, next: 500, color: '#6effc0' },
    { name: 'Builder', minXp: 500, next: 1200, color: '#a78bfa' },
    { name: 'Architect', minXp: 1200, next: 2500, color: '#fbbf24' },
    { name: 'Strategist', minXp: 2500, next: 9999, color: '#f87171' },
  ]
  for (let i = levels.length - 1; i >= 0; i--) {
    if (xp >= levels[i].minXp) return levels[i]
  }
  return levels[0]
}
