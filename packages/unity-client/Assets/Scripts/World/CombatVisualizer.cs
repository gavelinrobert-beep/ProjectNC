using UnityEngine;
using MMORPG.Network;

namespace MMORPG.World
{
    /// <summary>
    /// CombatVisualizer handles visual effects for combat events.
    /// Creates hit effects, spell effects, and coordinates with floating combat text.
    /// 
    /// SCALABILITY NOTE: Designed for future enhancements:
    /// - Advanced particle systems
    /// - Spell effect libraries
    /// - Impact sounds and screen shake
    /// - Raid-scale AOE visualization
    /// - PvP combat feedback
    /// </summary>
    public class CombatVisualizer : MonoBehaviour
    {
        #region Singleton
        
        public static CombatVisualizer Instance { get; private set; }
        
        #endregion

        #region Configuration
        
        [Header("Hit Effects")]
        [SerializeField] private GameObject meleeHitPrefab;
        [SerializeField] private GameObject rangedHitPrefab;
        [SerializeField] private GameObject criticalHitPrefab;
        [SerializeField] private GameObject missEffectPrefab;
        
        [Header("Spell Effects")]
        [SerializeField] private GameObject fireSpellPrefab;
        [SerializeField] private GameObject iceSpellPrefab;
        [SerializeField] private GameObject healSpellPrefab;
        [SerializeField] private GameObject buffSpellPrefab;
        
        [Header("Colors")]
        [SerializeField] private Color damageColor = new Color(1f, 0.2f, 0.2f);
        [SerializeField] private Color criticalColor = new Color(1f, 0.8f, 0f);
        [SerializeField] private Color healColor = new Color(0.2f, 1f, 0.2f);
        [SerializeField] private Color missColor = Color.gray;
        
        [Header("Settings")]
        [SerializeField] private float effectLifetime = 2f;
        [SerializeField] private bool enableScreenShake = true;
        [SerializeField] private Transform effectContainer;
        
        #endregion

        #region State
        
        private Camera mainCamera;
        
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
            
            if (effectContainer == null)
            {
                effectContainer = transform;
            }
        }
        
        private void Start()
        {
            mainCamera = Camera.main;
            
            // Subscribe to network combat events
            if (NetworkManager.Instance != null)
            {
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
                NetworkManager.Instance.OnCombatEvent -= HandleCombatEvent;
            }
        }
        
        #endregion

        #region Network Event Handlers
        
        /// <summary>
        /// Handle combat event from server.
        /// </summary>
        private void HandleCombatEvent(CombatEventPayload combat)
        {
            // Get target entity
            GameObject targetEntity = EntityManager.Instance?.GetEntity(combat.targetEntityId);
            if (targetEntity == null)
            {
                return;
            }
            
            Vector3 targetPosition = targetEntity.transform.position + Vector3.up * 1.5f;
            
            switch (combat.type)
            {
                case "DAMAGE":
                    PlayDamageEffect(targetPosition, combat.value, combat.isCritical);
                    ShowFloatingText(targetPosition, combat.value.ToString(), 
                        combat.isCritical ? criticalColor : damageColor, 
                        combat.isCritical ? 1.5f : 1f);
                    
                    // Camera shake for critical hits
                    if (combat.isCritical && enableScreenShake)
                    {
                        ShakeCamera(0.2f, 0.1f);
                    }
                    break;
                    
                case "HEAL":
                    PlayHealEffect(targetPosition, combat.value);
                    ShowFloatingText(targetPosition, $"+{combat.value}", healColor, 1f);
                    break;
                    
                case "BUFF":
                    PlayBuffEffect(targetPosition);
                    ShowFloatingText(targetPosition, combat.abilityName, Color.cyan, 0.8f);
                    break;
                    
                case "DEBUFF":
                    PlayDebuffEffect(targetPosition);
                    ShowFloatingText(targetPosition, combat.abilityName, Color.magenta, 0.8f);
                    break;
                    
                case "DEATH":
                    PlayDeathEffect(targetPosition);
                    break;
            }
            
            // Update HUD combat log
            if (UI.HUD.Instance != null)
            {
                UpdateCombatLog(combat);
            }
        }
        
