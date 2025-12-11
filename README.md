# Fantasy MMORPG - Scalable Game Architecture

A production-ready, scalable fantasy MMORPG inspired by World of Warcraft, built with modern technologies and clean architecture principles.

## 🏗️ Architecture Overview

This project uses a **monorepo structure** with multiple specialized services:

```
/packages
├── /api          - NestJS REST API (Authentication, Characters, World)
├── /frontend     - Next.js React client (Login, Character Select, Game UI)
├── /gameserver   - Go authoritative game server (Real-time gameplay)
└── /shared       - Shared TypeScript interfaces and protocol definitions
```

### Service Communication Flow

```
┌─────────────┐     HTTP/REST      ┌──────────────┐
│   Frontend  │ ◄─────────────────► │   API        │
│  (Next.js)  │                     │  (NestJS)    │
└─────────────┘                     └──────────────┘
       │                                   │
       │                                   │
       │ WebSocket                         │ PostgreSQL
       │ (Game Events)                     │
       │                                   │
       ▼                                   ▼
┌─────────────┐                     ┌──────────────┐
│ Game Server │                     │  Database    │
│    (Go)     │ ◄───────────────────┤ (PostgreSQL) │
└─────────────┘     Query Players   └──────────────┘
```

**Key Design Principles:**
- **API Backend**: Handles authentication, character management, and persistent data
- **Game Server**: Authoritative server for real-time gameplay (movement, combat, NPCs)
- **Frontend**: Thin client that sends input commands and renders game state
- **Shared**: Common interfaces ensure type safety across services

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Go 1.21+
- PostgreSQL 15+
- Docker (optional, for containerized deployment)

### Automated Setup (Recommended)

**For Linux/Mac:**
```bash
npm run setup
```

**For Windows:**
```powershell
npm run setup:windows
```

This will:
- Install all dependencies for all packages
- Set up the API environment file
- Generate Prisma client
- Provide next steps for database configuration

After running setup, you need to:
1. **Configure the database** - Edit `packages/api/.env` with your PostgreSQL connection string
2. **Run migrations** - `npm run prisma:migrate`
3. **Start services** - See "Starting the Services" section below

### Manual Installation

If you prefer to set up manually or need more control:

1. **Install dependencies for all packages:**
```bash
# From root directory
npm run install:all

# Or manually for each package:
cd packages/api && npm install
cd ../frontend && npm install
cd ../shared && npm install
cd ../gameserver && go mod download
```

2. **Set up the database:**
```bash
# Copy environment file
cd packages/api
cp .env.example .env

# Edit .env with your PostgreSQL connection string
# Example: DATABASE_URL="postgresql://postgres:password@localhost:5432/mmorpg?schema=public"

# Generate Prisma client
npx prisma generate

# Run Prisma migrations (ensure PostgreSQL is running)
npx prisma migrate dev
```

**Important:** All Prisma commands must be run from the `packages/api` directory, or use the npm scripts from the root:
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio

### Starting the Services

You need **3 terminal windows** (one for each service):

**Terminal 1 - API Backend:**
```bash
npm run dev:api
# Runs on http://localhost:4000
```

**Terminal 2 - Game Server:**
```bash
npm run dev:gameserver
# Runs on ws://localhost:8080
```

**Terminal 3 - Frontend:**
```bash
npm run dev:frontend
# Runs on http://localhost:3000
```

### Access the Application
- Frontend: http://localhost:3000
- API Docs: http://localhost:4000/api
- Game Server: ws://localhost:8080

## 📦 Package Details

### `/packages/api` - NestJS Backend

**Purpose**: REST API for authentication, character management, and persistent data

**Key Modules:**
- `AuthModule` - JWT-based authentication, account creation
- `CharacterModule` - Character CRUD operations, loading character data
- `WorldModule` - Zone metadata, static game world data
- `GatewayModule` - WebSocket gateway for relaying messages to game server

**Tech Stack:**
- NestJS (TypeScript)
- Prisma ORM
- PostgreSQL
- JWT Authentication
- WebSocket Gateway

**Endpoints:**
- `POST /auth/register` - Create new account
- `POST /auth/login` - Login and get JWT token
- `GET /characters` - List player's characters
- `POST /characters` - Create new character
- `GET /world/zones` - Get zone metadata

### `/packages/frontend` - Next.js Client

**Purpose**: Game client UI for players

**Key Pages:**
- `/login` - Authentication
- `/character-select` - Choose or create character
- `/game` - Main game interface

**Key Components:**
- `HUD` - Health, mana, experience bars
- `ChatWindow` - In-game chat
- `ActionBar` - Ability hotkeys
- `MovementControls` - WASD/Click-to-move overlay
- `Inventory` - Equipment and bag slots
- `QuestLog` - Active quests and objectives

**Tech Stack:**
- Next.js 14+ (App Router)
- React 18+
- TypeScript
- TailwindCSS
- WebSocket client for game server

### `/packages/gameserver` - Go Game Server

