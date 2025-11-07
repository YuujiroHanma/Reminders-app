"use client"
import React, { useEffect, useState } from 'react'
import { Reminder } from '../types'
import { supabase } from '../lib/supabaseClient'
import { localStore } from '../lib/localStore'

function groupByDay(reminders: Reminder[]) {
  const today: Reminder[] = []
  const tomorrow: Reminder[] = []
  const upcoming: Reminder[] = []
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const startOfTomorrow = startOfToday + 24 * 60 * 60 * 1000
  reminders.forEach(r => {
    const t = new Date(r.due_at).getTime()
    if (t >= startOfToday && t < startOfTomorrow) today.push(r)
    else if (t >= startOfTomorrow && t < startOfTomorrow + 24 * 60 * 60 * 1000) tomorrow.push(r)
    else upcoming.push(r)
  })
  return { today, tomorrow, upcoming }
}

type Props = {
  onEdit?: (r: Reminder) => void
}

export default function ReminderList({ onEdit }: Props) {
  const [items, setItems] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(false)

  async function fetchReminders() {
    setLoading(true)
    try {
      // Prefer server API which uses the service role key to access the DB.
      try {
        const res = await fetch('/api/reminders')
        const j = await res.json()
        if (res.ok && j.data) {
          setItems((j.data as Reminder[]) || [])
          return
        }
      } catch (err) {
        // ignore and fall back
      }
      const local = localStore.getAll()
      setItems((local as unknown as Reminder[]) || [])
    } catch (err) {
      console.error('fetchReminders', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReminders()
    // Subscribe to Supabase realtime changes if available; also subscribe to
    // the local store so UI updates work when falling back.
    let mounted = true
    let unsubSup: (() => void) | null = null
    try {
      const channel = supabase.channel('public:reminders')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'reminders' }, () => {
          if (mounted) fetchReminders()
        })
        .subscribe()
      unsubSup = () => channel.unsubscribe()
    } catch (e) {
      // ignore
    }
    const unsubLocal = localStore.subscribe(() => { if (mounted) fetchReminders() })
    return () => {
      mounted = false
      unsubSup?.()
      unsubLocal()
    }
  }, [])

  async function toggleCompleted(r: Reminder) {
    try {
      try {
        const res = await fetch(`/api/reminders?id=${encodeURIComponent(r.id)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ completed: !r.completed })
        })
        if (res.ok) {
          fetchReminders()
          return
        }
      } catch (e) {
        // fall back
      }
      localStore.update(r.id, { completed: !r.completed })
      fetchReminders()
    } catch (err) {
      console.error(err)
    }
  }

  async function deleteReminder(id: string) {
    if (!confirm('Delete reminder?')) return
    try {
      try {
        const res = await fetch(`/api/reminders?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
        if (res.ok) {
          fetchReminders()
          return
        }
      } catch (e) {
        // fall back
      }
      localStore.delete(id)
      fetchReminders()
    } catch (err) {
      console.error(err)
    }
  }

  const { today, tomorrow, upcoming } = groupByDay(items)

  const render = (title: string, arr: Reminder[]) => (
    <div className="mb-4">
      <h2 className="text-lg font-medium mb-2">{title}</h2>
      <ul className="space-y-2">
        {arr.length === 0 && <li className="text-sm text-gray-500">No reminders</li>}
        {arr.map(r => (
          <li key={r.id} className="p-3 bg-white rounded shadow-sm flex justify-between items-center">
            <div>
              <div className={r.completed ? 'line-through text-gray-400' : ''}>{r.title}</div>
              <div className="text-xs text-gray-500">{new Date(r.due_at).toLocaleString()}</div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => onEdit?.(r)} className="text-sm text-blue-600">Edit</button>
              <button onClick={() => toggleCompleted(r)} className="text-sm">{r.completed ? 'Undo' : 'Done'}</button>
              <button onClick={() => deleteReminder(r.id)} className="text-sm text-red-600">Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )

  return (
    <div>
      {loading && <div className="text-sm text-gray-500 mb-2">Loading...</div>}
      {render('Today', today)}
      {render('Tomorrow', tomorrow)}
      {render('Upcoming', upcoming)}
    </div>
  )
}
