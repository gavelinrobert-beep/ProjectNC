# Fantasy MMORPG - Unity 3D Client

A production-grade Unity 3D game client for the Fantasy MMORPG, designed with server-authoritative architecture and scalability in mind.

## 🎮 Overview

This Unity client provides real-time 3D rendering for an MMO-style game, connecting to an authoritative Go game server via WebSockets. The architecture prioritizes:

- **Server Authority**: Client sends input only, server validates and sends state
- **Smooth Networking**: Interpolation and prediction for responsive gameplay
- **Scalability**: Designed for raids, PvP, and multiple zones
- **Clean Code**: Extensive inline documentation and SOLID principles

## 🚀 Quick Start

**See [UNITY_SETUP.md](./UNITY_SETUP.md) for complete setup instructions.**

### Prerequisites

- Unity 2022.3 LTS or newer
- Running game server (Go) on `ws://localhost:8080`
- Running API server (NestJS) on `http://localhost:4000`

### Basic Setup

1. Open Unity Hub
2. Add project from disk: `/packages/unity-client`
3. Install NativeWebSocket package:
   - Window → Package Manager → Add from git URL
   - `https://github.com/endel/NativeWebSocket.git#upm`
4. Open `LoginScene` and press Play

## 📁 Project Structure

```
Assets/
├── Scenes/
│   ├── LoginScene.unity          # Authentication
│   ├── CharacterSelectScene.unity # Character selection
│   └── WorldScene.unity          # 3D game world
├── Scripts/
│   ├── Core/                     # Core systems
│   │   └── GameManager.cs        # Game state management
│   ├── Network/                  # Networking layer
│   │   ├── WebSocketClient.cs    # WebSocket connection
│   │   ├── MessageRouter.cs      # Message handling
│   │   └── NetworkManager.cs     # High-level API
│   ├── World/                    # World systems
│   │   ├── TerrainManager.cs     # Terrain rendering
│   │   ├── ZoneManager.cs        # Zone transitions
│   │   ├── EntityManager.cs      # Entity lifecycle
│   │   └── CombatVisualizer.cs   # Combat effects
│   ├── Characters/               # Character systems
│   │   ├── PlayerController.cs   # Local player control
│   │   └── RemoteCharacter.cs    # Network interpolation
│   ├── Animations/               # Animation systems
│   │   └── CharacterAnimator.cs  # Animation state machine
│   ├── UI/                       # User interface
│   │   ├── LoginUI.cs            # Login screen
│   │   ├── CharacterSelectUI.cs  # Character selection
│   │   ├── HUD.cs                # In-game HUD
│   │   ├── ActionBar.cs          # Ability hotkeys
│   │   ├── ChatWindow.cs         # Chat system
│   │   ├── TargetFrame.cs        # Target info
│   │   ├── FloatingCombatText.cs # Damage numbers
│   │   ├── Nameplate.cs          # Entity nameplates
│   │   └── TargetIndicator.cs    # Selection ring
│   └── Systems/                  # Game systems
│       ├── CameraController.cs   # Third-person camera
│       ├── InputManager.cs       # Input handling
│       └── InterpolationSystem.cs # Network smoothing
├── Prefabs/                      # Reusable objects
│   ├── Player/                   # Player prefabs
│   ├── NPC/                      # NPC prefabs
│   ├── Environment/              # World objects
│   └── UI/                       # UI elements
├── Scenes/                       # Unity scenes
├── Materials/                    # Materials
└── Resources/                    # Runtime-loaded assets
```

## 🏗️ Architecture

### Server-Authoritative Design

```
┌─────────────┐                    ┌──────────────┐
│   Client    │ ──── Input ──────► │ Game Server  │
│   (Unity)   │                    │    (Go)      │
│             │ ◄── State Update ── │              │
└─────────────┘                    └──────────────┘
```

**Client sends**: Movement input, ability requests, interactions
**Server sends**: Authoritative state, combat results, entity updates
**Client never**: Validates actions, calculates damage, or makes gameplay decisions

### Network Layer

```
WebSocketClient (connection) 
    ↓
MessageRouter (type routing)
    ↓
NetworkManager (high-level API)
    ↓
Game Systems (entities, combat, chat)
```

### Entity System

```
EntityManager
  ├── Local Player (PlayerController)
  ├── Remote Players (RemoteCharacter + interpolation)
  └── NPCs/Monsters (RemoteCharacter + AI display)
```

### UI System

```
HUD Canvas (Screen Space)
  ├── Health/Mana Bars
  ├── Action Bar (abilities 1-0)
  ├── Chat Window
  ├── Target Frame
  └── Combat Log

World Canvas (World Space)
  ├── Nameplates (over entities)
  ├── Floating Combat Text (damage numbers)
  └── Target Indicator (selection ring)
```

## 🎯 Key Features (MVP)

### Implemented
- ✅ WebSocket networking with reconnection
- ✅ Login and authentication flow
- ✅ Character selection
- ✅ 3D world rendering (flat terrain MVP)
- ✅ Third-person camera with orbit controls
- ✅ WASD movement with server authority
- ✅ Entity spawning/despawning
- ✅ Network interpolation for smooth movement
- ✅ Combat visualization (effects, floating text)
- ✅ Nameplate system
- ✅ Target selection
- ✅ HUD (health, mana, experience bars)
- ✅ Action bar framework
- ✅ Chat window
- ✅ Zone management system

