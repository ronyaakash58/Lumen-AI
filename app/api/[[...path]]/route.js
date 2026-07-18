import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { getDb } from '@/lib/mongodb'
import { getProvider } from '@/lib/providers'

export const maxDuration = 60
export const runtime = 'nodejs'

function cors(res) {
  res.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGINS || '*')
  res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return res
}

export async function OPTIONS() { return cors(new NextResponse(null, { status: 200 })) }

async function getSessionUser(req) {
  const cookie = req.headers.get('cookie') || ''
  const m = cookie.match(/session_token=([^;]+)/)
  if (!m) return null
  const token = m[1]
  const db = await getDb()
  const session = await db.collection('sessions').findOne({ token })
  if (!session) return null
  const user = await db.collection('users').findOne({ id: session.user_id })
  if (!user) return null
  const { _id, ...rest } = user
  return rest
}

function setSessionCookie(res, token) {
  const maxAge = 60 * 60 * 24 * 30 // 30 days
  res.headers.append('Set-Cookie', `session_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}; Secure`)
  return res
}
function clearSessionCookie(res) {
  res.headers.append('Set-Cookie', `session_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Secure`)
  return res
}

async function handleRoute(request, ctx = {}) {
  const params = ctx?.params || {}
  const path = Array.isArray(params.path) ? params.path : []
  const route = '/' + path.filter(Boolean).join('/')
  const method = request?.method || 'GET'

  try {
    const db = await getDb()

    // Health
    if (route === '/' && method === 'GET') return cors(NextResponse.json({ ok: true, service: 'Lumen AI' }))

    // ---------- AUTH ----------
    // POST /api/auth/session { session_id } -> validates with Emergent, stores user + session
    if (route === '/auth/session' && method === 'POST') {
      const { session_id } = await request.json()
      if (!session_id) return cors(NextResponse.json({ error: 'session_id required' }, { status: 400 }))
      const r = await fetch('https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data', {
        headers: { 'X-Session-ID': session_id },
      })
      if (!r.ok) {
        const t = await r.text()
        return cors(NextResponse.json({ error: 'invalid session', detail: t }, { status: 401 }))
      }
      const data = await r.json()
      // Data: { id, email, name, picture, session_token }
      const users = db.collection('users')
      let user = await users.findOne({ email: data.email })
      if (!user) {
        user = {
          id: uuidv4(),
          email: data.email,
          name: data.name,
          picture: data.picture,
          credits: 100,
          created_at: new Date(),
        }
        await users.insertOne(user)
      } else {
        await users.updateOne({ id: user.id }, { $set: { name: data.name, picture: data.picture } })
      }
      const token = data.session_token || uuidv4()
      const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      await db.collection('sessions').insertOne({ token, user_id: user.id, expires_at: expires, created_at: new Date() })
      const { _id, ...userClean } = user
      const res = NextResponse.json({ ok: true, user: userClean })
      return cors(setSessionCookie(res, token))
    }

    if (route === '/auth/me' && method === 'GET') {
      const user = await getSessionUser(request)
      if (!user) return cors(NextResponse.json({ user: null }, { status: 401 }))
      return cors(NextResponse.json({ user }))
    }

    if (route === '/auth/logout' && method === 'POST') {
      const res = NextResponse.json({ ok: true })
      return cors(clearSessionCookie(res))
    }

    // ---------- STATS ----------
    if (route === '/stats' && method === 'GET') {
      const user = await getSessionUser(request)
      if (!user) return cors(NextResponse.json({ error: 'unauthorized' }, { status: 401 }))
      const total = await db.collection('generations').countDocuments({ user_id: user.id })
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000)
      const today = await db.collection('generations').countDocuments({ user_id: user.id, created_at: { $gte: since } })
      return cors(NextResponse.json({ total, today, credits: user.credits ?? 100, projects: 1 }))
    }

    // ---------- GENERATIONS ----------
    if (route === '/generations' && method === 'GET') {
      const user = await getSessionUser(request)
      if (!user) return cors(NextResponse.json({ error: 'unauthorized' }, { status: 401 }))
      const url = new URL(request.url)
      const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 200)
      const items = await db.collection('generations')
        .find({ user_id: user.id })
        .sort({ created_at: -1 })
        .limit(limit)
        .toArray()
      return cors(NextResponse.json({ items: items.map(({ _id, ...r }) => r) }))
    }

    // DELETE /api/generations/:id
    if (path[0] === 'generations' && path[1] && method === 'DELETE') {
      const user = await getSessionUser(request)
      if (!user) return cors(NextResponse.json({ error: 'unauthorized' }, { status: 401 }))
      await db.collection('generations').deleteOne({ id: path[1], user_id: user.id })
      return cors(NextResponse.json({ ok: true }))
    }

    // POST /api/generate
    if (route === '/generate' && method === 'POST') {
      const user = await getSessionUser(request)
      if (!user) return cors(NextResponse.json({ error: 'unauthorized' }, { status: 401 }))
      const body = await request.json()
      const { prompt, productImg, modelImg, backgroundImg, meta = {}, providerId } = body
      if (!prompt) return cors(NextResponse.json({ error: 'prompt required' }, { status: 400 }))

      const provider = getProvider(providerId)
      const image = await provider.generateFashionImage({ prompt, productImg, modelImg, backgroundImg })

      const doc = {
        id: uuidv4(),
        user_id: user.id,
        prompt,
        image,
        meta,
        provider: provider.meta?.id || 'gemini-2.5-flash-image',
        has_composition: !!(productImg || modelImg || backgroundImg),
        created_at: new Date(),
      }
      await db.collection('generations').insertOne(doc)
      // Decrement credits (best-effort)
      await db.collection('users').updateOne({ id: user.id }, { $inc: { credits: -1 } })
      const { _id, ...clean } = doc
      return cors(NextResponse.json(clean))
    }

    return cors(NextResponse.json({ error: `Route ${route} not found` }, { status: 404 }))
  } catch (err) {
    console.error('API error:', err)
    return cors(NextResponse.json({ error: err.message || 'internal error' }, { status: 500 }))
  }
}

export const GET = handleRoute
export const POST = handleRoute
export const PUT = handleRoute
export const DELETE = handleRoute
export const PATCH = handleRoute
