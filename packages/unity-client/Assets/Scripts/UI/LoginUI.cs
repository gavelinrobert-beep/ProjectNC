using UnityEngine;
using UnityEngine.UI;
using UnityEngine.SceneManagement;
using TMPro;

namespace MMORPG.UI
{
    /// <summary>
    /// LoginUI handles the login screen interface.
    /// Manages authentication flow and transitions to character select.
    /// </summary>
    public class LoginUI : MonoBehaviour
    {
        #region Configuration
        
        [Header("UI References")]
        [SerializeField] private TMP_InputField usernameInput;
        [SerializeField] private TMP_InputField passwordInput;
        [SerializeField] private Button loginButton;
        [SerializeField] private Button registerButton;
        [SerializeField] private TMP_Text errorText;
        [SerializeField] private TMP_Text versionText;
        [SerializeField] private Toggle rememberMeToggle;
        [SerializeField] private GameObject loadingOverlay;
        
        [Header("Settings")]
        [SerializeField] private string apiUrl = "http://localhost:4000";
        [SerializeField] private string characterSelectScene = "CharacterSelectScene";
        
        #endregion

        #region State
        
        private bool isLoggingIn = false;
        
        #endregion

        #region Unity Lifecycle
        
        private void Start()
        {
            SetupUI();
            LoadSavedCredentials();
            HideError();
            SetLoading(false);
        }
        
        private void Update()
        {
            // Submit on Enter
            if (Input.GetKeyDown(KeyCode.Return) || Input.GetKeyDown(KeyCode.KeypadEnter))
            {
                if (!isLoggingIn)
                {
                    OnLoginClicked();
                }
            }
        }
        
        #endregion

        #region Setup
        
        private void SetupUI()
        {
            // Setup button listeners
            if (loginButton != null)
            {
                loginButton.onClick.AddListener(OnLoginClicked);
            }
            
            if (registerButton != null)
            {
                registerButton.onClick.AddListener(OnRegisterClicked);
            }
            
            // Set version text
            if (versionText != null)
            {
                versionText.text = $"Version {Application.version}";
            }
            
            // Focus username field
            if (usernameInput != null)
            {
                usernameInput.Select();
            }
        }
        
        private void LoadSavedCredentials()
        {
            // Load remembered username
            string savedUsername = PlayerPrefs.GetString("saved_username", "");
            
            if (!string.IsNullOrEmpty(savedUsername) && usernameInput != null)
            {
                usernameInput.text = savedUsername;
                
                if (rememberMeToggle != null)
                {
                    rememberMeToggle.isOn = true;
                }
                
                // Focus password field instead
                if (passwordInput != null)
                {
                    passwordInput.Select();
                }
            }
        }
        
        #endregion

        #region Button Handlers
        
        private async void OnLoginClicked()
        {
            if (isLoggingIn)
            {
                return;
            }
            
            // Validate input
            string username = usernameInput?.text?.Trim() ?? "";
            string password = passwordInput?.text ?? "";
            
            if (string.IsNullOrEmpty(username))
            {
                ShowError("Please enter a username");
                return;
            }
            
            if (string.IsNullOrEmpty(password))
            {
                ShowError("Please enter a password");
                return;
            }
            
            // Start login
            isLoggingIn = true;
            SetLoading(true);
            HideError();
            
            try
            {
                // Attempt login
                bool success = await AttemptLogin(username, password);
                
                if (success)
                {
                    // Save credentials if remember me is checked
                    if (rememberMeToggle != null && rememberMeToggle.isOn)
                    {
                        PlayerPrefs.SetString("saved_username", username);
                        PlayerPrefs.Save();
                    }
                    else
                    {
                        PlayerPrefs.DeleteKey("saved_username");
                    }
                    
                    // Transition to character select
                    TransitionToCharacterSelect();
                }
                else
                {
                    ShowError("Invalid username or password");
                }
            }
            catch (System.Exception ex)
            {
                ShowError($"Connection error: {ex.Message}");
                Debug.LogError($"Login error: {ex}");
            }
            finally
            {
                isLoggingIn = false;
                SetLoading(false);
            }
        }
        
        private void OnRegisterClicked()
        {
            // Open registration page or show registration panel
            Debug.Log("Register clicked");
            
            // Could open a web page:
            // Application.OpenURL(apiUrl + "/register");
            
            // Or show a registration panel
            ShowError("Registration: Please visit our website to create an account");
        }
        
        #endregion

        #region Authentication
        
        private async System.Threading.Tasks.Task<bool> AttemptLogin(string username, string password)
        {
            Debug.Log($"Attempting login for user: {username}");
            
            // Simulate network delay for demonstration
            await System.Threading.Tasks.Task.Delay(1000);
            
            // In production, this would make an HTTP request to the API server:
            // var loginRequest = new { email = username, password = password };
            // var response = await httpClient.PostAsync(apiUrl + "/auth/login", ...);
            // var result = JsonUtility.FromJson<LoginResponse>(response.Body);
            // PlayerPrefs.SetString("auth_token", result.token);
            
            // For demonstration, accept any non-empty credentials
            if (!string.IsNullOrEmpty(username) && !string.IsNullOrEmpty(password))
            {
                // Store mock token
                PlayerPrefs.SetString("auth_token", "mock_jwt_token_" + System.Guid.NewGuid().ToString());
                return true;
            }
            
            return false;
        }
        
        #endregion

        #region UI Helpers
        
        private void ShowError(string message)
        {
            if (errorText != null)
            {
                errorText.text = message;
                errorText.gameObject.SetActive(true);
            }
            
            Debug.LogWarning($"Login error: {message}");
        }
        
        private void HideError()
        {
            if (errorText != null)
            {
                errorText.gameObject.SetActive(false);
            }
        }
        
        private void SetLoading(bool loading)
        {
            if (loadingOverlay != null)
            {
                loadingOverlay.SetActive(loading);
            }
            
            if (loginButton != null)
            {
                loginButton.interactable = !loading;
            }
            
            if (registerButton != null)
            {
                registerButton.interactable = !loading;
            }
        }
        
        private void TransitionToCharacterSelect()
        {
            Debug.Log("Transitioning to character select...");
            
            if (!string.IsNullOrEmpty(characterSelectScene))
            {
                SceneManager.LoadScene(characterSelectScene);
            }
            else
            {
                Debug.LogWarning("Character select scene not configured");
            }
        }
        
        #endregion
    }
}
