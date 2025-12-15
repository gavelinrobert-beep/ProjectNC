using UnityEngine;

namespace MMORPG.World
{
    /// <summary>
    /// TerrainManager handles terrain generation, loading, and streaming.
    /// For MVP, uses a simple flat plane or heightmap. Designed for future terrain systems.
    /// 
    /// SCALABILITY NOTE: Architecture supports future enhancements:
    /// - Multiple terrain chunks for large zones
    /// - Dynamic loading/unloading based on player position
    /// - Heightmap streaming from server
    /// - Procedural generation
    /// - Terrain LOD (Level of Detail)
    /// </summary>
    public class TerrainManager : MonoBehaviour
    {
        #region Singleton
        
        public static TerrainManager Instance { get; private set; }
        
        #endregion

        #region Configuration
        
        [Header("Terrain Settings")]
        [Tooltip("Size of the terrain in world units")]
        [SerializeField] private Vector2 terrainSize = new Vector2(500f, 500f);
        
        [Tooltip("Resolution of the heightmap (power of 2 + 1)")]
        [SerializeField] private int heightmapResolution = 513;
        
        [Tooltip("Maximum terrain height")]
        [SerializeField] private float maxTerrainHeight = 100f;
        
        [Tooltip("Use Unity Terrain or simple mesh")]
        [SerializeField] private bool useUnityTerrain = false;
        
        [Header("Placeholder Settings")]
        [Tooltip("Ground plane Y position for simple MVP terrain")]
        [SerializeField] private float groundPlaneHeight = 0f;
        
        [Tooltip("Material for the ground plane")]
        [SerializeField] private Material groundMaterial;
        
        [Header("Streaming (Future)")]
        [Tooltip("Enable terrain chunk streaming")]
        [SerializeField] private bool enableStreaming = false;
        
        [Tooltip("Distance to load/unload terrain chunks")]
        [SerializeField] private float streamingDistance = 200f;
        
        #endregion

        #region State
        
        private GameObject currentTerrain;
        private Terrain unityTerrain;
        private GameObject groundPlane;
        
        #endregion

        #region Properties
        
        /// <summary>Size of the current terrain.</summary>
        public Vector2 TerrainSize => terrainSize;
        
        /// <summary>Ground height at position (Y coordinate).</summary>
        public float GroundHeight => groundPlaneHeight;
        
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
            // Initialize terrain on start
            InitializeTerrain();
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
        /// Initialize the terrain system.
        /// </summary>
        private void InitializeTerrain()
        {
            if (useUnityTerrain)
            {
                CreateUnityTerrain();
            }
            else
            {
                CreateSimpleGroundPlane();
            }
            
            Debug.Log($"TerrainManager: Initialized terrain (size: {terrainSize}, height: {groundPlaneHeight})");
        }
        
        /// <summary>
        /// Create a simple ground plane for MVP.
        /// FUTURE: Replace with proper terrain system.
        /// </summary>
        private void CreateSimpleGroundPlane()
        {
            if (groundPlane != null)
            {
                return;
            }
            
            // Create ground plane
            groundPlane = GameObject.CreatePrimitive(PrimitiveType.Plane);
            groundPlane.name = "GroundPlane";
            groundPlane.transform.parent = transform;
            groundPlane.transform.position = new Vector3(0, groundPlaneHeight, 0);
            groundPlane.transform.localScale = new Vector3(terrainSize.x / 10f, 1f, terrainSize.y / 10f);
            
            // Apply material
            if (groundMaterial != null)
            {
                groundPlane.GetComponent<Renderer>().material = groundMaterial;
            }
            else
            {
                // Create default grass-like material
                Material defaultMat = new Material(Shader.Find("Standard"));
                defaultMat.color = new Color(0.3f, 0.6f, 0.3f); // Grass green
                groundPlane.GetComponent<Renderer>().material = defaultMat;
            }
            
            // Set layer for ground detection
            groundPlane.layer = LayerMask.NameToLayer("Default");
            
            currentTerrain = groundPlane;
        }
        
