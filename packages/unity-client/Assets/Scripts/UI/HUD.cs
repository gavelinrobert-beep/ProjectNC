using UnityEngine;
using UnityEngine.UI;
using TMPro;

namespace MMORPG.UI
{
    /// <summary>
    /// HUD displays the player's health, mana, experience, and other vital stats.
    /// </summary>
    public class HUD : MonoBehaviour
    {
        #region Singleton
        
        public static HUD Instance { get; private set; }
        
        #endregion

        #region UI References
        
        [Header("Player Info")]
        [SerializeField] private TMP_Text playerNameText;
        [SerializeField] private TMP_Text playerLevelText;
        
        [Header("Health")]
        [SerializeField] private Slider healthBar;
        [SerializeField] private TMP_Text healthText;
        [SerializeField] private Image healthFill;
        
        [Header("Mana")]
        [SerializeField] private Slider manaBar;
        [SerializeField] private TMP_Text manaText;
        [SerializeField] private Image manaFill;
        
        [Header("Experience")]
        [SerializeField] private Slider experienceBar;
        [SerializeField] private TMP_Text experienceText;
        
        [Header("Cast Bar")]
        [SerializeField] private GameObject castBarContainer;
        [SerializeField] private Slider castBar;
        [SerializeField] private TMP_Text castSpellName;
        
        [Header("Combat")]
        [SerializeField] private TMP_Text combatLogText;
        
        [Header("Minimap")]
        [SerializeField] private RawImage minimapImage;
        [SerializeField] private TMP_Text zoneNameText;
        [SerializeField] private TMP_Text coordinatesText;
        
        [Header("Status")]
        [SerializeField] private Transform buffContainer;
        [SerializeField] private Transform debuffContainer;
        [SerializeField] private GameObject buffIconPrefab;
        
        #endregion

        #region Colors
        
        [Header("Colors")]
        [SerializeField] private Color healthColorFull = new Color(0.2f, 0.8f, 0.2f);
        [SerializeField] private Color healthColorMedium = new Color(0.9f, 0.9f, 0.2f);
        [SerializeField] private Color healthColorLow = new Color(0.9f, 0.2f, 0.2f);
        [SerializeField] private float lowHealthThreshold = 0.3f;
        [SerializeField] private float mediumHealthThreshold = 0.6f;
        
        #endregion

        #region State
        
        private int currentHealth;
        private int maxHealth;
        private int currentMana;
        private int maxMana;
        private bool isCasting;
        private float castStartTime;
        private float castDuration;
        
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
            // Initialize cast bar
            if (castBarContainer != null)
            {
                castBarContainer.SetActive(false);
            }
        }
        
        private void Update()
        {
            UpdateCastBar();
        }
        
        private void OnDestroy()
        {
            if (Instance == this)
            {
                Instance = null;
            }
        }
        
        #endregion

        #region Public Methods - Player Info
        
        /// <summary>
        /// Set player name display.
        /// </summary>
        public void SetPlayerName(string name)
        {
            if (playerNameText != null)
            {
                playerNameText.text = name;
            }
        }
        
        /// <summary>
        /// Set player level display.
        /// </summary>
        public void SetPlayerLevel(int level)
        {
            if (playerLevelText != null)
            {
                playerLevelText.text = $"Level {level}";
            }
        }
        
        #endregion

        #region Public Methods - Resources
        
        /// <summary>
        /// Update health display.
        /// </summary>
        public void SetHealth(int current, int max)
        {
            currentHealth = current;
            maxHealth = max;
            
            float percentage = max > 0 ? (float)current / max : 0;
            
            if (healthBar != null)
            {
                healthBar.value = percentage;
            }
            
            if (healthText != null)
            {
                healthText.text = $"{current} / {max}";
            }
            
            if (healthFill != null)
            {
                if (percentage <= lowHealthThreshold)
                {
                    healthFill.color = healthColorLow;
                }
                else if (percentage <= mediumHealthThreshold)
                {
                    healthFill.color = healthColorMedium;
                }
                else
                {
                    healthFill.color = healthColorFull;
                }
            }
        }
        
        /// <summary>
        /// Update mana display.
        /// </summary>
        public void SetMana(int current, int max)
        {
            currentMana = current;
            maxMana = max;
            
            float percentage = max > 0 ? (float)current / max : 0;
            
            if (manaBar != null)
            {
                manaBar.value = percentage;
            }
            
            if (manaText != null)
            {
                manaText.text = $"{current} / {max}";
            }
        }
        
