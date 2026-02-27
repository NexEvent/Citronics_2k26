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
 *
 * EVENT KNOWLEDGE — templates use ctx.data.event for event-specific replies.
 */
import { DEPARTMENTS, formatEventSummary, formatEventDetails, getDayLabel, FEST_INFO, EVENTS, getEventCount } from './event-knowledge'

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

  // ── Navigate to specific event ────────────────────────────────────────────
  NAV_EVENT: {
    reply: (ctx) => {
      if (ctx.error) return ctx.error
      const ev = ctx.data?.event
      if (!ev) return "Couldn't find that event. Try browsing the events page!"
      return `Opening "${ev.name}" — it's at ${ev.venue} on ${ev.date}. Taking you to the events page!`
    },
    speakable: true,
    action: { type: 'navigate', path: '/events' }
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
    reply: (ctx) => {
      const ev = ctx.data?.event
      if (ev) {
        return `Starting registration for "${ev.name}"! It costs ₹${ev.price} and is at ${ev.venue} on ${ev.date}. Taking you to the events page!`
      }
      return `Starting registration for "${ctx.entities?.name || 'the event'}". Taking you to the events page!`
    },
    action: { type: 'navigate', path: '/events' }
  },
  QUERY_MY_REGISTRATIONS: {
    reply: 'Fetching your registrations.',
    action: { type: 'display', widget: 'my-registrations' }
  },

  // ══════════════════════════════════════════════════════════════════════════
  // ── Event Knowledge Base — specific event queries ────────────────────────
  // ══════════════════════════════════════════════════════════════════════════
  EVENT_DETAILS: {
    reply: (ctx) => {
      if (ctx.error) return ctx.error
      const ev = ctx.data?.event
      if (!ev) return "I couldn't find that event. Try saying the full event name, like 'tell me about Robo Soccer'."
      return formatEventDetails(ev)
    },
    speakable: (ctx) => {
      const ev = ctx.data?.event
      if (!ev) return null
      return `${ev.name} is on ${ev.date} at ${ev.venue}. Entry is ${ev.price} rupees.`
    },
    action: null
  },
  EVENT_WHEN: {
    reply: (ctx) => {
      if (ctx.error) return ctx.error
      const ev = ctx.data?.event
      if (!ev) return "I couldn't find that event. Try the full event name!"
      return `📅 ${ev.name} is on ${ev.date}, from ${ev.startTime} to ${ev.endTime}.`
    },
    speakable: true,
    action: null
  },
  EVENT_WHERE: {
    reply: (ctx) => {
      if (ctx.error) return ctx.error
      const ev = ctx.data?.event
      if (!ev) return "I couldn't find that event. Try the full event name!"
      return `📍 ${ev.name} is at ${ev.venue}.`
    },
    speakable: true,
    action: null
  },
  EVENT_PRICE: {
    reply: (ctx) => {
      if (ctx.error) return ctx.error
      const ev = ctx.data?.event
      if (!ev) return "I couldn't find that event. Try the full event name!"
      return `💰 ${ev.name} costs ₹${ev.price} per entry.`
    },
    speakable: true,
    action: null
  },
  EVENT_PRIZE: {
    reply: (ctx) => {
      if (ctx.error) return ctx.error
      const ev = ctx.data?.event
      if (!ev) return "I couldn't find that event. Try the full event name!"
      return `🏆 ${ev.name} — ${ev.prize}`
    },
    speakable: true,
    action: null
  },
  DEPT_EVENTS: {
    reply: (ctx) => {
      if (ctx.error) return ctx.error
      const { department, events } = ctx.data || {}
      if (!events || events.length === 0) return `No events found for the ${department} department.`
      const deptFull = DEPARTMENTS[department] || department
      const list = events.map(e => `• ${e.name} — ${e.date}, ₹${e.price}`).join('\n')
      return `🏛️ ${deptFull} (${department}) has ${events.length} event${events.length > 1 ? 's' : ''}:\n${list}`
    },
    speakable: (ctx) => {
      const { department, events } = ctx.data || {}
      if (!events) return null
      return `${department} has ${events.length} events.`
    },
    action: null
  },
  DAY_EVENTS: {
    reply: (ctx) => {
      if (ctx.error) return ctx.error
      const { day, events } = ctx.data || {}
      if (!events || events.length === 0) return `No events found for day ${day}.`
      const label = getDayLabel(day)
      const list = events.map(e => `• ${e.name} — ${e.startTime}, ${e.venue}`).join('\n')
      return `📅 ${label} — ${events.length} events:\n${list}`
    },
    speakable: (ctx) => {
      const { day, events } = ctx.data || {}
      if (!events) return null
      return `Day ${day} has ${events.length} events.`
    },
    action: null
  },
  FEST_INFO: {
    reply: (ctx) => {
      const f = ctx.data?.fest || FEST_INFO
      return `🎪 ${f.name}\n🎨 Theme: "${f.theme}"\n📅 Dates: ${f.dates} (${f.days} days)\n📊 Total Events: ${f.totalEvents} across ${f.departments} departments\n📍 Venue: ${f.venue}\n\nAsk me about any specific event, department, or day!`
    },
    speakable: (ctx) => {
      const f = ctx.data?.fest || FEST_INFO
      return `Citronics 2026 has ${f.totalEvents} events across ${f.days} days. The theme is ${f.theme}.`
    },
    action: null
  },
  LIST_ALL_EVENTS: {
    reply: () => {
      const grouped = {}
      for (const e of EVENTS) {
        if (!grouped[e.dept]) grouped[e.dept] = []
        grouped[e.dept].push(e)
      }
      let msg = `📋 All ${getEventCount()} Citronics 2K26 Events:\n\n`
      for (const [dept, events] of Object.entries(grouped)) {
        const deptFull = DEPARTMENTS[dept] || dept
        msg += `🏛️ ${deptFull} (${dept}):\n`
        events.forEach(e => { msg += `  • ${e.name} — ${e.date}, ₹${e.price}\n` })
        msg += '\n'
      }
      msg += "Say any event name to learn more!"
      return msg
    },
    speakable: () => `There are ${getEventCount()} events across ${Object.keys(DEPARTMENTS).length} departments. Ask me about any specific event!`,
    action: null
  },
  RECOMMEND_EVENT: {
    reply: () => {
      const highlights = [
        { name: 'Shark Tank', why: '🦈 ₹30,000 prize — pitch your AI startup idea!' },
        { name: 'Codeology', why: '💻 Classic coding battle with ₹12,000 in prizes!' },
        { name: 'ROBO Soccer', why: '⚽ Build a robot and play soccer — ₹12,000 prizes!' },
        { name: 'Youth Parliament', why: '🏛️ Full-day parliamentary debate — ₹16,200 in prizes!' },
        { name: 'Master Chef', why: '👨‍🍳 Culinary showdown — cook your way to ₹8,000!' },
        { name: 'Prompt it Right', why: '🤖 AI prompt engineering contest — ₹16,000 in prizes!' },
        { name: 'Innovate 2026', why: '🚀 Mega project competition — ₹20,000+ prizes!' }
      ]
      let msg = '🌟 Top Recommended Events at Citronics 2K26:\n\n'
      highlights.forEach(h => { msg += `${h.why}\n  → ${h.name}\n\n` })
      msg += "These are crowd favorites! Say any event name to get full details."
      return msg
    },
    speakable: 'Some top picks are Shark Tank with 30,000 in prizes, Codeology for coders, Robo Soccer for robotics fans, and Prompt it Right for AI enthusiasts!',
    action: null
  },

  // ══════════════════════════════════════════════════════════════════════════
  // ── Cart / Checkout ──────────────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════════════
  ADD_TO_CART: {
    reply: (ctx) => {
      if (ctx.error) return ctx.error
      const ev = ctx.data?.event
      const cartItem = ctx.data?.cartItem
      if (!ev || !cartItem) return "I couldn't add that to your cart. Try saying the full event name!"
      return `🛒 Added "${ev.name}" to your cart!\n💰 Price: ₹${cartItem.ticketPrice}\n📍 ${ev.venue} — ${ev.date}\n\nSay 'checkout' to proceed or keep adding events!`
    },
    speakable: (ctx) => {
      const ev = ctx.data?.event
      if (!ev) return null
      return `Added ${ev.name} to your cart! Say checkout when you're ready.`
    },
    action: (ctx) => {
      if (!ctx.data?.cartItem) return null
      return { type: 'add-to-cart', cartItem: ctx.data.cartItem }
    }
  },
  ADD_CART_AND_CHECKOUT: {
    reply: (ctx) => {
      if (ctx.error) return ctx.error
      const ev = ctx.data?.event
      const cartItem = ctx.data?.cartItem
      if (!ev || !cartItem) return "I couldn't add that to your cart. Try saying the full event name!"
      return `🛒 Added "${ev.name}" to your cart! (₹${cartItem.ticketPrice})\n🚀 Taking you to checkout now!`
    },
    speakable: (ctx) => {
      const ev = ctx.data?.event
      if (!ev) return null
      return `Added ${ev.name} to your cart. Taking you to checkout!`
    },
    action: (ctx) => {
      if (!ctx.data?.cartItem) return null
      return {
        type: 'add-to-cart-and-checkout',
        cartItem: ctx.data.cartItem,
        path: '/cart'
      }
    }
  },
  NAV_CART: {
    reply: 'Opening your cart! 🛒',
    speakable: 'Opening your cart!',
    action: { type: 'navigate', path: '/cart' }
  },
  REMOVE_FROM_CART: {
    reply: (ctx) => {
      if (ctx.error) return ctx.error
      const name = ctx.data?.eventTitle || 'that event'
      return `🗑️ Removed "${name}" from your cart.`
    },
    speakable: (ctx) => {
      const name = ctx.data?.eventTitle || 'that event'
      return `Removed ${name} from your cart.`
    },
    action: (ctx) => {
      if (!ctx.data?.eventId) return null
      return { type: 'remove-from-cart', eventId: ctx.data.eventId }
    }
  },
  CLEAR_CART: {
    reply: '🗑️ Your cart has been cleared!',
    speakable: 'Cart cleared!',
    action: { type: 'clear-cart' }
  },

  // ══════════════════════════════════════════════════════════════════════════
  // ── Citro Knowledge Base ─────────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════════════
  INFO_WHAT_IS_CITRO: {
    reply: "Citronics 2K26 is the annual tech fest of CDGI & CDIP, Indore! The theme this year is 'AI for Sustainable Tomorrow'. It runs from April 8–10, 2026 with 36+ events across 14 departments — from robotics to coding to debates and cooking! And I'm Citro, your voice-powered guide to it all!",
    speakable: "Citronics 2026 is CDGI's annual tech fest with 36+ events. I'm Citro, your voice guide!",
    action: null
  },
  INFO_WHO_MADE_CITRO: {
    reply: "Citro was built by a passionate development team as the digital backbone of Citronics 2K26. It's powered by Next.js, uses real-time data, and features me — a voice assistant to make your fest experience seamless!",
    speakable: 'Citro was built by a passionate dev team.',
    action: null
  },
  INFO_EVENT_LOCATION: {
    reply: "Citronics 2K26 events are spread across the CDGI & CDIP campus — including labs, seminar halls, classrooms, lawns, the auditorium, and even the swimming pool! Each event has its own venue. Ask me about a specific event like 'where is Robo Soccer?' to get its exact location.",
    speakable: 'Events are at the CDGI campus. Ask about a specific event for its venue.',
    action: null
  },
  INFO_EVENT_DATE: {
    reply: "Citronics 2K26 runs for 3 days:\n• Day 1: April 8, 2026\n• Day 2: April 9, 2026\n• Day 3: April 10, 2026\n\nAsk me 'day 1 events' or 'when is Codeology?' for specifics!",
    speakable: 'Citronics runs April 8 to 10, 2026. Ask about a specific event for its timing.',
    action: null
  },
  INFO_HOW_TO_REGISTER: {
    reply: "Easy! Browse the events page, pick an event you like, and hit the register button. You can also say 'register for Robo Soccer' and I'll help you get started!",
    speakable: 'Browse events, pick one, and hit register!',
    action: null
  },
  INFO_TICKET_PRICE: {
    reply: "Prices vary by event — from as low as ₹50 (Zenga Block, Newspaper Tall Structure) to ₹700 (Youth Parliament). Most events are ₹100–₹200. Ask me 'price of [event name]' for specifics!",
    speakable: 'Prices range from 50 to 700 rupees. Ask about a specific event.',
    action: null
  },
  INFO_CONTACT: {
    reply: "For support or queries, check the contact section on the website or reach out through the organizer details on specific event pages. I'm always here to help with navigation!",
    speakable: 'Check the contact section for support.',
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
    speakable: true,
    action: null
  },
  CONTEXT_WHAT_CAN_I_DO: {
    reply: (ctx) => {
      const page = ctx.currentPage || '/'
      const hint = PAGE_HINTS[page] || "You can navigate to events, browse the dashboard, or ask me anything about Citronics."
      return hint
    },
    speakable: true,
    action: null
  },

  // ══════════════════════════════════════════════════════════════════════════
  // ── Greeting / Friendly Chat / Meta ──────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════════════
  GREETING: {
    reply: (ctx) => {
      const hour = new Date().getHours()
      let timeGreeting = 'Hey'
      if (hour < 12) timeGreeting = 'Good morning'
      else if (hour < 17) timeGreeting = 'Good afternoon'
      else timeGreeting = 'Good evening'

      const greetings = [
        `${timeGreeting}! I'm Citro, your Citronics fest buddy! 🎉 Ask me about any event, or say 'help' to see what I can do.`,
        `${timeGreeting}! Welcome to Citronics 2K26! I know all about the 36+ events happening April 8–10. What would you like to know?`,
        `Hey there! 👋 I'm Citro — your fest guide. Try asking me 'what events does CSE have?' or 'tell me about Robo Soccer'!`
      ]
      return greetings[Date.now() % greetings.length]
    },
    speakable: 'Hey! I\'m Citro, your fest buddy. Ask me about any event!',
    action: null
  },
  HOW_ARE_YOU: {
    reply: (ctx) => {
      const replies = [
        "I'm doing great, thanks for asking! 😊 I've been helping people navigate Citronics all day. What can I do for you?",
        "I'm fantastic! Buzzing with excitement for Citronics 2K26! 🎉 How can I help you?",
        "I'm good! Always ready to help. Want to hear about some cool events? 🚀"
      ]
      return replies[Date.now() % replies.length]
    },
    speakable: "I'm doing great! How can I help you?",
    action: null
  },
  COMPLIMENT: {
    reply: (ctx) => {
      const replies = [
        "Aww, that's so kind of you! 😊 You just made my circuits happy! Let me know if I can help with anything.",
        "Thanks! You're pretty awesome yourself! 🌟 Want to explore some events?",
        "You're too sweet! 💫 I'm here whenever you need me. Ask away!",
        "That means a lot! I try my best. 😄 Anything else I can help with?"
      ]
      return replies[Date.now() % replies.length]
    },
    speakable: "Thanks, that's so kind!",
    action: null
  },
  JOKE: {
    reply: (ctx) => {
      const jokes = [
        "Why do programmers prefer dark mode? Because light attracts bugs! 🐛😄",
        "Why did the robot go to Citronics? Because it heard there was a ROBO Soccer match! ⚽🤖",
        "What's a robot's favorite type of music? Heavy metal! 🤘 ...Okay, I'll stick to being a fest guide.",
        "Why was the computer cold at Citronics? It left its Windows open! 🥶💻",
        "I'd tell you a UDP joke, but you might not get it. 😅"
      ]
      return jokes[Date.now() % jokes.length]
    },
    speakable: true,
    action: null
  },
  BORED: {
    reply: (ctx) => {
      const suggestions = [
        "Bored? Not on my watch! 🎮 Here are some cool events:\n• 🤖 ROBO Soccer — robot football at Admission Lawn!\n• 👨‍🍳 Master Chef — cooking competition by CDIPS!\n• 💻 Codeology — coding battle by CSE!\nSay any event name to learn more!",
        "How about checking out some exciting events? 🎉 You could try Shark Tank (₹30K prize!), Youth Parliament, or Prompt it Right. Just ask me about any of them!",
        "Time to explore Citronics! Say 'show events' to browse all events, or ask me about a specific department like 'CSE events' or 'MBA events'."
      ]
      return suggestions[Date.now() % suggestions.length]
    },
    speakable: 'Check out events like Robo Soccer, Master Chef, or Codeology. Just ask me about any event!',
    action: null
  },
  HELP: {
    reply: "Here's what I can do:\n• 📍 Navigate — 'show events', 'open dashboard', 'go home'\n• 🔍 Event Info — 'tell me about Robo Soccer', 'when is Codeology?'\n• 💰 Pricing — 'price of Master Chef', 'how much is Shark Tank?'\n• 🏆 Prizes — 'prize of Robo Race'\n• 🏛️ Departments — 'CSE events', 'MBA events'\n• 📅 Schedule — 'day 1 events', 'day 2 events'\n• 📊 Stats — 'show stats', 'my registrations'\n• 💬 Chat — just say hi! I'm friendly 😊\n\nJust speak naturally!",
    speakable: 'I can help with events, navigation, pricing, prizes, and more. Just speak naturally!',
    action: null
  },
  THANK_YOU: {
    reply: (ctx) => {
      const replies = [
        'Happy to help! 😊 Let me know if you need anything else.',
        "You're welcome! I'm here whenever you need me. Enjoy Citronics! 🎉",
        'Anytime! Just tap the mic if you need something. 🎤'
      ]
      return replies[Date.now() % replies.length]
    },
    speakable: true,
    action: null
  },
  WHO_ARE_YOU: {
    reply: "I'm Citro — the voice assistant for Citronics 2K26! 🤖 I know everything about all 36+ events happening April 8–10. I can tell you about events, venues, prizes, schedules, and help you navigate. Think of me as your personal fest concierge!",
    speakable: "I'm Citro, your voice assistant for Citronics! I know everything about the fest.",
    action: null
  },
  GOODBYE: {
    reply: (ctx) => {
      const byes = [
        'See you at Citronics! 🎉 Tap the mic whenever you need me.',
        "Bye for now! Enjoy the fest! I'll be right here if you need anything. 👋",
        'Take care! Come back anytime. Citronics 2K26 is going to be amazing! 🚀'
      ]
      return byes[Date.now() % byes.length]
    },
    speakable: true,
    action: { type: 'close' }
  },

  // ── Fallbacks ─────────────────────────────────────────────────────────────
  LOW_CONFIDENCE: {
    reply: (ctx) => {
      const hints = [
        `Hmm, I didn't quite catch that. Try asking about a specific event like 'tell me about Codeology' or say 'help' to see what I can do!`,
        `I'm not sure what you mean. You can ask me things like 'when is Robo Soccer?', 'CSE events', or 'show events'.`,
        `Sorry, I couldn't understand that. Try saying an event name, or ask 'what events does MBA have?'`
      ]
      return hints[Date.now() % hints.length]
    },
    speakable: "Sorry, I didn't quite catch that. Try asking about a specific event or say help.",
    action: null
  },
  UNKNOWN: {
    reply: "I'm not sure about that one. I'm best at answering questions about Citronics events! Try asking 'tell me about Robo Soccer', 'CSE events', or say 'help' to see what I can do. 😊",
    speakable: "I'm not sure about that. Ask about events or say help for options.",
    action: null
  },

  // ══════════════════════════════════════════════════════════════════════════
  // ── FAQ Responses ────────────────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════════════
  FAQ_CERTIFICATE: {
    reply: "Certificates depend on the specific event. Most workshops and competitions at Citronics provide participation certificates. Check the event details page for confirmation, or ask the department coordinator.",
    speakable: 'Most events provide certificates. Check the event details.',
    action: null
  },
  FAQ_CANCEL_REGISTRATION: {
    reply: "To cancel a registration, go to your dashboard and find the event under 'My Registrations'. If a cancel option is available, you can use it there. For further help, contact the event organizer.",
    speakable: 'Go to your dashboard to cancel a registration.',
    action: null
  },
  FAQ_REFUND: {
    reply: "Refund policies vary by event. Contact the event organizer or department coordinator for specific refund requests.",
    speakable: 'Refund policies vary. Contact the organizer.',
    action: null
  },
  FAQ_TEAM_SIZE: {
    reply: "Team size requirements vary by event. Some are solo, others need teams. Check the specific event's details page — or ask me about a specific event and I'll tell you!",
    speakable: 'Team sizes vary by event. Ask about a specific one.',
    action: null
  },
  FAQ_WIFI: {
    reply: "Wi-Fi is available across the CDGI/CDIP campus for participants during Citronics.",
    speakable: 'Wi-Fi is available at the campus.',
    action: null
  },
  FAQ_FOOD: {
    reply: "Food stalls and refreshments are available at the fest venue. Some events like Master Chef even feature cooking competitions! 👨‍🍳",
    speakable: 'Food stalls are available at the venue.',
    action: null
  },
  FAQ_WHAT_TO_BRING: {
    reply: "What you need depends on the event type. For coding events, bring your laptop and charger. For robotics events (Robo Soccer, Robo Race, etc.), bring your robot and tools. A valid college ID is usually required for check-in.",
    speakable: 'Bring your laptop and ID. Check event prerequisites.',
    action: null
  },
  FAQ_PARKING: {
    reply: "Parking is available at the CDGI/CDIP campus. Follow the signage for visitor parking during Citronics.",
    speakable: 'Parking is available at the campus.',
    action: null
  },
  FAQ_ACCOMMODATION: {
    reply: "For accommodation queries, contact the Core Team or your department coordinator. The campus is in Indore, so local students can commute easily.",
    speakable: 'Contact the Core Team for accommodation.',
    action: null
  }
}

