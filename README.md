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
| [Zustand](https://zustand-demo.pmnd.rs/) *(optionnel)* | Gestion d’état légère |
| [Zod](https://zod.dev/) | Validation et schémas de données |

---

## 🏗️ Structure du projet

techdoc-builder/
├─ app/                     # Routing principal (Next.js App Router)
│ ├─ (marketing)/           # Pages publiques
│ ├─ (auth)/                # Authentification (login/register)
│ ├─ (app)/                 # Espace connecté
│ │ ├─ dashboard/
│ │ └─ projects/
│ ├─ layout.tsx             # Layout racine
│ ├─ globals.css            # Styles globaux
│ └─ not-found.tsx          # Page 404
│
├─ features/                # Dossiers métiers (feature-based)
│ ├─ auth/
│ │ ├─ components/
│ │ ├─ hooks/
│ │ ├─ services/
│ │ └─ types.ts
│ ├─ projects/
│ └─ documents/
│
├─ components/              # UI réutilisable
│ ├─ ui/                    # Design system (bouton, input, card, etc.)
│ ├─ layout/                # Layout global (header, sidebar)
│ └─ charts/                # Composants graphiques
│
├─ lib/                     # Utilitaires framework/infra
│ ├─ supabaseClient.ts      # Configuration Supabase (client/SSR)
│ ├─ fetcher.ts             # Wrapper fetch API
│ ├─ env.ts                 # Validation des variables d’env
│ └─ logger.ts
│
├─ server/                  # Server actions & services backend
│ ├─ actions/               # Actions server-side (mutations)
│ └─ services/              # Appels DB / API externes
│
├─ store/                   # État global (Zustand ou Jotai)
│
├─ hooks/                   # Hooks réutilisables (useMediaQuery, etc.)
│
├─ utils/                   # Fonctions pures utilitaires
│ ├─ cn.ts                  # Helper className()
│ └─ date.ts
│
├─ styles/                  # Feuilles de style additionnelles
│
├─ public/                  # Fichiers statiques (images, icons)
│
├─ types/                   # Types globaux
│
├─ .env                     # Variables d’environnement
├─ .env.example             # Example de variables d’environnement
├─ tailwind.config.ts
├─ postcss.config.js
├─ next.config.ts
├─ tsconfig.json
└─ package.json

## ⚙️ Scripts NPM

| Commande | Description |
|-----------|-------------|
| `npm run dev` | Lance le serveur de dev |
| `npm run build` | Compile le projet pour la prod |
| `npm run start` | Démarre le serveur en mode prod |
| `npm run lint` | Analyse le code (ESLint) |

## 🔑 Variables d’environnement

Créer un fichier `.env` à la racine en suivant la structure dans .env.example