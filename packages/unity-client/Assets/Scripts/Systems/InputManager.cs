using UnityEngine;
using UnityEngine.EventSystems;

namespace MMORPG.Systems
{
    /// <summary>
    /// InputManager handles all player input and provides unified input API.
    /// Centralizes input handling for easy remapping and future controller support.
    /// 
    /// SCALABILITY NOTE: Designed for future expansion:
    /// - Controller support (gamepad, joystick)
    /// - Input remapping UI
    /// - Macro system for ability chains
    /// - Action bars and keybinds
    /// </summary>
    public class InputManager : MonoBehaviour
    {
        #region Singleton
        
        public static InputManager Instance { get; private set; }
        
        #endregion

        #region Configuration
        
        [Header("Movement")]
        [SerializeField] private KeyCode forwardKey = KeyCode.W;
        [SerializeField] private KeyCode backwardKey = KeyCode.S;
        [SerializeField] private KeyCode leftKey = KeyCode.A;
        [SerializeField] private KeyCode rightKey = KeyCode.D;
        [SerializeField] private KeyCode jumpKey = KeyCode.Space;
        [SerializeField] private KeyCode sprintKey = KeyCode.LeftShift;
        
        [Header("Camera")]
        [SerializeField] private int cameraRotateButton = 1; // Right mouse button
        [SerializeField] private float mouseSensitivity = 1f;
        
        [Header("Action Bars")]
        [SerializeField] private KeyCode[] actionBarKeys = new KeyCode[]
        {
            KeyCode.Alpha1, KeyCode.Alpha2, KeyCode.Alpha3, KeyCode.Alpha4,
            KeyCode.Alpha5, KeyCode.Alpha6, KeyCode.Alpha7, KeyCode.Alpha8,
            KeyCode.Alpha9, KeyCode.Alpha0
        };
        
        [Header("Targeting")]
        [SerializeField] private KeyCode targetNearestKey = KeyCode.Tab;
        [SerializeField] private KeyCode targetSelfKey = KeyCode.F1;
        [SerializeField] private int selectTargetButton = 0; // Left mouse button
        
        [Header("UI")]
        [SerializeField] private KeyCode inventoryKey = KeyCode.I;
        [SerializeField] private KeyCode characterKey = KeyCode.C;
        [SerializeField] private KeyCode questLogKey = KeyCode.L;
        [SerializeField] private KeyCode mapKey = KeyCode.M;
        [SerializeField] private KeyCode escapeKey = KeyCode.Escape;
        
        [Header("Chat")]
        [SerializeField] private KeyCode chatKey = KeyCode.Return;
        [SerializeField] private KeyCode sayChannelKey = KeyCode.None;
        [SerializeField] private KeyCode partyChannelKey = KeyCode.None;
        [SerializeField] private KeyCode guildChannelKey = KeyCode.None;
        
        #endregion

        #region State
        
        private bool isInputEnabled = true;
        private bool isChatFocused = false;
        private bool isUIFocused = false;
        
        #endregion

        #region Properties
        
        /// <summary>Whether input is currently enabled.</summary>
        public bool IsInputEnabled
        {
            get => isInputEnabled;
            set => isInputEnabled = value;
        }
        
        /// <summary>Whether chat is focused (blocks gameplay input).</summary>
        public bool IsChatFocused
        {
            get => isChatFocused;
            set => isChatFocused = value;
        }
        
        /// <summary>Whether any UI is focused (blocks certain inputs).</summary>
        public bool IsUIFocused
        {
            get => isUIFocused;
            set => isUIFocused = value;
        }
        
        /// <summary>Mouse sensitivity multiplier.</summary>
        public float MouseSensitivity => mouseSensitivity;
        
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
        }
        
        private void Update()
        {
            // Update UI focus state
            UpdateUIFocusState();
        }
        
        private void OnDestroy()
        {
            if (Instance == this)
            {
                Instance = null;
            }
        }
        
        #endregion

        #region Movement Input
        
        /// <summary>Get movement input as Vector2 (horizontal, vertical).</summary>
        public Vector2 GetMovementInput()
        {
            if (!isInputEnabled || isChatFocused)
            {
                return Vector2.zero;
            }
            
            float horizontal = 0f;
            float vertical = 0f;
            
            if (Input.GetKey(forwardKey)) vertical += 1f;
            if (Input.GetKey(backwardKey)) vertical -= 1f;
            if (Input.GetKey(leftKey)) horizontal -= 1f;
            if (Input.GetKey(rightKey)) horizontal += 1f;
            
            return new Vector2(horizontal, vertical);
        }
        
        /// <summary>Check if jump was pressed this frame.</summary>
        public bool GetJumpPressed()
        {
            return isInputEnabled && !isChatFocused && Input.GetKeyDown(jumpKey);
        }
        
        /// <summary>Check if sprint is held.</summary>
        public bool GetSprintHeld()
        {
            return isInputEnabled && !isChatFocused && Input.GetKey(sprintKey);
        }
        
        #endregion

        #region Camera Input
        
        /// <summary>Get mouse delta for camera rotation.</summary>
        public Vector2 GetCameraRotationInput()
        {
            if (!isInputEnabled || isChatFocused)
            {
                return Vector2.zero;
            }
            
            if (Input.GetMouseButton(cameraRotateButton))
            {
                return new Vector2(
                    Input.GetAxis("Mouse X") * mouseSensitivity,
                    Input.GetAxis("Mouse Y") * mouseSensitivity
                );
            }
            
            return Vector2.zero;
        }
        
