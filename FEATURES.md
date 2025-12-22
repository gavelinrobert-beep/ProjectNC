# New Features Implementation

This document describes the newly implemented features for the Fantasy MMORPG project.

## Quest System

The quest system allows players to accept, track, complete, and turn in quests.

### Backend Components

#### API (NestJS)
- **QuestModule**: New module handling quest operations
  - `GET /quests` - List all available quests
  - `GET /quests/:questId` - Get specific quest details
  - `GET /quests/character/:characterId` - Get character's quest progress
  - `POST /quests/accept` - Accept a quest
  - `POST /quests/update-progress` - Update quest objective progress
  - `POST /quests/complete` - Turn in completed quest for rewards
  - `DELETE /quests/abandon/:characterId/:questId` - Abandon a quest

#### GameServer (Go)
- **QuestManager**: Manages quest state for all players
  - Tracks active quests per player
  - Updates objectives based on player actions (kills, collections, interactions)
  - Broadcasts progress updates to clients
  - Notifies on quest completion

#### Database
- Quest definitions with objectives (JSON format)
- Quest progress tracking per character
- Support for multiple objective types: KILL, COLLECT, INTERACT

### Frontend Components (Unity)

#### UI Components
- **QuestLog**: Full quest log UI (toggle with 'L' key)
  - Shows all active quests
  - Displays quest objectives and progress
  - Click to view quest details
  
- **QuestTracker**: On-screen quest objective tracker
  - Shows up to 5 active quests
  - Real-time progress updates
  - Minimalist design for HUD

#### Systems
- **QuestManager**: Handles quest network messages and UI updates
  - Accepts/completes/abandons quests
  - Processes quest progress updates from server
  - Updates both quest log and tracker

### Seeded Quests

Three starter quests are included in the seed data:

1. **The Beginning**: Defeat 5 Forest Wolves
   - Rewards: 50 XP, 10 Gold, Rusty Sword

2. **Kobold Menace**: Collect 8 Kobold Candles
   - Rewards: 100 XP, 25 Gold, Health & Mana Potions

3. **Seek the Blacksmith**: Talk to Blacksmith Argus
   - Rewards: 25 XP, 5 Gold

## Inventory and Equipment System

The inventory system allows players to manage items and equip gear.

### Backend Components

#### API (NestJS)
- **ItemModule**: Item definition management
  - `GET /items` - List all item definitions
  - `GET /items/:itemId` - Get specific item
  - Query filters: `?type=WEAPON` or `?rarity=RARE`

- **InventoryModule**: Inventory management
  - `GET /inventory/:characterId` - Get character's inventory
  - `POST /inventory/add` - Add item to inventory
  - `DELETE /inventory/:inventoryItemId` - Remove item
  - `POST /inventory/move` - Move item to different slot
  - `POST /inventory/equip` - Equip an item
  - `POST /inventory/unequip` - Unequip an item

#### GameServer (Go)
- **InventoryManager**: Manages inventory for all players
  - Tracks items per player (40 bag slots + 10 equipment slots)
  - Handles item stacking and slot management
  - Validates equipment changes
  
#### Database
- Item definitions with stats, rarity, and prices
- Character inventory items with slot positions
- Support for stackable items

### Frontend Components (Unity)

#### UI Components
- **InventoryUI**: Main inventory window (toggle with 'B' key)
  - 40 bag slots in a grid layout
  - Item icons and quantities
  - Drag-and-drop item movement
  - Right-click to use items
  - Gold display

- **CharacterEquipmentUI**: Equipment window (toggle with 'C' key)
  - 10 equipment slots (head, chest, legs, etc.)
  - Visual display of equipped items
  - Drag-and-drop equipping

#### Systems
- **InventoryManager**: Handles inventory network messages and UI updates
  - Manages item additions, removals, and movements
  - Updates both bag and equipment displays
  - Processes item loot notifications

### Seeded Items

#### Weapons
- Rusty Sword (Common, Level 1, 3-7 damage)
- Worn Staff (Common, Level 1, 2-6 damage, +2 Intellect)
- Simple Dagger (Common, Level 1, 2-5 damage, +1 Agility)

#### Armor
- Cloth Robe (Common, Level 1, 5 armor, +1 Intellect)
- Leather Vest (Common, Level 1, 10 armor, +1 Agility)
- Chainmail Armor (Common, Level 1, 15 armor, +2 Stamina)

#### Consumables
- Health Potion (Restores 50 health, stackable x20)
- Mana Potion (Restores 50 mana, stackable x20)

#### Quest Items
- Wolf Pelt
- Kobold Candle

## First Playable Zone: Elwynn Forest

A complete starter zone has been implemented with all necessary data.

### Zone Details
- **Name**: Elwynn Forest
- **Level Range**: 1-10
- **Size**: 1000x1000 units
- **Safe Zones**: 2 spawn points

### NPCs

#### Friendly NPCs
1. **Marshal McBride** (Level 10)
   - Quest giver
   - Location: (505, 0, 505)
   - Offers starter quests

2. **Blacksmith Argus** (Level 15)
   - Vendor
   - Location: (510, 0, 500)
   - Sells weapons and armor

#### Hostile NPCs (Monsters)
1. **Forest Wolf** (Level 2)
   - Health: 80
   - Damage: 3-7
   - Drops: Wolf Pelt (30% chance)
   - Location: (600, 0, 400)

2. **Kobold Worker** (Level 3)
   - Health: 100
   - Damage: 4-8
   - Drops: Kobold Candle (25% chance)
   - Location: (400, 0, 600)

## New Starter Zone: Thornveil Enclave

