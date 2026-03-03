-- ============================================================================
-- Migration 008: Seed event_details data
-- Date: 2026-03-03
-- Description: Populates event_details for all existing events.
--              Looks up event_id from events.name via subquery.
--              Uses INSERT ... ON CONFLICT to be safely re-runnable.
-- ============================================================================

-- 1. Arch Mania
INSERT INTO event_details (event_id, brief, team_size, rules, rounds)
SELECT id,
  'Arch Mania challenges participants to construct a load-bearing arch using rough materials, helping students understand structural behavior and engineering principles through practical application.',
  2,
  ARRAY[
    'Participation is open to all students',
    'All participants must register before the event deadline',
    'The arch that bears maximum load will be declared the winner',
    'Any form of malpractice or rule violation will lead to immediate disqualification',
    'Decisions made by judges and event coordinators will be final and binding',
    'Participants must adhere to the code of conduct throughout the event'
  ],
  '{}'::TEXT[]
FROM events WHERE name = 'Arch Mania'
ON CONFLICT (event_id) DO UPDATE SET
  brief = EXCLUDED.brief,
  team_size = EXCLUDED.team_size,
  rules = EXCLUDED.rules,
  rounds = EXCLUDED.rounds;

-- 2. Guess the Monument
INSERT INTO event_details (event_id, brief, team_size, rules, rounds)
SELECT id,
  'Guess the Monument is a high-energy visual quiz where participants identify famous Indian and world monuments using zoomed images, clues, architectural facts, and rapid-fire challenges.',
  2,
  ARRAY[
    'Participation is open to all students',
    'All participants must register before the event deadline',
    'Any form of malpractice or rule violation will lead to immediate disqualification',
    'Decisions made by judges and event coordinators will be final and binding',
    'Participants must adhere to the code of conduct throughout the event'
  ],
  ARRAY[
    '{"title": "Round 1: Preliminary Quiz", "points": ["5 questions to each team", "Images and clue-based identification", "Top 12–16 teams qualify for next round"]}',
    '{"title": "Round 2: Advanced Challenge", "points": ["Zoomed-in photo round (10 seconds to guess)", "Buzzer round (fastest response wins)", "Monument mash-up (name + location + fun fact)", "Rapid fire round (30 seconds, 8 monuments)", "Bonus: Build Your Own – draw a fictional monument in 1 minute"]}'
  ]::TEXT[]
FROM events WHERE name = 'Guess the Monument'
ON CONFLICT (event_id) DO UPDATE SET
  brief = EXCLUDED.brief,
  team_size = EXCLUDED.team_size,
  rules = EXCLUDED.rules,
  rounds = EXCLUDED.rounds;

-- 3. ZENGA Block
INSERT INTO event_details (event_id, brief, team_size, rules, rounds)
SELECT id,
  'JENGA is a game of physical and mental skill where participants take turns removing one block at a time from a 54-block tower and placing it on top. As the structure grows taller, it becomes increasingly unstable, testing precision, strategy, and composure.',
  2,
  ARRAY[
    'Participation is open to all students',
    'All participants must register before the event deadline',
    'The highest points will decide the winner',
    'Any form of malpractice or rule violation will lead to immediate disqualification',
    'Decisions made by the judges and event coordinators will be final and binding',
    'Participants must adhere to the code of conduct throughout the event'
  ],
  '{}'::TEXT[]
FROM events WHERE name = 'ZENGA Block'
ON CONFLICT (event_id) DO UPDATE SET
  brief = EXCLUDED.brief,
  team_size = EXCLUDED.team_size,
  rules = EXCLUDED.rules,
  rounds = EXCLUDED.rounds;

-- 4. Debate Competition
INSERT INTO event_details (event_id, brief, team_size, rules, rounds)
SELECT id,
  'A structured debate competition where participants argue for or against a given motion. The event tests logical reasoning, clarity of thought, articulation skills, and confidence in public speaking.',
  3,
  ARRAY[
    'Each team shall consist of two or three participants speaking for or against the motion',
    'Each speaker will be allotted 3–5 minutes to present arguments; exceeding the limit may lead to negative marking',
    'The debate may be conducted in English / Hindi / bilingual as specified by organizers',
    'Participants must speak strictly on the given topic; irrelevant content or personal remarks are not permitted',
    'Use of abusive, defamatory, or offensive language is strictly prohibited',
    'Proper parliamentary decorum must be maintained',
    'Judging will be based on content, clarity, logic, confidence, and presentation skills',
    'Decision of the judges shall be final and binding'
  ],
  '{}'::TEXT[]
