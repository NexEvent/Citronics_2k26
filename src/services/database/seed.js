/**
 * Seed Script — Citronics
 *
 * Inserts the mock data (categories + events) into the database.
 * Run AFTER migrations are up to date.
 *
 * Usage:
 *   node src/services/database/seed.js          Insert seed data
 *   node src/services/database/seed.js reset    Delete seed data first, then re-insert
 *
 * Requires DATABASE_URL env var (or individual DB_HOST etc.).
 */

const pgp = require('pg-promise')({ noWarnings: true })
const path = require('path')

// Load .env
try { require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') }) } catch (_) { /* no dotenv */ }

function getConnectionConfig() {
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 3,
      connectionTimeoutMillis: 10_000
    }
  }

  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'citronics',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    max: 3,
    connectionTimeoutMillis: 10_000
  }
}

const db = pgp(getConnectionConfig())

// ── Seed Data ──────────────────────────────────────────────────────────────────

const CATEGORIES = [
  {
    slug: 'all',
    name: 'All Events',
    description: 'View all events across departments',
    images: [],
    sort_order: 0
  },
  {
    slug: 'cse',
    name: 'Computer Science',
    description: 'Coding, hackathons, AI/ML challenges, cybersecurity CTFs and more',
    images: [],
    sort_order: 1
  },
  {
    slug: 'ece',
    name: 'Electronics & Comm.',
    description: 'Circuit design, robotics, IoT projects, signal processing',
    images: [],
    sort_order: 2
  },
  {
    slug: 'mech',
    name: 'Mechanical Engg.',
    description: 'CAD modelling, thermodynamics, bridge design, workshop challenges',
    images: [],
    sort_order: 3
  },
  {
    slug: 'civil',
    name: 'Civil Engineering',
    description: 'Concrete design, surveying, structural analysis competitions',
    images: [],
    sort_order: 4
  },
  {
    slug: 'mgmt',
    name: 'Management',
    description: 'Business pitches, marketing contests, startup showcases',
    images: [],
    sort_order: 5
  }
]

