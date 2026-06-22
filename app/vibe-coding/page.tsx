import Link from 'next/link';
import type { Metadata } from 'next';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArrowRight,
  Zap,
  Brain,
  Users,
  Sparkles,
  Play,
  Code2,
  MessageSquare,
  TrendingUp,
  Monitor,
  Wrench,
  HelpCircle,
  Radio,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Vibe Coding — Watch Developers Build with AI Live',
  description:
    'Watch vibe coding sessions live. See developers build software using AI tools like Cursor, Copilot, and Claude in real-time. The future of programming is here.',
  keywords: [
    'vibe coding',
    'vibe coding live stream',
    'ai coding',
    'ai pair programming',
    'live coding',
    'cursor ai stream',
    'build with ai',
  ],
  alternates: {
    canonical: '/vibe-coding',
  },
  openGraph: {
    title: 'Vibe Coding Live Streams | AINative Studio Live',
    description:
      'Watch the future of programming unfold. Developers building software with AI assistants, multi-agent systems, and AI-native IDE workflows — live.',
    url: '/vibe-coding',
    images: [{ url: "https://live.ainative.studio/og-image.png", width: 1200, height: 630 }],
  },
};

const faqItems = [
  {
    question: 'What is vibe coding?',
    answer:
      'Vibe coding is a style of programming where developers describe what they want in natural language and AI writes the code. Coined by Andrej Karpathy in early 2025, vibe coding means you focus on the creative vision — the architecture, the product decisions, the user experience — while AI handles the syntax, boilerplate, and implementation details. You guide the direction; AI does the typing.',
  },
  {
    question: 'Is vibe coding real programming?',
    answer:
      'Yes. Vibe coding requires deep understanding of software architecture, system design, and code review. The developer must evaluate AI-generated code for correctness, security, and performance. Prompt engineering is itself a skill — knowing how to describe complex requirements so AI produces the right output. Vibe coders still debug, refactor, and make critical design decisions. The role shifts from writing every line to directing and verifying the output.',
  },
  {
    question: 'Where can I watch vibe coding?',
    answer:
      'AINative Studio Live hosts live vibe coding streams daily. Developers stream their IDE sessions while building real software with AI tools. You can browse streams in the AI/ML category, discover sessions by technology stack, or search for specific tools like Cursor, Copilot, or Claude. Every stream includes real-time chat where you can ask the developer questions.',
  },
  {
    question: 'How do I start vibe coding?',
    answer:
      'Start with an AI-powered code editor like Cursor or VS Code with GitHub Copilot. Begin with small tasks — ask the AI to generate a function, build a component, or write tests. As you build confidence, tackle larger features by describing the architecture in natural language. Once you have a workflow you enjoy, stream it on AINative Studio Live to share your process and learn from the community.',
  },
  {
    question: 'What tools do vibe coders use?',
    answer:
      'Popular vibe coding tools include Cursor (AI-native IDE), GitHub Copilot (inline code suggestions), Claude Code (terminal-based AI assistant), v0 by Vercel (UI generation), Bolt (full-stack app builder), and Replit Agent (autonomous coding agent). Most vibe coders combine multiple tools — for example, Cursor for editing with Claude Code for complex refactors.',
  },
  {
    question: 'Can beginners do vibe coding?',
    answer:
      'Vibe coding is actually an excellent entry point for beginners. AI tools can help new developers understand code patterns, learn best practices, and build working software faster than traditional methods. However, learning fundamental programming concepts alongside vibe coding is important — understanding what the AI generates helps you catch errors and make better architectural decisions over time.',
  },
];

