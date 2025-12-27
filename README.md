# 🌐 TaskQuest Web App

A gamified task management web application with Discord authentication.

## Features

- 🎮 **Gamification**: XP, levels, achievements, classes, skill trees
- 📋 **Task Management**: Lists, tasks, categories, priorities, deadlines
- 🎰 **Mini-games**: Blackjack, Rock-Paper-Scissors, Hangman
- 🏆 **Leaderboards**: Compete with other users
- 🔐 **Discord OAuth**: Login with Discord account
- 📱 **Responsive**: Works on mobile, tablet, and desktop

## Tech Stack

- **Frontend**: React, Vite, TailwindCSS, Framer Motion
- **Backend**: Node.js, Express
- **Database**: MySQL (Aiven compatible)
- **Auth**: Discord OAuth2

## Quick Start (Local Development)

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

### 3. Run Development Servers

```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend  
npm run dev:server
```

Visit `http://localhost:5173`

## Deployment (Render.com)

### Backend API (Web Service)

```
Build Command: npm install
Start Command: npm run server
```

Environment variables needed:
- `NODE_ENV=production`
- `FRONTEND_URL` - Your frontend URL
- `SESSION_SECRET` - Random string
- `DISCORD_CLIENT_ID`
- `DISCORD_CLIENT_SECRET`
- `DISCORD_REDIRECT_URI`
- `DB_URL` - Aiven MySQL connection string

### Frontend (Static Site)

```
Build Command: npm install && npm run build
Publish Directory: dist
```

Environment variables:
- `VITE_API_URL` - Your backend URL

## Project Structure

```
├── src/                 # Frontend React app
├── server/              # Backend Express API
├── package.json
└── .env.example
```

## License

MIT
