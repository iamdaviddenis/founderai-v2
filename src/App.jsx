import React, { useState, useCallback } from 'react'
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

export default function App() {
  const [ready, setReady] = useState(false)
  const [screen, setScreen] = useState('home')
  const [activeMission, setActiveMission] = useState(() => MISSIONS.find(m => true))
  const store = useStore()

  const handleSetScreen = useCallback((s) => {
    setScreen(s)
    window.scrollTo(0, 0)
  }, [])

  // Update active mission to first undone one whenever missions screen is visited
  const handleNav = useCallback((s) => {
    if (s === 'lab') {
      const nextUndone = MISSIONS.find(m => !store.isMissionDone(m.id))
      if (nextUndone) setActiveMission(nextUndone)
    }
    handleSetScreen(s)
  }, [handleSetScreen, store])

  return (
    <>
      {!ready && <Splash onDone={() => setReady(true)} />}

      {ready && (
        <>
          {screen === 'home' && (
            <Home
              store={store}
              setScreen={handleSetScreen}
            />
          )}
          {screen === 'missions' && (
            <Missions
              store={store}
              setScreen={handleSetScreen}
              setActiveMission={(m) => {
                setActiveMission(m)
                handleSetScreen('lab')
              }}
            />
          )}
          {screen === 'lab' && (
            <PromptLab
              store={store}
              activeMission={activeMission}
            />
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

          <Nav active={screen} setScreen={handleNav} />
        </>
      )}
    </>
  )
}
