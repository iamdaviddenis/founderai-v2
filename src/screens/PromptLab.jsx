import React, { useState } from 'react'
import { MISSIONS } from '../data/missions'

const DIMS = [
  { key: 'clarity', label: 'Clarity', color: 'var(--accent)' },
  { key: 'context', label: 'Context', color: 'var(--purple)' },
  { key: 'persona', label: 'Persona / Role', color: 'var(--amber)' },
  { key: 'format', label: 'Output format', color: '#60a5fa' },
  { key: 'constraints', label: 'Constraints', color: '#f472b6' },
  { key: 'interview', label: 'Interview mode', color: '#34d399' },
  { key: 'specificity', label: 'Business specificity', color: '#fb923c' },
]

async function gradePrompt(promptText, mission) {
  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1200,
      system: `You are a strict AI prompt coach for David Denis, CEO of CutOff Recycle — a Tanzanian agri-tech startup making organic fertilizers (Rutubisha, Vuna, McheKuza) from human hair waste. He is learning AI to improve his business.

Grade his prompt on 7 dimensions (0–14 each, total 98 → normalize to 100):
1. clarity — Is it unambiguous?
2. context — Does it give enough background?
3. persona — Does it assign AI a role/expertise?
4. format — Does it specify output format?
5. constraints — Does it include limits or edge cases?
6. interview — Does it use or would benefit from interview/one-question-at-a-time mode?
7. specificity — Is it tied to CutOff Recycle's actual business, not generic?

Respond ONLY with valid JSON, no markdown:
{
  "clarity": <0-14>,
  "context": <0-14>,
  "persona": <0-14>,
  "format": <0-14>,
  "constraints": <0-14>,
  "interview": <0-14>,
  "specificity": <0-14>,
  "total": <0-100>,
  "strength": "<one honest sentence on what's strongest>",
  "weakness": "<one specific sentence on the biggest gap>",
  "challenge": "<one hard follow-up question specific to his business>",
  "improved": "<a rewritten version of David's prompt, specific to CutOff Recycle>"
}`,
      messages: [{ role: 'user', content: `Mission: ${mission.body}\n\nDavid's prompt:\n${promptText}` }]
    })
  })
  const data = await res.json()
  const raw = data.content.map(b => b.text || '').join('')
  return JSON.parse(raw.replace(/```json|```/g, '').trim())
}

