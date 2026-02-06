# TaskQuest Web v1.5

A gamified task management web application where completing tasks earns you XP, levels, classes, skills, achievements, and more. Built with React + Express and powered by Discord authentication.

Users can also access TaskQuest through the **TaskQuest Discord Bot** — authenticate via Discord and your progress syncs between the bot and the web app.

---

## Features

- **Task Management** — Create lists with categories, priorities, and deadlines. Add items, mark them complete, and track your progress.
- **XP & Leveling** — Earn XP for every action. Level up automatically as you accumulate XP.
- **7 Unique Classes** — DEFAULT, HERO, GAMBLER, ASSASSIN, WIZARD, ARCHER, TANK — each with distinct XP mechanics and playstyles.
- **Skill Trees** — Unlock and upgrade class-specific skills that boost your XP multipliers, add flat bonuses, and grant crit chances.
- **Achievements** — Milestone-based badges awarded for reaching goals.
- **Daily Rewards** — Claim daily XP with streak bonuses (up to +50 bonus XP).
- **Mini-Games** — Blackjack, Rock-Paper-Scissors, Hangman, Snake, Dino Runner, and Space Invaders. Win XP or bet it for bigger rewards.
- **Leaderboard** — Compete globally against other players ranked by XP.
- **Discord OAuth** — Log in with your Discord account. No separate registration needed.
- **Responsive UI** — Works on desktop, tablet, and mobile.

---

## Discord Bot Integration

TaskQuest is also available as a **Discord bot**. Your account is linked via your Discord ID, so progress is shared between the bot and the web app.

**How it works:**

1. Use the TaskQuest bot in any Discord server where it's installed.
2. The bot authenticates you through your Discord account automatically.
3. Tasks, XP, classes, skills, achievements, and leaderboard data all sync — anything you do in the bot reflects on the web app and vice versa.
4. The web app uses Discord OAuth2 to log you in, connecting to the same database and user profile as the bot.

This means you can manage tasks from Discord when it's convenient, and switch to the full web dashboard for a richer experience whenever you want.

---

## Tech Stack

| Layer      | Technology                                              |
|------------|---------------------------------------------------------|
| Frontend   | React 18, Vite, TypeScript, TailwindCSS, Framer Motion |
| UI         | Radix UI, Recharts, Lucide Icons                        |
| Backend    | Node.js, Express, express-session                       |
| Database   | MySQL (Aiven cloud or local XAMPP)                      |
| Auth       | Discord OAuth2                                          |
| Deployment | Render.com                                              |

---

## Prerequisites

