/**
 * Command Resolver — Citro
 *
 * Maps detected intents → actual service calls.
 * Reuses existing services (dashboard-service, etc.) — no duplication.
 * Uses the event knowledge base for instant event-specific answers.
 *
 * Called from the voice service facade (index.js) via the API layer.
 * This is the ONLY place where business logic execution happens for voice.
 *
 * Context object now includes `currentPage` for page-relative queries.
 */
import dashboardService from 'src/services/dashboard-service'
import eventService from 'src/services/event-service'
import {
  findEvent,
  getEventsByDepartment,
  getEventsByDay,
  getDepartmentCode,
  FEST_INFO
} from './event-knowledge'

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

    // ── Navigate to a specific event by name ──────────────────────────────
    case 'NAV_EVENT': {
      const match = findEvent(entities.name)
      if (match && match.confidence >= 0.4) {
        return {
          success: true,
          data: { event: match.event, confidence: match.confidence },
          ...base
        }
      }
      return {
        success: false,
        data: null,
        ...base,
        error: `Could not find an event matching "${entities.name || 'that'}"`
      }
    }

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
      const match = findEvent(entities.name)
      return {
        success: true,
        data: match ? { event: match.event } : null,
        ...base,
        message: `Registration flow for "${entities.name || 'unknown'}"`
      }
    }

    // ── My registrations ──────────────────────────────────────────────────
    case 'QUERY_MY_REGISTRATIONS': {
      return { success: true, data: null, ...base }
    }

    // ══════════════════════════════════════════════════════════════════════
    // ── Event Knowledge Base Queries ──────────────────────────────────────
    // ══════════════════════════════════════════════════════════════════════
    case 'EVENT_DETAILS':
    case 'EVENT_WHEN':
    case 'EVENT_WHERE':
    case 'EVENT_PRICE':
    case 'EVENT_PRIZE': {
      const match = findEvent(entities.name)
      if (match && match.confidence >= 0.4) {
        return {
          success: true,
          data: { event: match.event, confidence: match.confidence },
          ...base
        }
      }
      return {
        success: false,
        data: null,
        ...base,
        error: `I couldn't find an event matching "${entities.name || 'that'}". Try saying the full event name!`
      }
    }

    case 'DEPT_EVENTS': {
      const deptCode = getDepartmentCode(entities.name)
      if (deptCode) {
        const events = getEventsByDepartment(deptCode)
        return {
          success: true,
          data: { department: deptCode, events },
          ...base
        }
      }
      return {
        success: false,
        data: null,
        ...base,
        error: `I couldn't find a department matching "${entities.name || 'that'}".`
      }
    }

    case 'DAY_EVENTS': {
      // Extract day number from entities
      let dayNum = null
      const raw = (entities.name || '').toLowerCase().trim()
      if (raw.includes('1') || raw.includes('first') || raw.includes('8')) dayNum = 1
      else if (raw.includes('2') || raw.includes('second') || raw.includes('9')) dayNum = 2
      else if (raw.includes('3') || raw.includes('third') || raw.includes('10')) dayNum = 3

      if (dayNum) {
        const events = getEventsByDay(dayNum)
        return { success: true, data: { day: dayNum, events }, ...base }
      }
      return {
        success: false,
        data: null,
        ...base,
        error: 'Please specify day 1, 2, or 3. Citronics runs from April 8–10.'
      }
    }

    case 'FEST_INFO': {
      return { success: true, data: { fest: FEST_INFO }, ...base }
    }

    case 'LIST_ALL_EVENTS': {
      return { success: true, data: { allEvents: true }, ...base }
    }

    case 'RECOMMEND_EVENT': {
      return { success: true, data: { recommend: true }, ...base }
    }

    // ══════════════════════════════════════════════════════════════════════
    // ── Cart Operations ───────────────────────────────────────────────────
    // ══════════════════════════════════════════════════════════════════════
    case 'ADD_TO_CART':
    case 'ADD_CART_AND_CHECKOUT': {
      // Step 1: Find event name from knowledge base
      const kbMatch = findEvent(entities.name)
      if (!kbMatch || kbMatch.confidence < 0.4) {
        return {
          success: false,
          data: null,
          ...base,
          error: `I couldn't find an event matching "${entities.name || 'that'}". Try saying the full event name!`
        }
      }

      // Step 2: Look up the real DB event by name to get the event ID
      try {
        const dbEvents = await eventService.getPublishedEvents({ search: kbMatch.event.name, limit: 5 })
        const dbEvent = dbEvents.find(e =>
          e.title.toLowerCase() === kbMatch.event.name.toLowerCase()
        ) || dbEvents[0]

        if (!dbEvent) {
          return {
            success: false,
            data: null,
            ...base,
            error: `I found "${kbMatch.event.name}" in my knowledge base but it's not currently available for booking.`
          }
        }

        const spotsLeft = Math.max(0, (dbEvent.seats || 0) - (dbEvent.registered || 0))
        if (spotsLeft <= 0) {
          return {
            success: false,
            data: {
              event: kbMatch.event,
              dbEvent,
              soldOut: true
            },
            ...base,
            error: `Sorry, ${kbMatch.event.name} is sold out! No spots left.`
          }
        }

        // Build cart item payload for the client to dispatch
        const cartItem = {
          eventId: dbEvent.id,
          title: dbEvent.title,
          ticketPrice: parseFloat(dbEvent.ticket_price) || 0,
          quantity: 1,
          image: dbEvent.images?.[0] || null,
          startTime: dbEvent.start_time,
          venue: dbEvent.venue || kbMatch.event.venue,
          maxAvailable: spotsLeft
        }

        const navigateToCart = intent === 'ADD_CART_AND_CHECKOUT'

        return {
          success: true,
          data: {
            event: kbMatch.event,
            dbEvent,
            cartItem,
            navigateToCart
          },
          ...base
        }
      } catch (err) {
        console.error('[voice] Cart lookup error:', err)
        return {
          success: false,
          data: null,
          ...base,
          error: 'Could not look up event availability right now. Please try again.'
        }
      }
    }

    case 'NAV_CART':
      return { success: true, data: null, ...base }

    case 'REMOVE_FROM_CART': {
      // Find event to remove — need DB lookup for the event ID
      const removeMatch = findEvent(entities.name)
      if (!removeMatch || removeMatch.confidence < 0.4) {
        return {
          success: false,
          data: null,
          ...base,
          error: `I couldn't find "${entities.name || 'that'}" to remove. Check your cart!`
        }
      }

      try {
        const dbEvents = await eventService.getPublishedEvents({ search: removeMatch.event.name, limit: 5 })
        const dbEvent = dbEvents.find(e =>
          e.title.toLowerCase() === removeMatch.event.name.toLowerCase()
        ) || dbEvents[0]

        return {
          success: true,
          data: {
            event: removeMatch.event,
            eventId: dbEvent?.id || null,
            eventTitle: removeMatch.event.name
          },
          ...base
        }
      } catch {
        return {
          success: true,
          data: {
            event: removeMatch.event,
            eventId: null,
            eventTitle: removeMatch.event.name
          },
          ...base
        }
      }
    }

    case 'CLEAR_CART':
      return { success: true, data: null, ...base }

    // ── Knowledge base — no service calls, templates have the answers ─────
    case 'INFO_WHAT_IS_CITRO':
    case 'INFO_WHO_MADE_CITRO':
    case 'INFO_EVENT_LOCATION':
    case 'INFO_EVENT_DATE':
    case 'INFO_HOW_TO_REGISTER':
    case 'INFO_TICKET_PRICE':
    case 'INFO_CONTACT':
      return { success: true, data: null, ...base }

    // ── FAQ — no service calls, templates have the answers ─────────────────
    case 'FAQ_CERTIFICATE':
    case 'FAQ_CANCEL_REGISTRATION':
    case 'FAQ_REFUND':
    case 'FAQ_TEAM_SIZE':
    case 'FAQ_WIFI':
    case 'FAQ_FOOD':
    case 'FAQ_WHAT_TO_BRING':
    case 'FAQ_PARKING':
    case 'FAQ_ACCOMMODATION':
      return { success: true, data: null, ...base }

    // ── Context-aware — pass currentPage to template ──────────────────────
    case 'CONTEXT_WHERE_AM_I':
    case 'CONTEXT_WHAT_CAN_I_DO':
      return { success: true, data: null, ...base }

    // ── Greeting / Meta / Friendly — no service calls needed ──────────────
    case 'GREETING':
    case 'HELP':
    case 'THANK_YOU':
    case 'WHO_ARE_YOU':
    case 'GOODBYE':
    case 'HOW_ARE_YOU':
    case 'COMPLIMENT':
    case 'JOKE':
    case 'BORED':
      return { success: true, data: null, ...base }

    // ── Unknown / fallback ────────────────────────────────────────────────
    default:
      return { success: false, data: null, ...base }
  }
}
