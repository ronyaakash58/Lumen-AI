import { cookies } from 'next/headers'
import { getDb } from './mongodb'

export async function getSessionUser() {
  const store = await cookies()
  const token = store.get('session_token')?.value
  if (!token) return null
  const db = await getDb()
  const session = await db.collection('sessions').findOne({ token })
  if (!session) return null
  if (session.expires_at && new Date(session.expires_at) < new Date()) return null
  const user = await db.collection('users').findOne({ id: session.user_id })
  if (!user) return null
  const { _id, ...rest } = user
  return rest
}
