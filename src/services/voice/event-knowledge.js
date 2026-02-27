/**
 * Event Knowledge Base — Citro
 *
 * Static knowledge about all Citronics 2026 events, departments, and schedule.
 * Used by the voice assistant to answer event-specific questions without
 * hitting the database — instant, deterministic responses.
 *
 * Data sourced from the official event SQL seed.
 * Dates: April 8–10, 2026 | Theme: "AI for Sustainable Tomorrow"
 */

// ── Departments ──────────────────────────────────────────────────────────────
export const DEPARTMENTS = {
  ME:        'Mechanical Engineering',
  EC:        'Electronics & Communication Engineering',
  CIVIL:     'Civil Engineering',
  CSE:       'Computer Science & Engineering',
  IT:        'Information Technology',
  CI:        'Computer Informatics',
  AD:        'Artificial Intelligence & Data Science',
  Pharma:    'Pharmacy',
  ESH:       'Engineering Sciences & Humanities',
  PAHAL:     'PAHAL — Project & Hardware Lab',
  CDIPS:     'CDIPS',
  MBA:       'Master of Business Administration',
  CDIL:      'CDIL',
  'Core Team': 'Core Organizing Team'
}

// ── Events ───────────────────────────────────────────────────────────────────
// Each event: { name, dept, venue, day, startTime, endTime, price, maxTickets, prize, tags }
// day: 1 = April 8, day: 2 = April 9, day: 3 = April 10 (multi-day events get array)

