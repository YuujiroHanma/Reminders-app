// Lightweight id generator to avoid adding a dependency
function uuidv4() {
  return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 9)
}

export type LocalReminder = {
  id: string
  title: string
  due_at: string
  note?: string
  completed?: boolean
}

const KEY = 'localReminders'

function read(): LocalReminder[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    return JSON.parse(raw)
  } catch (err) {
    console.warn('localStore read error', err)
    return []
  }
}

function write(items: LocalReminder[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items))
    // dispatch a storage event emulation for same-window listeners
    window.dispatchEvent(new CustomEvent('localReminders:changed'))
  } catch (err) {
    console.warn('localStore write error', err)
  }
}

export const localStore = {
  getAll(): LocalReminder[] {
    return read()
  },
  insert(r: Omit<LocalReminder, 'id'>) {
    const items = read()
    const rec: LocalReminder = { ...r, id: uuidv4() }
    items.push(rec)
    write(items)
    return rec
  },
  update(id: string, patch: Partial<LocalReminder>) {
    const items = read()
    const idx = items.findIndex(i => i.id === id)
    if (idx === -1) return null
    items[idx] = { ...items[idx], ...patch }
    write(items)
    return items[idx]
  },
  delete(id: string) {
    const items = read().filter(i => i.id !== id)
    write(items)
  },
  subscribe(cb: () => void) {
    const handler = () => cb()
    window.addEventListener('localReminders:changed', handler as EventListener)
    return () => window.removeEventListener('localReminders:changed', handler as EventListener)
  }
}
