'use client'

import { useMemo } from 'react'
import { Grid, PlacingShip, Orientation, GamePhase, Turn, GRID_SIZE } from '@/types/game'
import { getShipCells, isValidPlacement } from '@/lib/gameLogic'

interface GameGridProps {
  grid: Grid
  isPlayerGrid: boolean
  phase: GamePhase
  currentPlacingShip: PlacingShip | null
  orientation: Orientation
  hoverCell: { row: number; col: number } | null
  onHover: (cell: { row: number; col: number } | null) => void
  onClick: (row: number, col: number) => void
  turn: Turn
  isBotThinking: boolean
  lastAttacked?: { row: number; col: number } | null
}

const COL_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']

export default function GameGrid({
  grid,
  isPlayerGrid,
  phase,
  currentPlacingShip,
  hoverCell,
  onHover,
  onClick,
  turn,
  isBotThinking,
  lastAttacked,
}: GameGridProps) {
  const previewCells = useMemo(() => {
    if (!isPlayerGrid || !currentPlacingShip || !hoverCell || phase !== 'placement') return null
    const cells = getShipCells(hoverCell.row, hoverCell.col, currentPlacingShip.size, currentPlacingShip.orientation)
    const valid = isValidPlacement(grid, hoverCell.row, hoverCell.col, currentPlacingShip.size, currentPlacingShip.orientation)
    return { cells, valid }
  }, [isPlayerGrid, currentPlacingShip, hoverCell, grid, phase])

  const previewSet = useMemo(() => {
    if (!previewCells) return new Set<string>()
    return new Set(previewCells.cells.map(c => `${c.row},${c.col}`))
  }, [previewCells])

  const canAttack = !isPlayerGrid && phase === 'battle' && turn === 'player' && !isBotThinking

  function getCellClass(row: number, col: number): string {
    const cell = grid[row][col]
    const key = `${row},${col}`
    const isLastAttacked = lastAttacked?.row === row && lastAttacked?.col === col

    let classes = 'grid-cell '

    // Preview mode
    if (previewSet.has(key)) {
      classes += previewCells?.valid ? 'preview-valid' : 'preview-invalid'
      return classes
    }

    // Cell state
    switch (cell.state) {
      case 'water':
        classes += 'water'
        if (canAttack) classes += ' hover:bg-retro-hover hover:border-retro-green cursor-crosshair'
        break
      case 'ship':
        if (isPlayerGrid) {
          classes += 'ship'
        } else {
          // Hide enemy ships
          classes += 'water'
          if (canAttack) classes += ' hover:bg-retro-hover hover:border-retro-green cursor-crosshair'
        }
        break
      case 'hit':
        classes += 'hit hit-marker'
        if (isLastAttacked) classes += ' explode'
        break
      case 'miss':
        classes += 'miss miss-marker'
        break
      case 'sunk':
        classes += 'sunk hit-marker'
        break
    }

    return classes
  }

  function getCellContent(row: number, col: number): string {
    const cell = grid[row][col]
    const key = `${row},${col}`
    if (previewSet.has(key)) return ''
    switch (cell.state) {
      case 'hit': return '✕'
      case 'sunk': return '✕'
      case 'miss': return '·'
      default: return ''
    }
  }

  return (
    <div className="select-none">
      {/* Column labels */}
      <div className="flex ml-8">
        {COL_LABELS.map(label => (
          <div
            key={label}
            className="text-green-700 text-xs flex items-center justify-center"
            style={{ width: 36, height: 16 }}
          >
            {label}
          </div>
        ))}
      </div>

      {/* Grid rows */}
      {Array.from({ length: GRID_SIZE }, (_, row) => (
        <div key={row} className="flex">
          {/* Row label */}
          <div
            className="text-green-700 text-xs flex items-center justify-center"
            style={{ width: 28, height: 36 }}
          >
            {row + 1}
          </div>

          {/* Cells */}
          {Array.from({ length: GRID_SIZE }, (_, col) => (
            <div
              key={col}
              className={getCellClass(row, col)}
              onMouseEnter={() => isPlayerGrid && phase === 'placement' ? onHover({ row, col }) : undefined}
              onMouseLeave={() => isPlayerGrid && phase === 'placement' ? onHover(null) : undefined}
              onClick={() => onClick(row, col)}
            >
              {getCellContent(row, col) && (
                <span
                  className={`
                    ${grid[row][col].state === 'hit' || grid[row][col].state === 'sunk'
                      ? 'text-retro-hit'
                      : 'text-blue-400'
                    }
                    ${grid[row][col].state === 'sunk' ? 'glow-text-red' : ''}
                    text-base font-bold leading-none
                  `}
                >
                  {getCellContent(row, col)}
                </span>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
