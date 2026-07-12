// Provider registry — future-ready modular AI provider architecture.
// Add new providers here (openai, flux, ideogram, replicate, fal) without
// touching the frontend.

import * as gemini from './gemini'

export const providers = {
  'gemini-2.5-flash-image': gemini,
}

export function getProvider(id = 'gemini-2.5-flash-image') {
  return providers[id] || providers['gemini-2.5-flash-image']
}

export const availableProviders = [
  { id: 'gemini-2.5-flash-image', label: 'Gemini 2.5 Flash Image (Nano Banana)', enabled: true },
  { id: 'openai-gpt-image-1', label: 'OpenAI GPT Image 1', enabled: false, comingSoon: true },
  { id: 'flux', label: 'FLUX Pro', enabled: false, comingSoon: true },
  { id: 'ideogram', label: 'Ideogram v2', enabled: false, comingSoon: true },
  { id: 'replicate', label: 'Replicate', enabled: false, comingSoon: true },
  { id: 'fal', label: 'Fal.ai', enabled: false, comingSoon: true },
]
