/**
 * Mock data for Citronics Home Page
 * Replace with real API calls once DB is connected.
 */

// ── Departments ─────────────────────────────────────────────────────────────
export const DEPARTMENTS = [
  {
    id: 'all',
    label: 'All Events',
    icon: 'tabler:layout-grid',
    paletteKey: 'primary'
  },
  {
    id: 'cse',
    label: 'Computer Science',
    icon: 'tabler:cpu',
    paletteKey: 'primary'
  },
  {
    id: 'ece',
    label: 'Electronics & Comm.',
    icon: 'tabler:circuit-board',
    paletteKey: 'info'
  },
  {
    id: 'mech',
    label: 'Mechanical Engg.',
    icon: 'tabler:settings-2',
    paletteKey: 'warning'
  },
  {
    id: 'civil',
    label: 'Civil Engineering',
    icon: 'tabler:building-bridge',
    paletteKey: 'success'
  },
  {
    id: 'mgmt',
    label: 'Management',
    icon: 'tabler:chart-bar',
    paletteKey: 'error'
  }
]

// ── Events ───────────────────────────────────────────────────────────────────
export const EVENTS = [
  // CSE
  {
    id: 1,
    title: 'HackVerse 2k26',
    tagline: '24-hour National Level Hackathon',
    dept: 'cse',
    date: 'Mar 15, 2026',
    time: '10:00 AM',
    venue: 'Innovation Lab, Block A',
    seats: 200,
    registered: 148,
    prize: '₹50,000',
    tags: ['Coding', 'AI', 'Web3'],
    paletteKey: 'primary',
    featured: true
  },
  {
    id: 2,
    title: 'Code Sprint',
    tagline: 'Competitive Programming Face-off',
    dept: 'cse',
    date: 'Mar 16, 2026',
    time: '09:00 AM',
    venue: 'Computer Lab 302',
    seats: 100,
    registered: 87,
    prize: '₹10,000',
    tags: ['DSA', 'Algorithms'],
    paletteKey: 'primary',
    featured: false
  },
  {
    id: 3,
    title: 'UI/UX Showdown',
    tagline: 'Design the Future of Interfaces',
    dept: 'cse',
    date: 'Mar 16, 2026',
    time: '11:00 AM',
    venue: 'Design Studio, Block C',
    seats: 60,
    registered: 44,
    prize: '₹8,000',
    tags: ['Design', 'Figma', 'UX'],
    paletteKey: 'primary',
    featured: false
  },
  {
    id: 4,
    title: 'CTF Battleground',
    tagline: 'Capture The Flag — Cybersecurity Showdown',
    dept: 'cse',
    date: 'Mar 17, 2026',
    time: '02:00 PM',
    venue: 'Networking Lab',
    seats: 80,
    registered: 61,
    prize: '₹15,000',
    tags: ['Security', 'CTF', 'Linux'],
    paletteKey: 'primary',
    featured: true
  },

  // ECE
  {
    id: 5,
    title: 'Circuit Arena',
    tagline: 'Build. Solder. Conquer.',
    dept: 'ece',
    date: 'Mar 15, 2026',
    time: '09:00 AM',
    venue: 'Electronics Lab 201',
    seats: 80,
    registered: 55,
    prize: '₹12,000',
    tags: ['Circuits', 'Arduino', 'IoT'],
    paletteKey: 'info',
    featured: true
  },
  {
    id: 6,
    title: 'Robo Rumble',
    tagline: 'Autonomous Robot Battle Royale',
    dept: 'ece',
    date: 'Mar 17, 2026',
    time: '03:00 PM',
    venue: 'Main Arena, Ground Floor',
    seats: 50,
    registered: 38,
    prize: '₹20,000',
    tags: ['Robotics', 'Embedded', 'Automation'],
    paletteKey: 'info',
    featured: true
  },
  {
    id: 7,
    title: 'Signal & Spectrum',
    tagline: 'DSP & Communications Quiz',
    dept: 'ece',
    date: 'Mar 16, 2026',
    time: '01:00 PM',
    venue: 'Seminar Hall B',
    seats: 120,
    registered: 74,
    prize: '₹6,000',
    tags: ['DSP', 'VLSI', 'Communication'],
    paletteKey: 'info',
    featured: false
  },

  // Mech
  {
    id: 8,
    title: 'CAD Masters',
    tagline: 'Speed Modelling & Engineering Design',
    dept: 'mech',
    date: 'Mar 15, 2026',
    time: '10:00 AM',
    venue: 'Mech Design Lab',
    seats: 60,
    registered: 42,
    prize: '₹10,000',
    tags: ['SolidWorks', 'AutoCAD', '3D'],
    paletteKey: 'warning',
    featured: false
  },
  {
    id: 9,
    title: 'Thermo Wars',
    tagline: 'Thermodynamics Problem Solving Contest',
    dept: 'mech',
    date: 'Mar 16, 2026',
    time: '12:00 PM',
    venue: 'Class Room 401',
    seats: 100,
    registered: 56,
    prize: '₹7,000',
    tags: ['Thermodynamics', 'Mechanics'],
    paletteKey: 'warning',
    featured: false
  },
  {
    id: 10,
    title: 'Bridge Bonanza',
    tagline: 'Design & Load-Test a Mini Bridge',
    dept: 'mech',
    date: 'Mar 17, 2026',
    time: '09:00 AM',
    venue: 'Workshop Area',
    seats: 40,
    registered: 35,
    prize: '₹8,500',
    tags: ['Structures', 'Materials', 'Design'],
    paletteKey: 'warning',
    featured: true
  },

  // Civil
  {
    id: 11,
    title: 'Concrete Cosmos',
    tagline: 'Concrete Mix Design Competition',
    dept: 'civil',
    date: 'Mar 15, 2026',
    time: '11:00 AM',
    venue: 'Civil Engineering Lab',
    seats: 60,
    registered: 40,
    prize: '₹9,000',
    tags: ['Concrete', 'Structural', 'Mix Design'],
    paletteKey: 'success',
    featured: false
  },
  {
    id: 12,
    title: 'Survey Sprint',
    tagline: 'Precision Surveying Relay Race',
    dept: 'civil',
    date: 'Mar 16, 2026',
    time: '10:00 AM',
    venue: 'College Campus Ground',
    seats: 50,
    registered: 32,
    prize: '₹6,500',
    tags: ['Surveying', 'GPS', 'Topography'],
    paletteKey: 'success',
    featured: false
  },

  // Management
  {
    id: 13,
    title: 'Shark Tank Pitch',
    tagline: 'Pitch Your Startup to Real Investors',
    dept: 'mgmt',
    date: 'Mar 15, 2026',
    time: '02:00 PM',
    venue: 'Auditorium, Main Building',
    seats: 30,
    registered: 28,
    prize: '₹25,000',
    tags: ['Startup', 'Pitch', 'Business'],
    paletteKey: 'error',
    featured: true
  },
  {
    id: 14,
    title: 'Ad Mad Show',
    tagline: 'Creative Marketing & Branding Contest',
    dept: 'mgmt',
    date: 'Mar 16, 2026',
    time: '03:00 PM',
    venue: 'Seminar Hall A',
    seats: 80,
    registered: 55,
    prize: '₹8,000',
    tags: ['Marketing', 'Branding', 'Creative'],
    paletteKey: 'error',
    featured: false
  }
]

