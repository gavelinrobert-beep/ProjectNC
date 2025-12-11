# Fantasy MMORPG - Unity 3D Client

This Unity project provides the 3D game client for the Fantasy MMORPG.
It communicates with the authoritative game server via WebSockets.

## Project Structure

```
Assets/
├── Scenes/
│   ├── LoginScene.unity          # Login screen
│   ├── CharacterSelectScene.unity # Character selection
│   └── WorldScene.unity          # Main game world
├── Scripts/
│   ├── Core/                     # Core systems and utilities
│   │   ├── GameManager.cs        # Main game state manager
│   │   └── ServiceLocator.cs     # Dependency injection
│   ├── Network/                  # Networking layer
│   │   ├── WebSocketClient.cs    # WebSocket connection manager
│   │   ├── MessageRouter.cs      # Message routing and handlers
│   │   └── NetworkManager.cs     # High-level network manager
│   ├── World/                    # World rendering
│   │   ├── TerrainManager.cs     # Terrain loading
│   │   ├── ZoneManager.cs        # Zone streaming
│   │   └── EntityManager.cs      # Entity spawning/despawning
│   ├── Characters/               # Character systems
│   │   ├── CharacterController.cs # Third-person movement
│   │   ├── PlayerController.cs   # Local player input
│   │   └── RemoteCharacter.cs    # Network interpolation
│   ├── Animations/               # Animation systems
│   │   └── AnimationController.cs # Animation state machine
│   ├── UI/                       # User interface
│   │   ├── LoginUI.cs            # Login screen
│   │   ├── CharacterSelectUI.cs  # Character selection
│   │   ├── HUD.cs                # In-game HUD
│   │   ├── ActionBar.cs          # Ability buttons
│   │   ├── ChatWindow.cs         # Chat system
│   │   └── TargetFrame.cs        # Target display
│   └── Systems/                  # Game systems
│       ├── CameraController.cs   # Camera follow system
│       ├── InputManager.cs       # Input handling
│       └── InterpolationSystem.cs # Network interpolation
├── Prefabs/                      # Prefabricated objects
│   ├── Player.prefab             # Player character
│   ├── NPC.prefab                # NPC template
│   └── UI/                       # UI prefabs
└── Resources/                    # Dynamically loaded assets
```

## Requirements

- Unity 2022.3 LTS or newer
- NuGet package: NativeWebSocket (for WebSocket support)

## Setup Instructions

1. **Create New Unity Project**
   - Open Unity Hub
   - Create new project with 3D template
   - Copy this folder structure into Assets/

2. **Install WebSocket Package**
   - Open Package Manager (Window > Package Manager)
   - Add package from git URL: https://github.com/endel/NativeWebSocket.git

3. **Configure Scenes**
   - Add scenes to Build Settings in order:
     - LoginScene
     - CharacterSelectScene
     - WorldScene

4. **Set Server Configuration**
   - Edit NetworkManager.cs
   - Update server URLs for your environment

## Architecture Overview

### Network Layer

The network layer uses WebSockets for real-time communication:

```
Client → WebSocketClient → MessageRouter → Handlers
                ↓
         NetworkManager (high-level API)
```

### Entity System

All game entities (players, NPCs, monsters) share a common base:

```
EntityBase
  ├── PlayerCharacter (local player)
  ├── RemotePlayer (other players)
  └── NPCCharacter (NPCs and monsters)
```

### Interpolation

Server authority is maintained through:
- Client-side prediction for responsive feel
- Server reconciliation for corrections
- Interpolation for smooth remote entity movement

### UI System

The UI uses Unity's UGUI system with a modular approach:
- Each UI screen is a separate prefab
- UIManager handles screen transitions
- HUD elements are individually toggleable

## Key Components

### WebSocketClient
Handles the raw WebSocket connection, reconnection logic, and message serialization.

### MessageRouter
Routes incoming server messages to appropriate handlers based on message type.

### PlayerController
Handles local player input and sends commands to the server.
Implements client-side prediction for responsive movement.

### CharacterController
Implements third-person movement with server authority.
Receives position corrections from the server.

### CameraController
Third-person camera with:
- Follow distance and height
- Collision detection
- Smooth transitions

### InterpolationSystem
Smooths remote entity movement using:
- Linear interpolation between server states
- Extrapolation when packets are delayed
- Snap-to-position for large corrections

## Message Types

### Client → Server
- `CONNECT` - Initial connection with JWT token
- `PLAYER_MOVE` - Movement input
- `ATTACK_REQUEST` - Ability usage
- `CHAT` - Chat messages

### Server → Client
- `WELCOME` - Connection accepted
- `ENTITY_UPDATE` - Entity state updates
- `COMBAT_EVENT` - Combat results
- `ENTITY_SPAWN` - New entity in range
- `ENTITY_DESPAWN` - Entity left range

## Building

1. File > Build Settings
2. Select target platform
3. Configure Player Settings
4. Build

## Notes

- This is a client scaffold - not a complete game
- Many systems require server implementation to function
- Assets (models, textures) need to be added separately
- Production would require additional security measures
