using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using UnityEngine;

// Note: This uses NativeWebSocket package
// Install via Package Manager: https://github.com/endel/NativeWebSocket.git
// using NativeWebSocket;

namespace MMORPG.Network
{
    /// <summary>
    /// WebSocketClient manages the WebSocket connection to the game server.
    /// Handles connection, disconnection, reconnection, and message passing.
    /// </summary>
    public class WebSocketClient : MonoBehaviour
    {
        #region Events
        
        /// <summary>Fired when connection is established.</summary>
        public event Action OnConnected;
        
        /// <summary>Fired when connection is closed.</summary>
        public event Action<string> OnDisconnected;
        
        /// <summary>Fired when a message is received.</summary>
        public event Action<string> OnMessageReceived;
        
        /// <summary>Fired when an error occurs.</summary>
        public event Action<string> OnError;
        
        #endregion

        #region Configuration
        
        [Header("Connection Settings")]
        [SerializeField] private string serverUrl = "ws://localhost:8080/ws";
        [SerializeField] private float reconnectDelay = 3f;
        [SerializeField] private int maxReconnectAttempts = 5;
        [SerializeField] private float heartbeatInterval = 30f;
        
        #endregion

        #region State
        
        private bool isConnected = false;
        private bool isConnecting = false;
        private int reconnectAttempts = 0;
        private float lastHeartbeat = 0f;
        private Queue<string> messageQueue = new Queue<string>();
        private object queueLock = new object();
        
        // Placeholder for actual WebSocket - replace with NativeWebSocket in production
        // private WebSocket webSocket;
        
        #endregion

        #region Properties
        
        public bool IsConnected => isConnected;
        public string ServerUrl => serverUrl;
        
        #endregion

        #region Unity Lifecycle
        
        private void Awake()
        {
            DontDestroyOnLoad(gameObject);
        }
        
        private void Update()
        {
            // Process incoming messages on main thread
            ProcessMessageQueue();
            
            // Heartbeat
            if (isConnected && Time.time - lastHeartbeat > heartbeatInterval)
            {
                SendHeartbeat();
                lastHeartbeat = Time.time;
            }
            
            // In production, dispatch WebSocket events
            // webSocket?.DispatchMessageQueue();
        }
        
        private void OnDestroy()
        {
            Disconnect();
        }
        
        private void OnApplicationQuit()
        {
            Disconnect();
        }
        
        #endregion

        #region Public Methods
        
        /// <summary>
        /// Connect to the game server.
        /// </summary>
        public async Task<bool> Connect()
        {
            if (isConnected || isConnecting)
            {
                Debug.LogWarning("WebSocket: Already connected or connecting");
                return isConnected;
            }
            
            isConnecting = true;
            Debug.Log($"WebSocket: Connecting to {serverUrl}...");
            
            try
            {
                // Production code using NativeWebSocket:
                // webSocket = new WebSocket(serverUrl);
                // webSocket.OnOpen += HandleOpen;
                // webSocket.OnMessage += HandleMessage;
                // webSocket.OnError += HandleError;
                // webSocket.OnClose += HandleClose;
                // await webSocket.Connect();
                
                // Placeholder for demonstration
                await Task.Delay(100);
                
                isConnected = true;
                isConnecting = false;
                reconnectAttempts = 0;
                lastHeartbeat = Time.time;
                
                Debug.Log("WebSocket: Connected successfully");
                OnConnected?.Invoke();
                
                return true;
            }
            catch (Exception ex)
            {
                Debug.LogError($"WebSocket: Connection failed - {ex.Message}");
                isConnecting = false;
                OnError?.Invoke(ex.Message);
                
                // Attempt reconnection
                AttemptReconnect();
                return false;
            }
        }
        
        /// <summary>
        /// Connect to a specific server URL.
        /// </summary>
        public async Task<bool> Connect(string url)
        {
            serverUrl = url;
            return await Connect();
        }
        