export const EVENTS = [
  // ── Mechanical Engineering (ME) ──
  {
    name: 'Battle of Design',
    dept: 'ME',
    venue: 'CAD Lab',
    days: [1],
    startTime: '12:00 PM',
    endTime: '4:00 PM',
    date: 'April 8, 2026',
    price: 100,
    maxTickets: 10,
    prize: 'Total ₹5,000 — 1st ₹2,500, 2nd ₹1,500, 3rd ₹1,000',
    tags: ['ME', 'design', 'CAD']
  },
  {
    name: 'Auto Quest',
    dept: 'ME',
    venue: 'SAE Lab',
    days: [2],
    startTime: '10:00 AM',
    endTime: '4:00 PM',
    date: 'April 9, 2026',
    price: 100,
    maxTickets: 10,
    prize: 'Total ₹5,000 — 1st ₹2,500, 2nd ₹1,500, 3rd ₹1,000',
    tags: ['ME', 'automobile']
  },

  // ── Electronics & Communication (EC) ──
  {
    name: 'ROBO Soccer',
    dept: 'EC',
    venue: 'Admission Lawn',
    days: [1, 2],
    startTime: '12:00 PM',
    endTime: '4:00 PM',
    date: 'April 8–9, 2026',
    price: 500,
    maxTickets: 15,
    prize: 'Total ₹10,000 — 1st ₹5,000, 2nd ₹3,000, 3rd ₹2,000',
    tags: ['EC', 'robotics', 'soccer']
  },
  {
    name: 'ROBO Race',
    dept: 'EC',
    venue: 'To decide with Arena',
    days: [1, 2],
    startTime: '12:00 PM',
    endTime: '4:00 PM',
    date: 'April 8–9, 2026',
    price: 500,
    maxTickets: 20,
    prize: 'Total ₹15,000 — 1st ₹8,000, 2nd ₹5,000, 3rd ₹2,000',
    tags: ['EC', 'robotics', 'race']
  },
  {
    name: 'Line Follower',
    dept: 'EC',
    venue: 'Class Room',
    days: [2],
    startTime: '10:00 AM',
    endTime: '3:00 PM',
    date: 'April 9, 2026',
    price: 500,
    maxTickets: 20,
    prize: 'Total ₹12,000 — 1st ₹7,000, 2nd ₹3,500, 3rd ₹1,500',
    tags: ['EC', 'robotics', 'line follower']
  },
  {
    name: 'ROBO Swim',
    dept: 'EC',
    venue: 'Swimming Pool',
    days: [3],
    startTime: '10:00 AM',
    endTime: '1:00 PM',
    date: 'April 10, 2026',
    price: 500,
    maxTickets: 10,
    prize: 'Total ₹8,000 — 1st ₹5,000, 2nd ₹2,000, 3rd ₹1,000',
    tags: ['EC', 'robotics', 'swim']
  },

  // ── Civil Engineering ──
  {
    name: 'Arch Mania',
    dept: 'CIVIL',
    venue: 'Lawn',
    days: [1],
    startTime: '12:00 PM',
    endTime: '4:00 PM',
    date: 'April 8, 2026',
    price: 100,
    maxTickets: 20,
    prize: 'Total ₹3,000 — 1st ₹1,500, 2nd ₹1,000, 3rd ₹500',
    tags: ['CIVIL', 'architecture']
  },
  {
    name: 'Newspaper Tall Structure',
    dept: 'CIVIL',
    venue: 'Smart Classroom',
    days: [2],
    startTime: '10:00 AM',
    endTime: '4:00 PM',
    date: 'April 9, 2026',
    price: 50,
    maxTickets: 20,
    prize: 'Total ₹2,000 — 1st ₹1,000, 2nd ₹600, 3rd ₹400',
    tags: ['CIVIL', 'structure', 'building']
  },
  {
    name: 'ZENGA Block',
    dept: 'CIVIL',
    venue: 'Lawn',
    days: [3],
    startTime: '10:00 AM',
    endTime: '12:00 PM',
    date: 'April 10, 2026',
    price: 50,
    maxTickets: 20,
    prize: 'Total ₹2,000 — 1st ₹1,000, 2nd ₹600, 3rd ₹400',
    tags: ['CIVIL', 'jenga', 'blocks']
  },

  // ── Computer Science & Engineering (CSE) ──
  {
    name: 'Codeology',
    dept: 'CSE',
    venue: 'Lab 8 & 9',
    days: [1],
    startTime: '12:00 PM',
    endTime: '3:00 PM',
    date: 'April 8, 2026',
    price: 100,
    maxTickets: 35,
    prize: 'Total ₹5,000 — 1st ₹3,000, 2nd ₹1,200, 3rd ₹800',
    tags: ['CSE', 'coding', 'programming']
  },
  {
    name: 'Build your own Chatbot',
    dept: 'CSE',
    venue: 'Lab 6',
    days: [2],
    startTime: '10:00 AM',
    endTime: '2:00 PM',
    date: 'April 9, 2026',
    price: 200,
    maxTickets: 25,
    prize: 'Total ₹10,000 — 1st ₹5,000, 2nd ₹3,000, 3rd ₹2,000',
    tags: ['CSE', 'AI', 'chatbot']
  },
  {
    name: 'DesignVerse: UI/UX & AI Design Challenge',
    dept: 'CSE',
    venue: 'Lab 8 & 9',
    days: [3],
    startTime: '10:00 AM',
    endTime: '2:00 PM',
    date: 'April 10, 2026',
    price: 100,
    maxTickets: 50,
    prize: 'Total ₹10,000 — 1st ₹5,000, 2nd ₹3,000, 3rd ₹2,000',
    tags: ['CSE', 'UI/UX', 'design', 'AI']
  },

  // ── Information Technology (IT) ──
  {
    name: 'The Tech - Commercial show',
    dept: 'IT',
    venue: 'CDIPS Auditorium',
    days: [1],
    startTime: '1:00 PM',
    endTime: '4:00 PM',
    date: 'April 8, 2026',
    price: 100,
    maxTickets: 20,
    prize: 'Total ₹3,500 — 1st ₹2,000, 2nd ₹1,000, 3rd ₹500',
    tags: ['IT', 'tech', 'commercial']
  },

  // ── Computer Informatics (CI) ──
  {
    name: 'AI Image Story Creation',
    dept: 'CI',
    venue: 'Lab 7',
    days: [1],
    startTime: '1:00 PM',
    endTime: '4:00 PM',
    date: 'April 8, 2026',
    price: 100,
    maxTickets: 35,
    prize: 'Total ₹5,000 — 1st ₹3,000, 2nd ₹1,200, 3rd ₹800',
    tags: ['CI', 'AI', 'image', 'story']
  },

  // ── AI & Data Science (AD) ──
  {
    name: 'Prompt it Right – AI Image Prompt Battle',
    dept: 'AD',
    venue: 'Lab 109',
    days: [3],
    startTime: '10:00 AM',
    endTime: '1:00 PM',
    date: 'April 10, 2026',
    price: 100,
    maxTickets: 80,
    prize: 'Total ₹8,000 — 1st ₹5,000, 2nd ₹2,000, 3rd ₹1,000',
    tags: ['AD', 'AI', 'prompt', 'image']
  },

  // ── Pharmacy ──
  {
    name: 'Pharmathon',
    dept: 'Pharma',
    venue: 'CDIP',
    days: [1],
    startTime: '12:00 PM',
    endTime: '4:00 PM',
    date: 'April 8, 2026',
    price: 150,
    maxTickets: 20,
    prize: 'Total ₹9,000 — 1st ₹5,000, 2nd ₹3,000, 3rd ₹1,000',
    tags: ['Pharma', 'pharmacy']
  },
  {
    name: 'Pharma Model',
    dept: 'Pharma',
    venue: 'CDIP',
    days: [2],
    startTime: '9:00 AM',
    endTime: '4:00 PM',
    date: 'April 9, 2026',
    price: 150,
    maxTickets: 20,
    prize: 'Total ₹9,000 — 1st ₹5,000, 2nd ₹3,000, 3rd ₹1,000',
    tags: ['Pharma', 'model']
  },
  {
    name: 'Pharma Innoventia',
    dept: 'Pharma',
    venue: 'CDIP',
    days: [3],
    startTime: '9:00 AM',
    endTime: '4:00 PM',
    date: 'April 10, 2026',
    price: 150,
    maxTickets: 20,
    prize: 'Total ₹9,000 — 1st ₹5,000, 2nd ₹3,000, 3rd ₹1,000',
    tags: ['Pharma', 'innovation']
  },

  // ── Engineering Sciences & Humanities (ESH) ──
  {
    name: 'INNOVATE 2026: Science Model Exhibition',
    dept: 'ESH',
    venue: 'Drawing Lab',
    days: [2],
    startTime: '10:00 AM',
    endTime: '4:00 PM',
    date: 'April 9, 2026',
    price: 200,
    maxTickets: 60,
    prize: 'Total ₹15,000 — 1st ₹8,000, 2nd ₹5,000, 3rd ₹2,000',
    tags: ['ESH', 'science', 'model', 'exhibition']
  },

  // ── PAHAL — Project & Hardware Lab ──
  {
    name: 'Project Competition-Software',
    dept: 'PAHAL',
    venue: 'Seminar Hall 1',
    days: [2],
    startTime: '9:00 AM',
    endTime: '4:00 PM',
    date: 'April 9, 2026',
    price: 500,
    maxTickets: 10,
    prize: 'Total ₹25,000 — 1st ₹12,000, 2nd ₹8,000, 3rd ₹5,000',
    tags: ['PAHAL', 'project', 'software']
  },
  {
    name: 'Project Competition-Hardware',
    dept: 'PAHAL',
    venue: 'Seminar Hall 1',
    days: [3],
    startTime: '12:00 PM',
    endTime: '4:00 PM',
    date: 'April 10, 2026',
    price: 500,
    maxTickets: 10,
    prize: 'Total ₹25,000 — 1st ₹12,000, 2nd ₹8,000, 3rd ₹5,000',
    tags: ['PAHAL', 'project', 'hardware']
  },

  // ── CDIPS ──
  {
    name: 'Master Chef',
    dept: 'CDIPS',
    venue: 'CDIPS Entrance',
    days: [1],
    startTime: '12:00 PM',
    endTime: '4:00 PM',
    date: 'April 8, 2026',
    price: 300,
    maxTickets: 30,
    prize: 'Total ₹10,000 — 1st ₹5,000, 2nd ₹3,000, 3rd ₹2,000',
    tags: ['CDIPS', 'cooking', 'chef']
  },
  {
    name: 'Boardroom Battle',
    dept: 'CDIPS',
    venue: 'Classroom',
    days: [1],
    startTime: '12:00 PM',
    endTime: '4:00 PM',
    date: 'April 8, 2026',
    price: 200,
    maxTickets: 15,
    prize: 'Total ₹5,000 — 1st ₹3,000, 2nd ₹1,200, 3rd ₹800',
    tags: ['CDIPS', 'business', 'strategy']
  },
  {
    name: 'Reel to Deal',
    dept: 'CDIPS',
    venue: 'Seminar Hall 2 for Judgement',
    days: [1, 2],
    startTime: '9:00 AM',
    endTime: '5:00 PM',
    date: 'April 8–9, 2026',
    price: 250,
    maxTickets: 15,
    prize: 'Total ₹5,000 — 1st ₹3,000, 2nd ₹1,200, 3rd ₹800',
    tags: ['CDIPS', 'reel', 'content']
  },
  {
    name: 'Clash of Titan',
    dept: 'CDIPS',
    venue: 'Classroom',
    days: [2],
    startTime: '10:00 AM',
    endTime: '1:00 PM',
    date: 'April 9, 2026',
    price: 300,
    maxTickets: 15,
    prize: 'Total ₹5,000 — 1st ₹3,000, 2nd ₹1,200, 3rd ₹800',
    tags: ['CDIPS', 'competition']
  },
  {
    name: 'Tech Bingo (Tambola)',
    dept: 'CDIPS',
    venue: 'MP Theater',
    days: [2],
    startTime: '10:00 AM',
    endTime: '1:00 PM',
    date: 'April 9, 2026',
    price: 100,
    maxTickets: 25,
    prize: 'Total ₹5,000 — 1st ₹3,000, 2nd ₹1,200, 3rd ₹800',
    tags: ['CDIPS', 'bingo', 'tambola', 'fun']
  },

  // ── MBA ──
  {
    name: 'AI Slave',
    dept: 'MBA',
    venue: 'Lab 109',
    days: [1],
    startTime: '12:00 PM',
    endTime: '4:00 PM',
    date: 'April 8, 2026',
    price: 150,
    maxTickets: 20,
    prize: 'Total ₹8,000 — 1st ₹5,000, 2nd ₹2,000, 3rd ₹1,000',
    tags: ['MBA', 'AI']
  },
  {
    name: 'AD-MAD Show',
    dept: 'MBA',
    venue: 'Seminar Hall 2',
    days: [1, 2],
    startTime: '12:00 PM',
    endTime: '3:00 PM',
    date: 'April 8–9, 2026',
    price: 250,
    maxTickets: 20,
    prize: 'Total ₹8,000 — 1st ₹5,000, 2nd ₹2,000, 3rd ₹1,000',
    tags: ['MBA', 'advertising', 'marketing']
  },
  {
    name: 'Brand Quiz',
    dept: 'MBA',
    venue: 'CDIPS Auditorium',
    days: [2],
    startTime: '9:00 AM',
    endTime: '12:00 PM',
    date: 'April 9, 2026',
    price: 150,
    maxTickets: 20,
    prize: 'Total ₹8,000 — 1st ₹5,000, 2nd ₹2,000, 3rd ₹1,000',
    tags: ['MBA', 'quiz', 'brand']
  },
  {
    name: 'Share Market Simulation',
    dept: 'MBA',
    venue: 'Lab 109',
    days: [2],
    startTime: '12:00 PM',
    endTime: '4:00 PM',
    date: 'April 9, 2026',
    price: 150,
    maxTickets: 20,
    prize: 'Total ₹8,000 — 1st ₹5,000, 2nd ₹2,000, 3rd ₹1,000',
    tags: ['MBA', 'stock', 'finance', 'simulation']
  },
  {
    name: 'Business Ethics Decision Making',
    dept: 'MBA',
    venue: 'Class Room, Interview Room',
    days: [3],
    startTime: '9:00 AM',
    endTime: '12:00 PM',
    date: 'April 10, 2026',
    price: 150,
    maxTickets: 20,
    prize: 'Total ₹8,000 — 1st ₹5,000, 2nd ₹2,000, 3rd ₹1,000',
    tags: ['MBA', 'ethics', 'business']
  },

  // ── CDIL ──
  {
    name: 'Debate Competition',
    dept: 'CDIL',
    venue: 'MP Theater',
    days: [1],
    startTime: '12:00 PM',
    endTime: '4:00 PM',
    date: 'April 8, 2026',
    price: 200,
    maxTickets: 20,
    prize: 'Total ₹6,000 — 1st ₹4,000, 2nd ₹2,000',
    tags: ['CDIL', 'debate', 'speaking']
  },
  {
    name: 'Youth Parliament',
    dept: 'CDIL',
    venue: 'Chankya Sabhagrah',
    days: [2],
    startTime: '9:00 AM',
    endTime: '3:00 PM',
    date: 'April 9, 2026',
    price: 700,
    maxTickets: 30,
    prize: 'Total ₹16,200 — 1st ₹11,100, 2nd ₹5,100',
    tags: ['CDIL', 'parliament', 'politics', 'debate']
  },

  // ── Core Team ──
  {
    name: 'Reel Making Competition on CITRONICS 2K26 Theme',
    dept: 'Core Team',
    venue: 'Seminar Hall 1 for Judgement',
    days: [1, 2, 3],
    startTime: '9:00 AM',
    endTime: '5:00 PM',
    date: 'April 8–10, 2026',
    price: 200,
    maxTickets: 10,
    prize: 'Total ₹5,000 — 1st ₹3,000, 2nd ₹2,000',
    tags: ['Core Team', 'reel', 'video', 'content']
  },
  {
    name: 'Shark Tank: AI theme Indore City Problem',
    dept: 'Core Team',
    venue: 'CDIPS Auditorium',
    days: [1, 2],
    startTime: '9:00 AM',
    endTime: '5:00 PM',
    date: 'April 8–9, 2026',
    price: 500,
    maxTickets: 30,
    prize: 'Total ₹30,000 — 1st ₹30,000',
    tags: ['Core Team', 'shark tank', 'AI', 'startup', 'pitch']
  }
]

