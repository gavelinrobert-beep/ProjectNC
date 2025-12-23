import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Seed Starter Zone
  await prisma.zone.upsert({
    where: { id: 'elwynn_forest' },
    update: {},
    create: {
      id: 'elwynn_forest',
      name: 'Elwynn Forest',
      description: 'A peaceful forest near the human capital, perfect for beginning adventurers.',
      minLevel: 1,
      maxLevel: 10,
      width: 1000,
      height: 1000,
      safeZonesJson: JSON.stringify([
        { name: 'Northshire Abbey Spawn', type: 'spawn', x: 500, y: 0, z: 500, radius: 25 },
        { name: 'Eastvale Logging Camp Spawn', type: 'spawn', x: 300, y: 0, z: 300, radius: 25 },
      ]),
    },
  });

  await prisma.zone.upsert({
    where: { id: 'thornveil_enclave' },
    update: {},
    create: {
      id: 'thornveil_enclave',
      name: 'Thornveil Enclave',
      description: 'Sylvan outpost nestled within towering briar groves, serving as the elven starting grounds.',
      minLevel: 1,
      maxLevel: 10,
      width: 1200,
      height: 1200,
      safeZonesJson: JSON.stringify([
        { name: 'Brambleheart Spawn', type: 'spawn', x: 320, y: 0, z: 280, radius: 30 },
        { name: 'Moonwell Clearing Spawn', type: 'spawn', x: 640, y: 0, z: 360, radius: 30 },
        { name: 'Thornveil Refuge', type: 'town', x: 520, y: 0, z: 520, radius: 45 },
        {
          name: 'Gate to Sylvaen Capital',
          type: 'exit',
          x: 1120,
          y: 0,
          z: 1040,
          radius: 15,
          targetZoneId: 'sylvaen_capital',
          entry: { x: 75, y: 0, z: 45 },
        },
      ]),
    },
  });

  await prisma.zone.upsert({
    where: { id: 'sylvaen_capital' },
    update: {},
    create: {
      id: 'sylvaen_capital',
      name: 'Sylvaen Capital',
      description: 'Ancient heart of the Sylvaen, reached after completing the Thornveil Enclave journey.',
      minLevel: 10,
      maxLevel: 60,
      width: 1600,
      height: 1600,
      safeZonesJson: JSON.stringify([
        { name: 'Grand Plaza Arrival', type: 'spawn', x: 75, y: 0, z: 45, radius: 35 },
      ]),
    },
  });

  // Seed Item Definitions
  const items = [
    // Weapons
    {
      id: 'rusty_sword',
      name: 'Rusty Sword',
      description: 'A worn blade, better than nothing.',
      type: 'WEAPON',
      rarity: 'COMMON',
      level: 1,
      slot: 'MAIN_HAND',
      weaponMinDmg: 3,
      weaponMaxDmg: 7,
      sellPrice: 5,
      buyPrice: 25,
    },
    {
      id: 'worn_staff',
      name: 'Worn Staff',
      description: 'A simple wooden staff.',
      type: 'WEAPON',
      rarity: 'COMMON',
      level: 1,
      slot: 'MAIN_HAND',
      weaponMinDmg: 2,
      weaponMaxDmg: 6,
      bonusIntellect: 2,
      sellPrice: 5,
      buyPrice: 25,
    },
    {
      id: 'simple_dagger',
      name: 'Simple Dagger',
      description: 'A basic dagger for quick strikes.',
      type: 'WEAPON',
      rarity: 'COMMON',
      level: 1,
      slot: 'MAIN_HAND',
      weaponMinDmg: 2,
      weaponMaxDmg: 5,
      bonusAgility: 1,
      sellPrice: 4,
      buyPrice: 20,
    },
    // Armor
    {
      id: 'cloth_robe',
      name: 'Cloth Robe',
      description: 'Simple cloth robes.',
      type: 'ARMOR',
      rarity: 'COMMON',
      level: 1,
      slot: 'CHEST',
      armor: 5,
      bonusIntellect: 1,
      sellPrice: 3,
      buyPrice: 15,
    },
    {
      id: 'leather_vest',
      name: 'Leather Vest',
      description: 'Basic leather protection.',
      type: 'ARMOR',
      rarity: 'COMMON',
      level: 1,
      slot: 'CHEST',
      armor: 10,
      bonusAgility: 1,
      sellPrice: 4,
      buyPrice: 20,
    },
    {
      id: 'chainmail_armor',
      name: 'Chainmail Armor',
      description: 'Sturdy chainmail protection.',
      type: 'ARMOR',
      rarity: 'COMMON',
      level: 1,
      slot: 'CHEST',
      armor: 15,
      bonusStamina: 2,
      sellPrice: 5,
      buyPrice: 25,
    },
    // Consumables
    {
      id: 'health_potion',
      name: 'Health Potion',
      description: 'Restores 50 health.',
      type: 'CONSUMABLE',
      rarity: 'COMMON',
      level: 1,
      maxStack: 20,
      sellPrice: 1,
      buyPrice: 5,
    },
    {
      id: 'mana_potion',
      name: 'Mana Potion',
      description: 'Restores 50 mana.',
      type: 'CONSUMABLE',
      rarity: 'COMMON',
      level: 1,
      maxStack: 20,
      sellPrice: 1,
      buyPrice: 5,
    },
    // Quest Items
    {
      id: 'wolf_pelt',
      name: 'Wolf Pelt',
      description: 'A pelt from a forest wolf.',
      type: 'QUEST_ITEM',
      rarity: 'COMMON',
      level: 1,
      maxStack: 20,
      sellPrice: 0,
    },
    {
      id: 'kobold_candle',
      name: 'Kobold Candle',
      description: 'A candle carried by kobolds.',
      type: 'QUEST_ITEM',
      rarity: 'COMMON',
      level: 1,
      maxStack: 20,
      sellPrice: 0,
    },
  ];

  for (const item of items) {
    await prisma.itemDefinition.upsert({
      where: { id: item.id },
      update: {},
      create: item,
    });
  }

  // Seed NPCs
  const npcs = [
    {
      id: 'marshal_mcbride',
      name: 'Marshal McBride',
      level: 10,
      type: 'NPC',
      zoneId: 'elwynn_forest',
      x: 505,
      y: 0,
      z: 505,
      isQuestGiver: true,
      isVendor: false,
      isHostile: false,
    },
    {
      id: 'vendor_smith',
      name: 'Blacksmith Argus',
      level: 15,
      type: 'NPC',
      zoneId: 'elwynn_forest',
      x: 510,
      y: 0,
      z: 500,
      isQuestGiver: false,
      isVendor: true,
      isHostile: false,
    },
    {
      id: 'forest_wolf',
      name: 'Forest Wolf',
      level: 2,
      type: 'MONSTER',
      zoneId: 'elwynn_forest',
      x: 600,
      y: 0,
      z: 400,
      isQuestGiver: false,
      isVendor: false,
      isHostile: true,
      health: 80,
      minDamage: 3,
      maxDamage: 7,
      lootTableJson: JSON.stringify([
        { itemId: 'wolf_pelt', chance: 0.3 },
      ]),
    },
    {
      id: 'kobold_worker',
      name: 'Kobold Worker',
      level: 3,
      type: 'MONSTER',
      zoneId: 'elwynn_forest',
      x: 400,
      y: 0,
      z: 600,
      isQuestGiver: false,
      isVendor: false,
      isHostile: true,
      health: 100,
      minDamage: 4,
      maxDamage: 8,
      lootTableJson: JSON.stringify([
        { itemId: 'kobold_candle', chance: 0.25 },
      ]),
    },
    {
      id: 'keeper_elowen',
      name: 'Keeper Elowen',
      level: 12,
      type: 'NPC',
      zoneId: 'thornveil_enclave',
      x: 520,
      y: 0,
      z: 520,
      isQuestGiver: true,
      isVendor: false,
      isHostile: false,
    },
    {
      id: 'thornling_skirmisher',
      name: 'Thornling Skirmisher',
      level: 2,
      type: 'MONSTER',
      zoneId: 'thornveil_enclave',
      x: 460,
      y: 0,
      z: 540,
      isQuestGiver: false,
      isVendor: false,
      isHostile: true,
      health: 85,
      minDamage: 4,
      maxDamage: 9,
      lootTableJson: JSON.stringify([]),
    },
  ];

  for (const npc of npcs) {
    await prisma.nPC.upsert({
      where: { id: npc.id },
      update: {},
      create: npc,
    });
  }

  // Seed Quests
  const quests = [
    {
      id: 'the_beginning',
      name: 'The Beginning',
      description: 'Marshal McBride has asked you to prove your worth by defeating forest wolves.',
      level: 1,
      requiredLevel: 1,
      objectivesJson: JSON.stringify([
        {
          id: 'kill_wolves',
          description: 'Defeat Forest Wolves',
          type: 'KILL',
          targetId: 'forest_wolf',
          required: 5,
        },
      ]),
      experienceReward: 50,
      goldReward: 10,
      itemRewardsJson: JSON.stringify(['rusty_sword']),
    },
    {
      id: 'kobold_menace',
      name: 'Kobold Menace',
      description: 'The kobolds have been stealing supplies. Collect their candles as proof of your deeds.',
      level: 2,
      requiredLevel: 2,
      objectivesJson: JSON.stringify([
        {
          id: 'collect_candles',
          description: 'Collect Kobold Candles',
          type: 'COLLECT',
          targetId: 'kobold_candle',
          required: 8,
        },
      ]),
      experienceReward: 100,
      goldReward: 25,
      itemRewardsJson: JSON.stringify(['health_potion', 'health_potion', 'mana_potion']),
    },
    {
      id: 'seek_the_blacksmith',
      name: 'Seek the Blacksmith',
      description: 'Find Blacksmith Argus and speak with him.',
      level: 1,
      requiredLevel: 1,
      objectivesJson: JSON.stringify([
        {
          id: 'talk_to_smith',
          description: 'Speak with Blacksmith Argus',
          type: 'INTERACT',
          targetId: 'vendor_smith',
          required: 1,
        },
      ]),
      experienceReward: 25,
      goldReward: 5,
    },
    {
      id: 'first_roots',
      name: 'First Roots',
      description:
        'Keeper Elowen asks you to thin the Thornling Skirmishers threatening Thornveil Enclave and report back to her.',
      level: 1,
      requiredLevel: 1,
      objectivesJson: JSON.stringify([
        {
          id: 'slay_thornlings',
          description: 'Slay Thornling Skirmishers',
          type: 'KILL',
          targetId: 'thornling_skirmisher',
          required: 5,
        },
      ]),
      experienceReward: 70,
      goldReward: 0,
      itemRewardsJson: JSON.stringify([]),
    },
  ];

  for (const quest of quests) {
    await prisma.quest.upsert({
      where: { id: quest.id },
      update: {},
      create: quest,
    });
  }

  // Seed some abilities
  const abilities = [
    {
      id: 'heroic_strike',
      name: 'Heroic Strike',
      description: 'A strong melee attack.',
      classRequired: 'WARRIOR',
      levelRequired: 1,
      manaCost: 0,
      energyCost: 0,
      rageCost: 10,
      cooldown: 6000,
      castTime: 0,
      globalCooldown: 1500,
      range: 5,
      requiresTarget: true,
      canTargetSelf: false,
      damageFormula: 'weaponDamage + (strength * 0.5)',
    },
    {
      id: 'fireball',
      name: 'Fireball',
      description: 'Hurls a fiery ball at the target.',
      classRequired: 'MAGE',
      levelRequired: 1,
      manaCost: 30,
      energyCost: 0,
      rageCost: 0,
      cooldown: 0,
      castTime: 2000,
      globalCooldown: 1500,
      range: 30,
      requiresTarget: true,
      canTargetSelf: false,
      damageFormula: '15 + (intellect * 0.8)',
    },
    {
      id: 'backstab',
      name: 'Backstab',
      description: 'A vicious strike from behind.',
      classRequired: 'ROGUE',
      levelRequired: 1,
      manaCost: 0,
      energyCost: 40,
      rageCost: 0,
      cooldown: 0,
      castTime: 0,
      globalCooldown: 1500,
      range: 5,
      requiresTarget: true,
      canTargetSelf: false,
      damageFormula: 'weaponDamage + (agility * 0.6)',
    },
    {
      id: 'heal',
      name: 'Heal',
      description: 'Heals a friendly target.',
      classRequired: 'PRIEST',
      levelRequired: 1,
      manaCost: 40,
      energyCost: 0,
      rageCost: 0,
      cooldown: 0,
      castTime: 2500,
      globalCooldown: 1500,
      range: 40,
      requiresTarget: true,
      canTargetSelf: true,
      healFormula: '50 + (intellect * 0.7)',
    },
  ];

  for (const ability of abilities) {
    await prisma.ability.upsert({
      where: { id: ability.id },
      update: {},
      create: ability,
    });
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
