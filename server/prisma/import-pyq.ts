/**
 * PYQ Import Script
 *
 * Usage:
 *   npx ts-node prisma/import-pyq.ts prisma/pyq-data/2021-gs1.json
 *
 * Add more year files in prisma/pyq-data/ following the same JSON schema:
 *   2022-gs1.json, 2023-gs1.json, etc.
 *
 * JSON schema: see prisma/pyq-data/2021-gs1.json
 */

import { PrismaClient, Difficulty } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

type OptionData = {
  text: string
  isCorrect: boolean
}

type QuestionData = {
  text: string
  difficulty: string
  topic: string
  explanation: string
  options: OptionData[]
}

type PYQFile = {
  test: {
    title: string
    year: number
    date: string
    duration: number
    totalQuestions: number
    isPublished: boolean
  }
  questions: QuestionData[]
}

async function main() {
  const filePath = process.argv[2]
  if (!filePath) {
    console.error('Usage: npx ts-node prisma/import-pyq.ts <path-to-json>')
    process.exit(1)
  }

  const raw = fs.readFileSync(path.resolve(filePath), 'utf-8')
  const data: PYQFile = JSON.parse(raw)

  console.log(`Importing: ${data.test.title}`)

  // 1. Ensure 'General Studies' subject exists
  const gsSubject = await prisma.subject.upsert({
    where: { name: 'General Studies' },
    update: {},
    create: { name: 'General Studies' },
  })

  // 2. Collect unique topic names from the JSON and upsert each
  const topicNames = [...new Set(data.questions.map((q) => q.topic))]
  const topicMap: Record<string, string> = {}

  for (const name of topicNames) {
    const existing = await prisma.topic.findFirst({
      where: { name, subjectId: gsSubject.id },
    })
    if (existing) {
      topicMap[name] = existing.id
    } else {
      const created = await prisma.topic.create({
        data: { name, subjectId: gsSubject.id },
      })
      topicMap[name] = created.id
      console.log(`  Created topic: ${name}`)
    }
  }

  // 3. Check for duplicate test (same title + year)
  const existingTest = await prisma.test.findFirst({
    where: { title: data.test.title, year: data.test.year },
  })
  if (existingTest) {
    console.error(
      `Test "${data.test.title}" (${data.test.year}) already exists. Skipping.`,
    )
    await prisma.$disconnect()
    return
  }

  // 4. Create all questions first, then link to test
  const createdQuestionIds: string[] = []

  for (const q of data.questions) {
    const question = await prisma.question.create({
      data: {
        text: q.text,
        difficulty: q.difficulty as Difficulty,
        explanation: q.explanation,
        topicId: topicMap[q.topic],
        options: {
          create: q.options.map((o) => ({
            text: o.text,
            isCorrect: o.isCorrect,
          })),
        },
      },
    })
    createdQuestionIds.push(question.id)
  }

  console.log(`  Created ${createdQuestionIds.length} questions`)

  // 5. Create the test and link questions
  const test = await prisma.test.create({
    data: {
      title: data.test.title,
      year: data.test.year,
      date: data.test.date ? new Date(data.test.date) : null,
      duration: data.test.duration,
      totalQuestions: data.test.totalQuestions,
      isPublished: data.test.isPublished,
      questions: {
        connect: createdQuestionIds.map((id) => ({ id })),
      },
    },
  })

  console.log(`Successfully imported: "${test.title}" (ID: ${test.id})`)
  console.log(`  Year: ${test.year} | Questions: ${createdQuestionIds.length}/${data.test.totalQuestions}`)
  if (createdQuestionIds.length < data.test.totalQuestions) {
    console.warn(
      `  ⚠  Only ${createdQuestionIds.length} of ${data.test.totalQuestions} questions imported.`,
    )
    console.warn(`     Add remaining questions to the JSON file and re-run.`)
  }

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  prisma.$disconnect()
  process.exit(1)
})
