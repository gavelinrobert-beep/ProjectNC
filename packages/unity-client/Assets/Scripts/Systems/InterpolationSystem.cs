using UnityEngine;

namespace MMORPG.Systems
{
    /// <summary>
    /// InterpolationSystem provides network entity interpolation utilities.
    /// Handles smooth interpolation between server state updates for all networked entities.
    /// 
    /// SCALABILITY NOTE: This system is designed to scale for:
    /// - High player counts (100+ entities per zone)
    /// - Variable network conditions
    /// - Future: Zone transitions and instancing
    /// </summary>
    public class InterpolationSystem : MonoBehaviour
    {
        #region Singleton
        
        public static InterpolationSystem Instance { get; private set; }
        
        #endregion

        #region Configuration
        
        [Header("Interpolation Settings")]
        [Tooltip("Base interpolation delay in seconds (network buffer)")]
        [SerializeField] private float baseInterpolationDelay = 0.1f;
        
        [Tooltip("Maximum extrapolation time beyond last known state")]
        [SerializeField] private float maxExtrapolationTime = 0.2f;
        
        [Tooltip("Distance threshold for teleportation instead of interpolation")]
        [SerializeField] private float teleportThreshold = 10f;
        
        [Tooltip("Speed of rotation interpolation in degrees per second")]
        [SerializeField] private float rotationInterpolationSpeed = 360f;
        
        [Header("Performance")]
        [Tooltip("Enable adaptive interpolation based on network conditions")]
        [SerializeField] private bool useAdaptiveInterpolation = true;
        
        [Tooltip("Minimum interpolation delay (milliseconds)")]
        [SerializeField] private float minInterpolationDelay = 0.05f;
        
        [Tooltip("Maximum interpolation delay (milliseconds)")]
        [SerializeField] private float maxInterpolationDelay = 0.3f;
        
        #endregion

        #region State
        
        // Network statistics for adaptive interpolation
        private float averageLatency = 0.1f;
        private float jitter = 0.02f;
        private int packetLossCount = 0;
        
        #endregion

        #region Properties
        
        /// <summary>Current interpolation delay based on network conditions.</summary>
        public float CurrentInterpolationDelay { get; private set; }
        
        /// <summary>Teleport threshold distance.</summary>
        public float TeleportThreshold => teleportThreshold;
        
        /// <summary>Rotation interpolation speed.</summary>
        public float RotationSpeed => rotationInterpolationSpeed;
        
        /// <summary>Max extrapolation time.</summary>
        public float MaxExtrapolationTime => maxExtrapolationTime;
        
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
            
            CurrentInterpolationDelay = baseInterpolationDelay;
        }
        
        private void Update()
        {
            if (useAdaptiveInterpolation)
            {
                UpdateAdaptiveInterpolation();
            }
        }
        
        private void OnDestroy()
        {
            if (Instance == this)
            {
                Instance = null;
            }
        }
        
        #endregion

        #region Public Methods
        
        /// <summary>
        /// Interpolate between two positions with timestamp.
        /// </summary>
        public Vector3 InterpolatePosition(
            Vector3 from, Vector3 to, 
            float fromTime, float toTime, 
            float renderTime)
        {
            if (toTime <= fromTime)
            {
                return to;
            }
            
            float t = (renderTime - fromTime) / (toTime - fromTime);
            t = Mathf.Clamp01(t);
            
            return Vector3.Lerp(from, to, t);
        }
        
        /// <summary>
        /// Interpolate rotation angles.
        /// </summary>
        public float InterpolateRotation(
            float from, float to,
            float fromTime, float toTime,
            float renderTime)
        {
            if (toTime <= fromTime)
            {
                return to;
            }
            
            float t = (renderTime - fromTime) / (toTime - fromTime);
            t = Mathf.Clamp01(t);
            
            return Mathf.LerpAngle(from, to, t);
        }
        
        /// <summary>
        /// Extrapolate position based on velocity.
        /// </summary>
        public Vector3 ExtrapolatePosition(
            Vector3 lastPosition, 
            Vector3 velocity, 
            float deltaTime)
        {
            // Clamp extrapolation to max time
            deltaTime = Mathf.Min(deltaTime, maxExtrapolationTime);
            return lastPosition + velocity * deltaTime;
        }
        
        /// <summary>
        /// Calculate velocity from two positions and timestamps.
        /// </summary>
        public Vector3 CalculateVelocity(
            Vector3 from, Vector3 to,
            float fromTime, float toTime)
        {
            float deltaTime = toTime - fromTime;
            if (deltaTime <= 0)
            {
                return Vector3.zero;
            }
            
            return (to - from) / deltaTime;
        }
        
        /// <summary>
        /// Check if two positions require teleportation instead of interpolation.
        /// </summary>
        public bool ShouldTeleport(Vector3 from, Vector3 to)
        {
            return Vector3.Distance(from, to) > teleportThreshold;
        }
        
        /// <summary>
        /// Update network statistics for adaptive interpolation.
        /// </summary>
        public void UpdateNetworkStats(float latency, bool packetLost)
        {
            // Exponential moving average for latency
            averageLatency = averageLatency * 0.9f + latency * 0.1f;
            
            // Track packet loss
            if (packetLost)
            {
                packetLossCount++;
            }
            
            // Calculate jitter (latency variance)
            float latencyDiff = Mathf.Abs(latency - averageLatency);
            jitter = jitter * 0.9f + latencyDiff * 0.1f;
        }
        
        #endregion

        #region Private Methods
        
        /// <summary>
        /// Update interpolation delay based on network conditions.
        /// FUTURE: This can be enhanced for zone-specific or player-specific adaptation.
        /// </summary>
        private void UpdateAdaptiveInterpolation()
        {
            // Calculate desired delay based on latency and jitter
            float desiredDelay = averageLatency + jitter * 2f;
            
            // Add extra buffer if packet loss is high
            if (packetLossCount > 5)
            {
                desiredDelay += 0.05f; // Add 50ms buffer
            }
            
            // Clamp to min/max
            desiredDelay = Mathf.Clamp(desiredDelay, minInterpolationDelay, maxInterpolationDelay);
            
            // Smooth transition to new delay
            CurrentInterpolationDelay = Mathf.Lerp(
                CurrentInterpolationDelay,
                desiredDelay,
                Time.deltaTime * 2f
            );
            
            // Reset packet loss counter periodically
            if (Time.frameCount % 600 == 0) // Every ~10 seconds at 60fps
            {
                packetLossCount = Mathf.Max(0, packetLossCount - 1);
            }
        }
        
        #endregion

        #region Debug
        
        private void OnGUI()
        {
            if (Debug.isDebugBuild)
            {
                GUILayout.BeginArea(new Rect(10, 150, 250, 150));
                GUILayout.BeginVertical("box");
                GUILayout.Label("Interpolation System");
                GUILayout.Label($"Delay: {CurrentInterpolationDelay * 1000:F0}ms");
                GUILayout.Label($"Latency: {averageLatency * 1000:F0}ms");
                GUILayout.Label($"Jitter: {jitter * 1000:F0}ms");
                GUILayout.Label($"Packet Loss: {packetLossCount}");
                GUILayout.EndVertical();
                GUILayout.EndArea();
            }
        }
        
        #endregion
    }
}
