"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/layout/Navbar"
import { ChevronDown, ChevronUp, BookOpen, Target, Award, TrendingUp, Clock, Search } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import api from "@/lib/axios"

interface SubTopicApi {
  id: string
  title: string
  order: number
  isActive: boolean
}

interface SyllabusTopicApi {
  id: string
  title: string
  description?: string
  weightage?: string
  priority: string
  order: number
  isActive: boolean
  subTopics: SubTopicApi[]
}

interface SyllabusSectionApi {
  id: string
  title: string
  description?: string
  paper: string
  icon?: string
  color?: string
  bgColor?: string
  order: number
  isActive: boolean
  topics: SyllabusTopicApi[]
}

interface SyllabusTopic {
  id: string
  title: string
  description: string
  subtopics: string[]
  weightage: string
  difficulty: "High" | "Medium" | "Low"
}

interface SyllabusSection {
  id: string
  title: string
  icon: React.ReactNode
  color: string
  bgColor: string
  topics: SyllabusTopic[]
}

const upscStages = [
  {
    stage: "Stage 1",
    title: "Preliminary Examination",
    description: "Objective Type (MCQ) - Screening Test",
    papers: [
      { name: "GS Paper I", marks: 200, duration: "2 hrs", type: "Merit Ranking" },
      { name: "GS Paper II (CSAT)", marks: 200, duration: "2 hrs", type: "Qualifying (33%)" }
    ],
    keyPoints: [
      "Negative marking: 1/3rd (0.66 marks deducted)",
      "GS Paper I marks determine Prelims merit",
      "CSAT is qualifying - need 33% (66/200)",
      "~12-13 lakh aspirants appear annually",
      "Cutoff typically 90-110 for General category"
    ]
  },
  {
    stage: "Stage 2",
    title: "Main Examination",
    description: "Descriptive Type - 9 Papers (7 Merit + 2 Qualifying)",
    papers: [
      { name: "Essay", marks: 250, duration: "3 hrs", type: "Merit" },
      { name: "GS I (Heritage, Geography, Society)", marks: 250, duration: "3 hrs", type: "Merit" },
      { name: "GS II (Governance, Polity, IR)", marks: 250, duration: "3 hrs", type: "Merit" },
      { name: "GS III (Economy, Environment, S&T)", marks: 250, duration: "3 hrs", type: "Merit" },
      { name: "GS IV (Ethics, Integrity, Aptitude)", marks: 250, duration: "3 hrs", type: "Merit" },
      { name: "Optional Paper I", marks: 250, duration: "3 hrs", type: "Merit" },
      { name: "Optional Paper II", marks: 250, duration: "3 hrs", type: "Merit" },
      { name: "English (Qualifying)", marks: 300, duration: "3 hrs", type: "Qualifying" },
      { name: "Indian Language (Qualifying)", marks: 300, duration: "3 hrs", type: "Qualifying" }
    ],
    keyPoints: [
      "Total Merit Marks: 1750",
      "Qualifying papers: 25% each (75/300)",
      "Optional subject choice: 48 subjects",
      "Answer writing skill crucial",
      "~10-15k candidates qualify for Interview"
    ]
  },
  {
    stage: "Stage 3",
    title: "Personality Test (Interview)",
    description: "Face-to-face assessment - 275 Marks",
    papers: [
      { name: "Interview", marks: 275, duration: "30-45 min", type: "Merit" }
    ],
    keyPoints: [
      "Final Merit: 1750 (Mains) + 275 (Interview) = 2025",
      "Tests: Mental alertness, critical thinking, leadership",
      "Detailed Application Form (DAF) based questions",
      "Current affairs, hobbies, service preference",
      "No minimum qualifying marks"
    ]
  }
]

const iconMap: Record<string, React.ReactNode> = {
  BookOpen: <BookOpen className="w-6 h-6" />,
  Target: <Target className="w-6 h-6" />,
  Award: <Award className="w-6 h-6" />,
  TrendingUp: <TrendingUp className="w-6 h-6" />,
}

const priorityToDifficulty = (priority: string): "High" | "Medium" | "Low" => {
  switch (priority?.toUpperCase()) {
    case "HIGH": return "High"
    case "LOW": return "Low"
    default: return "Medium"
  }
}