/**
 * buildResponse — main export
 *
 * @param {string} intent  Intent key
 * @param {object} ctx     Context data (entities, data from resolver, confidence, currentPage)
 * @returns {object}       { reply, speakable, action, data, intent, confidence }
 *
 * The `speakable` field controls TTS behavior:
 *   - true       → speak the full reply text
 *   - string     → speak only this short summary instead of the full reply
 *   - function   → call with ctx and use the returned string (or null to skip)
 *   - false/null → do not speak at all
 */
export function buildResponse(intent, ctx = {}) {
  const template = TEMPLATES[intent] || TEMPLATES.UNKNOWN

  const reply = typeof template.reply === 'function' ? template.reply(ctx) : template.reply

  // Resolve what to speak: true = full reply, string = summary, function = dynamic, falsy = nothing
  let speakText = null
  if (typeof template.speakable === 'function') {
    speakText = template.speakable(ctx)
  } else if (template.speakable === true) {
    speakText = reply
  } else if (typeof template.speakable === 'string') {
    speakText = template.speakable
  }

  // Resolve action: can be a function (for dynamic cart actions) or static object
  const action = typeof template.action === 'function' ? template.action(ctx) : (template.action || null)

  return {
    reply,
    speakText,
    action,
    data: ctx.data || null,
    intent,
    confidence: ctx.confidence || 0
  }
}