        /// <summary>
        /// Create Unity Terrain for more advanced terrain features.
        /// FUTURE: Use this for proper terrain rendering.
        /// </summary>
        private void CreateUnityTerrain()
        {
            // Create terrain data
            TerrainData terrainData = new TerrainData();
            terrainData.heightmapResolution = heightmapResolution;
            terrainData.size = new Vector3(terrainSize.x, maxTerrainHeight, terrainSize.y);
            
            // Create flat heightmap for MVP
            float[,] heights = new float[heightmapResolution, heightmapResolution];
            for (int x = 0; x < heightmapResolution; x++)
            {
                for (int y = 0; y < heightmapResolution; y++)
                {
                    // Flat terrain at ground height (normalized to 0-1)
                    heights[x, y] = groundPlaneHeight / maxTerrainHeight;
                }
            }
            terrainData.SetHeights(0, 0, heights);
            
            // Create terrain GameObject
            GameObject terrainObj = Terrain.CreateTerrainGameObject(terrainData);
            terrainObj.name = "MainTerrain";
            terrainObj.transform.parent = transform;
            terrainObj.transform.position = new Vector3(-terrainSize.x / 2f, 0, -terrainSize.y / 2f);
            
            unityTerrain = terrainObj.GetComponent<Terrain>();
            currentTerrain = terrainObj;
            
            Debug.Log("TerrainManager: Created Unity Terrain");
        }
        
        #endregion

        #region Public Methods
        
        /// <summary>
        /// Get terrain height at world position.
        /// </summary>
        public float GetHeightAtPosition(Vector3 worldPosition)
        {
            if (useUnityTerrain && unityTerrain != null)
            {
                // Use Unity Terrain height sampling
                return unityTerrain.SampleHeight(worldPosition);
            }
            else
            {
                // Simple flat terrain
                return groundPlaneHeight;
            }
        }
        
        /// <summary>
        /// Get terrain normal at world position.
        /// </summary>
        public Vector3 GetNormalAtPosition(Vector3 worldPosition)
        {
            if (useUnityTerrain && unityTerrain != null)
            {
                TerrainData data = unityTerrain.terrainData;
                Vector3 terrainPos = worldPosition - unityTerrain.transform.position;
                
                // Convert to normalized coordinates
                float x = terrainPos.x / data.size.x;
                float z = terrainPos.z / data.size.z;
                
                return data.GetInterpolatedNormal(x, z);
            }
            else
            {
                // Flat terrain always has up normal
                return Vector3.up;
            }
        }
        
        /// <summary>
        /// Check if position is within terrain bounds.
        /// </summary>
        public bool IsPositionInBounds(Vector3 worldPosition)
        {
            float halfWidth = terrainSize.x / 2f;
            float halfDepth = terrainSize.y / 2f;
            
            return worldPosition.x >= -halfWidth && worldPosition.x <= halfWidth &&
                   worldPosition.z >= -halfDepth && worldPosition.z <= halfDepth;
        }
        
        /// <summary>
        /// Load terrain data from server or file.
        /// FUTURE: Implement server-driven terrain streaming.
        /// </summary>
        public void LoadTerrainData(string zoneId, byte[] heightmapData)
        {
            Debug.Log($"TerrainManager: LoadTerrainData for zone {zoneId} (future implementation)");
            
            // FUTURE IMPLEMENTATION:
            // - Parse heightmap data
            // - Apply to Unity Terrain
            // - Load terrain textures and splat maps
            // - Configure terrain details (grass, trees)
        }
        
        /// <summary>
        /// Unload current terrain.
        /// </summary>
        public void UnloadTerrain()
        {
            if (currentTerrain != null)
            {
                Destroy(currentTerrain);
                currentTerrain = null;
                unityTerrain = null;
            }
        }
        
        /// <summary>
        /// Add environmental objects (rocks, trees, etc.).
        /// FUTURE: Load from zone data.
        /// </summary>
        public void SpawnEnvironmentObjects()
        {
            // FUTURE: Place props like:
            // - Trees
            // - Rocks
            // - Buildings
            // - Foliage
            
            Debug.Log("TerrainManager: SpawnEnvironmentObjects (placeholder)");
        }
        
        #endregion

        #region Streaming (Future)
        
        /// <summary>
        /// Update terrain streaming based on player position.
        /// FUTURE: Implement chunk-based streaming for large worlds.
        /// </summary>
        public void UpdateStreaming(Vector3 playerPosition)
        {
            if (!enableStreaming)
            {
                return;
            }
            
            // FUTURE IMPLEMENTATION:
            // - Calculate which chunks are in range
            // - Load new chunks
            // - Unload distant chunks
            // - Smooth transitions between chunks
        }
        
        #endregion

        #region Debug
        
        private void OnDrawGizmosSelected()
        {
            // Draw terrain bounds
            Gizmos.color = Color.yellow;
            Vector3 center = new Vector3(0, groundPlaneHeight, 0);
            Vector3 size = new Vector3(terrainSize.x, 0.1f, terrainSize.y);
            Gizmos.DrawWireCube(center, size);
        }
        
        #endregion
    }
}
