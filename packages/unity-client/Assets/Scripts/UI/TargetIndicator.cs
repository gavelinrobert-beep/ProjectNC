using UnityEngine;

namespace MMORPG.UI
{
    /// <summary>
    /// TargetIndicator shows a visual indicator around the selected target.
    /// Displays target selection ring or highlight effect.
    /// 
    /// SCALABILITY NOTE: Designed for future enhancements:
    /// - Multiple target types (focus, mouseover, etc.)
    /// - Friendly/hostile color coding
    /// - Range indicators for spells
    /// - Raid target markers
    /// </summary>
    public class TargetIndicator : MonoBehaviour
    {
        #region Singleton
        
        public static TargetIndicator Instance { get; private set; }
        
        #endregion

        #region Configuration
        
        [Header("Indicator Settings")]
        [SerializeField] private GameObject indicatorPrefab;
        [SerializeField] private float indicatorHeight = 0.1f;
        [SerializeField] private float indicatorScale = 1.5f;
        [SerializeField] private float rotationSpeed = 90f;
        
        [Header("Colors")]
        [SerializeField] private Color friendlyColor = new Color(0.2f, 1f, 0.2f, 0.8f);
        [SerializeField] private Color neutralColor = new Color(1f, 1f, 0.2f, 0.8f);
        [SerializeField] private Color hostileColor = new Color(1f, 0.2f, 0.2f, 0.8f);
        [SerializeField] private Color deadColor = new Color(0.5f, 0.5f, 0.5f, 0.5f);
        
        [Header("Animation")]
        [SerializeField] private bool enablePulse = true;
        [SerializeField] private float pulseSpeed = 2f;
        [SerializeField] private float pulseAmount = 0.2f;
        
        #endregion

        #region State
        
        private GameObject currentIndicator;
        private Transform currentTarget;
        private Renderer indicatorRenderer;
        private Color currentColor;
        private float baseScale;
        
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
        
        private void Update()
        {
            UpdateIndicator();
        }
        
        private void OnDestroy()
        {
            if (Instance == this)
            {
                Instance = null;
            }
            
            if (currentIndicator != null)
            {
                Destroy(currentIndicator);
            }
        }
        
        #endregion

        #region Public Methods
        
        /// <summary>
        /// Set the current target to display indicator for.
        /// </summary>
        public void SetTarget(Transform target, Nameplate.EntityType entityType)
        {
            currentTarget = target;
            
            if (target == null)
            {
                HideIndicator();
                return;
            }
            
            // Create indicator if needed
            if (currentIndicator == null)
            {
                CreateIndicator();
            }
            
            // Set color based on entity type
            switch (entityType)
            {
                case Nameplate.EntityType.Friendly:
                case Nameplate.EntityType.Player:
                    currentColor = friendlyColor;
                    break;
                case Nameplate.EntityType.Hostile:
                    currentColor = hostileColor;
                    break;
                case Nameplate.EntityType.Neutral:
                default:
                    currentColor = neutralColor;
                    break;
            }
            
            UpdateIndicatorColor();
            
            // Show indicator
            if (currentIndicator != null)
            {
                currentIndicator.SetActive(true);
            }
        }
        
        /// <summary>
        /// Clear the current target.
        /// </summary>
        public void ClearTarget()
        {
            currentTarget = null;
            HideIndicator();
        }
        
        /// <summary>
        /// Set target as dead (gray out indicator).
        /// </summary>
        public void SetTargetDead(bool isDead)
        {
            if (isDead)
            {
                currentColor = deadColor;
                UpdateIndicatorColor();
            }
        }
        
        #endregion

        #region Private Methods
        
        /// <summary>
        /// Create the target indicator GameObject.
        /// </summary>
        private void CreateIndicator()
        {
            if (indicatorPrefab != null)
            {
                currentIndicator = Instantiate(indicatorPrefab, transform);
            }
            else
            {
                // Create default ring indicator
                currentIndicator = CreateDefaultIndicator();
            }
            
            indicatorRenderer = currentIndicator.GetComponentInChildren<Renderer>();
            baseScale = indicatorScale;
            
            currentIndicator.SetActive(false);
        }
        
        /// <summary>
        /// Create default target indicator (ring shape).
        /// NOTE: This is a simple placeholder. For production, use a custom mesh or sprite.
        /// </summary>
        private GameObject CreateDefaultIndicator()
        {
            GameObject indicator = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
            indicator.name = "TargetIndicator";
            indicator.transform.SetParent(transform);
            
            // Remove collider
            Destroy(indicator.GetComponent<Collider>());
            
            // Flatten to ring shape
            indicator.transform.localScale = new Vector3(indicatorScale, 0.02f, indicatorScale);
            
            // Create transparent material for MVP
            // FUTURE: Replace with custom shader or sprite-based ring
            Material mat = new Material(Shader.Find("Standard"));
            
            // Configure for transparency (Standard shader in Fade mode)
            // Using string property names as this is MVP placeholder code
            // Production would use custom shader with cached property IDs
            mat.SetFloat("_Mode", 3); // Fade mode
            mat.SetInt("_SrcBlend", (int)UnityEngine.Rendering.BlendMode.SrcAlpha);
            mat.SetInt("_DstBlend", (int)UnityEngine.Rendering.BlendMode.OneMinusSrcAlpha);
            mat.SetInt("_ZWrite", 0);
            mat.DisableKeyword("_ALPHATEST_ON");
            mat.EnableKeyword("_ALPHABLEND_ON");
            mat.DisableKeyword("_ALPHAPREMULTIPLY_ON");
            mat.renderQueue = 3000;
            mat.color = hostileColor;
            
            indicator.GetComponent<Renderer>().material = mat;
            
            return indicator;
        }
        
        /// <summary>
        /// Update indicator position and animation.
        /// </summary>
        private void UpdateIndicator()
        {
            if (currentIndicator == null || currentTarget == null || !currentIndicator.activeSelf)
            {
                return;
            }
            
            // Update position
            Vector3 targetPosition = currentTarget.position;
            targetPosition.y = indicatorHeight;
            currentIndicator.transform.position = targetPosition;
            
            // Rotation animation
            currentIndicator.transform.Rotate(Vector3.up, rotationSpeed * Time.deltaTime);
            
            // Pulse animation
            if (enablePulse)
            {
                float pulse = Mathf.Sin(Time.time * pulseSpeed) * pulseAmount;
                float scale = baseScale + pulse;
                currentIndicator.transform.localScale = new Vector3(scale, 0.02f, scale);
            }
        }
        
        /// <summary>
        /// Update indicator color.
        /// </summary>
        private void UpdateIndicatorColor()
        {
            if (indicatorRenderer != null && indicatorRenderer.material != null)
            {
                indicatorRenderer.material.color = currentColor;
            }
        }
        
        /// <summary>
        /// Hide the indicator.
        /// </summary>
        private void HideIndicator()
        {
            if (currentIndicator != null)
            {
                currentIndicator.SetActive(false);
            }
        }
        
        #endregion
    }
}
