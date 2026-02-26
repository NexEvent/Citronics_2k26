/**
 * Voice Normalizer — Citro
 *
 * Converts Hinglish / Hindi / mixed-language speech into
 * canonical English text for deterministic intent matching.
 *
 * Strategy:
 *   1. Lowercase + trim
 *   2. Replace Hindi/Hinglish tokens with English equivalents
 *   3. Strip filler words and noise
 *   4. Collapse whitespace
 *
 * This runs entirely on the server — zero external APIs.
 */

// ── Hindi/Hinglish → English token map ────────────────────────────────────────
const TOKEN_MAP = {
  // Verbs / actions
  'dikhao': 'show',
  'dikha': 'show',
  'dikha do': 'show',
  'batao': 'tell',
  'bata do': 'tell',
  'kholo': 'open',
  'khol do': 'open',
  'karo': 'do',
  'kar do': 'do',
  'karna hai': 'do',
  'karna': 'do',
  'register karo': 'register',
  'register kar do': 'register',
  'chalo': 'go',
  'jao': 'go',
  'le jao': 'go to',
  'band karo': 'close',
  'search karo': 'search',
  'dhoondo': 'search',
  'dhundho': 'search',
  'sunao': 'tell',
  'peeche jao': 'go back',
  'wapas jao': 'go back',
  'wapas': 'back',

  // Nouns / pages
  'events': 'events',
  'schedule': 'schedule',
  'dashboard': 'dashboard',
  'home': 'home',
  'ghar': 'home',
  'ticket': 'ticket',
  'tickets': 'tickets',
  'registration': 'registration',
  'registrations': 'registrations',
  'jagah': 'location',
  'sthan': 'location',
  'tarikh': 'date',
  'samay': 'time',
  'keemat': 'price',
  'fees': 'fee',
  'paisa': 'price',
  'madad': 'help',
  'sahayata': 'help',

  // Pronouns / connectors
  'mujhe': 'me',
  'mera': 'my',
  'mere': 'my',
  'kya': 'what',
  'kab': 'when',
  'kahan': 'where',
  'kaun': 'who',
  'kitne': 'how many',
  'kitna': 'how much',
  'hai': 'is',
  'hain': 'are',
  'ka': 'of',
  'ke': 'of',
  'ki': 'of',
  'ko': 'to',
  'me': 'in',
  'pe': 'on',
  'se': 'from',
  'aur': 'and',
  'ya': 'or',
  'sab': 'all',
  'sabhi': 'all',
  'aaj': 'today',
  'kal': 'tomorrow',
  'abhi': 'now',
  'naya': 'new',
  'naye': 'new',
  'purana': 'old',
  'upcoming': 'upcoming',
  'aane wale': 'upcoming',
  'aane wala': 'upcoming',
  'kaise': 'how',
  'kaisa': 'how',

  // Greetings
  'namaste': 'hello',
  'namaskar': 'hello',
  'shukriya': 'thank you',
  'dhanyavaad': 'thank you',
  'alvida': 'goodbye',
  'bye bye': 'goodbye',

  // Assistant
  'citro': 'citro',
  'hey citro': 'hey citro',
}

// Filler words to strip after translation
const FILLER_WORDS = new Set([
  'um', 'uh', 'hmm', 'like', 'actually', 'basically',
  'please', 'ok', 'okay', 'hey', 'hi', 'hello',
  'citro', 'the', 'a', 'an', 'just', 'can', 'you',
  'i', 'want', 'to', 'need', 'would'
])

/**
 * normalize — main export
 * @param {string} raw  Raw speech transcript
 * @returns {string}    Cleaned canonical English string
 */
export function normalize(raw) {
  if (!raw || typeof raw !== 'string') return ''

  let text = raw.toLowerCase().trim()

  // Replace multi-word tokens first (longer phrases take priority)
  const sortedTokens = Object.entries(TOKEN_MAP).sort((a, b) => b[0].length - a[0].length)

  for (const [hindi, english] of sortedTokens) {
    // Word-boundary aware replacement
    const regex = new RegExp(`\\b${escapeRegex(hindi)}\\b`, 'gi')
    text = text.replace(regex, english)
  }

  // Collapse whitespace
  text = text.replace(/\s+/g, ' ').trim()

  return text
}

/**
 * normalizeForIntent — strips fillers for cleaner intent matching
 * @param {string} raw  Raw speech transcript
 * @returns {string}    Ultra-clean command string
 */
export function normalizeForIntent(raw) {
  const base = normalize(raw)
  const words = base.split(' ').filter(w => !FILLER_WORDS.has(w))

  return words.join(' ').trim()
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
