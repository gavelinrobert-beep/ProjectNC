using UnityEngine;
using UnityEngine.UI;
using TMPro;

namespace MMORPG.UI
{
    /// <summary>
    /// Nameplate displays entity name and health bar above characters.
    /// Follows entity position and faces camera.
    /// 
    /// SCALABILITY NOTE: Designed for many simultaneous nameplates:
    /// - Efficient camera-facing
    /// - Optional LOD hiding at distance
    /// - Color-coded by entity type (friendly, hostile, neutral)
    /// - Future: Guild names, titles, raid markers
    /// </summary>
    public class Nameplate : MonoBehaviour
    {
        #region Configuration
        
        [Header("References")]
        [SerializeField] private TextMeshProUGUI nameText;
        [SerializeField] private TextMeshProUGUI levelText;
        [SerializeField] private Slider healthBar;
        [SerializeField] private Image healthFill;
        [SerializeField] private Canvas canvas;
        [SerializeField] private CanvasGroup canvasGroup;
        
        [Header("Settings")]
        [SerializeField] private Vector3 offset = new Vector3(0, 2.5f, 0);
        [SerializeField] private float maxVisibleDistance = 50f;
        [SerializeField] private bool alwaysVisible = false;
        [SerializeField] private bool hideWhenFullHealth = false;
        
        [Header("Colors")]
        [SerializeField] private Color friendlyColor = new Color(0.2f, 1f, 0.2f);
        [SerializeField] private Color neutralColor = new Color(1f, 1f, 0.2f);
        [SerializeField] private Color hostileColor = new Color(1f, 0.2f, 0.2f);
        [SerializeField] private Color playerColor = new Color(0.2f, 0.8f, 1f);
        [SerializeField] private Color deadColor = Color.gray;
        
        #endregion

        #region State
        
        private Transform targetEntity;
        private Camera mainCamera;
        private string entityName;
        private int entityLevel;
        private int currentHealth;
        private int maxHealth;
        private bool isDead;
        private EntityType entityType = EntityType.Neutral;
        
        #endregion

        #region Types
        
        public enum EntityType
        {
            Player,
            Friendly,
            Neutral,
            Hostile
        }
        
        #endregion

        #region Unity Lifecycle
        
        private void Awake()
        {
            // Setup canvas
            if (canvas == null)
            {
                canvas = GetComponent<Canvas>();
            }
            
            if (canvas != null)
            {
                canvas.renderMode = RenderMode.WorldSpace;
            }
            
            if (canvasGroup == null)
            {
                canvasGroup = GetComponent<CanvasGroup>();
                if (canvasGroup == null)
                {
                    canvasGroup = gameObject.AddComponent<CanvasGroup>();
                }
            }
        }
        
        private void Start()
        {
            mainCamera = Camera.main;
        }
        
        private void LateUpdate()
        {
            if (targetEntity == null)
            {
                return;
            }
            
            // Update position
            transform.position = targetEntity.position + offset;
            
            // Face camera
            if (mainCamera != null)
            {
                transform.rotation = mainCamera.transform.rotation;
            }
            
            // Update visibility
            UpdateVisibility();
        }
        
        #endregion

        #region Public Methods
        
        /// <summary>
        /// Initialize nameplate for an entity.
        /// </summary>
        public void Initialize(Transform entity, string name, int level, EntityType type)
        {
            targetEntity = entity;
            entityName = name;
            entityLevel = level;
            entityType = type;
            
            UpdateNameDisplay();
            UpdateLevelDisplay();
            UpdateHealthBarColor();
        }
        
        /// <summary>
        /// Set entity name.
        /// </summary>
        public void SetName(string name)
        {
            entityName = name;
            UpdateNameDisplay();
        }
        
        /// <summary>
        /// Set entity level.
        /// </summary>
        public void SetLevel(int level)
        {
            entityLevel = level;
            UpdateLevelDisplay();
        }
        
        /// <summary>
        /// Set entity type (affects color).
        /// </summary>
        public void SetEntityType(EntityType type)
        {
            entityType = type;
            UpdateHealthBarColor();
        }
        
        /// <summary>
        /// Update health bar.
        /// </summary>
        public void SetHealth(int current, int max)
        {
            currentHealth = current;
            maxHealth = max;
            
            isDead = current <= 0;
            
            if (healthBar != null)
            {
                float percent = max > 0 ? (float)current / max : 0f;
                healthBar.value = percent;
            }
            
            UpdateHealthBarColor();
            UpdateVisibility();
        }
        
        /// <summary>
        /// Set target entity to follow.
        /// </summary>
        public void SetTarget(Transform entity)
        {
            targetEntity = entity;
        }
        
        /// <summary>
        /// Show or hide nameplate.
        /// </summary>
        public void SetVisible(bool visible)
        {
            if (canvasGroup != null)
            {
                canvasGroup.alpha = visible ? 1f : 0f;
            }
        }
        
        #endregion

        #region Private Methods
        
        /// <summary>
        /// Update name text display.
        /// </summary>
        private void UpdateNameDisplay()
        {
            if (nameText != null)
            {
                nameText.text = entityName;
                
                // Color name based on entity type
                Color nameColor = GetEntityColor();
                nameText.color = nameColor;
            }
        }
        
        /// <summary>
        /// Update level text display.
        /// </summary>
        private void UpdateLevelDisplay()
        {
            if (levelText != null)
            {
                levelText.text = entityLevel.ToString();
            }
        }
        
        /// <summary>
        /// Update health bar color based on entity type and health.
        /// </summary>
        private void UpdateHealthBarColor()
        {
            if (healthFill == null)
            {
                return;
            }
            
            if (isDead)
            {
                healthFill.color = deadColor;
            }
            else
            {
                healthFill.color = GetEntityColor();
            }
        }
        
        /// <summary>
        /// Get color for entity type.
        /// </summary>
        private Color GetEntityColor()
        {
            switch (entityType)
            {
                case EntityType.Player:
                    return playerColor;
                case EntityType.Friendly:
                    return friendlyColor;
                case EntityType.Hostile:
                    return hostileColor;
                case EntityType.Neutral:
                default:
                    return neutralColor;
            }
        }
        
        /// <summary>
        /// Update nameplate visibility based on distance and settings.
        /// </summary>
        private void UpdateVisibility()
        {
            if (canvasGroup == null || mainCamera == null || targetEntity == null)
            {
                return;
            }
            
            // Always visible if configured
            if (alwaysVisible)
            {
                canvasGroup.alpha = 1f;
                return;
            }
            
            // Hide when full health if configured
            if (hideWhenFullHealth && currentHealth >= maxHealth && !isDead)
            {
                canvasGroup.alpha = 0f;
                return;
            }
            
            // Distance-based visibility
            float distance = Vector3.Distance(mainCamera.transform.position, targetEntity.position);
            
            if (distance > maxVisibleDistance)
            {
                canvasGroup.alpha = 0f;
            }
            else
            {
                // Fade out based on distance
                float fadeStart = maxVisibleDistance * 0.7f;
                if (distance > fadeStart)
                {
                    float fadePercent = (distance - fadeStart) / (maxVisibleDistance - fadeStart);
                    canvasGroup.alpha = 1f - fadePercent;
                }
                else
                {
                    canvasGroup.alpha = 1f;
                }
            }
        }
        
        #endregion
    }
}
