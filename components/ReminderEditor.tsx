"use client"
import React, { useEffect, useState } from 'react'
import { Reminder } from '../types'
import { supabase } from '../lib/supabaseClient'
import { localStore } from '../lib/localStore'

type Props = {
  reminder?: Reminder | null
  onSaved?: () => void
}

function toInputDate(iso?: string) {
  if (!iso) return ''
  const d = new Date(iso)
  // local ISO without seconds and timezone
  const off = d.getTimezoneOffset()
  const local = new Date(d.getTime() - off * 60 * 1000)
  return local.toISOString().slice(0, 16)
}

export default function ReminderEditor({ reminder, onSaved }: Props) {
  const [title, setTitle] = useState('')
  const [dueAt, setDueAt] = useState('')
  const [note, setNote] = useState('')
  const [summary, setSummary] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (reminder) {
      setTitle(reminder.title)
      setDueAt(toInputDate(reminder.due_at))
      setNote(reminder.note || '')
      setSummary(null)
    } else {
      setTitle('')
      setDueAt('')
      setNote('')
      setSummary(null)
    }
  }, [reminder])

  async function handleSummarize() {
    if (!note) return
    setIsLoading(true)
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'summarize', text: note })
      })
      const data = await res.json()
      setSummary(data.result)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSpellcheck() {
    if (!note) return
    setIsLoading(true)
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'spellcheck', text: note })
      })
      const data = await res.json()
      setNote(data.result)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSave() {
    if (!title || !dueAt) {
      alert('Title and due date are required')
      return
    }
    setIsLoading(true)
    try {
      const record = {
        title,
        due_at: new Date(dueAt).toISOString(),
        note
      }

      // Use the server-side API (uses SUPABASE_SERVICE_ROLE_KEY). If the
      // server errors, fall back to localStore so the UI remains usable.
      try {
        if (reminder?.id) {
          const res = await fetch(`/api/reminders?id=${encodeURIComponent(reminder.id)}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(record)
          })
          if (res.ok) {
            onSaved?.()
          } else {
            throw new Error('Server failed')
          }
        } else {
          const res = await fetch('/api/reminders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(record)
          })
          if (!res.ok) throw new Error('Server failed')
        }
      } catch (e) {
        if (reminder?.id) {
          localStore.update(reminder.id, record as any)
        } else {
          localStore.insert(record as any)
        }
      }
      setTitle('')
      setDueAt('')
      setNote('')
      setSummary(null)
      onSaved?.()
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-4 bg-white rounded shadow-sm">
      <label className="block text-sm font-medium">Title</label>
      <input value={title} onChange={e => setTitle(e.target.value)} className="mt-1 w-full p-2 border rounded" />

      <label className="block text-sm font-medium mt-3">Due</label>
      <input type="datetime-local" value={dueAt} onChange={e => setDueAt(e.target.value)} className="mt-1 w-full p-2 border rounded" />

      <label className="block text-sm font-medium mt-3">Note (optional)</label>
      <textarea value={note} onChange={e => setNote(e.target.value)} rows={4} className="mt-1 w-full p-2 border rounded" />

      <div className="flex gap-2 mt-3">
        <button onClick={handleSummarize} disabled={isLoading} className="px-3 py-2 bg-indigo-600 text-white rounded">Summarize</button>
        <button onClick={handleSpellcheck} disabled={isLoading} className="px-3 py-2 bg-yellow-500 text-black rounded">Spellcheck</button>
        <button onClick={handleSave} className="ml-auto px-3 py-2 bg-green-600 text-white rounded">{reminder ? 'Update' : 'Create'}</button>
      </div>

      {isLoading && <div className="text-sm text-gray-500 mt-2">Working...</div>}
      {summary && (
        <div className="mt-3 p-3 bg-gray-50 rounded border"> 
          <div className="text-xs text-gray-500">AI Summary</div>
          <div className="mt-1 text-sm">{summary}</div>
        </div>
      )}
    </div>
  )
}
