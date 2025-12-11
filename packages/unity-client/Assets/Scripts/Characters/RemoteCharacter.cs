using UnityEngine;

namespace MMORPG.Characters
{
    /// <summary>
    /// RemoteCharacter handles display and interpolation of network characters.
    /// Uses interpolation between server states for smooth movement.
    /// </summary>
    public class RemoteCharacter : MonoBehaviour
    {
        #region Configuration
        
        [Header("Interpolation Settings")]
        [SerializeField] private float interpolationDelay = 0.1f; // 100ms buffer
        [SerializeField] private float maxExtrapolationTime = 0.2f;
        [SerializeField] private float teleportThreshold = 5f;
        [SerializeField] private float rotationSpeed = 360f;
        
        [Header("Display")]
        [SerializeField] private string displayName;
        [SerializeField] private int level;
        [SerializeField] private int health;
        [SerializeField] private int maxHealth;
        
        #endregion

        #region State
        
        public string EntityId { get; set; }
        public string EntityType { get; set; }
        public bool IsInCombat { get; private set; }
        public bool IsCasting { get; private set; }
        
        // Interpolation state
        private PositionState[] stateBuffer = new PositionState[20];
        private int stateCount = 0;
        private float lastUpdateTime;
        
        // Current interpolated state
        private Vector3 interpolatedPosition;
        private float interpolatedRotation;
        
        #endregion

        #region Types
        
        private struct PositionState
        {
            public float Timestamp;
            public Vector3 Position;
            public float Rotation;
            public bool IsMoving;
        }
        
        #endregion

        #region Properties
        
        public string DisplayName
        {
            get => displayName;
            set => displayName = value;
        }
        
        public int Level
        {
            get => level;
            set => level = value;
        }
        
        public int Health
        {
            get => health;
            set => health = Mathf.Clamp(value, 0, maxHealth);
        }
        
        public int MaxHealth
        {
            get => maxHealth;
            set => maxHealth = Mathf.Max(1, value);
        }
        
        public float HealthPercent => maxHealth > 0 ? (float)health / maxHealth : 0f;
        
        #endregion

        #region Unity Lifecycle
        
        private void Start()
        {
            interpolatedPosition = transform.position;
            interpolatedRotation = transform.eulerAngles.y;
        }
        
        private void Update()
        {
            // Apply interpolated state
            Interpolate();
        }
        
        #endregion

        #region Public Methods
        
        /// <summary>
        /// Update entity state from server data.
        /// </summary>
        public void UpdateFromServer(
            Vector3 position,
            float rotation,
            bool isMoving,
            bool isCasting,
            bool isInCombat,
            int currentHealth,
            int currentMaxHealth,
            float serverTimestamp)
        {
            // Add new state to buffer
            AddState(serverTimestamp, position, rotation, isMoving);
            
            // Update combat state
            IsCasting = isCasting;
            IsInCombat = isInCombat;
            
            // Update health
            health = currentHealth;
            maxHealth = currentMaxHealth;
            
            lastUpdateTime = Time.time;
        }
        
        /// <summary>
        /// Initialize entity with basic data.
        /// </summary>
        public void Initialize(
            string entityId,
            string entityType,
            string name,
            int entityLevel,
            Vector3 startPosition)
        {
            EntityId = entityId;
            EntityType = entityType;
            displayName = name;
            level = entityLevel;
            
            transform.position = startPosition;
            interpolatedPosition = startPosition;
            
            // Clear state buffer
            stateCount = 0;
        }
        
        #endregion

        #region Interpolation
        
        private void AddState(float timestamp, Vector3 position, float rotation, bool isMoving)
        {
            // Check for teleportation
            if (stateCount > 0)
            {
                Vector3 lastPos = stateBuffer[(stateCount - 1) % stateBuffer.Length].Position;
                float distance = Vector3.Distance(lastPos, position);
                
                if (distance > teleportThreshold)
                {
                    // Teleport - clear buffer and snap to new position
                    Debug.Log($"RemoteCharacter: Teleporting {EntityId} ({distance:F2} units)");
                    stateCount = 0;
                    transform.position = position;
                    interpolatedPosition = position;
                }
            }
            
            // Shift buffer if full
            if (stateCount >= stateBuffer.Length)
            {
                for (int i = 0; i < stateBuffer.Length - 1; i++)
                {
                    stateBuffer[i] = stateBuffer[i + 1];
                }
                stateCount = stateBuffer.Length - 1;
            }
            
            // Add new state
            stateBuffer[stateCount] = new PositionState
            {
                Timestamp = timestamp,
                Position = position,
                Rotation = rotation,
                IsMoving = isMoving
            };
            stateCount++;
        }
        
