# AINative Studio Live - Frontend Branding & Design Guide

## Overview

This document provides all the information needed to rebrand the current "VibeCode Live" frontend to match the **AINative Studio** design system and brand identity.

**Project:** AINative Studio Live
**URL:** live.ainative.studio
**Repository:** `/Users/ranveerdeshmukh/liveainativestudio`
**Reference Site:** https://www.ainative.studio

---

## Table of Contents

1. [Brand Identity Changes](#1-brand-identity-changes)
2. [Color Scheme Migration](#2-color-scheme-migration)
3. [Typography Changes](#3-typography-changes)
4. [Logo & Assets](#4-logo--assets)
5. [Component Updates](#5-component-updates)
6. [Tailwind Configuration](#6-tailwind-configuration)
7. [CSS Variables](#7-css-variables)
8. [Animation & Effects](#8-animation--effects)
9. [File-by-File Changes](#9-file-by-file-changes)
10. [Quality Checklist](#10-quality-checklist)

---

## 1. Brand Identity Changes

### Name Change

| Current | New |
|---------|-----|
| VibeCode Live | AINative Studio Live |
| VibeCode | AINative |

### Taglines

| Current | New |
|---------|-----|
| "The premier livestreaming platform for developers" | "Live coding streams for AI-native developers" |
| "Vibe Coding" | "AI-Native Development" |

### Domain

| Current | New |
|---------|-----|
| (placeholder) | live.ainative.studio |

### Text Replacements (Global Search & Replace)

```
"VibeCode Live" → "AINative Studio Live"
"VibeCode" → "AINative"
"vibecode" → "ainative" (in URLs, slugs, classes)
"VIBECODE" → "AINATIVE" (in constants)
```

---

## 2. Color Scheme Migration

### Primary Colors

| Role | Current (VibeCode) | New (AINative) | HSL Value |
|------|-------------------|----------------|-----------|
| **Primary** | Neon Green `#34d399` | Brand Purple `#5867EF` | `231 83% 61%` |
| **Secondary** | Neon Blue `#00bfff` | Teal `#338585` | `180 43% 36%` |
| **Accent** | Neon Cyan `#00ffff` | Amber `#FCAE39` | `38 97% 61%` |
| **Accent Secondary** | Purple | Cyan `#22BCDE` | `191 75% 50%` |

### Background Colors

| Role | Current | New | Hex |
|------|---------|-----|-----|
| **Dark 1 (Darkest)** | `hsl(210 40% 5%)` | `#131726` | `--dark-1` |
| **Dark 2 (Cards)** | `hsl(215 35% 8%)` | `#22263c` | `--dark-2` |
| **Dark 3 (Elevated)** | `hsl(215 35% 10%)` | `#31395a` | `--dark-3` |

### Text Colors

| Role | Current | New |
|------|---------|-----|
| **Foreground** | Cyan-tinted white | Pure white `rgba(255,255,255,0.87)` |
| **Muted** | Cyan-muted | Gray `#6B7280` |

### Complete Color Palette

```css
/* AINative Design System Colors */
:root {
  /* Core Brand */
  --brand-primary: #5867EF;      /* Main brand purple */
  --brand-primary-dark: #3955B8; /* Darker purple for hover */

  /* Surface Colors */
  --dark-1: #131726;             /* Darkest background */
  --dark-2: #22263c;             /* Card backgrounds */
  --dark-3: #31395a;             /* Elevated surfaces */

  /* Semantic Colors */
  --primary: #4B6FED;            /* Primary actions */
  --primary-dark: #3955B8;       /* Primary hover */
  --secondary: #338585;          /* Secondary actions */
  --secondary-dark: #1A7575;     /* Secondary hover */
  --accent: #FCAE39;             /* Accent/warning */
  --accent-secondary: #22BCDE;   /* Secondary accent */

  /* Neutral */
  --neutral: #374151;
  --neutral-muted: #6B7280;
  --neutral-light: #F3F4F6;

  /* Status */
  --success: #10B981;            /* Green for live indicator */
  --destructive: #EF4444;        /* Red for errors */
  --warning: #F59E0B;            /* Amber for warnings */
}
```

---

## 3. Typography Changes

### Font Family

| Current | New |
|---------|-----|
| `Inter` (body) | `Poppins` (body) |
| `Fira Code` (headings, mono) | `Poppins` (headings), keep `Fira Code` for code |

### Font Installation

**Remove from `layout.tsx`:**
```tsx
// Remove
import { Inter, Fira_Code } from 'next/font/google';
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const firaCode = Fira_Code({ subsets: ['latin'], variable: '--font-fira-code' });
```

**Add:**
```tsx
import { Poppins, Fira_Code } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins'
});

const firaCode = Fira_Code({
  subsets: ['latin'],
  variable: '--font-fira-code'
});
```

### Typography Scale

```css
/* AINative Typography */
.text-title-1 { font-size: 28px; line-height: 1.2; font-weight: 700; }
.text-title-2 { font-size: 24px; line-height: 1.3; font-weight: 600; }
.text-body { font-size: 14px; line-height: 1.5; }
.text-button { font-size: 12px; line-height: 1.25; font-weight: 500; }
```

---

## 4. Logo & Assets

### Logo Files to Copy

Copy from AINative website to Live frontend:

```bash
# Source: /Users/ranveerdeshmukh/AINative-core/core/AINative-website/public/
# Destination: /Users/ranveerdeshmukh/liveainativestudio/public/

cp AINative-website/public/ainative-icon.svg liveainativestudio/public/
```

### Logo Usage

**Current Navbar Logo:**
```tsx
<div className="w-8 h-8 bg-neon-green rounded flex items-center justify-center">
  <Video className="w-5 h-5 text-primary-foreground" />
</div>
<span className="font-mono text-xl font-bold text-glow-green">
  VibeCode<span className="text-neon-blue">Live</span>
</span>
```

**New Navbar Logo:**
```tsx
<Link href="/" className="flex items-center gap-3">
  <img src="/ainative-icon.svg" alt="AINative Studio Live" className="h-10 w-auto" />
  <span className="text-xl font-bold tracking-tight uppercase flex items-center gap-1">
    <span className="text-white">AI</span>
    <span className="text-[#5867EF]">NATIVE</span>
    <span className="text-neutral-muted text-sm ml-2">LIVE</span>
  </span>
</Link>
```

### Favicon

Create new favicon matching AINative branding:
- Use `ainative-icon.svg` as base
- Generate favicon.ico (16x16, 32x32)
- Generate apple-touch-icon.png (180x180)

---

## 5. Component Updates

### 5.1 Navbar (`components/navbar.tsx`)

**Changes Required:**

1. **Logo:** Replace VibeCode logo with AINative logo
2. **Colors:** Remove neon green/blue glow effects
3. **Styling:** Use AINative button styles

**Before:**
```tsx
<span className="font-mono text-xl font-bold text-glow-green group-hover:text-neon-green">
  VibeCode<span className="text-neon-blue">Live</span>
</span>
```

**After:**
```tsx
<span className="text-xl font-bold tracking-tight uppercase flex items-center gap-1">
  <span className="text-white">AI</span>
  <span className="text-brand-primary">NATIVE</span>
  <span className="text-muted-foreground text-sm ml-2 font-normal">LIVE</span>
</span>
```

### 5.2 Buttons

**Current (Neon glow):**
```tsx
<Button className="font-mono border-glow-green">
```

**New (AINative style):**
```tsx
<Button className="bg-brand-primary hover:bg-primary-dark text-white font-medium">
```

### 5.3 Stream Cards

**Current:**
- Neon green live badge
- Cyan text accents

**New:**
- Purple/brand primary accents
- Success green for live indicator only
- Clean, professional look

### 5.4 Chat Panel

**Current:**
- Neon cyan message highlights
- Green glow effects

**New:**
- Subtle brand primary highlights
- Clean dark theme matching AINative

---

## 6. Tailwind Configuration

### Replace `tailwind.config.ts`

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-poppins)', 'Poppins', 'sans-serif'],
        mono: ['var(--font-fira-code)', 'Fira Code', 'monospace'],
      },
      colors: {
        // AINative Design System
        'dark-1': '#131726',
        'dark-2': '#22263c',
        'dark-3': '#31395a',
        'brand-primary': '#5867EF',

        // Surface aliases
        'surface-primary': '#131726',
        'surface-secondary': '#22263c',
        'surface-accent': '#31395a',

        // Semantic colors
        primary: {
          DEFAULT: '#4B6FED',
          dark: '#3955B8',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#338585',
          dark: '#1A7575',
          foreground: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#FCAE39',
          secondary: '#22BCDE',
          foreground: '#131726',
        },
        neutral: {
          DEFAULT: '#374151',
          muted: '#6B7280',
          light: '#F3F4F6',
        },

        // Component colors (HSL variables)
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',

        // Status colors
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',

        // Chart colors
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
      fontSize: {
        'title-1': ['28px', { lineHeight: '1.2', fontWeight: '700' }],
        'title-2': ['24px', { lineHeight: '1.3', fontWeight: '600' }],
        'body': ['14px', { lineHeight: '1.5' }],
        'button': ['12px', { lineHeight: '1.25', fontWeight: '500' }],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        'ds-sm': '0 2px 4px rgba(19, 23, 38, 0.1), 0 1px 2px rgba(19, 23, 38, 0.06)',
        'ds-md': '0 4px 8px rgba(19, 23, 38, 0.12), 0 2px 4px rgba(19, 23, 38, 0.08)',
        'ds-lg': '0 12px 24px rgba(19, 23, 38, 0.15), 0 4px 8px rgba(19, 23, 38, 0.1)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-glow': {
          '0%, 100%': {
            opacity: '1',
            boxShadow: '0 0 20px rgba(88, 103, 239, 0.3)',
          },
          '50%': {
            opacity: '0.8',
            boxShadow: '0 0 30px rgba(88, 103, 239, 0.5)',
          },
        },
        'live-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'live-pulse': 'live-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
```

---

## 7. CSS Variables

### Replace `app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* AINative Dark Theme (Default) */
    --background: 228 33% 12%;        /* #131726 */
    --foreground: 0 0% 98%;           /* White text */

    --card: 228 27% 18%;              /* #22263c */
    --card-foreground: 0 0% 98%;

    --popover: 228 24% 22%;           /* #31395a */
    --popover-foreground: 0 0% 98%;

    --primary: 231 83% 61%;           /* #5867EF - Brand Purple */
    --primary-foreground: 0 0% 100%;

    --secondary: 180 43% 36%;         /* #338585 - Teal */
    --secondary-foreground: 0 0% 100%;

    --muted: 228 24% 22%;
    --muted-foreground: 220 9% 46%;   /* #6B7280 */

    --accent: 38 97% 61%;             /* #FCAE39 - Amber */
    --accent-foreground: 228 33% 12%;

    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 98%;

    --border: 228 24% 22%;
    --input: 228 24% 22%;
    --ring: 231 83% 61%;              /* Brand Purple */

    --radius: 0.5rem;

    /* Chart Colors */
    --chart-1: 231 83% 61%;           /* Purple */
    --chart-2: 180 43% 36%;           /* Teal */
    --chart-3: 38 97% 61%;            /* Amber */
    --chart-4: 191 75% 50%;           /* Cyan */
    --chart-5: 142 71% 45%;           /* Green */
  }

  .dark {
    /* Same as root - dark mode is default */
    --background: 228 33% 12%;
    --foreground: 0 0% 98%;
    --card: 228 27% 18%;
    --card-foreground: 0 0% 98%;
    --popover: 228 24% 22%;
    --popover-foreground: 0 0% 98%;
    --primary: 231 83% 61%;
    --primary-foreground: 0 0% 100%;
    --secondary: 180 43% 36%;
    --secondary-foreground: 0 0% 100%;
    --muted: 228 24% 22%;
    --muted-foreground: 220 9% 46%;
    --accent: 38 97% 61%;
    --accent-foreground: 228 33% 12%;
    --destructive: 0 62% 31%;
    --destructive-foreground: 0 0% 98%;
    --border: 228 24% 22%;
    --input: 228 24% 22%;
    --ring: 231 83% 61%;
  }
}

@layer base {
  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground font-sans;
    font-feature-settings: "rlig" 1, "calt" 1;
  }

  h1, h2, h3, h4, h5, h6 {
    @apply font-sans font-semibold;
  }

  /* Code/terminal elements keep mono font */
  code, pre, .font-mono {
    @apply font-mono;
  }
}

@layer utilities {
  /* AINative Glow Effects (subtle, purple-based) */
  .glow-primary {
    box-shadow: 0 0 20px rgba(88, 103, 239, 0.3);
  }

  .glow-primary-hover:hover {
    box-shadow: 0 0 30px rgba(88, 103, 239, 0.5);
  }

  /* Live indicator glow (green) */
  .glow-live {
    box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
  }

  /* Text shadows removed - AINative uses clean text */

  /* Scrollbar styling */
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
}
```

---

## 8. Animation & Effects

### Remove These Effects

| Effect | Reason |
|--------|--------|
| `text-glow-green` | Too flashy for AINative brand |
| `text-glow-blue` | Too flashy for AINative brand |
| `border-glow-green` | Replace with subtle `glow-primary` |
| `border-glow-blue` | Replace with subtle `glow-primary` |
| `terminal-blink` | Keep only for actual terminal/code UI |

### Keep/Add These Effects

| Effect | Usage |
|--------|-------|
| `glow-primary` | Subtle purple glow for CTAs |
| `glow-live` | Green glow for live indicator only |
| `animate-pulse` | Standard Tailwind pulse |
| `fade-in` | Page transitions |

### Live Indicator

**Current (Neon):**
```tsx
<div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-0.5 rounded text-xs font-mono animate-pulse text-glow-green">
  LIVE
</div>
```

**New (Clean):**
```tsx
<div className="absolute top-2 left-2 bg-success text-white px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1">
  <span className="w-2 h-2 bg-white rounded-full animate-live-pulse" />
  LIVE
</div>
```

---

## 9. File-by-File Changes

### High Priority Files

| File | Changes |
|------|---------|
| `tailwind.config.ts` | Complete rewrite (see Section 6) |
| `app/globals.css` | Complete rewrite (see Section 7) |
| `app/layout.tsx` | Font imports, metadata, theme class |
| `components/navbar.tsx` | Logo, colors, button styles |
| `components/footer.tsx` | Branding, colors |
| `components/stream-card.tsx` | Remove neon effects, update colors |
| `components/chat-panel.tsx` | Update accent colors |
| `components/stream-player.tsx` | Update live badge, controls |

### Medium Priority Files

| File | Changes |
|------|---------|
| `app/page.tsx` | Update hero, CTAs, colors |
| `app/dashboard/page.tsx` | Update form styling |
| `app/login/page.tsx` | Update form, OAuth buttons |
| `app/register/page.tsx` | Update form, OAuth buttons |
| `components/category-card.tsx` | Update hover states |
| `components/viewer-count-badge.tsx` | Update colors |

### Low Priority Files

| File | Changes |
|------|---------|
| `app/about/page.tsx` | Text content, minor styling |
| `app/vibe-coding/page.tsx` | Rename to "ai-native-development" or update content |
| All page metadata | Update titles, descriptions |

---

## 10. Quality Checklist

### Before Deployment

- [ ] **Branding**
  - [ ] All "VibeCode" text replaced with "AINative"
  - [ ] Logo replaced in navbar and footer
  - [ ] Favicon updated
  - [ ] Meta tags updated (title, description, og:image)

- [ ] **Colors**
  - [ ] No neon green/blue/cyan remaining (except intentional)
  - [ ] Primary purple (#5867EF) used consistently
  - [ ] Dark backgrounds match AINative (#131726, #22263c, #31395a)
  - [ ] Live indicator uses success green (#10B981)

- [ ] **Typography**
  - [ ] Poppins font loading correctly
  - [ ] Headings use Poppins
  - [ ] Code blocks use Fira Code
  - [ ] Font weights match design system

- [ ] **Components**
  - [ ] Buttons use new styles (no glow effects)
  - [ ] Cards match AINative card style
  - [ ] Forms use proper input styling
  - [ ] Hover states are subtle (no flashy effects)

- [ ] **Animations**
  - [ ] Removed neon glow animations
  - [ ] Live pulse animation works
  - [ ] Page transitions smooth

- [ ] **Responsive**
  - [ ] Mobile navbar works
  - [ ] Stream cards resize properly
  - [ ] Chat panel responsive

- [ ] **Accessibility**
  - [ ] Color contrast passes WCAG AA
  - [ ] Focus states visible
  - [ ] Keyboard navigation works

### Testing URLs

After changes, test these pages:
1. `/` - Homepage
2. `/login` - Login page
3. `/register` - Registration page
4. `/dashboard` - Streamer dashboard
5. `/stream/urbantech` - Stream viewer
6. `/user/urbantech` - User profile
7. `/category/ai-coding` - Category page
8. `/search` - Search page

---

## Quick Reference: Color Mappings

| Current Class | Replace With |
|---------------|--------------|
| `bg-neon-green` | `bg-brand-primary` or `bg-success` |
| `bg-neon-blue` | `bg-secondary` or `bg-accent-secondary` |
| `text-neon-green` | `text-brand-primary` or `text-success` |
| `text-neon-blue` | `text-secondary` |
| `text-neon-cyan` | `text-accent-secondary` |
| `border-neon-green` | `border-brand-primary` |
| `text-glow-green` | (remove, use plain text) |
| `text-glow-blue` | (remove, use plain text) |
| `border-glow-green` | `glow-primary` (if needed) |
| `border-glow-blue` | `glow-primary` (if needed) |

---

## Contact

For questions about the design system:
- Reference: https://www.ainative.studio/design-system-showcase
- Design tokens: `/AINative-website/tailwind.config.cjs`

---

**Document Version:** 1.0
**Created:** 2025-12-23
**Last Updated:** 2025-12-23
