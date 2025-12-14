# Docker Setup Guide

This guide explains how to use Docker to run PostgreSQL for the Fantasy MMORPG project.

## Why Docker?

Using Docker for PostgreSQL has several advantages:

- **Easy setup**: No need to install PostgreSQL on your system
- **Cross-platform**: Works the same on Windows, macOS, and Linux
- **Isolated**: Database runs in a container, doesn't interfere with other PostgreSQL installations
- **Consistent**: Everyone on the team uses the same PostgreSQL version and configuration
- **Clean removal**: Easy to remove without leaving files behind

## Prerequisites

Install Docker Desktop:
- **Windows**: https://www.docker.com/products/docker-desktop/
- **macOS**: https://www.docker.com/products/docker-desktop/
- **Linux**: Follow instructions at https://docs.docker.com/engine/install/

After installation, verify Docker is running:
```bash
docker --version
docker compose version
```

## Quick Start

1. **Start the database:**
   ```bash
   npm run docker:db:start
   ```

2. **Run database migrations:**
   ```bash
   npm run prisma:migrate
   ```

3. **Start developing!**
   ```bash
   # In separate terminals:
   npm run dev:api
   npm run dev:frontend
   npm run dev:gameserver
   ```

## Docker Commands

### Database Management

```bash
# Start PostgreSQL
npm run docker:db:start

# Stop PostgreSQL (keeps data)
npm run docker:db:stop

# Restart PostgreSQL
npm run docker:db:restart

# View database logs
npm run docker:db:logs

# Reset database (⚠️ deletes all data!)
npm run docker:db:reset
```

### Direct Docker Commands

If you prefer to use Docker commands directly:

```bash
# Start
docker compose up -d postgres

# Stop
docker compose stop postgres

# View logs
docker compose logs -f postgres

# Remove everything (including data)
docker compose down -v
```

## Database Connection Details

When using Docker, the database is accessible at:

- **Host**: `localhost`
- **Port**: `5432`
- **Username**: `postgres`
- **Password**: `password`
- **Database**: `mmorpg`

Connection string (already in `packages/api/.env.example`):
```
DATABASE_URL="postgresql://postgres:password@localhost:5432/mmorpg?schema=public"
```

## Data Persistence

Database data is stored in a Docker volume named `projectnc_postgres_data`. This means:

- ✅ Data persists when you stop/restart the container
- ✅ Data persists across system reboots
- ⚠️ Data is deleted when you run `npm run docker:db:reset` or `docker compose down -v`

To view Docker volumes:
```bash
docker volume ls
```

## Troubleshooting

### Port Already in Use

If port 5432 is already in use (another PostgreSQL instance running):

**Option 1 (Recommended):** Stop the local PostgreSQL service
- **Windows**: Services app → postgresql service → Stop
- **macOS**: `brew services stop postgresql`
- **Linux**: `sudo systemctl stop postgresql`

**Option 2:** Change the port in `docker-compose.yml`:
```yaml
ports:
  - "5433:5432"  # Use 5433 instead of 5432
```

Then update `packages/api/.env`:
```
DATABASE_URL="postgresql://postgres:password@localhost:5433/mmorpg?schema=public"
```

### Container Won't Start

Check the logs:
```bash
npm run docker:db:logs
```

Common issues:
- Port conflict (see above)
- Docker daemon not running (start Docker Desktop)
- Insufficient disk space

### Can't Connect to Database

1. **Check if container is running:**
   ```bash
   docker ps
   ```
   You should see `mmorpg-postgres` in the list.

2. **Check container health:**
   ```bash
   docker ps
   ```
   The STATUS column should show "healthy"

3. **View logs:**
   ```bash
   npm run docker:db:logs
   ```
   Look for: `database system is ready to accept connections`

4. **Test connection:**
   ```bash
   docker exec mmorpg-postgres psql -U postgres -d mmorpg -c "\dt"
   ```
   This should list all tables.

### Reset Everything

If something goes wrong and you want to start fresh:

```bash
# Stop and remove everything (including data)
npm run docker:db:reset

# Wait a few seconds, then run migrations
npm run prisma:migrate
```

## Accessing the Database

### Using Docker Exec

Run SQL commands directly:
```bash
docker exec -it mmorpg-postgres psql -U postgres -d mmorpg
```

This opens an interactive PostgreSQL shell. Useful commands:
- `\dt` - List all tables
- `\d table_name` - Describe a table
- `\q` - Quit

### Using Prisma Studio

The easiest way to view/edit data:
```bash
npm run prisma:studio
```

Opens a web UI at http://localhost:5555

### Using pgAdmin or Other Tools

You can connect with any PostgreSQL client:
- Host: `localhost`
- Port: `5432`
- Username: `postgres`
- Password: `password`
- Database: `mmorpg`

## Production Considerations

⚠️ **This Docker setup is for development only!**

For production:
- Use a managed database service (AWS RDS, Azure Database, etc.)
- Or set up PostgreSQL with proper security, backups, and monitoring
- Never use default passwords like "password"
- Enable SSL/TLS for connections
- Configure firewall rules

## Alternative: Local PostgreSQL Installation

If you prefer not to use Docker, you can install PostgreSQL locally:

1. **Install PostgreSQL:**
   - Windows: https://www.postgresql.org/download/windows/
   - macOS: `brew install postgresql@15`
   - Linux: Use your package manager

2. **Create the database:**
   ```bash
   createdb -U postgres mmorpg
   ```

3. **Update `.env` if needed:**
   If your PostgreSQL username/password differ from defaults, update `packages/api/.env`

4. **Run migrations:**
   ```bash
   npm run prisma:migrate
   ```

## More Information

- Main README: [README.md](./README.md)
- Quick Start: [QUICKSTART.md](./QUICKSTART.md)
- Troubleshooting: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- Docker Compose file: [docker-compose.yml](./docker-compose.yml)
