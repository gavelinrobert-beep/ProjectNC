using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;

namespace MMORPG.UI
{
    /// <summary>
    /// ActionBar manages the player's ability buttons and cooldowns.
    /// Supports multiple action bars with keybindings.
    /// </summary>
    public class ActionBar : MonoBehaviour
    {
        #region Types
        
        [System.Serializable]
        public class ActionSlot
        {
            public int slotIndex;
            public string abilityId;
            public Button button;
            public Image iconImage;
            public Image cooldownOverlay;
            public TMP_Text cooldownText;
            public TMP_Text keybindText;
            public KeyCode keybind;
            
            [HideInInspector] public float cooldownRemaining;
            [HideInInspector] public float cooldownTotal;
            [HideInInspector] public bool isOnCooldown;
        }
        
        #endregion

        #region Configuration
        
        [Header("Action Bar Settings")]
        [SerializeField] private int barIndex = 0;
        [SerializeField] private int slotsCount = 12;
        
        [Header("Slot Template")]
        [SerializeField] private GameObject slotPrefab;
        [SerializeField] private Transform slotsContainer;
        
        [Header("Cooldown Display")]
        [SerializeField] private Color cooldownColor = new Color(0, 0, 0, 0.6f);
        [SerializeField] private bool showCooldownSeconds = true;
        
        #endregion

        #region State
        
        private List<ActionSlot> slots = new List<ActionSlot>();
        
        // Default keybindings for first action bar
        private static readonly KeyCode[] DefaultKeybinds = new KeyCode[]
        {
            KeyCode.Alpha1, KeyCode.Alpha2, KeyCode.Alpha3, KeyCode.Alpha4,
            KeyCode.Alpha5, KeyCode.Alpha6, KeyCode.Alpha7, KeyCode.Alpha8,
            KeyCode.Alpha9, KeyCode.Alpha0, KeyCode.Minus, KeyCode.Equals
        };
        
        #endregion

        #region Unity Lifecycle
        
        private void Start()
        {
            InitializeSlots();
        }
        
        private void Update()
        {
            UpdateCooldowns();
            CheckKeybinds();
        }
        
        #endregion

        #region Initialization
        
        private void InitializeSlots()
        {
            // Create slots
            for (int i = 0; i < slotsCount; i++)
            {
                ActionSlot slot = new ActionSlot
                {
                    slotIndex = i,
                    keybind = i < DefaultKeybinds.Length ? DefaultKeybinds[i] : KeyCode.None
                };
                
                // If we have a prefab, instantiate it
                if (slotPrefab != null && slotsContainer != null)
                {
                    GameObject slotObj = Instantiate(slotPrefab, slotsContainer);
                    slotObj.name = $"Slot_{i + 1}";
                    
                    // Get references
                    slot.button = slotObj.GetComponent<Button>();
                    slot.iconImage = slotObj.transform.Find("Icon")?.GetComponent<Image>();
                    slot.cooldownOverlay = slotObj.transform.Find("CooldownOverlay")?.GetComponent<Image>();
                    slot.cooldownText = slotObj.transform.Find("CooldownText")?.GetComponent<TMP_Text>();
                    slot.keybindText = slotObj.transform.Find("KeybindText")?.GetComponent<TMP_Text>();
                    
                    // Setup button click
                    int index = i; // Capture for lambda
                    if (slot.button != null)
                    {
                        slot.button.onClick.AddListener(() => UseSlot(index));
                    }
                    
                    // Show keybind
                    if (slot.keybindText != null)
                    {
                        slot.keybindText.text = GetKeybindDisplayText(slot.keybind);
                    }
                    
                    // Hide cooldown overlay initially
                    if (slot.cooldownOverlay != null)
                    {
                        slot.cooldownOverlay.fillAmount = 0;
                        slot.cooldownOverlay.color = cooldownColor;
                    }
                    
                    if (slot.cooldownText != null)
                    {
                        slot.cooldownText.text = "";
                    }
                }
                
                slots.Add(slot);
            }
        }
        
        #endregion

        #region Public Methods
        
        /// <summary>
        /// Set an ability in a slot.
        /// </summary>
        public void SetSlotAbility(int slotIndex, string abilityId, Sprite icon)
        {
            if (slotIndex < 0 || slotIndex >= slots.Count)
            {
                return;
            }
            
            ActionSlot slot = slots[slotIndex];
            slot.abilityId = abilityId;
            
            if (slot.iconImage != null)
            {
                slot.iconImage.sprite = icon;
                slot.iconImage.enabled = icon != null;
            }
        }
        
        /// <summary>
        /// Clear a slot.
        /// </summary>
        public void ClearSlot(int slotIndex)
        {
            if (slotIndex < 0 || slotIndex >= slots.Count)
            {
                return;
            }
            
            ActionSlot slot = slots[slotIndex];
            slot.abilityId = null;
            slot.isOnCooldown = false;
            slot.cooldownRemaining = 0;
            
            if (slot.iconImage != null)
            {
                slot.iconImage.sprite = null;
                slot.iconImage.enabled = false;
            }
            
            if (slot.cooldownOverlay != null)
            {
                slot.cooldownOverlay.fillAmount = 0;
            }
            
            if (slot.cooldownText != null)
            {
                slot.cooldownText.text = "";
            }
        }
        
