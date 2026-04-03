import { Grid, Cell, Ship, Orientation, PlacingShip, GRID_SIZE, SHIPS_CONFIG, BotAI } from '@/types/game'

export function createEmptyGrid(): Grid {
  return Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, (): Cell => ({ state: 'water', shipId: null }))
  )
}

export function getShipCells(
  row: number,
  col: number,
  size: number,
  orientation: Orientation
): { row: number; col: number }[] {
  const cells: { row: number; col: number }[] = []
  for (let i = 0; i < size; i++) {
    if (orientation === 'horizontal') {
      cells.push({ row, col: col + i })
    } else {
      cells.push({ row: row + i, col })
    }
  }
  return cells
}

export function isValidPlacement(
  grid: Grid,
  row: number,
  col: number,
  size: number,
  orientation: Orientation
): boolean {
  const cells = getShipCells(row, col, size, orientation)

  for (const cell of cells) {
    // Out of bounds check
    if (cell.row < 0 || cell.row >= GRID_SIZE || cell.col < 0 || cell.col >= GRID_SIZE) {
      return false
    }
    // Cell already occupied
    if (grid[cell.row][cell.col].state !== 'water') {
      return false
    }
    // Check adjacent cells (ships cannot touch)
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue
        const nr = cell.row + dr
        const nc = cell.col + dc
        if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE) {
          if (grid[nr][nc].state === 'ship') {
            return false
          }
        }
      }
    }
  }
  return true
}

export function placeShipOnGrid(
  grid: Grid,
  ship: PlacingShip,
  row: number,
  col: number
): { grid: Grid; ship: Ship } {
  const newGrid = grid.map(r => r.map(c => ({ ...c })))
  const cells = getShipCells(row, col, ship.size, ship.orientation)

  for (const cell of cells) {
    newGrid[cell.row][cell.col] = { state: 'ship', shipId: ship.id }
  }

  const newShip: Ship = {
    id: ship.id,
    name: ship.name,
    size: ship.size,
    cells,
    hits: 0,
    sunk: false,
  }

  return { grid: newGrid, ship: newShip }
}

export function placeShipRandomly(
  grid: Grid,
  shipConfig: { id: string; name: string; size: number }
): { grid: Grid; ship: Ship } | null {
  const orientations: Orientation[] = ['horizontal', 'vertical']
  const maxAttempts = 200

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const orientation = orientations[Math.floor(Math.random() * 2)]
    const row = Math.floor(Math.random() * GRID_SIZE)
    const col = Math.floor(Math.random() * GRID_SIZE)

    if (isValidPlacement(grid, row, col, shipConfig.size, orientation)) {
      return placeShipOnGrid(
        grid,
        { ...shipConfig, orientation },
        row,
        col
      )
    }
  }
  return null
}

export function generateBotFleet(): { grid: Grid; ships: Ship[] } {
  let grid = createEmptyGrid()
  const ships: Ship[] = []

  for (const shipConfig of SHIPS_CONFIG) {
    const result = placeShipRandomly(grid, shipConfig)
    if (result) {
      grid = result.grid
      ships.push(result.ship)
    }
  }

  return { grid, ships }
}

export function processAttack(
  grid: Grid,
  ships: Ship[],
  row: number,
  col: number
): { grid: Grid; ships: Ship[]; result: 'hit' | 'miss' | 'sunk'; sunkShip?: Ship } {
  const newGrid = grid.map(r => r.map(c => ({ ...c })))
  const cell = newGrid[row][col]

  if (cell.state === 'ship') {
    const newShips = ships.map(s => ({ ...s, cells: [...s.cells], hits: s.hits }))
    const shipIndex = newShips.findIndex(s => s.id === cell.shipId)

    if (shipIndex === -1) {
      newGrid[row][col] = { ...cell, state: 'hit' }
      return { grid: newGrid, ships: newShips, result: 'hit' }
    }

    newShips[shipIndex] = { ...newShips[shipIndex], hits: newShips[shipIndex].hits + 1 }

    if (newShips[shipIndex].hits >= newShips[shipIndex].size) {
      newShips[shipIndex] = { ...newShips[shipIndex], sunk: true }
      // Mark all cells of sunk ship
      for (const shipCell of newShips[shipIndex].cells) {
        newGrid[shipCell.row][shipCell.col] = { ...newGrid[shipCell.row][shipCell.col], state: 'sunk' }
      }
      return { grid: newGrid, ships: newShips, result: 'sunk', sunkShip: newShips[shipIndex] }
    }

    newGrid[row][col] = { ...cell, state: 'hit' }
    return { grid: newGrid, ships: newShips, result: 'hit' }
  } else {
    newGrid[row][col] = { ...cell, state: 'miss' }
    return { grid: newGrid, ships, result: 'miss' }
  }
}

