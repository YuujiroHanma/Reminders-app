import { summarizeText, spellcheckText } from '../server/ai'

describe('AI abstraction (unit)', () => {
  const realFetch = global.fetch

  beforeEach(() => {
    process.env.AI_API_KEY = 'test-key'
    ;(global as any).fetch = jest.fn()
  })

  afterEach(() => {
    process.env.AI_API_KEY = ''
    ;(global as any).fetch = realFetch
    jest.resetAllMocks()
  })

  it('summarizeText calls provider and returns text', async () => {
    const mockResp = { json: async () => ({ choices: [{ message: { content: 'Short summary' } }] }) }
    ;(global as any).fetch.mockResolvedValueOnce(mockResp)

    const out = await summarizeText('some long note')
    expect(out).toBe('Short summary')
    expect((global as any).fetch).toHaveBeenCalled()
  })

  it('spellcheckText calls provider and returns corrected text', async () => {
    const mockResp = { json: async () => ({ choices: [{ message: { content: 'Corrected note' } }] }) }
    ;(global as any).fetch.mockResolvedValueOnce(mockResp)

    const out = await spellcheckText('badly writen note')
    expect(out).toBe('Corrected note')
    expect((global as any).fetch).toHaveBeenCalled()
  })
})
