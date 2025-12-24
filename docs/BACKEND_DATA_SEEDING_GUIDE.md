# Backend Data Seeding Guide

**Version:** 1.0.0
**Date:** 2025-12-24
**Purpose:** Guide for backend team to populate the database with initial data for AINative Studio Live

---

## Overview

The frontend is fully integrated with the backend API. Currently, all API endpoints return empty arrays because there is no data in the database. This document provides the exact data structures and sample data needed to populate the database.

---

## 1. Categories (Required First)

Categories must be created first as they are referenced by streams.

### API Endpoint
```
POST /streams/categories (or direct database insert)
```

### Category Schema
```typescript
interface Category {
  id: string;           // UUID
  name: string;         // Display name
  slug: string;         // URL-friendly slug (unique)
  description: string;  // Category description
  iconUrl: string;      // Icon URL or icon name
  isActive: boolean;    // Whether category is visible
  parentId?: string;    // Parent category ID (for subcategories)
}
```

### Seed Data - Categories
```json
[
  {
    "name": "AI Coding",
    "slug": "ai-coding",
    "description": "Explore AI-powered development workflows, LLMs, and intelligent coding assistants",
    "iconUrl": "brain",
    "isActive": true
  },
  {
    "name": "AI-Native Development",
    "slug": "ai-native-development",
    "description": "Watch developers in flow state building with AI agents and cutting-edge tools",
    "iconUrl": "zap",
    "isActive": true
  },
  {
    "name": "Next.js",
    "slug": "nextjs",
    "description": "React framework with server-side rendering, routing, and modern web development",
    "iconUrl": "layout",
    "isActive": true
  },
  {
    "name": "Python",
    "slug": "python",
    "description": "Backend development, data science, ML, and general-purpose programming",
    "iconUrl": "code",
    "isActive": true
  },
  {
    "name": "Rust",
    "slug": "rust",
    "description": "Systems programming, performance, and memory safety",
    "iconUrl": "cpu",
    "isActive": true
  },
  {
    "name": "DevOps",
    "slug": "devops",
    "description": "Infrastructure, CI/CD, containerization, and cloud deployment",
    "iconUrl": "server",
    "isActive": true
  },
  {
    "name": "Web3",
    "slug": "web3",
    "description": "Blockchain development, smart contracts, and decentralized applications",
    "iconUrl": "link",
    "isActive": true
  },
  {
    "name": "Game Dev",
    "slug": "game-dev",
    "description": "Game development, Unity, Unreal, and indie game creation",
    "iconUrl": "gamepad-2",
    "isActive": true
  },
  {
    "name": "TypeScript",
    "slug": "typescript",
    "description": "Type-safe JavaScript development for frontend and backend",
    "iconUrl": "code",
    "isActive": true
  },
  {
    "name": "Mobile Development",
    "slug": "mobile-dev",
    "description": "iOS, Android, React Native, and Flutter development",
    "iconUrl": "smartphone",
    "isActive": true
  }
]
```

---

## 2. Users (Required for Streams)

Users need to be created before streams. These can be test/demo accounts.

### API Endpoint
```
POST /public/auth/register (or direct database insert)
```

### User Schema
```typescript
interface User {
  id: string;              // UUID
  email: string;           // Unique email
  username: string;        // Unique username (lowercase, no spaces)
  displayName: string;     // Display name
  password: string;        // Hashed password
  avatar: string | null;   // Avatar URL
  bio: string | null;      // User bio
  role: 'USER' | 'ADMIN';  // User role
  isLive: boolean;         // Currently streaming
  followerCount: number;   // Followers count (can be 0)
  followingCount: number;  // Following count (can be 0)
  socials: {
    twitter?: string;
    github?: string;
    youtube?: string;
    website?: string;
  };
}
```

