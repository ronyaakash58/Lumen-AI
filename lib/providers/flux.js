// Minimal Flux provider wrapper
// Expects FLUX_API_URL and FLUX_API_KEY environment variables.
// This module provides a `generateFashionImage` function with the same
// signature as the other providers in this repo.

export const meta = {
  id: 'flux',
  label: 'FLUX.2 (Open Source)',
  enabled: true,
}

async function callFluxApi(payload) {
  const url = process.env.FLUX_API_URL
  const key = process.env.FLUX_API_KEY
  if (!url || !key) {
    throw new Error('FLUX provider not configured. Set FLUX_API_URL and FLUX_API_KEY')
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const t = await res.text()
    throw new Error(`Flux API error: ${res.status} ${t}`)
  }

  return res.json()
}

export async function generateFashionImage({ prompt, productImg, modelImg, backgroundImg, meta = {} } = {}) {
  if (!prompt) throw new Error('prompt required')

  const payload = {
    prompt,
    inputs: { productImg, modelImg, backgroundImg },
    meta,
  }

  const data = await callFluxApi(payload)

  // The Flux API may return different shapes; normalize to the app's image format
  // Expected shape: { url: 'https://...', metadata: {} }
  if (data.url) return { url: data.url, meta: data.metadata || {} }
  if (data.output && data.output[0] && data.output[0].uri) return { url: data.output[0].uri, meta: data.output[0].meta || {} }

  return { url: JSON.stringify(data), meta: {} }
}

export default {
  meta,
  generateFashionImage,
}
