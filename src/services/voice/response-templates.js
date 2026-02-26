/**
 * Response Templates — Citro
 *
 * Deterministic reply strings for each intent.
 * No AI generation — every response is pre-authored.
 *
 * Returns { reply, action, data } objects consumed by the UI layer.
 * Supports a friendly Citro personality without being chatbot-y.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * CONTEXT SYSTEM
 * ═══════════════════════════════════════════════════════════════════════════
 * Context-aware templates receive `ctx.currentPage` from the API layer
 * and use it to generate page-relative responses.
 */

// ── Page labels for context-aware responses ──────────────────────────────────
const PAGE_LABELS = {
  '/': 'the home page',
  '/dashboard': 'the dashboard',
  '/events': 'the events page',
  '/login': 'the login page',
  '/register': 'the registration page'
}

const PAGE_HINTS = {
  '/': "From here you can browse events, or ask me anything about Citronics.",
  '/dashboard': "Here you can see your stats, registrations, and manage your events.",
  '/events': "You can browse all events, search for specific ones, or register for any event you like.",
  '/login': "Enter your credentials to sign in, or say 'register' to create an account.",
  '/register': "Fill in your details to create an account and start registering for events."
}

const TEMPLATES = {
  // ── Navigation ────────────────────────────────────────────────────────────
  NAV_HOME: {
    reply: 'Taking you home!',
    action: { type: 'navigate', path: '/' }
  },
  NAV_DASHBOARD: {
    reply: 'Opening your dashboard.',
    action: { type: 'navigate', path: '/dashboard' }
  },
  NAV_EVENTS: {
    reply: 'Here are the events!',
    action: { type: 'navigate', path: '/events' }
  },
  NAV_LOGIN: {
    reply: 'Taking you to the login page.',
    action: { type: 'navigate', path: '/login' }
  },
  NAV_REGISTER: {
    reply: 'Opening the registration page.',
    action: { type: 'navigate', path: '/register' }
  },
  NAV_BACK: {
    reply: 'Going back!',
    action: { type: 'navigate', path: 'back' }
  },

  // ── Queries ───────────────────────────────────────────────────────────────
  QUERY_STATS: {
    reply: (ctx) => {
      if (!ctx.data) return 'Could not fetch stats right now.'
      const d = ctx.data
      return `Here's a quick overview: ${d.total_events} total events, ${d.active_events} active, ${d.total_registrations} registrations, and ${d.tickets_sold} tickets sold.`
    },
    action: { type: 'display', widget: 'stats' }
  },
  QUERY_UPCOMING_EVENTS: {
    reply: (ctx) => {
      if (!ctx.data || ctx.data.length === 0) return 'No upcoming events found right now.'
      const names = ctx.data.slice(0, 3).map(e => e.title).join(', ')
      return `Upcoming events: ${names}${ctx.data.length > 3 ? ` and ${ctx.data.length - 3} more.` : '.'}`
    },
    action: { type: 'display', widget: 'upcoming-events' }
  },
  SEARCH_EVENT: {
    reply: (ctx) => `Searching for "${ctx.entities?.name || 'events'}"... Let me take you to the events page.`,
    action: { type: 'navigate', path: '/events', query: true }
  },
  REGISTER_EVENT: {
    reply: (ctx) => `Starting registration for "${ctx.entities?.name || 'the event'}". Taking you to the events page!`,
    action: { type: 'navigate', path: '/events' }
  },
  QUERY_MY_REGISTRATIONS: {
    reply: 'Fetching your registrations.',
    action: { type: 'display', widget: 'my-registrations' }
  },

  // ══════════════════════════════════════════════════════════════════════════
  // ── Citro Knowledge Base ─────────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════════════
  INFO_WHAT_IS_CITRO: {
    reply: "Citronics is a tech event management platform! It's built for organizing and attending college tech fests, hackathons, workshops, and conferences. You can browse events, register, check schedules — and I'm Citro, your voice-powered guide to navigate it all!",
    action: null
  },
  INFO_WHO_MADE_CITRO: {
    reply: "Citro was built by a passionate development team as a modern event management platform. It's powered by Next.js, uses real-time data, and features me — a voice assistant to make your experience seamless!",
    action: null
  },
  INFO_EVENT_LOCATION: {
    reply: "Event locations vary depending on the specific event. Head to the events page to see venue details for each event. Want me to take you there?",
    action: { type: 'navigate', path: '/events' }
  },
  INFO_EVENT_DATE: {
    reply: "Each event has its own dates and timings. Browse the events page to see specific dates for each event. Want me to take you there?",
    action: { type: 'navigate', path: '/events' }
  },
  INFO_HOW_TO_REGISTER: {
    reply: "Easy! Just browse the events page, pick an event you're interested in, and hit the register button. No account needed upfront — you can register at checkout. Want me to show you the events?",
    action: null
  },
  INFO_TICKET_PRICE: {
    reply: "Pricing depends on the event — some are free, others may have a fee. Check the specific event's details page for pricing info. Want me to take you to the events page?",
    action: null
  },
  INFO_CONTACT: {
    reply: "For support or queries, check the contact section on the website or reach out through the organizer details on specific event pages. I'm always here to help with navigation!",
    action: null
  },

  // ══════════════════════════════════════════════════════════════════════════
  // ── Context-Aware Responses ──────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════════════
  CONTEXT_WHERE_AM_I: {
    reply: (ctx) => {
      const page = ctx.currentPage || '/'
      const label = PAGE_LABELS[page] || `the ${page.replace('/', '')} page`
      return `You're currently on ${label}.`
    },
    action: null
  },
  CONTEXT_WHAT_CAN_I_DO: {
    reply: (ctx) => {
      const page = ctx.currentPage || '/'
      const hint = PAGE_HINTS[page] || "You can navigate to events, browse the dashboard, or ask me anything about Citronics."
      return hint
    },
    action: null
  },

  // ── Greeting / Meta ───────────────────────────────────────────────────────
  GREETING: {
    reply: (ctx) => {
      const greetings = [
        "Hey there! I'm Citro, your event assistant. What can I help you with?",
        "Hello! Ready to explore Citronics? Try 'show events' or ask me anything!",
        "Hi! I'm Citro — ask me about events, navigate the site, or just say 'help'."
      ]
      return greetings[Date.now() % greetings.length]
    },
    action: null
  },
  HELP: {
    reply: "Here's what I can do:\n• Navigate — 'show events', 'open dashboard', 'go home'\n• Info — 'what is Citro?', 'when is the event?', 'how to register'\n• Search — 'find hackathon', 'upcoming events'\n• Stats — 'show stats', 'my registrations'\nJust speak naturally!",
    action: null
  },
  THANK_YOU: {
    reply: (ctx) => {
      const replies = [
        'Happy to help! Let me know if you need anything else.',
        "You're welcome! I'm here whenever you need me.",
        'Anytime! Just tap the mic if you need something.'
      ]
      return replies[Date.now() % replies.length]
    },
    action: null
  },
  WHO_ARE_YOU: {
    reply: "I'm Citro — the voice assistant for Citronics! I help you navigate the platform, find events, get info, and more — all with your voice. Think of me as your personal event concierge!",
    action: null
  },
  GOODBYE: {
    reply: (ctx) => {
      const byes = [
        'See you around! Tap the mic whenever you need me.',
        'Bye for now! I\'ll be right here if you need anything.',
        'Take care! Come back anytime.'
      ]
      return byes[Date.now() % byes.length]
    },
    action: { type: 'close' }
  },

  // ── Fallbacks ─────────────────────────────────────────────────────────────
  LOW_CONFIDENCE: {
    reply: (ctx) => `Hmm, I didn't quite catch that. Try saying things like 'show events', 'what is Citro?', or 'help' to see what I can do.`,
    action: null
  },
  UNKNOWN: {
    reply: "I'm not sure about that one. Say 'help' to see what I can do, or try asking about events, navigation, or Citronics!",
    action: null
  }
}

/**
 * buildResponse — main export
 *
 * @param {string} intent  Intent key
 * @param {object} ctx     Context data (entities, data from resolver, confidence, currentPage)
 * @returns {object}       { reply: string, action: object|null, data: any, intent, confidence }
 */
export function buildResponse(intent, ctx = {}) {
  const template = TEMPLATES[intent] || TEMPLATES.UNKNOWN

  const reply = typeof template.reply === 'function' ? template.reply(ctx) : template.reply

  return {
    reply,
    action: template.action || null,
    data: ctx.data || null,
    intent,
    confidence: ctx.confidence || 0
  }
}
