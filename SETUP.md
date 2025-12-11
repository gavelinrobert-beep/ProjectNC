# Fantasy MMORPG - Setup Guide

Complete setup instructions for getting the fantasy MMORPG running locally.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ and npm
- **Go** 1.21+
- **PostgreSQL** 15+
- **Git**

## Quick Start (Development)

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd SYLON

# Install root dependencies and all package dependencies
npm run install:all
```

### 2. Setup Database

```bash
# Create PostgreSQL database
createdb mmorpg

# Or use psql
psql -U postgres
CREATE DATABASE mmorpg;
\q

# Configure database connection
cd packages/api
cp .env.example .env

# Edit .env and set your DATABASE_URL:
# DATABASE_URL="postgresql://postgres:password@localhost:5432/mmorpg?schema=public"
```

### 3. Run Database Migrations

```bash
# From root directory
npm run prisma:migrate

# This will:
# - Create all database tables
# - Generate Prisma client
```

### 4. Start All Services

You'll need **3 terminal windows**:

**Terminal 1 - API Backend (NestJS):**
```bash
npm run dev:api
# Runs on http://localhost:4000
```

**Terminal 2 - Game Server (Go):**
```bash
npm run dev:gameserver
# Runs on ws://localhost:8080
```

**Terminal 3 - Frontend (Next.js):**
```bash
npm run dev:frontend
# Runs on http://localhost:3000
```

### 5. Access the Game

Open your browser and navigate to:
```
http://localhost:3000
```

1. **Create an account** on the registration page
2. **Create a character** (choose race and class)
3. **Enter the game world**

## Package-by-Package Setup

### API Backend (`packages/api`)

```bash
cd packages/api

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Run migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Start development server
npm run start:dev

# Run tests
npm run test
```

**Endpoints:**
- API: http://localhost:4000/api
- Health: http://localhost:4000/api/health

### Frontend (`packages/frontend`)

```bash
cd packages/frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

**Access:**
- Development: http://localhost:3000
- Production: http://localhost:3000 (after build)

### Game Server (`packages/gameserver`)

```bash
cd packages/gameserver

# Download Go dependencies
go mod download

# Run development server
go run cmd/server/main.go

# Build binary
go build -o gameserver cmd/server/main.go

# Run binary
./gameserver
```

**Endpoints:**
- WebSocket: ws://localhost:8080/ws
- Health: http://localhost:8080/health

### Shared Types (`packages/shared`)

```bash
cd packages/shared

# Install dependencies
npm install

# Build TypeScript
npm run build

# Watch mode (auto-rebuild)
npm run watch
```

## Database Management

### View Database with Prisma Studio

```bash
cd packages/api
npx prisma studio
```

Opens a browser interface at http://localhost:5555

### Create a New Migration

```bash
cd packages/api

# Edit prisma/schema.prisma with your changes
# Then run:
npx prisma migrate dev --name your_migration_name
```

### Reset Database

```bash
cd packages/api
npx prisma migrate reset
```

**Warning:** This will delete all data!

## Common Issues & Solutions

### Issue: Port Already in Use

If you see "EADDRINUSE" errors:

```bash
# Find process using port
lsof -ti:4000  # For API
lsof -ti:3000  # For frontend
lsof -ti:8080  # For game server

# Kill process
kill -9 <PID>
```

### Issue: Database Connection Failed

1. Ensure PostgreSQL is running:
```bash
# macOS (Homebrew)
brew services start postgresql

# Linux (systemd)
sudo systemctl start postgresql

# Check status
pg_isready
```

2. Verify DATABASE_URL in `packages/api/.env`

3. Ensure database exists:
```bash
psql -U postgres -l | grep mmorpg
```

### Issue: Prisma Client Not Generated

```bash
cd packages/api
npx prisma generate
```

### Issue: Go Dependencies Not Found

```bash
cd packages/gameserver
go mod tidy
go mod download
```

## Production Deployment

### Build All Packages

```bash
# Build API
npm run build:api

# Build Frontend
npm run build:frontend

# Build Game Server
npm run build:gameserver
```

### Environment Variables for Production

Create `.env.production` in each package:

**API (`packages/api/.env.production`):**
```env
DATABASE_URL="postgresql://user:password@host:5432/mmorpg?schema=public"
JWT_SECRET="your-super-secret-production-key"
JWT_EXPIRATION="24h"
PORT=4000
NODE_ENV=production
```

**Frontend (`packages/frontend/.env.production`):**
```env
NEXT_PUBLIC_API_URL="https://api.yourdomain.com/api"
NEXT_PUBLIC_GAME_SERVER_URL="wss://game.yourdomain.com/ws"
```

### Docker Deployment (Optional)

Create `Dockerfile` in each package for containerized deployment.

Example for API:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
CMD ["npm", "run", "start:prod"]
```

## Testing

### API Tests

```bash
cd packages/api
npm run test          # Unit tests
npm run test:e2e      # End-to-end tests
npm run test:cov      # Coverage report
```

### Frontend Tests

```bash
cd packages/frontend
npm run test
```

### Game Server Tests

```bash
cd packages/gameserver
go test ./...
```

## Development Tips

### Hot Reload

All services support hot reload in development:
- **API**: Automatically reloads on file changes (NestJS)
- **Frontend**: Hot module replacement (Next.js)
- **Game Server**: Use `go run` for automatic rebuilds

### Debugging

**API (NestJS):**
```bash
# Add breakpoints in VS Code
# Use "JavaScript Debug Terminal"
npm run start:dev
```

**Game Server:**
```bash
# Use Delve debugger
go install github.com/go-delve/delve/cmd/dlv@latest
dlv debug cmd/server/main.go
```

### Database Queries

Monitor queries with Prisma:
```typescript
// In packages/api/src/prisma/prisma.service.ts
// Add middleware:
prisma.$use(async (params, next) => {
  const before = Date.now();
  const result = await next(params);
  const after = Date.now();
  console.log(`Query ${params.model}.${params.action} took ${after - before}ms`);
  return result;
});
```

## Next Steps

1. **Explore the code:**
   - API: `packages/api/src/`
   - Frontend: `packages/frontend/src/app/`
   - Game Server: `packages/gameserver/`

2. **Read the documentation:**
   - [README.md](./README.md) - Project overview
   - [API Documentation](http://localhost:4000/api/docs) - When API is running

3. **Extend the game:**
   - Add new abilities in `packages/gameserver/internal/combat/`
   - Create new UI components in `packages/frontend/src/components/`
   - Add API endpoints in `packages/api/src/`

## Support

For issues or questions:
1. Check this setup guide
2. Review the main [README.md](./README.md)
3. Check package-specific READMEs
4. Open an issue on GitHub

---

**Happy coding! 🎮**
