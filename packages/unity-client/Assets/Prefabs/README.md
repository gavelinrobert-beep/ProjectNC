# Prefabs Directory

This directory contains Unity prefabs for game entities and UI elements.

## Structure

- **/Player** - Player character prefabs
- **/NPC** - NPC and monster prefabs
- **/Environment** - Environmental objects (trees, rocks, buildings)
- **/UI** - UI element prefabs (nameplate, floating text, etc.)

## Required Prefabs (MVP)

### Player Prefabs
- **Player.prefab** - Local player character with PlayerController
  - CharacterController component
  - PlayerController script
  - CharacterAnimator script
  - Capsule mesh (placeholder)
  - Nameplate attached

### NPC/Monster Prefabs
- **NPC.prefab** - Friendly NPC
  - RemoteCharacter script
  - CharacterAnimator script
  - Capsule mesh (placeholder, green color)
  - Nameplate attached

- **Monster.prefab** - Hostile monster
  - RemoteCharacter script
  - CharacterAnimator script
  - Capsule mesh (placeholder, red color)
  - Nameplate attached

### UI Prefabs
- **Nameplate.prefab** - Entity nameplate
  - Canvas (WorldSpace)
  - Name text
  - Level text
  - Health bar

- **FloatingText.prefab** - Floating combat text
  - Canvas (WorldSpace)
  - TextMeshPro component
  
### Environment Prefabs (Future)
- Trees, rocks, buildings for zone decoration
