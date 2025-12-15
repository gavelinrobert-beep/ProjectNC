using UnityEngine;
using MMORPG.Network;
using MMORPG.Systems;

namespace MMORPG.World
{
    /// <summary>
    /// WorldController orchestrates all world systems during gameplay.
    /// Entry point for the game world after login and character selection.
    /// 
    /// ARCHITECTURE NOTE: This is the main controller for WorldScene.
    /// It coordinates:
    /// - Network connection to game server
    /// - Player spawning
    /// - System initialization
    /// - Scene transitions
    /// 
    /// SCALABILITY NOTE: Designed to handle:
    /// - Multiple zones with transitions
    /// - Instanced content (dungeons, raids)
    /// - Large player counts
    /// - Dynamic world events
    /// </summary>
    public class WorldController : MonoBehaviour
    {
        #region Singleton
        
        public static WorldController Instance { get; private set; }
        
        #endregion

        #region Configuration
        
        [Header("References")]
        [SerializeField] private Camera mainCamera;
        [SerializeField] private CameraController cameraController;
        
        [Header("Settings")]
        [SerializeField] private bool autoConnectToServer = true;
        [SerializeField] private float connectionTimeout = 10f;
        
        #endregion

        #region State
        
        private bool isInitialized = false;
        private bool isConnectedToServer = false;
        private GameObject localPlayerObject;
        private float connectionStartTime;
        
        #endregion

        #region Events
        
        public event System.Action OnWorldReady;
        public event System.Action<string> OnWorldError;
        
        #endregion

        #region Properties
        
        /// <summary>Whether world is fully loaded and ready.</summary>
        public bool IsWorldReady => isInitialized && isConnectedToServer && localPlayerObject != null;
        
        /// <summary>Local player GameObject.</summary>
        public GameObject LocalPlayer => localPlayerObject;
        
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
        }
        
        private void Start()
        {
            InitializeWorld();
        }
        
        private void Update()
        {
            // Check for connection timeout
            if (!isConnectedToServer && autoConnectToServer && 
                Time.time - connectionStartTime > connectionTimeout)
            {
                Debug.LogError("WorldController: Connection timeout");
                HandleConnectionTimeout();
            }
            
            // Update camera target when player spawns
            if (localPlayerObject != null && cameraController != null && cameraController.Target == null)
            {
                cameraController.SetTarget(localPlayerObject.transform);
            }
        }
        
        private void OnDestroy()
        {
            if (Instance == this)
            {
                Instance = null;
            }
            
            CleanupWorld();
        }
        
        #endregion

        #region Initialization
        
        /// <summary>
        /// Initialize the world and all systems.
        /// </summary>
        private void InitializeWorld()
        {
            Debug.Log("WorldController: Initializing world...");
            
            // Verify required systems exist
            if (!VerifyRequiredSystems())
            {
                Debug.LogError("WorldController: Missing required systems!");
                OnWorldError?.Invoke("Missing required game systems");
                return;
            }
            
            // Setup camera
            SetupCamera();
            
            // Subscribe to network events
            SubscribeToNetworkEvents();
            
            // Connect to game server if auto-connect enabled
            if (autoConnectToServer)
            {
                ConnectToGameServer();
            }
            
            isInitialized = true;
            
            Debug.Log("WorldController: World initialized");
        }
        
        /// <summary>
        /// Verify all required systems are present.
        /// </summary>
        private bool VerifyRequiredSystems()
        {
            bool allSystemsPresent = true;
            
            if (NetworkManager.Instance == null)
            {
                Debug.LogError("WorldController: NetworkManager not found!");
                allSystemsPresent = false;
            }
            
            if (EntityManager.Instance == null)
            {
                Debug.LogError("WorldController: EntityManager not found!");
                allSystemsPresent = false;
            }
            
            if (TerrainManager.Instance == null)
            {
                Debug.LogWarning("WorldController: TerrainManager not found (optional)");
            }
            
            if (ZoneManager.Instance == null)
            {
                Debug.LogWarning("WorldController: ZoneManager not found (optional)");
            }
            
            if (InputManager.Instance == null)
            {
                Debug.LogError("WorldController: InputManager not found!");
                allSystemsPresent = false;
            }
            
            if (CombatVisualizer.Instance == null)
            {
                Debug.LogWarning("WorldController: CombatVisualizer not found (optional)");
            }
            
            return allSystemsPresent;
        }
        