        /// <summary>
        /// Disconnect from the server.
        /// </summary>
        public void Disconnect()
        {
            if (!isConnected && !isConnecting)
            {
                return;
            }
            
            Debug.Log("WebSocket: Disconnecting...");
            
            try
            {
                // Production code:
                // webSocket?.Close();
                // webSocket = null;
            }
            catch (Exception ex)
            {
                Debug.LogError($"WebSocket: Disconnect error - {ex.Message}");
            }
            
            isConnected = false;
            isConnecting = false;
            OnDisconnected?.Invoke("Client disconnected");
        }
        
        /// <summary>
        /// Send a message to the server.
        /// </summary>
        public void Send(string message)
        {
            if (!isConnected)
            {
                Debug.LogWarning("WebSocket: Cannot send - not connected");
                return;
            }
            
            try
            {
                // Production code:
                // webSocket?.SendText(message);
                
                Debug.Log($"WebSocket: Sent message - {message.Substring(0, Math.Min(100, message.Length))}...");
            }
            catch (Exception ex)
            {
                Debug.LogError($"WebSocket: Send error - {ex.Message}");
                OnError?.Invoke(ex.Message);
            }
        }
        
        /// <summary>
        /// Send a message as byte array.
        /// </summary>
        public void SendBytes(byte[] data)
        {
            if (!isConnected)
            {
                Debug.LogWarning("WebSocket: Cannot send - not connected");
                return;
            }
            
            try
            {
                // Production code:
                // webSocket?.Send(data);
                
                Debug.Log($"WebSocket: Sent {data.Length} bytes");
            }
            catch (Exception ex)
            {
                Debug.LogError($"WebSocket: Send error - {ex.Message}");
                OnError?.Invoke(ex.Message);
            }
        }
        
        #endregion

        #region Private Methods
        
        /// <summary>
        /// Process queued messages on the main thread.
        /// </summary>
        private void ProcessMessageQueue()
        {
            lock (queueLock)
            {
                while (messageQueue.Count > 0)
                {
                    string message = messageQueue.Dequeue();
                    OnMessageReceived?.Invoke(message);
                }
            }
        }
        
        /// <summary>
        /// Handle WebSocket open event.
        /// </summary>
        private void HandleOpen()
        {
            Debug.Log("WebSocket: Connection opened");
            isConnected = true;
            isConnecting = false;
            reconnectAttempts = 0;
            OnConnected?.Invoke();
        }
        
        /// <summary>
        /// Handle WebSocket message event.
        /// </summary>
        private void HandleMessage(byte[] bytes)
        {
            string message = Encoding.UTF8.GetString(bytes);
            
            // Queue message for main thread processing
            lock (queueLock)
            {
                messageQueue.Enqueue(message);
            }
        }
        
        /// <summary>
        /// Handle WebSocket error event.
        /// </summary>
        private void HandleError(string error)
        {
            Debug.LogError($"WebSocket: Error - {error}");
            OnError?.Invoke(error);
        }
        
        /// <summary>
        /// Handle WebSocket close event.
        /// </summary>
        private void HandleClose(int code)
        {
            Debug.Log($"WebSocket: Connection closed with code {code}");
            isConnected = false;
            OnDisconnected?.Invoke($"Connection closed: {code}");
            
            // Attempt reconnection if not intentional
            if (code != 1000) // 1000 = normal closure
            {
                AttemptReconnect();
            }
        }
        
        /// <summary>
        /// Attempt to reconnect to the server.
        /// </summary>
        private async void AttemptReconnect()
        {
            if (reconnectAttempts >= maxReconnectAttempts)
            {
                Debug.LogError("WebSocket: Max reconnection attempts reached");
                return;
            }
            
            reconnectAttempts++;
            Debug.Log($"WebSocket: Reconnection attempt {reconnectAttempts}/{maxReconnectAttempts} in {reconnectDelay}s...");
            
            await Task.Delay((int)(reconnectDelay * 1000));
            
            if (!isConnected && !isConnecting)
            {
                await Connect();
            }
        }
        
        /// <summary>
        /// Send heartbeat to keep connection alive.
        /// </summary>
        private void SendHeartbeat()
        {
            Send("{\"type\":\"HEARTBEAT\",\"payload\":{}}");
        }
        
        #endregion
    }
}
