# Quick Start Guide

Get the Fantasy MMORPG running in minutes!

## Prerequisites

Ensure you have these installed:
- **Node.js 18+** and npm
- **Docker and Docker Compose** (for running PostgreSQL)
- **Go 1.21+** (optional, for game server)

> **Note:** Docker is the recommended way to run PostgreSQL for development. It works consistently across all platforms and doesn't require a separate PostgreSQL installation.

## 🚀 Automated Setup (Recommended)

### Linux/Mac

```bash
# 1. Clone and navigate to the project
git clone <repository-url>
cd ProjectNC

# 2. Run automated setup (installs dependencies and creates .env file)
npm run setup

# 3. Start PostgreSQL in Docker
npm run docker:db:start

# ⏰ IMPORTANT: Wait 5-10 seconds for database to initialize

# 4. Run migrations (creates database tables)
npm run prisma:migrate

# 5. Start services (in 3 separate terminals)
npm run dev:api       # Terminal 1
npm run dev:gameserver # Terminal 2  
npm run dev:frontend   # Terminal 3
```

**⚠️ Common Mistake:** Running `npm run prisma:migrate` before starting the database will cause authentication errors. Always start the database first!

### Windows

```powershell
# 1. Clone and navigate to the project
git clone <repository-url>
cd ProjectNC

# 2. Run automated setup (installs dependencies and creates .env file)
npm run setup:windows

# 3. Start PostgreSQL in Docker
npm run docker:db:start

# ⏰ IMPORTANT: Wait 5-10 seconds for database to initialize

# 4. Run migrations (creates database tables)
npm run prisma:migrate

# 5. Start services (in 3 separate PowerShell windows)
npm run dev:api       # Terminal 1
npm run dev:gameserver # Terminal 2
npm run dev:frontend   # Terminal 3
```

**⚠️ Common Mistake:** Running `npm run prisma:migrate` before starting the database will cause authentication errors. Always start the database first!

## 🎮 Access the Application

Once all services are running:

- **Frontend (Game UI)**: http://localhost:3000
- **API Backend**: http://localhost:4000/api
- **Game Server**: ws://localhost:8080

## 📝 Database Configuration

The Docker setup uses default credentials that are already configured in `packages/api/.env.example`:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/mmorpg?schema=public"
```

**No configuration needed if using Docker!** Just copy the .env.example to .env (the setup script does this automatically).

If you prefer to use a local PostgreSQL installation instead of Docker:
1. Install PostgreSQL 15+
2. Create the database: `createdb mmorpg`
3. Update `packages/api/.env` with your credentials if they differ from the defaults

## ❓ Common Issues

### "Cannot find module" or "Dependencies not installed"

**Solution:** Run the setup script first to install all dependencies:
```bash
# Linux/Mac
npm run setup

# Windows
npm run setup:windows
```

**Note:** The dev commands (`npm run dev:api`, `npm run dev:frontend`) now automatically check if dependencies are installed and will provide clear error messages if they're missing.

### "Could not find Prisma Schema"

**Solution:** Always run Prisma commands from `packages/api` or use npm scripts from root:
```bash
npm run prisma:generate
npm run prisma:migrate
```

### "Cannot find path .env.example"

**Solution:** The .env file should be in `packages/api/`:
```bash
cd packages/api
cp .env.example .env
```

### "Port already in use"

**Solution:** Kill the process using the port:
```bash
# Linux/Mac
lsof -ti:4000 | xargs kill -9

# Windows
netstat -ano | findstr :4000
taskkill /PID <PID> /F
```

### "Authentication failed" (P1000)

**Error:**
```
Error: P1000: Authentication failed against database server at `localhost`
```

**This is THE most common setup error!**

**Solution:** Two things must be in place:

1. **The .env file must exist:**
```bash
# Check if it exists
ls packages/api/.env

# If not, create it
cd packages/api
cp .env.example .env
```

2. **The database must be running:**
```bash
# Start the database
npm run docker:db:start

# Wait 5-10 seconds, then verify
docker ps
```

Then try migrations again:
```bash
npm run prisma:migrate
```

### "Database does not exist" (P1003) or "Can't reach database server" (P1001)

**Solution:** Start the PostgreSQL Docker container:
```bash
npm run docker:db:start

# Wait 5-10 seconds for initialization, then check if it's running
docker ps

# You should see "mmorpg-postgres" in the output

# Run migrations
npm run prisma:migrate
```

If not using Docker, create the database manually:
```bash
createdb mmorpg
```

For more troubleshooting, see [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

## 📚 Next Steps

1. **Create an account** at http://localhost:3000
2. **Create a character** (choose race and class)
3. **Explore the code:**
   - API: `packages/api/src/`
   - Frontend: `packages/frontend/src/`
   - Game Server: `packages/gameserver/`

## 📖 More Documentation

- [README.md](./README.md) - Project overview and architecture
- [DOCKER.md](./DOCKER.md) - Docker database setup guide
- [SETUP.md](./SETUP.md) - Detailed setup instructions
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common issues and solutions

## 🛟 Need Help?

If you encounter issues not covered here:
1. Check the [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) guide
2. Ensure all prerequisites are installed correctly
3. Verify PostgreSQL is running: `pg_isready`
4. Check that all services started without errors

---

**Happy gaming! 🎮**
