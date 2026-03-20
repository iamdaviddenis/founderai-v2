import React, { useState } from 'react'
import { MISSIONS } from '../data/missions'

const CATS = ['all', 'prompt', 'system', 'strategy']
const CAT_LABELS = { all: 'All', prompt: 'Prompting', system: 'Systems', strategy: 'Strategy' }

export default function Missions({ store, setScreen, setActiveMission }) {
  const [cat, setCat] = useState('all')
  const { isMissionDone } = store

  const filtered = cat === 'all' ? MISSIONS : MISSIONS.filter(m => m.cat === cat)

  return (
    <div className="screen animate-in">
      <div className="page-header">
        <div className="page-eyebrow">CutOff Recycle · Personalized</div>
        <h1>Missions</h1>
      </div>

      <div className="tabs">
        {CATS.map(c => (
          <div key={c} className={`tab${cat === c ? ' active' : ''}`} onClick={() => setCat(c)}>
            {CAT_LABELS[c]}
          </div>
        ))}
      </div>

      {filtered.map(m => {
        const done = isMissionDone(m.id)
        return (
          <div
            key={m.id}
            className="card"
            style={{ cursor: done ? 'default' : 'pointer', opacity: done ? 0.55 : 1, transition: 'opacity 0.2s' }}
            onClick={() => {
              if (!done) {
                setActiveMission(m)
                setScreen('lab')
              }
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span className={`tag ${done ? 'tag-muted' : 'tag-green'}`}>{m.tag}</span>
              <span style={{ fontSize: '11px', color: done ? 'var(--accent)' : 'var(--text3)', fontWeight: done ? 600 : 400 }}>
                {done ? '✓ Done' : `+${m.xp} XP`}
              </span>
            </div>
            <h3 style={{ marginBottom: 4, fontSize: '0.92rem' }}>{m.title}</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text3)', lineHeight: 1.55 }}>{m.body}</p>
          </div>
        )
      })}
    </div>
  )
}
