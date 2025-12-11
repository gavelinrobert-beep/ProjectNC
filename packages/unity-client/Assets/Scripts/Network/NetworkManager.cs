using System;
using System.Collections.Generic;
using UnityEngine;

namespace MMORPG.Network
{
    /// <summary>
    /// NetworkManager provides high-level networking API for the game.
    /// Wraps WebSocketClient and MessageRouter with game-specific functionality.
    /// </summary>
    public class NetworkManager : MonoBehaviour
    {
        #region Singleton
        
        public static NetworkManager Instance { get; private set; }
        
        #endregion

        #region Events
        
        public event Action OnConnectionEstablished;
        public event Action<string> OnConnectionLost;
        public event Action<WelcomePayload> OnWelcomeReceived;
        public event Action<EntityUpdatePayload> OnEntityUpdated;
        public event Action<CombatEventPayload> OnCombatEvent;
        public event Action<EntitySpawnPayload> OnEntitySpawned;
        public event Action<EntityDespawnPayload> OnEntityDespawned;
        public event Action<ChatPayload> OnChatReceived;
        public event Action<ErrorPayload> OnServerError;
        
        #endregion

        #region Configuration
        
        [Header("Server Configuration")]
        [SerializeField] private string gameServerUrl = "ws://localhost:8080/ws";
        [SerializeField] private string apiServerUrl = "http://localhost:4000";
        
        #endregion

        #region Components
        
        private WebSocketClient webSocket;
        private MessageRouter messageRouter;
        
        #endregion

        #region State
        
        public bool IsConnected => webSocket != null && webSocket.IsConnected;
        public string PlayerId { get; private set; }
        public CharacterData CurrentCharacter { get; private set; }
        
        private string authToken;
        private string selectedCharacterId;
        
        #endregion

        #region Unity Lifecycle
        
        private void Awake()
        {
            // Singleton pattern
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            
            Instance = this;
            DontDestroyOnLoad(gameObject);
            
            // Setup components
            SetupNetworkComponents();
        }
        
        private void OnDestroy()
        {
            if (Instance == this)
            {
                UnregisterMessageHandlers();
                Instance = null;
            }
        }
        
        #endregion

        #region Setup
        
        private void SetupNetworkComponents()
        {
            // Get or create WebSocketClient
            webSocket = GetComponent<WebSocketClient>();
            if (webSocket == null)
            {
                webSocket = gameObject.AddComponent<WebSocketClient>();
            }
            
            // Get or create MessageRouter
            messageRouter = GetComponent<MessageRouter>();
            if (messageRouter == null)
            {
                messageRouter = gameObject.AddComponent<MessageRouter>();
            }
            
            // Register WebSocket events
            webSocket.OnConnected += HandleConnected;
            webSocket.OnDisconnected += HandleDisconnected;
            webSocket.OnError += HandleError;
            
            // Register message handlers
            RegisterMessageHandlers();
        }
        
        private void RegisterMessageHandlers()
        {
            messageRouter.RegisterHandler(MessageType.WELCOME, HandleWelcome);
            messageRouter.RegisterHandler(MessageType.ENTITY_UPDATE, HandleEntityUpdate);
            messageRouter.RegisterHandler(MessageType.COMBAT_EVENT, HandleCombatEvent);
            messageRouter.RegisterHandler(MessageType.ENTITY_SPAWN, HandleEntitySpawn);
            messageRouter.RegisterHandler(MessageType.ENTITY_DESPAWN, HandleEntityDespawn);
            messageRouter.RegisterHandler(MessageType.CHAT_MESSAGE, HandleChatMessage);
            messageRouter.RegisterHandler(MessageType.ERROR, HandleServerError);
        }
        
        private void UnregisterMessageHandlers()
        {
            if (webSocket != null)
            {
                webSocket.OnConnected -= HandleConnected;
                webSocket.OnDisconnected -= HandleDisconnected;
                webSocket.OnError -= HandleError;
            }
        }
        
        #endregion

        #region Public API
        
        /// <summary>
        /// Connect to the game server with authentication.
        /// </summary>
        public async void ConnectToGameServer(string token, string characterId)
        {
            authToken = token;
            selectedCharacterId = characterId;
            
            Debug.Log($"NetworkManager: Connecting to {gameServerUrl}...");
            
            bool connected = await webSocket.Connect(gameServerUrl);
            
            if (connected)
            {
                // Send connect message with authentication
                SendConnect(token, characterId);
            }
        }
        
        /// <summary>
        /// Disconnect from the game server.
        /// </summary>
        public void Disconnect()
        {
            webSocket.Disconnect();
            PlayerId = null;
            CurrentCharacter = null;
        }
        
        /// <summary>
        /// Send movement input to server.
        /// </summary>
        public void SendMove(Vector3 targetPosition, string moveType = "RUN")
        {
            var payload = new PlayerMovePayload
            {
                x = targetPosition.x,
                y = targetPosition.y,
                z = targetPosition.z,
                moveType = moveType,
                timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
            };
            
            SendMessage(MessageType.PLAYER_MOVE, payload);
        }
        
