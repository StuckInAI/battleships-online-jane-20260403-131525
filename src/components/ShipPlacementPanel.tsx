'use client'

import { Orientation } from '@/types/game'

interface ShipConfig {
  id: string
  name: string
  size: number
}

interface ShipPlacementPanelProps {
  ships: ShipConfig[]
  currentIndex: number
  orientation: Orientation
  onToggleOrientation: () => void
  onRandomPlace: () => void
}

export default function ShipPlacementPanel({
  ships,
  currentIndex,
  orientation,
  onToggleOrientation,
  onRandomPlace,
}: ShipPlacementPanelProps) {
  return (
    <div className="retro-panel p-3">
      <h3 className="text-retro-green text-sm font-bold tracking-wider mb-3">
        [ FLEET DEPLOYMENT ]
      </h3>

      {/* Ship list */}
      <div className="space-y-1 mb-4">
        {ships.map((ship, index) => {
          const isPlaced = index < currentIndex
          const isCurrent = index === currentIndex
          return (
            <div
              key={ship.id}
              className={`flex items-center justify-between text-sm p-1.5 border ${
                isPlaced
                  ? 'border-green-900 text-green-800'
                  : isCurrent
                  ? 'border-retro-green text-retro-green bg-retro-hover'
                  : 'border-retro-border text-green-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={isPlaced ? 'text-green-800' : isCurrent ? 'text-retro-green' : 'text-green-800'}>
                  {isPlaced ? '✓' : isCurrent ? '►' : '○'}
                </span>
                <span className="tracking-wider">{ship.name}</span>
              </div>
              <div className="flex gap-0.5">
                {Array.from({ length: ship.size }, (_, i) => (
                  <div
                    key={i}
                    className={`w-4 h-4 border ${
                      isPlaced
                        ? 'bg-green-900 border-green-800'
                        : isCurrent
                        ? 'bg-retro-ship border-retro-green'
                        : 'bg-transparent border-green-900'
                    }`}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Current ship info */}
      {currentIndex < ships.length && (
        <div className="border border-retro-border p-2 mb-3 text-xs">
          <p className="text-green-600 mb-1">DEPLOYING:</p>
          <p className="text-retro-green font-bold">
            {ships[currentIndex].name} ({ships[currentIndex].size} cells)
          </p>
          <p className="text-green-600 mt-1">
            ORIENTATION:{' '}
            <span className="text-retro-green">
              {orientation === 'horizontal' ? '→ HORIZONTAL' : '↓ VERTICAL'}
            </span>
          </p>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col gap-2">
        <button
          onClick={onToggleOrientation}
          className="retro-btn text-xs py-2"
          disabled={currentIndex >= ships.length}
        >
          [R] ROTATE SHIP
        </button>
        <button
          onClick={onRandomPlace}
          className="retro-btn text-xs py-2"
        >
          AUTO-DEPLOY FLEET
        </button>
      </div>

      <p className="text-green-800 text-xs mt-3 text-center">
        Click grid to place • [R] to rotate
      </p>
    </div>
  )
}