- **Level Range**: 1-10
- **Size**: 1200x1200 units
- **Spawn Areas**: Brambleheart Spawn (150, 0, 240, r=30), Moonwell Clearing Spawn (-180, 0, 80, r=30)
- **Safe Town Area**: Thornveil Refuge (40, 0, -60, r=45)
- **Progression Exit**: Gate to Sylvaen Capital at (500, 0, -320) leading to Sylvaen Capital entry (75, 0, -45)

### Class Abilities

Each class has a starter ability:

1. **Warrior**: Heroic Strike
   - Costs: 10 Rage
   - Cooldown: 6 seconds
   - Damage: Weapon damage + (Strength × 0.5)

2. **Mage**: Fireball
   - Costs: 30 Mana
   - Cast time: 2 seconds
   - Cooldown: None
   - Damage: 15 + (Intellect × 0.8)

3. **Rogue**: Backstab
   - Costs: 40 Energy
   - Cooldown: None
   - Damage: Weapon damage + (Agility × 0.6)

4. **Priest**: Heal
   - Costs: 40 Mana
   - Cast time: 2.5 seconds
   - Cooldown: None
   - Healing: 50 + (Intellect × 0.7)

## Setup Instructions

### 1. Database Setup

If you haven't already set up the database:

```bash
# Start PostgreSQL (Docker)
npm run docker:db:start

# Run migrations
npm run prisma:migrate

# Seed the database with game data
cd packages/api
npm run prisma:seed
```

### 2. Start Services

You need 2-3 terminal windows:

**Terminal 1 - API Backend:**
```bash
npm run dev:api
# Runs on http://localhost:4000
```

**Terminal 2 - Game Server:**
```bash
npm run dev:gameserver
# Runs on ws://localhost:8080
```

**Terminal 3 (Optional) - Web Frontend:**
```bash
npm run dev:frontend
# Runs on http://localhost:3000
```

### 3. Unity Client

1. Open Unity Hub
2. Open project: `packages/unity-client`
3. Open the `LoginScene`
4. Press Play to start the game

### 4. Testing the Features

#### Testing Quests
1. Create a character and log in
2. Move to Marshal McBride (505, 0, 505)
3. Interact with NPC to accept a quest
4. Press 'L' to open quest log
5. Complete quest objectives
6. Return to NPC and turn in quest

#### Testing Inventory
1. Press 'B' to open inventory
2. Press 'C' to open character equipment
3. Loot items from defeated monsters
4. Drag items to move them
5. Right-click to use consumables
6. Drag equipment to slots to equip

#### Testing Zone
1. Explore the Elwynn Forest zone
2. Find and defeat Forest Wolves
3. Find and defeat Kobold Workers
4. Visit the Blacksmith vendor
5. Complete all three starter quests

## Protocol Messages

### Quest Messages

**Client → Server:**
- `ACCEPT_QUEST`: Accept a quest
- `COMPLETE_QUEST`: Turn in completed quest
- `ABANDON_QUEST`: Abandon a quest
- `INTERACT`: Interact with NPC (for quest dialog)

**Server → Client:**
- `QUEST_PROGRESS`: Quest objective progress update
- `QUEST_COMPLETED`: Quest completion notification with rewards

### Inventory Messages

**Client → Server:**
- `USE_ITEM`: Use a consumable item
- `EQUIP_ITEM`: Equip an item to a slot
- `MOVE_ITEM`: Move item to a different slot

**Server → Client:**
- `INVENTORY_UPDATE`: Full inventory state update
- `ITEM_LOOTED`: Item looted notification

## Future Enhancements

### Quest System
- [ ] Quest chains (prerequisite quests)
- [ ] Daily and weekly quests
- [ ] Repeatable quests
- [ ] Quest dialogue system with branching
- [ ] Quest markers on map
- [ ] Quest sharing in parties

### Inventory System
- [ ] Item durability
- [ ] Item enchantments and gems
- [ ] Bag upgrades (expand slots)
- [ ] Item comparison tooltips
- [ ] Auction house integration
- [ ] Mail system for item transfers

### Zone System
- [ ] Multiple zones with level scaling
- [ ] Zone transitions and loading
- [ ] Mini-map and world map
- [ ] Dynamic weather and time of day
- [ ] Zone-specific music and ambience
- [ ] Phasing for quest progression

## Known Limitations

1. **Quest System**
   - Quest objectives are tracked locally on game server (not persisted to database in real-time)
   - No quest sharing between party members yet
   - Limited to 3 objective types (KILL, COLLECT, INTERACT)

2. **Inventory System**
   - Item icons are placeholders (need actual icon assets)
   - No item tooltips showing stats yet
   - Inventory persistence happens on server disconnect only

3. **Zone System**
   - NPCs and monsters are static (no respawning yet)
   - No collision detection with terrain
   - Monster AI is basic (no pathfinding or aggro radius)

## Contributing

When adding new content:

1. **Quests**: Update `packages/api/prisma/seed.ts` with new quest definitions
2. **Items**: Add item definitions to the seed script
3. **NPCs**: Add NPC data to the seed script with proper positioning
4. **Abilities**: Add to the abilities table in seed script

After updating seed data, run:
```bash
cd packages/api
npm run prisma:seed
```

## Testing Checklist

- [x] API builds without errors
- [x] GameServer builds without errors
- [x] Database seeding works
- [ ] Quest acceptance flow works
- [ ] Quest objectives update properly
- [ ] Quest completion gives rewards
- [ ] Inventory UI displays items
- [ ] Equipment can be equipped/unequipped
- [ ] Items can be moved between slots
- [ ] NPCs are spawned in zone
- [ ] Monster combat and drops work

## Documentation

- Main README: [README.md](./README.md)
- Quick Start: [QUICKSTART.md](./QUICKSTART.md)
- Unity Setup: [packages/unity-client/UNITY_SETUP.md](./packages/unity-client/UNITY_SETUP.md)
- Troubleshooting: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
