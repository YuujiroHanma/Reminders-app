import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.warn('Supabase service role or URL not configured for server API')
}

const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

export async function GET() {
  try {
    const { data, error } = await sb.from('reminders').select('*').order('due_at', { ascending: true })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { title, note, due_at, completed } = body
    if (!title || !due_at) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    const toInsert: any = { title, due_at, note }
    if (typeof completed !== 'undefined') toInsert.completed = completed
    const { data, error } = await sb.from('reminders').insert([toInsert]).select()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data: data?.[0] ?? null })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const url = new URL(req.url)
    const id = url.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    const body = await req.json()
    const { data, error } = await sb.from('reminders').update(body).eq('id', id).select()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data: data?.[0] ?? null })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url)
    const id = url.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    const { data, error } = await sb.from('reminders').delete().eq('id', id).select()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data: data?.[0] ?? null })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}
