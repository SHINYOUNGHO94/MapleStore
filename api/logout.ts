import type { VercelRequest, VercelResponse } from '@vercel/node'

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.setHeader('Set-Cookie', 'ms_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0')
  res.redirect(302, '/login.html')
}