// ── Day labels ───────────────────────────────────────────────────────────────
const DAY_LABELS = { 1: 'Day 1 (April 8)', 2: 'Day 2 (April 9)', 3: 'Day 3 (April 10)' }
const DAY_DATES  = { 1: 'April 8, 2026', 2: 'April 9, 2026', 3: 'April 10, 2026' }

// ── Alias map for fuzzy matching (lowercase key → event name) ────────────────
const ALIASES = {}
const NAME_INDEX = []

// Speech-to-text commonly mishears certain event names.
// Map misheard variants so findEvent() catches them.
const SPEECH_EVENT_ALIASES = {
  'cardiology': 'Codeology',
  'codiology': 'Codeology',
  'code ology': 'Codeology',
  'cold ology': 'Codeology',
  'pharma tone': 'Pharmathon',
  'farmathon': 'Pharmathon',
  'pharmacy thon': 'Pharmathon',
  'pharma thon': 'Pharmathon',
  'pharmacon': 'Pharmathon',
  'zinga': 'Zenga Block',
  'genga': 'Zenga Block',
  'jenga': 'Zenga Block',
  'jenga block': 'Zenga Block',
  'robo race': 'ROBO Race',
  'robot race': 'ROBO Race',
  'robo swim': 'ROBO Swim',
  'robot swim': 'ROBO Swim',
  'robo soccer': 'ROBO Soccer',
  'robot soccer': 'ROBO Soccer',
  'shark tank': 'Shark Tank: AI theme Indore City Problem',
  'ad mad': 'Ad-Mad Show',
  'admad': 'Ad-Mad Show',
  'ad mad show': 'Ad-Mad Show',
  'master chef': 'Master Chef',
  'masterchef': 'Master Chef',
  'master shift': 'Master Chef',
  'real to deal': 'Reel to Deal',
  'real to reel': 'Reel to Deal',
  'clash of titans': 'Clash of Titan',
  'brand quiz': 'Brand Quiz',
  'tech bingo': 'Tech Bingo (Tambola)',
  'tambola': 'Tech Bingo (Tambola)',
  'design verse': 'DesignVerse',
  'designverse': 'DesignVerse',
  'line follower': 'Line Follower',
  'ai slave': 'AI Slave',
  'prompt it right': 'Prompt it Right',
  'youth parliament': 'Youth Parliament',
  'battle of design': 'Battle of Design',
  'debate competition': 'Debate Competition'
}

