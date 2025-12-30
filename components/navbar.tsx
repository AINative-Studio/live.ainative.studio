'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Menu, Video, User, LogOut, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { NotificationDropdown } from '@/components/notification-dropdown';
import { useAuth } from '@/contexts/auth-context';

export function Navbar() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3">
              <img src="/ainative-icon.svg" alt="AINative Studio Live" className="h-8 w-auto" />
              <span className="text-xl font-bold tracking-tight uppercase flex items-center gap-1">
                <span className="text-white">AI</span>
                <span className="text-brand-primary">NATIVE</span>
                <span className="text-muted-foreground text-sm ml-2 font-normal flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                  </span>
                  LIVE
                </span>
              </span>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="font-mono">
                  <Menu className="w-4 h-4 mr-2" />
                  Categories
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/category/ai-coding">AI Coding</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/category/ai-native-development">AI-Native Development</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/category/nextjs">Next.js</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/category/python">Python</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/category/rust">Rust</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/category/devops">DevOps</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/category/web3">Web3</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/category/game-dev">Game Dev</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <form onSubmit={handleSearch} className="flex-1 max-w-md mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search streams, categories, or coders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </form>

          <div className="flex items-center gap-3">
            {!isLoading && isAuthenticated ? (
              <>
                <Button asChild className="bg-brand-primary hover:bg-primary-dark text-white font-medium">
                  <Link href="/dashboard">
                    <Video className="w-4 h-4 mr-2" />
                    Go Live
                  </Link>
                </Button>

                <NotificationDropdown />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user?.avatar || undefined} />
                        <AvatarFallback>
                          {user?.displayName?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {user?.username && (
                      <DropdownMenuItem asChild>
                        <Link href={`/user/${user.username}`}>
                          <User className="w-4 h-4 mr-2" />
                          Profile
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">
                        <Video className="w-4 h-4 mr-2" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings">
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button asChild variant="ghost">
                  <Link href="/login">Log In</Link>
                </Button>
                <Button asChild className="bg-brand-primary hover:bg-primary-dark text-white font-medium">
                  <Link href="/register">Sign Up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
