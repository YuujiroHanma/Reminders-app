// Server-side AI abstraction. Prefer calling a local MCP server for development if
// `MCP_URL` is set (e.g. http://localhost:8081). Falls back to direct provider calls
// (OpenAI-compatible) when MCP is unavailable.

async function callProviderSummarize(text: string): Promise<string> {
  const AI_PROVIDER = process.env.AI_PROVIDER || 'openai'
  const AI_API_KEY = process.env.AI_API_KEY || process.env.NEXT_PUBLIC_AI_API_KEY || ''
  // Don't log the key itself — only whether it's present
  if (!AI_API_KEY) {
    console.warn('AI API key not found in environment (checked AI_API_KEY and NEXT_PUBLIC_AI_API_KEY)')
    throw new Error('AI_API_KEY not configured')
  }
  if (AI_PROVIDER === 'openai') {
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${AI_API_KEY}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that summarizes text concisely.' },
          { role: 'user', content: `Summarize the following note in 2-3 sentences:\n\n${text}` }
        ],
        max_tokens: 200
      })
    })
    const j = await resp.json()
    const out = j?.choices?.[0]?.message?.content || j?.choices?.[0]?.text || ''
    return out.trim()
  }
  throw new Error(`AI provider ${AI_PROVIDER} not implemented`)
}

async function callProviderSpellcheck(text: string): Promise<string> {
  const AI_PROVIDER = process.env.AI_PROVIDER || 'openai'
  const AI_API_KEY = process.env.AI_API_KEY || process.env.NEXT_PUBLIC_AI_API_KEY || ''
  if (!AI_API_KEY) {
    console.warn('AI API key not found in environment (checked AI_API_KEY and NEXT_PUBLIC_AI_API_KEY)')
    throw new Error('AI_API_KEY not configured')
  }
  if (AI_PROVIDER === 'openai') {
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${AI_API_KEY}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that corrects spelling and grammar, returning only the corrected text.' },
          { role: 'user', content: `Correct spelling and grammar for this note. Return only the corrected note without commentary:\n\n${text}` }
        ],
        max_tokens: 800
      })
    })
    const j = await resp.json()
    const out = j?.choices?.[0]?.message?.content || j?.choices?.[0]?.text || ''
    return out.trim()
  }
  throw new Error(`AI provider ${AI_PROVIDER} not implemented`)
}

async function callMCP(action: 'summarize' | 'spellcheck', text: string): Promise<string> {
  const MCP_URL = process.env.MCP_URL || ''
  if (!MCP_URL) throw new Error('MCP_URL not configured')
  const res = await fetch(`${MCP_URL.replace(/\/$/, '')}/ai`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, text })
  })
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`MCP request failed: ${res.status} ${txt}`)
  }
  const j = await res.json()
  return j.result
}

export async function summarizeText(text: string): Promise<string> {
  const MCP_URL = process.env.MCP_URL || ''
  if (MCP_URL) {
    try {
      return await callMCP('summarize', text)
    } catch (err) {
      console.warn('MCP summarize failed, falling back to provider:', err)
    }
  }
  return callProviderSummarize(text)
}

export async function spellcheckText(text: string): Promise<string> {
  const MCP_URL = process.env.MCP_URL || ''
  if (MCP_URL) {
    try {
      return await callMCP('spellcheck', text)
    } catch (err) {
      console.warn('MCP spellcheck failed, falling back to provider:', err)
    }
  }
  return callProviderSpellcheck(text)
}
