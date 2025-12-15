# 3D Desktop Game Setup Guide

This project is a **3D desktop MMORPG** built with Unity. This guide will help you get started with the desktop game client.

## Overview

**What is this?**
- A full 3D desktop game client built in Unity
- Server-authoritative multiplayer architecture
- Third-person camera, WASD movement, combat, chat
- Connects to Node.js/Go backend servers

**What tool should I use?**
- **Unity 2022.3 LTS or newer** (The industry standard for 3D game development)
- Unity is free for personal use and educational purposes
- Unity provides the best tools for creating 3D desktop games

## Quick Start

### 1. Install Prerequisites

#### Install Unity Hub and Unity Editor

1. Download Unity Hub from [unity.com/download](https://unity.com/download)
2. Install Unity Hub
3. Open Unity Hub
4. Go to "Installs" tab
5. Click "Install Editor"
6. Select **Unity 2022.3 LTS** or newer
7. Include these modules:
   - Windows Build Support (for Windows builds)
   - Mac Build Support (for Mac builds)
   - Linux Build Support (for Linux builds)

#### Install Backend Dependencies

```bash
# Install Node.js and npm if not already installed
# Download from: https://nodejs.org/

# Install Go if not already installed
# Download from: https://go.dev/dl/

# Verify installations
node --version  # Should be 18+
npm --version
go version     # Should be 1.21+
```

### 2. Setup Backend Services

```bash
# Clone the repository (if not already done)
git clone <repository-url>
cd ProjectNC

# Install all dependencies
npm run setup

# Start PostgreSQL database
npm run docker:db:start

# Run database migrations
npm run prisma:migrate

# Start API server (Terminal 1)
npm run dev:api
# Runs on http://localhost:4000

# Start Game Server (Terminal 2)
npm run dev:gameserver
# Runs on ws://localhost:8080
```

### 3. Open Unity Project

1. Open Unity Hub
2. Click "Add" → "Add project from disk"
3. Navigate to `ProjectNC/packages/unity-client`
4. Select the folder
5. Click "Open"
6. The project will open in Unity Editor

### 4. Install WebSocket Package

The Unity client needs the NativeWebSocket package:

1. In Unity, go to **Window → Package Manager**
2. Click the **"+"** button in top-left
3. Select **"Add package from git URL"**
4. Enter: `https://github.com/endel/NativeWebSocket.git#upm`
5. Click **"Add"**

### 5. Create Unity Scenes

The Unity project has scripts but needs scenes created in the Unity Editor. Follow these steps:

#### Create LoginScene

1. **File → New Scene**
2. **File → Save As** → Name it `LoginScene.unity`
3. Save in `Assets/Scenes/`
4. Add components:
   - Create UI Canvas (GameObject → UI → Canvas)
   - Add `LoginUI` script to Canvas
   - Add EventSystem if not present
5. Configure NetworkManager:
   - Create Empty GameObject, name it "NetworkManager"
   - Add `NetworkManager` script
   - Set Game Server URL: `ws://localhost:8080/ws`
   - Set API Server URL: `http://localhost:4000`

#### Create CharacterSelectScene

1. **File → New Scene**
2. **File → Save As** → Name it `CharacterSelectScene.unity`
3. Save in `Assets/Scenes/`
4. Add components:
   - Create UI Canvas
   - Add `CharacterSelectUI` script to Canvas
   - Add EventSystem if not present

#### Create WorldScene (Main Game)

1. **File → New Scene**
2. **File → Save As** → Name it `WorldScene.unity`
3. Save in `Assets/Scenes/`
4. Add components:
   - Create Plane for ground (GameObject → 3D Object → Plane)
   - Scale plane to 10x10 or larger
   - Create Empty GameObject, name it "WorldController"
   - Add `WorldController` script
   - Create UI Canvas for HUD
   - Add `HUD` script to Canvas
   - Add Main Camera if not present
   - Add `CameraController` script to Camera
   - Create Directional Light if not present

### 6. Configure Build Settings

1. **File → Build Settings**
2. Add scenes in order:
   - LoginScene
   - CharacterSelectScene
   - WorldScene
3. Select target platform (PC, Mac, Linux Standalone)
4. Click "Switch Platform" if needed

### 7. Test the Game

1. Make sure backend services are running (API + Game Server)
2. Open `LoginScene` in Unity
3. Click **Play** button at top of Unity Editor
4. Test the login flow:
   - Register a new account
   - Login
   - Create a character
   - Enter the game world
5. Test in-game features:
   - WASD movement
   - Camera rotation (right-click drag)
   - Camera zoom (scroll wheel)
   - Chat (press Enter)

### 8. Build Desktop Executable

When you're ready to build a standalone desktop game:

1. **File → Build Settings**
2. Select platform (PC, Mac & Linux Standalone)
3. Choose target OS:
   - Windows
   - macOS
   - Linux
4. Click "Build"
5. Choose output folder
6. Unity will create an executable

**Build outputs:**
- **Windows**: `.exe` file + `_Data` folder
- **macOS**: `.app` bundle
- **Linux**: Executable file

### 9. Distribute Your Game

- Package the built files
- Distribute to players
- Players just run the executable (no Unity required)
- Make sure backend servers are accessible

## Architecture

### Why Unity?

Unity is the best choice for a 3D desktop MMORPG because:

1. **Industry Standard**: Used by professional game developers worldwide
2. **3D Rendering**: Excellent 3D graphics, physics, and rendering
3. **Cross-Platform**: Build for Windows, Mac, Linux, and even consoles
4. **Performance**: Optimized for desktop gaming with 60+ FPS
5. **Ecosystem**: Huge asset store, tutorials, and community support
6. **Desktop-First**: Designed for desktop games, not mobile
7. **Free**: Free for personal use and small businesses

### Project Structure

```
packages/unity-client/
├── Assets/
│   ├── Scenes/           # Unity scenes (LoginScene, WorldScene, etc.)
│   ├── Scripts/          # 22 C# scripts (~8000 lines)
│   │   ├── Core/        # GameManager
│   │   ├── Network/     # WebSocket client
│   │   ├── World/       # Entity, Terrain, Zone management
│   │   ├── Characters/  # Player controller, Remote characters
│   │   ├── UI/          # HUD, Chat, Action bar
│   │   └── Systems/     # Camera, Input, Interpolation
│   ├── Prefabs/         # Reusable game objects
│   ├── Materials/       # 3D materials
│   └── Resources/       # Runtime-loaded assets
├── ProjectSettings/     # Unity project configuration
└── Packages/           # Unity package manifest

Backend services:
├── packages/api/        # Authentication, Character management
├── packages/gameserver/ # Real-time game logic (Go)
└── packages/frontend/   # Optional web interface
```

### How It Works

```
Unity Desktop Client (C#)
    ↓ HTTP
API Server (NestJS) → Database (PostgreSQL)
    ↑
Unity Client ← WebSocket → Game Server (Go)
```

**Client Flow:**
1. Player opens Unity executable
2. Login/register through API
3. Select/create character
4. Enter game world
5. Unity connects to Game Server via WebSocket
6. Real-time 3D gameplay with WASD movement
7. Server authoritative (prevents cheating)

## Troubleshooting

### "WebSocket package not found"
- Install NativeWebSocket package (see step 4 above)

### "Cannot connect to server"
```bash
# Verify backend services are running:
curl http://localhost:4000  # API should respond
curl http://localhost:8080  # Game server should respond

# Check if ports are already in use:
lsof -i :4000
lsof -i :8080
```

### "Unity version mismatch"
- Open project with Unity 2022.3 LTS or newer
- Unity Hub will offer to upgrade if needed

### "Scripts are missing"
- Scripts are in `Assets/Scripts/`
- If Unity can't find them, reimport the Assets folder

### "Camera not working"
- Make sure Main Camera has `CameraController` script
- Ensure player object is assigned in CameraController

### "No ground collision"
- Plane or terrain must have a collider
- Player must have CharacterController component

## Next Steps

1. **Read Unity Documentation**: [packages/unity-client/README.md](./packages/unity-client/README.md)
2. **Detailed Setup**: [packages/unity-client/UNITY_SETUP.md](./packages/unity-client/UNITY_SETUP.md)
3. **Integration Guide**: [packages/unity-client/INTEGRATION.md](./packages/unity-client/INTEGRATION.md)
4. **Quick Reference**: [packages/unity-client/QUICK_REFERENCE.md](./packages/unity-client/QUICK_REFERENCE.md)

## Additional Resources

- **Unity Learn**: https://learn.unity.com/
- **Unity Manual**: https://docs.unity3d.com/Manual/index.html
- **C# Programming**: https://learn.microsoft.com/en-us/dotnet/csharp/
- **Game Dev Tutorials**: https://catlikecoding.com/unity/tutorials/

## Why Not Mobile?

This is specifically a **desktop game** because:

1. **3D Graphics**: Desktop GPUs handle 3D much better than mobile
2. **Controls**: WASD + Mouse is ideal for MMORPG gameplay
3. **Performance**: Desktop provides consistent 60+ FPS
4. **Screen Size**: Large screens for immersive experience
5. **Power**: No battery concerns, always plugged in
6. **Keyboard/Mouse**: Essential for MMORPG controls

If you want to support mobile later, you would need:
- Touch controls overlay
- Simplified graphics
- Different UI layout
- Mobile build in Unity (Android/iOS)

But the primary focus is **desktop 3D gaming**.

---

**Ready to build your 3D desktop MMORPG? Start with Step 1!** 🎮
