export type Reminder = {
  id: string
  user_id: string
  title: string
  due_at: string // ISO datetime
  note?: string
  completed: boolean
  recurring?: boolean
  created_at?: string
}
