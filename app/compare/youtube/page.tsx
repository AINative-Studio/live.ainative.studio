import type { Metadata } from 'next';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Check, X, ArrowRight, Code2, Zap, Users, Radio, FileText, GitBranch } from 'lucide-react';

export const metadata: Metadata = {
  title: 'AINative Studio Live vs YouTube for Live Coding',
  description:
    'Compare AINative Studio Live and YouTube for live coding streams. Purpose-built developer tools vs a general video platform.',
  keywords: [
    'youtube live coding alternative',
    'youtube for developers',
    'live coding platform',
    'developer streaming alternative',
    'coding livestream platform',
  ],
  alternates: {
    canonical: 'https://live.ainative.studio/compare/youtube',
  },
  openGraph: {
    title: 'AINative Studio Live vs YouTube for Live Coding',
    description:
      'Compare AINative Studio Live and YouTube for live coding. AI chat, code-aware streams, and content pipelines vs general-purpose video hosting.',
    url: 'https://live.ainative.studio/compare/youtube',
  },
};

const features = [
  {
    feature: 'Live-first platform',
    ainative: true,
    ainativeDetail: 'Designed ground-up for live streaming',
    youtube: false,
    youtubeDetail: 'Video-on-demand first; live is secondary',
  },
  {
    feature: 'Code-aware streams',
    ainative: true,
    ainativeDetail: 'GitHub repo linking, language badges, tech tags',
    youtube: false,
    youtubeDetail: 'No code or developer integrations',
  },
  {
    feature: 'AI chat assistant',
    ainative: true,
    ainativeDetail: '@ai in chat for real-time code explanations',
    youtube: false,
    youtubeDetail: 'Standard chat with no AI features',
  },
  {
    feature: 'Browser streaming',
    ainative: true,
    ainativeDetail: 'WebRTC/WHIP — go live from your browser',
    youtube: false,
    youtubeDetail: 'Requires encoder software or webcam only',
  },
  {
    feature: 'Tech-stack discovery',
    ainative: true,
    ainativeDetail: 'Browse streams by language and framework',
    youtube: false,
    youtubeDetail: 'Algorithm-driven recommendations only',
  },
  {
    feature: 'Content pipeline',
    ainative: true,
    ainativeDetail: 'Auto-generate blog posts, snippets, transcripts',
    youtube: false,
    youtubeDetail: 'Manual transcript; no content repurposing',
  },
  {
    feature: 'AI stream summaries',
    ainative: true,
    ainativeDetail: 'Live summaries for viewers joining late',
    youtube: false,
    youtubeDetail: 'No stream summary features',
  },
  {
    feature: 'VOD with chapters',
    ainative: true,
    ainativeDetail: 'AI-generated chapter markers',
    youtube: true,
    youtubeDetail: 'Manual chapter markers in description',
  },
  {
    feature: 'Video-on-demand library',
    ainative: true,
    ainativeDetail: 'Full VOD archive with search',
    youtube: true,
    youtubeDetail: 'Industry-leading VOD platform and search',
  },
  {
    feature: 'Large existing audience',
    ainative: false,
    ainativeDetail: 'Growing developer-focused community',
    youtube: true,
    youtubeDetail: '2B+ monthly users across all categories',
  },
  {
    feature: 'Monetization',
    ainative: 'soon',
    ainativeDetail: 'Revenue sharing coming soon',
    youtube: true,
    youtubeDetail: 'Ad revenue, Super Chat, memberships',
  },
  {
    feature: 'SEO / discoverability',
    ainative: true,
    ainativeDetail: 'Developer-specific search and categories',
    youtube: true,
    youtubeDetail: 'Strong Google/YouTube search presence',
  },
];

function FeatureCheck({ value }: { value: boolean | string }) {
  if (value === true) {
    return <Check className="w-5 h-5 text-emerald-500" />;
  }
  if (value === 'soon') {
    return <span className="text-xs font-medium text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">Soon</span>;
  }
  return <X className="w-5 h-5 text-red-400/60" />;
}