        #endregion

        #region Public Methods
        
        /// <summary>
        /// Play damage effect at position.
        /// </summary>
        public void PlayDamageEffect(Vector3 position, int damage, bool isCritical)
        {
            GameObject prefab = isCritical ? criticalHitPrefab : meleeHitPrefab;
            
            if (prefab == null)
            {
                prefab = CreateDefaultHitEffect(isCritical);
            }
            
            SpawnEffect(prefab, position);
        }
        
        /// <summary>
        /// Play heal effect at position.
        /// </summary>
        public void PlayHealEffect(Vector3 position, int healAmount)
        {
            GameObject prefab = healSpellPrefab ?? CreateDefaultHealEffect();
            SpawnEffect(prefab, position);
        }
        
        /// <summary>
        /// Play spell cast effect.
        /// </summary>
        public void PlaySpellEffect(Vector3 position, string spellType)
        {
            GameObject prefab = GetSpellEffectPrefab(spellType);
            SpawnEffect(prefab, position);
        }
        
        /// <summary>
        /// Play buff effect at position.
        /// </summary>
        public void PlayBuffEffect(Vector3 position)
        {
            GameObject prefab = buffSpellPrefab ?? CreateDefaultBuffEffect();
            SpawnEffect(prefab, position);
        }
        
        /// <summary>
        /// Play debuff effect at position.
        /// </summary>
        public void PlayDebuffEffect(Vector3 position)
        {
            GameObject prefab = CreateDefaultDebuffEffect();
            SpawnEffect(prefab, position);
        }
        
        /// <summary>
        /// Play death effect at position.
        /// </summary>
        public void PlayDeathEffect(Vector3 position)
        {
            // FUTURE: Play death particle effect, fade out, etc.
            Debug.Log($"CombatVisualizer: Death effect at {position}");
        }
        
        /// <summary>
        /// Show floating combat text.
        /// </summary>
        public void ShowFloatingText(Vector3 worldPosition, string text, Color color, float scale = 1f)
        {
            if (UI.FloatingCombatText.Instance != null)
            {
                UI.FloatingCombatText.Instance.Show(worldPosition, text, color, scale);
            }
        }
        
        #endregion

        #region Private Methods
        
        /// <summary>
        /// Spawn an effect prefab at position.
        /// </summary>
        private void SpawnEffect(GameObject prefab, Vector3 position)
        {
            if (prefab == null)
            {
                return;
            }
            
            GameObject effect = Instantiate(prefab, position, Quaternion.identity, effectContainer);
            
            // Auto-destroy after lifetime
            Destroy(effect, effectLifetime);
        }
        
        /// <summary>
        /// Get spell effect prefab by type.
        /// </summary>
        private GameObject GetSpellEffectPrefab(string spellType)
        {
            switch (spellType?.ToLower())
            {
                case "fire":
                case "fireball":
                    return fireSpellPrefab ?? CreateDefaultFireEffect();
                    
                case "ice":
                case "frostbolt":
                    return iceSpellPrefab ?? CreateDefaultIceEffect();
                    
                case "heal":
                case "healing":
                    return healSpellPrefab ?? CreateDefaultHealEffect();
                    
                default:
                    return CreateDefaultSpellEffect();
            }
        }
        
        /// <summary>
        /// Update combat log in HUD.
        /// </summary>
        private void UpdateCombatLog(CombatEventPayload combat)
        {
            // Get entity names
            GameObject sourceEntity = EntityManager.Instance?.GetEntity(combat.sourceEntityId);
            GameObject targetEntity = EntityManager.Instance?.GetEntity(combat.targetEntityId);
            
            string sourceName = sourceEntity?.name ?? "Unknown";
            string targetName = targetEntity?.name ?? "Unknown";
            
            switch (combat.type)
            {
                case "DAMAGE":
                    UI.HUD.Instance.LogDamage(sourceName, targetName, combat.abilityName, 
                        combat.value, combat.isCritical);
                    break;
                    
                case "HEAL":
                    UI.HUD.Instance.LogHeal(sourceName, targetName, combat.abilityName, 
                        combat.value);
                    break;
            }
        }
        
