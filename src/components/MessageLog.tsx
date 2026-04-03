'use client'

interface MessageLogProps {
  messages: string[]
}

export default function MessageLog({ messages }: MessageLogProps) {
  return (
    <div className="retro-panel p-3">
      <h3 className="text-retro-green text-sm font-bold tracking-wider mb-2">
        [ COMBAT LOG ]
      </h3>
      <div className="space-y-1 max-h-48 overflow-y-auto">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`text-xs font-mono ${
              i === 0 ? 'text-retro-green' : 'text-green-700'
            } ${
              msg.includes('HIT') || msg.includes('SUNK')
                ? 'text-retro-hit'
                : msg.includes('VICTORY')
                ? 'text-retro-green glow-text'
                : msg.includes('DEFEAT')
                ? 'text-retro-hit glow-text-red'
                : msg.includes('ENEMY') && msg.includes('hit')
                ? 'text-orange-500'
                : ''
            }`}
          >
            <span className="text-green-800 mr-1">{'>'}</span>
            {msg}
          </div>
        ))}
        {messages.length === 0 && (
          <p className="text-green-900 text-xs">No events logged.</p>
        )}
      </div>
      {/* Blinking cursor */}
      <div className="mt-1">
        <span className="text-retro-green text-xs animate-blink">█</span>
      </div>
    </div>
  )
}