const transformSection = (apiSection: SyllabusSectionApi): SyllabusSection => ({
  id: apiSection.id,
  title: apiSection.title,
  icon: apiSection.icon && iconMap[apiSection.icon] || <BookOpen className="w-6 h-6" />,
  color: apiSection.color || "text-blue-600",
  bgColor: apiSection.bgColor || "bg-blue-50 border-blue-100",
  topics: apiSection.topics
    .filter(t => t.isActive)
    .sort((a, b) => a.order - b.order)
    .map(topic => ({
      id: topic.id,
      title: topic.title,
      description: topic.description || "",
      subtopics: topic.subTopics
        .filter(s => s.isActive)
        .sort((a, b) => a.order - b.order)
        .map(s => s.title),
      weightage: topic.weightage || "",
      difficulty: priorityToDifficulty(topic.priority)
    }))
})

function TopicCard({ topic, index }: { topic: SyllabusTopic; index: number }) {
  const [expanded, setExpanded] = useState(false)
  const difficultyColors = {
    High: "bg-red-50 text-red-700 border-red-200",
    Medium: "bg-amber-50 text-amber-700 border-amber-200",
    Low: "bg-green-50 text-green-700 border-green-200"
  }

  return (
    <div className="group border border-black/10 rounded-2xl overflow-hidden bg-white hover:border-black/30 transition-all duration-300 hover:shadow-lg">
      <div className="p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-black text-black mb-2">{topic.title}</h3>
            <p className="text-sm text-black/50 leading-relaxed">{topic.description}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${difficultyColors[topic.difficulty]}`}>
              {topic.difficulty} Priority
            </span>
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-8 h-8 rounded-lg border border-black/10 flex items-center justify-center hover:bg-black/5 transition-colors"
              aria-label={expanded ? "Collapse" : "Expand"}
            >
              {expanded ? <ChevronUp className="w-4 h-4 text-black" /> : <ChevronDown className="w-4 h-4 text-black" />}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-bold text-black/40 uppercase tracking-wider mb-4 pb-4 border-b border-black/10">
          <span className="flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5" />
            {topic.weightage}
          </span>
        </div>

        <div className={`overflow-hidden transition-all duration-300 ${expanded ? "max-h-64 opacity-100" : "max-h-0 opacity-0"}`}>
          <ul className="space-y-2 mt-4">
            {topic.subtopics.map((sub, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-black/60 leading-relaxed pl-1">
                <span className="w-1.5 h-1.5 rounded-full bg-black/30 flex-shrink-0 mt-1.5" />
                {sub}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

function SyllabusSection({ section }: { section: SyllabusSection }) {
  return (
    <section className="space-y-6">
      <header className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${section.bgColor} ${section.color}`}>
          {section.icon}
        </div>
        <div>
          <h2 className="text-2xl font-black text-black tracking-tight">{section.title}</h2>
          <p className="text-sm text-black/50 font-medium">{section.topics.length} Major Topics</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {section.topics.map((topic, i) => (
          <TopicCard key={topic.id} topic={topic} index={i} />
        ))}
      </div>
    </section>
  )
}

