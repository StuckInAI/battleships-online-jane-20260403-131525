import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'BATTLESHIP // RETRO COMMAND',
  description: 'A retro-style Battleship game built with Next.js',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <div className="crt-overlay" />
        {children}
      </body>
    </html>
  )
}