### Designed for Future
- 🔄 Multiple zones with seamless transitions
- 🔄 Raid-scale entity counts (100+)
- 🔄 Advanced terrain (heightmaps, streaming)
- 🔄 Mounts and flying
- 🔄 Instanced dungeons
- 🔄 PvP battlegrounds
- 🔄 Weather and day/night cycles
- 🔄 Phasing system

## 🔧 Configuration

### Server URLs

Edit `NetworkManager` component in Unity:

```csharp
Game Server URL: ws://localhost:8080/ws
API Server URL: http://localhost:4000
```

### Input Keybinds

Default keybinds (configurable in `InputManager`):

- **Movement**: WASD
- **Jump**: Space
- **Sprint**: Shift
- **Camera Rotate**: Right Mouse Button
- **Target Select**: Tab
- **Abilities**: 1-0
- **Inventory**: I
- **Character**: C
- **Map**: M
- **Chat**: Enter

## 📡 Network Protocol

### Message Structure

```json
{
  "type": "MESSAGE_TYPE",
  "payload": { ... }
}
```

### Client → Server

| Message | Description |
|---------|-------------|
| `CONNECT` | Initial connection with JWT token |
| `PLAYER_MOVE` | Movement input (position, type, timestamp) |
| `ATTACK_REQUEST` | Ability cast request (ability ID, target, position) |
| `CHAT` | Chat message (channel, message, target) |
| `INTERACT` | Interact with object/NPC |

### Server → Client

| Message | Description |
|---------|-------------|
| `WELCOME` | Connection accepted (player ID, character data) |
| `ENTITY_UPDATE` | Entity state (position, rotation, health, flags) |
| `COMBAT_EVENT` | Combat result (damage, heal, buff, death) |
| `ENTITY_SPAWN` | New entity in range |
| `ENTITY_DESPAWN` | Entity left range |
| `CHAT_MESSAGE` | Chat message received |
| `ERROR` | Server error message |

See `packages/gameserver/pkg/protocol/messages.go` for full protocol spec.

## 🧪 Testing

### In-Editor Testing
1. Open `WorldScene`
2. Press Play
3. Systems initialize without network connection

### Network Testing
1. Start all services (DB, API, Game Server)
2. Open `LoginScene` in Unity
3. Press Play
4. Login with test credentials
5. Select/create character
6. Enter world and test:
   - Movement (WASD)
   - Camera (Right-click drag, scroll zoom)
   - Targeting (Tab, click entities)
   - Chat (Enter to focus, type, Enter to send)

### Debug Mode
Press **F3** during play to show debug overlays:
- FPS and frame time
- Network status
- Entity count
- Input state
- Interpolation stats

## 🛠️ Development

### Creating Prefabs

See `Assets/Prefabs/README.md` for prefab structure.

**Example: Player Prefab**
1. Create Capsule in scene
2. Add `CharacterController` component
3. Add `PlayerController` script
4. Add `CharacterAnimator` script
5. Create child Canvas with `Nameplate`
6. Drag to `Assets/Prefabs/Player/Player.prefab`

### Adding New Message Types

1. Define in `MessageRouter.cs`:
```csharp
public const string NEW_MESSAGE = "NEW_MESSAGE";
```

2. Create payload class:
```csharp
[Serializable]
public class NewMessagePayload { ... }
```

3. Register handler in `NetworkManager`:
```csharp
messageRouter.RegisterHandler(MessageType.NEW_MESSAGE, HandleNewMessage);
```

4. Implement handler:
```csharp
private void HandleNewMessage(string json) { ... }
```

### Performance Optimization

- Use **object pooling** for frequently spawned objects (floating text, effects)
- Limit active nameplates (distance-based culling)
- Use **LOD** for distant entities (future)
- Batch network messages (server-side)
- Profile with Unity Profiler (Window → Analysis → Profiler)

## 📚 Documentation

- **[UNITY_SETUP.md](./UNITY_SETUP.md)** - Complete setup guide
- **[Assets/Prefabs/README.md](./Assets/Prefabs/README.md)** - Prefab structure
- **[Assets/Scenes/README.md](./Assets/Scenes/README.md)** - Scene setup
- **Inline code comments** - Architecture and scalability notes

## 🐛 Troubleshooting

### "WebSocket library not found"
Install NativeWebSocket package (see Setup)

### "Cannot connect to server"
Verify game server is running: `curl http://localhost:8080`

### "Player falls through ground"
Check Ground layer and CharacterController collider

### "No camera movement"
Ensure CameraController has player target (assigned at runtime)

### "UI doesn't respond"
Check EventSystem exists in scene

See [UNITY_SETUP.md](./UNITY_SETUP.md#troubleshooting) for more.

## 🎨 Art Assets (Not Included)

This is a code scaffold. For production, add:

- **Character models** with rigged animations
- **Environment assets** (trees, rocks, buildings)
- **UI graphics** (buttons, frames, icons)
- **Particle effects** (spells, impacts, buffs)
- **Audio** (music, SFX, voice)
- **Skyboxes** and lighting setups

## 📄 License

MIT License - See LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request

## 📞 Support

- Check TROUBLESHOOTING.md
- Review Unity Console for errors
- Check game server logs
- Verify all services running

---

**Built with ❤️ for MMO enthusiasts**

**Unity Version**: 2022.3 LTS  
**Project Version**: 0.1.0 (MVP)  
**Last Updated**: December 2024
