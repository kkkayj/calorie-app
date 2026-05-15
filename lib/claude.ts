import Anthropic from '@anthropic-ai/sdk'

// This client is only ever imported in server-side files (API routes).
// The API key never reaches the browser.
export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})