FROM events WHERE name = 'Debate Competition'
ON CONFLICT (event_id) DO UPDATE SET
  brief = EXCLUDED.brief,
  team_size = EXCLUDED.team_size,
  rules = EXCLUDED.rules,
  rounds = EXCLUDED.rounds;

-- 5. Youth Parliament
INSERT INTO event_details (event_id, brief, team_size, rules, rounds)
SELECT id,
  'Youth Parliament is an academic simulation of parliamentary proceedings designed to familiarize students with democratic functioning, legislative procedures, structured debates, and decision-making processes.',
  3,
  ARRAY[
    'Participation is open for school students of classes X to XII',
    'Each school shall nominate 2–3 students per team',
    'All teams must register before the deadline',
    'Participants must adhere to the prescribed traditional and decent dress code',
    'Participants must maintain decorum and use dignified parliamentary language',
    'Mimicry of real political personalities, disorderly conduct, slogan shouting, or exaggeration is strictly prohibited',
    'Political party names, real party symbols, or actual political affiliations shall not be used',
    'Evaluation will be based on adherence to parliamentary procedure, discipline, speaking skills, questioning skills, and knowledge',
    'Participants must adhere to the code of conduct throughout the event'
  ],
  ARRAY[
    '{"title": "Parliamentary Simulation Round", "points": ["Formal Sitting", "Oath / Affirmation", "Obituary References", "Question Hour", "Calling Attention Notice", "Short-duration Discussion", "Legislative Business (Bills — Three Readings)", "No-Confidence Motion", "Formal Adjournment"]}'
  ]::TEXT[]
FROM events WHERE name = 'Youth Parliament'
ON CONFLICT (event_id) DO UPDATE SET
  brief = EXCLUDED.brief,
  team_size = EXCLUDED.team_size,
  rules = EXCLUDED.rules,
  rounds = EXCLUDED.rounds;

-- 6. INNOVATE 2026: Science Model Exhibition
INSERT INTO event_details (event_id, brief, team_size, rules, rounds)
SELECT id,
  'INNOVATE 2026 – Science Model Exhibition provides a platform for students to showcase creativity, research aptitude, and engineering excellence while promoting interdisciplinary learning and hands-on experience.',
  4,
  ARRAY[
    'Team size must be minimum 2 and maximum 4 students',
    'Entry fee is Rs. 200 per participant and is non-refundable',
    'Online registration is compulsory',
    'Participants must report at 9:15 AM and keep models ready before 10:00 AM',
    'Late reporting may lead to disqualification',
    'Judges'' decision will be final and binding'
  ],
  '{}'::TEXT[]
FROM events WHERE name = 'INNOVATE 2026: Science Model Exhibition'
ON CONFLICT (event_id) DO UPDATE SET
  brief = EXCLUDED.brief,
  team_size = EXCLUDED.team_size,
  rules = EXCLUDED.rules,
  rounds = EXCLUDED.rounds;

-- 7. AI Image Story Creation
INSERT INTO event_details (event_id, brief, team_size, rules, rounds)
SELECT id,
  'A creative competition where participants design an original story and generate a sequence of AI-created images that visually narrate it. The focus is on storytelling, visual continuity, and prompt creativity.',
  1,
  ARRAY[
    'Participation is open to all students',
    'Prior registration is mandatory',
    'Plagiarism will lead to disqualification',
    'Any rule violation will result in immediate disqualification',
    'Judges'' decisions will be final and binding',
    'Participants must follow the code of conduct'
  ],
  ARRAY[
    '{"title": "Round 1: Story Concept", "points": ["Submit a 200–300 words original story outline", "Divide the story into 4–6 key scenes", "Provide prompts for each scene''s image generation", "Shortlisting based on originality and clarity"]}',
    '{"title": "Round 2: Visual Story Presentation", "points": ["Generate 4–6 AI images based on approved concept", "Maintain character and theme consistency", "Present the visual sequence (3–5 minutes)"]}'
  ]::TEXT[]
FROM events WHERE name = 'AI Image Story Creation'
ON CONFLICT (event_id) DO UPDATE SET
  brief = EXCLUDED.brief,
  team_size = EXCLUDED.team_size,
  rules = EXCLUDED.rules,
  rounds = EXCLUDED.rounds;