        /// <summary>
        /// Setup camera references.
        /// </summary>
        private void SetupCamera()
        {
            if (mainCamera == null)
            {
                mainCamera = Camera.main;
            }
            
            if (cameraController == null && mainCamera != null)
            {
                cameraController = mainCamera.GetComponent<CameraController>();
            }
        }
        
        #endregion

        #region Network Connection
        
        /// <summary>
        /// Connect to the game server.
        /// </summary>
        public void ConnectToGameServer()
        {
            if (NetworkManager.Instance == null)
            {
                Debug.LogError("WorldController: Cannot connect - NetworkManager not found");
                return;
            }
            
            // Get auth token and character ID from PlayerPrefs
            string authToken = PlayerPrefs.GetString("auth_token", "");
            string characterId = PlayerPrefs.GetString("selected_character_id", "");
            
            if (string.IsNullOrEmpty(authToken))
            {
                Debug.LogError("WorldController: No auth token found");
                OnWorldError?.Invoke("Authentication required");
                ReturnToLogin();
                return;
            }
            
            if (string.IsNullOrEmpty(characterId))
            {
                Debug.LogError("WorldController: No character selected");
                OnWorldError?.Invoke("No character selected");
                ReturnToCharacterSelect();
                return;
            }
            
            Debug.Log($"WorldController: Connecting to game server with character {characterId}");
            
            connectionStartTime = Time.time;
            NetworkManager.Instance.ConnectToGameServer(authToken, characterId);
        }
        
        /// <summary>
        /// Subscribe to network events.
        /// </summary>
        private void SubscribeToNetworkEvents()
        {
            if (NetworkManager.Instance != null)
            {
                NetworkManager.Instance.OnConnectionEstablished += HandleConnectionEstablished;
                NetworkManager.Instance.OnConnectionLost += HandleConnectionLost;
                NetworkManager.Instance.OnWelcomeReceived += HandleWelcomeReceived;
            }
        }
        
        /// <summary>
        /// Unsubscribe from network events.
        /// </summary>
        private void UnsubscribeFromNetworkEvents()
        {
            if (NetworkManager.Instance != null)
            {
                NetworkManager.Instance.OnConnectionEstablished -= HandleConnectionEstablished;
                NetworkManager.Instance.OnConnectionLost -= HandleConnectionLost;
                NetworkManager.Instance.OnWelcomeReceived -= HandleWelcomeReceived;
            }
        }
        
        #endregion

        #region Network Event Handlers
        
        /// <summary>
        /// Handle connection established.
        /// </summary>
        private void HandleConnectionEstablished()
        {
            Debug.Log("WorldController: Connected to game server");
            isConnectedToServer = true;
        }
        
        /// <summary>
        /// Handle connection lost.
        /// </summary>
        private void HandleConnectionLost(string reason)
        {
            Debug.LogWarning($"WorldController: Connection lost - {reason}");
            isConnectedToServer = false;
            
            // Show reconnection UI
            // FUTURE: Implement reconnection logic
            OnWorldError?.Invoke($"Connection lost: {reason}");
        }
        
        /// <summary>
        /// Handle welcome message from server (player successfully joined world).
        /// </summary>
        private void HandleWelcomeReceived(WelcomePayload welcome)
        {
            Debug.Log($"WorldController: Welcome received - Player {welcome.playerId}");
            
            // Player entity will be spawned by EntityManager
            // Wait a frame for entity creation
            StartCoroutine(WaitForPlayerSpawn(welcome.playerId));
        }
        
