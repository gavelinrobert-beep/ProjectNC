# Fantasy MMORPG - 3D Desktop Game

A production-ready, scalable fantasy MMORPG inspired by World of Warcraft, built with modern technologies and clean architecture principles. **This is a 3D desktop game built with Unity**.

## 🏗️ Architecture Overview

This project uses a **monorepo structure** with multiple specialized services:

```
/packages
├── /packages/unity-client - Unity 3D desktop game client (PRIMARY CLIENT) ⭐
├── /packages/api          - NestJS REST API (Authentication, Characters, World)
├── /packages/frontend     - Next.js web interface (Account management, Character select)
├── /packages/gameserver   - Go authoritative game server (Real-time gameplay)
└── /packages/shared       - Shared TypeScript interfaces and protocol definitions
```

### Service Communication Flow

```
┌─────────────┐     HTTP/REST      ┌──────────────┐
│Unity Client │ ◄─────────────────► │   API        │
│   (3D Game) │                     │  (NestJS)    │
└─────────────┘                     └──────────────┘
       │                                   │
       │ WebSocket                         │ PostgreSQL
       │ (Game Events)                     │
       │                                   │
       ▼                                   ▼
┌─────────────┐                     ┌──────────────┐
│ Game Server │                     │  Database    │
│    (Go)     │ ◄───────────────────┤ (PostgreSQL) │
└─────────────┘     Query Players   └──────────────┘

┌─────────────┐     HTTP/REST      
│   Web UI    │ ◄─────────────────► (Optional: Account/Character management)
│  (Next.js)  │                     
└─────────────┘                     
```

**Key Design Principles:**
- **Unity 3D Client**: Desktop game with full 3D rendering, WASD movement, third-person camera ⭐
- **API Backend**: Handles authentication, character management, and persistent data
- **Game Server**: Authoritative server for real-time gameplay (movement, combat, NPCs)
- **Web Frontend**: Optional web interface for account and character management
- **Shared**: Common interfaces ensure type safety across services

## 🚀 Quick Start

> **💡 New to the project?** See [QUICKSTART.md](./QUICKSTART.md) for the fastest way to get up and running!

### Prerequisites
- **Unity 2022.3 LTS or newer** (for the 3D game client) ⭐
- Node.js 18+ and npm (for backend services)
- Go 1.21+ (for game server)
- Docker and Docker Compose (for running PostgreSQL)
- **OR** PostgreSQL 15+ (if not using Docker)

### Automated Setup (Recommended)

**For Linux/Mac:**
```bash
npm run setup
```

**For Windows (PowerShell or Command Prompt):**
```powershell
npm run setup:windows
```

> **💡 Windows Note:** All npm commands are now fully cross-platform compatible! You can use `npm run dev:api`, `npm run dev:frontend`, and `npm run dev:gameserver` directly in Windows without any issues.

This will:
- Install all dependencies for all packages
- Set up the API environment file
- Generate Prisma client
- Provide next steps for database configuration

After running setup, you need to:
1. **Start the database** - See "Database Setup" section below
2. **Run migrations** - `npm run prisma:migrate`
3. **Start services** - See "Starting the Services" section below

### Database Setup

You have two options for running PostgreSQL:

#### Option 1: Docker (Recommended for Development)

This is the easiest option, especially on Windows where PostgreSQL setup can be tricky.

```bash
# Start PostgreSQL in Docker
npm run docker:db:start

# Wait 5-10 seconds for the database to be ready, then run migrations
npm run prisma:migrate

# NOTE: The prisma:migrate command now includes automatic prerequisite checking.
# If you haven't created the .env file or started the database, you'll get
# a clear error message with instructions on how to fix it.
```

The Docker database will be available at `localhost:5432` with the following credentials (already configured in `.env.example`):
- Username: `postgres`
- Password: `password` (⚠️ **for local development only!**)
- Database: `mmorpg`

> **Security Note:** The Docker setup uses a default password for convenience in local development. This is fine for localhost, but never use these credentials in production or any publicly accessible environment. See [DOCKER.md](./DOCKER.md) for more details.

**Docker Database Management Commands:**
- `npm run docker:db:start` - Start the database
- `npm run docker:db:stop` - Stop the database
- `npm run docker:db:restart` - Restart the database
- `npm run docker:db:logs` - View database logs
- `npm run docker:db:reset` - Reset the database (⚠️ **deletes all data!**)