// ── Stats ────────────────────────────────────────────────────────────────────
export const STATS = [
  { label: 'Events', value: 24, suffix: '+', icon: 'tabler:calendar-event', paletteKey: 'primary' },
  { label: 'Participants', value: 2000, suffix: '+', icon: 'tabler:users', paletteKey: 'info' },
  { label: 'Departments', value: 5, suffix: '', icon: 'tabler:building-community', paletteKey: 'success' },
  { label: 'Prize Pool', value: 2, suffix: 'L+', icon: 'tabler:trophy', paletteKey: 'warning' }
]

// ── Schedule Timeline ─────────────────────────────────────────────────────────
export const SCHEDULE_DAYS = [
  {
    date: 'March 15',
    day: 'Day 1',
    theme: 'Ignition',
    highlights: [
      { time: '09:00 AM', event: 'Inauguration Ceremony', dept: 'all', paletteKey: 'primary' },
      { time: '10:00 AM', event: 'HackVerse 2k26 Kickoff', dept: 'cse', paletteKey: 'primary' },
      { time: '10:00 AM', event: 'Circuit Arena Begins', dept: 'ece', paletteKey: 'info' },
      { time: '02:00 PM', event: 'Shark Tank Pitch', dept: 'mgmt', paletteKey: 'error' },
      { time: '06:00 PM', event: 'Cultural Night — DJ & Live Band', dept: 'all', paletteKey: 'warning' }
    ]
  },
  {
    date: 'March 16',
    day: 'Day 2',
    theme: 'Velocity',
    highlights: [
      { time: '09:00 AM', event: 'Code Sprint', dept: 'cse', paletteKey: 'primary' },
      { time: '10:00 AM', event: 'Survey Sprint', dept: 'civil', paletteKey: 'success' },
      { time: '01:00 PM', event: 'Signal & Spectrum Quiz', dept: 'ece', paletteKey: 'info' },
      { time: '03:00 PM', event: 'Ad Mad Show', dept: 'mgmt', paletteKey: 'error' },
      { time: '07:00 PM', event: 'Fashion Show & Talent Night', dept: 'all', paletteKey: 'warning' }
    ]
  },
  {
    date: 'March 17',
    day: 'Day 3',
    theme: 'Zenith',
    highlights: [
      { time: '09:00 AM', event: 'Bridge Bonanza', dept: 'mech', paletteKey: 'warning' },
      { time: '02:00 PM', event: 'CTF Battleground Finals', dept: 'cse', paletteKey: 'primary' },
      { time: '03:00 PM', event: 'Robo Rumble Grand Finale', dept: 'ece', paletteKey: 'info' },
      { time: '05:00 PM', event: 'Award Ceremony & Closing', dept: 'all', paletteKey: 'success' },
      { time: '08:00 PM', event: 'Grand Celebration Night', dept: 'all', paletteKey: 'primary' }
    ]
  }
]

// ── Event date for countdown ──────────────────────────────────────────────────
export const EVENT_START_DATE = new Date('2026-03-15T09:00:00')
