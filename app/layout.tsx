import '../styles/globals.css'
import React from 'react'

export const metadata = {
  title: 'Reminders App',
  description: 'Notes & Reminders with AI helpers'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen max-w-4xl mx-auto p-4">
          <header className="mb-6">
            <h1 className="text-2xl font-semibold">Reminders</h1>
            <p className="text-sm text-gray-600">Create reminders, summarise notes and spell-check with AI</p>
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  )
}