-- 8. DesignVerse: UI/UX & AI Design Challenge
INSERT INTO event_details (event_id, brief, team_size, rules, rounds)
SELECT id,
  'DesignVerse is a UI/UX design competition where participants solve a real-world problem using tools like Figma or Canva. The focus is on usability, creativity, and effective presentation rather than coding.',
  2,
  ARRAY[
    'Open to students from all colleges across Indore',
    'Competition consists of two rounds: Basic Design and Presentation',
    'Participants must use only one primary design tool',
    'AI tools allowed only for ideation or layout support; full AI-generated designs are not permitted',
    'Problem statement will be provided on the day of event',
    'Use of multiple tools or duplicated designs will lead to disqualification',
    'Judges'' decision will be final and binding'
  ],
  ARRAY[
    '{"title": "Round 1: Basic Design", "points": ["Create prototype based on given problem statement"]}',
    '{"title": "Round 2: Presentation", "points": ["Present prototype using PPT or live demo", "Evaluation based on creativity, usability, clarity and presentation"]}'
  ]::TEXT[]
FROM events WHERE name = 'DesignVerse: UI/UX & AI Design Challenge'
ON CONFLICT (event_id) DO UPDATE SET
  brief = EXCLUDED.brief,
  team_size = EXCLUDED.team_size,
  rules = EXCLUDED.rules,
  rounds = EXCLUDED.rounds;

-- 9. Prompt it Right – AI Image Prompt Battle
INSERT INTO event_details (event_id, brief, team_size, rules, rounds)
SELECT id,
  'A Generative AI-based competition where participants compete by writing creative and precise prompts to generate high-quality AI images. The event focuses on prompt engineering, innovation, and AI tool handling.',
  1,
  ARRAY[
    'Participation is open to all students',
    'Registration before deadline is mandatory',
    'Participants will be evaluated on creativity, prompt clarity, output quality and uniqueness',
    'Any malpractice will lead to immediate disqualification',
    'Judges'' decisions will be final and binding',
    'Participants must follow code of conduct'
  ],
  ARRAY[
    '{"title": "Round 1: Prompt Sprint (Qualifiers)", "points": ["Generate best AI image based on theme using prompt engineering"]}',
    '{"title": "Round 2: Recreation Challenge", "points": ["Recreate reference AI image using prompt engineering"]}',
    '{"title": "Round 3: Final Battle (Surprise Theme)", "points": ["Generate most creative and accurate AI image using structured prompt"]}'
  ]::TEXT[]
FROM events WHERE name = 'Prompt it Right – AI Image Prompt Battle'
ON CONFLICT (event_id) DO UPDATE SET
  brief = EXCLUDED.brief,
  team_size = EXCLUDED.team_size,
  rules = EXCLUDED.rules,
  rounds = EXCLUDED.rounds;

-- 10. The Tech - Commercial show
INSERT INTO event_details (event_id, brief, team_size, rules, rounds)
SELECT id,
  'A high-engagement experiential event where teams act as creative agencies to design and present a marketing campaign for a technical product or concept.',
  3,
  ARRAY[
    'Participation is open to all students',
    'Registration before deadline is mandatory',
    'Event conducted in two rounds',
    'Participants evaluated on technical and performance criteria',
    'Malpractice leads to immediate disqualification',
    'Judges'' decision will be final and binding',
    'Participants must adhere to code of conduct'
  ],
  ARRAY[
    '{"title": "Round 1: Basic Technical Skills", "points": []}',
    '{"title": "Round 2: Technical & Performance Evaluation", "points": []}'
  ]::TEXT[]
FROM events WHERE name = 'The Tech - Commercial show'
ON CONFLICT (event_id) DO UPDATE SET
  brief = EXCLUDED.brief,
  team_size = EXCLUDED.team_size,
  rules = EXCLUDED.rules,
  rounds = EXCLUDED.rounds;

-- 11. Build your own Chatbot
INSERT INTO event_details (event_id, brief, team_size, rules, rounds)
SELECT id,
  'A technical challenge where participants design and develop a functional chatbot using AI tools or programming frameworks. The event tests innovation, problem-solving ability, UX design, and practical AI implementation.',
  2,
  ARRAY[
    'Participation is open to all students',
    'Prior registration is mandatory',
    'Approved tools, APIs or frameworks may be used',
    'Pre-built templates must be significantly modified',
    'Plagiarism or copied projects will lead to disqualification',
    'Judges'' decisions will be final and binding',
    'Participants must follow code of conduct'
  ],
  ARRAY[
    '{"title": "Round 1: Chatbot Concept & Design", "points": ["Submit chatbot idea with defined use-case", "Provide conversation flow design", "Define target users and problem statement"]}',
    '{"title": "Round 2: Chatbot Development & Demo", "points": ["Develop working prototype", "Demonstrate core functions (5–7 minutes)", "Q&A session with judges"]}'
  ]::TEXT[]