        /// <summary>
        /// Shake camera for impact feedback.
        /// </summary>
        private void ShakeCamera(float intensity, float duration)
        {
            Systems.CameraController cam = FindObjectOfType<Systems.CameraController>();
            if (cam != null)
            {
                cam.Shake(intensity, duration);
            }
        }
        
        #endregion

        #region Default Effects (MVP Placeholders)
        
        private GameObject CreateDefaultHitEffect(bool isCritical)
        {
            GameObject effect = new GameObject("HitEffect");
            
            // Create simple particle system
            ParticleSystem ps = effect.AddComponent<ParticleSystem>();
            var main = ps.main;
            main.startColor = isCritical ? criticalColor : damageColor;
            main.startSize = isCritical ? 0.5f : 0.3f;
            main.startLifetime = 0.5f;
            main.startSpeed = 2f;
            main.maxParticles = 20;
            
            var emission = ps.emission;
            emission.rateOverTime = 0;
            emission.SetBursts(new ParticleSystem.Burst[] { new ParticleSystem.Burst(0f, 20) });
            
            return effect;
        }
        
        private GameObject CreateDefaultHealEffect()
        {
            GameObject effect = new GameObject("HealEffect");
            
            ParticleSystem ps = effect.AddComponent<ParticleSystem>();
            var main = ps.main;
            main.startColor = healColor;
            main.startSize = 0.3f;
            main.startLifetime = 1f;
            main.startSpeed = 1f;
            main.gravityModifier = -0.5f; // Float upward
            
            return effect;
        }
        
        private GameObject CreateDefaultFireEffect()
        {
            GameObject effect = new GameObject("FireEffect");
            
            ParticleSystem ps = effect.AddComponent<ParticleSystem>();
            var main = ps.main;
            main.startColor = new Color(1f, 0.5f, 0f);
            main.startSize = 0.4f;
            main.startLifetime = 0.5f;
            
            return effect;
        }
        
        private GameObject CreateDefaultIceEffect()
        {
            GameObject effect = new GameObject("IceEffect");
            
            ParticleSystem ps = effect.AddComponent<ParticleSystem>();
            var main = ps.main;
            main.startColor = new Color(0.5f, 0.8f, 1f);
            main.startSize = 0.4f;
            main.startLifetime = 0.5f;
            
            return effect;
        }
        
        private GameObject CreateDefaultSpellEffect()
        {
            GameObject effect = new GameObject("SpellEffect");
            
            ParticleSystem ps = effect.AddComponent<ParticleSystem>();
            var main = ps.main;
            main.startColor = new Color(0.8f, 0.5f, 1f);
            main.startSize = 0.4f;
            main.startLifetime = 0.5f;
            
            return effect;
        }
        
        private GameObject CreateDefaultBuffEffect()
        {
            GameObject effect = new GameObject("BuffEffect");
            
            ParticleSystem ps = effect.AddComponent<ParticleSystem>();
            var main = ps.main;
            main.startColor = Color.cyan;
            main.startSize = 0.5f;
            main.startLifetime = 1f;
            main.gravityModifier = -0.3f;
            
            return effect;
        }
        
        private GameObject CreateDefaultDebuffEffect()
        {
            GameObject effect = new GameObject("DebuffEffect");
            
            ParticleSystem ps = effect.AddComponent<ParticleSystem>();
            var main = ps.main;
            main.startColor = Color.magenta;
            main.startSize = 0.5f;
            main.startLifetime = 1f;
            main.gravityModifier = 0.5f; // Fall downward
            
            return effect;
        }
        
        #endregion
    }
}
