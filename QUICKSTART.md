# Quick Start Guide

Get the Fantasy MMORPG running in minutes!

## Prerequisites

Ensure you have these installed:
- **Node.js 18+** and npm
- **PostgreSQL 15+**
- **Go 1.21+** (optional, for game server)

## 🚀 Automated Setup (Recommended)

### Linux/Mac

```bash
# 1. Clone and navigate to the project
git clone <repository-url>
cd ProjectNC

# 2. Run automated setup
npm run setup

# 3. Configure database (edit packages/api/.env)
# Change the DATABASE_URL to match your PostgreSQL setup

# 4. Create database
createdb mmorpg

# 5. Run migrations
npm run prisma:migrate

# 6. Start services (in 3 separate terminals)
npm run dev:api       # Terminal 1
npm run dev:gameserver # Terminal 2  
npm run dev:frontend   # Terminal 3
```

### Windows

```powershell
# 1. Clone and navigate to the project
git clone <repository-url>
cd ProjectNC

# 2. Run automated setup
npm run setup:windows

# 3. Configure database (edit packages\api\.env)
# Change the DATABASE_URL to match your PostgreSQL setup

# 4. Create database (in psql or pgAdmin)
# CREATE DATABASE mmorpg;

# 5. Run migrations
npm run prisma:migrate

# 6. Start services (in 3 separate PowerShell windows)
npm run dev:api       # Terminal 1
npm run dev:gameserver # Terminal 2
npm run dev:frontend   # Terminal 3
```

## 🎮 Access the Application

Once all services are running:

- **Frontend (Game UI)**: http://localhost:3000
- **API Backend**: http://localhost:4000/api
- **Game Server**: ws://localhost:8080

## 📝 Default Database Configuration

Edit `packages/api/.env` to configure your database:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/mmorpg?schema=public"
```

Replace:
- `postgres` - with your PostgreSQL username
- `password` - with your PostgreSQL password
- `localhost` - with your database host (if remote)
- `5432` - with your PostgreSQL port (if different)

## ❓ Common Issues

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

### "Database does not exist"

**Solution:** Create the database first:
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
