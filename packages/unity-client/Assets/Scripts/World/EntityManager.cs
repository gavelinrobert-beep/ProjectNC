using System.Collections.Generic;
using UnityEngine;
using MMORPG.Characters;
using MMORPG.Network;

namespace MMORPG.World
{
    /// <summary>
    /// EntityManager handles spawning, despawning, and tracking of all entities in the world.
    /// Entities include players, NPCs, monsters, and interactive objects.
    /// </summary>
    public class EntityManager : MonoBehaviour
    {
        #region Singleton
        
        public static EntityManager Instance { get; private set; }
        
        #endregion

        #region Configuration
        
        [Header("Prefabs")]
        [SerializeField] private GameObject playerPrefab;
        [SerializeField] private GameObject npcPrefab;
        [SerializeField] private GameObject monsterPrefab;
        [SerializeField] private GameObject objectPrefab;
        
        [Header("Settings")]
        [SerializeField] private Transform entityContainer;
        
        #endregion

        #region State
        
        private Dictionary<string, GameObject> entities = new Dictionary<string, GameObject>();
        private string localPlayerId;
        
        #endregion

        #region Properties
        
        public int EntityCount => entities.Count;
        public GameObject LocalPlayer => localPlayerId != null && entities.ContainsKey(localPlayerId) 
            ? entities[localPlayerId] 
            : null;
        
        #endregion

        #region Unity Lifecycle
        
        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            
            Instance = this;
            
            if (entityContainer == null)
            {
                entityContainer = transform;
            }
        }
        
        private void Start()
        {
            // Subscribe to network events
            if (NetworkManager.Instance != null)
            {
                NetworkManager.Instance.OnWelcomeReceived += HandleWelcome;
                NetworkManager.Instance.OnEntitySpawned += HandleEntitySpawn;
                NetworkManager.Instance.OnEntityDespawned += HandleEntityDespawn;
                NetworkManager.Instance.OnEntityUpdated += HandleEntityUpdate;
                NetworkManager.Instance.OnCombatEvent += HandleCombatEvent;
            }
        }
        
        private void OnDestroy()
        {
            if (Instance == this)
            {
                Instance = null;
            }
            
            if (NetworkManager.Instance != null)
            {
                NetworkManager.Instance.OnWelcomeReceived -= HandleWelcome;
                NetworkManager.Instance.OnEntitySpawned -= HandleEntitySpawn;
                NetworkManager.Instance.OnEntityDespawned -= HandleEntityDespawn;
                NetworkManager.Instance.OnEntityUpdated -= HandleEntityUpdate;
                NetworkManager.Instance.OnCombatEvent -= HandleCombatEvent;
            }
        }
        
        #endregion

        #region Public Methods
        
        /// <summary>
        /// Get an entity by ID.
        /// </summary>
        public GameObject GetEntity(string entityId)
        {
            entities.TryGetValue(entityId, out GameObject entity);
            return entity;
        }
        
        /// <summary>
        /// Get RemoteCharacter component for an entity.
        /// </summary>
        public RemoteCharacter GetRemoteCharacter(string entityId)
        {
            GameObject entity = GetEntity(entityId);
            return entity?.GetComponent<RemoteCharacter>();
        }
        
        /// <summary>
        /// Spawn the local player.
        /// </summary>
        public GameObject SpawnLocalPlayer(string playerId, string name, Vector3 position)
        {
            localPlayerId = playerId;
            
            // Instantiate player prefab
            GameObject player = Instantiate(
                playerPrefab ?? CreateDefaultPrefab("Player"),
                position,
                Quaternion.identity,
                entityContainer
            );
            
            player.name = $"Player_{name}";
            
            // Setup player components
            var controller = player.GetComponent<PlayerController>();
            if (controller == null)
            {
                controller = player.AddComponent<PlayerController>();
            }
            
            // Store in entity map
            entities[playerId] = player;
            
            Debug.Log($"EntityManager: Spawned local player {name} at {position}");
            
            return player;
        }
        
        /// <summary>
        /// Spawn a remote entity (player, NPC, monster).
        /// </summary>
        public GameObject SpawnEntity(EntityUpdatePayload data)
        {
            // Don't spawn local player this way
            if (data.entityId == localPlayerId)
            {
                return entities[localPlayerId];
            }
            
            // Check if already spawned
            if (entities.ContainsKey(data.entityId))
            {
                Debug.LogWarning($"EntityManager: Entity {data.entityId} already exists");
                return entities[data.entityId];
            }
            
            // Select prefab based on type
            GameObject prefab = GetPrefabForType(data.type);
            
            // Instantiate
            Vector3 position = new Vector3(data.x, data.y, data.z);
            GameObject entity = Instantiate(prefab, position, Quaternion.identity, entityContainer);
            
            // Use short ID if available, otherwise use full ID
            string shortId = data.entityId.Length >= 8 ? data.entityId.Substring(0, 8) : data.entityId;
            entity.name = $"{data.type}_{data.name}_{shortId}";
            
            // Setup RemoteCharacter component
            RemoteCharacter remoteChar = entity.GetComponent<RemoteCharacter>();
            if (remoteChar == null)
            {
                remoteChar = entity.AddComponent<RemoteCharacter>();
            }
            
            remoteChar.Initialize(
                data.entityId,
                data.type,
                data.name,
                data.level,
                position
            );
            
            remoteChar.Health = data.health;
            remoteChar.MaxHealth = data.maxHealth;
            
            // Store in entity map
            entities[data.entityId] = entity;
            
            Debug.Log($"EntityManager: Spawned {data.type} {data.name} at {position}");
            
            return entity;
        }
        
