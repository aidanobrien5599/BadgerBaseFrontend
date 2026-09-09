import { Search } from "lucide-react"
import Link from "next/link"

const stats = [
  { num: "5,243", label: "Courses in catalog" },
  { num: "3", label: "Data sources" },
  { num: "25+", label: "Filters & options" },
  { num: "100%", label: "Free" },
]

const features = [
  {
    num: "F.01",
    title: "One search, three data sources",
    text: "“Open QR-A courses above a 3.3 average, taught by someone rated 4 or better, that fit around a Tuesday lab.” That is a single query here. On the university’s own site it is four tabs and a spreadsheet.",
  },
  {
    num: "F.02",
    title: "Grades you can filter by",
    text: "Madgrades history is a filter, not a footnote. Set a floor on cumulative GPA or most recent GPA, require a median grade, or ask for courses where at least a given share of students earned an A.",
  },
  {
    num: "F.03",
    title: "Professors you can filter by",
    text: "Rate My Professor quality, difficulty, would-take-again, and rating count all narrow the results — then show up inline on every section, so you never open a second tab to check.",
  },
  {
    num: "F.04",
    title: "Sections that fit your week",
    text: "Paint the hours you are actually free onto a weekly calendar. Every section that meets outside those windows disappears from the results.",
  },
  {
    num: "F.05",
    title: "Alerts when a seat opens",
    text: "Watch a whole course or one specific section. The moment a seat frees up or a waitlist moves, an email goes out — and every subscription is managed from your dashboard.",
  },
  {
    num: "F.06",
    title: "Access from your AI assistant",
    text: "Point Claude, or any MCP client, at mcp.badgerbase.app/mcp and ask for courses in plain language. Same live catalog, same filters, signed in as you.",
  },
]

const filterBlocks = [
  {
    title: "Course",
    items: [
      "Level (Elementary / Intermediate / Advanced)",
      "Credit range",
      "Gen ed (COM A, COM B, QR-A, QR-B)",
      "Breadth — seven subject areas",
      "No prerequisites, or class standing",
      "Counts for L&S credit",
    ],
  },
  {
    title: "Section & schedule",
    items: [
      "Status (Open / Closed / Waitlist)",
      "Minimum available seats",
      "Instruction mode",
      "Weekly availability windows",
    ],
  },
  {
    title: "Grades & professors",
    items: [
      "Cumulative GPA / most recent GPA",
      "Median grade",
      "Minimum share of A grades",
      "Professor rating & difficulty",
      "Would take again %",
      "Number of ratings",
    ],
  },
]

const steps = [
  {
    num: "STEP 01",
    title: "Search the catalog",
    text: "Narrow 5,243 courses by GPA, grade distribution, breadth, instruction mode, and the hours you are free — all from one sidebar.",
  },
  {
    num: "STEP 02",
    title: "Compare sections & professors",
    text: "Expand any course to see its lectures, discussions, and labs side by side with instructor ratings and difficulty.",
  },
  {
    num: "STEP 03",
    title: "Get notified when seats open",
    text: "Subscribe to a course or section and receive an email the moment a seat opens up or a waitlist moves.",
  },
]

const sources = [
  { name: "UW–Madison Course Catalog", badge: "LIVE", text: "Courses, sections, seats, waitlists, and meeting times sourced from the university's live catalog." },
  { name: "Rate My Professor", badge: "RATINGS", text: "Real student ratings of instructors — quality, difficulty, and would-take-again rates." },
  { name: "Madgrades", badge: "GRADES", text: "Historical grade distributions and median GPA data for every course and section." },
]