        /// <summary>Get mouse scroll delta for camera zoom.</summary>
        public float GetCameraZoomInput()
        {
            if (!isInputEnabled)
            {
                return 0f;
            }
            
            return Input.GetAxis("Mouse ScrollWheel");
        }
        
        /// <summary>Check if camera rotate button is held.</summary>
        public bool IsCameraRotating()
        {
            return isInputEnabled && !isChatFocused && Input.GetMouseButton(cameraRotateButton);
        }
        
        #endregion

        #region Action Bar Input
        
        /// <summary>Get action bar key press (0-9, returns -1 if none).</summary>
        public int GetActionBarKeyPressed()
        {
            if (!isInputEnabled || isChatFocused || isUIFocused)
            {
                return -1;
            }
            
            for (int i = 0; i < actionBarKeys.Length; i++)
            {
                if (Input.GetKeyDown(actionBarKeys[i]))
                {
                    return i;
                }
            }
            
            return -1;
        }
        
        #endregion

        #region Targeting Input
        
        /// <summary>Check if target nearest enemy was pressed.</summary>
        public bool GetTargetNearestPressed()
        {
            return isInputEnabled && !isChatFocused && Input.GetKeyDown(targetNearestKey);
        }
        
        /// <summary>Check if target self was pressed.</summary>
        public bool GetTargetSelfPressed()
        {
            return isInputEnabled && !isChatFocused && Input.GetKeyDown(targetSelfKey);
        }
        
        /// <summary>Check if mouse click for target selection occurred.</summary>
        public bool GetSelectTargetPressed()
        {
            return isInputEnabled && !isChatFocused && 
                   !IsPointerOverUI() && Input.GetMouseButtonDown(selectTargetButton);
        }
        
        /// <summary>Get mouse position in screen space.</summary>
        public Vector3 GetMousePosition()
        {
            return Input.mousePosition;
        }
        
        #endregion

        #region UI Input
        
        /// <summary>Check if inventory toggle was pressed.</summary>
        public bool GetInventoryPressed()
        {
            return isInputEnabled && Input.GetKeyDown(inventoryKey);
        }
        
        /// <summary>Check if character sheet toggle was pressed.</summary>
        public bool GetCharacterSheetPressed()
        {
            return isInputEnabled && Input.GetKeyDown(characterKey);
        }
        
        /// <summary>Check if quest log toggle was pressed.</summary>
        public bool GetQuestLogPressed()
        {
            return isInputEnabled && Input.GetKeyDown(questLogKey);
        }
        
        /// <summary>Check if map toggle was pressed.</summary>
        public bool GetMapPressed()
        {
            return isInputEnabled && Input.GetKeyDown(mapKey);
        }
        
        /// <summary>Check if escape/cancel was pressed.</summary>
        public bool GetEscapePressed()
        {
            return isInputEnabled && Input.GetKeyDown(escapeKey);
        }
        
        #endregion

        #region Chat Input
        
        /// <summary>Check if chat was activated.</summary>
        public bool GetChatPressed()
        {
            return isInputEnabled && Input.GetKeyDown(chatKey);
        }
        
        #endregion

        #region Helper Methods
        
        /// <summary>Check if mouse is over a UI element.</summary>
        public bool IsPointerOverUI()
        {
            return EventSystem.current != null && 
                   EventSystem.current.IsPointerOverGameObject();
        }
        
        /// <summary>Update UI focus state based on active UI elements.</summary>
        private void UpdateUIFocusState()
        {
            // Check if any input field is focused
            if (EventSystem.current != null)
            {
                GameObject selected = EventSystem.current.currentSelectedGameObject;
                if (selected != null)
                {
                    UnityEngine.UI.InputField inputField = selected.GetComponent<UnityEngine.UI.InputField>();
                    TMPro.TMP_InputField tmpInputField = selected.GetComponent<TMPro.TMP_InputField>();
                    
                    isUIFocused = inputField != null || tmpInputField != null;
                }
                else
                {
                    isUIFocused = false;
                }
            }
        }
        
        /// <summary>
        /// Set custom keybinding (for future remapping system).
        /// FUTURE: Save to PlayerPrefs or config file.
        /// </summary>
        public void SetKeybinding(string action, KeyCode key)
        {
            switch (action.ToLower())
            {
                case "forward": forwardKey = key; break;
                case "backward": backwardKey = key; break;
                case "left": leftKey = key; break;
                case "right": rightKey = key; break;
                case "jump": jumpKey = key; break;
                case "sprint": sprintKey = key; break;
                case "inventory": inventoryKey = key; break;
                case "character": characterKey = key; break;
                case "questlog": questLogKey = key; break;
                case "map": mapKey = key; break;
                default:
                    Debug.LogWarning($"InputManager: Unknown action '{action}'");
                    break;
            }
        }
        
        #endregion

        #region Debug
        
        private void OnGUI()
        {
            if (Debug.isDebugBuild && Input.GetKey(KeyCode.F3))
            {
                GUILayout.BeginArea(new Rect(10, 310, 250, 150));
                GUILayout.BeginVertical("box");
                GUILayout.Label("Input Manager");
                GUILayout.Label($"Enabled: {isInputEnabled}");
                GUILayout.Label($"Chat Focused: {isChatFocused}");
                GUILayout.Label($"UI Focused: {isUIFocused}");
                GUILayout.Label($"Over UI: {IsPointerOverUI()}");
                Vector2 move = GetMovementInput();
                GUILayout.Label($"Movement: ({move.x:F2}, {move.y:F2})");
                GUILayout.EndVertical();
                GUILayout.EndArea();
            }
        }
        
        #endregion
    }
}
