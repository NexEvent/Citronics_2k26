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
  'mein': 'in',
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

// ── Speech Recognition Corrections ────────────────────────────────────────────
// Common words that browser STT mishears for Citronics event names.
// Applied BEFORE token translation so the corrected form flows through normally.
const SPEECH_CORRECTIONS = {
  'cardiology': 'codeology',
  'cardio logy': 'codeology',
  'code ology': 'codeology',
  'codiology': 'codeology',
  'pharma tone': 'pharmathon',
  'pharma thon': 'pharmathon',
  'pharmacon': 'pharmathon',
  'pharmacy thon': 'pharmathon',
  'zinga': 'zenga',
  'genga': 'zenga',
  'jenga': 'zenga',
  'zenga block': 'zenga block',
  'robo race': 'robo race',
  'robot race': 'robo race',
  'robo swim': 'robo swim',
  'robot swim': 'robo swim',
  'robo soccer': 'robo soccer',
  'robot soccer': 'robo soccer',
  'auto quest': 'auto quest',
  'arch mania': 'arch mania',
  'archmania': 'arch mania',
  'design verse': 'designverse',
  'ad mad': 'ad-mad show',
  'admad': 'ad-mad show',
  'shark tank': 'shark tank',
  'tech bingo': 'tech bingo',
  'tambola': 'tech bingo tambola',
  'boardroom battle': 'boardroom battle',
  'real to deal': 'reel to deal',
  'reel to deal': 'reel to deal',
  'clash of titans': 'clash of titan',
  'clash of titan': 'clash of titan',
  'youth parliament': 'youth parliament',
  'master chef': 'master chef',
  'master shift': 'master chef',
  'brand quiz': 'brand quiz',
  'share market': 'share market simulation',
  'stock market': 'share market simulation',
  'prompt it right': 'prompt it right',
  'innovate 2026': 'innovate 2026',
  'battle of design': 'battle of design',
  'newspaper tall': 'newspaper tall structure',
  'news paper tall': 'newspaper tall structure',
  'line follower': 'line follower',
  'ai slave': 'ai slave',
  'ai image story': 'ai image story creation',
  'build your own chatbot': 'build your own chatbot',
  'build chatbot': 'build your own chatbot',
  'chatbot': 'build your own chatbot',
  'business ethics': 'business ethics decision making',
  'debate competition': 'debate competition',
  'reel making': 'reel making competition',
  'pharma model': 'pharma model',
  'pharma innoventia': 'pharma innoventia',
  'project competition software': 'project competition software',
  'project competition hardware': 'project competition hardware',
  'project software': 'project competition software',
  'project hardware': 'project competition hardware',
  'citronix': 'citronics',
  'citronik': 'citronics',
  'citroniks': 'citronics',
  'citronics': 'citronics'
}

// Filler words to strip after translation
// NOTE: Greeting words (hi, hello, hey) are NOT fillers — they must reach
// the intent engine so GREETING / HOW_ARE_YOU etc. can match.
const FILLER_WORDS = new Set([
  'um', 'uh', 'hmm', 'like', 'actually', 'basically',
  'please', 'ok', 'okay',
  'citro', 'the', 'a', 'an', 'just', 'can', 'you',
  'want', 'need', 'would'
])

/**
 * normalize — main export
 * @param {string} raw  Raw speech transcript
 * @returns {string}    Cleaned canonical English string
 */
export function normalize(raw) {
  if (!raw || typeof raw !== 'string') return ''

  let text = raw.toLowerCase().trim()

  // Step 0: Apply speech recognition corrections FIRST
  // (fixes common STT mishearings like 'cardiology' → 'codeology')
  const sortedCorrections = Object.entries(SPEECH_CORRECTIONS).sort((a, b) => b[0].length - a[0].length)
  for (const [misheard, corrected] of sortedCorrections) {
    const regex = new RegExp(`\\b${escapeRegex(misheard)}\\b`, 'gi')
    text = text.replace(regex, corrected)
  }

  // Step 1: Replace Hindi/Hinglish tokens (longer phrases first)
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