for (const event of EVENTS) {
  const lower = event.name.toLowerCase()
  NAME_INDEX.push({ lower, event })

  // Generate aliases: full name, words, abbreviations
  ALIASES[lower] = event

  // Common short forms
  const words = lower.replace(/[^a-z0-9 ]/g, '').split(/\s+/)
  if (words.length >= 2) {
    // Two-word prefix alias: "robo soccer" for "ROBO Soccer"
    ALIASES[words.slice(0, 2).join(' ')] = event
    // Last two words
    if (words.length > 2) {
      ALIASES[words.slice(-2).join(' ')] = event
    }
  }
}

// Register speech-misheard aliases so findEvent() returns the right event
for (const [misheard, correctName] of Object.entries(SPEECH_EVENT_ALIASES)) {
  const event = EVENTS.find(e => e.name === correctName)
  if (event) ALIASES[misheard.toLowerCase()] = event
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── Lookup Functions ─────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * findEvent — fuzzy match an event by name query.
 * Returns { event, confidence } or null.
 */
export function findEvent(query) {
  if (!query || typeof query !== 'string') return null

  const q = query.toLowerCase().trim().replace(/[^a-z0-9 ]/g, '')
  if (!q) return null

  // 1. Exact alias match
  if (ALIASES[q]) return { event: ALIASES[q], confidence: 1.0 }

  // 2. Substring match — query inside event name or vice versa
  let bestMatch = null
  let bestScore = 0

  for (const { lower, event } of NAME_INDEX) {
    const cleanLower = lower.replace(/[^a-z0-9 ]/g, '')

    // Exact substring
    if (cleanLower.includes(q) || q.includes(cleanLower)) {
      const score = q.length / Math.max(cleanLower.length, q.length)
      if (score > bestScore) {
        bestScore = Math.min(score + 0.3, 1.0) // boost substring matches
        bestMatch = event
      }
    }

    // Word overlap
    const qWords = q.split(/\s+/)
    const eWords = cleanLower.split(/\s+/)
    let matches = 0
    for (const w of qWords) {
      if (eWords.some(ew => ew.includes(w) || w.includes(ew))) matches++
    }
    if (matches > 0) {
      const overlap = matches / Math.max(qWords.length, eWords.length)
      const score = overlap * 0.85
      if (score > bestScore) {
        bestScore = score
        bestMatch = event
      }
    }
  }

  if (bestMatch && bestScore >= 0.4) {
    return { event: bestMatch, confidence: bestScore }
  }

  return null
}

/**
 * getEventsByDepartment — all events for a department code.
 */
export function getEventsByDepartment(deptCode) {
  if (!deptCode) return []
  const upper = deptCode.toUpperCase()
  // Handle case-insensitive and common variants
  return EVENTS.filter(e => {
    const eDept = e.dept.toUpperCase()
    return eDept === upper || eDept.startsWith(upper)
  })
}

/**
 * getEventsByDay — all events on a specific day (1, 2, or 3).
 */
export function getEventsByDay(day) {
  const d = parseInt(day)
  if (![1, 2, 3].includes(d)) return []
  return EVENTS.filter(e => e.days.includes(d))
}

/**
 * getDayLabel — human-readable day label.
 */
export function getDayLabel(day) {
  return DAY_LABELS[day] || `Day ${day}`
}

/**
 * formatEventSummary — one-line summary for an event.
 */
export function formatEventSummary(event) {
  return `${event.name} — ${event.date}, ${event.startTime}–${event.endTime} at ${event.venue} (₹${event.price})`
}

/**
 * formatEventDetails — detailed multi-line info for an event.
 */
export function formatEventDetails(event) {
  const deptFull = DEPARTMENTS[event.dept] || event.dept
  return [
    `📌 ${event.name}`,
    `🏛️ Department: ${deptFull} (${event.dept})`,
    `📍 Venue: ${event.venue}`,
    `📅 Date: ${event.date}`,
    `⏰ Time: ${event.startTime} – ${event.endTime}`,
    `💰 Price: ₹${event.price}`,
    `🏆 Prize: ${event.prize}`,
    `👥 Max Teams/Participants: ${event.maxTickets}`
  ].join('\n')
}

/**
 * Get total event count.
 */
export function getEventCount() {
  return EVENTS.length
}

/**
 * getDepartmentCode — fuzzy match a department name/code.
 */
export function getDepartmentCode(query) {
  if (!query) return null
  const q = query.toLowerCase().trim()

  // Direct code match
  for (const code of Object.keys(DEPARTMENTS)) {
    if (code.toLowerCase() === q) return code
  }

  // Partial name match
  for (const [code, fullName] of Object.entries(DEPARTMENTS)) {
    if (fullName.toLowerCase().includes(q) || q.includes(code.toLowerCase())) {
      return code
    }
  }

  // Common aliases
  const DEPT_ALIASES = {
    'mechanical': 'ME', 'mech': 'ME', 'me': 'ME',
    'electronics': 'EC', 'ece': 'EC', 'ec': 'EC',
    'civil': 'CIVIL',
    'computer science': 'CSE', 'cs': 'CSE', 'cse': 'CSE',
    'information technology': 'IT', 'it': 'IT',
    'computer informatics': 'CI', 'ci': 'CI',
    'artificial intelligence': 'AD', 'ai': 'AD', 'data science': 'AD', 'aids': 'AD',
    'pharmacy': 'Pharma', 'pharma': 'Pharma',
    'humanities': 'ESH', 'science': 'ESH', 'esh': 'ESH',
    'pahal': 'PAHAL', 'hardware lab': 'PAHAL',
    'cdips': 'CDIPS',
    'mba': 'MBA', 'management': 'MBA', 'business': 'MBA',
    'cdil': 'CDIL',
    'core': 'Core Team', 'core team': 'Core Team'
  }

  return DEPT_ALIASES[q] || null
}

/**
 * Citronics fest overview.
 */
export const FEST_INFO = {
  name: 'Citronics 2K26',
  theme: 'AI for Sustainable Tomorrow',
  dates: 'April 8–10, 2026',
  days: 3,
  totalEvents: EVENTS.length,
  venue: 'CDIP Campus',
  departments: Object.keys(DEPARTMENTS).length
}
