# 🧱 Tech Doc Builder – Frontend

**Tech Doc Builder** est une application web construite avec **Next.js (App Router)**, **TailwindCSS** et **TypeScript**, visant à automatiser la création et la gestion de documents techniques.

---

## 🚀 Stack Technique

| Outil | Rôle |
|--------|------|
| [Next.js 14+](https://nextjs.org/) | Framework React (App Router, Server Actions, SSR) |
| [TailwindCSS v4](https://tailwindcss.com/) | Design system utilitaire |
| [Supabase](https://supabase.com/) *(optionnel)* | Authentification & base de données hébergée |
| [TypeScript](https://www.typescriptlang.org/) | Typage statique |
| [shadcn/ui](https://ui.shadcn.com/) | Composants UI réutilisables |

---

## 🏗️ Structure du projet

techdoc-builder/
├─ components.json
├─ eslint.config.mjs
├─ next-env.d.ts
├─ next.config.ts
├─ package.json
├─ postcss.config.mjs
├─ README.md
├─ roadmap.md
├─ tsconfig.json
├─ public/                  # Fichiers statiques (images, icons)
├─ src/
│ ├─ proxy.ts
│ ├─ app/                   # Routing principal (Next.js App Router)
│ │ ├─ globals.css          # Styles globaux
│ │ ├─ layout.tsx           # Layout racine
│ │ ├─ not-found.tsx        # Page 404
│ │ ├─ page.tsx             # Page racine
│ │ └─ (app)/               # Espace connecté
│ │   ├─ layout.tsx
│ │   ├─ dashboard/
│ │   │ └─ page.tsx
│ │   └─ projects/
│ │     ├─ page.tsx
│ │     └─ [id]/
│ │       └─ page.tsx
│ ├─ (auth)/                # Authentification (login/register)
│ │ ├─ login/
│ │ │ └─ page.tsx
│ │ └─ register/
│ │   └─ page.tsx
│ ├─ components/            # UI réutilisable
│ │ ├─ charts/
│ │ ├─ dashboard/
│ │ │ ├─ Sidebar.tsx
│ │ │ └─ Topbar.tsx
│ │ ├─ layout/
│ │ └─ ui/                  # Design system (shadcn/ui)
│ ├─ features/              # Dossiers métiers (feature-based)
│ │ ├─ auth/
│ │ │ ├─ components/
│ │ │ ├─ hooks/
│ │ │ ├─ services/          # authService.ts, tokenService.ts
│ │ │ └─ types/
│ │ ├─ documents/           # types.ts, components/, hooks/, services/
│ │ └─ projects/            # types.ts, components/, hooks/, services/
│ ├─ hooks/                 # Hooks réutilisables
│ │ ├─ useDebounce.ts
│ │ └─ useMediaQuery.ts
│ ├─ lib/                   # Utilitaires framework/infra
│ │ ├─ env.ts               # Validation des variables d’env
│ │ ├─ fetcher.ts           # Wrapper fetch API
│ │ ├─ logger.ts
│ │ ├─ pointMeta.ts
│ │ ├─ rules.ts
│ │ ├─ supabaseClient.browser.ts  # Client Supabase côté navigateur
│ │ ├─ supabaseClient.server.ts   # Client Supabase côté serveur
│ │ ├─ utils.ts
│ │ └─ zod.ts
│ ├─ public/
│ │ └─ icons/
│ ├─ server/                # Server Actions & services backend
│ │ ├─ actions/
│ │ │ ├─ authActions.ts
│ │ │ └─ projectActions.ts
│ │ └─ services/
│ │   └─ projectService.ts
│ ├─ store/
│ │ └─ settings.store.ts
│ ├─ styles/
│ │ ├─ tailwind.css
│ │ └─ tokens.css
│ ├─ types/
│ │ └─ globals.d.ts
│ └─ utils/                 # Fonctions utilitaires pures
│   ├─ cm.ts
│   ├─ date.ts
│   ├─ exportCsv.js
│   ├─ exportPdf.js
│   └─ generation.js

## ⚙️ Scripts NPM

| Commande | Description |
|-----------|-------------|
| `npm run dev` | Lance le serveur de dev |
| `npm run build` | Compile le projet pour la prod |
| `npm run start` | Démarre le serveur en mode prod |
| `npm run lint` | Analyse le code (ESLint) |

## 🔑 Variables d’environnement

Pour configurer l’application, créez un fichier `.env` à la racine du projet en vous inspirant de `.env.example`. 
Ce fichier est destiné uniquement à un usage local/développement.

```
NEXT_PUBLIC_SUPABASE_URL=https://sonhxzxofsfdytwxmlee.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvbmh4enhvZnNmZHl0d3htbGVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMjAzNjEsImV4cCI6MjA3Njg5NjM2MX0.XBTZX2DGgq1NEOzDlaCi5uMXEg_-r43ii_yReudaUeY

# Logger
NODE_ENV=development
NEXT_PUBLIC_LOG_LEVEL=info
LOG_LEVEL=info
```

## 🎯 Choix techniques (principaux)

- Next.js App Router avec Server Components et Server Actions pour limiter le boilerplate API et optimiser le SSR/streaming.
- Auth & données via Supabase (clients séparés `browser`/`server` pour éviter les fuites de clés et améliorer DX SSR).
- UI avec Tailwind v4 (fichier `styles/tailwind.css`) et composants shadcn/ui pour accélérer la livraison tout en restant accessible.
- Validation avec Zod et utilitaires centralisés dans `src/lib` (fetcher typé, logger, règles, mapping `pointMeta`).
- Découpage feature-based dans `src/features/*` pour l’évolutivité et l’isolation métier.
- État local léger et store global `src/store/settings.store.ts` pour les préférences.

## ⚠️ Limites connues / Trade-offs

- Dépendance à Supabase: fonctionnement offline limité, quotas/rate-limit côté free tier.
- Edge/SSR: certaines APIs côté navigateur seulement; bien utiliser `supabaseClient.server.ts` vs `browser.ts`.
- Tests: suite de tests limitée à ce stade; à renforcer (unitaires sur lib, e2e sur flux critiques).

## ⏱️ Estimation et planning

- Socle (setup, routing, UI, auth de base): 6–10 h
- Projets (CRUD, liste, détails, filtres, hooks): 8–14 h
- Documents (génération PDF/CSV, templates): 8–16 h
- Tableau de bord (widgets, graphiques): 6–10 h
- Qualité (tests, perf, a11y, CI): 6–12 h

Hypothèses: 1 dev, design existant, Supabase prêt. Les estimations varient selon périmètre exact et complexité métier.

## 🕛 Durée de travail
La conception ainsi que le développement de l'application ont duré 7,5 heures pour l’initialisation et le socle actuel.