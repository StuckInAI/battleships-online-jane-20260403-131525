export type CellState = 'water' | 'ship' | 'hit' | 'miss' | 'sunk'

export type Orientation = 'horizontal' | 'vertical'

export interface Ship {
  id: string
  name: string
  size: number
  cells: { row: number; col: number }[]
  hits: number
  sunk: boolean
}

export interface Cell {
  state: CellState
  shipId: string | null
}

export type Grid = Cell[][]

export interface PlacingShip {
  id: string
  name: string
  size: number
  orientation: Orientation
}

export type GamePhase = 'placement' | 'battle' | 'gameover'

export type Turn = 'player' | 'bot'

export interface GameState {
  phase: GamePhase
  turn: Turn
  playerGrid: Grid
  botGrid: Grid
  playerShips: Ship[]
  botShips: Ship[]
  currentPlacingIndex: number
  orientation: Orientation
  winner: Turn | null
  messages: string[]
}

export interface BotAI {
  mode: 'hunt' | 'target'
  lastHit: { row: number; col: number } | null
  targetQueue: { row: number; col: number }[]
  attacked: Set<string>
}

export const SHIPS_CONFIG: { id: string; name: string; size: number }[] = [
  { id: 'carrier', name: 'Carrier', size: 5 },
  { id: 'battleship', name: 'Battleship', size: 4 },
  { id: 'cruiser', name: 'Cruiser', size: 3 },
  { id: 'submarine', name: 'Submarine', size: 3 },
  { id: 'destroyer', name: 'Destroyer', size: 2 },
]

export const GRID_SIZE = 10
