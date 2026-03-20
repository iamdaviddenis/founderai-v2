import React, { useState } from 'react'

function LevelBadge({ level }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 7,
      background: 'var(--surface2)', border: `1px solid ${level.color}44`,
      borderRadius: 20, padding: '5px 14px'
    }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: level.color, display: 'inline-block' }} />
      <span style={{ fontSize: '0.85rem', fontWeight: 500, color: level.color }}>{level.name}</span>
    </div>
  )
}

const LEVEL_ORDER = ['Operator', 'Builder', 'Architect', 'Strategist']
const LEVEL_XP = { Operator: 0, Builder: 500, Architect: 1200, Strategist: 2500 }

export default function Progress({ store }) {
  const [showReset, setShowReset] = useState(false)
  const {
    totalXp, builtCount, streak,
    level, xpPct,
    skills, builtItems,
    streakDates, resetAll
  } = store

  const nextLevelName = LEVEL_ORDER[LEVEL_ORDER.indexOf(level.name) + 1]
  const xpToNext = nextLevelName ? LEVEL_XP[nextLevelName] - totalXp : 0

  function formatDate(iso) {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  }

  return (
    <div className="screen animate-in">
      <div className="page-header">
        <div className="page-eyebrow">Your AI journey</div>
        <h1>Progress</h1>
      </div>

      {/* Level card */}
      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ textAlign: 'center', minWidth: 70 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '2.4rem', color: level.color, lineHeight: 1 }}>{totalXp}</div>
            <div style={{ fontSize: '10px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginTop: 4 }}>Total XP</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <LevelBadge level={level} />
              {nextLevelName && (
                <span style={{ fontSize: '12px', color: 'var(--text3)' }}>→ {nextLevelName}</span>
              )}
            </div>
            <div className="xp-bar-track">
              <div className="xp-bar-fill" style={{
                width: `${xpPct}%`,
                background: `linear-gradient(90deg, ${level.color}, ${level.color}99)`
              }} />
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text3)' }}>
              {nextLevelName
                ? `${xpToNext} XP to ${nextLevelName}`
                : '🎉 Max level reached'}
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, padding: '0 16px', marginBottom: 12 }}>
        <div className="stat-card">
          <div className="stat-val" style={{ color: 'var(--accent)' }}>{streak}</div>
          <div className="stat-lbl">Day streak</div>
        </div>
        <div className="stat-card">
          <div className="stat-val" style={{ color: 'var(--amber)' }}>{builtCount}</div>
          <div className="stat-lbl">Built</div>
        </div>
        <div className="stat-card">
          <div className="stat-val" style={{ color: 'var(--purple)' }}>{streakDates.length}</div>
          <div className="stat-lbl">Active days</div>
        </div>
      </div>

      {/* Levels roadmap */}
      <div className="section-label">Level roadmap</div>
      <div className="card" style={{ marginBottom: 12 }}>
        {LEVEL_ORDER.map((name, i) => {
          const minXp = LEVEL_XP[name]
          const nextXp = LEVEL_XP[LEVEL_ORDER[i + 1]] || 9999
          const isActive = level.name === name
          const isPast = totalXp >= (LEVEL_XP[LEVEL_ORDER[i + 1]] || 9999)
          const isDone = totalXp >= nextXp
          const colors = ['var(--accent)', 'var(--purple)', 'var(--amber)', 'var(--red)']
          const c = colors[i]
          return (
            <div key={name} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 0',
              borderBottom: i < 3 ? '1px solid var(--border)' : 'none',
              opacity: !isActive && !isDone ? 0.45 : 1
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: isActive || isDone ? `${c}22` : 'var(--surface2)',
                border: `1px solid ${isActive ? c : 'var(--border)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 15, flexShrink: 0
              }}>
                {isDone ? '✓' : isActive ? '●' : '○'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.9rem', color: isActive ? c : 'var(--text)' }}>{name}</div>
                <div style={{ fontSize: '11px', color: 'var(--text3)' }}>
                  {name === 'Strategist' ? '2,500+ XP' : `${minXp}–${nextXp} XP`}
                </div>
              </div>
              {isActive && (
                <div style={{ fontSize: '11px', color: c, fontWeight: 500 }}>Current</div>
              )}
              {isDone && !isActive && (
                <div style={{ fontSize: '11px', color: 'var(--accent)' }}>Done</div>
              )}
            </div>
          )
        })}
      </div>

      {/* Skills */}
      <div className="section-label">Skill breakdown</div>
      <div className="card" style={{ marginBottom: 12 }}>
        {[
          { label: 'Prompting', icon: '⚡', color: 'var(--accent)', key: 'prompting', sub: skills.prompting.count > 0 ? `${skills.prompting.count} prompt${skills.prompting.count !== 1 ? 's' : ''} graded` : 'No prompts graded yet' },
          { label: 'Automation', icon: '🔧', color: 'var(--purple)', key: 'automation', sub: skills.automation.count > 0 ? `${skills.automation.count} system task${skills.automation.count !== 1 ? 's' : ''} done` : 'No system tasks done yet' },
          { label: 'Book reading', icon: '📖', color: '#60a5fa', key: 'reading', sub: skills.reading.count > 0 ? `${skills.reading.count} of 14 chapters complete` : 'No chapters read yet' },
          { label: 'AI Strategy', icon: '🧭', color: 'var(--amber)', key: 'strategy', sub: skills.strategy.count > 0 ? `${skills.strategy.count} strategy task${skills.strategy.count !== 1 ? 's' : ''} done` : 'No strategy tasks done yet' },
        ].map(s => (
          <div key={s.key} className="skill-row">
            <div className="skill-icon" style={{ background: `${s.color}18` }}>{s.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{s.label}</div>
              <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: 2 }}>{s.sub}</div>
              {skills[s.key].pct > 0 && (
                <div className="xp-bar-track" style={{ marginTop: 5, marginBottom: 0, height: 4 }}>
                  <div className="xp-bar-fill" style={{ width: `${skills[s.key].pct}%`, background: s.color }} />
                </div>
              )}
            </div>
            <div className="skill-pct" style={{ color: skills[s.key].pct > 0 ? s.color : 'var(--text3)' }}>
              {skills[s.key].pct > 0 ? `${skills[s.key].pct}%` : '—'}
            </div>
          </div>
        ))}
      </div>

      {/* Built history */}
      <div className="section-label">What you've built</div>
      <div className="card" style={{ marginBottom: 12 }}>
        {builtItems.length === 0 ? (
          <p style={{ fontSize: '0.875rem', color: 'var(--text3)', lineHeight: 1.6 }}>
            Nothing here yet — complete a mission or book chapter to see your work.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {builtItems.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span className="check-circle" style={{ marginTop: 1, flexShrink: 0 }}>✓</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{item.label}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: 2 }}>
                    {formatDate(item.date)} · +{item.xp} XP ·{' '}
                    <span className={`tag ${item.type === 'chapter' ? 'tag-purple' : 'tag-green'}`} style={{ fontSize: '9px', padding: '2px 6px' }}>
                      {item.type === 'chapter' ? 'Book' : 'Mission'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Danger zone */}
      <div className="section-label">Settings</div>
      <div className="card" style={{ marginBottom: 32 }}>
        {!showReset ? (
          <button
            className="btn btn-ghost"
            style={{ width: '100%', color: 'var(--red)', borderColor: 'rgba(248,113,113,0.25)' }}
            onClick={() => setShowReset(true)}
          >
            Reset all progress
          </button>
        ) : (
          <div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text3)', marginBottom: 12, lineHeight: 1.6 }}>
              This will erase all your XP, streak, missions, and chapters. Are you sure?
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn btn-ghost"
                style={{ flex: 1, color: 'var(--red)', borderColor: 'rgba(248,113,113,0.3)' }}
                onClick={() => { resetAll(); setShowReset(false) }}
              >
                Yes, reset everything
              </button>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowReset(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
