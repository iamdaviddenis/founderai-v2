import React, { useState, useCallback, Component } from 'react'
import { useStore } from './store'
import Nav from './components/Nav'
import Splash from './components/Splash'
import Home from './screens/Home'
import Missions from './screens/Missions'
import PromptLab from './screens/PromptLab'
import Book from './screens/Book'
import Coach from './screens/Coach'
import Progress from './screens/Progress'
import { MISSIONS } from './data/missions'

class ErrorBoundary extends Component {
  state = { error: null }
  static getDerivedStateFromError(e) { return { error: e } }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: '60px 24px', color: '#9090a8', fontFamily: 'sans-serif' }}>
          <div style={{ fontSize: '1.1rem', color: '#eeeef5', marginBottom: 8 }}>Something went wrong</div>
          <div style={{ fontSize: '0.85rem', marginBottom: 20 }}>{this.state.error.message}</div>
          <button
            onClick={() => this.setState({ error: null })}
            style={{ background: '#6effc0', color: '#040d08', border: 'none', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontWeight: 700 }}
          >
            Try again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

export default function App() {
  const [ready, setReady] = useState(false)
  const [screen, setScreen] = useState('home')
  const [activeMissionId, setActiveMissionId] = useState(MISSIONS[0].id)
  const store = useStore()

  const goTo = useCallback((s) => {
    setScreen(s)
    window.scrollTo(0, 0)
  }, [])

  const handleNav = useCallback((s) => {
    if (s === 'lab') {
      // Always pick the latest first-undone mission at nav time
      const nextUndone = MISSIONS.find(m => !store.isMissionDone(m.id))
      if (nextUndone) setActiveMissionId(nextUndone.id)
    }
    goTo(s)
  }, [goTo, store.isMissionDone])

  const activeMission = MISSIONS.find(m => m.id === activeMissionId) || MISSIONS[0]

  return (
    <>
      {!ready && <Splash onDone={() => setReady(true)} />}

      {ready && (
        <>
          <ErrorBoundary key={screen}>
            {screen === 'home' && (
              <Home store={store} setScreen={goTo} />
            )}
            {screen === 'missions' && (
              <Missions
                store={store}
                setScreen={goTo}
                setActiveMission={(m) => {
                  setActiveMissionId(m.id)
                  goTo('lab')
                }}
              />
            )}
            {screen === 'lab' && (
              <PromptLab store={store} activeMission={activeMission} />
            )}
            {screen === 'book' && (
              <Book store={store} />
            )}
            {screen === 'coach' && (
              <Coach store={store} />
            )}
            {screen === 'progress' && (
              <Progress store={store} />
            )}
          </ErrorBoundary>

          <Nav active={screen} setScreen={handleNav} />
        </>
      )}
    </>
  )
}
