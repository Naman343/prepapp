import { PrismaClient, Difficulty } from '@prisma/client'
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
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
