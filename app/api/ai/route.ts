import { NextResponse } from 'next/server'
import { summarizeText, spellcheckText } from '../../../server/ai'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { action, text } = body
    if (!text || typeof text !== 'string') return NextResponse.json({ error: 'Missing text' }, { status: 400 })

    if (action === 'summarize') {
      const result = await summarizeText(text)
      return NextResponse.json({ result })
    }
    if (action === 'spellcheck') {
      const result = await spellcheckText(text)
      return NextResponse.json({ result })
    }
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (err: any) {
    console.error('AI route error', err)
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}
