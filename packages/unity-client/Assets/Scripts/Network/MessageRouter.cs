using System;
using System.Collections.Generic;
using UnityEngine;

namespace MMORPG.Network
{
    /// <summary>
    /// MessageRouter routes incoming server messages to appropriate handlers.
    /// Supports registration of handlers by message type.
    /// </summary>
    public class MessageRouter : MonoBehaviour
    {
        #region Types
        
        /// <summary>
        /// Base class for all game messages.
        /// </summary>
        [Serializable]
        public class GameMessage
        {
            public string type;
            public object payload;
        }
        
        /// <summary>
        /// Delegate for message handlers.
        /// </summary>
        public delegate void MessageHandler(string jsonPayload);
        
        #endregion

        #region State
        
        private Dictionary<string, List<MessageHandler>> handlers = new Dictionary<string, List<MessageHandler>>();
        private WebSocketClient webSocket;
        
        #endregion

        #region Unity Lifecycle
        
        private void Awake()
        {
            webSocket = GetComponent<WebSocketClient>() ?? FindObjectOfType<WebSocketClient>();
            
            if (webSocket != null)
            {
                webSocket.OnMessageReceived += OnMessageReceived;
            }
            else
            {
                Debug.LogError("MessageRouter: WebSocketClient not found");
            }
        }
        
        private void OnDestroy()
        {
            if (webSocket != null)
            {
                webSocket.OnMessageReceived -= OnMessageReceived;
            }
        }
        
        #endregion

        #region Public Methods
        
        /// <summary>
        /// Register a handler for a message type.
        /// </summary>
        public void RegisterHandler(string messageType, MessageHandler handler)
        {
            if (!handlers.ContainsKey(messageType))
            {
                handlers[messageType] = new List<MessageHandler>();
            }
            
            handlers[messageType].Add(handler);
            Debug.Log($"MessageRouter: Registered handler for {messageType}");
        }
        
        /// <summary>
        /// Unregister a handler for a message type.
        /// </summary>
        public void UnregisterHandler(string messageType, MessageHandler handler)
        {
            if (handlers.ContainsKey(messageType))
            {
                handlers[messageType].Remove(handler);
            }
        }
        
        /// <summary>
        /// Unregister all handlers for a message type.
        /// </summary>
        public void UnregisterAllHandlers(string messageType)
        {
            if (handlers.ContainsKey(messageType))
            {
                handlers[messageType].Clear();
            }
        }
        
        #endregion

        #region Private Methods
        
        /// <summary>
        /// Handle incoming message from WebSocket.
        /// </summary>
        private void OnMessageReceived(string json)
        {
            try
            {
                // Parse the message type
                GameMessage message = JsonUtility.FromJson<GameMessage>(json);
                
                if (string.IsNullOrEmpty(message.type))
                {
                    Debug.LogWarning("MessageRouter: Received message with no type");
                    return;
                }
                
                // Route to handlers
                if (handlers.ContainsKey(message.type))
                {
                    foreach (var handler in handlers[message.type])
                    {
                        try
                        {
                            handler.Invoke(json);
                        }
                        catch (Exception ex)
                        {
                            Debug.LogError($"MessageRouter: Handler error for {message.type} - {ex.Message}");
                        }
                    }
                }
                else
                {
                    Debug.Log($"MessageRouter: No handler for message type {message.type}");
                }
            }
            catch (Exception ex)
            {
                Debug.LogError($"MessageRouter: Failed to parse message - {ex.Message}");
            }
        }
        
        #endregion
    }
    
    #region Message Types
    
    /// <summary>
    /// Message types matching the server protocol.
    /// </summary>
    public static class MessageType
    {
        // Client -> Server
        public const string CONNECT = "CONNECT";
        public const string PLAYER_MOVE = "PLAYER_MOVE";
        public const string ATTACK_REQUEST = "ATTACK_REQUEST";
        public const string CHAT = "CHAT";
        public const string INTERACT = "INTERACT";
        
        // Server -> Client
        public const string WELCOME = "WELCOME";
        public const string ENTITY_UPDATE = "ENTITY_UPDATE";
        public const string COMBAT_EVENT = "COMBAT_EVENT";
        public const string ENTITY_SPAWN = "ENTITY_SPAWN";
        public const string ENTITY_DESPAWN = "ENTITY_DESPAWN";
        public const string CHAT_MESSAGE = "CHAT_MESSAGE";
        public const string ERROR = "ERROR";
    }
    
    #endregion
    
    #region Message Payloads
    
    /// <summary>
    /// Connect message payload.
    /// </summary>
    [Serializable]
    public class ConnectPayload
    {
        public string token;
        public string characterId;
    }
    
    /// <summary>
    /// Player move message payload.
    /// </summary>
    [Serializable]
    public class PlayerMovePayload
    {
        public float x;
        public float y;
        public float z;
        public string moveType;
        public long timestamp;
    }
    
    /// <summary>
    /// Attack request message payload.
    /// </summary>
    [Serializable]
    public class AttackRequestPayload
    {
        public string abilityId;
        public string targetEntityId;
        public float x;
        public float y;
        public float z;
        public long timestamp;
    }
    
    /// <summary>
    /// Chat message payload.
    /// </summary>
    [Serializable]
    public class ChatPayload
    {
        public string channel;
        public string message;
        public string targetPlayerId;
    }
    
    /// <summary>
    /// Welcome message payload (server response).
    /// </summary>
    [Serializable]
    public class WelcomePayload
    {
        public string playerId;
        public CharacterData character;
        public long serverTime;
    }
    
    /// <summary>
    /// Character data in welcome message.
    /// </summary>
    [Serializable]
    public class CharacterData
    {
        public string id;
        public string name;
        public int level;
        public string @class;
    }
    
    /// <summary>
    /// Entity update payload.
    /// </summary>
    [Serializable]
    public class EntityUpdatePayload
    {
        public string entityId;
        public string type;
        public float x;
        public float y;
        public float z;
        public float rotation;
        public string name;
        public int level;
        public int health;
        public int maxHealth;
        public bool isMoving;
        public bool isCasting;
        public bool isInCombat;
        public long timestamp;
    }
    
    /// <summary>
    /// Combat event payload.
    /// </summary>
    [Serializable]
    public class CombatEventPayload
    {
        public string type;
        public string sourceEntityId;
        public string targetEntityId;
        public string abilityId;
        public string abilityName;
        public int value;
        public bool isCritical;
        public int targetHealth;
        public int targetMaxHealth;
        public long timestamp;
    }
    
    /// <summary>
    /// Entity spawn payload.
    /// </summary>
    [Serializable]
    public class EntitySpawnPayload
    {
        public EntityUpdatePayload entity;
    }
    
    /// <summary>
    /// Entity despawn payload.
    /// </summary>
    [Serializable]
    public class EntityDespawnPayload
    {
        public string entityId;
    }
    
    /// <summary>
    /// Error message payload.
    /// </summary>
    [Serializable]
    public class ErrorPayload
    {
        public string code;
        public string message;
        public long timestamp;
    }
    
    #endregion
}
