import { db, municipalities, users, threads, threadTags, comments, clubs, clubMembers, clubThreads } from './index.js'
import { renderMarkdown } from '../utils/markdown.js'

async function seed() {
  console.log('🌱 Seeding database...')

  // Create municipalities
  console.log('Creating municipalities...')
  const [tampere, helsinki] = await db.insert(municipalities).values([
    { name: 'Tampere', nameFi: 'Tampere', nameSv: 'Tammerfors', region: 'Pirkanmaa', population: 244000 },
    { name: 'Helsinki', nameFi: 'Helsinki', nameSv: 'Helsingfors', region: 'Uusimaa', population: 658000 }
  ]).returning()

  // Create users
  console.log('Creating users...')
  const [tampereMunicipality, helsinkiMunicipality, traficom, ministryEnv, matti, anna, liisa, juha, maria] = await db.insert(users).values([
    // Institutions
    {
      email: 'kaupunki@tampere.fi',
      name: 'City of Tampere',
      role: 'institution',
      institutionType: 'municipality',
      institutionName: 'City of Tampere',
      municipalityId: tampere.id,
      identityVerified: true,
      identityProvider: 'institutional',
      identityLevel: 'high'
    },
    {
      email: 'kaupunki@hel.fi',
      name: 'City of Helsinki',
      role: 'institution',
      institutionType: 'municipality',
      institutionName: 'City of Helsinki',
      municipalityId: helsinki.id,
      identityVerified: true,
      identityProvider: 'institutional',
      identityLevel: 'high'
    },
    {
      email: 'info@traficom.fi',
      name: 'Finnish Transport and Communications Agency',
      role: 'institution',
      institutionType: 'agency',
      institutionName: 'Traficom',
      identityVerified: true,
      identityProvider: 'institutional',
      identityLevel: 'high'
    },
    {
      email: 'kirjaamo@gov.fi',
      name: 'Ministry of the Environment',
      role: 'institution',
      institutionType: 'ministry',
      institutionName: 'Ministry of the Environment',
      identityVerified: true,
      identityProvider: 'institutional',
      identityLevel: 'high'
    },
    // Citizens
    {
      email: 'matti.virtanen@example.com',
      name: 'Matti Virtanen',
      role: 'citizen',
      municipalityId: tampere.id,
      identityVerified: true,
      identityProvider: 'magic_link',
      identityLevel: 'basic'
    },
    {
      email: 'anna.korhonen@example.com',
      name: 'Anna Korhonen',
      role: 'citizen',
      municipalityId: tampere.id,
      identityVerified: true,
      identityProvider: 'magic_link',
      identityLevel: 'basic'
    },
    {
      email: 'liisa.makinen@example.com',
      name: 'Liisa Mäkinen',
      role: 'citizen',
      municipalityId: tampere.id,
      identityVerified: true,
      identityProvider: 'magic_link',
      identityLevel: 'basic'
    },
    {
      email: 'juha.nieminen@example.com',
      name: 'Juha Nieminen',
      role: 'citizen',
      municipalityId: helsinki.id,
      identityVerified: true,
      identityProvider: 'magic_link',
      identityLevel: 'basic'
    },
    {
      email: 'maria.lahtinen@example.com',
      name: 'Maria Lahtinen',
      role: 'citizen',
      municipalityId: tampere.id,
      identityVerified: true,
      identityProvider: 'magic_link',
      identityLevel: 'basic'
    }
  ]).returning()

  // Create threads
  console.log('Creating threads...')
  const thread1Content = `The City of Tampere is seeking public input on the proposed City Centre Development Plan for 2025–2030. This comprehensive plan aims to create a more pedestrian-friendly, sustainable, and vibrant city centre.

**Key proposals include:**

- Expansion of pedestrian zones along Hämeenkatu
- New cycling infrastructure connecting the railway station to Laukontori
- Mixed-use development opportunities in underutilized areas
- Green corridor connecting Koskipuisto to Näsinpuisto
- Improved public transport connections

We encourage all residents to review the attached documents and share their thoughts, concerns, and suggestions. Your input is valuable in shaping the future of our city centre.

The consultation period runs from January 15 to February 28, 2025.`

  const [thread1, thread2, thread3, thread4] = await db.insert(threads).values([
    {
      title: 'City Centre Development Plan 2025–2030 — Public Consultation',
      content: thread1Content,
      contentHtml: renderMarkdown(thread1Content),
      authorId: tampereMunicipality.id,
      scope: 'municipal',
      municipalityId: tampere.id,
      institutionalContext: {
        docs: [
          { title: 'Development Plan Draft (PDF)', url: '#' },
          { title: 'Environmental Impact Assessment', url: '#' },
          { title: 'Traffic Analysis Report', url: '#' }
        ],
        timeline: [
          { date: '2025-01-15', event: 'Public consultation opens' },
          { date: '2025-02-28', event: 'Consultation period ends' },
          { date: '2025-04-01', event: 'City Council review' },
          { date: '2025-06-15', event: 'Final decision expected' }
        ],
        faq: [
          { q: 'How can I submit feedback?', a: 'You can comment directly in this thread or submit written feedback to kaupunkisuunnittelu@tampere.fi' },
          { q: 'Will there be public hearings?', a: 'Yes, public hearings are scheduled for February 10th and February 17th at the City Hall.' }
        ],
        contact: 'kaupunkisuunnittelu@tampere.fi'
      },
      replyCount: 3
    },
    {
      title: 'New Public Library Branch — Location Feedback',
      content: `The City of Tampere is planning a new library branch to serve the growing eastern districts. We have identified three potential locations and would like to hear from residents about their preferences.

**Location Options:**

1. **Hervanta Centre** - Close to public transport hub, existing commercial area
2. **Hallila** - Residential area with limited current services
3. **Vuores** - New development area with young families

Please share your thoughts on which location would best serve your needs and why.`,
      contentHtml: renderMarkdown(`The City of Tampere is planning a new library branch...`),
      authorId: tampereMunicipality.id,
      scope: 'municipal',
      municipalityId: tampere.id,
      institutionalContext: {
        docs: [{ title: 'Location Options Analysis', url: '#' }],
        timeline: [
          { date: '2025-01-20', event: 'Feedback collection begins' },
          { date: '2025-02-15', event: 'Feedback period ends' }
        ],
        contact: 'kirjasto@tampere.fi'
      },
      replyCount: 0
    },
    {
      title: 'Winter Maintenance Feedback Thread',
      content: `Fellow Tampere residents,

I've created this thread to collect feedback about winter maintenance in our neighborhoods. I've noticed some areas seem to get plowed much faster than others, and pedestrian paths are often neglected.

**My observations from Kaleva district:**
- Main roads are cleared quickly (within 4-6 hours of snowfall)
- Pedestrian paths often remain uncleared for 24+ hours
- Bus stops can become quite hazardous

Has anyone else noticed similar patterns? I'm thinking we could compile feedback and present it constructively to the city.`,
      contentHtml: renderMarkdown(`Fellow Tampere residents...`),
      authorId: matti.id,
      scope: 'municipal',
      municipalityId: tampere.id,
      replyCount: 2
    },
    {
      title: 'National Climate Action Strategy — Public Input Phase',
      content: `The Ministry of the Environment invites all citizens to participate in shaping Finland's updated National Climate Action Strategy.

**Key areas of focus:**

- Energy transition and renewable energy deployment
- Sustainable transportation systems
- Building efficiency standards
- Land use and carbon sinks
- Circular economy initiatives

We are particularly interested in hearing how climate policies affect your daily life and what support would help you make sustainable choices.`,
      contentHtml: renderMarkdown(`The Ministry of the Environment invites...`),
      authorId: ministryEnv.id,
      scope: 'national',
      institutionalContext: {
        docs: [
          { title: 'Climate Strategy Draft 2025', url: '#' },
          { title: 'Carbon Neutrality Roadmap', url: '#' }
        ],
        timeline: [
          { date: '2025-01-10', event: 'Public input phase begins' },
          { date: '2025-03-31', event: 'Input phase ends' }
        ],
        contact: 'ilmasto@gov.fi'
      },
      replyCount: 0
    }
  ]).returning()

  // Add tags
  console.log('Adding thread tags...')
  await db.insert(threadTags).values([
    { threadId: thread1.id, tag: 'urban-planning' },
    { threadId: thread1.id, tag: 'consultation' },
    { threadId: thread1.id, tag: 'development' },
    { threadId: thread2.id, tag: 'libraries' },
    { threadId: thread2.id, tag: 'services' },
    { threadId: thread3.id, tag: 'maintenance' },
    { threadId: thread3.id, tag: 'winter' },
    { threadId: thread3.id, tag: 'feedback' },
    { threadId: thread4.id, tag: 'climate' },
    { threadId: thread4.id, tag: 'environment' },
    { threadId: thread4.id, tag: 'national-policy' }
  ])

  // Add comments
  console.log('Adding comments...')
  const [comment1] = await db.insert(comments).values([
    {
      threadId: thread1.id,
      authorId: anna.id,
      content: `Thank you for this comprehensive plan. I'm particularly supportive of the cycling infrastructure improvements. Currently, cycling from the station to Laukontori feels quite unsafe, especially during rush hour.

One suggestion: could the plan include secure bicycle parking facilities at key points?`,
      contentHtml: renderMarkdown(`Thank you for this comprehensive plan...`)
    },
    {
      threadId: thread1.id,
      authorId: juha.id,
      content: `I have concerns about the pedestrianization of Hämeenkatu. While I understand the benefits, how will this affect delivery vehicles and emergency services?`,
      contentHtml: renderMarkdown(`I have concerns...`)
    },
    {
      threadId: thread1.id,
      authorId: tampereMunicipality.id,
      content: `Thank you for raising these important points.

Regarding deliveries and emergency services: The plan includes designated time windows for deliveries (6-10 AM) and emergency vehicle access will be maintained through retractable bollards.

These details are covered in Section 4.3 of the Environmental Impact Assessment document.`,
      contentHtml: renderMarkdown(`Thank you for raising...`),
      parentId: null
    },
    {
      threadId: thread3.id,
      authorId: anna.id,
      content: `Same situation in Hervanta. The main roads are fine, but the walking paths to schools are often icy for days. This is a safety issue.`,
      contentHtml: renderMarkdown(`Same situation in Hervanta...`)
    },
    {
      threadId: thread3.id,
      authorId: liisa.id,
      content: `I've documented this over the past three winters. The pattern is consistent. I think we need to advocate for adjusting the priority system.`,
      contentHtml: renderMarkdown(`I've documented this...`)
    }
  ]).returning()

  // Create clubs
  console.log('Creating clubs...')
  const [historyClub, cyclingClub, hervantaClub] = await db.insert(clubs).values([
    {
      name: 'Tampere History Enthusiasts',
      slug: 'tampere-history',
      description: 'A community for those interested in the rich industrial and cultural history of Tampere.',
      rules: [
        'Be respectful of different perspectives on historical events',
        'Cite sources when sharing historical claims',
        'No political debates about current events'
      ],
      category: 'Local History',
      creatorId: liisa.id,
      memberCount: 3
    },
    {
      name: 'Cycling in Tampere',
      slug: 'cycling-tampere',
      description: 'For cyclists of all levels in the Tampere region. Share routes, discuss infrastructure, organize group rides.',
      rules: [
        'Be inclusive of all cycling levels',
        'Safety discussions welcome, but no shaming',
        'Keep advocacy constructive'
      ],
      category: 'Sports & Outdoors',
      creatorId: anna.id,
      memberCount: 2
    },
    {
      name: 'Hervanta Neighbors',
      slug: 'hervanta-neighbors',
      description: 'The community hub for Hervanta residents.',
      rules: [
        'Keep discussions relevant to Hervanta',
        'No commercial advertising without approval',
        'Be helpful and neighborly'
      ],
      category: 'Neighborhoods',
      creatorId: matti.id,
      memberCount: 2
    }
  ]).returning()

  // Add club members
  console.log('Adding club members...')
  await db.insert(clubMembers).values([
    { clubId: historyClub.id, userdId: liisa.id, role: 'admin' },
    { clubId: historyClub.id, userId: matti.id, role: 'member' },
    { clubId: historyClub.id, userId: maria.id, role: 'member' },
    { clubId: cyclingClub.id, userId: anna.id, role: 'admin' },
    { clubId: cyclingClub.id, userId: matti.id, role: 'member' },
    { clubId: hervantaClub.id, userId: matti.id, role: 'admin' },
    { clubId: hervantaClub.id, userId: maria.id, role: 'member' }
  ])

  // Create club threads
  console.log('Creating club threads...')
  await db.insert(clubThreads).values([
    {
      clubId: historyClub.id,
      authorId: liisa.id,
      title: 'Welcome & Resources for New Members',
      content: `Welcome to Tampere History Enthusiasts! This thread serves as an introduction to our community.

**Recommended starting points:**
- Vapriikki Museum Center
- Tampere City Archives
- "Tampere: A History of Industrial Finland" by Pertti Haapala`,
      contentHtml: renderMarkdown(`Welcome to Tampere History Enthusiasts!...`),
      isPinned: true,
      replyCount: 0
    },
    {
      clubId: cyclingClub.id,
      authorId: anna.id,
      title: '2025 Infrastructure Updates & Advocacy',
      content: `Let's use this thread to track cycling infrastructure updates in 2025.

**Confirmed projects for 2025:**
- Ratina-Lielahti cycling bridge completion
- Hervanta main cycling route resurfacing`,
      contentHtml: renderMarkdown(`Let's use this thread...`),
      isPinned: true,
      replyCount: 0
    }
  ])

  console.log('✅ Seeding complete!')
}

seed()
  .catch(console.error)
  .finally(() => process.exit())