#### Option 2: Local PostgreSQL Installation

If you prefer to install PostgreSQL locally:

1. Install PostgreSQL 15+ for your operating system
2. Create the database:
   ```bash
   createdb -U postgres mmorpg
   ```
3. Update `packages/api/.env` if your credentials differ from the defaults
4. Run migrations:
   ```bash
   npm run prisma:migrate
   ```

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

# Edit .env with your PostgreSQL connection string (if not using Docker defaults)
# Example: DATABASE_URL="postgresql://postgres:password@localhost:5432/mmorpg?schema=public"

# Generate Prisma client
npx prisma generate

# Start PostgreSQL (using Docker)
cd ../..
npm run docker:db:start

# Run Prisma migrations
npm run prisma:migrate
```

**Important:** All Prisma commands must be run from the `packages/api` directory, or use the npm scripts from the root:
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio

### Starting the Services

You need **2 terminal windows** for backend services, then Unity Editor for the game client:

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

**Unity 3D Game Client:**
1. Open Unity Hub
2. Add project: `packages/unity-client`
3. Open the project in Unity 2022.3 LTS or newer
4. Open `LoginScene` and press Play
5. See [packages/unity-client/UNITY_SETUP.md](./packages/unity-client/UNITY_SETUP.md) for detailed setup

**Optional - Web Frontend (for account/character management):**
```bash
npm run dev:frontend
# Runs on http://localhost:3000
```

### Access the Application
- **Unity Game Client**: Desktop application (primary way to play) ⭐
- Web Frontend: http://localhost:3000 (optional)
- API Docs: http://localhost:4000/api
- Game Server: ws://localhost:8080

## 📦 Package Details

### `/packages/unity-client` - Unity 3D Game Client ⭐

**Purpose**: Desktop 3D game client for players (PRIMARY CLIENT)

**Key Systems:**
- **Network Layer**: WebSocket connection with reconnection
- **World Rendering**: 3D terrain, zones, entities
- **Character Control**: WASD movement, third-person camera
- **Combat System**: Visual effects, floating damage text, targeting
- **UI Framework**: HUD, action bars, chat, nameplates
- **Entity Management**: Spawning/despawning, interpolation
- **Animation System**: Character state machine for movement and combat

**Tech Stack:**
- Unity 2022.3 LTS
- C# (22 scripts, ~8000 lines of code)
- NativeWebSocket package
- Server-authoritative architecture

**See**: [packages/unity-client/README.md](./packages/unity-client/README.md) for complete documentation

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

### `/packages/frontend` - Next.js Web Interface (Optional)

**Purpose**: Optional web interface for account and character management

**Key Pages:**
- `/login` - Authentication
- `/character-select` - Choose or create character
- `/game` - Placeholder game view (directs to Unity client)

**Note**: This is a secondary interface. The primary way to play is through the Unity 3D desktop client.

**Tech Stack:**
- Next.js 14+ (App Router)
- React 18+
- TypeScript
- TailwindCSS

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
# From root directory (recommended)
npm run prisma:migrate

# Or from packages/api directory
cd packages/api
npx prisma migrate dev --name description_of_change
npx prisma generate
```

## 🛠️ Troubleshooting

Having issues getting started? Check these resources:

- **[QUICKSTART.md](./QUICKSTART.md)** - Fast setup guide
- **[FEATURES.md](./FEATURES.md)** - New features guide (Quest, Inventory, First Zone)
- **[DOCKER.md](./DOCKER.md)** - Docker database setup guide
- **[SETUP.md](./SETUP.md)** - Detailed setup instructions  
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Common problems and solutions

**Common Issues:**
- "Could not find Prisma Schema" → Use `npm run prisma:generate` from root
- ".env.example not found" → File is in `packages/api/.env.example`
- "Port already in use" → Kill existing processes on ports 3000, 4000, 8080
- "Database connection failed" → Run `npm run docker:db:start` to start PostgreSQL

## 🛣️ Roadmap

### Current Phase: MVP (v0.1) ✅ COMPLETE
- [x] Monorepo structure
- [x] NestJS API with authentication
- [x] Character creation and management
- [x] Next.js frontend with basic UI
- [x] Go game server with entity system
- [x] Basic combat system
- [x] Quest system implementation
- [x] Inventory and equipment system
- [x] First playable zone (Elwynn Forest)

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