        private void Interpolate()
        {
            if (stateCount < 2)
            {
                // Not enough states - extrapolate or stay put
                if (stateCount == 1)
                {
                    interpolatedPosition = stateBuffer[0].Position;
                    interpolatedRotation = stateBuffer[0].Rotation;
                }
                ApplyInterpolatedState();
                return;
            }
            
            // Calculate render time (current time minus interpolation delay)
            float renderTime = Time.time - interpolationDelay;
            
            // Find two states to interpolate between
            int beforeIndex = -1;
            int afterIndex = -1;
            
            for (int i = 0; i < stateCount - 1; i++)
            {
                if (stateBuffer[i].Timestamp <= renderTime && 
                    stateBuffer[i + 1].Timestamp >= renderTime)
                {
                    beforeIndex = i;
                    afterIndex = i + 1;
                    break;
                }
            }
            
            if (beforeIndex >= 0 && afterIndex >= 0)
            {
                // Interpolate between two states
                PositionState before = stateBuffer[beforeIndex];
                PositionState after = stateBuffer[afterIndex];
                
                float t = (renderTime - before.Timestamp) / (after.Timestamp - before.Timestamp);
                t = Mathf.Clamp01(t);
                
                interpolatedPosition = Vector3.Lerp(before.Position, after.Position, t);
                interpolatedRotation = Mathf.LerpAngle(before.Rotation, after.Rotation, t);
            }
            else if (renderTime > stateBuffer[stateCount - 1].Timestamp)
            {
                // Extrapolate beyond last known state
                float timeSinceLastState = renderTime - stateBuffer[stateCount - 1].Timestamp;
                
                if (timeSinceLastState < maxExtrapolationTime && stateCount >= 2)
                {
                    PositionState prev = stateBuffer[stateCount - 2];
                    PositionState last = stateBuffer[stateCount - 1];
                    
                    // Calculate velocity
                    float dt = last.Timestamp - prev.Timestamp;
                    if (dt > 0)
                    {
                        Vector3 velocity = (last.Position - prev.Position) / dt;
                        interpolatedPosition = last.Position + velocity * timeSinceLastState;
                    }
                    else
                    {
                        interpolatedPosition = last.Position;
                    }
                    
                    interpolatedRotation = last.Rotation;
                }
                else
                {
                    // Too long since last update - stop at last known position
                    interpolatedPosition = stateBuffer[stateCount - 1].Position;
                    interpolatedRotation = stateBuffer[stateCount - 1].Rotation;
                }
            }
            
            ApplyInterpolatedState();
        }
        
        private void ApplyInterpolatedState()
        {
            // Apply position
            transform.position = interpolatedPosition;
            
            // Apply rotation smoothly
            float currentRotation = transform.eulerAngles.y;
            float newRotation = Mathf.MoveTowardsAngle(
                currentRotation,
                interpolatedRotation,
                rotationSpeed * Time.deltaTime
            );
            transform.eulerAngles = new Vector3(0, newRotation, 0);
        }
        
        #endregion

        #region Visual Feedback
        
        /// <summary>
        /// Play damage receive effect.
        /// </summary>
        public void PlayDamageEffect(int damageAmount, bool isCritical)
        {
            // Would trigger particle effects, animation, etc.
            Debug.Log($"RemoteCharacter: {displayName} took {damageAmount} damage{(isCritical ? " (CRIT)" : "")}");
        }
        
        /// <summary>
        /// Play heal receive effect.
        /// </summary>
        public void PlayHealEffect(int healAmount)
        {
            Debug.Log($"RemoteCharacter: {displayName} healed for {healAmount}");
        }
        
        /// <summary>
        /// Play death animation.
        /// </summary>
        public void PlayDeath()
        {
            Debug.Log($"RemoteCharacter: {displayName} died");
            // Would trigger death animation, ragdoll, etc.
        }
        
        #endregion
    }
}