        /// <summary>
        /// Wait for player entity to spawn.
        /// </summary>
        private System.Collections.IEnumerator WaitForPlayerSpawn(string playerId)
        {
            // Wait up to 5 seconds for player to spawn
            float timeout = 5f;
            float elapsed = 0f;
            
            while (localPlayerObject == null && elapsed < timeout)
            {
                localPlayerObject = EntityManager.Instance?.LocalPlayer;
                elapsed += Time.deltaTime;
                yield return null;
            }
            
            if (localPlayerObject != null)
            {
                OnPlayerSpawned();
            }
            else
            {
                Debug.LogError("WorldController: Player spawn timeout");
                OnWorldError?.Invoke("Failed to spawn player");
            }
        }
        
        /// <summary>
        /// Handle player successfully spawned in world.
        /// </summary>
        private void OnPlayerSpawned()
        {
            Debug.Log("WorldController: Player spawned successfully");
            
            // Setup camera to follow player
            if (cameraController != null)
            {
                cameraController.SetTarget(localPlayerObject.transform);
            }
            
            // Enable input
            if (InputManager.Instance != null)
            {
                InputManager.Instance.IsInputEnabled = true;
            }
            
            // World is now ready
            OnWorldReady?.Invoke();
            
            Debug.Log("WorldController: World is ready!");
        }
        
        /// <summary>
        /// Handle connection timeout.
        /// </summary>
        private void HandleConnectionTimeout()
        {
            Debug.LogError("WorldController: Connection timeout");
            OnWorldError?.Invoke("Connection timeout");
            
            // Return to character select
            ReturnToCharacterSelect();
        }
        
        #endregion

        #region Scene Management
        
        /// <summary>
        /// Return to login scene.
        /// </summary>
        public void ReturnToLogin()
        {
            Debug.Log("WorldController: Returning to login");
            
            // Disconnect
            if (NetworkManager.Instance != null)
            {
                NetworkManager.Instance.Disconnect();
            }
            
            // Load login scene
            if (Core.GameManager.Instance != null)
            {
                Core.GameManager.Instance.LoadLoginScene();
            }
        }
        
        /// <summary>
        /// Return to character select scene.
        /// </summary>
        public void ReturnToCharacterSelect()
        {
            Debug.Log("WorldController: Returning to character select");
            
            // Disconnect
            if (NetworkManager.Instance != null)
            {
                NetworkManager.Instance.Disconnect();
            }
            
            // Load character select scene
            if (Core.GameManager.Instance != null)
            {
                Core.GameManager.Instance.LoadCharacterSelectScene();
            }
        }
        
        #endregion

        #region Cleanup
        
        /// <summary>
        /// Cleanup world resources.
        /// </summary>
        private void CleanupWorld()
        {
            UnsubscribeFromNetworkEvents();
            
            // Clear entities
            if (EntityManager.Instance != null)
            {
                EntityManager.Instance.ClearAllEntities();
            }
            
            // Unload terrain
            if (TerrainManager.Instance != null)
            {
                TerrainManager.Instance.UnloadTerrain();
            }
            
            Debug.Log("WorldController: World cleanup complete");
        }
        
        #endregion

        #region Debug
        
        private void OnGUI()
        {
            if (Debug.isDebugBuild)
            {
                GUILayout.BeginArea(new Rect(10, 670, 300, 100));
                GUILayout.BeginVertical("box");
                GUILayout.Label("World Controller");
                GUILayout.Label($"Initialized: {isInitialized}");
                GUILayout.Label($"Connected: {isConnectedToServer}");
                GUILayout.Label($"Ready: {IsWorldReady}");
                GUILayout.Label($"Player: {(localPlayerObject != null ? "Spawned" : "Not spawned")}");
                
                if (GUILayout.Button("Return to Character Select"))
                {
                    ReturnToCharacterSelect();
                }
                
                GUILayout.EndVertical();
                GUILayout.EndArea();
            }
        }
        
        #endregion
    }
}
