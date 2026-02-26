/**
 * Command Resolver — Citro
 *
 * Maps detected intents → actual service calls.
 * Reuses existing services (dashboard-service, etc.) — no duplication.
 *
 * Called from the voice service facade (index.js) via the API layer.
 * This is the ONLY place where business logic execution happens for voice.
 *
 * Context object now includes `currentPage` for page-relative queries.
 */
import dashboardService from 'src/services/dashboard-service'

/**
 * resolveCommand — execute the action for a detected intent
 *
 * @param {string} intent     Intent ID from intent-engine
 * @param {object} entities   Extracted entities { name, date, etc. }
 * @param {object} context    { currentPage, userId?, role?, isAuthenticated? } from API layer
 * @returns {object}          { success, data, action, currentPage, error? }
 */
export async function resolveCommand(intent, entities, context) {
  // Forward currentPage so response templates can use it
  const base = { currentPage: context.currentPage || '/' }

  switch (intent) {
    // ── Navigation intents — no DB calls, just return route info ───────────
    case 'NAV_HOME':
    case 'NAV_DASHBOARD':
    case 'NAV_EVENTS':
    case 'NAV_LOGIN':
    case 'NAV_REGISTER':
    case 'NAV_BACK':
      return { success: true, data: null, ...base }

    // ── Dashboard stats ───────────────────────────────────────────────────
    case 'QUERY_STATS': {
      try {
        const stats = await dashboardService.getStats()
        return { success: true, data: stats, ...base }
      } catch (err) {
        return { success: false, error: 'Could not fetch stats', ...base }
      }
    }

    // ── Upcoming events ───────────────────────────────────────────────────
    case 'QUERY_UPCOMING_EVENTS': {
      try {
        const events = await dashboardService.getUpcomingEvents()
        return { success: true, data: events, ...base }
      } catch (err) {
        return { success: false, error: 'Could not fetch events', ...base }
      }
    }

    // ── Search events ─────────────────────────────────────────────────────
    case 'SEARCH_EVENT': {
      return {
        success: true,
        data: null,
        ...base,
        message: `Searching for "${entities.name || 'unknown'}"`
      }
    }

    // ── Register for event ────────────────────────────────────────────────
    case 'REGISTER_EVENT': {
      return {
        success: true,
        data: null,
        ...base,
        message: `Registration flow for "${entities.name || 'unknown'}"`
      }
    }

    // ── My registrations ──────────────────────────────────────────────────
    case 'QUERY_MY_REGISTRATIONS': {
      return { success: true, data: null, ...base }
    }

    // ── Knowledge base — no service calls, templates have the answers ─────
    case 'INFO_WHAT_IS_CITRO':
    case 'INFO_WHO_MADE_CITRO':
    case 'INFO_EVENT_LOCATION':
    case 'INFO_EVENT_DATE':
    case 'INFO_HOW_TO_REGISTER':
    case 'INFO_TICKET_PRICE':
    case 'INFO_CONTACT':
      return { success: true, data: null, ...base }

    // ── Context-aware — pass currentPage to template ──────────────────────
    case 'CONTEXT_WHERE_AM_I':
    case 'CONTEXT_WHAT_CAN_I_DO':
      return { success: true, data: null, ...base }

    // ── Greeting / Meta — no service calls needed ─────────────────────────
    case 'GREETING':
    case 'HELP':
    case 'THANK_YOU':
    case 'WHO_ARE_YOU':
    case 'GOODBYE':
      return { success: true, data: null, ...base }

    // ── Unknown / fallback ────────────────────────────────────────────────
    default:
      return { success: false, data: null, ...base }
  }
}