**Purpose**: Authoritative real-time game server

**Core Systems:**
- **Networking Layer**: WebSocket server, connection manager, message router
- **Game Loop**: Fixed 20-tick/sec update loop
- **Entity System**: Players, NPCs, monsters with position and state
- **Combat System**: Ability execution, damage calculation, cooldowns
- **Anti-Cheat**: Rate limiting, validation, server authority

**Tech Stack:**
- Go 1.21+
- gorilla/websocket
- ECS-style architecture (Entities, Components, Systems)

**Protocol Messages:**
- `PlayerMove` - Client movement input
- `AttackRequest` - Client ability usage
- `EntityUpdate` - Server state broadcast
- `CombatEvent` - Damage, healing events
- `ChatMessage` - Player communication

### `/packages/shared` - Shared Interfaces

**Purpose**: Type-safe protocol definitions used by all services

**Contents:**
- Protocol message interfaces
- Enums (Race, Class, ItemType)
- Common data structures
- Game constants

## 🎮 Game Features

### Character System
- **Races**: Human, Elf, Dwarf, Orc
- **Classes**: Warrior, Mage, Rogue, Priest
- **Stats**: Strength, Agility, Intellect, Stamina, HP, MP
- **Customization**: Name, appearance options

### Combat System
- **Authoritative Server**: All combat calculated server-side
- **Abilities**: Each class has unique abilities with cooldowns
- **Target System**: Click-to-target, tab-targeting
- **Damage Formula**: Stats + weapon + ability power
- **Threat System**: Aggro management (placeholder for now)

### World & Quests
- **Zones**: Multiple interconnected zones with different levels
- **NPCs**: Quest givers, vendors, trainers
- **Quests**: Kill, collect, and delivery quests
- **Exploration**: Fog of war, discovery experience

### Inventory & Equipment
- **Equipment Slots**: Head, chest, legs, weapon, etc.
- **Bags**: Expandable inventory
- **Item Types**: Armor, weapons, consumables, quest items
- **Rarity**: Common, uncommon, rare, epic, legendary

## 🔧 Development

### Code Standards
- **TypeScript**: Strict mode enabled, no `any` types
- **Go**: Follow effective Go guidelines
- **Architecture**: SOLID principles, clean architecture
- **Comments**: Extensive inline documentation for future features

### Testing
```bash
# API Backend
cd packages/api
npm run test
npm run test:e2e

# Frontend
cd packages/frontend
npm run test

# Game Server
cd packages/gameserver
go test ./...
```

### Database Migrations
```bash
cd packages/api
npx prisma migrate dev --name description_of_change
npx prisma generate
```

## 🛣️ Roadmap

### Current Phase: MVP (v0.1)
- [x] Monorepo structure
- [x] NestJS API with authentication
- [x] Character creation and management
- [x] Next.js frontend with basic UI
- [x] Go game server with entity system
- [x] Basic combat system
- [ ] Quest system implementation
- [ ] Inventory and equipment system
- [ ] First playable zone

### Phase 2: Core Gameplay (v0.2)
- [ ] Multiple zones and seamless transitions
- [ ] Party system
- [ ] Trading between players
- [ ] NPC AI and pathfinding
- [ ] Enhanced combat (buffs, debuffs, dots)

### Phase 3: Social & Guilds (v0.3)
- [ ] Guild system
- [ ] Friends list
- [ ] Whisper and guild chat
- [ ] Mail system
- [ ] Auction house

### Phase 4: Endgame Content (v0.4)
- [ ] Instanced dungeons
- [ ] Raid content
- [ ] PvP battlegrounds
- [ ] Leaderboards and achievements

### Phase 5: Performance & Scale (v0.5)
- [ ] Migrate to binary protocol
- [ ] Zone sharding
- [ ] Horizontal scaling
- [ ] CDN integration
- [ ] Advanced anti-cheat

## 🔒 Security Considerations

- **Authentication**: JWT tokens with short expiry
- **Authorization**: Role-based access control
- **Game Server**: All gameplay authority on server
- **Anti-Cheat**: Rate limiting, input validation, impossible action detection
- **Database**: Prepared statements, Prisma ORM prevents SQL injection
- **WebSocket**: Connection authentication, message validation

## 📚 Future Extensions

This codebase is designed for extensibility. Planned features include:

- **Instancing**: Separate game server instances per dungeon
- **Pathfinding**: A* algorithm for NPC movement
- **AI Behavior Trees**: Complex NPC behaviors
- **Mounts**: Speed boost items with animations
- **Professions**: Crafting, gathering skills
- **Item Procs**: Random on-hit effects
- **Weather System**: Dynamic weather affecting gameplay
- **Day/Night Cycle**: Time-based events and spawns
- **Phasing**: Different world states per player

## 📄 License

MIT License - See LICENSE file for details

## 🤝 Contributing

This is a learning/portfolio project. Contributions welcome!

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests
5. Submit a pull request

---

**Built with ❤️ for MMO enthusiasts**
