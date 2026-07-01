import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createHmac } from 'node:crypto'

const isProduction = process.env.NODE_ENV === 'production'
const APP_USER = process.env.APP_USER ?? (isProduction ? '' : '123')
const APP_PASSWORD = process.env.APP_PASSWORD ?? (isProduction ? '' : '123')
const SESSION_SECRET = process.env.SESSION_SECRET ?? (isProduction ? '' : 'maplestore-dev-secret')
const MAX_AGE_SECONDS = 60 * 60 * 24 * 180

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed')
    return
  }

  const body = (req.body ?? {}) as { id?: string; password?: string }

  if (!APP_USER || !APP_PASSWORD || !SESSION_SECRET) {
    res.status(500).send('Login environment variables are missing.')
    return
  }

  if (body.id !== APP_USER || body.password !== APP_PASSWORD) {
    res.redirect(302, '/login.html?error=1')
    return
  }

  const token = createHmac('sha256', SESSION_SECRET).update(APP_USER).digest('hex')
  res.setHeader(
    'Set-Cookie',
    `ms_session=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${MAX_AGE_SECONDS}`,
  )
  res.redirect(302, '/')
}
