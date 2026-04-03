'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import {
  GameState,
  GamePhase,
  Grid,
  Ship,
  PlacingShip,
  Orientation,
  BotAI,
  SHIPS_CONFIG,
  GRID_SIZE,
} from '@/types/game'
import {
  createEmptyGrid,
  isValidPlacement,
  placeShipOnGrid,
  generateBotFleet,
  processAttack,
  checkWin,
  createBotAI,
  getBotMove,
  updateBotAIAfterHit,
  placeShipRandomly,
} from '@/lib/gameLogic'
import GameGrid from './GameGrid'
import ShipPlacementPanel from './ShipPlacementPanel'
import BattlePanel from './BattlePanel'
import MessageLog from './MessageLog'

export default function BattleshipGame() {
  const [gameState, setGameState] = useState<GameState>(initGameState())
  const [botAI, setBotAI] = useState<BotAI>(createBotAI())
  const [hoverCell, setHoverCell] = useState<{ row: number; col: number } | null>(null)
  const [isBotThinking, setIsBotThinking] = useState(false)
  const [lastAttacked, setLastAttacked] = useState<{ row: number; col: number } | null>(null)
  const botTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function initGameState(): GameState {
    return {
      phase: 'placement',
      turn: 'player',
      playerGrid: createEmptyGrid(),
      botGrid: createEmptyGrid(),
      playerShips: [],
      botShips: [],
      currentPlacingIndex: 0,
      orientation: 'horizontal',
      winner: null,
      messages: ['[ SYSTEM ] Naval combat initialized. Place your fleet, Commander.'],
    }
  }

  const addMessage = useCallback((msg: string) => {
    setGameState(prev => ({
      ...prev,
      messages: [msg, ...prev.messages].slice(0, 20),
    }))
  }, [])

  // Handle keyboard rotation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') {
        if (gameState.phase === 'placement') {
          toggleOrientation()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gameState.phase])

  const toggleOrientation = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      orientation: prev.orientation === 'horizontal' ? 'vertical' : 'horizontal',
    }))
  }, [])

  const currentPlacingShip: PlacingShip | null =
    gameState.phase === 'placement' && gameState.currentPlacingIndex < SHIPS_CONFIG.length
      ? {
          ...SHIPS_CONFIG[gameState.currentPlacingIndex],
          orientation: gameState.orientation,
        }
      : null

  const handlePlacementClick = useCallback(
    (row: number, col: number) => {
      if (gameState.phase !== 'placement' || !currentPlacingShip) return

      if (!isValidPlacement(gameState.playerGrid, row, col, currentPlacingShip.size, currentPlacingShip.orientation)) {
        addMessage(`[ ERROR ] Invalid placement for ${currentPlacingShip.name}. Try another position.`)
        return
      }

      const { grid: newGrid, ship: newShip } = placeShipOnGrid(
        gameState.playerGrid,
        currentPlacingShip,
        row,
        col
      )

      const nextIndex = gameState.currentPlacingIndex + 1
      const allPlaced = nextIndex >= SHIPS_CONFIG.length

      addMessage(`[ FLEET ] ${currentPlacingShip.name} deployed at (${String.fromCharCode(65 + col)}${row + 1}).`)

      if (allPlaced) {
        // Generate bot fleet and start battle
        const { grid: botGrid, ships: botShips } = generateBotFleet()
        setGameState(prev => ({
          ...prev,
          phase: 'battle',
          playerGrid: newGrid,
          playerShips: [...prev.playerShips, newShip],
          botGrid,
          botShips,
          currentPlacingIndex: nextIndex,
          messages: [
            '[ BATTLE ] All ships deployed! Combat initiated. Fire at will, Commander!',
            ...prev.messages,
          ].slice(0, 20),
        }))
      } else {
        setGameState(prev => ({
          ...prev,
          playerGrid: newGrid,
          playerShips: [...prev.playerShips, newShip],
          currentPlacingIndex: nextIndex,
        }))
      }
    },
    [gameState, currentPlacingShip, addMessage]
  )

  const handleAttack = useCallback(
    (row: number, col: number) => {
      if (gameState.phase !== 'battle' || gameState.turn !== 'player' || isBotThinking) return

      const cell = gameState.botGrid[row][col]
      if (cell.state !== 'water' && cell.state !== 'ship') {
        addMessage('[ ERROR ] Already attacked that position.')
        return
      }

      setLastAttacked({ row, col })

      const { grid: newBotGrid, ships: newBotShips, result, sunkShip } = processAttack(
        gameState.botGrid,
        gameState.botShips,
        row,
        col
      )

      const coord = `(${String.fromCharCode(65 + col)}${row + 1})`

      let message = ''
      if (result === 'sunk') {
        message = `[ HIT ] Direct hit! Enemy ${sunkShip!.name} SUNK at ${coord}!`
      } else if (result === 'hit') {
        message = `[ HIT ] Enemy ship hit at ${coord}!`
      } else {
        message = `[ MISS ] No contact at ${coord}.`
      }

      const playerWon = checkWin(newBotShips)

      if (playerWon) {
        setGameState(prev => ({
          ...prev,
          botGrid: newBotGrid,
          botShips: newBotShips,
          phase: 'gameover',
          winner: 'player',
          messages: [
            '[ VICTORY ] All enemy ships destroyed! Mission accomplished, Commander!',
            message,
            ...prev.messages,
          ].slice(0, 20),
        }))
        return
      }

      setGameState(prev => ({
        ...prev,
        botGrid: newBotGrid,
        botShips: newBotShips,
        turn: 'bot',
        messages: [message, ...prev.messages].slice(0, 20),
      }))

      // Trigger bot move after delay
      setIsBotThinking(true)
    },
    [gameState, isBotThinking, addMessage]
  )

  // Bot thinking effect
  useEffect(() => {
    if (!isBotThinking || gameState.turn !== 'bot' || gameState.phase !== 'battle') return

    if (botTimerRef.current) clearTimeout(botTimerRef.current)

    botTimerRef.current = setTimeout(() => {
      const { row, col, newBotAI } = getBotMove(botAI, gameState.playerGrid)

      const { grid: newPlayerGrid, ships: newPlayerShips, result, sunkShip } = processAttack(
        gameState.playerGrid,
        gameState.playerShips,
        row,
        col
      )

      const coord = `(${String.fromCharCode(65 + col)}${row + 1})`
      let message = ''
      let updatedBotAI = newBotAI

      if (result === 'sunk') {
        message = `[ ENEMY ] Enemy destroyed your ${sunkShip!.name} at ${coord}!`
        updatedBotAI = updateBotAIAfterHit(newBotAI, row, col, true)
      } else if (result === 'hit') {
        message = `[ ENEMY ] Your ship was hit at ${coord}!`
        updatedBotAI = updateBotAIAfterHit(newBotAI, row, col, false)
      } else {
        message = `[ ENEMY ] Enemy missed at ${coord}.`
      }

      const botWon = checkWin(newPlayerShips)

      setBotAI(updatedBotAI)

      if (botWon) {
        setGameState(prev => ({
          ...prev,
          playerGrid: newPlayerGrid,
          playerShips: newPlayerShips,
          phase: 'gameover',
          winner: 'bot',
          messages: [
            '[ DEFEAT ] All your ships have been destroyed. Mission failed.',
            message,
            ...prev.messages,
          ].slice(0, 20),
        }))
      } else {
        setGameState(prev => ({
          ...prev,
          playerGrid: newPlayerGrid,
          playerShips: newPlayerShips,
          turn: 'player',
          messages: [message, ...prev.messages].slice(0, 20),
        }))
      }

      setIsBotThinking(false)
    }, 1000 + Math.random() * 500)

    return () => {
      if (botTimerRef.current) clearTimeout(botTimerRef.current)
    }
  }, [isBotThinking, gameState.turn, gameState.phase])

  const handleRandomPlacement = useCallback(() => {
    let grid = createEmptyGrid()
    const ships: Ship[] = []
    let valid = true

    for (const shipConfig of SHIPS_CONFIG) {
      const result = placeShipRandomly(grid, shipConfig)
      if (!result) {
        valid = false
        break
      }
      grid = result.grid
      ships.push(result.ship)
    }

    if (valid) {
      const { grid: botGrid, ships: botShips } = generateBotFleet()
      setGameState(prev => ({
        ...prev,
        phase: 'battle',
        playerGrid: grid,
        playerShips: ships,
        botGrid,
        botShips,
        currentPlacingIndex: SHIPS_CONFIG.length,
        messages: [
          '[ FLEET ] Fleet randomly deployed! Combat initiated!',
          ...prev.messages,
        ].slice(0, 20),
      }))
    }
  }, [])

  const handleRestart = useCallback(() => {
    if (botTimerRef.current) clearTimeout(botTimerRef.current)
    setGameState(initGameState())
    setBotAI(createBotAI())
    setIsBotThinking(false)
    setLastAttacked(null)
    setHoverCell(null)
  }, [])

  const remainingPlayerShips = gameState.playerShips.filter(s => !s.sunk).length
  const remainingBotShips = gameState.botShips.filter(s => !s.sunk).length

  return (
    <div className="min-h-screen bg-retro-dark p-2 sm:p-4">
      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="text-retro-green glow-text text-2xl sm:text-3xl font-bold tracking-widest">
          ◈ BATTLESHIP // COMMAND ◈
        </h1>
        <div className="flex justify-center gap-8 mt-2 text-sm text-green-600">
          <span>
            PHASE:{' '}
            <span className="text-retro-green">
              {gameState.phase === 'placement'
                ? 'DEPLOYMENT'
                : gameState.phase === 'battle'
                ? 'COMBAT'
                : 'GAME OVER'}
            </span>
          </span>
          {gameState.phase === 'battle' && (
            <span>
              TURN:{' '}
              <span
                className={`${
                  gameState.turn === 'player' ? 'text-retro-green' : 'text-retro-hit'
                } font-bold`}
              >
                {gameState.turn === 'player' ? 'COMMANDER' : isBotThinking ? 'ENEMY...' : 'ENEMY'}
              </span>
            </span>
          )}
        </div>
      </div>

      {/* Game Over Screen */}
      {gameState.phase === 'gameover' && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="retro-panel p-8 text-center max-w-md border-2 border-retro-green">
            {gameState.winner === 'player' ? (
              <>
                <div className="text-retro-green glow-text text-4xl font-bold mb-4 animate-blink">
                  VICTORY
                </div>
                <p className="text-green-400 text-lg mb-2">Mission Accomplished!</p>
                <p className="text-green-600 text-sm mb-6">
                  All enemy vessels have been neutralized.
                </p>
              </>
            ) : (
              <>
                <div className="text-retro-hit glow-text-red text-4xl font-bold mb-4 animate-blink">
                  DEFEAT
                </div>
                <p className="text-red-400 text-lg mb-2">Mission Failed</p>
                <p className="text-red-600 text-sm mb-6">
                  Your fleet has been destroyed by the enemy.
                </p>
              </>
            )}
            <button onClick={handleRestart} className="retro-btn text-lg px-8 py-3">
              [ NEW MISSION ]
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col xl:flex-row gap-4 items-start justify-center">
        {/* Left Panel */}
        <div className="flex flex-col gap-4 w-full xl:w-auto">
          {/* Player Grid */}
          <div className="retro-panel p-3">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-retro-green text-sm font-bold tracking-wider">
                [ YOUR WATERS ]
              </h2>
              {gameState.phase !== 'placement' && (
                <span className="text-sm text-green-600">
                  Ships:{' '}
                  <span className="text-retro-green">{remainingPlayerShips}</span>
                  /{SHIPS_CONFIG.length}
                </span>
              )}
            </div>
            <GameGrid
              grid={gameState.playerGrid}
              isPlayerGrid={true}
              phase={gameState.phase}
              currentPlacingShip={currentPlacingShip}
              orientation={gameState.orientation}
              hoverCell={hoverCell}
              onHover={setHoverCell}
              onClick={handlePlacementClick}
              turn={gameState.turn}
              isBotThinking={isBotThinking}
            />
          </div>

          {/* Placement Panel */}
          {gameState.phase === 'placement' && (
            <ShipPlacementPanel
              ships={SHIPS_CONFIG}
              currentIndex={gameState.currentPlacingIndex}
              orientation={gameState.orientation}
              onToggleOrientation={toggleOrientation}
              onRandomPlace={handleRandomPlacement}
            />
          )}

          {/* Battle stats */}
          {gameState.phase === 'battle' && (
            <BattlePanel
              playerShips={gameState.playerShips}
              botShips={gameState.botShips}
              turn={gameState.turn}
              isBotThinking={isBotThinking}
              onRestart={handleRestart}
            />
          )}
        </div>

        {/* Right Panel - Enemy Grid */}
        <div className="flex flex-col gap-4 w-full xl:w-auto">
          <div className="retro-panel p-3">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-retro-hit text-sm font-bold tracking-wider">
                [ ENEMY WATERS ]
              </h2>
              {gameState.phase !== 'placement' && (
                <span className="text-sm text-red-800">
                  Ships:{' '}
                  <span className="text-retro-hit">{remainingBotShips}</span>
                  /{SHIPS_CONFIG.length}
                </span>
              )}
            </div>
            <GameGrid
              grid={gameState.botGrid}
              isPlayerGrid={false}
              phase={gameState.phase}
              currentPlacingShip={null}
              orientation={gameState.orientation}
              hoverCell={null}
              onHover={() => {}}
              onClick={handleAttack}
              turn={gameState.turn}
              isBotThinking={isBotThinking}
              lastAttacked={lastAttacked}
            />
            {gameState.phase === 'placement' && (
              <p className="text-green-800 text-xs text-center mt-2 tracking-wider">
                ENEMY FLEET POSITION: CLASSIFIED
              </p>
            )}
            {gameState.phase === 'battle' && gameState.turn === 'player' && !isBotThinking && (
              <p className="text-retro-green text-xs text-center mt-2 tracking-wider animate-blink">
                ► SELECT TARGET TO FIRE
              </p>
            )}
            {isBotThinking && (
              <p className="text-retro-hit text-xs text-center mt-2 tracking-wider animate-blink">
                ► ENEMY IS TARGETING...
              </p>
            )}
          </div>

          {/* Message Log */}
          <MessageLog messages={gameState.messages} />
        </div>
      </div>
    </div>
  )
}
