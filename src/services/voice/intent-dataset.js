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
    id: 'LIST_ALL_EVENTS',
    patterns: [
      'list all events', 'list out all events', 'list me out all events',
      'show me all events', 'all events list', 'list events',
      'can you list all events', 'list every event',
      'what are all events', 'tell me all events',
      'all the events', 'every event', 'complete event list',
      'full event list', 'show complete events',
      'which events you know', 'what events you know',
      'what events do you know', 'what events do you have',
      'which events do you have', 'what events are there',
      'which events are there', 'how many events you know',
      'what all events', 'tell me events', 'which events'
    ],
    action: { type: 'reply' }
  },
  {
    id: 'RECOMMEND_EVENT',
    patterns: [
      'which is best event', 'best event', 'recommended events',
      'which event should attend', 'top events', 'popular events',
      'suggest events', 'best events happening', 'which is best',
      'what is best event', 'most popular event', 'highlight events',
      'must attend events', 'which events are best'
    ],
    action: { type: 'reply' }
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

  // ── Event-Specific Queries (Knowledge Base powered) ───────────────────────
  {
    id: 'EVENT_DETAILS',
    patterns: [
      'tell me about $name', 'what is $name', 'details of $name',
      'info about $name', 'about $name event', 'describe $name',
      'explain $name', '$name details', '$name info',
      'what is $name about', 'tell about $name', 'details $name'
    ],
    entities: ['name'],
    action: { type: 'reply' }
  },
  {
    id: 'NAV_EVENT',
    patterns: [
      'open $name', 'show $name', 'take me to $name',
      'go to $name', 'open $name event', 'show me $name',
      'navigate to $name', 'visit $name'
    ],
    entities: ['name'],
    action: { type: 'navigate', path: '/events' }
  },
  {
    id: 'EVENT_WHEN',
    patterns: [
      'when is $name', 'what time is $name', 'time of $name',
      'when does $name start', 'schedule of $name', 'date of $name',
      '$name timing', '$name date', '$name time', 'when $name'
    ],
    entities: ['name'],
    action: { type: 'reply' }
  },
  {
    id: 'EVENT_WHERE',
    patterns: [
      'where is $name', 'venue of $name', 'location of $name',
      '$name venue', '$name location', 'where is $name happening',
      'where will $name be', '$name where'
    ],
    entities: ['name'],
    action: { type: 'reply' }
  },
  {
    id: 'EVENT_PRICE',
    patterns: [
      'price of $name', 'how much is $name', 'cost of $name',
      '$name price', '$name cost', '$name fee', 'fee for $name',
      'ticket price of $name', 'how much for $name', '$name ticket price'
    ],
    entities: ['name'],
    action: { type: 'reply' }
  },
  {
    id: 'EVENT_PRIZE',
    patterns: [
      'prize of $name', 'prize for $name', 'what is the prize for $name',
      '$name prize', '$name prize money', 'prize money of $name',
      'reward for $name', 'winning prize $name', 'how much prize $name'
    ],
    entities: ['name'],
    action: { type: 'reply' }
  },
  {
    id: 'DEPT_EVENTS',
    patterns: [
      '$name department events', 'events by $name', 'events of $name',
      'events from $name', '$name events', 'show $name department events',
      'what events does $name have', 'list $name events',
      'events in $name department', 'events under $name'
    ],
    entities: ['name'],
    action: { type: 'reply' }
  },
  {
    id: 'DAY_EVENTS',
    patterns: [
      'events on day $name', 'day $name events', 'what is on day $name',
      'show day $name', 'day $name schedule', 'schedule for day $name',
      'events on april $name', 'april $name events',
      'day 1 events', 'day 2 events', 'day 3 events',
      'first day events', 'second day events', 'third day events',
      'what events are on day 1', 'what events are on day 2', 'what events are on day 3'
    ],
    entities: ['name'],
    action: { type: 'reply' }
  },
  {
    id: 'FEST_INFO',
    patterns: [
      'about the fest', 'about citronics fest', 'tell me about the fest',
      'citronics 2026', 'about citronics 2026', 'fest details',
      'what is citronics 2026', 'when is the fest', 'fest schedule',
      'how many events', 'total events', 'how many events are there',
      'fest theme', 'what is the theme',
      'about citronics', 'citronics', 'tell me about citronics',
      'what is citronics', 'citronix', 'about citronix',
      'tell me about citronix', 'what is citronix'
    ],
    action: { type: 'reply' }
  },

  // ── Cart / Checkout ────────────────────────────────────────────────────────
  {
    id: 'ADD_TO_CART',
    patterns: [
      'add $name to cart', 'add $name to my cart',
      'put $name in cart', 'put $name in my cart',
      'select $name', 'book $name', 'buy $name',
      'i want $name', 'add $name', 'cart $name',
      'get ticket for $name', 'get tickets for $name',
      'buy ticket for $name', 'buy tickets for $name'
    ],
    entities: ['name'],
    action: { type: 'add-to-cart' }
  },
  {
    id: 'ADD_CART_AND_CHECKOUT',
    patterns: [
      'select $name and checkout', 'select $name and move to checkout',
      'add $name and checkout', 'add $name to cart and checkout',
      'book $name and checkout', 'buy $name and checkout',
      'add $name and go to cart', 'select $name and go to cart',
      'add $name to cart and go to checkout',
      'select $name and proceed to checkout',
      'select $name and pay', 'buy $name and pay'
    ],
    entities: ['name'],
    action: { type: 'add-to-cart-and-checkout' }
  },
  {
    id: 'NAV_CART',
    patterns: [
      'go to cart', 'open cart', 'show cart', 'view cart',
      'my cart', 'show my cart', 'checkout', 'go to checkout',
      'proceed to checkout', 'move to checkout', 'open checkout',
      'cart page', 'take me to cart', 'take me to checkout'
    ],
    action: { type: 'navigate', path: '/cart' }
  },
  {
    id: 'REMOVE_FROM_CART',
    patterns: [
      'remove $name from cart', 'delete $name from cart',
      'remove $name', 'take out $name from cart',
      'cancel $name from cart'
    ],
    entities: ['name'],
    action: { type: 'remove-from-cart' }
  },
  {
    id: 'CLEAR_CART',
    patterns: [
      'clear cart', 'empty cart', 'clear my cart', 'empty my cart',
      'remove everything from cart', 'delete all from cart'
    ],
    action: { type: 'clear-cart' }
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

  // ── Greetings / Meta / Friendly Chat ────────────────────────────────────
  {
    id: 'GREETING',
    patterns: [
      'hello', 'hi', 'hey', 'namaste', 'good morning', 'good evening',
      'good afternoon', 'whats up', 'howdy', 'sup', 'hi there',
      'hey there', 'hello there', 'greetings', 'yo'
    ],
    action: { type: 'reply' }
  },
  {
    id: 'HOW_ARE_YOU',
    patterns: [
      'how are you', 'how is it going', 'how do you do',
      'how you doing', 'are you fine', 'are you okay',
      'how are you doing', 'whats going on', 'hows life'
    ],
    action: { type: 'reply' }
  },
  {
    id: 'COMPLIMENT',
    patterns: [
      'you are great', 'you are awesome', 'nice', 'awesome', 'cool',
      'amazing', 'wonderful', 'brilliant', 'fantastic', 'good job',
      'well done', 'great work', 'love it', 'you rock', 'superb',
      'love you', 'you are the best', 'impressive'
    ],
    action: { type: 'reply' }
  },
  {
    id: 'JOKE',
    patterns: [
      'tell me joke', 'joke', 'make me laugh', 'say something funny',
      'tell joke', 'funny', 'humor', 'entertain me'
    ],
    action: { type: 'reply' }
  },
  {
    id: 'BORED',
    patterns: [
      'bored', 'boring', 'nothing do', 'what should do',
      'suggest something', 'any suggestions', 'what do recommend'
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
  },

  // ══════════════════════════════════════════════════════════════════════════
  // ── FAQ — Common questions users ask about the platform & events ─────────
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 'FAQ_CERTIFICATE',
    patterns: [
      'will i get a certificate', 'certificate', 'do i get certificate',
      'is there a certificate', 'participation certificate', 'certificates',
      'do we get certificates', 'certificate of participation'
    ],
    action: { type: 'reply' }
  },
  {
    id: 'FAQ_CANCEL_REGISTRATION',
    patterns: [
      'cancel registration', 'cancel my registration', 'how to cancel',
      'unregister', 'remove registration', 'cancel enrollment',
      'can i cancel', 'withdraw registration', 'cancel my ticket'
    ],
    action: { type: 'reply' }
  },
  {
    id: 'FAQ_REFUND',
    patterns: [
      'refund', 'refund policy', 'can i get a refund', 'money back',
      'return my money', 'refund request', 'how to get refund'
    ],
    action: { type: 'reply' }
  },
  {
    id: 'FAQ_TEAM_SIZE',
    patterns: [
      'team size', 'how many members', 'team limit', 'group size',
      'max team size', 'minimum team size', 'solo or team',
      'can i participate alone', 'individual participation'
    ],
    action: { type: 'reply' }
  },
  {
    id: 'FAQ_WIFI',
    patterns: [
      'is there wifi', 'wifi available', 'internet access', 'wifi',
      'internet', 'is wifi available', 'wifi password'
    ],
    action: { type: 'reply' }
  },
  {
    id: 'FAQ_FOOD',
    patterns: [
      'is there food', 'food', 'meals', 'lunch', 'snacks',
      'will food be provided', 'refreshments', 'is food included',
      'breakfast', 'dinner', 'catering'
    ],
    action: { type: 'reply' }
  },
  {
    id: 'FAQ_WHAT_TO_BRING',
    patterns: [
      'what to bring', 'what should i bring', 'do i need a laptop',
      'bring laptop', 'requirements', 'things to carry',
      'what do i need', 'prerequisites'
    ],
    action: { type: 'reply' }
  },
  {
    id: 'FAQ_PARKING',
    patterns: [
      'parking', 'is there parking', 'parking available', 'where to park',
      'parking facility', 'car parking', 'vehicle parking'
    ],
    action: { type: 'reply' }
  },
  {
    id: 'FAQ_ACCOMMODATION',
    patterns: [
      'accommodation', 'stay', 'hotel', 'where to stay', 'hostel',
      'accommodation available', 'lodging', 'can i stay overnight',
      'overnight stay', 'rooms'
    ],
    action: { type: 'reply' }
  }
]

export default INTENTS
