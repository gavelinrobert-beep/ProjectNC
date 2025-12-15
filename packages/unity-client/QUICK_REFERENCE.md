# Unity 3D Client - Quick Reference

Fast reference for common tasks and system overview.

## 📋 Table of Contents

- [System Architecture](#system-architecture)
- [Key Scripts Reference](#key-scripts-reference)
- [Network Protocol](#network-protocol)
- [Common Tasks](#common-tasks)
- [Debug Commands](#debug-commands)

---

## System Architecture

### Core Managers (Singleton Pattern)

| Manager | Purpose | Location |
|---------|---------|----------|
| `GameManager` | Game state, scene management | Core/ |
| `NetworkManager` | High-level networking API | Network/ |
| `EntityManager` | Entity spawning/lifecycle | World/ |
| `TerrainManager` | Terrain rendering | World/ |
| `ZoneManager` | Zone loading/transitions | World/ |
| `InputManager` | Unified input handling | Systems/ |
| `CameraController` | Third-person camera | Systems/ |
| `InterpolationSystem` | Network smoothing | Systems/ |
| `CombatVisualizer` | Combat effects | World/ |
| `WorldController` | World orchestration | World/ |

### UI Components

| Component | Purpose | Type |
|-----------|---------|------|
| `HUD` | Player stats, bars | Singleton |
| `LoginUI` | Authentication | Scene-specific |
| `CharacterSelectUI` | Character selection | Scene-specific |
| `ActionBar` | Ability hotkeys | Singleton |
| `ChatWindow` | In-game chat | Singleton |
| `TargetFrame` | Target info | Singleton |
| `Nameplate` | Entity labels | Per-entity |
| `FloatingCombatText` | Damage numbers | Pooled |
| `TargetIndicator` | Selection ring | Singleton |

### Entity Types

```
EntityBase (via scripts, not inheritance)
├── Local Player: PlayerController + CharacterController
├── Remote Player: RemoteCharacter (with interpolation)
└── NPC/Monster: RemoteCharacter (server-driven AI)
```

---

## Key Scripts Reference

### GameManager.cs

```csharp
// Access
GameManager.Instance

// Properties
.CurrentState          // GameState enum (Login, CharacterSelect, InGame, etc.)
.IsInGame             // bool
.IsPaused             // bool

// Methods
.LoadLoginScene()
.LoadCharacterSelectScene()
.LoadWorldScene()
.SetState(GameState newState)
.QuitGame()
.Logout()
```

### NetworkManager.cs

```csharp
// Access
NetworkManager.Instance

// Properties
.IsConnected          // bool
.PlayerId             // string
.CurrentCharacter     // CharacterData

// Methods
.ConnectToGameServer(string token, string characterId)
.Disconnect()
.SendMove(Vector3 position, string moveType)
.SendAttack(string abilityId, string targetId, Vector3 position)
.SendChat(string channel, string message)

// Events
.OnConnectionEstablished
.OnConnectionLost
.OnWelcomeReceived
.OnEntityUpdated
.OnCombatEvent
.OnEntitySpawned
.OnEntityDespawned
```

### EntityManager.cs

```csharp
// Access
EntityManager.Instance

// Properties
.LocalPlayer          // GameObject (local player)
.EntityCount          // int

// Methods
.GetEntity(string entityId)                    // Get entity by ID
.SpawnLocalPlayer(string id, string name, Vector3 pos)
.SpawnEntity(EntityUpdatePayload data)
.DespawnEntity(string entityId)
.ClearAllEntities()
```

### InputManager.cs

```csharp
// Access
InputManager.Instance

// Properties
.IsInputEnabled       // bool
.IsChatFocused       // bool
.IsUIFocused         // bool
.MouseSensitivity    // float

// Methods
.GetMovementInput()             // Vector2 (horizontal, vertical)
.GetJumpPressed()              // bool
.GetSprintHeld()               // bool
.GetCameraRotationInput()      // Vector2 (mouse delta)
.GetCameraZoomInput()          // float (scroll wheel)
.GetActionBarKeyPressed()      // int (0-9, -1 if none)
.IsPointerOverUI()             // bool
```

### CameraController.cs

```csharp
// Properties
.Target               // Transform (character to follow)
.Distance            // float (camera distance)

// Methods
.SetTarget(Transform newTarget)
.ResetPosition()
.Shake(float intensity, float duration)
.ZoomTo(float distance, float duration)
```

---

## Network Protocol

### Message Structure

```json
{
  "type": "MESSAGE_TYPE",
  "payload": { ... }
}
```

### Client → Server

| Type | Payload | Description |
|------|---------|-------------|
| `CONNECT` | `{token, characterId}` | Initial connection |
| `PLAYER_MOVE` | `{x, y, z, moveType, timestamp}` | Movement input |
| `ATTACK_REQUEST` | `{abilityId, targetEntityId, x, y, z, timestamp}` | Ability use |
| `CHAT` | `{channel, message, targetPlayerId?}` | Chat message |

### Server → Client

| Type | Payload | Description |
|------|---------|-------------|
| `WELCOME` | `{playerId, character, serverTime}` | Connection accepted |
| `ENTITY_UPDATE` | `{entityId, type, x, y, z, rotation, ...}` | Entity state |
| `COMBAT_EVENT` | `{type, sourceEntityId, targetEntityId, value, ...}` | Combat result |
| `ENTITY_SPAWN` | `{entity}` | New entity |
| `ENTITY_DESPAWN` | `{entityId}` | Entity removed |

### Example: Sending Movement

```csharp
NetworkManager.Instance.SendMove(
    transform.position,  // Vector3 position
    "RUN"               // string moveType (WALK/RUN/JUMP)
);
```

### Example: Handling Entity Update

```csharp
// Automatically handled by EntityManager
NetworkManager.Instance.OnEntityUpdated += (payload) => {
    // EntityManager receives and updates entity
};
```

---

## Common Tasks

### Add New Message Type

1. **Define in MessageRouter.cs:**
```csharp
public const string NEW_MESSAGE = "NEW_MESSAGE";
```

2. **Create payload class:**
```csharp
[Serializable]
public class NewMessagePayload {
    public string someData;
}
```

3. **Register handler:**
```csharp
messageRouter.RegisterHandler(MessageType.NEW_MESSAGE, HandleNewMessage);
```

4. **Implement handler:**
```csharp
private void HandleNewMessage(string json) {
    var wrapper = JsonUtility.FromJson<MessageWrapper<NewMessagePayload>>(json);
    // Handle message
}
```

### Spawn Custom Entity

```csharp
// Server sends ENTITY_SPAWN with EntityUpdatePayload
// EntityManager automatically spawns it

// To customize spawned entity:
GameObject entity = EntityManager.Instance.GetEntity(entityId);
if (entity != null) {
    // Customize entity
}
```

### Add UI Element

1. **Create in scene hierarchy**
2. **Add script component**
3. **Connect references in Inspector**
4. **Hook up events:**

```csharp
void Start() {
    if (NetworkManager.Instance != null) {
        NetworkManager.Instance.OnSomeEvent += HandleEvent;
    }
}

void OnDestroy() {
    if (NetworkManager.Instance != null) {
        NetworkManager.Instance.OnSomeEvent -= HandleEvent;
    }
}
```

### Show Floating Combat Text

```csharp
FloatingCombatText.Instance.Show(
    worldPosition,      // Vector3
    "123",             // string text
    Color.red,         // Color
    1.5f               // float scale (optional)
);

// Or use helpers
FloatingCombatText.Instance.ShowDamage(worldPosition, 123, isCritical: true);
FloatingCombatText.Instance.ShowHeal(worldPosition, 50);
```

### Change Zone

```csharp
ZoneManager.Instance.TransitionToZone(
    "zone_id",          // string zoneId
    new Vector3(0,0,0)  // Vector3 entryPosition
);
```

### Access Local Player

```csharp
GameObject player = EntityManager.Instance.LocalPlayer;

if (player != null) {
    var controller = player.GetComponent<PlayerController>();
    // Use controller
}
```

### Update HUD

```csharp
HUD.Instance.SetHealth(current, max);
HUD.Instance.SetMana(current, max);
HUD.Instance.SetPlayerName("PlayerName");
HUD.Instance.StartCastBar("Fireball", 2.5f);
HUD.Instance.StopCastBar();
```

---

## Debug Commands

### Toggle Debug Overlays

Press **F3** during play to show/hide debug info.

### Console Commands (via Debug.Log)

```csharp
// Check if systems are initialized
Debug.Log($"GameManager: {GameManager.Instance != null}");
Debug.Log($"NetworkManager: {NetworkManager.Instance != null}");
Debug.Log($"Connected: {NetworkManager.Instance?.IsConnected}");

// Check entities
Debug.Log($"Entity count: {EntityManager.Instance?.EntityCount}");
Debug.Log($"Local player: {EntityManager.Instance?.LocalPlayer != null}");

// Check input
Debug.Log($"Input enabled: {InputManager.Instance?.IsInputEnabled}");
Debug.Log($"Movement: {InputManager.Instance?.GetMovementInput()}");
```

### Scene Verification

```csharp
// Check scene objects exist
Debug.Log($"Camera: {Camera.main != null}");
Debug.Log($"EventSystem: {FindObjectOfType<UnityEngine.EventSystems.EventSystem>() != null}");
```

### Force Disconnect

```csharp
NetworkManager.Instance.Disconnect();
```

### Return to Login

```csharp
GameManager.Instance.LoadLoginScene();
```

---

## Performance Monitoring

### Unity Profiler

1. **Window → Analysis → Profiler**
2. **Enable Deep Profiling** (optional, slower)
3. **Press Play**
4. **Monitor:**
   - CPU usage
   - Memory allocation
   - GC spikes
   - Rendering stats

### Key Metrics

| Metric | Target | Action if Exceeded |
|--------|--------|-------------------|
| FPS | 60+ | Reduce quality, optimize |
| Entity Count | 100 | Implement distance culling |
| Network Messages/sec | 20-30 | Batch messages |
| Memory Usage | < 500 MB | Profile and optimize |
| Draw Calls | < 1000 | Batch rendering |

---

## File Locations

### Scripts
```
Assets/Scripts/
├── Core/GameManager.cs
├── Network/NetworkManager.cs, WebSocketClient.cs, MessageRouter.cs
├── World/EntityManager.cs, TerrainManager.cs, ZoneManager.cs, CombatVisualizer.cs, WorldController.cs
├── Characters/PlayerController.cs, RemoteCharacter.cs
├── Animations/CharacterAnimator.cs
├── UI/HUD.cs, LoginUI.cs, CharacterSelectUI.cs, ActionBar.cs, ChatWindow.cs, TargetFrame.cs, FloatingCombatText.cs, Nameplate.cs, TargetIndicator.cs
└── Systems/CameraController.cs, InputManager.cs, InterpolationSystem.cs
```

### Scenes
```
Assets/Scenes/
├── LoginScene.unity
├── CharacterSelectScene.unity
└── WorldScene.unity
```

### Prefabs
```
Assets/Prefabs/
├── Player/Player.prefab
├── NPC/NPC.prefab, Monster.prefab
├── Environment/
└── UI/Nameplate.prefab, FloatingText.prefab
```

---

## Useful Unity Shortcuts

| Shortcut | Action |
|----------|--------|
| **Ctrl + P** | Play/Stop |
| **Ctrl + Shift + P** | Pause |
| **F** | Frame selected object |
| **T** | Toggle pivot/center |
| **Ctrl + D** | Duplicate |
| **Ctrl + Shift + F** | Align view to object |
| **Q/W/E/R** | Hand/Move/Rotate/Scale tool |

---

## Testing Checklist

### Pre-Play Checklist

- [ ] All services running (DB, API, Game Server)
- [ ] NetworkManager URLs configured correctly
- [ ] All required GameObjects in scene
- [ ] EventSystem present for UI
- [ ] Camera has CameraController script

### In-Game Checklist

- [ ] Player spawns correctly
- [ ] Camera follows player
- [ ] WASD movement works
- [ ] Camera rotation (right-click) works
- [ ] Health/mana bars display
- [ ] Chat input works
- [ ] Target selection works
- [ ] Combat effects display
- [ ] No console errors

---

## Links

- [Full Setup Guide](./UNITY_SETUP.md)
- [Integration Guide](./INTEGRATION.md)
- [Prefab Documentation](./Assets/Prefabs/README.md)
- [Scene Documentation](./Assets/Scenes/README.md)
- [Main README](./README.md)

---

**Last Updated**: December 2024  
**Version**: 1.0