FROM events WHERE name = 'Build your own Chatbot'
ON CONFLICT (event_id) DO UPDATE SET
  brief = EXCLUDED.brief,
  team_size = EXCLUDED.team_size,
  rules = EXCLUDED.rules,
  rounds = EXCLUDED.rounds;

-- 12. Pharma Innoventia
INSERT INTO event_details (event_id, brief, team_size, rules, rounds)
SELECT id,
  'A formulation innovation competition where pharmacy students develop novel pharmaceutical, cosmeceutical, or nutraceutical preparations focusing on innovation, usability, and practical benefit.',
  4,
  ARRAY[
    'Only Pharmacy background students may participate',
    'Registration before deadline is mandatory',
    'Only properly prepared and packed items should be displayed',
    'Proper labeling and ingredient information is required',
    'Evaluation based on utilization, beneficial usage and innovation',
    'Judges'' decision will be final and binding',
    'Participants must maintain decorum'
  ],
  '{}'::TEXT[]
FROM events WHERE name = 'Pharma Innoventia'
ON CONFLICT (event_id) DO UPDATE SET
  brief = EXCLUDED.brief,
  team_size = EXCLUDED.team_size,
  rules = EXCLUDED.rules,
  rounds = EXCLUDED.rounds;

-- 13. Pharma Model
INSERT INTO event_details (event_id, brief, team_size, rules, rounds)
SELECT id,
  'A pharmacy and science-based working or display model competition evaluating educational creativity and practical presentation of pharmaceutical concepts.',
  4,
  ARRAY[
    'Only Pharmacy background students may participate',
    'Registration is compulsory',
    'Models will be evaluated on creativity and informative value',
    'Participants must maintain decorum of educational activity',
    'Judgment by experts will be final and binding'
  ],
  '{}'::TEXT[]
FROM events WHERE name = 'Pharma Model'
ON CONFLICT (event_id) DO UPDATE SET
  brief = EXCLUDED.brief,
  team_size = EXCLUDED.team_size,
  rules = EXCLUDED.rules,
  rounds = EXCLUDED.rounds;

-- 14. Pharmathon
INSERT INTO event_details (event_id, brief, team_size, rules, rounds)
SELECT id,
  'A hybrid-mode technical competition where participants identify real-world healthcare or pharmacy problems and propose simple, sustainable, and innovative solutions through structured presentation.',
  4,
  ARRAY[
    'Only Pharmacy background students may participate',
    'Registration is mandatory',
    'Teams must identify a real-world healthcare or pharmacy problem',
    'Participants must clearly explain problem impact and ethical concerns',
    'Solutions must be simple, realistic and sustainable',
    'AI-related solutions will receive additional focus',
    'Judgment based on clarity of problem and sustainability of solution'
  ],
  ARRAY[
    '{"title": "Step 1: Problem Selection", "points": ["Select real-world healthcare or pharmacy related issue"]}',
    '{"title": "Step 2: Problem Pitch", "points": ["Explain problem, affected group and importance"]}',
    '{"title": "Step 3: Solution Pitch", "points": ["Present innovative and practical solution"]}'
  ]::TEXT[]
FROM events WHERE name = 'Pharmathon'
ON CONFLICT (event_id) DO UPDATE SET
  brief = EXCLUDED.brief,
  team_size = EXCLUDED.team_size,
  rules = EXCLUDED.rules,
  rounds = EXCLUDED.rounds;

-- 15. ROBO Pick & place
INSERT INTO event_details (event_id, brief, team_size, rules, rounds)
SELECT id,
  'A robotics competition where teams design robots to pick objects from one location and accurately place them into a target area within the shortest time.',
  2,
  ARRAY[
    'Participation is open to all students',
    'Registration before deadline is mandatory',
    'Evaluation based on predefined technical and performance criteria',
    'Malpractice will lead to disqualification',
    'Judges'' decision will be final and binding',
    'Participants must adhere to code of conduct'
  ],
  ARRAY[
    '{"title": "Round 1: Group Stage", "points": []}',
    '{"title": "Round 2: Final", "points": []}'
  ]::TEXT[]