const EVENTS = [
  // CSE
  {
    name: 'HackVerse 2k26',
    tagline: '24-hour National Level Hackathon',
    description: 'HackVerse 2k26 is our flagship 24-hour national level hackathon where teams of up to 4 compete to build innovative solutions. With mentors from top tech companies, swag kits, and a massive prize pool, this is the ultimate coding marathon. Tracks include AI/ML, Web3, HealthTech, and Sustainability.',
    category_slug: 'cse',
    start_time: '2026-03-15 10:00:00+05:30',
    end_time: '2026-03-16 10:00:00+05:30',
    venue: 'Innovation Lab, Block A',
    max_tickets: 200,
    registered: 148,
    prize: '₹50,000',
    tags: ['Coding', 'AI', 'Web3'],
    palette_key: 'primary',
    featured: true,
    status: 'published',
    images: []
  },
  {
    name: 'Code Sprint',
    tagline: 'Competitive Programming Face-off',
    description: 'A fast-paced competitive programming contest. Solve algorithmic challenges across 3 rounds — easy, medium, and hard. Top performers get direct interview invites from our sponsoring companies. Languages allowed: C++, Java, Python.',
    category_slug: 'cse',
    start_time: '2026-03-16 09:00:00+05:30',
    end_time: '2026-03-16 13:00:00+05:30',
    venue: 'Computer Lab 302',
    max_tickets: 100,
    registered: 87,
    prize: '₹10,000',
    tags: ['DSA', 'Algorithms'],
    palette_key: 'primary',
    featured: false,
    status: 'published',
    images: []
  },
  {
    name: 'UI/UX Showdown',
    tagline: 'Design the Future of Interfaces',
    description: 'Compete to create the best user interface and experience for a given problem statement. Judged on usability, aesthetics, innovation, and accessibility. Tools allowed: Figma, Adobe XD, Sketch.',
    category_slug: 'cse',
    start_time: '2026-03-16 11:00:00+05:30',
    end_time: '2026-03-16 17:00:00+05:30',
    venue: 'Design Studio, Block C',
    max_tickets: 60,
    registered: 44,
    prize: '₹8,000',
    tags: ['Design', 'Figma', 'UX'],
    palette_key: 'primary',
    featured: false,
    status: 'published',
    images: []
  },
  {
    name: 'CTF Battleground',
    tagline: 'Capture The Flag — Cybersecurity Showdown',
    description: 'A multi-round cybersecurity Capture The Flag competition. Challenges span web exploitation, reverse engineering, cryptography, and forensics. Beginners welcome — warm-up challenges provided.',
    category_slug: 'cse',
    start_time: '2026-03-17 14:00:00+05:30',
    end_time: '2026-03-17 20:00:00+05:30',
    venue: 'Networking Lab',
    max_tickets: 80,
    registered: 61,
    prize: '₹15,000',
    tags: ['Security', 'CTF', 'Linux'],
    palette_key: 'primary',
    featured: true,
    status: 'published',
    images: []
  },
  // ECE
  {
    name: 'Circuit Arena',
    tagline: 'Build. Solder. Conquer.',
    description: 'Design and build functional circuits within a time limit. Components provided on-the-spot. Judged on correctness, efficiency, and creativity. Arduino and breadboard kits available.',
    category_slug: 'ece',
    start_time: '2026-03-15 09:00:00+05:30',
    end_time: '2026-03-15 17:00:00+05:30',
    venue: 'Electronics Lab 201',
    max_tickets: 80,
    registered: 55,
    prize: '₹12,000',
    tags: ['Circuits', 'Arduino', 'IoT'],
    palette_key: 'info',
    featured: true,
    status: 'published',
    images: []
  },
  {
    name: 'Robo Rumble',
    tagline: 'Autonomous Robot Battle Royale',
    description: 'Build autonomous robots that navigate obstacle courses and battle head-to-head. Categories: line follower, maze solver, and sumo bot. Pre-registration required with robot specs.',
    category_slug: 'ece',
    start_time: '2026-03-17 15:00:00+05:30',
    end_time: '2026-03-17 20:00:00+05:30',
    venue: 'Main Arena, Ground Floor',
    max_tickets: 50,
    registered: 38,
    prize: '₹20,000',
    tags: ['Robotics', 'Embedded', 'Automation'],
    palette_key: 'info',
    featured: true,
    status: 'published',
    images: []
  },
  {
    name: 'Signal & Spectrum',
    tagline: 'DSP & Communications Quiz',
    description: 'A quiz competition covering Digital Signal Processing, VLSI design, and communication systems. Three rounds with increasing difficulty. Individual participation only.',
    category_slug: 'ece',
    start_time: '2026-03-16 13:00:00+05:30',
    end_time: '2026-03-16 16:00:00+05:30',
    venue: 'Seminar Hall B',
    max_tickets: 120,
    registered: 74,
    prize: '₹6,000',
    tags: ['DSP', 'VLSI', 'Communication'],
    palette_key: 'info',
    featured: false,
    status: 'published',
    images: []
  },
  // Mech
  {
    name: 'CAD Masters',
    tagline: 'Speed Modelling & Engineering Design',
    description: 'Speed modelling competition using SolidWorks or AutoCAD. Given a physical object, replicate it digitally with full specifications. Judged on accuracy, speed, and design elegance.',
    category_slug: 'mech',
    start_time: '2026-03-15 10:00:00+05:30',
    end_time: '2026-03-15 16:00:00+05:30',
    venue: 'Mech Design Lab',
    max_tickets: 60,
    registered: 42,
    prize: '₹10,000',
    tags: ['SolidWorks', 'AutoCAD', '3D'],
    palette_key: 'warning',
    featured: false,
    status: 'published',
    images: []
  },
  {
    name: 'Thermo Wars',
    tagline: 'Thermodynamics Problem Solving Contest',
    description: 'Solve real-world thermodynamics and fluid mechanics problems. Calculators allowed, reference sheets provided. Teams of 2.',
    category_slug: 'mech',
    start_time: '2026-03-16 12:00:00+05:30',
    end_time: '2026-03-16 16:00:00+05:30',
    venue: 'Class Room 401',
    max_tickets: 100,
    registered: 56,
    prize: '₹7,000',
    tags: ['Thermodynamics', 'Mechanics'],
    palette_key: 'warning',
    featured: false,
    status: 'published',
    images: []
  },
  {
    name: 'Bridge Bonanza',
    tagline: 'Design & Load-Test a Mini Bridge',
    description: 'Design and construct a mini bridge using provided materials. Bridges will be load-tested to destruction. Highest load-to-weight ratio wins. Safety gear provided.',
    category_slug: 'mech',
    start_time: '2026-03-17 09:00:00+05:30',
    end_time: '2026-03-17 16:00:00+05:30',
    venue: 'Workshop Area',
    max_tickets: 40,
    registered: 35,
    prize: '₹8,500',
    tags: ['Structures', 'Materials', 'Design'],
    palette_key: 'warning',
    featured: true,
    status: 'published',
    images: []
  },
  // Civil
  {
    name: 'Concrete Cosmos',
    tagline: 'Concrete Mix Design Competition',
    description: 'Design and test concrete mixes for optimal strength. Teams prepare cube specimens, test compressive strength, and present their methodology. Lab equipment provided.',
    category_slug: 'civil',
    start_time: '2026-03-15 11:00:00+05:30',
    end_time: '2026-03-15 17:00:00+05:30',
    venue: 'Civil Engineering Lab',
    max_tickets: 60,
    registered: 40,
    prize: '₹9,000',
    tags: ['Concrete', 'Structural', 'Mix Design'],
    palette_key: 'success',
    featured: false,
    status: 'published',
    images: []
  },
  {
    name: 'Survey Sprint',
    tagline: 'Precision Surveying Relay Race',
    description: 'Teams race to complete surveying tasks using precision instruments. GPS, total stations, and levels provided. Judged on accuracy and speed.',
    category_slug: 'civil',
    start_time: '2026-03-16 10:00:00+05:30',
    end_time: '2026-03-16 14:00:00+05:30',
    venue: 'College Campus Ground',
    max_tickets: 50,
    registered: 32,
    prize: '₹6,500',
    tags: ['Surveying', 'GPS', 'Topography'],
    palette_key: 'success',
    featured: false,
    status: 'published',
    images: []
  },
  // Management
  {
    name: 'Shark Tank Pitch',
    tagline: 'Pitch Your Startup to Real Investors',
    description: 'Present your startup idea to a panel of real investors and industry leaders. Top pitches receive mentorship and potential pre-seed funding. Business plan template provided.',
    category_slug: 'mgmt',
    start_time: '2026-03-15 14:00:00+05:30',
    end_time: '2026-03-15 18:00:00+05:30',
    venue: 'Auditorium, Main Building',
    max_tickets: 30,
    registered: 28,
    prize: '₹25,000',
    tags: ['Startup', 'Pitch', 'Business'],
    palette_key: 'error',
    featured: true,
    status: 'published',
    images: []
  },
  {
    name: 'Ad Mad Show',
    tagline: 'Creative Marketing & Branding Contest',
    description: 'Create and present a brand campaign for a random product. Judged on creativity, brand storytelling, and audience engagement. Props and materials provided.',
    category_slug: 'mgmt',
    start_time: '2026-03-16 15:00:00+05:30',
    end_time: '2026-03-16 19:00:00+05:30',
    venue: 'Seminar Hall A',
    max_tickets: 80,
    registered: 55,
    prize: '₹8,000',
    tags: ['Marketing', 'Branding', 'Creative'],
    palette_key: 'error',
    featured: false,
    status: 'published',
    images: []
  }
]