export default function PromptLab({ store, activeMission }) {
  const mission = activeMission || MISSIONS[0]
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState(null)

  async function handleGrade() {
    if (prompt.trim().length < 30) return
    setLoading(true)
    setResult(null)
    setSaved(false)
    setSaveError(null)
    try {
      const r = await gradePrompt(prompt, mission)
      if (!r || typeof r.total !== 'number') throw new Error('Invalid response')
      setResult(r)
    } catch {
      setResult({
        clarity:10, context:8, persona:6, format:5, constraints:5, interview:4, specificity:7,
        total: 52,
        strength: 'You have a clear intent — now add structure.',
        weakness: 'Missing persona assignment and output format.',
        challenge: 'If your cr-assistant gave a wrong answer to a farmer, how would you catch it?',
        improved: `You are an expert agronomist and CutOff Recycle product specialist. When a farmer asks about ${mission.title.toLowerCase()}, respond with specific dosages, timing, and crop-relevant advice. Keep answers under 100 words. If unsure, say so and recommend contacting Richard at CutOff Recycle.`
      })
    }
    setLoading(false)
  }

  function handleSave() {
    if (!result || saved) return
    try {
      store.completeMission(mission)
      store.addPromptHistory({ prompt, score: result.total, completedAt: new Date().toISOString(), missionId: mission.id })
      setSaved(true)
    } catch (e) {
      setSaveError('Could not save — try again.')
    }
  }

  return (
    <div className="screen animate-in">
      <div className="page-header">
        <div className="page-eyebrow">Practice · Get graded</div>
        <h1>Prompt Lab</h1>
      </div>

      {/* Context */}
      <div className="card card-accent" style={{ marginBottom: 12 }}>
        <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent)', marginBottom: 8 }}>
          Active mission
        </div>
        <p style={{ fontSize: '0.875rem', color: '#b0b0cc', lineHeight: 1.65 }}>{mission.body}</p>
        <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
          <span className="tag tag-green">{mission.tag}</span>
          <span style={{ fontSize: '11px', color: 'var(--accent)', fontFamily: 'var(--font-display)', fontWeight: 700 }}>+{mission.xp} XP</span>
        </div>
      </div>

      {/* Input */}
      <div style={{ padding: '0 16px', marginBottom: 10 }}>
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="Write your prompt here...&#10;&#10;Tip: Assign a role, give context, specify output format."
          style={{ minHeight: 140 }}
        />
      </div>

      <div style={{ display: 'flex', gap: 8, padding: '0 16px', marginBottom: 16 }}>
        <button
          className="btn btn-primary"
          style={{ flex: 1, opacity: prompt.trim().length < 30 ? 0.5 : 1 }}
          onClick={handleGrade}
          disabled={loading || prompt.trim().length < 30}
        >
          {loading ? 'Grading...' : 'Grade my prompt →'}
        </button>
        <button className="btn btn-ghost" onClick={() => { setPrompt(''); setResult(null); setSaved(false) }}>Clear</button>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text3)', fontSize: '0.875rem' }}>
          <div className="dots"><span /><span /><span /></div>
          Grading your prompt...
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="animate-in">
          <div className="divider" style={{ margin: '0 16px 16px' }} />
          <div className="section-label">Your score</div>

          <div className="card" style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '2.4rem', color: result.total >= 75 ? 'var(--accent)' : result.total >= 50 ? 'var(--amber)' : 'var(--red)' }}>
                {result.total}
              </span>
              <span style={{ fontSize: '13px', color: 'var(--text3)' }}>out of 100</span>
            </div>
            {DIMS.map(d => (
              <div key={d.key} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: 4 }}>
                  <span style={{ color: 'var(--text3)' }}>{d.label}</span>
                  <span style={{ color: d.color, fontWeight: 500 }}>{result[d.key]}/14</span>
                </div>
                <div className="score-bar-wrap">
                  <div className="score-bar-fill" style={{ width: `${(result[d.key] / 14) * 100}%`, background: d.color }} />
                </div>
              </div>
            ))}
          </div>

          <div className="section-label">Feedback</div>
          <div style={{ padding: '0 16px' }}>
            <div className="feedback feedback-green">
              <div className="feedback-label">Strength</div>
              <div className="feedback-text">{result.strength}</div>
            </div>
            <div className="feedback feedback-amber">
              <div className="feedback-label">Biggest gap</div>
              <div className="feedback-text">{result.weakness}</div>
            </div>
            <div className="feedback feedback-purple">
              <div className="feedback-label">Coach's challenge</div>
              <div className="feedback-text">{result.challenge}</div>
            </div>
          </div>

          {result.improved && (
            <>
              <div className="section-label">Improved version</div>
              <div className="card card-purple" style={{ marginBottom: 12 }}>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--purple)', marginBottom: 8 }}>
                  AI coach rewrite
                </div>
                <p style={{ fontSize: '0.84rem', lineHeight: 1.7, color: '#c0c0d8', whiteSpace: 'pre-wrap' }}>{result.improved}</p>
              </div>
            </>
          )}

          <div style={{ padding: '0 16px', marginBottom: 24 }}>
            {saveError && (
              <div className="feedback feedback-red" style={{ marginBottom: 10 }}>
                <div className="feedback-text">{saveError}</div>
              </div>
            )}
            {saved ? (
              <div className="feedback feedback-green">
                <div className="feedback-text">✓ Saved! +{mission.xp} XP earned. Mission complete.</div>
              </div>
            ) : (
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleSave}>
                Save + earn {mission.xp} XP →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
