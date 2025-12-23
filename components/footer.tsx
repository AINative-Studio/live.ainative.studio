import Link from 'next/link';
import { Video, Github, Twitter, Youtube } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-neon-green rounded flex items-center justify-center">
                <Video className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-mono text-lg font-bold">
                VibeCode<span className="text-neon-blue">Live</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              The premier livestreaming platform for Vibe Coders. Stream Your IDE. Build in Public.
            </p>
          </div>

          <div>
            <h3 className="font-mono font-semibold mb-4">Platform</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-sm text-muted-foreground hover:text-neon-green transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/vibe-coding" className="text-sm text-muted-foreground hover:text-neon-green transition-colors">
                  What is Vibe Coding?
                </Link>
              </li>
              <li>
                <Link href="/events" className="text-sm text-muted-foreground hover:text-neon-green transition-colors">
                  Events
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-neon-green transition-colors">
                  Start Streaming
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-mono font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/docs" className="text-sm text-muted-foreground hover:text-neon-green transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-sm text-muted-foreground hover:text-neon-green transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-muted-foreground hover:text-neon-green transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-muted-foreground hover:text-neon-green transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-mono font-semibold mb-4">Connect</h3>
            <div className="flex gap-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-muted rounded flex items-center justify-center hover:bg-neon-green hover:text-primary-foreground transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-muted rounded flex items-center justify-center hover:bg-neon-blue hover:text-primary-foreground transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-muted rounded flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground font-mono">
            &copy; {new Date().getFullYear()} VibeCode Live by AINative Studio. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
