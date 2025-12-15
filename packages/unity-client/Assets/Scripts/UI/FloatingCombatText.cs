using System.Collections.Generic;
using UnityEngine;
using TMPro;

namespace MMORPG.UI
{
    /// <summary>
    /// FloatingCombatText manages floating damage/heal numbers that appear over entities.
    /// Uses object pooling for performance with many combat events.
    /// 
    /// SCALABILITY NOTE: Designed for high-volume combat:
    /// - Object pooling prevents GC allocations
    /// - Configurable max active texts
    /// - Batch rendering for performance
    /// - Future: Combat text grouping for cleaner display
    /// </summary>
    public class FloatingCombatText : MonoBehaviour
    {
        #region Singleton
        
        public static FloatingCombatText Instance { get; private set; }
        
        #endregion

        #region Configuration
        
        [Header("Prefab")]
        [SerializeField] private GameObject textPrefab;
        
        [Header("Animation")]
        [SerializeField] private float floatSpeed = 1f;
        [SerializeField] private float floatDistance = 2f;
        [SerializeField] private float lifetime = 2f;
        [SerializeField] private float fadeStartPercent = 0.5f;
        
        [Header("Randomization")]
        [SerializeField] private Vector2 horizontalRandomRange = new Vector2(-0.5f, 0.5f);
        [SerializeField] private float criticalSizeMultiplier = 1.5f;
        
        [Header("Pooling")]
        [SerializeField] private int poolSize = 50;
        [SerializeField] private int maxActiveTexts = 100;
        
        [Header("Font")]
        [SerializeField] private TMP_FontAsset defaultFont;
        [SerializeField] private float defaultFontSize = 36f;
        
        #endregion

        #region State
        
        private Queue<FloatingText> textPool = new Queue<FloatingText>();
        private List<FloatingText> activeTexts = new List<FloatingText>();
        private Camera mainCamera;
        private Transform textContainer;
        
        #endregion

        #region Types
        
        /// <summary>
        /// Individual floating text instance.
        /// </summary>
        private class FloatingText
        {
            public GameObject gameObject;
            public TextMeshProUGUI textComponent;
            public RectTransform rectTransform;
            public Vector3 worldPosition;
            public Vector3 velocity;
            public float spawnTime;
            public float lifetime;
            public Color startColor;
            public bool isActive;
        }
        
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
            
            // Create container for text objects
            textContainer = new GameObject("FloatingTextContainer").transform;
            textContainer.SetParent(transform);
        }
        
        private void Start()
        {
            mainCamera = Camera.main;
            InitializePool();
        }
        
