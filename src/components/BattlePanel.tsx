'use client'

import { Ship } from '@/types/game'
import { SHIPS_CONFIG } from '@/types/game'

interface BattlePanelProps {
  playerShips: Ship[]
  botShips: Ship[]
  turn: 'player' | 'bot'
  isBotThinking: boolean
  onRestart: () => void
}

export default function BattlePanel({
  playerShips,
  botShips,
  turn,
  isBotThinking,
  onRestart,
}: BattlePanelProps) {
  const playerAlive = playerShips.filter(s => !s.sunk).length
  const botAlive = botShips.filter(s => !s.sunk).length

  return (
    <div className="retro-panel p-3">
      <h3 className="text-retro-green text-sm font-bold tracking-wider mb-3">
        [ COMBAT STATUS ]
      </h3>

      {/* Status indicator */}
      <div
        className={`text-center p-2 mb-3 border text-sm font-bold tracking-widest ${
          isBotThinking
            ? 'border-retro-hit text-retro-hit animate-blink'
            : turn === 'player'
            ? 'border-retro-green text-retro-green'
            : 'border-retro-hit text-retro-hit'
        }`}
      >
        {isBotThinking
          ? '⚡ ENEMY TARGETING...'
          : turn === 'player'
          ? '⊕ YOUR TURN — FIRE!'
          : '⚡ ENEMY TURN'}
      </div>

      {/* Fleet status */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="border border-retro-border p-2">
          <p className="text-green-600 text-xs mb-1">YOUR FLEET</p>
          <p className="text-retro-green font-bold text-lg">{playerAlive}</p>
          <p className="text-green-700 text-xs">ships remaining</p>
        </div>
        <div className="border border-red-900 p-2">
          <p className="text-red-800 text-xs mb-1">ENEMY FLEET</p>
          <p className="text-retro-hit font-bold text-lg">{botAlive}</p>
          <p className="text-red-900 text-xs">ships remaining</p>
        </div>
      </div>

      {/* Ship status list */}
      <div className="space-y-1 mb-3">
        <p className="text-green-700 text-xs mb-1">YOUR SHIPS:</p>
        {SHIPS_CONFIG.map(config => {
          const ship = playerShips.find(s => s.id === config.id)
          if (!ship) return null
          return (
            <div key={ship.id} className="flex items-center justify-between text-xs">
              <span className={ship.sunk ? 'text-red-800 line-through' : 'text-green-600'}>
                {ship.name}
              </span>
              <div className="flex gap-0.5">
                {Array.from({ length: ship.size }, (_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 border ${
                      ship.sunk
                        ? 'bg-red-900 border-red-800'
                        : i < ship.hits
                        ? 'bg-retro-hit border-red-600'
                        : 'bg-retro-ship border-green-700'
                    }`}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <button
        onClick={onRestart}
        className="retro-btn retro-btn-red text-xs py-1.5 w-full"
      >
        ABORT MISSION
      </button>
    </div>
  )
}