FROM events WHERE name = 'ROBO Pick & place'
ON CONFLICT (event_id) DO UPDATE SET
  brief = EXCLUDED.brief,
  team_size = EXCLUDED.team_size,
  rules = EXCLUDED.rules,
  rounds = EXCLUDED.rounds;

-- 16. ROBO Race
INSERT INTO event_details (event_id, brief, team_size, rules, rounds)
SELECT id,
  'A competitive robotics event where autonomous robots race to complete a predefined track in the shortest possible time while overcoming obstacles.',
  2,
  ARRAY[
    'Participation is open to all students',
    'Registration before deadline is mandatory',
    'Evaluation based on technical performance and time completion',
    'Malpractice leads to disqualification',
    'Judges'' decision will be final and binding'
  ],
  ARRAY[
    '{"title": "Round 1: Group Stage", "points": []}',
    '{"title": "Round 2: Semi Final", "points": []}',
    '{"title": "Round 3: Final", "points": []}'
  ]::TEXT[]
FROM events WHERE name = 'ROBO Race'
ON CONFLICT (event_id) DO UPDATE SET
  brief = EXCLUDED.brief,
  team_size = EXCLUDED.team_size,
  rules = EXCLUDED.rules,
  rounds = EXCLUDED.rounds;

-- 17. ROBO Soccer
INSERT INTO event_details (event_id, brief, team_size, rules, rounds)
SELECT id,
  'A competitive robotics football event where autonomous or semi-autonomous robots compete in a specially designed arena to score goals.',
  2,
  ARRAY[
    'Participation is open to all students',
    'Registration before deadline is mandatory',
    'Evaluation based on technical and performance criteria',
    'Malpractice leads to disqualification',
    'Judges'' decision will be final and binding'
  ],
  ARRAY[
    '{"title": "Round 1: Group Stage", "points": []}',
    '{"title": "Round 2: Semi Final", "points": []}',
    '{"title": "Round 3: Final", "points": []}'
  ]::TEXT[]
FROM events WHERE name = 'ROBO Soccer'
ON CONFLICT (event_id) DO UPDATE SET
  brief = EXCLUDED.brief,
  team_size = EXCLUDED.team_size,
  rules = EXCLUDED.rules,
  rounds = EXCLUDED.rounds;

-- 18. ROBO Swim
INSERT INTO event_details (event_id, brief, team_size, rules, rounds)
SELECT id,
  'A robotics competition where teams design and program a robot to complete water-themed or swimming-style tasks in a controlled environment.',
  2,
  ARRAY[
    'Participation is open to all students',
    'Registration before deadline is mandatory',
    'Evaluation based on predefined technical criteria',
    'Malpractice leads to disqualification',
    'Judges'' decision will be final and binding'
  ],
  ARRAY[
    '{"title": "Round 1: Group Stage", "points": []}',
    '{"title": "Round 2: Final", "points": []}'
  ]::TEXT[]
FROM events WHERE name = 'ROBO Swim'
ON CONFLICT (event_id) DO UPDATE SET
  brief = EXCLUDED.brief,
  team_size = EXCLUDED.team_size,
  rules = EXCLUDED.rules,
  rounds = EXCLUDED.rounds;

-- 19. AD-MAD Show
INSERT INTO event_details (event_id, brief, team_size, rules, rounds)
SELECT id,
  'A high-energy advertising competition where teams conceptualize, create, and present innovative marketing campaigns for assigned products, services, or social causes.',
  5,
  ARRAY[
    'Product category will be assigned by the institute',
    'Participants may advertise fictional or real products or social issues',
    'Maximum performance duration is 10 minutes',
    'Final ad presentation must be within 30 seconds',
    'Judging based on acting, dialogue delivery, creativity, expression, and relevance',
    'Bias against caste, creed, community or religion is prohibited',
    'Use of vulgar or non-parliamentary language will lead to disqualification',
    'Judges'' decision will be final'
  ],
  ARRAY[
    '{"title": "Round 1: Product Concept", "points": []}',
    '{"title": "Round 2: Radio Jingle & Newspaper Ad Creation", "points": []}',
    '{"title": "Round 3: Final Ad Presentation", "points": []}'
  ]::TEXT[]
FROM events WHERE name = 'AD-MAD Show'
ON CONFLICT (event_id) DO UPDATE SET
  brief = EXCLUDED.brief,
  team_size = EXCLUDED.team_size,
  rules = EXCLUDED.rules,
  rounds = EXCLUDED.rounds;

