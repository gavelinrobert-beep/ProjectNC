# Game Server (Go)

Authoritative real-time game server for Fantasy MMORPG.

## Architecture

The game server follows an ECS-style architecture:

- **Entities**: Players, NPCs, Monsters
- **Components**: Position, Stats, Combat, AI
- **Systems**: Movement, Combat, AI, Networking

## Key Features

- **Fixed Tick Rate**: 20 ticks per second for deterministic gameplay
- **Authoritative Server**: All game logic runs server-side
- **WebSocket Communication**: Real-time bi-directional messaging
- **Combat System**: Ability execution, damage calculation, cooldowns
- **Anti-Cheat**: Input validation, rate limiting, server authority

## Running

```bash
go run cmd/server/main.go
```

Server will start on `ws://localhost:8080`

## Future Enhancements

- Spatial partitioning for efficient nearby entity queries
- Pathfinding for NPCs (A* algorithm)
- AI behavior trees for complex NPC behaviors
- Zone instancing for dungeons
- Load balancing across multiple server instances