- **Node.js** >= 18.0.0
- **npm**
- **MySQL** database (local via XAMPP, or cloud via Aiven/PlanetScale/Railway)
- **Discord Application** — create one at the [Discord Developer Portal](https://discord.com/developers/applications)

---

## Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd taskquest-web
```

### 2. Install dependencies

```bash
# Install frontend + backend dependencies
npm install
```

The server dependencies in `server/package.json` are also included in the root `package.json`, so a single install covers everything.

### 3. Set up your Discord Application

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications).
2. Create a new application (or use your existing TaskQuest bot application).
3. Go to **OAuth2 > General**.
4. Copy your **Client ID** and **Client Secret**.
5. Add a redirect URL:
   - For local development: `http://localhost:3001/api/auth/callback`
   - For production: `https://your-backend-url.onrender.com/api/auth/callback`

### 4. Configure environment variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

**Required variables:**

```env
# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:8080
SESSION_SECRET=generate-a-random-string-at-least-32-characters

# Discord OAuth (from Developer Portal)
DISCORD_CLIENT_ID=your-client-id
DISCORD_CLIENT_SECRET=your-client-secret
DISCORD_REDIRECT_URI=http://localhost:3001/api/auth/callback

# Database — Option A: Connection URL (recommended for cloud)
DB_URL=mysql://user:password@host:port/database?ssl-mode=REQUIRED

# Database — Option B: Individual settings (for local XAMPP)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=taskquest_bot

# Frontend (used by Vite at build time)
VITE_API_URL=http://localhost:3001
```

### 5. Set up the database

Make sure your MySQL database is running and the database/tables exist. If you're using the TaskQuest Discord bot, you likely already have the database set up — the web app connects to the same one.

### 6. Run the development servers

You need **two terminals**:

```bash
# Terminal 1 — Frontend (Vite dev server on port 8080)
npm run dev

# Terminal 2 — Backend (Express API on port 3001)
npm run dev:server
```

### 7. Open the app

Go to **http://localhost:8080** and click **Login with Discord**.

---

## Available Scripts

| Command              | Description                                |
|----------------------|--------------------------------------------|
| `npm run dev`        | Start frontend dev server (port 8080)      |
| `npm run dev:server` | Start backend with auto-reload (port 3001) |
| `npm run build`      | Production build of the frontend           |
| `npm run build:dev`  | Development build with source maps         |
| `npm run preview`    | Preview the production build locally       |
| `npm run server`     | Start the backend server                   |
| `npm run start`      | Alias for `npm run server`                 |
| `npm run lint`       | Run ESLint                                 |

---

## Project Structure

```
taskquest-web/
├── src/                        # Frontend (React + TypeScript)
│   ├── main.tsx                # App entry point
│   ├── App.tsx                 # Route definitions
│   ├── index.css               # Global styles
│   ├── pages/                  # Page components
│   │   ├── Dashboard.tsx       # Main dashboard with stats & daily rewards
│   │   ├── Tasks.tsx           # Task list management
│   │   ├── Classes.tsx         # Class selection & purchase
│   │   ├── Skills.tsx          # Skill tree progression
│   │   ├── Achievements.tsx    # Achievement badges
│   │   ├── Leaderboard.tsx     # Global XP rankings
│   │   ├── Games.tsx           # Mini-games hub
│   │   ├── Profile.tsx         # User profile & stats
│   │   ├── Settings.tsx        # User preferences
│   │   └── NotFound.tsx        # 404 page
│   ├── components/
│   │   ├── game/               # Game-specific UI (XP bars, stat cards, etc.)
│   │   ├── layout/             # Dashboard layout & navigation
│   │   └── ui/                 # Radix-based UI components
│   ├── contexts/
│   │   └── AuthContext.tsx      # Discord auth state management
│   ├── hooks/
│   │   └── useApi.ts           # React Query API hooks
│   └── lib/
│       ├── api.ts              # API client with all endpoint functions
│       └── utils.ts            # Utility functions
├── server/                     # Backend (Express)
│   ├── index.js                # Main server, routes, and middleware
│   ├── db.js                   # MySQL connection pool & queries
│   ├── gameLogic.js            # XP calculations & class mechanics
│   ├── gameData.js             # Class, skill, and achievement definitions
│   └── .env.example            # Server env template
├── public/                     # Static assets
├── .env.example                # Root env template
├── package.json                # Dependencies & scripts
├── vite.config.ts              # Vite configuration
├── tailwind.config.ts          # TailwindCSS configuration
├── tsconfig.json               # TypeScript configuration
├── render.yaml                 # Render.com deployment blueprint
└── index.html                  # HTML entry point
```

---

## API Endpoints

All endpoints (except those marked public) require authentication via session cookie.

### Auth
| Method | Endpoint              | Description                  |
|--------|-----------------------|------------------------------|
| GET    | `/api/auth/discord`   | Start Discord OAuth flow     |
| GET    | `/api/auth/callback`  | OAuth callback handler       |
| GET    | `/api/auth/me`        | Get current logged-in user   |
| POST   | `/api/auth/logout`    | Log out and destroy session  |

### User
| Method | Endpoint           | Description              |
|--------|--------------------|--------------------------|
| GET    | `/api/user`        | Get user profile         |
| PATCH  | `/api/user`        | Update user settings     |
| POST   | `/api/user/daily`  | Claim daily reward       |
| POST   | `/api/user/reset`  | Reset all progress       |

### Lists & Items
| Method | Endpoint                       | Description            |
|--------|--------------------------------|------------------------|
| GET    | `/api/lists`                   | Get all lists          |
| POST   | `/api/lists`                   | Create a new list      |
| GET    | `/api/lists/:id`               | Get list with items    |
| PATCH  | `/api/lists/:id`               | Update a list          |
| DELETE | `/api/lists/:id`               | Delete a list          |
| POST   | `/api/lists/:listId/items`     | Add item to list       |
| PATCH  | `/api/items/:id`               | Update an item         |
| PATCH  | `/api/items/:id/toggle`        | Toggle item completion |
| DELETE | `/api/items/:id`               | Delete an item         |

### Classes & Skills
| Method | Endpoint                    | Description            |
|--------|-----------------------------|------------------------|
| GET    | `/api/classes`              | Get classes + ownership|
| POST   | `/api/classes/:key/buy`     | Purchase a class       |
| POST   | `/api/classes/:key/equip`   | Equip a class          |
| GET    | `/api/skills`               | Get skill trees        |
| POST   | `/api/skills/:skillId/unlock` | Unlock/upgrade skill |

### Games, Achievements & Leaderboard
| Method | Endpoint               | Description              |
|--------|------------------------|--------------------------|
| GET    | `/api/achievements`    | Get achievements         |
| GET    | `/api/games/history`   | Get game history         |
| POST   | `/api/games/result`    | Record game result       |
| GET    | `/api/leaderboard`     | Get top 10 (public)      |
| GET    | `/api/xp/history`      | Get XP transaction log   |

### Static Data (public)
| Method | Endpoint                  | Description              |
|--------|---------------------------|--------------------------|
| GET    | `/api/data/classes`       | Class definitions        |
| GET    | `/api/data/skills`        | Skill tree definitions   |
| GET    | `/api/data/achievements`  | Achievement definitions  |
| GET    | `/api/health`             | Health check             |

---

## Deployment (Render.com)

The project includes a `render.yaml` blueprint for Render.com.

### Backend — Web Service

| Setting       | Value                |
|---------------|----------------------|
| Runtime       | Node                 |
| Build Command | `npm install`        |
| Start Command | `npm run server`     |
| Health Check  | `/api/health`        |

Set these environment variables in the Render dashboard:

- `NODE_ENV` = `production`
- `PORT` = `3001`
- `FRONTEND_URL` = your frontend static site URL
- `SESSION_SECRET` = auto-generated or your own 32+ char string
- `DISCORD_CLIENT_ID`
- `DISCORD_CLIENT_SECRET`
- `DISCORD_REDIRECT_URI` = `https://your-backend.onrender.com/api/auth/callback`
- `DB_URL` = your MySQL connection string

### Frontend — Static Site

| Setting           | Value                       |
|-------------------|-----------------------------|
| Build Command     | `npm install && npm run build` |
| Publish Directory | `dist`                      |

Set this environment variable:

- `VITE_API_URL` = your backend web service URL

### Important

- Update your Discord application's redirect URL in the Developer Portal to match your production backend URL.
- Make sure `FRONTEND_URL` on the backend matches your static site URL exactly (for CORS and redirects).

---

## License

MIT
