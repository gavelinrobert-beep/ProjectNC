# Troubleshooting Guide

Common issues and solutions for setting up and running the Fantasy MMORPG.

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

### Connection Error: "Can't reach database server"

**Error Message:**
```
Error: P1001: Can't reach database server at `localhost:5432`
```

**Cause:** PostgreSQL is not running or is running on a different port.

**Solution:**

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
Error: P1001: Authentication failed against database server
```

**Solution:**

Check your PostgreSQL credentials in `packages/api/.env`:
```
DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/mmorpg?schema=public"
```

Replace `USERNAME` and `PASSWORD` with your actual PostgreSQL credentials.

### Database Does Not Exist

**Error Message:**
```
Error: P1003: Database `mmorpg` does not exist
```

**Solution:**

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
