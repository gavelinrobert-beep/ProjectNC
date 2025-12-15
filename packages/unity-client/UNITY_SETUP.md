# Unity 3D Client - Complete Setup Guide

This guide provides step-by-step instructions for setting up the Unity 3D game client.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Unity Project Setup](#initial-unity-project-setup)
3. [Installing Dependencies](#installing-dependencies)
4. [Project Configuration](#project-configuration)
5. [Creating Scenes](#creating-scenes)
6. [Creating Prefabs](#creating-prefabs)
7. [Testing the Client](#testing-the-client)
8. [Connecting to Game Server](#connecting-to-game-server)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

- **Unity 2022.3 LTS** or newer (recommended)
  - Download from: https://unity.com/download
  - Install the following modules:
    - Windows Build Support (if on Windows)
    - Mac Build Support (if on Mac)
    - TextMeshPro (included by default)

- **Git** (for version control)

- **Visual Studio** or **Rider** (for C# development)

### Running Services

Before starting Unity client, ensure these services are running:

1. **PostgreSQL Database**
   ```bash
   npm run docker:db:start
   ```

2. **API Server** (NestJS)
   ```bash
   npm run dev:api
   # Runs on http://localhost:4000
   ```

3. **Game Server** (Go)
   ```bash
   npm run dev:gameserver
   # Runs on ws://localhost:8080
   ```

---

## Initial Unity Project Setup

### Option 1: Using Existing Project

The Unity client files are already in `packages/unity-client/Assets`. You need to:

1. **Open Unity Hub**

2. **Click "Add" → "Add project from disk"**

3. **Navigate to and select**: `/packages/unity-client`

4. **Select Unity Version**: Choose 2022.3 LTS

5. **Click "Open"** to open the project

### Option 2: Creating New Project

If starting fresh:

1. **Create New 3D Project** in Unity Hub
   - Template: 3D (URP optional for better graphics)
   - Name: "Fantasy-MMORPG-Client"

2. **Copy Scripts** from `packages/unity-client/Assets/Scripts` to your new project's `Assets/Scripts`

3. **Follow remaining setup steps below**

---

## Installing Dependencies

### 1. TextMeshPro

TextMeshPro should be included by default. If not:

1. Open Unity
2. Go to **Window → Package Manager**
3. Select **Unity Registry**
4. Find **TextMeshPro** and click **Install**

### 2. NativeWebSocket Package

For WebSocket support:

1. Open **Window → Package Manager**
2. Click **+** button → **Add package from git URL**
3. Enter: `https://github.com/endel/NativeWebSocket.git#upm`
4. Click **Add**

If the above fails, use an alternative:

```
https://github.com/endel/NativeWebSocket.git
```

Or manually add to `Packages/manifest.json`:
```json
{
  "dependencies": {
    "com.endel.nativewebsocket": "https://github.com/endel/NativeWebSocket.git#upm"
  }
}
```

### 3. Input System (Optional - Future)

For enhanced input handling:

1. **Window → Package Manager**
2. Find **Input System**
3. Click **Install**

---

## Project Configuration

### 1. Project Settings

#### Player Settings
1. **Edit → Project Settings → Player**
2. **Company Name**: Your company/studio name
3. **Product Name**: "Fantasy MMORPG"
4. **Version**: "0.1.0"
5. **API Compatibility Level**: .NET 4.x or .NET Standard 2.1

#### Quality Settings
1. **Edit → Project Settings → Quality**
2. Set appropriate quality levels for your target platform
3. For MVP: "Medium" is sufficient

#### Graphics Settings
1. **Edit → Project Settings → Graphics**
2. Ensure render pipeline is set correctly (Built-in or URP)

### 2. Layers Setup

Create the following layers:

1. **Edit → Project Settings → Tags and Layers**
2. Add these layers:
   - Layer 8: `Ground`
   - Layer 9: `Player`
   - Layer 10: `NPC`
   - Layer 11: `Monster`
   - Layer 12: `Environment`
   - Layer 13: `Interactable`

### 3. Input Manager

Default Input Manager settings should work. Verify these exist:

1. **Edit → Project Settings → Input Manager**
2. Check for:
   - Horizontal (A/D, Arrow Keys)
   - Vertical (W/S, Arrow Keys)
   - Jump (Space)
   - Mouse X
   - Mouse Y
   - Mouse ScrollWheel

---

## Creating Scenes

### Scene 1: LoginScene

1. **Create New Scene**: `File → New Scene → Basic (Built-in)`
2. **Save As**: `Assets/Scenes/LoginScene.unity`

**Setup**:

1. **Create GameManager**:
   - Empty GameObject
   - Name: "GameManager"
   - Add Component: `GameManager` script
   - Set scene references in Inspector

2. **Create NetworkManager**:
   - Empty GameObject
   - Name: "NetworkManager"
   - Add Component: `NetworkManager` script
   - Add Component: `WebSocketClient` script
   - Add Component: `MessageRouter` script

3. **Create UI Canvas**:
   - GameObject → UI → Canvas
   - Name: "LoginCanvas"
   - Canvas Scaler: Scale With Screen Size (1920x1080 reference)
   
4. **Add LoginUI**:
   - Under LoginCanvas, create:
     - Panel (Background)
     - InputField (Username) - TextMeshPro
     - InputField (Password) - TextMeshPro
     - Button (Login)
     - Button (Register)
     - Text (Error Message) - Hidden by default
     - Panel (Loading Overlay) - Hidden by default
   - Add `LoginUI` script to LoginCanvas

5. **Add EventSystem** (auto-created with Canvas)

### Scene 2: CharacterSelectScene

1. **Create New Scene**: `File → New Scene → Basic`
2. **Save As**: `Assets/Scenes/CharacterSelectScene.unity`

**Setup**:

1. GameManager and NetworkManager persist from LoginScene (DontDestroyOnLoad)

2. **Create UI Canvas**:
   - GameObject → UI → Canvas
   - Name: "CharacterSelectCanvas"
   
3. **Add CharacterSelectUI**:
   - Under Canvas, create:
     - Text (Title: "Select Character")
     - Scroll View (Character List)
     - Button (Create New Character)
     - Button (Play)
     - Button (Back to Login)
     - Panel (Character Creation Form) - Hidden
   - Add `CharacterSelectUI` script to Canvas

4. **Camera**: Position to view UI (default is fine)

### Scene 3: WorldScene (Main Game Scene)

1. **Create New Scene**: `File → New Scene → Basic`
2. **Save As**: `Assets/Scenes/WorldScene.unity`

**Setup**:

1. **Create Systems Container**:
   ```
   Empty GameObject: "Systems"
   ├── TerrainManager (Add TerrainManager script)
   ├── ZoneManager (Add ZoneManager script)
   ├── EntityManager (Add EntityManager script)
   ├── CombatVisualizer (Add CombatVisualizer script)
   ├── InterpolationSystem (Add InterpolationSystem script)
   └── InputManager (Add InputManager script)
   ```

2. **Setup Camera**:
   - Main Camera position: (0, 10, -10)
   - Add `CameraController` script
   - The script will find player target at runtime

3. **Configure Lighting**:
   - **Directional Light** (default)
     - Rotation: (50, -30, 0)
     - Intensity: 1
     - Color: White
   - **Lighting Settings**: Window → Rendering → Lighting
     - Skybox: Default or custom
     - Ambient Source: Skybox

4. **Create HUD Canvas**:
   ```
   Canvas: "HUDCanvas" (Screen Space - Overlay)
   ├── HUD (Add HUD script)
   │   ├── PlayerInfo Panel
   │   │   ├── Name Text
   │   │   └── Level Text
   │   ├── HealthBar (Slider)
   │   ├── ManaBar (Slider)
   │   ├── ExperienceBar (Slider)
   │   ├── CastBar Container (Hidden by default)
   │   └── CombatLog Text
   ├── ActionBar (Add ActionBar script)
   │   └── Ability Buttons (1-10)
   ├── ChatWindow (Add ChatWindow script)
   │   ├── Message ScrollView
   │   └── Input Field
   └── TargetFrame (Add TargetFrame script)
       ├── Target Name
       ├── Target Level
       └── Target Health Bar
   ```

5. **Create World UI**:
   ```
   Empty GameObject: "WorldUI"
   ├── TargetIndicator (Add TargetIndicator script)
   └── FloatingCombatText (Add FloatingCombatText script)
   ```

6. **EventSystem** (required for UI)

### Build Settings

1. **File → Build Settings**
2. **Add Open Scenes**:
   - LoginScene (index 0)
   - CharacterSelectScene (index 1)
   - WorldScene (index 2)
3. **Player Settings** → Set appropriate icons and splash screen

---

## Creating Prefabs

### Player Prefab

1. **Create in Scene**:
   - GameObject → 3D Object → Capsule
   - Name: "Player"
   - Scale: (1, 1, 1)

2. **Add Components**:
   - `CharacterController` (radius: 0.5, height: 2)
   - `PlayerController` script
   - `CharacterAnimator` script (if Animator exists)

3. **Add Nameplate**:
   - Create child object: GameObject → UI → Canvas
   - Set Canvas to World Space
   - Add `Nameplate` script
   - Set offset to (0, 2.5, 0)

4. **Drag to**: `Assets/Prefabs/Player/Player.prefab`

### NPC Prefab

1. **Create in Scene**:
   - GameObject → 3D Object → Capsule
   - Name: "NPC"
   - Change material color to green

2. **Add Components**:
   - `RemoteCharacter` script
   - `CharacterAnimator` script

3. **Add Nameplate** (same as Player)

4. **Drag to**: `Assets/Prefabs/NPC/NPC.prefab`

### Monster Prefab

Same as NPC but:
- Name: "Monster"
- Material color: Red
- Save to: `Assets/Prefabs/NPC/Monster.prefab`

---

## Testing the Client

### Test Mode 1: Editor Play Mode

1. **Open WorldScene**
2. **Click Play** button in Unity Editor
3. **Expected behavior**:
   - TerrainManager creates ground plane
   - ZoneManager loads starting zone
   - Systems initialize

**Check Console** for:
- "TerrainManager: Initialized"
- "ZoneManager: Loaded zone"
- "EntityManager: Ready"

### Test Mode 2: Standalone Build

1. **File → Build Settings**
2. **Click "Build"**
3. **Choose output folder**: e.g., `builds/windows`
4. **Run the executable**

### Test Mode 3: Full Integration Test

**Requires all services running!**

1. Start PostgreSQL: `npm run docker:db:start`
2. Start API: `npm run dev:api`
3. Start Game Server: `npm run dev:gameserver`
4. Run Unity client
5. Login with test account
6. Select/create character
7. Enter game world
8. Test movement (WASD)
9. Test camera (Right-click drag)

---

## Connecting to Game Server

### Configuration

In Unity Editor:

1. **Find NetworkManager** in Hierarchy
2. **Inspector → NetworkManager component**
3. **Set URLs**:
   - Game Server URL: `ws://localhost:8080/ws`
   - API Server URL: `http://localhost:4000`

### Connection Flow

1. **Login** → Sends credentials to API Server
2. **API returns JWT token**
3. **Character Select** → Loads characters from API
4. **Enter World** → Connects to Game Server with JWT
5. **Game Server sends WELCOME message**
6. **Client spawns player entity**
7. **Game loop begins**

### Debug Connection

Enable debug logging:

1. **Window → Analysis → Console**
2. **Check "Collapse"** and **"Error Pause"**
3. Look for:
   - "WebSocket: Connected"
   - "NetworkManager: Welcome received"
   - "EntityManager: Spawned local player"

---

## Troubleshooting

### Common Issues

#### 1. "WebSocket library not found"

**Solution**: Install NativeWebSocket package (see Installing Dependencies)

Alternative: Comment out WebSocket code for testing without network

#### 2. "Scripts have compile errors"

**Solution**: 
- Check Unity Console for errors
- Ensure all scripts are in correct namespaces
- Verify .NET 4.x or Standard 2.1 is selected

#### 3. "Cannot connect to server"

**Solution**:
- Verify game server is running: `curl http://localhost:8080`
- Check NetworkManager URL configuration
- Ensure firewall isn't blocking ports 4000 or 8080

#### 4. "TextMeshPro missing"

**Solution**:
- Import TextMeshPro Essentials
- Window → TextMeshPro → Import TMP Essential Resources

#### 5. "Player falls through ground"

**Solution**:
- Check Ground layer is set correctly
- Verify CharacterController has collider enabled
- Check TerrainManager ground plane has collider

#### 6. "No camera movement"

**Solution**:
- Ensure CameraController has target assigned (happens at runtime)
- Check InputManager is receiving mouse input
- Verify camera isn't locked by UI

#### 7. "UI doesn't respond"

**Solution**:
- Check EventSystem exists in scene
- Verify Canvas raycaster is enabled
- Check UI elements aren't blocked by other canvases

### Performance Issues

If frame rate is low:

1. **Edit → Project Settings → Quality**
   - Reduce shadow quality
   - Reduce texture quality
   - Disable anti-aliasing

2. **Reduce draw calls**:
   - Batch entities
   - Use object pooling
   - LOD for distant objects

### Debugging Tips

1. **Enable Debug Overlays**:
   - Press F3 in game to show debug info
   - Check FPS, connection status, entity count

2. **Unity Profiler**:
   - Window → Analysis → Profiler
   - Check CPU, GPU, Memory usage

3. **Scene View**:
   - Use Scene view during Play mode
   - Check entity positions
   - Verify cameras and lights

---

## Next Steps

After successful setup:

1. **Create custom prefabs** with proper models/textures
2. **Design Animator Controllers** for character animations
3. **Add audio** (footsteps, combat sounds, music)
4. **Enhance UI** with better graphics
5. **Add particle effects** for combat
6. **Optimize performance** for target hardware

---

## Architecture Notes

### Server Authority

The client is designed with **strict server authority**:

- **Client sends**: Input only (move, attack, interact)
- **Server sends**: State updates (position, health, combat results)
- **Client never**: Calculates damage, validates actions, or makes gameplay decisions

### Scalability Features

The codebase is designed to scale:

- **Multiple zones**: ZoneManager supports zone transitions
- **Entity streaming**: EntityManager can handle hundreds of entities
- **Network interpolation**: Smooth movement with variable latency
- **Object pooling**: Combat text and effects use pooling
- **Future-ready**: Comments indicate where features like raids, PvP, mounts will integrate

---

## Additional Resources

- **Unity Documentation**: https://docs.unity3d.com/
- **TextMeshPro Docs**: https://docs.unity3d.com/Manual/com.unity.textmeshpro.html
- **C# Networking**: https://docs.microsoft.com/en-us/dotnet/standard/networking/
- **Game Server Protocol**: See `packages/gameserver/pkg/protocol/messages.go`

---

## Support

For issues or questions:

1. Check TROUBLESHOOTING.md in project root
2. Review Unity Console for errors
3. Check game server logs
4. Verify all services are running

---

**Last Updated**: December 2024
**Unity Version**: 2022.3 LTS
**Project Version**: 0.1.0 (MVP)
