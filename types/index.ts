export interface Stream {
  id: string;
  username: string;
  displayName: string;
  title: string;
  category: string;
  categorySlug: string;
  live: boolean;
  viewers: number;
  thumbnail: string;
  avatar: string;
  tags: string[];
  startedAt: string | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  viewerCount: number;
}

export interface User {
  username: string;
  displayName: string;
  bio: string;
  avatar: string;
  followers: number;
  isLive: boolean;
  socials: {
    twitter?: string;
    github?: string;
    youtube?: string;
    website?: string;
  };
  schedule: string;
}

export interface ChatMessage {
  id: string;
  username: string;
  avatar: string;
  message: string;
  timestamp: string;
  badges?: string[];
}
