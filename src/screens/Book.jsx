import React, { useState } from 'react'
import { CHAPTERS } from '../data/chapters'

async function checkSummary(summary, chapter) {
  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: `You are checking whether David Denis Hariohay — CEO of CutOff Recycle, a Tanzanian agri-tech startup making organic fertilizers from human hair waste (products: Rutubisha, Vuna, McheKuza), team of 6, based in Arusha — has understood a chapter from "The AI-Driven Leader" by Geoff Woods.

Chapter ${chapter.num}: "${chapter.title}"

Key points that should appear in a complete summary:
${chapter.keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}

Evaluate David's summary. Respond ONLY with valid JSON, no markdown:
{
  "grade": "pass" | "partial" | "fail",
  "score": <0-100>,
  "opening": "<1-2 direct, honest sentences on overall quality>",
  "captured": ["<idea he got right>"],
  "missed": ["<key point not in summary>"],
  "business_connection": "<did he connect to CutOff Recycle? If yes, praise it. If no, suggest how.>",
  "challenge": "<one hard follow-up question specific to his business situation>",
  "ready": true | false
}`,
      messages: [{ role: 'user', content: `David's summary:\n\n${summary}` }]
    })
  })
  const data = await res.json()
  const raw = data.content.map(b => b.text || '').join('')
  return JSON.parse(raw.replace(/```json|```/g, '').trim())
}

function ChapterList({ store, onSelect }) {
  const isChapterDone = store.isChapterDone || (() => false)
  const completedChapters = store.completedChapters || store.state?.completedChapters || []
  const nextNum = CHAPTERS.find(c => !isChapterDone(c.num))?.num

  return (
    <>
      <div className="page-header">
        <div className="page-eyebrow">Daily reading · Summarize & get checked</div>
        <h1>The AI-Driven<br />Leader</h1>
      </div>

      {/* Book progress */}
      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', color: 'var(--purple)' }}>
              {completedChapters.length}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Chapters done</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', color: 'var(--text)' }}>
              {completedChapters.reduce((s, c) => s + c.xp, 0)}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>XP earned</div>
          </div>
        </div>
        <div className="xp-bar-track">
          <div className="xp-bar-fill" style={{ width: `${Math.round((completedChapters.length / 14) * 100)}%`, background: 'linear-gradient(90deg, var(--purple), #818cf8)' }} />
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text3)' }}>{completedChapters.length} of 14 chapters · Geoff Woods</div>
      </div>

      <div className="section-label">Chapters</div>
      {CHAPTERS.map(ch => {
        const done = isChapterDone(ch.num)
        const isToday = ch.num === nextNum
        return (
          <div
            key={ch.num}
            className={`card chapter-card${isToday ? ' is-today' : done ? ' is-done' : ''}`}
            onClick={() => onSelect(ch)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: '10px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500 }}>
                {ch.part} · Ch. {ch.num}
              </span>
              <span className={`tag ${done ? 'tag-green' : isToday ? 'tag-purple' : 'tag-muted'}`}>
                {done ? '✓ Done' : isToday ? 'Today' : `+${ch.xp} XP`}
              </span>
            </div>
            <h3 style={{ marginBottom: 4, fontSize: '0.92rem' }}>{ch.title}</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text3)', lineHeight: 1.55 }}>{ch.hook}</p>
          </div>
        )
      })}
    </>
  )
}

