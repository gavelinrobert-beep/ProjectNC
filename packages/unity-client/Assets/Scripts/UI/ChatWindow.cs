using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;

namespace MMORPG.UI
{
    /// <summary>
    /// ChatWindow handles chat message display and input.
    /// Supports multiple channels (Say, Yell, Party, Guild, Whisper).
    /// </summary>
    public class ChatWindow : MonoBehaviour
    {
        #region Singleton
        
        public static ChatWindow Instance { get; private set; }
        
        #endregion

        #region Types
        
        [System.Serializable]
        public class ChatChannel
        {
            public string name;
            public string prefix;
            public Color color;
            public bool enabled = true;
        }
        
        public class ChatMessage
        {
            public string channel;
            public string senderName;
            public string message;
            public float timestamp;
        }
        
        #endregion

        #region Configuration
        
        [Header("UI References")]
        [SerializeField] private ScrollRect scrollRect;
        [SerializeField] private TMP_Text chatContent;
        [SerializeField] private TMP_InputField inputField;
        [SerializeField] private TMP_Dropdown channelDropdown;
        [SerializeField] private Button sendButton;
        
        [Header("Settings")]
        [SerializeField] private int maxMessages = 100;
        [SerializeField] private bool autoScroll = true;
        [SerializeField] private bool showTimestamps = false;
        
        [Header("Channels")]
        [SerializeField] private List<ChatChannel> channels = new List<ChatChannel>
        {
            new ChatChannel { name = "SAY", prefix = "/s", color = new Color(1f, 1f, 1f) },
            new ChatChannel { name = "YELL", prefix = "/y", color = new Color(1f, 0.2f, 0.2f) },
            new ChatChannel { name = "PARTY", prefix = "/p", color = new Color(0.4f, 0.6f, 1f) },
            new ChatChannel { name = "GUILD", prefix = "/g", color = new Color(0.2f, 1f, 0.2f) },
            new ChatChannel { name = "WHISPER", prefix = "/w", color = new Color(1f, 0.6f, 1f) },
            new ChatChannel { name = "SYSTEM", prefix = "", color = new Color(1f, 1f, 0.4f) }
        };
        
        #endregion

        #region State
        
        private List<ChatMessage> messageHistory = new List<ChatMessage>();
        private string currentChannel = "SAY";
        private bool isInputActive = false;
        
        #endregion

        #region Properties
        
        public bool IsInputActive => isInputActive;
        
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
            SetupUI();
            
            // Subscribe to network chat events
            if (Network.NetworkManager.Instance != null)
            {
                Network.NetworkManager.Instance.OnChatReceived += HandleChatReceived;
            }
        }
        
        private void Update()
        {
            // Toggle chat input with Enter
            if (Input.GetKeyDown(KeyCode.Return) || Input.GetKeyDown(KeyCode.KeypadEnter))
            {
                if (isInputActive)
                {
                    SendMessage();
                }
                else
                {
                    ActivateInput();
                }
            }
            
            // Close chat with Escape
            if (Input.GetKeyDown(KeyCode.Escape) && isInputActive)
            {
                DeactivateInput();
            }
        }
        
        private void OnDestroy()
        {
            if (Instance == this)
            {
                Instance = null;
            }
            
            if (Network.NetworkManager.Instance != null)
            {
                Network.NetworkManager.Instance.OnChatReceived -= HandleChatReceived;
            }
        }
        
        #endregion

        #region Setup
        
        private void SetupUI()
        {
            // Setup send button
            if (sendButton != null)
            {
                sendButton.onClick.AddListener(SendMessage);
            }
            
            // Setup channel dropdown
            if (channelDropdown != null)
            {
                channelDropdown.ClearOptions();
                
                List<TMP_Dropdown.OptionData> options = new List<TMP_Dropdown.OptionData>();
                foreach (var channel in channels)
                {
                    if (channel.name != "SYSTEM") // Can't send to system channel
                    {
                        options.Add(new TMP_Dropdown.OptionData(channel.name));
                    }
                }
                
                channelDropdown.AddOptions(options);
                channelDropdown.onValueChanged.AddListener(OnChannelChanged);
            }
            
            // Setup input field
            if (inputField != null)
            {
                inputField.onEndEdit.AddListener(OnInputEndEdit);
                inputField.onSelect.AddListener(_ => isInputActive = true);
                inputField.onDeselect.AddListener(_ => isInputActive = false);
            }
            
            // Clear initial content
            if (chatContent != null)
            {
                chatContent.text = "";
            }
        }
        
        #endregion

        #region Public Methods
        
        /// <summary>
        /// Add a chat message to the window.
        /// </summary>
        public void AddMessage(string channel, string senderName, string message)
        {
            ChatMessage chatMessage = new ChatMessage
            {
                channel = channel,
                senderName = senderName,
                message = message,
                timestamp = Time.time
            };
            
            messageHistory.Add(chatMessage);
            
            // Trim old messages
            while (messageHistory.Count > maxMessages)
            {
                messageHistory.RemoveAt(0);
            }
            
            // Display message
            DisplayMessage(chatMessage);
        }
        
        /// <summary>
        /// Add a system message.
        /// </summary>
        public void AddSystemMessage(string message)
        {
            AddMessage("SYSTEM", "", message);
        }
        
