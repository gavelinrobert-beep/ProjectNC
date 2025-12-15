using System.Collections.Generic;
using UnityEngine;

namespace MMORPG.World
{
    /// <summary>
    /// ZoneManager handles loading, unloading, and transitions between game zones.
    /// Coordinates with server for zone data and manages local zone state.
    /// 
    /// SCALABILITY NOTE: Designed for future multi-zone architecture:
    /// - Seamless zone transitions
    /// - Zone instancing for dungeons/raids
    /// - Dynamic zone loading based on player position
    /// - Support for phasing (different world states per player)
    /// - Cross-zone visibility (future PvP/open world)
    /// </summary>
    public class ZoneManager : MonoBehaviour
    {
        #region Singleton
        
        public static ZoneManager Instance { get; private set; }
        
        #endregion

        #region Types
        
        /// <summary>
        /// Zone data structure.
        /// </summary>
        [System.Serializable]
        public class Zone
        {
            public string id;
            public string name;
            public string displayName;
            public int minLevel;
            public int maxLevel;
            public Vector3 spawnPosition;
            public bool isPvPEnabled;
            public bool isInstance;
            public string skyboxName;
            public Color ambientColor;
            public string musicTrack;
        }
        
        /// <summary>
        /// Zone transition data.
        /// </summary>
        public class ZoneTransition
        {
            public string fromZoneId;
            public string toZoneId;
            public Vector3 exitPosition;
            public Vector3 entryPosition;
        }
        
        #endregion

        #region Configuration
        
        [Header("Current Zone")]
        [SerializeField] private string currentZoneId = "zone_starting_area";
        [SerializeField] private string currentZoneName = "Starting Area";
        
        [Header("Zone Definitions")]
        [Tooltip("Available zones (would be loaded from server in production)")]
        [SerializeField] private List<Zone> availableZones = new List<Zone>();
        
        [Header("Lighting")]
        [SerializeField] private Light directionalLight;
        [SerializeField] private Material defaultSkybox;
        
        [Header("Settings")]
        [Tooltip("Enable seamless zone transitions")]
        [SerializeField] private bool enableSeamlessTransitions = false;
        
        [Tooltip("Distance to adjacent zone before preloading")]
        [SerializeField] private float preloadDistance = 50f;
        
        #endregion

        #region State
        
        private Zone currentZone;
        private Dictionary<string, Zone> zoneDatabase = new Dictionary<string, Zone>();
        private List<string> loadedZones = new List<string>();
        private bool isTransitioning = false;
        
        #endregion

        #region Events
        
        public event System.Action<Zone> OnZoneLoaded;
        public event System.Action<string> OnZoneUnloaded;
        public event System.Action<Zone, Zone> OnZoneTransition;
        
        #endregion

        #region Properties
        
        /// <summary>Currently active zone.</summary>
        public Zone CurrentZone => currentZone;
        
        /// <summary>Current zone ID.</summary>
        public string CurrentZoneId => currentZoneId;
        
        /// <summary>Whether a zone transition is in progress.</summary>
        public bool IsTransitioning => isTransitioning;
        
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
            DontDestroyOnLoad(gameObject);
            
            InitializeZoneDatabase();
        }
        
        private void Start()
        {
            // Load initial zone
            LoadZone(currentZoneId);
        }
        
        private void OnDestroy()
        {
            if (Instance == this)
            {
                Instance = null;
            }
        }
        
        #endregion

        #region Initialization
        
        /// <summary>
        /// Initialize zone database with available zones.
        /// FUTURE: Load from server API.
        /// </summary>
        private void InitializeZoneDatabase()
        {
            // Add default starting zone if not configured
            if (availableZones.Count == 0)
            {
                availableZones.Add(new Zone
                {
                    id = "zone_starting_area",
                    name = "starting_area",
                    displayName = "Starting Area",
                    minLevel = 1,
                    maxLevel = 10,
                    spawnPosition = Vector3.zero,
                    isPvPEnabled = false,
                    isInstance = false,
                    ambientColor = new Color(0.4f, 0.4f, 0.4f),
                    musicTrack = "ambient_forest"
                });
            }
            
            // Build zone lookup dictionary
            foreach (var zone in availableZones)
            {
                zoneDatabase[zone.id] = zone;
            }
            
            Debug.Log($"ZoneManager: Initialized with {availableZones.Count} zones");
        }
        
        #endregion

        #region Public Methods
        
        /// <summary>
        /// Load a zone by ID.
        /// </summary>
        public void LoadZone(string zoneId)
        {
            if (!zoneDatabase.ContainsKey(zoneId))
            {
                Debug.LogError($"ZoneManager: Zone '{zoneId}' not found in database");
                return;
            }
            
            Zone zone = zoneDatabase[zoneId];
            
            Debug.Log($"ZoneManager: Loading zone '{zone.displayName}' ({zoneId})");
            
            // Unload previous zone if exists
            if (currentZone != null && currentZone.id != zoneId)
            {
                UnloadZone(currentZone.id);
            }
            
            // Set as current zone
            currentZone = zone;
            currentZoneId = zoneId;
            currentZoneName = zone.displayName;
            
            // Apply zone settings
            ApplyZoneSettings(zone);
            
            // Load terrain
            if (TerrainManager.Instance != null)
            {
                TerrainManager.Instance.SpawnEnvironmentObjects();
            }
            
            // Mark as loaded
            if (!loadedZones.Contains(zoneId))
            {
                loadedZones.Add(zoneId);
            }
            
            // Update HUD
            if (UI.HUD.Instance != null)
            {
                UI.HUD.Instance.SetZoneName(zone.displayName);
            }
            
            OnZoneLoaded?.Invoke(zone);
            
            Debug.Log($"ZoneManager: Zone '{zone.displayName}' loaded successfully");
        }
        
