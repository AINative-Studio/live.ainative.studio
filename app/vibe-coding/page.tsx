import Link from 'next/link';
import type { Metadata } from 'next';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Zap, Brain, Users, Sparkles } from 'lucide-react';
import { TerminalHeader } from '@/components/terminal-header';

export const metadata: Metadata = {
  title: 'What is Vibe Coding? | VibeCode Live',
  description:
    'Discover Vibe Coding - the future of AI-assisted development. Watch developers enter flow state with AI agents, real-time collaboration, and cutting-edge tooling.',
};

export default function VibeCodingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1">
        <section className="py-20 px-4 bg-gradient-to-b from-background to-card">
          <div className="container mx-auto text-center max-w-4xl">
            <div className="mb-6 inline-block">
              <TerminalHeader text="> what_is_vibe_coding" typingSpeed={60} />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              The Future of <span className="text-neon-blue">Development</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Vibe Coding is a revolutionary approach to software development that combines AI-native
              workflows, multi-agent systems, and real-time collaboration to unlock unprecedented
              developer productivity and creativity.
            </p>
          </div>
        </section>

        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-neon-green/10 rounded-lg">
                      <Zap className="w-6 h-6 text-neon-green" />
                    </div>
                    Flow State Development
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Enter a state of deep focus where AI assistants handle boilerplate, research, and
                    repetitive tasks while you concentrate on creative problem-solving and
                    architectural decisions.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-neon-blue/10 rounded-lg">
                      <Brain className="w-6 h-6 text-neon-blue" />
                    </div>
                    AI-Native Workflows
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Integrate powerful language models directly into your IDE. From code generation to
                    refactoring, testing, and documentation - AI becomes your pair programming partner.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-neon-cyan/10 rounded-lg">
                      <Users className="w-6 h-6 text-neon-cyan" />
                    </div>
                    Multi-Agent Collaboration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Deploy specialized AI agents that work together on complex tasks. Research agents,
                    code reviewers, testers, and documentation writers collaborate seamlessly.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Sparkles className="w-6 h-6 text-primary" />
                    </div>
                    Build in Public
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Stream your development sessions, share your workflow, and learn from other Vibe
                    Coders. Transparency and community drive innovation forward.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-16 px-4 bg-card/50">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold mb-8 text-center">Core Principles</h2>
            <div className="space-y-6">
              <div className="border-l-4 border-neon-green pl-6 py-2">
                <h3 className="text-xl font-semibold mb-2">AI Augmentation, Not Replacement</h3>
                <p className="text-muted-foreground">
                  AI enhances human creativity and decision-making rather than replacing developers.
                  You remain in control while AI handles the tedious work.
                </p>
              </div>

              <div className="border-l-4 border-neon-blue pl-6 py-2">
                <h3 className="text-xl font-semibold mb-2">Real-Time Feedback Loops</h3>
                <p className="text-muted-foreground">
                  Instant feedback from AI assistants, automated tests, and community members creates
                  rapid iteration cycles that accelerate development.
                </p>
              </div>

              <div className="border-l-4 border-neon-cyan pl-6 py-2">
                <h3 className="text-xl font-semibold mb-2">Context-Aware Intelligence</h3>
                <p className="text-muted-foreground">
                  Modern AI understands your entire codebase, project requirements, and coding
                  patterns to provide truly relevant assistance.
                </p>
              </div>

              <div className="border-l-4 border-primary pl-6 py-2">
                <h3 className="text-xl font-semibold mb-2">Community Learning</h3>
                <p className="text-muted-foreground">
                  Watch experienced developers work, learn new patterns, discover tools, and share
                  your own insights with the community.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-4xl font-bold mb-6">Ready to Experience Vibe Coding?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of developers already streaming their IDE sessions and building the
              future of software development.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" className="font-mono border-glow-green" asChild>
                <Link href="/dashboard">
                  Start Streaming <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="font-mono" asChild>
                <Link href="/search">Watch Live Streams</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
