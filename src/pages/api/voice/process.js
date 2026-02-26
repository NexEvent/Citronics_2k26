/**
 * /api/voice/process
 * POST — Bridge between Citro UI and voice service layer.
 *
 * Flow: Validate transcript → call voiceService → return response
 * Auth is OPTIONAL — voice assistant works for all visitors (students
 * register at checkout, not on entry). If a session exists, role/email
 * are forwarded for personalised responses.
 *
 * Request body:  { transcript: string, currentPage?: string }
 * Response:      { success, data: { reply, action, data, intent, confidence } }
 */
import { getServerSession } from 'next-auth'
import nextAuthConfig from 'src/lib/nextAuthConfig'
import { processCommand } from 'src/services/voice'

export default async function handler(req, res) {
  // Only POST allowed
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ success: false, message: `Method ${req.method} not allowed` })
  }

  try {
    // Validate transcript
    const { transcript, currentPage } = req.body
    if (!transcript || typeof transcript !== 'string' || transcript.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Transcript is required' })
    }

    // Sanitize — limit length to prevent abuse
    const sanitized = transcript.trim().substring(0, 500)

    // Build context — auth is optional, enrich if session exists
    let context = { currentPage: currentPage || '/' }

    try {
      const session = await getServerSession(req, res, nextAuthConfig)
      if (session) {
        context.userId = session.user?.id
        context.role = session.user?.role || 'Student'
        context.email = session.user?.email
        context.isAuthenticated = true
      }
    } catch (_) {
      // Session lookup failed — continue without auth context
    }

    // Process through voice service pipeline
    const result = await processCommand(sanitized, context)

    return res.status(200).json({ success: true, data: result })
  } catch (error) {
    console.error('[/api/voice/process]', error)
    return res.status(500).json({ success: false, message: 'Voice processing failed' })
  }
}