const tools = [
  {
    name: 'Cursor',
    description:
      'AI-native code editor built on VS Code. Features multi-file editing, codebase-aware chat, and inline code generation. The most popular IDE for vibe coding.',
    category: 'IDE',
  },
  {
    name: 'GitHub Copilot',
    description:
      'Inline AI code completion integrated into VS Code, JetBrains, and Neovim. Suggests entire functions and blocks as you type. Backed by OpenAI models.',
    category: 'Code Completion',
  },
  {
    name: 'Claude Code',
    description:
      'Terminal-based AI coding assistant that understands your entire codebase. Handles complex refactors, writes tests, and manages multi-file changes from the command line.',
    category: 'CLI Assistant',
  },
  {
    name: 'v0 by Vercel',
    description:
      'AI-powered UI generation tool. Describe a component or page in natural language and get production-ready React code with Tailwind CSS styling.',
    category: 'UI Generation',
  },
  {
    name: 'Bolt',
    description:
      'Full-stack application builder powered by AI. Generates complete applications from prompts, including frontend, backend, and database setup in a single workflow.',
    category: 'App Builder',
  },
  {
    name: 'Replit Agent',
    description:
      'Autonomous coding agent that builds, deploys, and iterates on applications. Handles everything from project setup to deployment with minimal human intervention.',
    category: 'Autonomous Agent',
  },
];

