import React from 'react'

const tabs = [
  { id: 'home', label: 'Home', icon: (
    <svg fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/>
    </svg>
  )},
  { id: 'missions', label: 'Missions', icon: (
    <svg fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  )},
  { id: 'lab', label: 'Lab', icon: (
    <svg fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
    </svg>
  )},
  { id: 'book', label: 'Book', icon: (
    <svg fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
    </svg>
  )},
  { id: 'coach', label: 'Coach', icon: (
    <svg fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
    </svg>
  )},
  { id: 'progress', label: 'XP', icon: (
    <svg fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  )},
]

export default function Nav({ active, setScreen }) {
  return (
    <nav className="nav">
      {tabs.map(t => (
        <button
          key={t.id}
          className={`nav-item${active === t.id ? ' active' : ''}`}
          onClick={() => setScreen(t.id)}
        >
          {t.icon}
          {t.label}
        </button>
      ))}
    </nav>
  )
}
