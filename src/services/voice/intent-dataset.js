/**
 * Intent Dataset — Citro
 *
 * Deterministic pattern definitions mapping phrases → intents.
 * Each intent has:
 *   - id:        unique intent key
 *   - patterns:  array of canonical English phrases that trigger this intent
 *   - entities:  optional entity extraction hints
 *   - action:    what the UI should do (navigate, display, execute)
 *
 * Patterns are matched after normalization (Hinglish → English).
 * Order matters — first match with highest confidence wins.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * INTENT CATEGORIES
 * ═══════════════════════════════════════════════════════════════════════════
 *   NAV_*           → Navigation commands (push router)
 *   QUERY_*         → Data fetch (stats, events, etc.)
 *   SEARCH_*        → Search with entity extraction
 *   REGISTER_*      → Registration flow
 *   INFO_*          → Knowledge base (about Citro, event info)
 *   CONTEXT_*       → Context-aware (current page, recently viewed)
 *   Greeting/Meta   → Conversational (hello, help, thanks)
 */

const INTENTS = [
  // ── Navigation ────────────────────────────────────────────────────────────
  {
    id: 'NAV_HOME',
    patterns: [
      'go home', 'open home', 'show home', 'home page', 'take me home',
      'go to home', 'back to home', 'main page', 'landing page'
    ],
    action: { type: 'navigate', path: '/' }
  },
  {
    id: 'NAV_DASHBOARD',
    patterns: [
      'open dashboard', 'show dashboard', 'go to dashboard', 'dashboard',
      'my dashboard', 'take me to dashboard'
    ],
    action: { type: 'navigate', path: '/dashboard' }
  },
  {
    id: 'NAV_EVENTS',
    patterns: [
      'show events', 'open events', 'go to events', 'events page',
      'all events', 'show all events', 'list events', 'events',
      'browse events', 'event list', 'see events'
    ],
    action: { type: 'navigate', path: '/events' }
  },

  {
    id: 'NAV_LOGIN',
    patterns: ['login', 'log in', 'sign in', 'go to login'],
    action: { type: 'navigate', path: '/login' }
  },
  {
    id: 'NAV_REGISTER',
    patterns: [
      'sign up', 'create account', 'go to register', 'register page',
      'registration page', 'i want to register'
    ],
    action: { type: 'navigate', path: '/register' }
  },
  {
    id: 'NAV_BACK',
    patterns: [
      'go back', 'back', 'previous page', 'take me back',
      'go to previous', 'back page'
    ],
    action: { type: 'navigate', path: 'back' }
  },

  // ── Event Queries ─────────────────────────────────────────────────────────
  {
    id: 'QUERY_UPCOMING_EVENTS',
    patterns: [
      'upcoming events', 'show upcoming events', 'what events are coming',
      'next events', 'new events', 'upcoming', 'what is coming up',
      'what events are happening', 'show me upcoming', 'any events soon',
      'events happening soon', 'what is next'
    ],
    action: { type: 'query', handler: 'getUpcomingEvents' }
  },
  {
    id: 'SEARCH_EVENT',
    patterns: [
      'search event $name', 'find event $name', 'search $name',
      'find $name event', 'look for $name', 'search for $name',
      'find $name', 'is there $name'
    ],
    entities: ['name'],
    action: { type: 'query', handler: 'searchEvents' }
  },

  // ── Registration ──────────────────────────────────────────────────────────
  {
    id: 'REGISTER_EVENT',
    patterns: [
      'register for $name', 'register do $name', 'sign up for $name',
      'do registration $name', 'register $name', 'enroll $name',
      'enroll for $name', 'join $name'
    ],
    entities: ['name'],
    action: { type: 'execute', handler: 'registerForEvent' }
  },

  // ── Dashboard Stats ───────────────────────────────────────────────────────
  {
    id: 'QUERY_STATS',
    patterns: [
      'show stats', 'dashboard stats', 'how many events',
      'total events', 'total registrations', 'show statistics',
      'give me stats', 'event count', 'numbers', 'overview'
    ],
    action: { type: 'query', handler: 'getStats' }
  },
  {
    id: 'QUERY_MY_REGISTRATIONS',
    patterns: [
      'my registrations', 'show my registrations', 'what did register for',
      'my events', 'registered events', 'show my events',
      'what am i registered for', 'my tickets'
    ],
    action: { type: 'query', handler: 'getMyRegistrations' }
  },

  // ══════════════════════════════════════════════════════════════════════════
  // ── Citro Knowledge Base — "What is Citro?" and platform info ────────────
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 'INFO_WHAT_IS_CITRO',
    patterns: [
      'what is citro', 'what is citronics', 'tell me about citro',
      'tell me about citronics', 'about citro', 'about citronics',
      'explain citro', 'what is this platform', 'what is this website',
      'what is this site', 'what does citro do', 'what is this app',
      'what is this'
    ],
    action: { type: 'reply' }
  },
  {
    id: 'INFO_WHO_MADE_CITRO',
    patterns: [
      'who made citro', 'who built citro', 'who created citro',
      'who made this', 'who built this', 'developers of citro',
      'who is behind citro', 'made by whom', 'created by'
    ],
    action: { type: 'reply' }
  },
  {
    id: 'INFO_EVENT_LOCATION',
    patterns: [
      'where is the event', 'event location', 'where is citronics',
      'location', 'venue', 'where is it happening', 'event venue',
      'address', 'where should i go', 'how to reach', 'directions',
      'where are the events'
    ],
    action: { type: 'reply' }
  },
  {
    id: 'INFO_EVENT_DATE',
    patterns: [
      'when is the event', 'event date', 'when is citronics',
      'date', 'when is it', 'when does it start', 'event time',
      'what date', 'when is it happening', 'timing'
    ],
    action: { type: 'reply' }
  },
  {
    id: 'INFO_HOW_TO_REGISTER',
    patterns: [
      'how to register', 'how do i register', 'registration process',
      'how to sign up', 'how to join', 'how to participate',
      'how can i register', 'registration steps', 'how enrollment works',
      'steps to register', 'how do i sign up'
    ],
    action: { type: 'reply' }
  },
  {
    id: 'INFO_TICKET_PRICE',
    patterns: [
      'ticket price', 'how much', 'cost', 'fees', 'is it free',
      'registration fee', 'price', 'ticket cost', 'how much does it cost',
      'entry fee', 'pricing', 'is registration free'
    ],
    action: { type: 'reply' }
  },
  {
    id: 'INFO_CONTACT',
    patterns: [
      'contact', 'contact us', 'support', 'email', 'phone number',
      'how to contact', 'helpline', 'customer support', 'reach out',
      'organizer contact', 'get in touch'
    ],
    action: { type: 'reply' }
  },

  // ══════════════════════════════════════════════════════════════════════════
  // ── Context-Aware Intents — page-relative queries ────────────────────────
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 'CONTEXT_WHERE_AM_I',
    patterns: [
      'where am i', 'what page is this', 'current page', 'which page',
      'what page', 'where am i right now'
    ],
    action: { type: 'context' }
  },
  {
    id: 'CONTEXT_WHAT_CAN_I_DO',
    patterns: [
      'what can i do here', 'what is on this page', 'what can i see',
      'options on this page', 'what is available here', 'show me options'
    ],
    action: { type: 'context' }
  },

  // ── Greetings / Meta ──────────────────────────────────────────────────────
  {
    id: 'GREETING',
    patterns: [
      'hello', 'hi', 'namaste', 'hey', 'good morning', 'good evening',
      'good afternoon', 'whats up', 'howdy', 'sup'
    ],
    action: { type: 'reply' }
  },
  {
    id: 'HELP',
    patterns: [
      'help', 'what can you do', 'commands', 'show help', 'how to use',
      'what do you do', 'your features', 'capabilities', 'assist me'
    ],
    action: { type: 'reply' }
  },
  {
    id: 'THANK_YOU',
    patterns: ['thank you', 'thanks', 'shukriya', 'dhanyavaad', 'thank'],
    action: { type: 'reply' }
  },
  {
    id: 'WHO_ARE_YOU',
    patterns: [
      'who are you', 'what are you', 'your name', 'introduce yourself',
      'are you a bot', 'are you ai', 'are you real'
    ],
    action: { type: 'reply' }
  },
  {
    id: 'GOODBYE',
    patterns: [
      'bye', 'goodbye', 'see you', 'later', 'good night',
      'take care', 'close', 'nevermind', 'never mind'
    ],
    action: { type: 'reply' }
  }
]

export default INTENTS
