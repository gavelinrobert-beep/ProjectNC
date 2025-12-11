using UnityEngine;
using UnityEngine.SceneManagement;

namespace MMORPG.Core
{
    /// <summary>
    /// GameManager is the central controller for game state.
    /// Manages transitions between game states and coordinates systems.
    /// </summary>
    public class GameManager : MonoBehaviour
    {
        #region Singleton
        
        public static GameManager Instance { get; private set; }
        
        #endregion

        #region Types
        
        public enum GameState
        {
            None,
            Login,
            CharacterSelect,
            Loading,
            InGame,
            Paused
        }
        
        #endregion

        #region Events
        
        public event System.Action<GameState> OnGameStateChanged;
        
        #endregion

        #region Configuration
        
        [Header("Scene Names")]
        [SerializeField] private string loginSceneName = "LoginScene";
        [SerializeField] private string characterSelectSceneName = "CharacterSelectScene";
        [SerializeField] private string worldSceneName = "WorldScene";
        
        [Header("Settings")]
        [SerializeField] private bool showDebugInfo = true;
        [SerializeField] private float targetFrameRate = 60f;
        
        #endregion

        #region State
        
        private GameState currentState = GameState.None;
        
        #endregion

        #region Properties
        
        public GameState CurrentState => currentState;
        public bool IsInGame => currentState == GameState.InGame;
        public bool IsPaused => currentState == GameState.Paused;
        
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
            
            // Apply settings
            if (targetFrameRate > 0)
            {
                Application.targetFrameRate = (int)targetFrameRate;
            }
        }
        
        private void Start()
        {
            // Determine initial state based on current scene
            DetermineInitialState();
        }
        
        private void OnEnable()
        {
            SceneManager.sceneLoaded += OnSceneLoaded;
        }
        
        private void OnDisable()
        {
            SceneManager.sceneLoaded -= OnSceneLoaded;
        }
        
        private void Update()
        {
            HandleGlobalInput();
        }
        
        private void OnGUI()
        {
            if (showDebugInfo)
            {
                DrawDebugInfo();
            }
        }
        
        #endregion

        #region State Management
        
        private void DetermineInitialState()
        {
            string currentScene = SceneManager.GetActiveScene().name;
            
            if (currentScene == loginSceneName)
            {
                SetState(GameState.Login);
            }
            else if (currentScene == characterSelectSceneName)
            {
                SetState(GameState.CharacterSelect);
            }
            else if (currentScene == worldSceneName)
            {
                SetState(GameState.InGame);
            }
            else
            {
                SetState(GameState.Login);
            }
        }
        
        public void SetState(GameState newState)
        {
            if (currentState == newState)
            {
                return;
            }
            
            GameState previousState = currentState;
            currentState = newState;
            
            Debug.Log($"GameManager: State changed from {previousState} to {newState}");
            
            // Handle state-specific logic
            switch (newState)
            {
                case GameState.Login:
                    Time.timeScale = 1f;
                    Cursor.visible = true;
                    Cursor.lockState = CursorLockMode.None;
                    break;
                    
                case GameState.CharacterSelect:
                    Time.timeScale = 1f;
                    Cursor.visible = true;
                    Cursor.lockState = CursorLockMode.None;
                    break;
                    
                case GameState.Loading:
                    Time.timeScale = 0f;
                    Cursor.visible = true;
                    break;
                    
                case GameState.InGame:
                    Time.timeScale = 1f;
                    Cursor.visible = true;
                    Cursor.lockState = CursorLockMode.None;
                    break;
                    
                case GameState.Paused:
                    Time.timeScale = 0f;
                    Cursor.visible = true;
                    Cursor.lockState = CursorLockMode.None;
                    break;
            }
            
            OnGameStateChanged?.Invoke(newState);
        }
        
        #endregion

        #region Scene Management
        
        public void LoadLoginScene()
        {
            SetState(GameState.Loading);
            SceneManager.LoadScene(loginSceneName);
        }
        
        public void LoadCharacterSelectScene()
        {
            SetState(GameState.Loading);
            SceneManager.LoadScene(characterSelectSceneName);
        }
        
        public void LoadWorldScene()
        {
            SetState(GameState.Loading);
            SceneManager.LoadScene(worldSceneName);
        }
        
        private void OnSceneLoaded(Scene scene, LoadSceneMode mode)
        {
            Debug.Log($"GameManager: Scene loaded - {scene.name}");
            
            if (scene.name == loginSceneName)
            {
                SetState(GameState.Login);
            }
            else if (scene.name == characterSelectSceneName)
            {
                SetState(GameState.CharacterSelect);
            }
            else if (scene.name == worldSceneName)
            {
                SetState(GameState.InGame);
            }
        }
        
        #endregion

        #region Input
        
        private void HandleGlobalInput()
        {
            // Pause/Unpause with Escape
            if (Input.GetKeyDown(KeyCode.Escape))
            {
                if (currentState == GameState.InGame)
                {
                    // Would show pause menu
                    Debug.Log("Escape pressed - would show menu");
                }
                else if (currentState == GameState.Paused)
                {
                    SetState(GameState.InGame);
                }
            }
            
            // Toggle debug info with F3
            if (Input.GetKeyDown(KeyCode.F3))
            {
                showDebugInfo = !showDebugInfo;
            }
        }
        
        #endregion

        #region Debug
        
        private void DrawDebugInfo()
        {
            GUILayout.BeginArea(new Rect(10, 10, 300, 200));
            GUILayout.BeginVertical("box");
            
            GUILayout.Label($"State: {currentState}");
            GUILayout.Label($"FPS: {(1f / Time.unscaledDeltaTime):F1}");
            GUILayout.Label($"Scene: {SceneManager.GetActiveScene().name}");
            
            if (Network.NetworkManager.Instance != null)
            {
                GUILayout.Label($"Connected: {Network.NetworkManager.Instance.IsConnected}");
                GUILayout.Label($"Player: {Network.NetworkManager.Instance.CurrentCharacter?.name ?? "None"}");
            }
            
            GUILayout.EndVertical();
            GUILayout.EndArea();
        }
        
        #endregion

        #region Utility
        
        /// <summary>
        /// Quit the application.
        /// </summary>
        public void QuitGame()
        {
            Debug.Log("GameManager: Quitting game");
            
            // Disconnect from server
            if (Network.NetworkManager.Instance != null)
            {
                Network.NetworkManager.Instance.Disconnect();
            }
            
            #if UNITY_EDITOR
            UnityEditor.EditorApplication.isPlaying = false;
            #else
            Application.Quit();
            #endif
        }
        
        /// <summary>
        /// Logout and return to login screen.
        /// </summary>
        public void Logout()
        {
            Debug.Log("GameManager: Logging out");
            
            // Clear auth token
            PlayerPrefs.DeleteKey("auth_token");
            PlayerPrefs.DeleteKey("selected_character_id");
            
            // Disconnect
            if (Network.NetworkManager.Instance != null)
            {
                Network.NetworkManager.Instance.Disconnect();
            }
            
            // Load login scene
            LoadLoginScene();
        }
        
        #endregion
    }
}