export function checkWin(ships: Ship[]): boolean {
  return ships.every(s => s.sunk)
}

export function createBotAI(): BotAI {
  return {
    mode: 'hunt',
    lastHit: null,
    targetQueue: [],
    attacked: new Set<string>(),
  }
}

export function getBotMove(
  botAI: BotAI,
  grid: Grid
): { row: number; col: number; newBotAI: BotAI } {
  const newBotAI: BotAI = {
    ...botAI,
    targetQueue: [...botAI.targetQueue],
    attacked: new Set(botAI.attacked),
  }

  let row: number
  let col: number

  if (newBotAI.mode === 'target' && newBotAI.targetQueue.length > 0) {
    // Pop from target queue, skip already attacked cells
    let found = false
    while (newBotAI.targetQueue.length > 0) {
      const next = newBotAI.targetQueue.shift()!
      const key = `${next.row},${next.col}`
      if (!newBotAI.attacked.has(key)) {
        row = next.row
        col = next.col
        found = true
        break
      }
    }
    if (!found) {
      newBotAI.mode = 'hunt'
      newBotAI.lastHit = null
      // Fall through to hunt mode
      const move = huntMove(newBotAI)
      row = move.row
      col = move.col
    } else {
      // row and col are set above
    }
  } else {
    newBotAI.mode = 'hunt'
    const move = huntMove(newBotAI)
    row = move.row
    col = move.col
  }

  const key = `${row!},${col!}`
  newBotAI.attacked.add(key)

  return { row: row!, col: col!, newBotAI }
}

function huntMove(botAI: BotAI): { row: number; col: number } {
  const available: { row: number; col: number }[] = []
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (!botAI.attacked.has(`${r},${c}`)) {
        available.push({ row: r, col: c })
      }
    }
  }
  if (available.length === 0) {
    return { row: 0, col: 0 }
  }
  return available[Math.floor(Math.random() * available.length)]
}

export function updateBotAIAfterHit(
  botAI: BotAI,
  row: number,
  col: number,
  sunk: boolean
): BotAI {
  const newBotAI: BotAI = {
    ...botAI,
    targetQueue: [...botAI.targetQueue],
    attacked: new Set(botAI.attacked),
  }

  if (sunk) {
    // Ship sunk, go back to hunt mode
    newBotAI.mode = 'hunt'
    newBotAI.lastHit = null
    newBotAI.targetQueue = []
  } else {
    // Hit but not sunk, switch to target mode
    newBotAI.mode = 'target'
    newBotAI.lastHit = { row, col }

    // Add adjacent cells to target queue
    const adjacents = [
      { row: row - 1, col },
      { row: row + 1, col },
      { row, col: col - 1 },
      { row, col: col + 1 },
    ]

    for (const adj of adjacents) {
      if (
        adj.row >= 0 &&
        adj.row < GRID_SIZE &&
        adj.col >= 0 &&
        adj.col < GRID_SIZE &&
        !newBotAI.attacked.has(`${adj.row},${adj.col}`)
      ) {
        // Avoid duplicate targets
        const alreadyQueued = newBotAI.targetQueue.some(
          t => t.row === adj.row && t.col === adj.col
        )
        if (!alreadyQueued) {
          newBotAI.targetQueue.push(adj)
        }
      }
    }
  }

  return newBotAI
}
