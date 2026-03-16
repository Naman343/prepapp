/**
 * PYQ Import Script
 *
 * Usage:
 *   npx ts-node prisma/import-pyq.ts prisma/pyq-data/history.json
 *
 * JSON schema (topic-grouped, optional test block):
 * {
 *   "topic": "History",
 *   "test": {                          // optional — omit for question-bank-only import
 *     "title": "UPSC Prelims 2021 — GS Paper 1",
 *     "year": 2021,
 *     "date": "2021-06-10",
 *     "duration": 120,
 *     "totalQuestions": 100,
 *     "isPublished": true
 *   },
 *   "questions": [
 *     {
 *       "exam_year": 2021,
 *       "sub_topic": "Mughal Period",
 *       "question_number": 3,
 *       "question": "...",
 *       "options": { "a": "...", "b": "...", "c": "...", "d": "..." },
 *       "correct_answer": "c",
 *       "explanation": "..."
 *     }
 *   ]
 * }
 */

import { PrismaClient, Difficulty } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

// ── Types matching the new JSON schema ──────────────────────────────

type OptionsMap = {
  a: string
  b: string
  c: string
  d: string
}

type QuestionData = {
  exam_year: number
  sub_topic: string
  question_number: number
  question: string
  options: OptionsMap
  correct_answer: string // "a" | "b" | "c" | "d"
  explanation: string
  difficulty?: string // "EASY" | "MEDIUM" | "HARD"
}

type TestData = {
  title: string
  year: number
  date: string
  duration: number
  totalQuestions: number
  isPublished: boolean
}

type PYQFile = {
  topic: string
  test?: TestData // optional — when present, a Test record is also created
  questions: QuestionData[]
}

// ── Helpers ─────────────────────────────────────────────────────────

/** Convert { a, b, c, d } + correct_answer → Prisma-friendly option array */
function buildOptions(opts: OptionsMap, correctKey: string) {
  return (['a', 'b', 'c', 'd'] as const).map((key) => ({
    text: opts[key],
    isCorrect: key === correctKey,
  }))
}

// ── Main ────────────────────────────────────────────────────────────

async function main() {
  const filePath = process.argv[2]
  if (!filePath) {
    console.error('Usage: npx ts-node prisma/import-pyq.ts <path-to-json>')
    process.exit(1)
  }

  const raw = fs.readFileSync(path.resolve(filePath), 'utf-8')
  const data: PYQFile = JSON.parse(raw)

  console.log(`\nImporting topic: ${data.topic}`)
  console.log(`  Questions: ${data.questions.length}`)
  if (data.test) {
    console.log(`  Test: ${data.test.title}`)
  }
  console.log()

  // 1. Ensure 'General Studies' subject exists
  const gsSubject = await prisma.subject.upsert({
    where: { name: 'General Studies' },
    update: {},
    create: { name: 'General Studies' },
  })

  // 2. Ensure the parent topic exists (e.g. "History")
  let parentTopic = await prisma.topic.findFirst({
    where: { name: data.topic, subjectId: gsSubject.id, parentTopicId: null },
  })
  if (!parentTopic) {
    parentTopic = await prisma.topic.create({
      data: { name: data.topic, subjectId: gsSubject.id },
    })
    console.log(`  Created topic: ${data.topic}`)
  }

  // 3. Collect unique sub-topics and upsert each as a child of the parent topic
  const subTopicNames = [...new Set(data.questions.map((q) => q.sub_topic))]
  const subTopicMap: Record<string, string> = {}

  for (const name of subTopicNames) {
    const existing = await prisma.topic.findFirst({
      where: { name, subjectId: gsSubject.id, parentTopicId: parentTopic.id },
    })
    if (existing) {
      subTopicMap[name] = existing.id
    } else {
      const created = await prisma.topic.create({
        data: { name, subjectId: gsSubject.id, parentTopicId: parentTopic.id },
      })
      subTopicMap[name] = created.id
      console.log(`  Created sub-topic: ${data.topic} → ${name}`)
    }
  }

  // 4. Import each question
  const createdQuestionIds: string[] = []

  for (const q of data.questions) {
    const question = await prisma.question.create({
      data: {
        text: q.question,
        examYear: q.exam_year,
        difficulty: (q.difficulty as Difficulty) || 'MEDIUM', // uses provided difficulty, else MEDIUM
        explanation: q.explanation,
        topicId: subTopicMap[q.sub_topic],
        options: {
          create: buildOptions(q.options, q.correct_answer),
        },
      },
    })
    createdQuestionIds.push(question.id)
  }

  console.log(`  Created ${createdQuestionIds.length} questions`)

  // 5. Optionally create the Test and link questions
  if (data.test) {
    const existingTest = await prisma.test.findFirst({
      where: { title: data.test.title, year: data.test.year },
    })
    if (existingTest) {
      console.warn(
        `  ⚠  Test "${data.test.title}" (${data.test.year}) already exists — linking new questions to it.`,
      )
      await prisma.test.update({
        where: { id: existingTest.id },
        data: {
          questions: {
            connect: createdQuestionIds.map((id) => ({ id })),
          },
        },
      })
    } else {
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
      console.log(`  Created test: "${test.title}" (ID: ${test.id})`)
    }
  }

  console.log(`\n✅  Imported ${createdQuestionIds.length} questions under "${data.topic}"\n`)

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  prisma.$disconnect()
  process.exit(1)
})