        /// <summary>
        /// Clear all messages.
        /// </summary>
        public void ClearMessages()
        {
            messageHistory.Clear();
            
            if (chatContent != null)
            {
                chatContent.text = "";
            }
        }
        
        /// <summary>
        /// Set channel filter visibility.
        /// </summary>
        public void SetChannelEnabled(string channelName, bool enabled)
        {
            var channel = channels.Find(c => c.name == channelName);
            if (channel != null)
            {
                channel.enabled = enabled;
                RefreshDisplay();
            }
        }
        
        /// <summary>
        /// Activate the chat input.
        /// </summary>
        public void ActivateInput()
        {
            if (inputField != null)
            {
                inputField.ActivateInputField();
                isInputActive = true;
            }
        }
        
        /// <summary>
        /// Deactivate the chat input.
        /// </summary>
        public void DeactivateInput()
        {
            if (inputField != null)
            {
                inputField.DeactivateInputField();
                inputField.text = "";
                isInputActive = false;
            }
        }
        
        #endregion

        #region Private Methods
        
        private void DisplayMessage(ChatMessage chatMessage)
        {
            // Check if channel is enabled
            var channel = channels.Find(c => c.name == chatMessage.channel);
            if (channel == null || !channel.enabled)
            {
                return;
            }
            
            // Build message string
            string colorHex = ColorUtility.ToHtmlStringRGB(channel.color);
            string formattedMessage;
            
            if (string.IsNullOrEmpty(chatMessage.senderName))
            {
                // System message
                formattedMessage = $"<color=#{colorHex}>[{chatMessage.channel}] {chatMessage.message}</color>";
            }
            else if (chatMessage.channel == "WHISPER")
            {
                formattedMessage = $"<color=#{colorHex}>[{chatMessage.senderName}] whispers: {chatMessage.message}</color>";
            }
            else
            {
                formattedMessage = $"<color=#{colorHex}>[{chatMessage.channel}] {chatMessage.senderName}: {chatMessage.message}</color>";
            }
            
            if (showTimestamps)
            {
                string timestamp = System.DateTime.Now.ToString("HH:mm");
                formattedMessage = $"<color=#888888>[{timestamp}]</color> {formattedMessage}";
            }
            
            // Append to chat
            if (chatContent != null)
            {
                if (chatContent.text.Length > 0)
                {
                    chatContent.text += "\n";
                }
                chatContent.text += formattedMessage;
                
                // Auto scroll
                if (autoScroll && scrollRect != null)
                {
                    Canvas.ForceUpdateCanvases();
                    scrollRect.verticalNormalizedPosition = 0;
                }
            }
        }
        
        private void RefreshDisplay()
        {
            if (chatContent == null)
            {
                return;
            }
            
            chatContent.text = "";
            
            foreach (var message in messageHistory)
            {
                DisplayMessage(message);
            }
        }
        
        private void SendMessage()
        {
            if (inputField == null || string.IsNullOrEmpty(inputField.text.Trim()))
            {
                DeactivateInput();
                return;
            }
            
            string text = inputField.text.Trim();
            string targetChannel = currentChannel;
            string targetPlayer = null;
            
            // Check for channel prefix
            if (text.StartsWith("/"))
            {
                foreach (var channel in channels)
                {
                    if (!string.IsNullOrEmpty(channel.prefix) && text.ToLower().StartsWith(channel.prefix.ToLower()))
                    {
                        targetChannel = channel.name;
                        text = text.Substring(channel.prefix.Length).Trim();
                        
                        // For whisper, extract target name
                        if (channel.name == "WHISPER")
                        {
                            int spaceIndex = text.IndexOf(' ');
                            if (spaceIndex > 0)
                            {
                                targetPlayer = text.Substring(0, spaceIndex);
                                text = text.Substring(spaceIndex + 1).Trim();
                            }
                        }
                        break;
                    }
                }
            }
            
            // Send to server
            if (!string.IsNullOrEmpty(text))
            {
                if (Network.NetworkManager.Instance != null)
                {
                    Network.NetworkManager.Instance.SendChat(targetChannel, text, targetPlayer);
                }
                
                // Also display locally (server will echo back)
                // For now, show immediately
                string playerName = Network.NetworkManager.Instance?.CurrentCharacter?.name ?? "You";
                AddMessage(targetChannel, playerName, text);
            }
            
            // Clear and deactivate
            inputField.text = "";
            DeactivateInput();
        }
        
        private void OnChannelChanged(int index)
        {
            // SYSTEM channel is the last channel in the list and is receive-only,
            // so users cannot select it for sending messages. We exclude it by
            // checking index < channels.Count - 1.
            if (index >= 0 && index < channels.Count - 1)
            {
                currentChannel = channels[index].name;
            }
        }
        
        private void OnInputEndEdit(string text)
        {
            // Send on Enter, but not if Tab was used
            if (Input.GetKeyDown(KeyCode.Return) || Input.GetKeyDown(KeyCode.KeypadEnter))
            {
                SendMessage();
            }
        }
        
        private void HandleChatReceived(Network.ChatPayload chat)
        {
            // Received chat from server
            // Would need sender name from server
            AddMessage(chat.channel, "Player", chat.message);
        }
        
        #endregion
    }
}
