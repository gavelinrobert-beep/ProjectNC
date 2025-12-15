# Scenes Directory

This directory contains Unity scenes for the game.

## Required Scenes (MVP)

### 1. LoginScene.unity
**Purpose**: Player authentication

**Setup**:
- UI Canvas with LoginUI component
- Username input field
- Password input field
- Login button
- Register button
- Error text display
- Loading overlay

**Required GameObjects**:
- GameManager (persists across scenes)
- NetworkManager (persists across scenes)
- EventSystem

### 2. CharacterSelectScene.unity
**Purpose**: Character selection and creation

**Setup**:
- UI Canvas with CharacterSelectUI component
- Character list display
- Character creation form
- Play button
- Back to login button

**Required GameObjects**:
- GameManager
- NetworkManager
- EventSystem
- Camera (static for UI)

### 3. WorldScene.unity
**Purpose**: Main 3D game world

**Setup**:
- TerrainManager with ground plane
- ZoneManager
- EntityManager
- CombatVisualizer
- InterpolationSystem
- InputManager
- Main Camera with CameraController
- Directional Light
- HUD Canvas
  - HUD component
  - ActionBar component
  - ChatWindow component
  - TargetFrame component
- TargetIndicator
- FloatingCombatText manager
- EventSystem

**Hierarchy Example**:
```
WorldScene
├── GameManager (DontDestroyOnLoad)
├── NetworkManager (DontDestroyOnLoad)
├── Systems
│   ├── TerrainManager
│   ├── ZoneManager
│   ├── EntityManager
│   ├── CombatVisualizer
│   ├── InterpolationSystem
│   └── InputManager
├── Main Camera
│   └── CameraController
├── Directional Light
├── Environment
│   └── Ground (created by TerrainManager)
├── UI
│   ├── HUDCanvas
│   │   ├── HUD
│   │   ├── ActionBar
│   │   ├── ChatWindow
│   │   └── TargetFrame
│   ├── TargetIndicator
│   └── FloatingCombatText
└── EventSystem
```

## Scene Build Settings

Add scenes to Build Settings in this order:
1. LoginScene (index 0)
2. CharacterSelectScene (index 1)
3. WorldScene (index 2)
