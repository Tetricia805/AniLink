# AniLink Design Reference — Best Practices & Inspiration

**Date:** 2025-02-09  
**Purpose:** Curated design resources for AniLink (vet/agricultural app) — transitions, colors, React components, and inspiration.

---

## 1. Stack You Already Use

| Library | Purpose |
|---------|---------|
| **framer-motion** | Animations, page transitions, layout |
| **Radix UI** | Accessible primitives (Dialog, Dropdown, etc.) |
| **Tailwind CSS** | Utility styling |
| **tw-animate-css** | Slide-in/fade animations for popovers |
| **lucide-react** | Icons |

---

## 2. Transitions & Animations

### Framer Motion (Motion) — Best Practices

**Page transitions with `AnimatePresence`:**

```tsx
import { motion, AnimatePresence } from "framer-motion";

<AnimatePresence mode="wait">
  <motion.div
    key={location.pathname}
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -12 }}
    transition={{ duration: 0.2 }}
  >
    <Outlet />
  </motion.div>
</AnimatePresence>
```

**Card / list stagger:**

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
  viewport={{ once: true }}
>
  {/* content */}
</motion.div>
```

**Shared element transitions (e.g. modal):**

```tsx
<AnimatePresence>
  {isOpen && (
    <motion.div
      layoutId="modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    />
  )}
</AnimatePresence>
```

**Layout animation:**

```tsx
<motion.div layout transition={{ layout: { duration: 0.3 } }}>
  {/* resizes smoothly */}
</motion.div>
```

### shadcn / tw-animate-css

- Use `slide-in-from-top-2`, `slide-in-from-left-2`, etc. for popovers
- Import: `@import "tw-animate-css"` in globals.css
- Tailwind v4: `tw-animate-css` replaces deprecated `tailwindcss-animate`

---

## 3. Color Palettes (Vet / Agricultural Apps)

### Vet app inspiration (Behance, Dribbble)

| Palette | Mood | Use Case |
|---------|------|----------|
| **White + Red accent** | Trust, urgency | Aleef, Petly, Veterna |
| **Green + Natural earth tones** | Health, nature | Agricultural / farm apps |
| **Teal + Warm neutrals** | Calm, professional | Incipet AI Vet |
| **Blue + Soft grays** | Clinical, trustworthy | Most vet apps |

### shadcn theme variables (OKLCH)

```css
:root {
  --primary: oklch(0.21 0.034 264.665);   /* Blue */
  --secondary: oklch(0.967 0.003 264.542);
  --accent: oklch(0.967 0.003 264.542);
  --destructive: oklch(0.577 0.245 27.325);
  --muted: oklch(0.967 0.003 264.542);
  --radius: 0.625rem;
}

.dark {
  /* Invert for dark mode */
}
```

### Suggested AniLink palette

- **Primary:** Teal / green (health, agriculture) — e.g. `oklch(0.55 0.15 165)` 
- **Secondary:** Warm amber for alerts/symptoms
- **Destructive:** Red for FMD/infection alerts
- **Muted:** Neutral grays for backgrounds

---

## 4. Animated UI Libraries (2025)

| Library | Stack | Best For |
|---------|-------|----------|
| **Magic UI** | React, Tailwind, Framer Motion | Landing pages, pairs with shadcn |
| **Aceternity UI** | Next.js, Tailwind, Framer Motion | Hero sections, gradients |
| **Cult UI** | React, Tailwind, shadcn-compatible | Dashboards, dynamic island-style |
| **Hover.dev** | React, Tailwind, Framer Motion | 38+ animated components |
| **Eldora UI** | React, Framer Motion | Clean, versatile animated components |
| **Animata** | React, Tailwind | Bento grids, borders, free MIT |

**Example pattern (Magic UI / Aceternity style):**

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
  className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-800 p-6"
>
  <h2>Section Title</h2>
  <p>Content</p>
</motion.div>
```

---

## 5. Vet App Design Inspiration

### Behance (10,000+ vet app projects)

- **Aleef | Pets Care & Vet Clinic** — 2.1K appreciations, strong UI patterns
- **Petly | Pet Care Mobile App** — Clean, modern
- **Veterna** — Professional vet branding
- **Incipet | AI Vet Startup** — AI-driven UX, Aurora-style gradients
- **Veterinary Mobile App UI Design** — 2.6K views, color: White #FFFFFF, Red #F9B8B8
- **Find & Book Your Vet Instantly** — Booking flow patterns

