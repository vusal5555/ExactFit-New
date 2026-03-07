"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  CheckCircle,
  ArrowRight,
  Search,
  Zap,
  ChevronRight,
  X,
  Check,
  Clock,
  Users,
  ExternalLink,
} from "lucide-react";

const signals = [
  {
    platform: "Reddit",
    platformColor: "bg-orange-100 text-orange-700",
    time: "12 min ago",
    score: 9,
    user: "u/saas_founder_",
    context: "r/SaaS · 47 upvotes",
    post: "We're a 6-person team and ZoomInfo is killing our budget. Looking for a lighter alternative that covers intent signals. Any recommendations?",
    tags: ["intent-to-buy", "competitor-frustration"],
  },
  {
    platform: "HackerNews",
    platformColor: "bg-amber-100 text-amber-800",
    time: "34 min ago",
    score: 8,
    user: "tmoreira",
    context: "Ask HN · 23 points",
    post: "Our outbound motion is broken. Cold emails get 1% reply rates. Does anyone have a better system for catching warm leads before they reach out to 10 vendors?",
    tags: ["outbound-pain", "warm-leads"],
  },
  {
    platform: "Twitter / X",
    platformColor: "bg-slate-100 text-slate-700",
    time: "1 hr ago",
    score: 7,
    user: "@head_of_sales_b2b",
    context: "Public · 112 impressions",
    post: "Genuinely frustrated with our CRM's lead scoring. Flags everything as 'hot' so nothing is actually prioritized. We miss real buying signals daily.",
    tags: ["crm-pain", "lead-scoring"],
  },
  {
    platform: "LinkedIn",
    platformColor: "bg-blue-100 text-blue-700",
    time: "2 hr ago",
    score: 6,
    user: "Alex R. · VP Sales @ Stackline",
    context: "Post · 340 impressions",
    post: "Just wrapped a painful quarter. Pipeline dried up mid-cycle — classic sign of not catching intent early enough. Time to rethink our stack.",
    tags: ["pipeline-pain", "stack-evaluation"],
  },
];

const steps = [
  {
    n: "01",
    icon: Search,
    title: "Add a keyword monitor",
    body: 'Type in competitor names, pain phrases, or job titles — e.g. "looking for ZoomInfo alternative" or "frustrated with Salesforce". Set it once.',
  },
  {
    n: "02",
    icon: Zap,
    title: "We scan 4 platforms 24/7",
    body: "ExactFit crawls Reddit, HackerNews, Twitter/X, and LinkedIn every few minutes, scoring every match for purchase intent on a 1–10 scale.",
  },
  {
    n: "03",
    icon: Bell,
    title: "Get alerted. Reach out first.",
    body: "A Slack or email ping arrives within 15 minutes. Click to see the full post, AI summary, and enriched contact — ready to send.",
  },
];

const table = [
  {
    feature: "Platforms covered",
    ef: "Reddit, HN, Twitter, LinkedIn",
    goji: "LinkedIn only",
    manual: "Manual browsing",
  },
  {
    feature: "Pricing model",
    ef: "$129 flat/mo",
    goji: "Per-seat",
    manual: "Your time",
  },
  { feature: "AI intent scoring (1–10)", ef: true, goji: false, manual: false },
  { feature: "Contact enrichment", ef: true, goji: true, manual: false },
  {
    feature: "LinkedIn automation risk",
    ef: "None",
    goji: "High ban risk",
    manual: "None",
  },
  { feature: "Alert speed", ef: "< 15 min", goji: "Hours", manual: "Never" },
  { feature: "Slack / email alerts", ef: true, goji: false, manual: false },
];

const planFeatures = [
  "Up to 20 active keyword monitors",
  "Reddit, HackerNews, Twitter/X, LinkedIn",
  "AI intent scoring on every signal",
  "One-click contact enrichment (email + LinkedIn)",
  "Slack & email alerts within 15 minutes",
  "Unlimited team seats",
  "CSV export",
  "7-day free trial — no credit card required",
];

function scoreStyle(s: number) {
  if (s >= 9)
    return {
      badge: "bg-emerald-500 text-white",
      pill: "bg-emerald-50 border-emerald-200",
      text: "text-emerald-600",
      border: "border-emerald-200",
    };
  if (s >= 7)
    return {
      badge: "bg-green-400 text-white",
      pill: "bg-green-50 border-green-200",
      text: "text-green-600",
      border: "border-green-200",
    };
  if (s >= 5)
    return {
      badge: "bg-yellow-400 text-slate-900",
      pill: "bg-yellow-50 border-yellow-200",
      text: "text-yellow-600",
      border: "border-yellow-200",
    };
  return {
    badge: "bg-red-400 text-white",
    pill: "bg-red-50 border-red-200",
    text: "text-red-600",
    border: "border-red-200",
  };
}

