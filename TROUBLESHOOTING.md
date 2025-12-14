# Troubleshooting Guide

Common issues and solutions for setting up and running the Fantasy MMORPG.

## 🚨 Most Common Issues

If you're experiencing one of these common problems, jump directly to the solution:

1. **[Authentication failed against database server](#authentication-error)** - "P1000: Authentication failed"
   - **Quick Fix**: Ensure `.env` file exists in `packages/api/` AND database is running
   
2. **[Database does not exist](#database-does-not-exist)** - "P1003: Database `mmorpg` does not exist"
   - **Quick Fix**: Run `npm run docker:db:start` to start the database

3. **[Can't reach database server](#connection-error-cant-reach-database-server)** - "P1001: Can't reach database server"
   - **Quick Fix**: Start PostgreSQL with `npm run docker:db:start`

4. **[Could not find Prisma Schema](#error-could-not-find-prisma-schema)** - Schema not found
   - **Quick Fix**: Use `npm run prisma:migrate` from root directory

---

## ✅ Windows Compatibility Update

**Good news for Windows users!** The project npm scripts have been updated to be fully cross-platform compatible. You can now use all `npm run` commands (like `npm run dev:api`, `npm run dev:frontend`, `npm run dev:gameserver`) directly in Windows Command Prompt or PowerShell without any issues.

If you previously encountered errors with commands not working on Windows, those should now be resolved. Simply use:
- `npm run setup:windows` - Initial setup
- `npm run dev:api` - Start API server
- `npm run dev:frontend` - Start frontend
- `npm run dev:gameserver` - Start game server

## Table of Contents
- [Setup Issues](#setup-issues)
- [Database Issues](#database-issues)
- [Prisma Issues](#prisma-issues)
- [Development Server Issues](#development-server-issues)
- [Build Issues](#build-issues)

---

## Setup Issues

### Error: "Could not find Prisma Schema"

**Error Message:**
```
Error: Could not find Prisma Schema that is required for this command.
You can either provide it with `--schema` argument, set it as `prisma.schema` in your package.json or put it into the default location.
```

**Cause:** Running Prisma commands from the wrong directory.

**Solution:**

The Prisma schema is located in `packages/api/prisma/schema.prisma`. You have three options:

**Option 1 (Recommended):** Use npm scripts from the root directory:
```bash
# From root directory
npm run prisma:generate
npm run prisma:migrate
npm run prisma:studio
```

**Option 2:** Navigate to the API package:
```bash
cd packages/api
npx prisma generate
npx prisma migrate dev
```

**Option 3:** Use the --schema flag:
```bash
npx prisma generate --schema=packages/api/prisma/schema.prisma
npx prisma migrate dev --schema=packages/api/prisma/schema.prisma
```

### Error: "Cannot find path '.env.example'"

**Error Message:**
```
cp : Cannot find path 'C:\Users\...\ProjectNC\.env.example' because it does not exist.
```

**Cause:** The `.env.example` file is in the API package, not the root directory.

**Solution:**

Navigate to the API package first:
```bash
cd packages/api
cp .env.example .env
```

Or on Windows PowerShell:
```powershell
cd packages\api
Copy-Item .env.example .env
```

**Note:** The root directory now has a `.env.example` file for guidance, but the actual configuration should be in `packages/api/.env`.

### Setup script fails on Windows

**Error:** Execution policy prevents running scripts.

**Solution:**

Run PowerShell as Administrator and execute:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then run the setup script:
```powershell
npm run setup:windows
```

---

## Database Issues

### PostgreSQL Not Installed or Command Not Found

**Error Message:**
```
createdb : The term 'createdb' is not recognized as the name of a cmdlet, function, script file, or operable program.
```

**Solution (Recommended): Use Docker**

Instead of installing PostgreSQL locally, use Docker to run the database:

```bash
# Start PostgreSQL in Docker
npm run docker:db:start

# Verify it's running
docker ps

# You should see a container named "mmorpg-postgres"
```

Then run migrations:
```bash
npm run prisma:migrate
```

The Docker setup:
- Automatically creates the database
- Uses default credentials (already configured in `.env.example`)
- Works consistently across all operating systems
- Doesn't require PostgreSQL installation

**Alternative: Install PostgreSQL Locally**

If you prefer not to use Docker:
- **Windows**: Download from https://www.postgresql.org/download/windows/
- **macOS**: `brew install postgresql@15`
- **Linux**: Use your package manager (e.g., `apt install postgresql-15`)

### Connection Error: "Can't reach database server"

**Error Message:**
```
Error: P1001: Can't reach database server at `localhost:5432`
```

**Cause:** PostgreSQL is not running or is running on a different port.

**Solution:**

**If using Docker (recommended):**
```bash
# Check if the container is running
docker ps

# If not running, start it
npm run docker:db:start

# Check logs for any issues
npm run docker:db:logs
```

**If using local PostgreSQL:**

1. **Check if PostgreSQL is running:**

   **Linux (systemd):**
   ```bash
   sudo systemctl status postgresql
   sudo systemctl start postgresql
   ```

   **macOS (Homebrew):**
   ```bash
   brew services list
   brew services start postgresql
   ```

   **Windows:**
   - Check Services app for "postgresql" service
   - Or use `pg_ctl status`

2. **Verify the port:**
   ```bash
   # Check which port PostgreSQL is listening on
   psql -U postgres -c "SHOW port;"
   ```

3. **Update your connection string in `packages/api/.env`:**
   ```
   DATABASE_URL="postgresql://postgres:password@localhost:5432/mmorpg?schema=public"
   ```

### Authentication Error

**Error Message:**
```
Error: P1000: Authentication failed against database server at `localhost`, 
the provided database credentials for `postgres` are not valid.

Please make sure to provide valid database credentials for the database server at `localhost`.
```

**This is one of the MOST COMMON errors when setting up the project!**

**Root Causes:**
1. Missing `.env` file in `packages/api/` directory
2. Database container/service not running
3. Incorrect or conflicting `.env` file in root directory (now fixed)
4. Incorrect database credentials (less common)

**Note:** As of the latest update, the Prisma commands have been improved to explicitly load environment variables from `packages/api/.env`, which prevents conflicts with root-level `.env` files.

**Solution Steps:**

**Step 1: Check if .env file exists**
```bash
# Check if the file exists
ls packages/api/.env

# If not found, create it:
cd packages/api
cp .env.example .env
```

**Step 2: Start the database**

**If using Docker (recommended):**
```bash
# Start the PostgreSQL container
npm run docker:db:start

# Verify it's running
docker ps

# You should see "mmorpg-postgres" in the output
# Wait 5-10 seconds for the database to fully initialize
```

**If using local PostgreSQL:**
```bash
# Check if PostgreSQL is running
pg_isready -h localhost -p 5432

# If not running:
# macOS: brew services start postgresql
# Linux: sudo systemctl start postgresql
# Windows: Check Services app for "postgresql" service
```

**Step 3: Check for conflicting root .env file**
```bash
# Check if a .env file exists in the root directory
ls .env

# If it exists and you're not sure why, you can remove it
# (The correct .env file should be in packages/api/.env)
rm .env
```

**Step 4: Verify the setup**
```bash
# Now try running migrations again
npm run prisma:migrate
```

**Alternative: Use the automated setup**
```bash
# Linux/Mac
npm run setup
npm run docker:db:start
npm run prisma:migrate

# Windows
npm run setup:windows
npm run docker:db:start
npm run prisma:migrate
```

**If using local PostgreSQL with different credentials:**
Edit `packages/api/.env` and update the DATABASE_URL:
```
DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/mmorpg?schema=public"
```

Replace `YOUR_USERNAME` and `YOUR_PASSWORD` with your actual PostgreSQL credentials.

### Database Does Not Exist

**Error Message:**
```
Error: P1003: Database `mmorpg` does not exist
```

**Solution:**

**If using Docker (recommended):**
The database is automatically created when you start the container:
```bash
npm run docker:db:start
```

Wait a few seconds for the container to initialize, then check the logs:
```bash
npm run docker:db:logs
```

You should see: `database system is ready to accept connections`

**If using local PostgreSQL:**

Create the database:

**Using psql:**
```bash
psql -U postgres
CREATE DATABASE mmorpg;
\q
```

**Using createdb:**
```bash
createdb -U postgres mmorpg
```

**On Windows:**
```cmd
"C:\Program Files\PostgreSQL\15\bin\createdb.exe" -U postgres mmorpg
```

---

## Docker Issues

### Docker Not Installed

**Error Message:**
```
docker: command not found
```
or
```
'docker' is not recognized as an internal or external command
```

**Solution:**

Install Docker Desktop:
- **Windows**: Download from https://www.docker.com/products/docker-desktop/
- **macOS**: Download from https://www.docker.com/products/docker-desktop/
- **Linux**: Follow instructions at https://docs.docker.com/engine/install/

After installation, restart your terminal and verify:
```bash
docker --version
docker-compose --version
```

### Docker Container Won't Start

**Error:** Container fails to start or exits immediately.

**Solution:**

1. **Check if port 5432 is already in use:**
   ```bash
   # Linux/Mac
   lsof -i :5432
   
   # Windows
   netstat -ano | findstr :5432
   ```
   
   If another PostgreSQL instance is running, either:
   - Stop the local PostgreSQL service
   - Or change the port in `docker-compose.yml` (e.g., `5433:5432`)

2. **Check Docker logs:**
   ```bash
   npm run docker:db:logs
   ```

3. **Reset the container:**
   ```bash
   npm run docker:db:reset
   ```

### Docker Compose Not Found

**Error Message:**
```
docker-compose: command not found
```

**Solution:**

Docker Desktop includes Docker Compose v2. The npm scripts use the newer `docker compose` command (without hyphen).

If you have an older Docker installation with only `docker-compose` (with hyphen), you can either:

**Option 1 (Recommended):** Update to Docker Desktop or Docker Compose v2
- Docker Desktop: https://www.docker.com/products/docker-desktop/

**Option 2:** Use `docker-compose` directly (for older Docker versions):
```bash
# Instead of npm run docker:db:start, use:
docker-compose up -d postgres

# Instead of npm run docker:db:stop, use:
docker-compose stop postgres
```

**Option 3 (Linux):** Install Docker Compose plugin:
```bash
sudo apt-get update
sudo apt-get install docker-compose-plugin
```

### Permission Denied (Linux)

**Error Message:**
```
permission denied while trying to connect to the Docker daemon socket
```

**Solution:**

Add your user to the docker group:
```bash
sudo usermod -aG docker $USER
newgrp docker
```

Log out and back in for changes to take effect.

---

## Prisma Issues

### Error: "Prisma Client could not be found"

**Error Message:**
```
Error: @prisma/client did not initialize yet. Please run "prisma generate" and try to import it again.
```

**Solution:**

Generate the Prisma client:
```bash
# From root
npm run prisma:generate

# Or from packages/api
cd packages/api
npx prisma generate
```

### Migration Failed

**Error:** Migration fails midway or leaves the database in an inconsistent state.

**Solution:**

Reset the database (⚠️ **WARNING: This deletes all data!**):
```bash
cd packages/api
npx prisma migrate reset
```

This will:
1. Drop the database
2. Create a new database
3. Apply all migrations
4. Run seed scripts (if any)

### Schema Changes Not Reflected

**Cause:** Prisma client not regenerated after schema changes.

**Solution:**

After modifying `packages/api/prisma/schema.prisma`, always run:
```bash
npm run prisma:generate
```

---

## Development Server Issues

### Error: "Cannot find module" or "nest: not found"

**Error Message:**
```
Error: Cannot find module 'C:\...\packages\api\dist\main'
```

or

```
sh: nest: not found
```

**Cause:** Dependencies are not installed.

**Solution:**

The project now includes automatic dependency checking before running dev commands. If you see this error, it means you need to install dependencies first:

**Option 1 (Recommended):** Run the automated setup:
```bash
# Linux/Mac
npm run setup

# Windows
npm run setup:windows
```

**Option 2:** Install dependencies manually:
```bash
npm run install:all
```

After installing dependencies, try running the dev command again:
```bash
npm run dev:api       # Start API server
npm run dev:frontend  # Start frontend
npm run dev:gameserver # Start game server
```

**Note:** Starting with this update, the `npm run dev:api` and `npm run dev:frontend` commands will automatically check if dependencies are installed and provide helpful error messages if they're missing.

### Port Already in Use

**Error Message:**
```
Error: listen EADDRINUSE: address already in use :::4000
```

**Solution:**

Find and kill the process using the port:

**Linux/Mac:**
```bash
# Find process
lsof -ti:4000  # For API
lsof -ti:3000  # For frontend
lsof -ti:8080  # For game server

# Kill process
kill -9 <PID>
```

**Windows:**
```powershell
# Find process
netstat -ano | findstr :4000

# Kill process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### API Server Crashes on Startup

**Possible Causes:**
1. Database not running
2. Environment variables not set
3. Prisma client not generated
4. Dependencies not installed

**Solution:**

Run through this checklist:
```bash
# 1. Check PostgreSQL
pg_isready

# 2. Verify .env file exists
ls packages/api/.env

# 3. Generate Prisma client
npm run prisma:generate

# 4. Reinstall dependencies
cd packages/api
rm -rf node_modules package-lock.json
npm install
```

### Game Server Won't Start

**Error:** `go: command not found`

**Solution:**

Install Go 1.21 or later:
- **Linux:** https://go.dev/doc/install
- **macOS:** `brew install go`
- **Windows:** Download from https://go.dev/dl/

**Error:** Module dependencies not found

**Solution:**
```bash
cd packages/gameserver
go mod tidy
go mod download
```

---

## Build Issues

### TypeScript Build Errors

**Error:** Type errors during build.

**Solution:**

1. **Ensure shared package is built:**
   ```bash
   cd packages/shared
   npm run build
   ```

2. **Clear TypeScript cache:**
   ```bash
   cd packages/api  # or packages/frontend
   rm -rf dist node_modules/.cache
   npm run build
   ```

3. **Check tsconfig.json references:**
   Ensure workspace references are correct in `packages/api/tsconfig.json` and `packages/frontend/tsconfig.json`.

### Next.js Build Fails

**Solution:**

1. **Clear Next.js cache:**
   ```bash
   cd packages/frontend
   rm -rf .next
   npm run build
   ```

2. **Check environment variables:**
   Ensure `packages/frontend/.env.local` (if exists) has correct API URLs.

---

## Additional Help

### View Database with Prisma Studio

```bash
npm run prisma:studio
```

Opens a browser UI at http://localhost:5555 to view and edit database records.

### Check Service Health

- **API:** http://localhost:4000/api/health
- **Game Server:** http://localhost:8080/health
- **Frontend:** http://localhost:3000

### Enable Debug Logging

**API (NestJS):**
Set in `packages/api/.env`:
```
LOG_LEVEL=debug
```

**Game Server:**
Add debug flag when running:
```bash
cd packages/gameserver
go run cmd/server/main.go --debug
```

### Reset Everything (Nuclear Option)

If nothing else works, start fresh:

```bash
# 1. Stop all running services (Ctrl+C in all terminals)

# 2. Remove all node_modules and build artifacts
rm -rf node_modules packages/*/node_modules packages/*/.next packages/*/dist

# 3. Remove database (if safe to do so)
cd packages/api
npx prisma migrate reset

# 4. Reinstall everything
cd ../..
npm run install:all

# 5. Run setup again
npm run setup  # or npm run setup:windows
```

---

## Still Having Issues?

1. Check the main [README.md](./README.md) and [SETUP.md](./SETUP.md)
2. Verify you have all [prerequisites](#prerequisites) installed
3. Look for similar issues in the GitHub repository
4. Open a new issue with:
   - Your operating system
   - Node.js, npm, Go, and PostgreSQL versions
   - Complete error messages
   - Steps to reproduce the issue
