# AniLink Web – Target Source Structure

## Goal
- **Single `src/pages/`** – All page components in one place (no `app/components/pages/`).
- **Single `src/components/`** – All UI, layout, marketing, and feature components (no `app/components/`).
- **Single `src/components/ui/`** – One set of primitives (merge `app/components/ui` and `components/ui`).

## Target layout

```
src/
├── api/
├── assets/
├── components/
│   ├── ui/           # All primitives (button, card, Sheet, Avatar, Tabs, etc.)
│   ├── layout/       # AppShell, PageHeader, PageTransition, Navigation
│   ├── marketing/    # LandingNav, Hero, FeatureCard, FAQAccordion, Footer
│   ├── profile/
│   ├── vets/
│   ├── scan/
│   ├── appointments/
│   ├── records/
│   └── cart/
├── config/
├── data/
├── hooks/
├── lib/
├── pages/            # All page components (HomePage, LoginPage, CartPage, etc.)
├── routes/
├── store/
├── styles/
├── types/
├── utils/
├── App.tsx
└── main.tsx
```

## Changes made
1. Pages: moved from `app/components/pages/` → `pages/` (PascalCase filenames).
2. Marketing: moved from `app/components/marketing/` → `components/marketing/`.
3. Navigation: moved from `app/components/navigation.tsx` → `components/layout/Navigation.tsx`.
4. UI: merged `app/components/ui/` into `components/ui/` (lowercase shadcn names; shared components stay).
5. Removed `app/` folder.
