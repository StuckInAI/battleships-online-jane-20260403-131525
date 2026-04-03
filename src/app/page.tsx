'use client'

import { useState } from 'react'
import BattleshipGame from '@/components/BattleshipGame'

export default function Home() {
  const [gameStarted, setGameStarted] = useState(false)

  if (!gameStarted) {
    return <TitleScreen onStart={() => setGameStarted(true)} />
  }

  return <BattleshipGame />
}

function TitleScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-retro-dark p-4">
      <div className="text-center max-w-2xl">
        {/* ASCII Art Title */}
        <pre className="text-retro-green glow-text text-xs sm:text-sm leading-tight mb-8 select-none">
{`
 ██████╗  █████╗ ████████╗████████╗██╗     ███████╗███████╗██╗  ██╗██╗██████╗ 
 ██╔══██╗██╔══██╗╚══██╔══╝╚══██╔══╝██║     ██╔════╝██╔════╝██║  ██║██║██╔══██╗
 ██████╔╝███████║   ██║      ██║   ██║     █████╗  ███████╗███████║██║██████╔╝
 ██╔══██╗██╔══██║   ██║      ██║   ██║     ██╔══╝  ╚════██║██╔══██║██║██╔═══╝ 
 ██████╔╝██║  ██║   ██║      ██║   ███████╗███████╗███████║██║  ██║██║██║     
 ╚═════╝ ╚═╝  ╚═╝   ╚═╝      ╚═╝   ╚══════╝╚══════╝╚══════╝╚═╝  ╚═╝╚═╝╚═╝     
`}
        </pre>

        <div className="retro-panel p-6 mb-8">
          <p className="text-retro-green text-lg mb-2 glow-text tracking-widest">// NAVAL COMBAT SIMULATOR //</p>
          <p className="text-green-600 text-sm mb-4 tracking-wider">VERSION 1.0 — CLASSIFIED</p>
          
          <div className="text-left text-sm text-green-400 space-y-2 mb-6 border border-retro-border p-4">
            <p className="text-retro-green font-bold mb-3">[ MISSION BRIEFING ]</p>
            <p>► Place your fleet on the grid</p>
            <p>► Rotate ships with [R] key or button</p>
            <p>► Attack enemy waters to sink their fleet</p>
            <p>► First to sink all enemy ships wins</p>
            <p className="mt-3 text-yellow-400">► WARNING: Enemy AI is hunting you</p>
          </div>

          <div className="text-left text-sm text-green-600 space-y-1 mb-6">
            <p className="text-retro-green font-bold mb-2">[ FLEET MANIFEST ]</p>
            <p>▸ Carrier .......... 5 cells</p>
            <p>▸ Battleship ....... 4 cells</p>
            <p>▸ Cruiser .......... 3 cells</p>
            <p>▸ Submarine ........ 3 cells</p>
            <p>▸ Destroyer ........ 2 cells</p>
          </div>
        </div>

        <button
          onClick={onStart}
          className="retro-btn text-xl px-12 py-4 tracking-widest animate-pulse-green"
        >
          [ ENGAGE ]
        </button>

        <p className="text-green-800 text-xs mt-6 tracking-widest animate-blink">
          PRESS TO INITIALIZE COMBAT SYSTEMS
        </p>
      </div>
    </div>
  )
}