function Cell({ v }: { v: string | boolean }) {
  if (typeof v === "boolean") {
    return v ? (
      <Check className="w-5 h-5 text-emerald-500 mx-auto" />
    ) : (
      <X className="w-4 h-4 text-slate-300 mx-auto" />
    );
  }
  return <span className="text-sm text-slate-500">{v}</span>;
}

export default function LandingPage() {
  const [shown, setShown] = useState([false, false, false, false]);

  useEffect(() => {
    signals.forEach((_, i) =>
      setTimeout(
        () =>
          setShown((p) => {
            const n = [...p];
            n[i] = true;
            return n;
          }),
        120 * i,
      ),
    );
  }, []);

  return (
    <div
      className="min-h-screen bg-white text-slate-900"
      style={{ fontFamily: "var(--font-geist-sans), system-ui, sans-serif" }}
    >
      {/* ── Nav ─────────────────────────────────────────────── */}
      <nav className="fixed inset-x-0 top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900 text-lg tracking-tight">
              ExactFit
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-slate-500">
            <a href="#how" className="hover:text-slate-900 transition-colors">
              How it works
            </a>
            <a
              href="#signals"
              className="hover:text-slate-900 transition-colors"
            >
              Live signals
            </a>
            <a
              href="#pricing"
              className="hover:text-slate-900 transition-colors"
            >
              Pricing
            </a>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/login"
              className="hidden md:block text-sm text-slate-500 hover:text-slate-900 transition-colors"
            >
              Sign in
            </a>
            <a
              href="/signup"
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-lg font-semibold transition-colors shadow-sm"
            >
              Start Free Trial
            </a>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-28 overflow-hidden">
        {/* dot pattern */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, #cbd5e1 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            opacity: 0.45,
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/50 via-transparent to-white"
        />

        <div className="relative max-w-6xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-7 border border-indigo-100">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
              Live monitoring across Reddit · HN · Twitter · LinkedIn
            </div>

            <h1 className="text-5xl md:text-[3.75rem] font-bold leading-[1.08] tracking-tight mb-6">
              Catch warm B2B leads{" "}
              <span className="text-indigo-600">the instant</span>
              <br className="hidden md:block" /> they post
            </h1>

            <p className="text-xl text-slate-500 leading-relaxed mb-10 max-w-2xl mx-auto">
              ExactFit fires a Slack or email alert within 15 minutes whenever
              someone posts a buying signal — then surfaces their enriched
              contact in one click.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="/signup"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-7 py-3.5 rounded-xl font-semibold text-base transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-px"
              >
                Start Free Trial <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#signals"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-slate-700 px-7 py-3.5 rounded-xl font-medium text-base border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all"
              >
                See live signals <ChevronRight className="w-4 h-4" />
              </a>
            </div>
            <p className="mt-4 text-sm text-slate-400">
              7-day free trial · No credit card · Cancel anytime
            </p>
          </div>

          {/* Mock signal card */}
          <div className="max-w-md mx-auto">
            <div className="relative rounded-2xl border border-slate-200 shadow-2xl shadow-slate-200/70 overflow-hidden">
              <span className="absolute -top-3 -right-3 z-10 flex items-center gap-1.5 bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md shadow-emerald-200">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />{" "}
                LIVE
              </span>

              {/* Mini top bar */}
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 bg-white">
                <div>
                  <span className="text-sm font-bold text-slate-900">
                    Leads
                  </span>
                  <span className="ml-2 text-xs text-slate-400">
                    3 new signals
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs bg-slate-100 text-slate-500 px-2.5 py-0.5 rounded-full">
                    All platforms
                  </span>
                  <span className="text-xs bg-indigo-50 text-indigo-600 border border-indigo-100 px-2.5 py-0.5 rounded-full font-medium">
                    Score ≥ 7
                  </span>
                </div>
              </div>

              {/* Mini table */}
              <table className="w-full text-xs">
                <thead className="border-b bg-slate-50/70">
                  <tr>
                    {["Title", "Platform", "Score", "Stage", "Actions"].map(
                      (h) => (
                        <th
                          key={h}
                          className={`px-3 py-2 font-medium uppercase tracking-wide text-slate-400 ${h === "Actions" ? "text-right" : "text-left"}`}
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    {
                      title:
                        "Looking for a ZoomInfo alternative — 6-person team",
                      platform: {
                        label: "Reddit",
                        cls: "bg-red-100 text-red-600",
                      },
                      score: 9,
                      scoreCls: "bg-green-100 text-green-700",
                      stage: {
                        label: "Decision",
                        cls: "bg-orange-100 text-orange-700",
                      },
                    },
                    {
                      title: "Ask HN: Tools for tracking competitor mentions?",
                      platform: {
                        label: "HN",
                        cls: "bg-orange-100 text-orange-700",
                      },
                      score: 9,
                      scoreCls: "bg-green-100 text-green-700",
                      stage: {
                        label: "Purchase",
                        cls: "bg-green-100 text-green-700",
                      },
                    },
                    {
                      title:
                        "Our outbound is broken — cold emails 1% reply rates",
                      platform: {
                        label: "HN",
                        cls: "bg-orange-100 text-orange-700",
                      },
                      score: 8,
                      scoreCls: "bg-green-100 text-green-700",
                      stage: {
                        label: "Consideration",
                        cls: "bg-purple-100 text-purple-700",
                      },
                    },
                  ].map((row, i) => (
                    <tr
                      key={i}
                      className="hover:bg-slate-50/60 transition-colors cursor-pointer"
                    >
                      <td className="px-3 py-2.5 max-w-[180px]">
                        <p className="line-clamp-1 font-medium text-slate-800">
                          {row.title}
                        </p>
                      </td>
                      <td className="px-3 py-2.5">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${row.platform.cls}`}
                        >
                          {row.platform.label}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${row.scoreCls}`}
                        >
                          {row.score}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] capitalize ${row.stage.cls}`}
                        >
                          {row.stage.label}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button className="p-1 rounded border border-slate-200 text-slate-300 hover:text-slate-600 transition-colors">
                            <ExternalLink className="w-3 h-3" />
                          </button>
                          <button className="p-1 rounded border border-slate-200 text-slate-300 hover:text-green-600 transition-colors">
                            <Check className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Mini footer */}
              <div className="border-t border-slate-100 px-4 py-2.5 flex items-center justify-between bg-slate-50/50">
                <p className="text-[10px] text-slate-400">Updated 2 min ago</p>
                <span className="text-[10px] text-indigo-600 font-semibold">
                  Load More →
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Social proof bar ────────────────────────────────── */}
      <div className="border-y border-slate-100 bg-slate-50/70 py-7">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-[10px] text-slate-400 uppercase tracking-[0.15em] font-semibold mb-5">
            Trusted by sales teams at fast-growing B2B startups
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-10 gap-y-3">
            {["Lattice", "ChartMogul", "Parabol", "Warmly", "Toplyne"].map(
              (n) => (
                <span
                  key={n}
                  className="text-slate-300 font-bold text-base tracking-tight select-none"
                >
                  {n}
                </span>
              ),
            )}
          </div>
        </div>
      </div>

      {/* ── How It Works ────────────────────────────────────── */}
      <section id="how" className="py-28 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs text-indigo-600 font-semibold uppercase tracking-widest mb-3">
              How it works
            </p>
            <h2 className="text-4xl font-bold tracking-tight">
              From keyword to closed deal in three steps
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {steps.map(({ n, icon: Icon, title, body }, i) => (
              <div
                key={i}
                className="group bg-white rounded-2xl border border-slate-200 p-8 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-11 h-11 bg-indigo-50 group-hover:bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors">
                    <Icon className="w-5 h-5 text-indigo-600" />
                  </div>
                  <span className="text-4xl font-extrabold text-slate-100 leading-none">
                    {n}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  {title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Signal Feed Preview ─────────────────────────────── */}
      <section id="signals" className="py-28 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs text-indigo-600 font-semibold uppercase tracking-widest mb-3">
              Live signal feed
            </p>
            <h2 className="text-4xl font-bold tracking-tight mb-4">
              Real intent. Real people. Right now.
            </h2>
            <p className="text-lg text-slate-500 max-w-xl mx-auto">
              This is exactly what lands in your dashboard — enriched, scored,
              and ready to act on.
            </p>
          </div>

          {/* Mock app shell */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            {/* Mock top bar */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-white">
              <div>
                <h3 className="text-base font-bold text-slate-900">Leads</h3>
                <p className="text-xs text-slate-400 mt-0.5">5 leads found</p>
              </div>
              <div className="flex items-center gap-2">
                {/* Mock filter pills */}
                <span className="text-xs bg-slate-100 text-slate-500 px-3 py-1 rounded-full">
                  All platforms
                </span>
                <span className="text-xs bg-slate-100 text-slate-500 px-3 py-1 rounded-full">
                  Score ≥ 1
                </span>
                <span className="text-xs bg-indigo-50 text-indigo-600 border border-indigo-100 px-3 py-1 rounded-full font-medium">
                  Live
                </span>
              </div>
            </div>

            {/* Mock table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-slate-50/70">
                  <tr>
                    {[
                      "Title",
                      "Author",
                      "Platform",
                      "Score",
                      "Stage",
                      "Urgency",
                      "Found",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        className={`px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-400 ${h === "Actions" ? "text-right" : "text-left"}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    {
                      title:
                        "Looking for a ZoomInfo alternative — 6-person team",
                      author: "u/saas_founder_",
                      platform: {
                        label: "Reddit",
                        cls: "bg-red-100 text-red-600",
                      },
                      score: 9,
                      scoreCls: "bg-green-100 text-green-700",
                      stage: {
                        label: "Decision",
                        cls: "bg-orange-100 text-orange-700",
                      },
                      urgency: {
                        label: "High",
                        cls: "bg-red-100 text-red-700",
                      },
                      found: "12 min ago",
                      contacted: false,
                    },
                    {
                      title:
                        "Ask HN: Tools for tracking competitor mentions with intent scoring?",
                      author: "pmarcelo",
                      platform: {
                        label: "HN",
                        cls: "bg-orange-100 text-orange-700",
                      },
                      score: 9,
                      scoreCls: "bg-green-100 text-green-700",
                      stage: {
                        label: "Purchase",
                        cls: "bg-green-100 text-green-700",
                      },
                      urgency: {
                        label: "High",
                        cls: "bg-red-100 text-red-700",
                      },
                      found: "5 min ago",
                      contacted: false,
                    },
                    {
                      title:
                        "Our outbound is broken — cold emails get 1% reply rates",
                      author: "tmoreira",
                      platform: {
                        label: "HN",
                        cls: "bg-orange-100 text-orange-700",
                      },
                      score: 8,
                      scoreCls: "bg-green-100 text-green-700",
                      stage: {
                        label: "Consideration",
                        cls: "bg-purple-100 text-purple-700",
                      },
                      urgency: {
                        label: "High",
                        cls: "bg-red-100 text-red-700",
                      },
                      found: "34 min ago",
                      contacted: false,
                    },
                    {
                      title:
                        "Frustrated with CRM lead scoring — flags everything as hot",
                      author: "@head_of_sales_b2b",
                      platform: {
                        label: "Twitter",
                        cls: "bg-sky-100 text-sky-700",
                      },
                      score: 7,
                      scoreCls: "bg-green-100 text-green-700",
                      stage: {
                        label: "Awareness",
                        cls: "bg-blue-100 text-blue-700",
                      },
                      urgency: {
                        label: "Medium",
                        cls: "bg-yellow-100 text-yellow-600",
                      },
                      found: "1 hr ago",
                      contacted: false,
                    },
                    {
                      title:
                        "Just wrapped a painful quarter — pipeline dried up mid-cycle",
                      author: "Alex R. · VP Sales @ Stackline",
                      platform: {
                        label: "LinkedIn",
                        cls: "bg-blue-100 text-blue-700",
                      },
                      score: 6,
                      scoreCls: "bg-yellow-100 text-yellow-700",
                      stage: {
                        label: "Awareness",
                        cls: "bg-blue-100 text-blue-700",
                      },
                      urgency: {
                        label: "Low",
                        cls: "bg-gray-100 text-gray-600",
                      },
                      found: "2 hr ago",
                      contacted: true,
                    },
                  ].map((row, i) => (
                    <tr
                      key={i}
                      className="hover:bg-slate-50/60 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3 max-w-xs">
                        <div className="flex items-start gap-2">
                          <p className="line-clamp-2 font-medium text-slate-800 leading-snug">
                            {row.title}
                          </p>
                          <ExternalLink className="w-3 h-3 mt-0.5 shrink-0 text-slate-300" />
                        </div>
                        {row.contacted && (
                          <span className="mt-0.5 inline-flex items-center gap-1 text-xs text-green-600">
                            <Check className="w-3 h-3" /> Contacted
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-500 text-xs">
                        {row.author}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${row.platform.cls}`}
                        >
                          {row.platform.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${row.scoreCls}`}
                        >
                          {row.score}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs capitalize ${row.stage.cls}`}
                        >
                          {row.stage.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs capitalize ${row.urgency.cls}`}
                        >
                          {row.urgency.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-400">
                        {row.found}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button className="p-1.5 rounded-md border border-slate-200 text-slate-400 hover:text-slate-600 transition-colors">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                          <button className="p-1.5 rounded-md border border-slate-200 text-slate-400 hover:text-green-600 transition-colors">
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button className="p-1.5 rounded-md border border-slate-200 text-slate-400 hover:text-red-500 transition-colors">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mock footer */}
            <div className="border-t border-slate-100 px-6 py-3 flex items-center justify-between bg-slate-50/50">
              <p className="text-xs text-slate-400">
                Signals update every few minutes · Powered by AI intent scoring
              </p>
              <button className="text-xs text-indigo-600 font-semibold hover:text-indigo-700 transition-colors">
                Load More →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Comparison Table ────────────────────────────────── */}
      <section className="py-28 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs text-indigo-600 font-semibold uppercase tracking-widest mb-3">
              Why ExactFit
            </p>
            <h2 className="text-4xl font-bold tracking-tight">
              The only tool built for all four platforms
            </h2>
          </div>

          <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-400 w-2/5">
                    Feature
                  </th>
                  <th className="py-4 px-6 text-center w-1/5">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center">
                        <Zap className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-sm font-bold text-indigo-600">
                        ExactFit
                      </span>
                    </div>
                  </th>
                  <th className="py-4 px-6 text-center text-sm font-semibold text-slate-400 w-1/5">
                    Gojiberry
                  </th>
                  <th className="py-4 px-6 text-center text-sm font-semibold text-slate-400 w-1/5">
                    Manual search
                  </th>
                </tr>
              </thead>
              <tbody>
                {table.map((row, i) => (
                  <tr
                    key={i}
                    className={`border-t border-slate-100 hover:bg-slate-50/60 transition-colors ${i % 2 === 0 ? "" : "bg-slate-50/30"}`}
                  >
                    <td className="py-4 px-6 text-sm font-medium text-slate-700">
                      {row.feature}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {typeof row.ef === "boolean" ? (
                        <Cell v={row.ef} />
                      ) : (
                        <span className="text-sm font-semibold text-indigo-700">
                          {row.ef}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <Cell v={row.goji} />
                    </td>
                    <td className="py-4 px-6 text-center">
                      <Cell v={row.manual} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Pricing ─────────────────────────────────────────── */}
      <section id="pricing" className="py-28 bg-slate-50">
        <div className="max-w-md mx-auto px-6 text-center">
          <p className="text-xs text-indigo-600 font-semibold uppercase tracking-widest mb-3">
            Pricing
          </p>
          <h2 className="text-4xl font-bold tracking-tight mb-3">
            One plan. No surprises.
          </h2>
          <p className="text-slate-500 mb-12">
            Flat monthly pricing. Add your whole team. No per-seat tax.
          </p>

          <div className="relative bg-white rounded-3xl border border-slate-200 shadow-2xl shadow-slate-200/60 p-10 text-left overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500" />

            <div className="flex items-end gap-1 mb-1">
              <span className="text-5xl font-extrabold tracking-tight">
                $129
              </span>
              <span className="text-slate-400 mb-2">/month</span>
            </div>
            <p className="text-sm text-slate-400 mb-8">
              Flat rate — unlimited seats, unlimited alerts
            </p>

            <ul className="space-y-3.5 mb-10">
              {planFeatures.map((f, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-sm text-slate-700"
                >
                  <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>

            <a
              href="/signup"
              className="block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold text-base transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-px"
            >
              Start 7-Day Free Trial →
            </a>
            <p className="text-center text-xs text-slate-400 mt-4">
              No credit card required · Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="border-t border-slate-100 py-10 bg-white">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-slate-900 tracking-tight">
              ExactFit
            </span>
            <span className="text-sm text-slate-400 ml-2">© 2026</span>
          </div>
          <nav className="flex items-center gap-6 text-sm text-slate-500">
            <a href="#" className="hover:text-slate-900 transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-slate-900 transition-colors">
              Terms
            </a>
            <a
              href="mailto:hi@exactfit.io"
              className="hover:text-slate-900 transition-colors"
            >
              hi@exactfit.io
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