const SCHEDULE_DAYS = [
  {
    date: 'March 15',
    day: 'Day 1',
    theme: 'Ignition',
    highlights: [
      { time: '09:00 AM', event_name: 'Inauguration Ceremony', dept: 'all', palette_key: 'primary' },
      { time: '10:00 AM', event_name: 'HackVerse 2k26 Kickoff', dept: 'cse', palette_key: 'primary' },
      { time: '10:00 AM', event_name: 'Circuit Arena Begins', dept: 'ece', palette_key: 'info' },
      { time: '02:00 PM', event_name: 'Shark Tank Pitch', dept: 'mgmt', palette_key: 'error' },
      { time: '06:00 PM', event_name: 'Cultural Night — DJ & Live Band', dept: 'all', palette_key: 'warning' }
    ]
  },
  {
    date: 'March 16',
    day: 'Day 2',
    theme: 'Velocity',
    highlights: [
      { time: '09:00 AM', event_name: 'Code Sprint', dept: 'cse', palette_key: 'primary' },
      { time: '10:00 AM', event_name: 'Survey Sprint', dept: 'civil', palette_key: 'success' },
      { time: '01:00 PM', event_name: 'Signal & Spectrum Quiz', dept: 'ece', palette_key: 'info' },
      { time: '03:00 PM', event_name: 'Ad Mad Show', dept: 'mgmt', palette_key: 'error' },
      { time: '07:00 PM', event_name: 'Fashion Show & Talent Night', dept: 'all', palette_key: 'warning' }
    ]
  },
  {
    date: 'March 17',
    day: 'Day 3',
    theme: 'Zenith',
    highlights: [
      { time: '09:00 AM', event_name: 'Bridge Bonanza', dept: 'mech', palette_key: 'warning' },
      { time: '02:00 PM', event_name: 'CTF Battleground Finals', dept: 'cse', palette_key: 'primary' },
      { time: '03:00 PM', event_name: 'Robo Rumble Grand Finale', dept: 'ece', palette_key: 'info' },
      { time: '05:00 PM', event_name: 'Award Ceremony & Closing', dept: 'all', palette_key: 'success' },
      { time: '08:00 PM', event_name: 'Grand Celebration Night', dept: 'all', palette_key: 'primary' }
    ]
  }
]