### Dribbble

- [Veterinary App designs](https://dribbble.com/tags/veterinary-app) — Inspirational UI

### Freepik

- Vet smartphone app design PSDs — Templates for structure

---

## 6. React Component Libraries (General)

| Library | Best For |
|---------|----------|
| **shadcn/ui** | Copy-paste, customizable, Tailwind (already aligned) |
| **Chakra UI** | Accessibility, modular |
| **Mantine** | Themes, hooks, forms |
| **Headless UI** | Unstyled, full control |
| **Next UI** | Tailwind, dark mode, fast |

AniLink already uses Radix (shadcn-style) — continue with that for consistency.

---

## 7. Animation Libraries (React)

| Library | Use Case |
|---------|----------|
| **Motion (Framer Motion)** | Pages, layout, gestures — **already in use** |
| **react-spring** | Physics-based, smooth |
| **GSAP** | Complex timelines, scroll-driven |
| **AutoAnimate** | Zero-config list/item animations |
| **Lottie React** | JSON animations — **already in use** |

---

## 8. Concrete Recommendations for AniLink

### Transitions

1. **Route changes:** Wrap `Outlet` with `AnimatePresence` + `motion.div` (opacity + y).
2. **Modals / sheets:** Use `AnimatePresence` with `exit` for close.
3. **Cards / lists:** `whileInView` with `once: true` for scroll reveals.
4. **Scan results:** Stagger children with `staggerChildren` for conditions/actions.

### Colors

1. Keep primary as teal/green for health/agriculture.
2. Use amber for symptom/urgency states.
3. Use red for FMD/infection.
4. Ensure OKLCH variables for light/dark modes.

### Components

1. Stay with **Radix + Tailwind**.
2. Add **Magic UI** or **Aceternity** components only for hero/landing if needed.
3. Use **Framer Motion** for all custom transitions (already installed).

### Inspiration

1. Study **Aleef** and **Incipet** for vet + AI UX.
2. Use **Behance vet app** projects for color and layout patterns.
3. Keep layout clean and professional; avoid heavy gradients in dashboards.

---

## 9. Quick Links

| Resource | URL |
|----------|-----|
| Motion (Framer) docs | https://motion.dev |
| shadcn/ui | https://ui.shadcn.com |
| Magic UI | https://magicui.design |
| Aceternity UI | https://aceternity.com |
| Behance vet apps | https://www.behance.net/search/projects/vet%20app%20ux%20ui%20design |
| Dribbble veterinary | https://dribbble.com/tags/veterinary-app |
| DEV: Animated UI libs 2025 | https://dev.to/jay_sarvaiya_reactjs/10-trending-animated-ui-component-libraries-2025-edition-1af4 |

---

## 10. AniLink Design System (Applied)

**Shared motion** (`anilink-web/src/lib/motion.ts`):

- **Page header:** `initial={{ opacity: 0, y: 12 }}` → `animate={{ opacity: 1, y: 0 }}`, `transition={{ duration: 0.3 }}`.
- **Stagger:** `staggerContainer` + `staggerItem` for grids/lists (e.g. dashboard stat cards).
- **Scroll section:** `sectionTransition` (whileInView, once).
- **Clickable cards:** Use `cardHoverClass`: `transition-all duration-200 hover:shadow-lg hover:border-primary/40 hover:-translate-y-0.5 active:scale-[0.99]`.

**Applied everywhere:** Farmer home, Records, Appointments, Marketplace; Vet home, Appointments, Cases, Patients, Profile; Seller dashboard, Products, Orders, Payouts, Inventory, Profile; Admin dashboard, Users, Vets, Products, Reports, Settings. Route transitions via `PageTransition.tsx` (AnimatePresence + pathname key).

---

## 11. Next Steps

1. ~~Add `AnimatePresence` for route transitions~~ — Done in `PageTransition.tsx`.
2. ~~Apply motion to dashboards and list pages~~ — Done for Farmer, Vet, Seller, Admin.
3. Refine theme CSS variables (OKLCH) for AniLink brand colors.
4. Optional: Add 1–2 Magic UI or Aceternity components for marketing/landing.
5. Check Behance vet projects for specific screen patterns (booking, records, scan).