        /// <summary>
        /// Send attack/ability request to server.
        /// </summary>
        public void SendAttack(string abilityId, string targetEntityId, Vector3 position)
        {
            var payload = new AttackRequestPayload
            {
                abilityId = abilityId,
                targetEntityId = targetEntityId,
                x = position.x,
                y = position.y,
                z = position.z,
                timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
            };
            
            SendMessage(MessageType.ATTACK_REQUEST, payload);
        }
        
        /// <summary>
        /// Send chat message to server.
        /// </summary>
        public void SendChat(string channel, string message, string targetPlayerId = null)
        {
            var payload = new ChatPayload
            {
                channel = channel,
                message = message,
                targetPlayerId = targetPlayerId
            };
            
            SendMessage(MessageType.CHAT, payload);
        }
        
        #endregion

        #region Private Methods
        
        private void SendConnect(string token, string characterId)
        {
            var payload = new ConnectPayload
            {
                token = token,
                characterId = characterId
            };
            
            SendMessage(MessageType.CONNECT, payload);
        }
        
        private void SendMessage<T>(string type, T payload)
        {
            var message = new
            {
                type = type,
                payload = payload
            };
            
            string json = JsonUtility.ToJson(message);
            webSocket.Send(json);
        }
        
        #endregion

        #region WebSocket Event Handlers
        
        private void HandleConnected()
        {
            Debug.Log("NetworkManager: Connected to server");
        }
        
        private void HandleDisconnected(string reason)
        {
            Debug.Log($"NetworkManager: Disconnected - {reason}");
            OnConnectionLost?.Invoke(reason);
        }
        
        private void HandleError(string error)
        {
            Debug.LogError($"NetworkManager: Error - {error}");
        }
        
        #endregion

        #region Message Handlers
        
        private void HandleWelcome(string json)
        {
            try
            {
                // Parse the full message to get payload
                var wrapper = JsonUtility.FromJson<MessageWrapper<WelcomePayload>>(json);
                var payload = wrapper.payload;
                
                PlayerId = payload.playerId;
                CurrentCharacter = payload.character;
                
                Debug.Log($"NetworkManager: Welcome received - Player {PlayerId}, Character {CurrentCharacter.name}");
                
                OnConnectionEstablished?.Invoke();
                OnWelcomeReceived?.Invoke(payload);
            }
            catch (Exception ex)
            {
                Debug.LogError($"NetworkManager: Failed to parse Welcome - {ex.Message}");
            }
        }
        
        private void HandleEntityUpdate(string json)
        {
            try
            {
                var wrapper = JsonUtility.FromJson<MessageWrapper<EntityUpdatePayload>>(json);
                OnEntityUpdated?.Invoke(wrapper.payload);
            }
            catch (Exception ex)
            {
                Debug.LogError($"NetworkManager: Failed to parse EntityUpdate - {ex.Message}");
            }
        }
        
        private void HandleCombatEvent(string json)
        {
            try
            {
                var wrapper = JsonUtility.FromJson<MessageWrapper<CombatEventPayload>>(json);
                OnCombatEvent?.Invoke(wrapper.payload);
            }
            catch (Exception ex)
            {
                Debug.LogError($"NetworkManager: Failed to parse CombatEvent - {ex.Message}");
            }
        }
        
        private void HandleEntitySpawn(string json)
        {
            try
            {
                var wrapper = JsonUtility.FromJson<MessageWrapper<EntitySpawnPayload>>(json);
                OnEntitySpawned?.Invoke(wrapper.payload);
            }
            catch (Exception ex)
            {
                Debug.LogError($"NetworkManager: Failed to parse EntitySpawn - {ex.Message}");
            }
        }
        
        private void HandleEntityDespawn(string json)
        {
            try
            {
                var wrapper = JsonUtility.FromJson<MessageWrapper<EntityDespawnPayload>>(json);
                OnEntityDespawned?.Invoke(wrapper.payload);
            }
            catch (Exception ex)
            {
                Debug.LogError($"NetworkManager: Failed to parse EntityDespawn - {ex.Message}");
            }
        }
        
        private void HandleChatMessage(string json)
        {
            try
            {
                var wrapper = JsonUtility.FromJson<MessageWrapper<ChatPayload>>(json);
                OnChatReceived?.Invoke(wrapper.payload);
            }
            catch (Exception ex)
            {
                Debug.LogError($"NetworkManager: Failed to parse ChatMessage - {ex.Message}");
            }
        }
        
        private void HandleServerError(string json)
        {
            try
            {
                var wrapper = JsonUtility.FromJson<MessageWrapper<ErrorPayload>>(json);
                Debug.LogError($"NetworkManager: Server error - {wrapper.payload.code}: {wrapper.payload.message}");
                OnServerError?.Invoke(wrapper.payload);
            }
            catch (Exception ex)
            {
                Debug.LogError($"NetworkManager: Failed to parse Error - {ex.Message}");
            }
        }
        
        #endregion
    }
    
    /// <summary>
    /// Helper class for parsing messages with typed payloads.
    /// </summary>
    [Serializable]
    public class MessageWrapper<T>
    {
        public string type;
        public T payload;
    }
}