### Seed Data - Users
```json
[
  {
    "email": "urbantech@example.com",
    "username": "urbantech",
    "displayName": "UrbanTech",
    "password": "demo123456",
    "avatar": "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200",
    "bio": "Building AI-native IDEs and developer tools. Ex-Google engineer, now fulltime on AI tooling. Streaming 5 days/week.",
    "role": "USER",
    "followerCount": 12847,
    "socials": {
      "twitter": "urbantech_dev",
      "github": "urbantech",
      "website": "https://urbantech.dev"
    }
  },
  {
    "email": "quantumcoder@example.com",
    "username": "quantumcoder",
    "displayName": "QuantumCoder",
    "password": "demo123456",
    "avatar": "https://images.pexels.com/photos/1840608/pexels-photo-1840608.jpeg?auto=compress&cs=tinysrgb&w=200",
    "bio": "AI-native development evangelist. Building multi-agent systems and exploring the future of AI-assisted development.",
    "role": "USER",
    "followerCount": 8234,
    "socials": {
      "twitter": "quantumcoder",
      "github": "qcoder"
    }
  },
  {
    "email": "nextjsmaster@example.com",
    "username": "nextjsmaster",
    "displayName": "NextJS Master",
    "password": "demo123456",
    "avatar": "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200",
    "bio": "Full-stack developer specializing in Next.js and React. Building SaaS products live on stream.",
    "role": "USER",
    "followerCount": 23456,
    "socials": {
      "twitter": "nextjsmaster",
      "github": "nextjsmaster",
      "youtube": "nextjsmaster"
    }
  },
  {
    "email": "pythonista@example.com",
    "username": "pythonista_dev",
    "displayName": "Pythonista Dev",
    "password": "demo123456",
    "avatar": "https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=200",
    "bio": "Python backend engineer. FastAPI, Django, and data engineering. Love building scalable APIs.",
    "role": "USER",
    "followerCount": 6543,
    "socials": {
      "github": "pythonista-dev"
    }
  },
  {
    "email": "rustacean@example.com",
    "username": "rustacean",
    "displayName": "Rustacean",
    "password": "demo123456",
    "avatar": "https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=200",
    "bio": "Systems programming in Rust. Performance optimization and low-level development enthusiast.",
    "role": "USER",
    "followerCount": 4567,
    "socials": {
      "twitter": "rustacean_dev",
      "github": "rustacean"
    }
  },
  {
    "email": "aiarchitect@example.com",
    "username": "aiarchitect",
    "displayName": "AI Architect",
    "password": "demo123456",
    "avatar": "https://images.pexels.com/photos/1484794/pexels-photo-1484794.jpeg?auto=compress&cs=tinysrgb&w=200",
    "bio": "ML Engineer building production AI systems. RAG, LLMs, and AI infrastructure.",
    "role": "USER",
    "followerCount": 15678,
    "socials": {
      "twitter": "aiarchitect",
      "github": "ai-architect",
      "website": "https://aiarch.tech"
    }
  },
  {
    "email": "devops@example.com",
    "username": "devops_wizard",
    "displayName": "DevOps Wizard",
    "password": "demo123456",
    "avatar": "https://images.pexels.com/photos/1516644/pexels-photo-1516644.jpeg?auto=compress&cs=tinysrgb&w=200",
    "bio": "Cloud infrastructure and DevOps engineer. Kubernetes, Docker, and automation specialist.",
    "role": "USER",
    "followerCount": 7890,
    "socials": {
      "twitter": "devops_wizard",
      "github": "devops-wizard"
    }
  },
  {
    "email": "web3builder@example.com",
    "username": "web3builder",
    "displayName": "Web3 Builder",
    "password": "demo123456",
    "avatar": "https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=200",
    "bio": "Smart contract developer and blockchain enthusiast. Building decentralized applications.",
    "role": "USER",
    "followerCount": 5432,
    "socials": {
      "twitter": "web3builder",
      "github": "web3-builder"
    }
  }
]
```

---

## 3. Tags (Optional but Recommended)

