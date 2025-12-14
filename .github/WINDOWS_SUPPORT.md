# Windows Support

This project is fully compatible with Windows! All npm commands work seamlessly in both Windows Command Prompt and PowerShell.

## ✅ What Works on Windows

All standard commands work without modification:

```powershell
# Setup
npm run setup:windows

# Development
npm run dev:api           # Start API server
npm run dev:frontend      # Start frontend
npm run dev:gameserver    # Start game server

# Building
npm run build:api
npm run build:frontend
npm run build:gameserver  # Creates gameserver.exe on Windows

# Database
npm run prisma:generate
npm run prisma:migrate
npm run prisma:studio

# Dependencies
npm run install:all
```

## 🔧 How It Works

The project uses cross-platform approaches to ensure Windows compatibility:

1. **npm --prefix flag**: For Node.js-based packages (API, frontend), we use the `--prefix` flag which is built into npm and works on all platforms.

2. **Node.js wrapper scripts**: For the Go game server, we use Node.js scripts that handle platform differences automatically (e.g., creating `gameserver.exe` on Windows vs `gameserver` on Unix).

3. **Platform detection**: The build scripts automatically detect your OS and adjust the output accordingly.

## 📝 Notes

- All commands work in both **PowerShell** and **Command Prompt**
- No additional tools or dependencies required beyond the project prerequisites
- If you previously had issues with commands on Windows, those are now resolved
- The `.bat` and `.sh` scripts in `packages/gameserver/` are provided for users who want to run the game server directly without npm

## 🐛 Troubleshooting

If you still encounter issues:

1. Make sure you're using **Node.js 18+**
2. Use `npm run setup:windows` for initial setup (not `npm run setup`)
3. Ensure PostgreSQL and Go are installed if you're running the full stack
4. Check [TROUBLESHOOTING.md](../TROUBLESHOOTING.md) for common issues

## 💡 For Developers

If you need to add new scripts:

- Use `npm run <script> --prefix <package-path>` for npm commands
- Use Node.js scripts (in `/scripts/`) for non-npm commands
- Always test on Windows if you modify build or dev scripts
- Use `path.join()` instead of string concatenation for paths
