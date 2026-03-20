import React, { useEffect, useState } from 'react'

export default function Splash({ onDone }) {
  const [hiding, setHiding] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => {
      setHiding(true)
      setTimeout(onDone, 500)
    }, 1400)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div className={`splash${hiding ? ' hide' : ''}`}>
      <div className="splash-ring" />
      <div className="splash-logo">Founder<span>AI</span></div>
      <div className="splash-sub">Your daily AI mastery app</div>
    </div>
  )
}
