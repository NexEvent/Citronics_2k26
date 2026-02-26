/**
 * Mock data for Citronics Home Page
 * Replace with real API calls once DB is connected.
 */

// == Hero rotating words =====================================================
export const HERO_WORDS = ['Innovation', 'Technology', 'Excellence', 'Passion', 'Tomorrow']

// == Highlights / About section ===============================================
export const HIGHLIGHTS = [
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

// == Departments ==============================================================
export const DEPARTMENTS = [
  { id: 'all', label: 'All Events', icon: 'tabler:layout-grid', paletteKey: 'primary' },
  { id: 'cse', label: 'Computer Science', icon: 'tabler:cpu', paletteKey: 'primary' },
  { id: 'ece', label: 'Electronics & Comm.', icon: 'tabler:circuit-board', paletteKey: 'info' },
  { id: 'mech', label: 'Mechanical Engg.', icon: 'tabler:settings-2', paletteKey: 'warning' },
  { id: 'civil', label: 'Civil Engineering', icon: 'tabler:building-bridge', paletteKey: 'success' },
  { id: 'mgmt', label: 'Management', icon: 'tabler:chart-bar', paletteKey: 'error' }
]

// == Events ===================================================================
export const EVENTS = [
  // CSE
  { id: 1, title: 'HackVerse 2k26', tagline: '24-hour National Level Hackathon', dept: 'cse', date: 'Mar 15, 2026', time: '10:00 AM', venue: 'Innovation Lab, Block A', seats: 200, registered: 148, prize: '\u20B950,000', tags: ['Coding', 'AI', 'Web3'], paletteKey: 'primary', featured: true },
  { id: 2, title: 'Code Sprint', tagline: 'Competitive Programming Face-off', dept: 'cse', date: 'Mar 16, 2026', time: '09:00 AM', venue: 'Computer Lab 302', seats: 100, registered: 87, prize: '\u20B910,000', tags: ['DSA', 'Algorithms'], paletteKey: 'primary', featured: false },
  { id: 3, title: 'UI/UX Showdown', tagline: 'Design the Future of Interfaces', dept: 'cse', date: 'Mar 16, 2026', time: '11:00 AM', venue: 'Design Studio, Block C', seats: 60, registered: 44, prize: '\u20B98,000', tags: ['Design', 'Figma', 'UX'], paletteKey: 'primary', featured: false },
  { id: 4, title: 'CTF Battleground', tagline: 'Capture The Flag \u2014 Cybersecurity Showdown', dept: 'cse', date: 'Mar 17, 2026', time: '02:00 PM', venue: 'Networking Lab', seats: 80, registered: 61, prize: '\u20B915,000', tags: ['Security', 'CTF', 'Linux'], paletteKey: 'primary', featured: true },
  // ECE
  { id: 5, title: 'Circuit Arena', tagline: 'Build. Solder. Conquer.', dept: 'ece', date: 'Mar 15, 2026', time: '09:00 AM', venue: 'Electronics Lab 201', seats: 80, registered: 55, prize: '\u20B912,000', tags: ['Circuits', 'Arduino', 'IoT'], paletteKey: 'info', featured: true },
  { id: 6, title: 'Robo Rumble', tagline: 'Autonomous Robot Battle Royale', dept: 'ece', date: 'Mar 17, 2026', time: '03:00 PM', venue: 'Main Arena, Ground Floor', seats: 50, registered: 38, prize: '\u20B920,000', tags: ['Robotics', 'Embedded', 'Automation'], paletteKey: 'info', featured: true },
  { id: 7, title: 'Signal & Spectrum', tagline: 'DSP & Communications Quiz', dept: 'ece', date: 'Mar 16, 2026', time: '01:00 PM', venue: 'Seminar Hall B', seats: 120, registered: 74, prize: '\u20B96,000', tags: ['DSP', 'VLSI', 'Communication'], paletteKey: 'info', featured: false },
  // Mech
  { id: 8, title: 'CAD Masters', tagline: 'Speed Modelling & Engineering Design', dept: 'mech', date: 'Mar 15, 2026', time: '10:00 AM', venue: 'Mech Design Lab', seats: 60, registered: 42, prize: '\u20B910,000', tags: ['SolidWorks', 'AutoCAD', '3D'], paletteKey: 'warning', featured: false },
  { id: 9, title: 'Thermo Wars', tagline: 'Thermodynamics Problem Solving Contest', dept: 'mech', date: 'Mar 16, 2026', time: '12:00 PM', venue: 'Class Room 401', seats: 100, registered: 56, prize: '\u20B97,000', tags: ['Thermodynamics', 'Mechanics'], paletteKey: 'warning', featured: false },
  { id: 10, title: 'Bridge Bonanza', tagline: 'Design & Load-Test a Mini Bridge', dept: 'mech', date: 'Mar 17, 2026', time: '09:00 AM', venue: 'Workshop Area', seats: 40, registered: 35, prize: '\u20B98,500', tags: ['Structures', 'Materials', 'Design'], paletteKey: 'warning', featured: true },
  // Civil
  { id: 11, title: 'Concrete Cosmos', tagline: 'Concrete Mix Design Competition', dept: 'civil', date: 'Mar 15, 2026', time: '11:00 AM', venue: 'Civil Engineering Lab', seats: 60, registered: 40, prize: '\u20B99,000', tags: ['Concrete', 'Structural', 'Mix Design'], paletteKey: 'success', featured: false },
  { id: 12, title: 'Survey Sprint', tagline: 'Precision Surveying Relay Race', dept: 'civil', date: 'Mar 16, 2026', time: '10:00 AM', venue: 'College Campus Ground', seats: 50, registered: 32, prize: '\u20B96,500', tags: ['Surveying', 'GPS', 'Topography'], paletteKey: 'success', featured: false },
  // Management
  { id: 13, title: 'Shark Tank Pitch', tagline: 'Pitch Your Startup to Real Investors', dept: 'mgmt', date: 'Mar 15, 2026', time: '02:00 PM', venue: 'Auditorium, Main Building', seats: 30, registered: 28, prize: '\u20B925,000', tags: ['Startup', 'Pitch', 'Business'], paletteKey: 'error', featured: true },
  { id: 14, title: 'Ad Mad Show', tagline: 'Creative Marketing & Branding Contest', dept: 'mgmt', date: 'Mar 16, 2026', time: '03:00 PM', venue: 'Seminar Hall A', seats: 80, registered: 55, prize: '\u20B98,000', tags: ['Marketing', 'Branding', 'Creative'], paletteKey: 'error', featured: false }
]

// == Stats ====================================================================
export const STATS = [
  { label: 'Events', value: 24, suffix: '+', icon: 'tabler:calendar-event', paletteKey: 'primary' },
  { label: 'Participants', value: 2000, suffix: '+', icon: 'tabler:users', paletteKey: 'info' },
  { label: 'Departments', value: 5, suffix: '', icon: 'tabler:building-community', paletteKey: 'success' },
  { label: 'Prize Pool', value: 2, suffix: 'L+', icon: 'tabler:trophy', paletteKey: 'warning' },
  { label: 'Workshops', value: 12, suffix: '+', icon: 'tabler:hammer', paletteKey: 'secondary' },
  { label: 'Sponsors', value: 15, suffix: '+', icon: 'tabler:heart-handshake', paletteKey: 'error' }
]

// == Schedule =================================================================
export const SCHEDULE_DAYS = [
  {
    date: 'March 15', day: 'Day 1', theme: 'Ignition',
    highlights: [
      { time: '09:00 AM', event: 'Inauguration Ceremony', dept: 'all', paletteKey: 'primary' },
      { time: '10:00 AM', event: 'HackVerse 2k26 Kickoff', dept: 'cse', paletteKey: 'primary' },
      { time: '10:00 AM', event: 'Circuit Arena Begins', dept: 'ece', paletteKey: 'info' },
      { time: '02:00 PM', event: 'Shark Tank Pitch', dept: 'mgmt', paletteKey: 'error' },
      { time: '06:00 PM', event: 'Cultural Night \u2014 DJ & Live Band', dept: 'all', paletteKey: 'warning' }
    ]
  },
  {
    date: 'March 16', day: 'Day 2', theme: 'Velocity',
    highlights: [
      { time: '09:00 AM', event: 'Code Sprint', dept: 'cse', paletteKey: 'primary' },
      { time: '10:00 AM', event: 'Survey Sprint', dept: 'civil', paletteKey: 'success' },
      { time: '01:00 PM', event: 'Signal & Spectrum Quiz', dept: 'ece', paletteKey: 'info' },
      { time: '03:00 PM', event: 'Ad Mad Show', dept: 'mgmt', paletteKey: 'error' },
      { time: '07:00 PM', event: 'Fashion Show & Talent Night', dept: 'all', paletteKey: 'warning' }
    ]
  },
  {
    date: 'March 17', day: 'Day 3', theme: 'Zenith',
    highlights: [
      { time: '09:00 AM', event: 'Bridge Bonanza', dept: 'mech', paletteKey: 'warning' },
      { time: '02:00 PM', event: 'CTF Battleground Finals', dept: 'cse', paletteKey: 'primary' },
      { time: '03:00 PM', event: 'Robo Rumble Grand Finale', dept: 'ece', paletteKey: 'info' },
      { time: '05:00 PM', event: 'Award Ceremony & Closing', dept: 'all', paletteKey: 'success' },
      { time: '08:00 PM', event: 'Grand Celebration Night', dept: 'all', paletteKey: 'primary' }
    ]
  }
]

// == Testimonials =============================================================
export const TESTIMONIALS = [
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

// == Sponsors =================================================================
export const SPONSORS = [
  { name: 'TechCorp', tier: 'Title Sponsor' },
  { name: 'InnovateLabs', tier: 'Gold' },
  { name: 'DesignHub', tier: 'Gold' },
  { name: 'CloudNine AI', tier: 'Silver' },
  { name: 'RoboTech India', tier: 'Silver' },
  { name: 'BuildSmart', tier: 'Silver' },
  { name: 'CodeAcademy', tier: 'Partner' },
  { name: 'StartupGuj', tier: 'Partner' }
]

// == Countdown target =========================================================
export const EVENT_START_DATE = new Date('2026-03-15T09:00:00')
