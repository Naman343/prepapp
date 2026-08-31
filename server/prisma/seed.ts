import { PrismaClient, Difficulty, SyllabusPaper, TopicPriority } from '@prisma/client'
import { randomBytes } from 'crypto'

const prisma = new PrismaClient()
import * as bcrypt from 'bcrypt';


async function main() {
    console.log('Seeding data...')

    // 0a. Create Default Admin
    const adminPassword = 'Admin@1234';
    const adminHash = await bcrypt.hash(adminPassword, 10);
    await prisma.user.upsert({
        where: { email: 'admin@prepapp.com' },
        update: {},
        create: {
            email: 'admin@prepapp.com',
            passwordHash: adminHash,
            role: 'ADMIN',
            name: 'Admin',
            memberId: randomBytes(6).toString('hex'),
        },
    });
    console.log('Admin created: admin@prepapp.com / Admin@1234');

    // 0b. Create Test User
    const registerPassword = 'Password123';
    const hashedPassword = await bcrypt.hash(registerPassword, 10);
    const testUser = await prisma.user.upsert({
        where: { email: 'test@example.com' },
        update: {},
        create: {
            email: 'test@example.com',
            passwordHash: hashedPassword,
            role: 'USER',
            memberId: randomBytes(6).toString('hex'),
        }
    });
    console.log('Test User created: test@example.com / Password123');


    // 1. Create Subject (Required for Topics)
    const gsSubject = await prisma.subject.upsert({
        where: { name: 'General Studies' },
        update: {},
        create: { name: 'General Studies' },
    })

    // 2. Create Topics connected to Subject
    const findOrCreateTopic = async (name: string) => {
        const existing = await prisma.topic.findFirst({ where: { name, subjectId: gsSubject.id } })
        if (existing) return existing
        return prisma.topic.create({ data: { name, subjectId: gsSubject.id } })
    }

    const history = await findOrCreateTopic('History')
    const polity = await findOrCreateTopic('Polity')
    const geography = await findOrCreateTopic('Geography')
    const economy = await findOrCreateTopic('Economy')

    // 3. Create the Test (skip if already exists)
    let mockTest = await prisma.test.findFirst({
        where: { title: 'UPSC Prelims 2023 - GS Paper 1 (Sample)', year: 2023 },
    })
    if (!mockTest) {
        mockTest = await prisma.test.create({
            data: {
                title: 'UPSC Prelims 2023 - GS Paper 1 (Sample)',
                duration: 120,
                totalQuestions: 10,
                year: 2023,
                isPublished: true,
            },
        })
    }

    // 4. Create Questions (Mixed Topics)
    const questions = [
        {
            text: 'With reference to the Indian economy, consider the following statements: \n1. If the inflation is too high, RBI is likely to buy government securities. \n2. If the rupee is rapidly depreciating, RBI is likely to sell dollars in the market. \nWhich of the statements given above is/are correct?',
            difficulty: Difficulty.MEDIUM,
            topicId: economy.id,
            explanation: 'Statement 1 is incorrect: If inflation is high, RBI sells securities to suck out liquidity. Statement 2 is correct: Selling dollars increases supply of USD, supporting the Rupee.',
            options: [
                { text: '1 only', isCorrect: false },
                { text: '2 only', isCorrect: true },
                { text: 'Both 1 and 2', isCorrect: false },
                { text: 'Neither 1 nor 2', isCorrect: false },
            ]
        },
        {
            text: 'Which one of the following is the best description of ‘Nirvana’ in Buddhism?',
            difficulty: Difficulty.EASY,
            topicId: history.id,
            explanation: 'Nirvana represents the extinction of desire, the "blowing out" of the fires of greed, hatred, and delusion.',
            options: [
                { text: 'The extinction of the flame of desire', isCorrect: true },
                { text: 'The complete annihilation of self', isCorrect: false },
                { text: 'A state of bliss and rest', isCorrect: false },
                { text: 'A mental stage beyond all comprehension', isCorrect: false },
            ]
        },
        {
            text: 'Consider the following statements regarding the "Preamble" of the Indian Constitution: \n1. It is not a part of the Constitution. \n2. It explicitly mentions "Secular" since 1950. \nWhich of the above is/are correct?',
            difficulty: Difficulty.MEDIUM,
            topicId: polity.id,
            explanation: '1 is incorrect (Kesavananda Bharati case 1973 declared it part). 2 is incorrect (Added by 42nd Amendment 1976).',
            options: [
                { text: '1 only', isCorrect: false },
                { text: '2 only', isCorrect: false },
                { text: 'Both 1 and 2', isCorrect: false },
                { text: 'Neither 1 nor 2', isCorrect: true },
            ]
        },
        {
            text: 'The term "Levant" often heard in news roughly corresponds to which of the following regions?',
            difficulty: Difficulty.HARD,
            topicId: geography.id,
            explanation: 'Levant historically usually refers to the region along the eastern Mediterranean shores.',
            options: [
                { text: 'Region along the eastern Mediterranean shores', isCorrect: true },
                { text: 'Region along North African shores stretching from Egypt to Morocco', isCorrect: false },
                { text: 'Region along Persian Gulf and Horn of Africa', isCorrect: false },
                { text: 'The entire coastal areas of Mediterranean Sea', isCorrect: false },
            ]
        },
        {
            text: 'Who among the following was associated with the formation of the "Swaraj Party"?',
            difficulty: Difficulty.MEDIUM,
            topicId: history.id,
            explanation: 'Swaraj Party was formed by C.R. Das and Motilal Nehru in 1923.',
            options: [
                { text: 'Subhash Chandra Bose', isCorrect: false },
                { text: 'C.R. Das and Motilal Nehru', isCorrect: true },
                { text: 'Jawaharlal Nehru', isCorrect: false },
                { text: 'Mahatma Gandhi', isCorrect: false },
            ]
        }
        // Add 5 more if needed, sticking to 5 for brevity/latency but enough to test.
    ]

    for (const q of questions) {
        const { options, ...questionData } = q
        // Skip if an identical question already exists in this test
        const exists = await prisma.question.findFirst({
            where: { text: questionData.text, topicId: questionData.topicId },
        })
        if (exists) continue
        await prisma.question.create({
            data: {
                ...questionData,
                tests: {
                    connect: { id: mockTest.id }
                },
                options: {
                    create: options
                }
            }
        })
    }

console.log('Seed completed successfully.')

    // Seed Curriculum
    await seedCurriculum()
}