        private void Update()
        {
            UpdateActiveTexts();
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
        /// Initialize object pool.
        /// </summary>
        private void InitializePool()
        {
            for (int i = 0; i < poolSize; i++)
            {
                FloatingText text = CreateFloatingText();
                text.gameObject.SetActive(false);
                textPool.Enqueue(text);
            }
            
            Debug.Log($"FloatingCombatText: Initialized pool with {poolSize} objects");
        }
        
        /// <summary>
        /// Create a new floating text object.
        /// </summary>
        private FloatingText CreateFloatingText()
        {
            GameObject obj;
            
            if (textPrefab != null)
            {
                obj = Instantiate(textPrefab, textContainer);
            }
            else
            {
                // Create default text object
                obj = new GameObject("FloatingText");
                obj.transform.SetParent(textContainer);
                
                Canvas canvas = obj.AddComponent<Canvas>();
                canvas.renderMode = RenderMode.WorldSpace;
                
                CanvasGroup canvasGroup = obj.AddComponent<CanvasGroup>();
                
                GameObject textObj = new GameObject("Text");
                textObj.transform.SetParent(obj.transform);
                
                TextMeshProUGUI tmp = textObj.AddComponent<TextMeshProUGUI>();
                tmp.font = defaultFont;
                tmp.fontSize = defaultFontSize;
                tmp.alignment = TextAlignmentOptions.Center;
                tmp.enableWordWrapping = false;
                
                RectTransform rt = textObj.GetComponent<RectTransform>();
                rt.sizeDelta = new Vector2(200, 100);
                rt.anchoredPosition = Vector2.zero;
            }
            
            FloatingText floatingText = new FloatingText
            {
                gameObject = obj,
                rectTransform = obj.GetComponent<RectTransform>(),
                textComponent = obj.GetComponentInChildren<TextMeshProUGUI>()
            };
            
            return floatingText;
        }
        
        #endregion

        #region Public Methods
        
        /// <summary>
        /// Show floating text at world position.
        /// </summary>
        public void Show(Vector3 worldPosition, string text, Color color, float scale = 1f)
        {
            // Check max active limit
            if (activeTexts.Count >= maxActiveTexts)
            {
                // Remove oldest text
                ReturnToPool(activeTexts[0]);
            }
            
            FloatingText floatingText = GetFromPool();
            if (floatingText == null)
            {
                return;
            }
            
            // Setup text
            floatingText.textComponent.text = text;
            floatingText.textComponent.color = color;
            floatingText.textComponent.fontSize = defaultFontSize * scale;
            floatingText.startColor = color;
            
            // Setup position
            floatingText.worldPosition = worldPosition;
            floatingText.spawnTime = Time.time;
            floatingText.lifetime = lifetime;
            floatingText.isActive = true;
            
            // Random horizontal offset
            float randomX = Random.Range(horizontalRandomRange.x, horizontalRandomRange.y);
            floatingText.velocity = new Vector3(randomX, floatSpeed, 0);
            
            // Set initial position
            UpdateTextPosition(floatingText);
            
            // Activate
            floatingText.gameObject.SetActive(true);
            activeTexts.Add(floatingText);
        }
        
        /// <summary>
        /// Show damage number.
        /// </summary>
        public void ShowDamage(Vector3 worldPosition, int damage, bool isCritical)
        {
            Color color = isCritical ? new Color(1f, 0.8f, 0f) : new Color(1f, 0.2f, 0.2f);
            float scale = isCritical ? criticalSizeMultiplier : 1f;
            
            string text = damage.ToString();
            if (isCritical)
            {
                text += "!";
            }
            
            Show(worldPosition, text, color, scale);
        }
        
        /// <summary>
        /// Show heal number.
        /// </summary>
        public void ShowHeal(Vector3 worldPosition, int healAmount)
        {
            Color color = new Color(0.2f, 1f, 0.2f);
            Show(worldPosition, $"+{healAmount}", color);
        }
        
        /// <summary>
        /// Show miss text.
        /// </summary>
        public void ShowMiss(Vector3 worldPosition)
        {
            Show(worldPosition, "Miss", Color.gray, 0.8f);
        }
        
        #endregion

        #region Private Methods
        
        /// <summary>
        /// Get floating text from pool.
        /// </summary>
        private FloatingText GetFromPool()
        {
            if (textPool.Count > 0)
            {
                return textPool.Dequeue();
            }
            
            // Pool exhausted, create new one
            Debug.LogWarning("FloatingCombatText: Pool exhausted, creating new text");
            return CreateFloatingText();
        }
        
        /// <summary>
        /// Return floating text to pool.
        /// </summary>
        private void ReturnToPool(FloatingText text)
        {
            text.isActive = false;
            text.gameObject.SetActive(false);
            activeTexts.Remove(text);
            textPool.Enqueue(text);
        }
        
        /// <summary>
        /// Update all active floating texts.
        /// </summary>
        private void UpdateActiveTexts()
        {
            if (mainCamera == null)
            {
                mainCamera = Camera.main;
                if (mainCamera == null) return;
            }
            
            for (int i = activeTexts.Count - 1; i >= 0; i--)
            {
                FloatingText text = activeTexts[i];
                
                float elapsed = Time.time - text.spawnTime;
                float percent = elapsed / text.lifetime;
                
                // Check if expired
                if (percent >= 1f)
                {
                    ReturnToPool(text);
                    continue;
                }
                
                // Update position
                text.worldPosition += text.velocity * Time.deltaTime;
                UpdateTextPosition(text);
                
                // Update fade
                if (percent >= fadeStartPercent)
                {
                    float fadePercent = (percent - fadeStartPercent) / (1f - fadeStartPercent);
                    Color color = text.startColor;
                    color.a = 1f - fadePercent;
                    text.textComponent.color = color;
                }
                
                // Face camera
                text.gameObject.transform.rotation = mainCamera.transform.rotation;
            }
        }
        
        /// <summary>
        /// Update text position to world position.
        /// </summary>
        private void UpdateTextPosition(FloatingText text)
        {
            text.gameObject.transform.position = text.worldPosition;
            
            // Scale based on distance for better visibility
            float distance = Vector3.Distance(mainCamera.transform.position, text.worldPosition);
            float scale = Mathf.Clamp(distance * 0.01f, 0.5f, 2f);
            text.gameObject.transform.localScale = Vector3.one * scale;
        }
        
        #endregion

        #region Debug
        
        private void OnGUI()
        {
            if (Debug.isDebugBuild)
            {
                GUILayout.BeginArea(new Rect(10, 580, 250, 80));
                GUILayout.BeginVertical("box");
                GUILayout.Label("Floating Combat Text");
                GUILayout.Label($"Active: {activeTexts.Count}/{maxActiveTexts}");
                GUILayout.Label($"Pool: {textPool.Count}/{poolSize}");
                GUILayout.EndVertical();
                GUILayout.EndArea();
            }
        }
        
        #endregion
    }
}