-- 20. AI Slave
INSERT INTO event_details (event_id, brief, team_size, rules, rounds)
SELECT id,
  'AI Slave – The Ultimate AI Prompt Challenge is a competitive event that tests participants'' ability to craft precise prompts and deliver effective AI-driven solutions under time constraints.',
  2,
  ARRAY[
    'Participation is open to all students',
    'Registration before deadline is mandatory',
    'Evaluation based on technical and performance criteria',
    'Malpractice leads to immediate disqualification',
    'Judges'' decision will be final and binding',
    'Participants must adhere to code of conduct'
  ],
  ARRAY[
    '{"title": "Round 1: Prompt Precision", "points": []}',
    '{"title": "Round 2: Creative Command", "points": []}',
    '{"title": "Round 3: Final Prompt Showdown", "points": []}'
  ]::TEXT[]
FROM events WHERE name = 'AI Slave'
ON CONFLICT (event_id) DO UPDATE SET
  brief = EXCLUDED.brief,
  team_size = EXCLUDED.team_size,
  rules = EXCLUDED.rules,
  rounds = EXCLUDED.rounds;

-- 21. Brand Quiz
INSERT INTO event_details (event_id, brief, team_size, rules, rounds)
SELECT id,
  'An interactive brand quiz competition that tests participants'' knowledge of brands, logos, taglines, advertising strategies, corporate identities, and global marketing trends.',
  3,
  ARRAY[
    'Participants must report 30 minutes before event',
    'Registration fee is non-refundable',
    'Use of mobile phones or electronic devices is prohibited',
    'Negative marking applies in buzzer round',
    'Tie-breaker round will be conducted if required',
    'Malpractice will lead to disqualification',
    'Quiz Master''s decision will be final'
  ],
  ARRAY[
    '{"title": "Round 1: Tagline & Logo Identification", "points": []}',
    '{"title": "Round 2: Rapid Fire", "points": ["60 seconds per team", "No passing allowed"]}',
    '{"title": "Round 3: Buzzer Round", "points": ["+10 for correct answer", "-5 for wrong answer"]}'
  ]::TEXT[]
FROM events WHERE name = 'Brand Quiz'
ON CONFLICT (event_id) DO UPDATE SET
  brief = EXCLUDED.brief,
  team_size = EXCLUDED.team_size,
  rules = EXCLUDED.rules,
  rounds = EXCLUDED.rounds;

-- 22. Business Ethics Decision Making
INSERT INTO event_details (event_id, brief, team_size, rules, rounds)
SELECT id,
  'An activity-based ethical decision-making competition designed to test students'' leadership judgment, analytical reasoning, and ability to defend business decisions in realistic scenarios.',
  3,
  ARRAY[
    'Open to Graduate and Post Graduate students',
    'Registration before deadline is mandatory',
    'Strict adherence to time limits',
    'Use of mobile phones or internet is prohibited',
    'Professional conduct must be maintained',
    'Judges'' decision will be final and binding'
  ],
  ARRAY[
    '{"title": "Round 1: Quiz Round", "points": []}',
    '{"title": "Round 2: Case Study & Presentation", "points": []}',
    '{"title": "Round 3: Defend Your Decision (Q&A)", "points": []}'
  ]::TEXT[]
FROM events WHERE name = 'Business Ethics Decision Making'
ON CONFLICT (event_id) DO UPDATE SET
  brief = EXCLUDED.brief,
  team_size = EXCLUDED.team_size,
  rules = EXCLUDED.rules,
  rounds = EXCLUDED.rounds;

-- 23. Share Market Simulation
INSERT INTO event_details (event_id, brief, team_size, rules, rounds)
SELECT id,
  'A stock market simulation event that gives participants hands-on experience in virtual trading, portfolio management, and investment decision-making.',
  2,
  ARRAY[
    'Participation is open to all students',
    'Registration before deadline is mandatory',
    'No real money involved',
    'Trading allowed only on provided simulation platform',
    'Transaction cost will be deducted on each trade',
    'Unfair means will result in disqualification'
  ],
  ARRAY[
    '{"title": "Round 1: Market Quiz & Strategy Test", "points": ["Finance-based quiz covering stock market basics"]}',
    '{"title": "Round 2: Live Trading Simulation", "points": ["Virtual capital provided", "Build and manage portfolio strategically"]}'
  ]::TEXT[]
FROM events WHERE name = 'Share Market Simulation'
ON CONFLICT (event_id) DO UPDATE SET
  brief = EXCLUDED.brief,
  team_size = EXCLUDED.team_size,
  rules = EXCLUDED.rules,
  rounds = EXCLUDED.rounds;