export default function CompareYouTubePage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 via-transparent to-red-500/5" />
          <div className="container mx-auto px-4 py-16 md:py-24 relative">
            <div className="max-w-3xl mx-auto text-center">
              <Link
                href="/compare"
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-brand-primary mb-6 transition-colors"
              >
                &larr; All comparisons
              </Link>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                AINative Studio Live vs YouTube
                <br />
                <span className="text-brand-primary">for Live Coding</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                YouTube is the world&apos;s best video platform. But live coding is not
                video — it is a real-time, interactive experience that demands
                developer-specific tools YouTube was never built to provide.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-brand-primary hover:bg-brand-primary/90 text-white font-medium transition-colors"
                >
                  Start Streaming Free
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/dashboard/go-live"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-border hover:border-brand-primary/50 font-medium transition-colors"
                >
                  <Radio className="w-4 h-4" />
                  Go Live Now
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="container mx-auto px-4 py-16">
          <h2 className="text-2xl font-bold text-center mb-10">
            Feature-by-Feature Comparison
          </h2>
          <div className="max-w-4xl mx-auto overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-4 font-semibold text-muted-foreground">
                    Feature
                  </th>
                  <th className="text-center py-4 px-4 min-w-[180px]">
                    <div className="flex items-center justify-center gap-2">
                      <img
                        src="/ainative-icon.svg"
                        alt="AINative"
                        className="h-5 w-auto"
                      />
                      <span className="font-bold">AINative Studio</span>
                    </div>
                  </th>
                  <th className="text-center py-4 px-4 min-w-[180px]">
                    <span className="font-bold text-red-400">YouTube</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {features.map((row) => (
                  <tr
                    key={row.feature}
                    className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <span className="font-medium">{row.feature}</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <FeatureCheck value={row.ainative} />
                        <span className="text-xs text-muted-foreground max-w-[160px]">
                          {row.ainativeDetail}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <FeatureCheck value={row.youtube} />
                        <span className="text-xs text-muted-foreground max-w-[160px]">
                          {row.youtubeDetail}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* The Problem with YouTube for Live Coding */}
        <section className="border-y border-border bg-muted/20">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold mb-6">
                The Problem with YouTube for Live Coding
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  YouTube dominates on-demand video. Its recommendation engine,
                  search indexing, and monetization tools are best-in-class for
                  creators who produce edited, polished video content. But live
                  coding is a fundamentally different medium — and YouTube treats
                  it as an afterthought.
                </p>
                <p>
                  The first problem is{' '}
                  <strong className="text-foreground">discoverability</strong>.
                  YouTube&apos;s algorithm optimizes for click-through rate and watch
                  time. A live coding stream with 40 viewers and a 2-hour runtime
                  cannot compete with a 10-minute edited tutorial with a clickbait
                  thumbnail. The algorithm actively deprioritizes live streams
                  unless you already have a massive subscriber base.
                </p>
                <p>
                  The second problem is{' '}
                  <strong className="text-foreground">tooling</strong>. When a viewer
                  joins a YouTube live stream 45 minutes in, they have no way to
                  catch up. There is no AI summary, no context card, and no
                  chapter markers during the live session. They either figure it
                  out from chat (which moves fast) or leave. AINative Studio Live
                  solves this with real-time AI summaries that update every few
                  minutes.
                </p>
                <p>
                  The third problem is{' '}
                  <strong className="text-foreground">content leverage</strong>.
                  After a 3-hour YouTube live stream, creators have a raw VOD and
                  nothing else. On AINative Studio Live, that same stream
                  automatically generates a blog draft summarizing what was built,
                  extractable code snippets viewers can copy, a full transcript for
                  accessibility, and AI-generated chapter markers. One stream
                  becomes a week of content — without any post-production work.
                </p>
                <p>
                  Finally, YouTube offers{' '}
                  <strong className="text-foreground">zero developer integrations</strong>.
                  There is no way to link a GitHub repository to your stream, tag
                  your tech stack, or let viewers browse streams by programming
                  language. A viewer who wants to watch someone build a Python
                  FastAPI project has to search through generic results and hope
                  for the best.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Key Advantages */}
        <section className="container mx-auto px-4 py-16">
          <h2 className="text-2xl font-bold text-center mb-10">
            What Makes AINative Studio Live Better for Live Coding
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="border border-border rounded-xl p-6">
              <div className="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center mb-4">
                <Zap className="w-5 h-5 text-brand-primary" />
              </div>
              <h3 className="font-bold text-lg mb-2">AI-Native Experience</h3>
              <p className="text-muted-foreground text-sm">
                Every stream has an AI assistant in chat. Viewers type @ai followed
                by their question and get instant, context-aware answers about the
                code being written. Late joiners get auto-generated summaries.
                This is not a bolt-on feature — it is core to the platform.
              </p>
            </div>
            <div className="border border-border rounded-xl p-6">
              <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                <GitBranch className="w-5 h-5 text-secondary" />
              </div>
              <h3 className="font-bold text-lg mb-2">GitHub Integration</h3>
              <p className="text-muted-foreground text-sm">
                Link your repository directly to your stream. Viewers see the
                project name, language breakdown, and can navigate to the repo
                with one click. Your stream page shows language badges so viewers
                immediately know what tech stack you are working with.
              </p>
            </div>
            <div className="border border-border rounded-xl p-6">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <FileText className="w-5 h-5 text-accent" />
              </div>
              <h3 className="font-bold text-lg mb-2">Automatic Content Pipeline</h3>
              <p className="text-muted-foreground text-sm">
                Your live stream does not end when you stop streaming. AINative
                automatically generates a polished blog draft, extractable code
                snippets, a full transcript, and chapter markers. Export to
                Markdown, HTML, or JSON. One stream produces a week of content
                with zero extra effort.
              </p>
            </div>
            <div className="border border-border rounded-xl p-6">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-4">
                <Code2 className="w-5 h-5 text-emerald-500" />
              </div>
              <h3 className="font-bold text-lg mb-2">Language-Based Browsing</h3>
              <p className="text-muted-foreground text-sm">
                On YouTube, searching &quot;Python live coding&quot; returns a mix of
                tutorials, shorts, and unrelated content. On AINative Studio Live,
                you browse the Python category and see only live and recent Python
                streams — sorted by viewers, recency, or trending.
              </p>
            </div>
            <div className="border border-border rounded-xl p-6">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4">
                <Radio className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="font-bold text-lg mb-2">Instant Browser Streaming</h3>
              <p className="text-muted-foreground text-sm">
                YouTube Live requires encoder software or limits you to webcam-only
                streaming. AINative Studio Live includes full WebRTC/WHIP browser
                streaming — share your screen and go live in seconds. No
                downloads, no configuration, no waiting for stream key approval.
              </p>
            </div>
            <div className="border border-border rounded-xl p-6">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="font-bold text-lg mb-2">Developer Community</h3>
              <p className="text-muted-foreground text-sm">
                YouTube&apos;s audience spans every interest imaginable. AINative
                Studio Live is exclusively for developers. Every viewer in your
                chat understands code. Every recommendation is another developer
                building something real. The signal-to-noise ratio is unmatched.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-border">
          <div className="container mx-auto px-4 py-20">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">
                Start Streaming on AINative Studio Live
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Free to use. No encoder software required. Go live from your
                browser in under 30 seconds and reach developers who care about
                what you are building.
              </p>
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold text-lg transition-colors"
              >
                Create Your Free Account
                <ArrowRight className="w-5 h-5" />
              </Link>
              <p className="text-sm text-muted-foreground mt-4">
                No credit card required. Start streaming immediately.
              </p>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
