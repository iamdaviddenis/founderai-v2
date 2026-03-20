import React, { useMemo } from 'react'
import { MISSIONS } from '../data/missions'
import { CHAPTERS } from '../data/chapters'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 5) return 'Late night'
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  if (h < 21) return 'Good evening'
  return 'Good night'
}

function StreakCalendar({ streakDates }) {
  const days = useMemo(() => {
    const today = new Date()
    return Array.from({ length: 21 }, (_, i) => {
      const d = new Date(today)
      d.setDate(today.getDate() - (20 - i))
      const str = d.toISOString().slice(0, 10)
      const isToday = i === 20
      const done = streakDates.includes(str)
      return { str, isToday, done }
    })
  }, [streakDates])

  return (
    <div className="streak-grid">
      {days.map(d => (
        <div
          key={d.str}
          className={`streak-dot${d.isToday ? ' today' : d.done ? ' active' : ''}`}
        />
      ))}
    </div>
  )
}

export default function Home({ store, setScreen }) {
  const { totalXp, builtCount, streak, streakDates, level, isMissionDone, isChapterDone } = store

  // Pick today's mission (first undone)
  const todayMission = useMemo(() => MISSIONS.find(m => !isMissionDone(m.id)) || MISSIONS[0], [isMissionDone])

  // Next chapter
  const nextChapter = useMemo(() => CHAPTERS.find(c => !isChapterDone(c.num)) || CHAPTERS[CHAPTERS.length - 1], [isChapterDone])

  const streakMsg = streak === 0
    ? 'Complete something today to start your streak!'
    : streak === 1 ? '🔥 Day 1 — great start!'
    : `🔥 ${streak} days running — keep it going!`

  return (
    <div className="screen animate-in">
      {/* Header */}
      <div className="page-header">
        <div className="page-eyebrow">{getGreeting()} · David</div>
        <h1>Your AI<br />Mission</h1>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, padding: '0 16px', marginBottom: 12 }}>
        <div className="stat-card">
          <div className="stat-val" style={{ color: 'var(--accent)' }}>{streak}</div>
          <div className="stat-lbl">Streak</div>
        </div>
        <div className="stat-card">
          <div className="stat-val" style={{ color: 'var(--purple)' }}>{totalXp}</div>
          <div className="stat-lbl">Total XP</div>
        </div>
        <div className="stat-card">
          <div className="stat-val" style={{ color: 'var(--amber)' }}>{builtCount}</div>
          <div className="stat-lbl">Built</div>
        </div>
      </div>

      {/* Today's mission */}
      <div className="section-label">Today's mission</div>
      <div className="mission-glow">
        <span className="tag tag-green" style={{ marginBottom: 10, display: 'inline-flex' }}>{todayMission.tag}</span>
        <h2 style={{ marginBottom: 8, lineHeight: 1.3 }}>{todayMission.title}</h2>
        <p style={{ fontSize: '0.875rem', color: '#a0a0c0', lineHeight: 1.65, marginBottom: 14 }}>{todayMission.body}</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: 'var(--text3)' }}>Level: {todayMission.level}</span>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--accent)', fontSize: '0.9rem' }}>+{todayMission.xp} XP</span>
        </div>
      </div>

      <button className="btn btn-primary btn-block" style={{ marginBottom: 8 }} onClick={() => setScreen('lab')}>
        Start mission →
      </button>
      <button className="btn btn-ghost btn-block" style={{ marginBottom: 20 }} onClick={() => setScreen('missions')}>
        See all missions
      </button>

      {/* Streak calendar */}
      <div className="section-label">This week</div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3>Streak calendar</h3>
          <span style={{ fontSize: '11px', color: 'var(--text3)' }}>Last 21 days</span>
        </div>
        <StreakCalendar streakDates={streakDates} />
        <div style={{ marginTop: 10, fontSize: '12px', color: 'var(--text3)' }}>{streakMsg}</div>
      </div>

      {/* Today's reading */}
      <div className="section-label">Today's reading</div>
      <div className="card card-purple" style={{ cursor: 'pointer' }} onClick={() => setScreen('book')}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
          <span className="tag tag-purple">{nextChapter.part} · Ch. {nextChapter.num}</span>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--purple)', fontSize: '0.85rem' }}>+{nextChapter.xp} XP</span>
        </div>
        <h3 style={{ marginBottom: 4 }}>{nextChapter.title}</h3>
        <p style={{ fontSize: '0.82rem', color: 'var(--text3)', lineHeight: 1.55 }}>{nextChapter.hook}</p>
      </div>

      {/* Level */}
      <div className="section-label">Your level</div>
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: level.color }}>{level.name}</span>
          <span style={{ fontSize: '12px', color: 'var(--text3)' }}>{totalXp} XP total</span>
        </div>
        <div className="xp-bar-track">
          <div className="xp-bar-fill" style={{ width: `${Math.min(((totalXp - level.minXp) / (level.next - level.minXp)) * 100, 100)}%`, background: `linear-gradient(90deg, ${level.color}, ${level.color}aa)` }} />
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text3)' }}>
          {level.next === 9999 ? 'Max level reached 🎉' : `${totalXp - level.minXp} / ${level.next - level.minXp} XP to ${['Builder','Architect','Strategist',''][['Operator','Builder','Architect','Strategist'].indexOf(level.name)]} `}
        </div>
      </div>
    </div>
  )
}
