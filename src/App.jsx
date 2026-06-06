import { useState } from 'react'
import ThreeScene from './components/ThreeScene'
import { useCharacterStore } from './store/useCharacterStore'
import GameUI from './components/GameUI';


function App() {
  const goalReached = useCharacterStore((s) => s.goalReached);

  return (
    <>
      {/* <h1>Hello, React3D</h1>
      <p>Goal reached: {goalReached ? 'Yes' : 'No'}</p> */}
      <ThreeScene />
      <GameUI />
    </>
  )
}

export default App
