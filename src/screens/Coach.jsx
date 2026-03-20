import React, { useState, useRef, useEffect } from 'react'

const SYSTEM = `You are an AI coach for David Denis Hariohay, CEO and Founder of CutOff Recycle Limited — a Tanzanian agri-tech startup that recycles human hair waste into organic fertilizers. Products: Rutubisha (solid organic fertilizer/growing medium), Vuna (amino acid-rich liquid foliar fertilizer), McheKuza (Tokyo 8 biofertilizer). Team of 6, based at SIDO Arusha. Patent holder (TZ/P/2024/000036; PCT/IB2026/050342). EAN Fellow.

David is actively learning AI to improve his business. He's currently at "Operator" level moving toward "Builder". His tech stack: Jira, Slack, KoboToolbox, cr-assistant (internal AI tool he built).

Your role:
- Teach AI concepts by connecting them to CutOff Recycle's real challenges
- Give feedback on prompts, suggest improvements, challenge his thinking  
- Keep answers short, practical, founder-focused — no academic theory
- Be direct and confident. You know his business.

Respond in 2–4 short paragraphs max. Use plain language.`

export default function Coach({ store }) {
  const [messages, setMessages] = useState(() => [
    { role: 'coach', text: "Hey David — I know your business and your stack. Ask me anything about AI, prompting, or how to build better systems for CutOff Recycle." },
    { role: 'coach', text: "Working on a mission? Paste your prompt and I'll help you improve it. Stuck on a chapter? Ask me to explain it in plain terms." },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function send() {
    const text = input.trim()
    if (!text || loading) return
    setInput('')

    const userMsg = { role: 'user', text }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setLoading(true)

    // Build API history (only user+assistant roles)
    const history = newMessages
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text }))

    // Add current user message
    const apiMessages = [
      ...messages.filter(m => m.role !== 'coach').map(m => ({ role: 'user', content: m.text })),
      { role: 'user', content: text }
    ]

    try {
      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 800,
          system: SYSTEM,
          messages: buildHistory([...messages, userMsg])
        })
      })
      const data = await res.json()
      const reply = data.content.map(b => b.text || '').join('').trim()
      setMessages(prev => [...prev, { role: 'coach', text: reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'coach', text: "Having a connection issue. Try again in a moment." }])
    }
    setLoading(false)
  }

  function buildHistory(msgs) {
    // Convert to alternating user/assistant pairs for the API
    const result = []
    for (const m of msgs) {
      if (m.role === 'user') result.push({ role: 'user', content: m.text })
      else if (m.role === 'coach' || m.role === 'assistant') result.push({ role: 'assistant', content: m.text })
    }
    // Ensure starts with user
    while (result.length > 0 && result[0].role === 'assistant') result.shift()
    return result.slice(-20) // keep last 20 turns
  }

  return (
    <div className="screen" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div className="page-header" style={{ paddingBottom: 10 }}>
        <div className="page-eyebrow">Always on · Context-aware</div>
        <h1>AI Coach</h1>
      </div>

      {/* Coach identity */}
      <div style={{ padding: '0 16px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--accent-dim)', border: '1px solid var(--accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🤖</div>
        <div>
          <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>Coach AI</div>
          <div style={{ fontSize: '11px', color: 'var(--accent)' }}>● online · knows CutOff Recycle</div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, padding: '0 16px', paddingBottom: 8, overflowY: 'auto' }}>
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: 10, display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            {m.role !== 'user' && <div style={{ fontSize: '10px', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 4, paddingLeft: 2 }}>Coach AI</div>}
            <div className={`bubble ${m.role === 'user' ? 'bubble-user' : 'bubble-coach'}`}>{m.text}</div>
          </div>
        ))}
        {loading && (
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: '10px', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 4, paddingLeft: 2 }}>Coach AI</div>
            <div className="bubble bubble-coach"><div className="dots"><span /><span /><span /></div></div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input — sticky at bottom above nav */}
      <div style={{ padding: '10px 16px 16px', borderTop: '1px solid var(--border)', background: 'rgba(8,8,16,0.95)', backdropFilter: 'blur(10px)' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="Ask anything about AI..."
            style={{ flex: 1, padding: '11px 14px' }}
          />
          <button
            onClick={send}
            disabled={!input.trim() || loading}
            style={{ background: 'var(--accent)', border: 'none', borderRadius: 10, width: 46, height: 46, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: !input.trim() || loading ? 0.4 : 1, flexShrink: 0 }}
          >
            <svg width="18" height="18" fill="none" stroke="#040d08" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M2 2l14 7-14 7V2z"/></svg>
          </button>
        </div>
      </div>
    </div>
  )
}