Tags help users discover streams by topic.

### Tag Schema
```typescript
interface Tag {
  id: string;       // UUID
  name: string;     // Display name
  slug: string;     // URL-friendly slug
  usageCount: number; // Number of streams using this tag
}
```

### Seed Data - Tags
```json
[
  { "name": "AI", "slug": "ai" },
  { "name": "Cursor", "slug": "cursor" },
  { "name": "Claude", "slug": "claude" },
  { "name": "IDE", "slug": "ide" },
  { "name": "AI-Native", "slug": "ai-native" },
  { "name": "RAG", "slug": "rag" },
  { "name": "LangChain", "slug": "langchain" },
  { "name": "Next.js", "slug": "nextjs" },
  { "name": "React", "slug": "react" },
  { "name": "Server Actions", "slug": "server-actions" },
  { "name": "TypeScript", "slug": "typescript" },
  { "name": "Python", "slug": "python" },
  { "name": "FastAPI", "slug": "fastapi" },
  { "name": "PostgreSQL", "slug": "postgresql" },
  { "name": "Backend", "slug": "backend" },
  { "name": "Rust", "slug": "rust" },
  { "name": "Performance", "slug": "performance" },
  { "name": "Systems Programming", "slug": "systems-programming" },
  { "name": "LLM", "slug": "llm" },
  { "name": "Ollama", "slug": "ollama" },
  { "name": "Kubernetes", "slug": "kubernetes" },
  { "name": "Docker", "slug": "docker" },
  { "name": "CI/CD", "slug": "ci-cd" },
  { "name": "DevOps", "slug": "devops" },
  { "name": "Solidity", "slug": "solidity" },
  { "name": "Web3", "slug": "web3" },
  { "name": "Blockchain", "slug": "blockchain" },
  { "name": "Smart Contracts", "slug": "smart-contracts" }
]
```

---

## 4. Streams (For Demo/Testing)

Create some sample streams to populate the homepage. Some can be "live" for testing.

### Stream Schema
```typescript
interface Stream {
  id: string;                // UUID
  userId: string;            // User ID (foreign key)
  title: string;             // Stream title
  description: string | null;
  status: 'offline' | 'live' | 'ended';
  categoryId: string;        // Category ID (foreign key)
  thumbnailUrl: string | null;
  streamKey: string;         // Generated stream key
  viewerCount: number;       // Current viewers (0 if not live)
  peakViewers: number;       // Peak viewer count
  startedAt: string | null;  // ISO date when went live
  endedAt: string | null;    // ISO date when ended
  tags: string[];            // Array of tag IDs
}
```