async function seedCurriculum() {
    console.log('Seeding curriculum...')

    const sections = [
        {
            paper: SyllabusPaper.GS_PAPER_I,
            title: 'General Studies Paper I',
            description: 'History, Geography, Polity, Economy, Environment, Science & Current Affairs',
            icon: 'BookOpen',
            color: 'text-blue-600',
            bgColor: 'bg-blue-50 border-blue-100',
            order: 1,
            topics: [
                {
                    title: 'History of India & Indian National Movement',
                    description: 'Ancient, Medieval, Modern Indian History and Freedom Struggle',
                    weightage: '~15-20 questions',
                    priority: TopicPriority.HIGH,
                    order: 1,
                    subTopics: [
                        'Indus Valley Civilization, Vedic Period',
                        'Mauryan & Gupta Empires',
                        'Delhi Sultanate, Mughal Empire',
                        'British Expansion & Economic Policies',
                        'Revolt of 1857, Social Reform Movements',
                        'Indian National Congress, Gandhian Era',
                        'Quit India Movement, Partition & Independence',
                    ],
                },
                {
                    title: 'Indian & World Geography',
                    description: 'Physical, Social, Economic Geography of India and World',
                    weightage: '~10-15 questions',
                    priority: TopicPriority.HIGH,
                    order: 2,
                    subTopics: [
                        'Physical Geography: Landforms, Climate, Oceans',
                        'Indian Physiography, Drainage, Climate',
                        'Natural Resources: Minerals, Energy, Forests',
                        'Agriculture, Industries, Transport',
                        'Population, Urbanization, Settlements',
                        'World Geography: Continents, Major Regions',
                        'Map-based questions',
                    ],
                },
                {
                    title: 'Indian Polity & Governance',
                    description: 'Constitution, Political System, Panchayati Raj, Public Policy',
                    weightage: '~15-20 questions',
                    priority: TopicPriority.HIGH,
                    order: 3,
                    subTopics: [
                        'Constitution: Preamble, Features, Amendments',
                        'Fundamental Rights, Duties, DPSP',
                        'Union & State Executive, Legislature',
                        'Judiciary: Supreme Court, High Courts',
                        'Centre-State Relations, Emergency Provisions',
                        'Panchayati Raj, Municipalities',
                        'Constitutional & Non-Constitutional Bodies',
                    ],
                },
                {
                    title: 'Economic & Social Development',
                    description: 'Sustainable Development, Poverty, Demographics, Social Sector',
                    weightage: '~10-15 questions',
                    priority: TopicPriority.MEDIUM,
                    order: 4,
                    subTopics: [
                        'National Income, Planning, NITI Aayog',
                        'Money, Banking, Financial Markets',
                        'Public Finance, Budget, Taxation',
                        'Inflation, Employment, Poverty',
                        'Social Sector: Health, Education, Schemes',
                        'Sustainable Development Goals',
                        'Recent Economic Surveys & Budgets',
                    ],
                },
                {
                    title: 'Environment & Ecology',
                    description: 'Biodiversity, Climate Change, Conservation, Environmental Laws',
                    weightage: '~10-15 questions',
                    priority: TopicPriority.MEDIUM,
                    order: 5,
                    subTopics: [
                        'Ecosystem, Biodiversity, Hotspots',
                        'Climate Change: Causes, Impact, Mitigation',
                        'Pollution: Air, Water, Soil, Waste',
                        'Conservation: Protected Areas, Species',
                        'Environmental Laws, Policies, Treaties',
                        'EIA, Green Initiatives, Renewable Energy',
                        'Current Environmental Issues',
                    ],
                },
                {
                    title: 'General Science',
                    description: 'Physics, Chemistry, Biology basics + Science & Technology',
                    weightage: '~10-15 questions',
                    priority: TopicPriority.MEDIUM,
                    order: 6,
                    subTopics: [
                        'Physics: Motion, Energy, Light, Sound',
                        'Chemistry: Matter, Reactions, Periodic Table',
                        'Biology: Cell, Genetics, Human Body, Diseases',
                        'Space Technology: ISRO, Missions, Satellites',
                        'Defense Technology: Missiles, Systems',
                        'Biotechnology, Nanotechnology, AI',
                        'Nobel Prizes, Recent Discoveries',
                    ],
                },
                {
                    title: 'Current Affairs',
                    description: 'National & International Events of Last 12-18 Months',
                    weightage: '~15-25 questions',
                    priority: TopicPriority.HIGH,
                    order: 7,
                    subTopics: [
                        'Government Schemes & Policies',
                        'International Relations, Summits, Treaties',
                        'Economic Developments, Reports, Indices',
                        'Science & Tech Breakthroughs',
                        'Environment & Climate Agreements',
                        'Sports, Awards, Books, Personalities',
                        'State-specific Developments',
                    ],
                },
            ],
        },
        {
            paper: SyllabusPaper.GS_PAPER_II_CSAT,
            title: 'General Studies Paper II (CSAT)',
            description: 'Comprehension, Reasoning, Quantitative Aptitude, Decision Making',
            icon: 'Target',
            color: 'text-green-600',
            bgColor: 'bg-green-50 border-green-100',
            order: 2,
            topics: [
                {
                    title: 'Comprehension',
                    description: 'Reading passages with inference-based questions',
                    weightage: '~25-30 questions',
                    priority: TopicPriority.MEDIUM,
                    order: 1,
                    subTopics: [
                        'Short & Long Passages',
                        'Inference & Assumption Questions',
                        'Tone & Theme Identification',
                        'Vocabulary in Context',
                    ],
                },
                {
                    title: 'Logical Reasoning & Analytical Ability',
                    description: 'Pattern recognition, logical deduction, analytical puzzles',
                    weightage: '~15-20 questions',
                    priority: TopicPriority.MEDIUM,
                    order: 2,
                    subTopics: [
                        'Syllogisms, Statements & Conclusions',
                        'Blood Relations, Direction Sense',
                        'Coding-Decoding, Series Completion',
                        'Puzzles: Seating, Scheduling, Grouping',
                        'Data Sufficiency, Decision Making',
                    ],
                },
                {
                    title: 'Quantitative Aptitude',
                    description: 'Basic numeracy, data interpretation, mental math',
                    weightage: '~10-15 questions',
                    priority: TopicPriority.MEDIUM,
                    order: 3,
                    subTopics: [
                        'Number System, HCF/LCM, Percentages',
                        'Ratio, Proportion, Partnership',
                        'Time & Work, Time Speed Distance',
                        'Profit Loss, Simple/Compound Interest',
                        'Data Interpretation: Tables, Charts, Graphs',
                        'Permutation, Combination, Probability',
                    ],
                },
                {
                    title: 'Decision Making & Problem Solving',
                    description: 'Situational judgment, administrative decision scenarios',
                    weightage: '~5-10 questions',
                    priority: TopicPriority.LOW,
                    order: 4,
                    subTopics: [
                        'Ethical Decision Making',
                        'Administrative Scenarios',
                        'Policy Implementation Challenges',
                        'Conflict Resolution',
                    ],
                },
            ],
        },
    ]

    for (const sectionData of sections) {
        const { topics, ...sectionFields } = sectionData

        const existingSection = await prisma.syllabusSection.findUnique({
            where: { paper: sectionFields.paper },
        })

        let section
        if (existingSection) {
            section = await prisma.syllabusSection.update({
                where: { paper: sectionFields.paper },
                data: sectionFields,
            })
        } else {
            section = await prisma.syllabusSection.create({
                data: sectionFields,
            })
        }

        for (const topicData of topics) {
            const { subTopics, ...topicFields } = topicData

            const existingTopic = await prisma.syllabusTopic.findFirst({
                where: {
                    title: topicFields.title,
                    sectionId: section.id,
                },
            })

            let topic
            if (existingTopic) {
                topic = await prisma.syllabusTopic.update({
                    where: { id: existingTopic.id },
                    data: topicFields,
                })
            } else {
                topic = await prisma.syllabusTopic.create({
                    data: {
                        ...topicFields,
                        sectionId: section.id,
                    },
                })
            }

            for (const subTopicTitle of subTopics) {
                const existingSub = await prisma.subTopic.findFirst({
                    where: {
                        title: subTopicTitle,
                        topicId: topic.id,
                    },
                })

                if (!existingSub) {
                    await prisma.subTopic.create({
                        data: {
                            title: subTopicTitle,
                            topicId: topic.id,
                        },
                    })
                }
            }
        }
    }

    console.log('Curriculum seeded successfully.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
