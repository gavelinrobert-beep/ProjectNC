-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "characters" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "race" TEXT NOT NULL,
    "class" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "experience" INTEGER NOT NULL DEFAULT 0,
    "strength" INTEGER NOT NULL DEFAULT 10,
    "agility" INTEGER NOT NULL DEFAULT 10,
    "intellect" INTEGER NOT NULL DEFAULT 10,
    "stamina" INTEGER NOT NULL DEFAULT 10,
    "spirit" INTEGER NOT NULL DEFAULT 10,
    "maxHealth" INTEGER NOT NULL DEFAULT 100,
    "maxMana" INTEGER NOT NULL DEFAULT 100,
    "currentHealth" INTEGER NOT NULL DEFAULT 100,
    "currentMana" INTEGER NOT NULL DEFAULT 100,
    "zoneId" TEXT NOT NULL DEFAULT 'starter_zone',
    "x" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "y" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "z" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rotation" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLogin" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "characters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_definitions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "rarity" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "slot" TEXT,
    "armor" INTEGER,
    "weaponMinDmg" INTEGER,
    "weaponMaxDmg" INTEGER,
    "bonusStrength" INTEGER,
    "bonusAgility" INTEGER,
    "bonusIntellect" INTEGER,
    "bonusStamina" INTEGER,
    "bonusSpirit" INTEGER,
    "maxStack" INTEGER NOT NULL DEFAULT 1,
    "sellPrice" INTEGER NOT NULL DEFAULT 0,
    "buyPrice" INTEGER,

    CONSTRAINT "item_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_items" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "itemDefinitionId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "slot" INTEGER NOT NULL,

    CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quests" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "requiredLevel" INTEGER NOT NULL DEFAULT 1,
    "objectivesJson" TEXT NOT NULL,
    "experienceReward" INTEGER NOT NULL DEFAULT 0,
    "goldReward" INTEGER NOT NULL DEFAULT 0,
    "itemRewardsJson" TEXT,

    CONSTRAINT "quests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quest_progress" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "questId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "progressJson" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "quest_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zones" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "minLevel" INTEGER NOT NULL DEFAULT 1,
    "maxLevel" INTEGER NOT NULL DEFAULT 60,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "safeZonesJson" TEXT NOT NULL,

    CONSTRAINT "zones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "npcs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "type" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "x" DOUBLE PRECISION NOT NULL,
    "y" DOUBLE PRECISION NOT NULL,
    "z" DOUBLE PRECISION NOT NULL,
    "isQuestGiver" BOOLEAN NOT NULL DEFAULT false,
    "isVendor" BOOLEAN NOT NULL DEFAULT false,
    "isHostile" BOOLEAN NOT NULL DEFAULT false,
    "health" INTEGER,
    "minDamage" INTEGER,
    "maxDamage" INTEGER,
    "lootTableJson" TEXT,

    CONSTRAINT "npcs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "abilities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "classRequired" TEXT NOT NULL,
    "levelRequired" INTEGER NOT NULL DEFAULT 1,
    "manaCost" INTEGER NOT NULL DEFAULT 0,
    "energyCost" INTEGER NOT NULL DEFAULT 0,
    "rageCost" INTEGER NOT NULL DEFAULT 0,
    "cooldown" INTEGER NOT NULL DEFAULT 0,
    "castTime" INTEGER NOT NULL DEFAULT 0,
    "globalCooldown" INTEGER NOT NULL DEFAULT 1500,
    "range" INTEGER NOT NULL DEFAULT 5,
    "requiresTarget" BOOLEAN NOT NULL DEFAULT true,
    "canTargetSelf" BOOLEAN NOT NULL DEFAULT false,
    "damageFormula" TEXT,
    "healFormula" TEXT,
    "effectsJson" TEXT,

    CONSTRAINT "abilities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_email_key" ON "accounts"("email");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_username_key" ON "accounts"("username");

-- CreateIndex
CREATE UNIQUE INDEX "characters_name_key" ON "characters"("name");

-- CreateIndex
CREATE INDEX "characters_accountId_idx" ON "characters"("accountId");

-- CreateIndex
CREATE INDEX "inventory_items_characterId_idx" ON "inventory_items"("characterId");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_items_characterId_slot_key" ON "inventory_items"("characterId", "slot");

-- CreateIndex
CREATE INDEX "quest_progress_characterId_idx" ON "quest_progress"("characterId");

-- CreateIndex
CREATE UNIQUE INDEX "quest_progress_characterId_questId_key" ON "quest_progress"("characterId", "questId");

-- CreateIndex
CREATE INDEX "npcs_zoneId_idx" ON "npcs"("zoneId");

-- CreateIndex
CREATE INDEX "abilities_classRequired_idx" ON "abilities"("classRequired");

-- AddForeignKey
ALTER TABLE "characters" ADD CONSTRAINT "characters_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quest_progress" ADD CONSTRAINT "quest_progress_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quest_progress" ADD CONSTRAINT "quest_progress_questId_fkey" FOREIGN KEY ("questId") REFERENCES "quests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
