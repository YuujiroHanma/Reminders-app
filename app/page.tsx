"use client"
import React, { useState } from 'react'
import ReminderList from '../components/ReminderList'
import ReminderEditor from '../components/ReminderEditor'
// Authentication UI removed; app now works without sign-in
import { Reminder } from '../types'

export default function Page() {
  const [editing, setEditing] = useState<Reminder | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-semibold">Your Reminders</h2>
          <div className="text-xs text-gray-500">Grouped by Today / Tomorrow</div>
  </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <section className="md:col-span-2">
          <ReminderList key={refreshKey} onEdit={r => setEditing(r)} />
        </section>
        <aside className="md:col-span-1">
          <ReminderEditor reminder={editing} onSaved={() => { setEditing(null); setRefreshKey(k => k + 1) }} />
        </aside>
      </div>
    </div>
  )
}