### Seed Data - Live Streams
```json
[
  {
    "userId": "<urbantech_user_id>",
    "title": "Building an AI Native IDE with Cursor & Claude",
    "description": "Join me as I build custom AI-powered IDE features using Cursor and Claude API",
    "status": "live",
    "categoryId": "<ai-coding_category_id>",
    "thumbnailUrl": "https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=800",
    "viewerCount": 1247,
    "peakViewers": 1523,
    "startedAt": "2025-12-24T10:00:00Z",
    "tags": ["AI", "Cursor", "Claude", "IDE"]
  },
  {
    "userId": "<quantumcoder_user_id>",
    "title": "Real-time AI-Native Development: Multi-Agent RAG System",
    "description": "Building a production-ready multi-agent RAG system from scratch",
    "status": "live",
    "categoryId": "<ai-native-development_category_id>",
    "thumbnailUrl": "https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=800",
    "viewerCount": 892,
    "peakViewers": 1102,
    "startedAt": "2025-12-24T11:30:00Z",
    "tags": ["AI-Native", "RAG", "AI", "LangChain"]
  },
  {
    "userId": "<nextjsmaster_user_id>",
    "title": "Building a SaaS Dashboard with Next.js 15 & Server Actions",
    "description": "Creating a complete SaaS dashboard with authentication, billing, and analytics",
    "status": "live",
    "categoryId": "<nextjs_category_id>",
    "thumbnailUrl": "https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=800",
    "viewerCount": 2341,
    "peakViewers": 2890,
    "startedAt": "2025-12-24T09:00:00Z",
    "tags": ["Next.js", "React", "Server Actions", "TypeScript"]
  },
  {
    "userId": "<pythonista_dev_user_id>",
    "title": "FastAPI + PostgreSQL: Production-Grade REST API",
    "description": "Building a scalable REST API with FastAPI, SQLAlchemy, and PostgreSQL",
    "status": "live",
    "categoryId": "<python_category_id>",
    "thumbnailUrl": "https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=800",
    "viewerCount": 654,
    "peakViewers": 812,
    "startedAt": "2025-12-24T12:00:00Z",
    "tags": ["Python", "FastAPI", "PostgreSQL", "Backend"]
  },
  {
    "userId": "<rustacean_user_id>",
    "title": "High-Performance Web Server in Rust",
    "description": "Building a blazing fast web server using Actix-web and async Rust",
    "status": "live",
    "categoryId": "<rust_category_id>",
    "thumbnailUrl": "https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=800",
    "viewerCount": 445,
    "peakViewers": 567,
    "startedAt": "2025-12-24T13:00:00Z",
    "tags": ["Rust", "Performance", "Systems Programming"]
  },
  {
    "userId": "<aiarchitect_user_id>",
    "title": "Deploying LLMs with Ollama & RAG Pipeline",
    "description": "Self-hosting LLMs and building RAG pipelines for enterprise use",
    "status": "live",
    "categoryId": "<ai-coding_category_id>",
    "thumbnailUrl": "https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=800",
    "viewerCount": 1876,
    "peakViewers": 2234,
    "startedAt": "2025-12-24T10:45:00Z",
    "tags": ["LLM", "Ollama", "RAG", "AI"]
  }
]
```

### Seed Data - Offline/Past Streams
```json
[
  {
    "userId": "<devops_wizard_user_id>",
    "title": "Kubernetes CI/CD Pipeline from Scratch",
    "description": "Setting up a complete CI/CD pipeline with Kubernetes, ArgoCD, and GitHub Actions",
    "status": "ended",
    "categoryId": "<devops_category_id>",
    "thumbnailUrl": "https://images.pexels.com/photos/1181354/pexels-photo-1181354.jpeg?auto=compress&cs=tinysrgb&w=800",
    "viewerCount": 0,
    "peakViewers": 1456,
    "startedAt": "2025-12-23T14:00:00Z",
    "endedAt": "2025-12-23T18:00:00Z",
    "tags": ["Kubernetes", "Docker", "CI/CD", "DevOps"]
  },
  {
    "userId": "<web3builder_user_id>",
    "title": "Smart Contract Development with Solidity",
    "description": "Building secure smart contracts for DeFi applications",
    "status": "ended",
    "categoryId": "<web3_category_id>",
    "thumbnailUrl": "https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=800",
    "viewerCount": 0,
    "peakViewers": 987,
    "startedAt": "2025-12-22T15:00:00Z",
    "endedAt": "2025-12-22T19:00:00Z",
    "tags": ["Solidity", "Web3", "Blockchain", "Smart Contracts"]
  }
]
```

---

## 5. Schedules (Optional)

User streaming schedules for the schedule feature.

### Schedule Schema
```typescript
interface Schedule {
  id: string;
  userId: string;
  dayOfWeek: number;    // 0=Monday, 6=Sunday
  startTime: string;    // "HH:MM" format (24h)
  endTime: string;      // "HH:MM" format (24h)
  title: string;
  categoryId: string | null;
  isRecurring: boolean;
}
```