// ── Insert Functions ───────────────────────────────────────────────────────────

async function insertCategories(t) {
  console.log('  ⏳ Inserting categories...')

  for (const cat of CATEGORIES) {
    await t.none(
      `INSERT INTO categories (slug, name, description, icon, palette_key, images, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7)
       ON CONFLICT (slug) DO UPDATE SET
         name = EXCLUDED.name,
         description = EXCLUDED.description,
         icon = EXCLUDED.icon,
         palette_key = EXCLUDED.palette_key,
         images = EXCLUDED.images,
         sort_order = EXCLUDED.sort_order,
         updated_at = CURRENT_TIMESTAMP`,
      [cat.slug, cat.name, cat.description, cat.icon, cat.palette_key, JSON.stringify(cat.images), cat.sort_order]
    )
  }

  console.log(`    ✓ ${CATEGORIES.length} categories upserted`)
}

async function insertEvents(t) {
  console.log('  ⏳ Inserting events...')

  for (const evt of EVENTS) {
    // Look up category_id from slug
    const cat = await t.oneOrNone(
      `SELECT id FROM categories WHERE slug = $1`,
      [evt.category_slug]
    )

    await t.none(
      `INSERT INTO events (
        name, description, tagline, start_time, end_time, venue,
        max_tickets, registered, prize, tags, palette_key, featured,
        status, visibility, images, category_id
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, $11, $12,
        $13, 'public', $14::jsonb, $15
      )
      ON CONFLICT DO NOTHING`,
      [
        evt.name,
        evt.description,
        evt.tagline,
        evt.start_time,
        evt.end_time,
        evt.venue,
        evt.max_tickets,
        evt.registered,
        evt.prize,
        evt.tags,
        evt.palette_key,
        evt.featured,
        evt.status,
        JSON.stringify(evt.images),
        cat?.id || null
      ]
    )
  }

  console.log(`    ✓ ${EVENTS.length} events inserted`)
}