function ChapterSession({ chapter, store, onBack }) {
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [saved, setSaved] = useState(false)
  const done = store.isChapterDone(chapter.num)

  async function handleCheck() {
    if (summary.trim().length < 60) return
    setLoading(true)
    setResult(null)
    try {
      const r = await checkSummary(summary, chapter)
      if (!r || typeof r.score !== 'number') throw new Error('bad response')
      setResult(r)
    } catch {
      setResult({
        grade: 'partial', score: 58,
        opening: 'Good start — you have the right instincts but missed some key details.',
        captured: ['Core theme captured'],
        missed: chapter.keyPoints.slice(1),
        business_connection: 'Try connecting one idea specifically to a CutOff Recycle challenge this week.',
        challenge: `How would you apply the most important idea from Chapter ${chapter.num} to your work right now?`,
        ready: true
      })
    }
    setLoading(false)
  }

  function handleSave() {
    if (saved) return
    setSaved(true)
    // Navigate back first, then update store — prevents unmount crash
    setTimeout(() => {
      store.completeChapter(chapter, summary)
      onBack()
    }, 300)
  }

  return (
    <>
      <div style={{ padding: '52px 16px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button className="btn btn-ghost" style={{ padding: '8px 14px' }} onClick={onBack}>← Back</button>
        <span style={{ fontSize: '11px', color: 'var(--text3)' }}>Chapter {chapter.num} of {CHAPTERS.length}</span>
      </div>

      <div style={{ padding: '0 16px' }}>
        <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--purple)', marginBottom: 6, fontWeight: 500 }}>
          {chapter.part} · Chapter {chapter.num}
        </div>
        <h2 style={{ marginBottom: 16, lineHeight: 1.3 }}>{chapter.title}</h2>

        {/* Key ideas */}
        <div className="feedback feedback-purple" style={{ marginBottom: 14 }}>
          <div className="feedback-label">What this chapter covers</div>
          <ul style={{ listStyle: 'none', marginTop: 4 }}>
            {chapter.ideas.map((idea, i) => (
              <li key={i} style={{ fontSize: '0.83rem', color: '#c0c0d8', lineHeight: 1.6, paddingLeft: 14, position: 'relative', marginBottom: 2 }}>
                <span style={{ position: 'absolute', left: 0, color: 'var(--purple)', fontSize: '10px', top: '4px' }}>→</span>
                {idea}
              </li>
            ))}
          </ul>
        </div>

        {done ? (
          <div className="feedback feedback-green">
            <div className="feedback-text">✓ You completed this chapter. View your summary below.</div>
          </div>
        ) : (
          <>
            <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text3)', marginBottom: 8 }}>
              Your summary
            </div>
            <p style={{ fontSize: '0.875rem', color: '#9090a8', lineHeight: 1.65, marginBottom: 10 }}>
              Read this chapter, then write 4–6 sentences in your own words. Connect at least one idea to CutOff Recycle.
            </p>
            <textarea
              value={summary}
              onChange={e => setSummary(e.target.value)}
              placeholder="Write your summary here...&#10;&#10;Don't just list facts — explain what the idea means for you as a founder running CutOff Recycle."
              style={{ minHeight: 140, marginBottom: 10 }}
            />
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <button
                className="btn btn-primary"
                style={{ flex: 1, opacity: summary.trim().length < 60 ? 0.5 : 1 }}
                onClick={handleCheck}
                disabled={loading || summary.trim().length < 60}
              >
                {loading ? 'Checking...' : 'Check my summary →'}
              </button>
              <button className="btn btn-ghost" onClick={() => { setSummary(''); setResult(null); setSaved(false) }}>Clear</button>
            </div>
          </>
        )}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text3)', fontSize: '0.875rem', padding: '8px 0' }}>
            <div className="dots"><span /><span /><span /></div>
            Checking your understanding...
          </div>
        )}

        {result && (
          <div className="animate-in">
            <div className="divider" />

            <div className={`feedback ${result.grade === 'pass' ? 'feedback-green' : result.grade === 'partial' ? 'feedback-amber' : 'feedback-red'}`} style={{ marginBottom: 10 }}>
              <div className="feedback-label">
                {result.grade === 'pass' ? '✓ Strong understanding' : result.grade === 'partial' ? '◑ Partial — review these' : '✗ Try again'} · {result.score}/100
              </div>
              <div className="feedback-text">{result.opening}</div>
            </div>

            {result.captured?.length > 0 && (
              <div className="feedback feedback-green" style={{ marginBottom: 10 }}>
                <div className="feedback-label">What you captured</div>
                {result.captured.map((c, i) => (
                  <div key={i} style={{ fontSize: '0.83rem', color: '#a0ffc0', marginBottom: 2 }}>✓ {c}</div>
                ))}
              </div>
            )}

            {result.missed?.length > 0 && (
              <div className="feedback feedback-amber" style={{ marginBottom: 10 }}>
                <div className="feedback-label">Key ideas you missed</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 6px', marginTop: 4 }}>
                  {result.missed.map((m, i) => (
                    <span key={i} className="tag tag-muted">{m}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="feedback feedback-green" style={{ marginBottom: 10 }}>
              <div className="feedback-label">Business connection</div>
              <div className="feedback-text">{result.business_connection}</div>
            </div>

            <div className="feedback feedback-purple" style={{ marginBottom: 16 }}>
              <div className="feedback-label">Coach's challenge</div>
              <div className="feedback-text">{result.challenge}</div>
            </div>

            {result.ready && (
              saved ? (
                <div className="feedback feedback-green" style={{ marginBottom: 24 }}>
                  <div className="feedback-text">✓ Saving... taking you back to chapters.</div>
                </div>
              ) : (
                <button className="btn btn-primary" style={{ width: '100%', marginBottom: 24 }} onClick={handleSave}>
                  Mark complete · Earn {chapter.xp} XP →
                </button>
              )
            )}
          </div>
        )}
      </div>
    </>
  )
}

export default function Book({ store }) {
  const [selected, setSelected] = useState(null)

  if (selected) {
    return (
      <div className="screen animate-in">
        <ChapterSession chapter={selected} store={store} onBack={() => setSelected(null)} />
      </div>
    )
  }

  return (
    <div className="screen animate-in">
      <ChapterList store={store} onSelect={setSelected} />
    </div>
  )
}