### Seed Data - Schedules
```json
[
  {
    "userId": "<urbantech_user_id>",
    "dayOfWeek": 0,
    "startTime": "10:00",
    "endTime": "14:00",
    "title": "AI Tooling Development",
    "categoryId": "<ai-coding_category_id>",
    "isRecurring": true
  },
  {
    "userId": "<urbantech_user_id>",
    "dayOfWeek": 2,
    "startTime": "10:00",
    "endTime": "14:00",
    "title": "Cursor Extension Building",
    "categoryId": "<ai-coding_category_id>",
    "isRecurring": true
  },
  {
    "userId": "<nextjsmaster_user_id>",
    "dayOfWeek": 0,
    "startTime": "09:00",
    "endTime": "13:00",
    "title": "SaaS Development",
    "categoryId": "<nextjs_category_id>",
    "isRecurring": true
  },
  {
    "userId": "<nextjsmaster_user_id>",
    "dayOfWeek": 2,
    "startTime": "09:00",
    "endTime": "13:00",
    "title": "React Component Building",
    "categoryId": "<nextjs_category_id>",
    "isRecurring": true
  },
  {
    "userId": "<nextjsmaster_user_id>",
    "dayOfWeek": 4,
    "startTime": "09:00",
    "endTime": "13:00",
    "title": "Full-Stack Friday",
    "categoryId": "<nextjs_category_id>",
    "isRecurring": true
  }
]
```

---

## 6. Follows (Optional)

Sample follow relationships for testing follow features.

### Follow Schema
```typescript
interface Follow {
  id: string;
  followerId: string;   // User who is following
  followedId: string;   // User being followed
  createdAt: string;    // ISO timestamp
}
```

### Seed Data - Follows
Create some follows between the demo users to test the following/followers features.

---

## 7. Database Seeding Order

Execute in this order to satisfy foreign key constraints:

1. **Categories** - No dependencies
2. **Tags** - No dependencies
3. **Users** - No dependencies
4. **Streams** - Depends on Users and Categories
5. **Stream-Tags** - Junction table, depends on Streams and Tags
6. **Schedules** - Depends on Users and Categories
7. **Follows** - Depends on Users

---

## 8. Verification Checklist

After seeding, verify these endpoints return data:

| Endpoint | Expected Result |
|----------|-----------------|
| `GET /streams/categories` | Array of 10 categories |
| `GET /streams/categories/popular?limit=8` | `{"categories": [...], "total": 8}` |
| `GET /streams/trending?limit=12` | `{"streams": [...], "total": 6+}` |
| `GET /streams/` | Array of live streams |
| `GET /streams/users/urbantech/profile` | User profile object |
| `GET /streams/users/urbantech/live` | `{"isLive": true, "stream": {...}}` |

---

## 9. Image URLs

All avatar and thumbnail URLs use Pexels images which are free to use. For production, you may want to:

1. Download and host these images on your own CDN
2. Use Cloudflare Images for thumbnails
3. Generate placeholder avatars using services like UI Avatars

### Alternative Avatar Service
```
https://ui-avatars.com/api/?name=UrbanTech&background=5867EF&color=fff
```

---

## 10. Notes for Production

1. **Passwords**: The seed passwords are `demo123456`. For production, use strong randomly generated passwords or remove demo accounts.

2. **Stream Keys**: Generate unique stream keys for each user. Format: `live_<random_32_chars>`

3. **Viewer Counts**: For demo purposes, viewer counts are set statically. In production, these should be 0 for offline streams and updated in real-time.

4. **Timestamps**: Use current timestamps or recent dates for `startedAt` fields on live streams.

5. **Stream Status**: For a "live" demo, set some streams to `status: "live"` with non-null `startedAt` and null `endedAt`.

---

## Support

If you have questions about the expected data formats, refer to:
- `docs/BACKEND_INTEGRATION_GUIDE.md` - Full API reference
- `docs/API_QUICK_REFERENCE.md` - Quick endpoint reference
- `types/index.ts` - TypeScript type definitions

---

**Document Version:** 1.0.0
**Last Updated:** 2025-12-24