        /// <summary>
        /// Start cooldown on an ability.
        /// </summary>
        public void StartCooldown(string abilityId, float duration)
        {
            foreach (var slot in slots)
            {
                if (slot.abilityId == abilityId)
                {
                    slot.isOnCooldown = true;
                    slot.cooldownTotal = duration;
                    slot.cooldownRemaining = duration;
                }
            }
        }
        
        /// <summary>
        /// Set cooldown remaining for an ability.
        /// </summary>
        public void SetCooldownRemaining(string abilityId, float remaining)
        {
            foreach (var slot in slots)
            {
                if (slot.abilityId == abilityId)
                {
                    slot.cooldownRemaining = remaining;
                    slot.isOnCooldown = remaining > 0;
                }
            }
        }
        
        /// <summary>
        /// Change keybind for a slot.
        /// </summary>
        public void SetKeybind(int slotIndex, KeyCode key)
        {
            if (slotIndex < 0 || slotIndex >= slots.Count)
            {
                return;
            }
            
            ActionSlot slot = slots[slotIndex];
            slot.keybind = key;
            
            if (slot.keybindText != null)
            {
                slot.keybindText.text = GetKeybindDisplayText(key);
            }
        }
        
        /// <summary>
        /// Get the ability ID in a slot.
        /// </summary>
        public string GetSlotAbility(int slotIndex)
        {
            if (slotIndex < 0 || slotIndex >= slots.Count)
            {
                return null;
            }
            
            return slots[slotIndex].abilityId;
        }
        
        #endregion

        #region Private Methods
        
        private void UseSlot(int slotIndex)
        {
            if (slotIndex < 0 || slotIndex >= slots.Count)
            {
                return;
            }
            
            ActionSlot slot = slots[slotIndex];
            
            // Check if on cooldown
            if (slot.isOnCooldown)
            {
                Debug.Log($"Ability {slot.abilityId} is on cooldown");
                return;
            }
            
            // Check if ability is set
            if (string.IsNullOrEmpty(slot.abilityId))
            {
                Debug.Log($"No ability in slot {slotIndex}");
                return;
            }
            
            // Use ability through network
            Debug.Log($"Using ability: {slot.abilityId}");
            
            if (Network.NetworkManager.Instance != null)
            {
                // Get current target and position
                // This would come from the targeting system
                string targetId = null; // TargetManager.Instance?.CurrentTargetId;
                Vector3 position = Vector3.zero; // Player position
                
                Network.NetworkManager.Instance.SendAttack(slot.abilityId, targetId, position);
            }
        }
        
        private void UpdateCooldowns()
        {
            foreach (var slot in slots)
            {
                if (!slot.isOnCooldown)
                {
                    continue;
                }
                
                slot.cooldownRemaining -= Time.deltaTime;
                
                if (slot.cooldownRemaining <= 0)
                {
                    // Cooldown complete
                    slot.isOnCooldown = false;
                    slot.cooldownRemaining = 0;
                    
                    if (slot.cooldownOverlay != null)
                    {
                        slot.cooldownOverlay.fillAmount = 0;
                    }
                    
                    if (slot.cooldownText != null)
                    {
                        slot.cooldownText.text = "";
                    }
                }
                else
                {
                    // Update cooldown display
                    if (slot.cooldownOverlay != null)
                    {
                        slot.cooldownOverlay.fillAmount = slot.cooldownRemaining / slot.cooldownTotal;
                    }
                    
                    if (slot.cooldownText != null && showCooldownSeconds)
                    {
                        if (slot.cooldownRemaining >= 60)
                        {
                            slot.cooldownText.text = $"{slot.cooldownRemaining / 60:F0}m";
                        }
                        else if (slot.cooldownRemaining >= 1)
                        {
                            slot.cooldownText.text = $"{slot.cooldownRemaining:F0}";
                        }
                        else
                        {
                            slot.cooldownText.text = $"{slot.cooldownRemaining:F1}";
                        }
                    }
                }
            }
        }
        
        private void CheckKeybinds()
        {
            foreach (var slot in slots)
            {
                if (slot.keybind != KeyCode.None && Input.GetKeyDown(slot.keybind))
                {
                    UseSlot(slot.slotIndex);
                }
            }
        }
        
        private string GetKeybindDisplayText(KeyCode key)
        {
            switch (key)
            {
                case KeyCode.Alpha0: return "0";
                case KeyCode.Alpha1: return "1";
                case KeyCode.Alpha2: return "2";
                case KeyCode.Alpha3: return "3";
                case KeyCode.Alpha4: return "4";
                case KeyCode.Alpha5: return "5";
                case KeyCode.Alpha6: return "6";
                case KeyCode.Alpha7: return "7";
                case KeyCode.Alpha8: return "8";
                case KeyCode.Alpha9: return "9";
                case KeyCode.Minus: return "-";
                case KeyCode.Equals: return "=";
                case KeyCode.None: return "";
                default: return key.ToString();
            }
        }
        
        #endregion
    }
}