        /// <summary>
        /// Update experience display.
        /// </summary>
        public void SetExperience(int current, int max)
        {
            float percentage = max > 0 ? (float)current / max : 0;
            
            if (experienceBar != null)
            {
                experienceBar.value = percentage;
            }
            
            if (experienceText != null)
            {
                experienceText.text = $"{current:N0} / {max:N0} ({percentage * 100:F1}%)";
            }
        }
        
        #endregion

        #region Public Methods - Casting
        
        /// <summary>
        /// Start casting bar animation.
        /// </summary>
        public void StartCastBar(string spellName, float duration)
        {
            if (castBarContainer == null)
            {
                return;
            }
            
            isCasting = true;
            castStartTime = Time.time;
            castDuration = duration;
            
            castBarContainer.SetActive(true);
            
            if (castSpellName != null)
            {
                castSpellName.text = spellName;
            }
            
            if (castBar != null)
            {
                castBar.value = 0;
            }
        }
        
        /// <summary>
        /// Cancel/complete casting bar.
        /// </summary>
        public void StopCastBar()
        {
            isCasting = false;
            
            if (castBarContainer != null)
            {
                castBarContainer.SetActive(false);
            }
        }
        
        private void UpdateCastBar()
        {
            if (!isCasting || castBar == null)
            {
                return;
            }
            
            float elapsed = Time.time - castStartTime;
            float percentage = castDuration > 0 ? elapsed / castDuration : 1;
            
            castBar.value = Mathf.Clamp01(percentage);
            
            if (percentage >= 1f)
            {
                StopCastBar();
            }
        }
        
        #endregion

        #region Public Methods - Combat Log
        
        /// <summary>
        /// Add a message to the combat log.
        /// </summary>
        public void AddCombatLogMessage(string message)
        {
            if (combatLogText != null)
            {
                // Keep last 10 lines
                string[] lines = combatLogText.text.Split('\n');
                if (lines.Length > 9)
                {
                    combatLogText.text = string.Join("\n", lines, 1, 9);
                }
                
                combatLogText.text += (combatLogText.text.Length > 0 ? "\n" : "") + message;
            }
        }
        
        /// <summary>
        /// Log a damage event.
        /// </summary>
        public void LogDamage(string sourceName, string targetName, string abilityName, int damage, bool isCrit)
        {
            string critText = isCrit ? " (Critical!)" : "";
            string message = $"<color=#FF6666>{sourceName}</color> hit <color=#FFFF66>{targetName}</color> " +
                           $"with {abilityName} for <color=#FF0000>{damage}</color>{critText}";
            AddCombatLogMessage(message);
        }
        
        /// <summary>
        /// Log a heal event.
        /// </summary>
        public void LogHeal(string sourceName, string targetName, string abilityName, int amount)
        {
            string message = $"<color=#66FF66>{sourceName}</color> healed <color=#FFFF66>{targetName}</color> " +
                           $"for <color=#00FF00>{amount}</color>";
            AddCombatLogMessage(message);
        }
        
        #endregion

        #region Public Methods - Location
        
        /// <summary>
        /// Set zone name display.
        /// </summary>
        public void SetZoneName(string zoneName)
        {
            if (zoneNameText != null)
            {
                zoneNameText.text = zoneName;
            }
        }
        
        /// <summary>
        /// Update coordinate display.
        /// </summary>
        public void SetCoordinates(float x, float y, float z)
        {
            if (coordinatesText != null)
            {
                coordinatesText.text = $"({x:F0}, {y:F0}, {z:F0})";
            }
        }
        
        #endregion

        #region Public Methods - Buffs/Debuffs
        
        /// <summary>
        /// Add a buff icon.
        /// </summary>
        public void AddBuff(string buffId, string iconPath, float duration)
        {
            if (buffContainer == null || buffIconPrefab == null)
            {
                return;
            }
            
            // Would instantiate buff icon with timer
            Debug.Log($"HUD: Added buff {buffId} for {duration}s");
        }
        
        /// <summary>
        /// Remove a buff icon.
        /// </summary>
        public void RemoveBuff(string buffId)
        {
            Debug.Log($"HUD: Removed buff {buffId}");
        }
        
        /// <summary>
        /// Add a debuff icon.
        /// </summary>
        public void AddDebuff(string debuffId, string iconPath, float duration)
        {
            if (debuffContainer == null || buffIconPrefab == null)
            {
                return;
            }
            
            Debug.Log($"HUD: Added debuff {debuffId} for {duration}s");
        }
        
        /// <summary>
        /// Remove a debuff icon.
        /// </summary>
        public void RemoveDebuff(string debuffId)
        {
            Debug.Log($"HUD: Removed debuff {debuffId}");
        }
        
        #endregion
    }
}