export default function VibeCodingPage() {
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Vibe Coding — The Future of AI-Assisted Development',
    description:
      'A comprehensive guide to vibe coding: what it is, why it matters, the tools developers use, and how to watch live vibe coding sessions on AINative Studio Live.',
    author: {
      '@type': 'Organization',
      name: 'AINative Studio',
    },
    publisher: {
      '@type': 'Organization',
      name: 'AINative Studio Live',
      url: 'https://live.ainative.studio',
    },
    datePublished: '2026-06-21',
    dateModified: '2026-06-21',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': 'https://live.ainative.studio/vibe-coding',
    },
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <main className="flex-1">
        {/* Hero: What is Vibe Coding? */}
        <section className="py-20 px-4 bg-gradient-to-b from-background to-card">
          <div className="container mx-auto text-center max-w-4xl">
            <div className="mb-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-primary/10 text-brand-primary text-sm font-medium">
              <TrendingUp className="w-4 h-4" />
              110,000 monthly searches — 6,700% growth since 2025
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              What is <span className="text-brand-primary">Vibe Coding</span>?
            </h1>
            <p className="text-xl text-muted-foreground mb-6 max-w-3xl mx-auto">
              Vibe coding is a new way to build software where you describe what you want in plain
              English and AI writes the code. Instead of typing every line yourself, you focus on
              the creative vision — the product, the architecture, the experience — and let AI
              handle the implementation.
            </p>
            <p className="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto">
              The term was coined by{' '}
              <strong className="text-foreground">Andrej Karpathy</strong> in February 2025. Since
              then, vibe coding has exploded from a niche concept to a mainstream development
              methodology with over 110,000 monthly Google searches and a rapidly growing ecosystem
              of tools, communities, and live streams.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button
                size="lg"
                className="bg-brand-primary hover:bg-primary-dark text-white font-medium"
                asChild
              >
                <Link href="/category/ai-ml">
                  <Play className="mr-2 w-5 h-5" />
                  Watch Vibe Coding Live
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="font-medium" asChild>
                <Link href="/dashboard/go-live">
                  <Radio className="mr-2 w-5 h-5" />
                  Start Streaming
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* How Vibe Coding Works */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold mb-4 text-center">
              How Vibe Coding Works
            </h2>
            <p className="text-lg text-muted-foreground text-center mb-12 max-w-3xl mx-auto">
              Vibe coding replaces the traditional write-compile-debug cycle with a
              describe-generate-review workflow. Here is what a typical vibe coding session looks
              like.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-border relative">
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <MessageSquare className="w-5 h-5 text-brand-primary" />
                    Describe
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Tell the AI what you want to build in natural language. Describe the feature, the
                    behavior, the edge cases. Be as specific or as broad as you like.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border relative">
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-success text-white flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <Code2 className="w-5 h-5 text-success" />
                    Generate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    AI generates the code across multiple files. It understands your codebase context,
                    existing patterns, and project conventions to produce consistent output.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border relative">
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <Brain className="w-5 h-5 text-secondary" />
                    Review
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    You review the generated code for correctness, security, and quality. Accept what
                    works, reject what does not, and refine your prompts for the next iteration.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border relative">
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-accent text-background flex items-center justify-center font-bold text-sm">
                  4
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <Zap className="w-5 h-5 text-accent" />
                    Iterate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Repeat with refinements. Each cycle takes minutes instead of hours. Complex
                    features that once took days can be built in a single vibe coding session.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Why Vibe Coding is the Future */}
        <section className="py-16 px-4 bg-card/50">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-3xl font-bold mb-4 text-center">
              Why Vibe Coding is the Future of Development
            </h2>
            <p className="text-lg text-muted-foreground text-center mb-12 max-w-3xl mx-auto">
              Vibe coding is not a fad. The data shows a fundamental shift in how software gets
              built — and it is accelerating.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="text-center p-6 rounded-xl bg-background border border-border">
                <div className="text-4xl font-bold text-brand-primary mb-2">110K</div>
                <div className="text-sm text-muted-foreground font-medium mb-1">
                  Monthly Google Searches
                </div>
                <p className="text-xs text-muted-foreground">
                  &quot;Vibe coding&quot; went from zero to 110,000 monthly searches in under 18
                  months — one of the fastest-growing developer search terms ever recorded.
                </p>
              </div>
              <div className="text-center p-6 rounded-xl bg-background border border-border">
                <div className="text-4xl font-bold text-success mb-2">6,700%</div>
                <div className="text-sm text-muted-foreground font-medium mb-1">
                  Search Growth Rate
                </div>
                <p className="text-xs text-muted-foreground">
                  Year-over-year growth that outpaces every other programming methodology in Google
                  Trends history. Developer interest is doubling every quarter.
                </p>
              </div>
              <div className="text-center p-6 rounded-xl bg-background border border-border">
                <div className="text-4xl font-bold text-accent mb-2">$4.7B</div>
                <div className="text-sm text-muted-foreground font-medium mb-1">
                  AI Coding Tool Market
                </div>
                <p className="text-xs text-muted-foreground">
                  The market for AI coding assistants and vibe coding tools is projected to reach
                  $4.7 billion by 2027, driven by enterprise adoption and developer demand.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="border-l-4 border-success pl-6 py-2">
                <h3 className="text-xl font-semibold mb-2">
                  Productivity Gains Are Real and Measurable
                </h3>
                <p className="text-muted-foreground">
                  Studies consistently show that developers using AI coding tools complete tasks 30%
                  to 55% faster than those writing code manually. For boilerplate-heavy work like
                  CRUD APIs, form validation, and test generation, the speedup can exceed 10x. Vibe
                  coding does not just save time — it changes what a single developer can
                  realistically build in a day.
                </p>
              </div>

              <div className="border-l-4 border-brand-primary pl-6 py-2">
                <h3 className="text-xl font-semibold mb-2">
                  The Skill Shift Is Already Happening
                </h3>
                <p className="text-muted-foreground">
                  The most in-demand developer skills are shifting. Prompt engineering, AI tool
                  fluency, and the ability to review and direct AI-generated code are becoming as
                  important as knowing a specific language or framework. Companies are hiring for
                  &quot;AI-augmented development&quot; roles, and developers who can vibe code
                  effectively command a premium.
                </p>
              </div>

              <div className="border-l-4 border-secondary pl-6 py-2">
                <h3 className="text-xl font-semibold mb-2">
                  Democratizing Software Creation
                </h3>
                <p className="text-muted-foreground">
                  Vibe coding lowers the barrier to building software. Designers can prototype
                  working applications. Product managers can build internal tools. Domain experts can
                  create specialized software without years of programming training. This is not
                  about replacing developers — it is about expanding who can participate in building
                  technology.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Watch Vibe Coding Live */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-3xl font-bold mb-4 text-center">
              Watch Vibe Coding Live
            </h2>
            <p className="text-lg text-muted-foreground text-center mb-8 max-w-3xl mx-auto">
              AINative Studio Live is the home for live vibe coding streams. Every day, developers
              stream their IDE sessions while building real software with AI tools. Watch, learn,
              and chat with streamers in real time.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <Monitor className="w-5 h-5 text-brand-primary" />
                    Browse AI/ML Streams
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-4">
                    The{' '}
                    <Link
                      href="/category/ai-ml"
                      className="text-brand-primary hover:underline font-medium"
                    >
                      AI/ML category
                    </Link>{' '}
                    is where most vibe coding streams live. Watch developers build applications
                    using Cursor, Copilot, Claude Code, and other AI-powered tools in real time.
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/category/ai-ml">
                      Browse AI/ML <ArrowRight className="ml-1 w-4 h-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <Code2 className="w-5 h-5 text-success" />
                    Discover by Technology
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-4">
                    Find vibe coding streams by the{' '}
                    <Link
                      href="/tech"
                      className="text-brand-primary hover:underline font-medium"
                    >
                      language or framework
                    </Link>{' '}
                    being used. Whether it is TypeScript, Python, Rust, or React — see how
                    developers vibe code in your favorite stack.
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/tech">
                      Browse Tech <ArrowRight className="ml-1 w-4 h-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <Users className="w-5 h-5 text-secondary" />
                    Join the Community
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-4">
                    Every stream has live chat where viewers can ask questions, suggest approaches,
                    and learn together. Follow your favorite vibe coders to get notified when they
                    go live.
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/search">
                      Find Streamers <ArrowRight className="ml-1 w-4 h-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Popular Vibe Coding Tools */}
        <section className="py-16 px-4 bg-card/50">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-3xl font-bold mb-4 text-center">
              Popular Vibe Coding Tools
            </h2>
            <p className="text-lg text-muted-foreground text-center mb-12 max-w-3xl mx-auto">
              The vibe coding ecosystem is growing fast. These are the tools you will see most
              often on live streams — and the ones you should try first if you are getting started.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tools.map((tool) => (
                <Card key={tool.name} className="border-border">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-3 text-lg">
                        <Wrench className="w-5 h-5 text-brand-primary" />
                        {tool.name}
                      </CardTitle>
                      <span className="text-xs px-2 py-1 rounded-full bg-brand-primary/10 text-brand-primary font-medium">
                        {tool.category}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">{tool.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* The Vibe Coding Workflow on Stream */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-3xl font-bold mb-4 text-center">
              Vibe Coding on Stream — What to Expect
            </h2>
            <p className="text-lg text-muted-foreground text-center mb-12 max-w-3xl mx-auto">
              Watching a vibe coding stream is different from a traditional coding stream. Here is
              what makes it unique and why viewers find it so engaging.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-accent" />
                  What Viewers See
                </h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-success mt-1">&#9679;</span>
                    <span>
                      <strong className="text-foreground">The conversation:</strong> Developers
                      talk through their thinking, explain what they are asking the AI to do, and
                      share why they accept or reject suggestions.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-success mt-1">&#9679;</span>
                    <span>
                      <strong className="text-foreground">Rapid iteration:</strong> Features that
                      take hours in traditional streams can be built in minutes. The pace is fast
                      and the results are visible immediately.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-success mt-1">&#9679;</span>
                    <span>
                      <strong className="text-foreground">Tool mastery:</strong> How experienced
                      developers configure and use AI tools — the prompts they write, the shortcuts
                      they use, the workflows they have built.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-success mt-1">&#9679;</span>
                    <span>
                      <strong className="text-foreground">Real mistakes:</strong> AI does not
                      always get it right. Watching how developers debug, correct, and work around
                      AI limitations is some of the most valuable content.
                    </span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-brand-primary" />
                  What Viewers Learn
                </h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-brand-primary mt-1">&#9679;</span>
                    <span>
                      <strong className="text-foreground">Prompt engineering:</strong> How to
                      write clear, specific prompts that produce the code you actually want.
                      Context, constraints, and examples matter.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-primary mt-1">&#9679;</span>
                    <span>
                      <strong className="text-foreground">Architecture decisions:</strong> Vibe
                      coding puts more emphasis on high-level design. Streamers explain why they
                      structure projects a certain way.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-primary mt-1">&#9679;</span>
                    <span>
                      <strong className="text-foreground">Code review skills:</strong> Evaluating
                      AI-generated code quickly and accurately is a critical skill. Streams show
                      this process in real time.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-primary mt-1">&#9679;</span>
                    <span>
                      <strong className="text-foreground">Tool discovery:</strong> See new AI
                      tools and workflows before they hit the mainstream. Streamers are often early
                      adopters testing the latest releases.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Start Vibe Coding on Stream */}
        <section className="py-16 px-4 bg-gradient-to-b from-card/50 to-background">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold mb-4 text-center">
              Start Vibe Coding on Stream
            </h2>
            <p className="text-lg text-muted-foreground text-center mb-10 max-w-3xl mx-auto">
              Ready to share your vibe coding workflow with the world? AINative Studio Live makes
              it easy to go live from your browser or OBS in minutes.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="text-center p-6">
                <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-brand-primary font-bold text-lg">1</span>
                </div>
                <h3 className="font-semibold mb-2">Create an Account</h3>
                <p className="text-sm text-muted-foreground">
                  Sign up with email, GitHub, or Google. It takes 30 seconds and you can start
                  streaming immediately.
                </p>
              </div>
              <div className="text-center p-6">
                <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-success font-bold text-lg">2</span>
                </div>
                <h3 className="font-semibold mb-2">Set Up Your Stream</h3>
                <p className="text-sm text-muted-foreground">
                  Add a title, select your tech stack, tag your stream with &quot;vibe-coding&quot;,
                  and link your GitHub repo if you want to show your project.
                </p>
              </div>
              <div className="text-center p-6">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-accent font-bold text-lg">3</span>
                </div>
                <h3 className="font-semibold mb-2">Go Live</h3>
                <p className="text-sm text-muted-foreground">
                  Stream directly from your browser with WebRTC or use OBS with RTMP. Share your
                  IDE, your AI conversations, and your build process with viewers.
                </p>
              </div>
            </div>

            <div className="text-center">
              <Button
                size="lg"
                className="bg-brand-primary hover:bg-primary-dark text-white font-medium"
                asChild
              >
                <Link href="/dashboard/go-live">
                  Go Live Now <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold mb-4 text-center flex items-center justify-center gap-3">
              <HelpCircle className="w-8 h-8 text-brand-primary" />
              Vibe Coding FAQ
            </h2>
            <p className="text-lg text-muted-foreground text-center mb-12">
              Common questions about vibe coding, answered.
            </p>

            <div className="space-y-6">
              {faqItems.map((item, index) => (
                <div
                  key={index}
                  className="border border-border rounded-xl p-6 hover:border-brand-primary/30 transition-colors"
                >
                  <h3 className="text-lg font-semibold mb-3">{item.question}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 px-4 bg-gradient-to-b from-background to-card">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-4xl font-bold mb-6">
              The Future of Programming is Live
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Vibe coding is changing how software gets built. Whether you want to watch, learn, or
              stream your own sessions — AINative Studio Live is where the vibe coding community
              gathers.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button
                size="lg"
                className="bg-brand-primary hover:bg-primary-dark text-white font-medium"
                asChild
              >
                <Link href="/dashboard/go-live">
                  Start Streaming <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="font-medium" asChild>
                <Link href="/category/ai-ml">Watch Vibe Coding Live</Link>
              </Button>
              <Button size="lg" variant="outline" className="font-medium" asChild>
                <Link href="/tech">Browse by Technology</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