        /// <summary>
        /// Unload a zone.
        /// </summary>
        public void UnloadZone(string zoneId)
        {
            if (!loadedZones.Contains(zoneId))
            {
                return;
            }
            
            Debug.Log($"ZoneManager: Unloading zone '{zoneId}'");
            
            // Clean up zone-specific resources
            // FUTURE: Unload zone terrain, objects, NPCs
            
            loadedZones.Remove(zoneId);
            OnZoneUnloaded?.Invoke(zoneId);
        }
        
        /// <summary>
        /// Transition to a new zone.
        /// </summary>
        public async void TransitionToZone(string toZoneId, Vector3 entryPosition)
        {
            if (isTransitioning)
            {
                Debug.LogWarning("ZoneManager: Already transitioning");
                return;
            }
            
            if (!zoneDatabase.ContainsKey(toZoneId))
            {
                Debug.LogError($"ZoneManager: Target zone '{toZoneId}' not found");
                return;
            }
            
            isTransitioning = true;
            Zone targetZone = zoneDatabase[toZoneId];
            
            Debug.Log($"ZoneManager: Transitioning from '{currentZone?.displayName}' to '{targetZone.displayName}'");
            
            // Show loading screen
            // FUTURE: Implement loading screen UI
            
            Zone previousZone = currentZone;
            
            // Notify server of zone change
            // FUTURE: Server validates zone transition
            
            // Load new zone
            LoadZone(toZoneId);
            
            // Teleport player to entry position
            if (World.EntityManager.Instance != null && World.EntityManager.Instance.LocalPlayer != null)
            {
                var player = World.EntityManager.Instance.LocalPlayer;
                var controller = player.GetComponent<Characters.PlayerController>();
                
                if (controller != null)
                {
                    var characterController = player.GetComponent<CharacterController>();
                    if (characterController != null)
                    {
                        characterController.enabled = false;
                        player.transform.position = entryPosition;
                        characterController.enabled = true;
                    }
                }
            }
            
            // Simulate loading delay
            await System.Threading.Tasks.Task.Delay(500);
            
            // Hide loading screen
            
            OnZoneTransition?.Invoke(previousZone, targetZone);
            
            isTransitioning = false;
            
            Debug.Log($"ZoneManager: Zone transition complete");
        }
        
        /// <summary>
        /// Get zone by ID.
        /// </summary>
        public Zone GetZone(string zoneId)
        {
            zoneDatabase.TryGetValue(zoneId, out Zone zone);
            return zone;
        }
        
        /// <summary>
        /// Check if zone is loaded.
        /// </summary>
        public bool IsZoneLoaded(string zoneId)
        {
            return loadedZones.Contains(zoneId);
        }
        
        #endregion

        #region Private Methods
        
        /// <summary>
        /// Apply zone-specific settings (lighting, skybox, etc.).
        /// </summary>
        private void ApplyZoneSettings(Zone zone)
        {
            // Apply ambient lighting
            RenderSettings.ambientLight = zone.ambientColor;
            
            // Apply skybox if specified
            if (!string.IsNullOrEmpty(zone.skyboxName))
            {
                // FUTURE: Load skybox from resources
                Material skybox = Resources.Load<Material>($"Skyboxes/{zone.skyboxName}");
                if (skybox != null)
                {
                    RenderSettings.skybox = skybox;
                }
                else if (defaultSkybox != null)
                {
                    RenderSettings.skybox = defaultSkybox;
                }
            }
            
            // Configure directional light
            if (directionalLight != null)
            {
                // Adjust light based on zone (time of day, weather, etc.)
                directionalLight.color = Color.white;
                directionalLight.intensity = 1f;
            }
            
            // Start music track
            if (!string.IsNullOrEmpty(zone.musicTrack))
            {
                // FUTURE: Audio system integration
                Debug.Log($"ZoneManager: Playing music track '{zone.musicTrack}'");
            }
        }
        
        #endregion

        #region Zone Transitions (Future)
        
        /// <summary>
        /// Check if player is near a zone transition point.
        /// FUTURE: Implement zone portals and boundaries.
        /// </summary>
        public void CheckZoneTransitions(Vector3 playerPosition)
        {
            // FUTURE IMPLEMENTATION:
            // - Define zone boundaries or portal locations
            // - Check if player crossed boundary
            // - Trigger transition
            // - Seamless loading if enabled
        }
        
        #endregion

        #region Debug
        
        private void OnGUI()
        {
            if (Debug.isDebugBuild && currentZone != null)
            {
                GUILayout.BeginArea(new Rect(10, 470, 300, 100));
                GUILayout.BeginVertical("box");
                GUILayout.Label($"Zone: {currentZone.displayName}");
                GUILayout.Label($"Level Range: {currentZone.minLevel}-{currentZone.maxLevel}");
                GUILayout.Label($"PvP: {(currentZone.isPvPEnabled ? "Enabled" : "Disabled")}");
                GUILayout.Label($"Loaded Zones: {loadedZones.Count}");
                GUILayout.EndVertical();
                GUILayout.EndArea();
            }
        }
        
        #endregion
    }
}