function StageCard({ stage, index }: { stage: typeof upscStages[0]; index: number }) {
  const stageColors = [
    "bg-blue-50 border-blue-100 text-blue-700",
    "bg-purple-50 border-purple-100 text-purple-700",
    "bg-orange-50 border-orange-100 text-orange-700"
  ]
  const color = stageColors[index]

  return (
    <div className={`border-2 rounded-3xl p-8 flex flex-col ${color} border-opacity-50`}>
      <div className="flex items-center gap-3 mb-6">
        <span className="w-10 h-10 rounded-xl bg-current/20 flex items-center justify-center font-black text-xl">
          {index + 1}
        </span>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest">UPSC CSE</p>
          <h3 className="text-xl font-black tracking-tight">{stage.title}</h3>
        </div>
      </div>

      <p className="text-sm font-medium mb-6 leading-relaxed">{stage.description}</p>

      <div className="mb-6">
        <h4 className="text-sm font-black uppercase tracking-wider mb-3">Papers</h4>
        <div className="space-y-2">
          {stage.papers.map((paper) => (
            <div key={paper.name} className="flex items-center justify-between py-2 px-3 bg-white/50 rounded-xl text-sm">
              <span className="font-medium">{paper.name}</span>
              <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider">
                <span>{paper.marks} Marks</span>
                <span>|</span>
                <span>{paper.duration}</span>
                <span className={`px-2 py-0.5 rounded ${paper.type === "Merit" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                  {paper.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-current/30 pt-6 mt-auto">
        <h4 className="text-sm font-black uppercase tracking-wider mb-3">Key Points</h4>
        <ul className="space-y-2 text-sm leading-relaxed">
          {stage.keyPoints.map((point, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-current mt-2 flex-shrink-0" />
              {point}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default function CurriculumPage() {
  const [activeTab, setActiveTab] = useState<"prelims" | "mains" | "stages">("prelims")
  const [searchQuery, setSearchQuery] = useState("")
  const [sections, setSections] = useState<SyllabusSectionApi[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.get('/curriculum')
      .then(res => {
        setSections(res.data)
        setLoading(false)
      })
      .catch(err => {
        setError('Failed to load curriculum')
        setLoading(false)
      })
  }, [])

  const gsPaper1 = sections.find(s => s.paper === 'GS_PAPER_I')
  const gsPaper2 = sections.find(s => s.paper === 'GS_PAPER_II_CSAT')

  const transformedGs1 = gsPaper1 ? transformSection(gsPaper1) : null
  const transformedGs2 = gsPaper2 ? transformSection(gsPaper2) : null

  const allTopics = [...(transformedGs1?.topics || []), ...(transformedGs2?.topics || [])]
  const filteredTopics = allTopics.filter(topic =>
    topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    topic.subtopics.some(sub => sub.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center gap-4">
            <div className="w-12 h-12 bg-black/10 rounded-full" />
            <div className="h-6 w-64 bg-black/10 rounded" />
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center px-6">
            <Search className="w-12 h-12 text-black/20 mx-auto mb-4" />
            <h3 className="text-xl font-black text-black mb-2">Failed to load curriculum</h3>
            <p className="text-black/50 font-medium">{error}</p>
            <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 bg-black text-white rounded-xl font-black hover:bg-black/85">
              Retry
            </button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-black text-white py-16 px-6">
          <div className="w-full max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[#f5c842] rounded-xl flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-black" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f5c842]">UPSC CSE SYLLABUS</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05] mb-6">
              Complete UPSC <span className="underline decoration-[#f5c842] decoration-4 underline-offset-8">Curriculum</span> Breakdown
            </h1>
            <p className="text-white/60 font-medium text-lg max-w-2xl leading-relaxed">
              Master every topic in the UPSC Civil Services Examination syllabus. 
              Structured by paper, weighted by importance, designed for strategic preparation.
            </p>
          </div>
        </section>

        {/* Search & Tab Navigation */}
        <section className="px-6 py-8 bg-white border-b border-black/10">
          <div className="w-full max-w-7xl mx-auto space-y-6">
            <div className="relative max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black/30" />
              <input
                type="text"
                placeholder="Search topics, subtopics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-12 pr-4 bg-white border border-black/20 rounded-xl focus:border-black focus:outline-none transition-colors text-sm font-medium text-black placeholder:text-black/30"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2" role="tablist">
              {[
                { id: "prelims", label: "Prelims GS I", count: transformedGs1?.topics.length || 0 },
                { id: "mains", label: "CSAT (GS II)", count: transformedGs2?.topics.length || 0 },
                { id: "stages", label: "Exam Stages", count: upscStages.length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`whitespace-nowrap px-5 py-2.5 rounded-xl text-sm font-black uppercase tracking-wider transition-all duration-200 flex items-center gap-2 ${
                    activeTab === tab.id
                      ? "bg-black text-white shadow-lg"
                      : "bg-white border border-black/10 text-black/60 hover:border-black hover:bg-black/5"
                  }`}
                >
                  {tab.label}
                  <span className="w-5 h-5 rounded-full bg-current/20 flex items-center justify-center text-[10px] font-black">
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="px-6 py-12 flex-1">
          <div className="w-full max-w-7xl mx-auto">
            {activeTab === "prelims" && transformedGs1 && (
              <SyllabusSection section={transformedGs1} />
            )}

            {activeTab === "mains" && transformedGs2 && (
              <SyllabusSection section={transformedGs2} />
            )}

            {activeTab === "stages" && (
              <div className="space-y-8">
                <header className="mb-4">
                  <h2 className="text-2xl font-black text-black tracking-tight">Three Stages of UPSC CSE</h2>
                  <p className="text-black/50 font-medium mt-1">Understand the complete examination structure</p>
                </header>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {upscStages.map((stage, i) => (
                    <StageCard key={stage.stage} stage={stage} index={i} />
                  ))}
                </div>

                {/* Strategy Tips */}
                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    {
                      title: "Prelims Strategy",
                      icon: <Target className="w-6 h-6" />,
                      color: "text-blue-600",
                      bgColor: "bg-blue-50 border-blue-100",
                      tips: [
                        "Focus on high-weightage topics first",
                        "Revise NCERTs (Class 6-12) thoroughly",
                        "Practice 50+ mock tests before exam",
                        "Master elimination technique for MCQs",
                        "Current affairs: last 18 months critical"
                      ]
                    },
                    {
                      title: "Mains Strategy",
                      icon: <Award className="w-6 h-6" />,
                      color: "text-purple-600",
                      bgColor: "bg-purple-50 border-purple-100",
                      tips: [
                        "Answer writing practice: 1 answer/day",
                        "Structure: Intro-Body-Conclusion",
                        "Quote data, reports, committees",
                        "Diagrams, flowcharts fetch marks",
                        "Optional subject: 500+ marks potential"
                      ]
                    },
                    {
                      title: "Interview Strategy",
                      icon: <TrendingUp className="w-6 h-6" />,
                      color: "text-orange-600",
                      bgColor: "bg-orange-50 border-orange-100",
                      tips: [
                        "Know your DAF inside out",
                        "Mock interviews: 5-7 sessions",
                        "Balanced opinions, not extreme views",
                        "Accept ignorance gracefully",
                        "Confidence + Humility = Success"
                      ]
                    }
                  ].map((strategy, i) => (
                    <div key={i} className={`border-2 rounded-2xl p-6 ${strategy.bgColor}`}>
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-10 h-10 rounded-xl bg-white/50 flex items-center justify-center ${strategy.color}`}>
                          {strategy.icon}
                        </div>
                        <h3 className="text-lg font-black">{strategy.title}</h3>
                      </div>
                      <ul className="space-y-2">
                        {strategy.tips.map((tip, j) => (
                          <li key={j} className="flex items-start gap-2 text-sm text-black/70 leading-relaxed">
                            <span className="w-1.5 h-1.5 rounded-full bg-current mt-1.5 flex-shrink-0" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No results state */}
            {filteredTopics.length === 0 && searchQuery && (
              <div className="text-center py-20 bg-white border-2 border-dashed border-black/20 rounded-3xl">
                <Search className="w-12 h-12 text-black/20 mx-auto mb-4" />
                <h3 className="text-xl font-black text-black mb-2">No topics found</h3>
                <p className="text-black/50 font-medium">Try adjusting your search terms</p>
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 py-16 bg-[#F9F9F9]">
          <div className="w-full max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-black tracking-tight text-black mb-6">
              Ready to Master the Syllabus?
            </h2>
            <p className="text-black/50 font-medium text-lg mb-8 leading-relaxed">
              Start with targeted mock tests aligned to each topic. Track your progress, identify weak areas, and build exam readiness.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/tests?tab=mock">
                <Button className="h-12 px-8 bg-black text-white font-black text-sm rounded-xl hover:bg-black/85 active:scale-95 transition-all w-full sm:w-auto">
                  Start Mock Tests
                </Button>
              </Link>
              <Link href="/tests?tab=pyq">
                <Button variant="outline" className="h-12 px-8 border-2 border-black font-black text-sm rounded-xl hover:bg-black hover:text-white active:scale-95 transition-all w-full sm:w-auto">
                  Practice PYQs
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}