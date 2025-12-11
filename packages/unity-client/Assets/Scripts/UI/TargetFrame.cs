using UnityEngine;
using UnityEngine.UI;
using TMPro;

namespace MMORPG.UI
{
    /// <summary>
    /// TargetFrame displays information about the current target.
    /// Shows name, level, health, and allows interaction.
    /// </summary>
    public class TargetFrame : MonoBehaviour
    {
        #region Singleton
        
        public static TargetFrame Instance { get; private set; }
        
        #endregion

        #region Configuration
        
        [Header("UI References")]
        [SerializeField] private GameObject frameContainer;
        [SerializeField] private TMP_Text nameText;
        [SerializeField] private TMP_Text levelText;
        [SerializeField] private Slider healthBar;
        [SerializeField] private TMP_Text healthText;
        [SerializeField] private Image healthFill;
        [SerializeField] private Image targetPortrait;
        [SerializeField] private Image targetTypeIcon;
        [SerializeField] private Transform buffContainer;
        [SerializeField] private Transform debuffContainer;
        
        [Header("Colors")]
        [SerializeField] private Color friendlyColor = new Color(0.2f, 0.8f, 0.2f);
        [SerializeField] private Color neutralColor = new Color(0.9f, 0.9f, 0.2f);
        [SerializeField] private Color hostileColor = new Color(0.9f, 0.2f, 0.2f);
        [SerializeField] private Color playerColor = new Color(0.4f, 0.6f, 1f);
        
        [Header("Level Colors")]
        [SerializeField] private Color levelVeryLow = Color.gray;
        [SerializeField] private Color levelLow = Color.green;
        [SerializeField] private Color levelEqual = Color.yellow;
        [SerializeField] private Color levelHigh = Color.red;
        [SerializeField] private Color levelSkull = new Color(0.8f, 0.2f, 0.8f);
        
        #endregion

        #region State
        
        private string currentTargetId;
        private string currentTargetType;
        private int playerLevel = 1;
        
        #endregion

        #region Properties
        
        public string CurrentTargetId => currentTargetId;
        public bool HasTarget => !string.IsNullOrEmpty(currentTargetId);
        
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
            // Hide frame initially
            if (frameContainer != null)
            {
                frameContainer.SetActive(false);
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
        /// Set the current target.
        /// </summary>
        public void SetTarget(string entityId, string entityType, string name, int level, int health, int maxHealth)
        {
            currentTargetId = entityId;
            currentTargetType = entityType;
            
            // Show frame
            if (frameContainer != null)
            {
                frameContainer.SetActive(true);
            }
            
            // Set name
            if (nameText != null)
            {
                nameText.text = name;
                nameText.color = GetNameColor(entityType);
            }
            
            // Set level
            if (levelText != null)
            {
                if (level < 1 || level > 100)
                {
                    levelText.text = "??";
                    levelText.color = levelSkull;
                }
                else
                {
                    levelText.text = level.ToString();
                    levelText.color = GetLevelColor(level);
                }
            }
            
            // Set health
            UpdateHealth(health, maxHealth);
            
            Debug.Log($"TargetFrame: Set target to {name} ({entityType}) - Level {level}");
        }
        
        /// <summary>
        /// Update the target's health.
        /// </summary>
        public void UpdateHealth(int health, int maxHealth)
        {
            float percentage = maxHealth > 0 ? (float)health / maxHealth : 0;
            
            if (healthBar != null)
            {
                healthBar.value = percentage;
            }
            
            if (healthText != null)
            {
                if (maxHealth > 0)
                {
                    healthText.text = $"{health} / {maxHealth}";
                }
                else
                {
                    healthText.text = "";
                }
            }
        }
        
        /// <summary>
        /// Update target's buffs/debuffs.
        /// </summary>
        public void UpdateAuras(string[] buffIds, string[] debuffIds)
        {
            // Would update buff/debuff icons
            Debug.Log($"TargetFrame: Updated auras - {buffIds?.Length ?? 0} buffs, {debuffIds?.Length ?? 0} debuffs");
        }
        
        /// <summary>
        /// Clear the current target.
        /// </summary>
        public void ClearTarget()
        {
            currentTargetId = null;
            currentTargetType = null;
            
            if (frameContainer != null)
            {
                frameContainer.SetActive(false);
            }
            
            Debug.Log("TargetFrame: Cleared target");
        }
        
        /// <summary>
        /// Set the player's level for comparison.
        /// </summary>
        public void SetPlayerLevel(int level)
        {
            playerLevel = level;
        }
        
        /// <summary>
        /// Set portrait image.
        /// </summary>
        public void SetPortrait(Sprite portrait)
        {
            if (targetPortrait != null)
            {
                targetPortrait.sprite = portrait;
                targetPortrait.enabled = portrait != null;
            }
        }
        
        /// <summary>
        /// Check if a specific entity is targeted.
        /// </summary>
        public bool IsTargeting(string entityId)
        {
            return currentTargetId == entityId;
        }
        
        #endregion

        #region Private Methods
        
        private Color GetNameColor(string entityType)
        {
            switch (entityType?.ToUpper())
            {
                case "PLAYER":
                    return playerColor;
                case "NPC":
                    return friendlyColor;
                case "MONSTER":
                    return hostileColor;
                default:
                    return neutralColor;
            }
        }
        
        private Color GetLevelColor(int targetLevel)
        {
            int diff = targetLevel - playerLevel;
            
            if (diff >= 10)
            {
                return levelSkull; // Skull difficulty
            }
            else if (diff >= 5)
            {
                return levelHigh; // Red - very hard
            }
            else if (diff >= 3)
            {
                return Color.Lerp(levelEqual, levelHigh, 0.5f); // Orange
            }
            else if (diff >= -2)
            {
                return levelEqual; // Yellow - appropriate
            }
            else if (diff >= -7)
            {
                return levelLow; // Green - easy
            }
            else
            {
                return levelVeryLow; // Gray - trivial
            }
        }
        
        #endregion
    }
}
