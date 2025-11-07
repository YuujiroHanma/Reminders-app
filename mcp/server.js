/*
  Lightweight MCP-like HTTP server for local development.
  Exposes POST /ai { action: 'summarize'|'spellcheck', text }
  and calls the configured OpenAI-compatible API using AI_API_KEY.

  Run locally:
    set AI_API_KEY=sk-...  # Windows (PowerShell)
    npm run mcp:start
*/

const http = require('http')

const PORT = process.env.MCP_PORT || 8081
const AI_PROVIDER = process.env.AI_PROVIDER || 'openai'
const AI_API_KEY = process.env.AI_API_KEY || ''

if (!AI_API_KEY) {
  console.error('AI_API_KEY is required to run the local MCP server')
  process.exit(1)
}

async function callOpenAI(action, text) {
  if (AI_PROVIDER !== 'openai') throw new Error('Only openai provider is implemented in local MCP')

  const messages = action === 'summarize'
    ? [
      { role: 'system', content: 'You are a helpful assistant that summarizes text concisely.' },
      { role: 'user', content: `Summarize the following note in 2-3 sentences:\n\n${text}` }
    ]
    : [
      { role: 'system', content: 'You are a helpful assistant that corrects spelling and grammar, returning only the corrected text.' },
      { role: 'user', content: `Correct spelling and grammar for this note. Return only the corrected note without commentary:\n\n${text}` }
    ]

  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${AI_API_KEY}` },
    body: JSON.stringify({ model: 'gpt-4o-mini', messages, max_tokens: 800 })
  })
  const j = await resp.json()
  const out = j?.choices?.[0]?.message?.content || j?.choices?.[0]?.text || ''
  return out.trim()
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'POST' && req.url === '/ai') {
    try {
      let body = ''
      for await (const chunk of req) body += chunk
      const json = JSON.parse(body || '{}')
      const { action, text } = json
      if (!text || !action) {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        return res.end(JSON.stringify({ error: 'Missing action or text' }))
      }
      const result = await callOpenAI(action, text)
      res.writeHead(200, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ result }))
    } catch (err) {
      console.error('MCP server error', err)
      res.writeHead(500, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ error: err.message }))
    }
  }

  res.writeHead(404, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ error: 'Not found' }))
})

server.listen(PORT, () => {
  console.log(`Local MCP server listening on http://localhost:${PORT}`)
})
