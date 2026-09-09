import { CheckCircle2, ShieldCheck } from "lucide-react"

const canDo = [
  "Search the full UW–Madison course catalog on your behalf",
  "Filter by subject, level, GPA, status, credits, gen ed, and breadth — the same filters the site uses",
  "Return results using live catalog data",
]

const filters = [
  { name: "search_param", meaning: "Free text over course designation, title, and instructor name." },
  { name: "subject_code", meaning: "Exact subject match, e.g. COMP SCI." },
  { name: "level", meaning: "Elementary, Intermediate, or Advanced. Comma-separate to match any." },
  { name: "min_gpa", meaning: "Minimum cumulative GPA earned by past students, on a 0–4 scale." },
  { name: "status", meaning: "OPEN, WAITLISTED, or CLOSED. Comma-separate to match any." },
  { name: "min_credits / max_credits", meaning: "Credit range for the course." },
  { name: "general_education", meaning: "An exact gen-ed code, e.g. QR-A — not a yes/no flag." },
  { name: "ethnic_studies / humanities / social_science / natural_science", meaning: "Breadth requirement flags." },
  { name: "limit", meaning: "Results per page. Defaults to 10, capped at 25." },
  { name: "page", meaning: "1-based page number, for paging through results." },
]

const claudeSteps = [
  { num: "STEP 01", title: "Open Settings → Connectors", text: "In Claude, go to Settings and find the Connectors section, then choose Add custom connector." },
  { num: "STEP 02", title: "Paste the server URL", text: "Enter https://mcp.badgerbase.app/mcp as the connector URL and save it." },
  { num: "STEP 03", title: "Sign in to BadgerBase", text: "Claude opens BadgerBase sign-in. Use your existing account, or create one if you don't have one yet." },
  { num: "STEP 04", title: "Review and approve", text: "You'll land on a consent screen naming the client and exactly what it can do. Approve to finish connecting, or decline to stop here." },
]

const examplePrompts = [
  "Find open COMP SCI courses with a class GPA above 3.3",
  "Which QR-A courses still have seats?",
  "Compare intermediate STAT courses by GPA",
]

export default function McpPage() {
  return (
    <div className="max-w-[980px] mx-auto px-6 lg:px-8 pb-12">
      {/* Hero */}
      <section className="py-12 lg:py-14 border-b border-border/70">
        <p className="font-mono text-[11px] font-bold tracking-[0.2em] text-primary uppercase mb-4">
          AI Access
        </p>
        <h1 className="font-display text-4xl lg:text-[44px] font-bold leading-[1.04] tracking-[-0.02em] max-w-[640px] text-foreground">
          Let an AI assistant <span className="text-primary">search courses for you.</span>
        </h1>
        <p className="text-base lg:text-[16.5px] leading-[1.7] text-text-secondary max-w-[660px] mt-5">
          BadgerBase runs an MCP (Model Context Protocol) server that lets an AI assistant search the
          UW&ndash;Madison course catalog on your behalf, using the same data and filters the site itself uses.
          It requires your BadgerBase account, and you approve access before anything connects.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 font-mono text-[12.5px] text-foreground bg-surface border border-border/70 rounded-lg px-4 py-2.5">
          <span className="text-muted-foreground">Server URL</span>
          <code className="text-primary select-all">https://mcp.badgerbase.app/mcp</code>
        </div>
      </section>

      {/* What it can do */}
      <SectionHead idx="/01" title="What it can do" />
      <p className="text-[13.5px] leading-[1.65] text-muted-foreground max-w-[660px] -mt-2 mb-5">
        The server exposes one thing: course search. Read-only access to the public catalog.
      </p>
      <div className="border border-border/70 rounded-lg bg-surface p-5 max-w-[660px]">
        <div className="font-display text-[14.5px] font-bold text-foreground mb-3 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-success-strong" />
          It can
        </div>
        <ul className="flex flex-col gap-2.5">
          {canDo.map((item) => (
            <li key={item} className="flex items-start gap-2 text-[13px] text-text-secondary">
              <CheckCircle2 className="h-3.5 w-3.5 text-success-strong mt-0.5 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* The tool */}
      <SectionHead idx="/02" title="The search_courses tool" />
      <p className="text-[13.5px] leading-[1.65] text-muted-foreground max-w-[660px] -mt-2 mb-5">
        The server exposes exactly one tool, <code className="font-mono text-foreground bg-surface border border-border/70 rounded px-1.5 py-0.5">search_courses</code>.
        These are its filters:
      </p>
      <div className="border border-border/70 rounded-lg overflow-hidden overflow-x-auto bg-surface">
        <table className="w-full text-left border-collapse min-w-[560px]">
          <caption className="sr-only">search_courses tool filters and their meaning</caption>
          <thead>
            <tr className="border-b border-border/70">
              <th scope="col" className="font-mono text-[10.5px] tracking-[0.1em] uppercase text-muted-foreground font-bold px-5 py-3 w-[220px]">
                Filter
              </th>
              <th scope="col" className="font-mono text-[10.5px] tracking-[0.1em] uppercase text-muted-foreground font-bold px-5 py-3">
                Meaning
              </th>
            </tr>
          </thead>
          <tbody>
            {filters.map((filter, i) => (
              <tr key={filter.name} className={i > 0 ? "border-t border-border/70" : ""}>
                <td className="align-top px-5 py-3 font-mono text-[12.5px] text-primary whitespace-nowrap">
                  {filter.name}
                </td>
                <td className="align-top px-5 py-3 text-[13px] text-text-secondary leading-[1.6]">
                  {filter.meaning}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Connecting */}
      <SectionHead idx="/03" title="Connect it in Claude" />
      <div className="relative ml-3.5 pl-6 border-l border-border/70 grid gap-7">
        {claudeSteps.map((step) => (
          <div key={step.num} className="relative">
            <span className="absolute -left-[33px] top-[3px] w-[13px] h-[13px] rounded-full bg-surface border-2 border-primary" />
            <div className="font-mono text-[11px] font-bold text-primary tracking-[0.1em]">{step.num}</div>
            <div className="font-display text-base font-bold text-foreground mt-1 mb-1">{step.title}</div>
            <p className="text-[13.5px] text-muted-foreground leading-[1.6]">{step.text}</p>
          </div>
        ))}
      </div>
      <p className="text-[13px] leading-[1.65] text-muted-foreground max-w-[660px] mt-6">
        This works with any MCP client that supports Streamable HTTP with OAuth, not just Claude. The
        exact menu names differ by client, but the shape is the same: add a custom connector, give it the
        server URL above, sign in, and approve.
      </p>

      {/* Consent */}
      <SectionHead idx="/04" title="What you're approving" />
      <p className="text-[13.5px] leading-[1.65] text-muted-foreground max-w-[660px] -mt-2">
        After you sign in, BadgerBase shows a consent screen naming the client that's requesting access
        and exactly what it can do. Nothing connects until you
        approve it, and you can decline. Declining sends you back to the app that asked, with no access
        granted.
      </p>

      {/* Examples */}
      <SectionHead idx="/05" title="Things to try asking" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {examplePrompts.map((prompt) => (
          <div key={prompt} className="border border-border/70 rounded-lg bg-surface p-5">
            <p className="text-[13.5px] text-foreground leading-[1.6] italic">&ldquo;{prompt}&rdquo;</p>
          </div>
        ))}
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