export default function AboutPage() {
  return (
    <div className="max-w-[980px] mx-auto px-6 lg:px-8 pb-12">
      {/* Hero */}
      <section className="py-12 lg:py-14 border-b border-border/70">
        <p className="font-mono text-[11px] font-bold tracking-[0.2em] text-primary uppercase mb-4">
          About BadgerBase
        </p>
        <h1 className="font-display text-4xl lg:text-[44px] font-bold leading-[1.04] tracking-[-0.02em] max-w-[640px] text-foreground">
          <span className="text-primary">Stop guessing</span> which classes to take.
        </h1>
        <p className="text-base lg:text-[16.5px] leading-[1.7] text-text-secondary max-w-[660px] mt-5">
          The registrar tells you when a class meets. It does not tell you the GPA students actually earned, what
          they thought of the professor, or whether a seat just opened. BadgerBase puts UW&ndash;Madison&rsquo;s live
          catalog, Madgrades grade history, and Rate My Professor behind one search &mdash; so you can build a
          schedule without opening five tabs.
        </p>
      </section>

      {/* Stats band */}
      <div className="grid grid-cols-2 lg:grid-cols-4 border-b border-border/70">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className={`py-7 px-5 text-center ${i > 0 ? "border-l border-border/70" : ""} ${
              i >= 2 ? "border-t lg:border-t-0 lg:border-l" : ""
            } ${i === 2 && "lg:border-l"} ${i === 0 || i === 2 ? "lg:border-l-0" : ""}`}
          >
            <div className="font-display text-3xl font-bold text-primary tabular-nums">{stat.num}</div>
            <div className="font-mono text-[10.5px] tracking-[0.12em] uppercase text-muted-foreground mt-1.5">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Features */}
      <SectionHead idx="/01" title="What BadgerBase does" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border/70 border border-border/70">
        {features.map((feature) => (
          <div key={feature.num} className="bg-surface p-6">
            <div className="font-mono text-[11px] font-bold text-primary">{feature.num}</div>
            <div className="font-display text-[17px] font-bold text-foreground mt-2 mb-1.5">{feature.title}</div>
            <p className="text-[13.5px] leading-[1.6] text-muted-foreground">{feature.text}</p>
          </div>
        ))}
      </div>

      {/* Filters reference */}
      <SectionHead idx="/02" title="Available Filters" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filterBlocks.map((block) => (
          <div key={block.title} className="border border-border/70 rounded-lg bg-surface p-5">
            <div className="font-display text-[13px] font-bold text-foreground mb-3 flex items-center gap-2">
              <span className="w-[7px] h-[7px] rounded-full bg-primary" />
              {block.title}
            </div>
            <ul className="flex flex-col gap-1.5">
              {block.items.map((item) => (
                <li key={item} className="flex items-baseline gap-2 text-[13px] text-text-secondary">
                  <span className="text-muted-foreground font-mono">—</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* How it works */}
      <SectionHead idx="/03" title="How it works" />
      <div className="relative ml-3.5 pl-6 border-l border-border/70 grid gap-7">
        {steps.map((step) => (
          <div key={step.num} className="relative">
            <span className="absolute -left-[33px] top-[3px] w-[13px] h-[13px] rounded-full bg-surface border-2 border-primary" />
            <div className="font-mono text-[11px] font-bold text-primary tracking-[0.1em]">{step.num}</div>
            <div className="font-display text-base font-bold text-foreground mt-1 mb-1">{step.title}</div>
            <p className="text-[13.5px] text-muted-foreground leading-[1.6]">{step.text}</p>
          </div>
        ))}
      </div>

      {/* Data sources */}
      <SectionHead idx="/04" title="Data sources" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sources.map((source) => (
          <div key={source.name} className="border border-border/70 rounded-lg p-5 bg-surface">
            <div className="font-display font-bold text-[14.5px] text-foreground flex items-center gap-2">
              {source.name}
              <span className="font-mono text-[9px] font-bold tracking-[0.1em] uppercase bg-info/10 text-info border border-info/20 rounded px-1.5 py-0.5">
                {source.badge}
              </span>
            </div>
            <p className="text-[12.5px] text-muted-foreground leading-[1.55] mt-1.5">{source.text}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="bg-primary-hover rounded-xl px-8 lg:px-11 py-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mt-12 text-white shadow-[0_24px_50px_-24px_rgba(142,3,8,0.55)]">
        <div>
          <div className="font-display text-2xl font-bold tracking-[-0.01em]">Ready to find your perfect courses?</div>
          <div className="text-[13.5px] text-white/80 mt-1.5">Search the catalog now — it only takes a minute.</div>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-white text-primary-hover px-7 py-3 rounded-lg font-bold text-[13px] hover:bg-primary-subtle transition-colors"
        >
          <Search className="h-4 w-4" />
          Start Searching
        </Link>
      </div>
    </div>
  )
}

function SectionHead({ idx, title }: { idx: string; title: string }) {
  return (
    <div className="flex items-center gap-3 mt-10 mb-5">
      <span className="font-mono text-[11px] font-bold text-primary">{idx}</span>
      <h2 className="font-display text-[22px] font-bold tracking-[-0.01em] text-foreground">{title}</h2>
      <div className="flex-1 h-px bg-border/70" />
    </div>
  )
}