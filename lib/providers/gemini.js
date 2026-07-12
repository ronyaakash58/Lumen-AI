// Gemini 2.5 Flash Image (Nano Banana) provider via Emergent Universal LLM Gateway
// The Emergent gateway exposes an OpenAI-compatible chat.completions endpoint.
// This module is intentionally isolated so other providers (OpenAI gpt-image-1,
// FLUX, Ideogram, Replicate, fal.ai) can be plugged in behind the same interface.

import OpenAI from 'openai'

const client = new OpenAI({
  apiKey: process.env.EMERGENT_LLM_KEY,
  baseURL: 'https://integrations.emergentagent.com/llm',
})

// Emergent gateway routes vertex_ai models to Gemini's image-capable variants.
// Nano Banana = Gemini 2.5 Flash Image on Vertex.
const MODEL = 'vertex_ai/gemini-2.5-flash-image'

export async function generateFashionImage({ prompt, productImg, modelImg, backgroundImg }) {
  const content = [{ type: 'text', text: prompt }]
  if (productImg) content.push({ type: 'image_url', image_url: { url: productImg } })
  if (modelImg) content.push({ type: 'image_url', image_url: { url: modelImg } })
  if (backgroundImg) content.push({ type: 'image_url', image_url: { url: backgroundImg } })

  const resp = await client.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content }],
    modalities: ['image', 'text'],
  })

  const msg = resp.choices?.[0]?.message
  // The Emergent gateway returns image data either in msg.images[] (b64_json) or
  // as data URLs inside content. We handle both.
  if (msg?.images && msg.images.length) {
    const first = msg.images[0]
    const b64 = first.image_url?.url || first.b64_json || first.url
    if (b64?.startsWith('data:')) return b64
    if (b64) return `data:image/png;base64,${b64}`
  }
  if (typeof msg?.content === 'string' && msg.content.startsWith('data:image')) return msg.content
  if (Array.isArray(msg?.content)) {
    for (const p of msg.content) {
      if (p.type === 'image_url' && p.image_url?.url) return p.image_url.url
      if (p.type === 'output_image' && p.image?.b64_json) return `data:image/png;base64,${p.image.b64_json}`
    }
  }
  throw new Error('No image returned from provider')
}

export const meta = {
  id: 'gemini-2.5-flash-image',
  label: 'Gemini 2.5 Flash Image (Nano Banana)',
  supportsComposition: true,
}