        /// <summary>
        /// Despawn an entity.
        /// </summary>
        public void DespawnEntity(string entityId)
        {
            if (!entities.ContainsKey(entityId))
            {
                return;
            }
            
            GameObject entity = entities[entityId];
            entities.Remove(entityId);
            
            // Don't destroy local player
            if (entityId == localPlayerId)
            {
                localPlayerId = null;
            }
            
            Destroy(entity);
            
            Debug.Log($"EntityManager: Despawned entity {entityId}");
        }
        
        /// <summary>
        /// Clear all entities.
        /// </summary>
        public void ClearAllEntities()
        {
            foreach (var entity in entities.Values)
            {
                if (entity != null)
                {
                    Destroy(entity);
                }
            }
            
            entities.Clear();
            localPlayerId = null;
            
            Debug.Log("EntityManager: Cleared all entities");
        }
        
        #endregion

        #region Network Event Handlers
        
        private void HandleWelcome(WelcomePayload welcome)
        {
            // Spawn local player
            SpawnLocalPlayer(
                welcome.playerId,
                welcome.character.name,
                Vector3.zero // Position would come from server
            );
        }
        
        private void HandleEntitySpawn(EntitySpawnPayload spawn)
        {
            SpawnEntity(spawn.entity);
        }
        
        private void HandleEntityDespawn(EntityDespawnPayload despawn)
        {
            DespawnEntity(despawn.entityId);
        }
        
        private void HandleEntityUpdate(EntityUpdatePayload update)
        {
            // Spawn if doesn't exist
            if (!entities.ContainsKey(update.entityId))
            {
                SpawnEntity(update);
                return;
            }
            
            // Update local player position
            if (update.entityId == localPlayerId)
            {
                var controller = entities[localPlayerId].GetComponent<PlayerController>();
                if (controller != null)
                {
                    controller.ApplyServerPosition(new Vector3(update.x, update.y, update.z));
                }
                return;
            }
            
            // Update remote character
            RemoteCharacter remoteChar = GetRemoteCharacter(update.entityId);
            if (remoteChar != null)
            {
                remoteChar.UpdateFromServer(
                    new Vector3(update.x, update.y, update.z),
                    update.rotation,
                    update.isMoving,
                    update.isCasting,
                    update.isInCombat,
                    update.health,
                    update.maxHealth,
                    update.timestamp / 1000f // Convert to seconds
                );
            }
        }
        
        private void HandleCombatEvent(CombatEventPayload combat)
        {
            // Apply combat event to target
            RemoteCharacter target = GetRemoteCharacter(combat.targetEntityId);
            if (target != null)
            {
                target.Health = combat.targetHealth;
                
                switch (combat.type)
                {
                    case "DAMAGE":
                        target.PlayDamageEffect(combat.value, combat.isCritical);
                        break;
                    case "HEAL":
                        target.PlayHealEffect(combat.value);
                        break;
                    case "DEATH":
                        target.PlayDeath();
                        break;
                }
            }
            
            // Also check if it's the local player
            if (combat.targetEntityId == localPlayerId)
            {
                // Would update player health UI
                Debug.Log($"Local player health: {combat.targetHealth}/{combat.targetMaxHealth}");
            }
        }
        
        #endregion

        #region Private Methods
        
        private GameObject GetPrefabForType(string entityType)
        {
            switch (entityType?.ToUpper())
            {
                case "PLAYER":
                    return playerPrefab ?? CreateDefaultPrefab("Player");
                case "NPC":
                    return npcPrefab ?? CreateDefaultPrefab("NPC");
                case "MONSTER":
                    return monsterPrefab ?? CreateDefaultPrefab("Monster");
                case "OBJECT":
                    return objectPrefab ?? CreateDefaultPrefab("Object");
                default:
                    return CreateDefaultPrefab("Entity");
            }
        }
        
        private GameObject CreateDefaultPrefab(string name)
        {
            // Create a simple placeholder entity for development
            GameObject obj = GameObject.CreatePrimitive(PrimitiveType.Capsule);
            obj.name = name;
            
            // Color based on type
            var renderer = obj.GetComponent<Renderer>();
            if (renderer != null)
            {
                switch (name)
                {
                    case "Player":
                        renderer.material.color = Color.blue;
                        break;
                    case "NPC":
                        renderer.material.color = Color.green;
                        break;
                    case "Monster":
                        renderer.material.color = Color.red;
                        break;
                    default:
                        renderer.material.color = Color.gray;
                        break;
                }
            }
            
            return obj;
        }
        
        #endregion
    }
}