async function insertSchedule(t) {
  // Schedule is stored as site_config JSON — no separate table needed
  // We store it in a simple key-value config table, or just leave it
  // as static data. For now we'll use a site_config table.
  console.log('  ⏳ Inserting schedule data...')

  // Create site_config table if not exists (lightweight key-value)
  await t.none(`
    CREATE TABLE IF NOT EXISTS site_config (
      key        VARCHAR(100) PRIMARY KEY,
      value      JSONB NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `)

  await t.none(
    `INSERT INTO site_config (key, value)
     VALUES ('schedule_days', $1::jsonb)
     ON CONFLICT (key) DO UPDATE SET
       value = EXCLUDED.value,
       updated_at = CURRENT_TIMESTAMP`,
    [JSON.stringify(SCHEDULE_DAYS)]
  )

  // Also store stats data
  const STATS = [
    { label: 'Events', value: 24, suffix: '+', icon: 'tabler:calendar-event', paletteKey: 'primary' },
    { label: 'Participants', value: 2000, suffix: '+', icon: 'tabler:users', paletteKey: 'info' },
    { label: 'Departments', value: 5, suffix: '', icon: 'tabler:building-community', paletteKey: 'success' },
    { label: 'Prize Pool', value: 2, suffix: 'L+', icon: 'tabler:trophy', paletteKey: 'warning' },
    { label: 'Workshops', value: 12, suffix: '+', icon: 'tabler:hammer', paletteKey: 'secondary' },
    { label: 'Sponsors', value: 15, suffix: '+', icon: 'tabler:heart-handshake', paletteKey: 'error' }
  ]

  await t.none(
    `INSERT INTO site_config (key, value)
     VALUES ('home_stats', $1::jsonb)
     ON CONFLICT (key) DO UPDATE SET
       value = EXCLUDED.value,
       updated_at = CURRENT_TIMESTAMP`,
    [JSON.stringify(STATS)]
  )

  // Store sponsors data
  const SPONSORS = [
    { name: 'TechCorp', tier: 'Title Sponsor' },
    { name: 'InnovateLabs', tier: 'Gold' },
    { name: 'DesignHub', tier: 'Gold' },
    { name: 'CloudNine AI', tier: 'Silver' },
    { name: 'RoboTech India', tier: 'Silver' },
    { name: 'BuildSmart', tier: 'Silver' },
    { name: 'CodeAcademy', tier: 'Partner' },
    { name: 'StartupGuj', tier: 'Partner' }
  ]

  await t.none(
    `INSERT INTO site_config (key, value)
     VALUES ('sponsors', $1::jsonb)
     ON CONFLICT (key) DO UPDATE SET
       value = EXCLUDED.value,
       updated_at = CURRENT_TIMESTAMP`,
    [JSON.stringify(SPONSORS)]
  )

  // Store testimonials
  const TESTIMONIALS = [
    {
      name: 'Arjun Patel',
      role: 'CSE Student, Citronics 2025',
      quote: 'HackVerse was a game-changer for me. 24 hours of pure innovation with incredible mentors. I built my first AI project and won second place!'
    },
    {
      name: 'Priya Sharma',
      role: 'ECE Student, Citronics 2024',
      quote: 'The Robo Rumble event pushed our limits. We designed an autonomous bot in 3 days and the judges were industry professionals from ISRO.'
    },
    {
      name: 'Rahul Mehta',
      role: 'Mech Engineering, Citronics 2025',
      quote: 'Bridge Bonanza taught me more about structural design in one day than an entire semester. The hands-on experience is unmatched.'
    },
    {
      name: 'Neha Desai',
      role: 'Management, Citronics 2025',
      quote: 'Pitching at Shark Tank Pitch was surreal. Real investors, real feedback, and I actually got a pre-seed offer!'
    },
    {
      name: 'Vikram Singh',
      role: 'Civil Engineering, Citronics 2024',
      quote: 'The survey competition was incredibly well-organized. Precision instruments, real terrain, and a spirit of healthy competition.'
    }
  ]

  await t.none(
    `INSERT INTO site_config (key, value)
     VALUES ('testimonials', $1::jsonb)
     ON CONFLICT (key) DO UPDATE SET
       value = EXCLUDED.value,
       updated_at = CURRENT_TIMESTAMP`,
    [JSON.stringify(TESTIMONIALS)]
  )

  // Store hero words
  const HERO_WORDS = ['Innovation', 'Technology', 'Excellence', 'Passion', 'Tomorrow']

  await t.none(
    `INSERT INTO site_config (key, value)
     VALUES ('hero_words', $1::jsonb)
     ON CONFLICT (key) DO UPDATE SET
       value = EXCLUDED.value,
       updated_at = CURRENT_TIMESTAMP`,
    [JSON.stringify(HERO_WORDS)]
  )

  // Store highlights (about section)
  const HIGHLIGHTS = [
    {
      title: '24+ Events',
      description: 'From hackathons and robotics to design sprints and business pitches across five departments.',
      icon: 'tabler:calendar-event',
      paletteKey: 'primary'
    },
    {
      title: '2000+ Participants',
      description: 'Students, professionals, and creators from colleges across the state converge for three power-packed days.',
      icon: 'tabler:users-group',
      paletteKey: 'info'
    },
    {
      title: 'Industry Mentors',
      description: 'Learn from guest speakers and judges from top tech companies and startups.',
      icon: 'tabler:award',
      paletteKey: 'warning'
    },
    {
      title: 'Epic Nights',
      description: 'Cultural extravaganzas, DJ nights, fashion shows, and live performances every evening.',
      icon: 'tabler:music',
      paletteKey: 'error'
    }
  ]

  await t.none(
    `INSERT INTO site_config (key, value)
     VALUES ('highlights', $1::jsonb)
     ON CONFLICT (key) DO UPDATE SET
       value = EXCLUDED.value,
       updated_at = CURRENT_TIMESTAMP`,
    [JSON.stringify(HIGHLIGHTS)]
  )

  // Store event start date
  await t.none(
    `INSERT INTO site_config (key, value)
     VALUES ('event_start_date', $1::jsonb)
     ON CONFLICT (key) DO UPDATE SET
       value = EXCLUDED.value,
       updated_at = CURRENT_TIMESTAMP`,
    [JSON.stringify('2026-03-15T09:00:00')]
  )

  console.log('    ✓ Schedule, stats, sponsors, testimonials, highlights, hero words seeded')
}

async function clearSeedData(t) {
  console.log('  ⏳ Clearing existing seed data...')
  await t.none('DELETE FROM events WHERE status = $1', ['published'])
  await t.none('DELETE FROM categories')
  await t.none('DELETE FROM site_config WHERE key IN ($1, $2, $3, $4, $5, $6, $7)',
    ['schedule_days', 'home_stats', 'sponsors', 'testimonials', 'hero_words', 'highlights', 'event_start_date'])
  console.log('    ✓ Cleared')
}

// ── Main ───────────────────────────────────────────────────────────────────────

async function main() {
  const command = process.argv[2] || 'seed'

  try {
    const { now } = await db.one('SELECT NOW() AS now')
    console.log(`\n🔌 Connected to database (server time: ${now})\n`)

    await db.tx(async t => {
      if (command === 'reset') {
        await clearSeedData(t)
      }

      await insertCategories(t)
      await insertEvents(t)
      await insertSchedule(t)
    })

    console.log('\n✓ Seeding complete!\n')
  } catch (err) {
    console.error(`\n✗ Seed error: ${err.message}\n`)
    console.error(err.stack)
    process.exit(1)
  } finally {
    pgp.end()
  }
}

main()
