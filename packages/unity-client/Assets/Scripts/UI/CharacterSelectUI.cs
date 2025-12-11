using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using UnityEngine.SceneManagement;
using TMPro;

namespace MMORPG.UI
{
    /// <summary>
    /// CharacterSelectUI handles the character selection screen.
    /// Displays available characters and allows creation of new ones.
    /// </summary>
    public class CharacterSelectUI : MonoBehaviour
    {
        #region Types
        
        [System.Serializable]
        public class CharacterSlot
        {
            public Button button;
            public TMP_Text nameText;
            public TMP_Text levelText;
            public TMP_Text classText;
            public Image portrait;
            public GameObject emptySlotIndicator;
        }
        
        public class CharacterInfo
        {
            public string id;
            public string name;
            public int level;
            public string characterClass;
            public string race;
        }
        
        #endregion

        #region Configuration
        
        [Header("Character Slots")]
        [SerializeField] private List<CharacterSlot> characterSlots = new List<CharacterSlot>();
        [SerializeField] private int maxCharacters = 10;
        
        [Header("Selection")]
        [SerializeField] private GameObject selectedHighlight;
        [SerializeField] private TMP_Text selectedCharacterInfo;
        
        [Header("Buttons")]
        [SerializeField] private Button enterWorldButton;
        [SerializeField] private Button createCharacterButton;
        [SerializeField] private Button deleteCharacterButton;
        [SerializeField] private Button backButton;
        
        [Header("Panels")]
        [SerializeField] private GameObject characterListPanel;
        [SerializeField] private GameObject createCharacterPanel;
        [SerializeField] private GameObject loadingPanel;
        [SerializeField] private GameObject deleteConfirmPanel;
        
        [Header("Character Creation")]
        [SerializeField] private TMP_InputField characterNameInput;
        [SerializeField] private TMP_Dropdown classDropdown;
        [SerializeField] private TMP_Dropdown raceDropdown;
        [SerializeField] private Button confirmCreateButton;
        [SerializeField] private Button cancelCreateButton;
        [SerializeField] private TMP_Text createErrorText;
        
        [Header("Settings")]
        [SerializeField] private string gameWorldScene = "WorldScene";
        [SerializeField] private string loginScene = "LoginScene";
        
        #endregion

        #region State
        
        private List<CharacterInfo> characters = new List<CharacterInfo>();
        private int selectedIndex = -1;
        private bool isLoading = false;
        
        #endregion

        #region Unity Lifecycle
        
        private void Start()
        {
            SetupUI();
            LoadCharacters();
        }
        
        #endregion

        #region Setup
        
        private void SetupUI()
        {
            // Setup button listeners
            if (enterWorldButton != null)
            {
                enterWorldButton.onClick.AddListener(OnEnterWorldClicked);
            }
            
            if (createCharacterButton != null)
            {
                createCharacterButton.onClick.AddListener(OnCreateCharacterClicked);
            }
            
            if (deleteCharacterButton != null)
            {
                deleteCharacterButton.onClick.AddListener(OnDeleteCharacterClicked);
            }
            
            if (backButton != null)
            {
                backButton.onClick.AddListener(OnBackClicked);
            }
            
            if (confirmCreateButton != null)
            {
                confirmCreateButton.onClick.AddListener(OnConfirmCreateClicked);
            }
            
            if (cancelCreateButton != null)
            {
                cancelCreateButton.onClick.AddListener(OnCancelCreateClicked);
            }
            
            // Setup character slot clicks
            for (int i = 0; i < characterSlots.Count; i++)
            {
                int index = i; // Capture for lambda
                if (characterSlots[i].button != null)
                {
                    characterSlots[i].button.onClick.AddListener(() => OnCharacterSlotClicked(index));
                }
            }
            
            // Setup class and race dropdowns
            SetupDropdowns();
            
            // Initial state
            ShowPanel(characterListPanel);
            UpdateButtonStates();
        }
        
        private void SetupDropdowns()
        {
            // Setup class dropdown
            if (classDropdown != null)
            {
                classDropdown.ClearOptions();
                classDropdown.AddOptions(new List<string>
                {
                    "Warrior", "Mage", "Rogue", "Priest", "Hunter", "Paladin", "Warlock", "Druid"
                });
            }
            
            // Setup race dropdown
            if (raceDropdown != null)
            {
                raceDropdown.ClearOptions();
                raceDropdown.AddOptions(new List<string>
                {
                    "Human", "Elf", "Dwarf", "Orc", "Undead", "Tauren"
                });
            }
        }
        
        #endregion

        #region Character Loading
        
        private async void LoadCharacters()
        {
            SetLoading(true);
            
            try
            {
                // In production, fetch from API:
                // var response = await httpClient.GetAsync(apiUrl + "/characters");
                // characters = JsonUtility.FromJson<List<CharacterInfo>>(response.Body);
                
                // For demonstration, create mock characters
                await System.Threading.Tasks.Task.Delay(500);
                
                characters = new List<CharacterInfo>
                {
                    new CharacterInfo
                    {
                        id = "char1",
                        name = "Firemage",
                        level = 60,
                        characterClass = "Mage",
                        race = "Human"
                    },
                    new CharacterInfo
                    {
                        id = "char2",
                        name = "Shadowblade",
                        level = 45,
                        characterClass = "Rogue",
                        race = "Elf"
                    }
                };
                
                RefreshCharacterList();
            }
            catch (System.Exception ex)
            {
                Debug.LogError($"Failed to load characters: {ex}");
            }
            finally
            {
                SetLoading(false);
            }
        }
        
        private void RefreshCharacterList()
        {
            // Update each slot
            for (int i = 0; i < characterSlots.Count; i++)
            {
                CharacterSlot slot = characterSlots[i];
                
                if (i < characters.Count)
                {
                    // Show character
                    CharacterInfo character = characters[i];
                    
                    if (slot.nameText != null)
                    {
                        slot.nameText.text = character.name;
                        slot.nameText.gameObject.SetActive(true);
                    }
                    
                    if (slot.levelText != null)
                    {
                        slot.levelText.text = $"Level {character.level}";
                        slot.levelText.gameObject.SetActive(true);
                    }
                    
                    if (slot.classText != null)
                    {
                        slot.classText.text = $"{character.race} {character.characterClass}";
                        slot.classText.gameObject.SetActive(true);
                    }
                    
                    if (slot.emptySlotIndicator != null)
                    {
                        slot.emptySlotIndicator.SetActive(false);
                    }
                }
                else
                {
                    // Empty slot
                    if (slot.nameText != null) slot.nameText.gameObject.SetActive(false);
                    if (slot.levelText != null) slot.levelText.gameObject.SetActive(false);
                    if (slot.classText != null) slot.classText.gameObject.SetActive(false);
                    
                    if (slot.emptySlotIndicator != null)
                    {
                        slot.emptySlotIndicator.SetActive(true);
                    }
                }
            }
            
            // Auto-select first character if none selected
            if (selectedIndex < 0 && characters.Count > 0)
            {
                SelectCharacter(0);
            }
            
            UpdateButtonStates();
        }
        
        #endregion

        #region Selection
        
        private void SelectCharacter(int index)
        {
            if (index < 0 || index >= characters.Count)
            {
                selectedIndex = -1;
                
                if (selectedCharacterInfo != null)
                {
                    selectedCharacterInfo.text = "No character selected";
                }
                
                if (selectedHighlight != null)
                {
                    selectedHighlight.SetActive(false);
                }
                
                return;
            }
            
            selectedIndex = index;
            CharacterInfo character = characters[index];
            
            // Update info display
            if (selectedCharacterInfo != null)
            {
                selectedCharacterInfo.text = $"{character.name}\nLevel {character.level} {character.race} {character.characterClass}";
            }
            
            // Position highlight
            if (selectedHighlight != null && characterSlots[index].button != null)
            {
                selectedHighlight.SetActive(true);
                selectedHighlight.transform.position = characterSlots[index].button.transform.position;
            }
            
            UpdateButtonStates();
            
            Debug.Log($"Selected character: {character.name}");
        }
        
        private void UpdateButtonStates()
        {
            bool hasSelection = selectedIndex >= 0 && selectedIndex < characters.Count;
            bool canCreate = characters.Count < maxCharacters;
            
            if (enterWorldButton != null)
            {
                enterWorldButton.interactable = hasSelection && !isLoading;
            }
            
            if (deleteCharacterButton != null)
            {
                deleteCharacterButton.interactable = hasSelection && !isLoading;
            }
            
            if (createCharacterButton != null)
            {
                createCharacterButton.interactable = canCreate && !isLoading;
            }
        }
        
        #endregion

        #region Button Handlers
        
        private void OnCharacterSlotClicked(int index)
        {
            if (index < characters.Count)
            {
                SelectCharacter(index);
            }
            else
            {
                // Clicked empty slot - open create panel
                OnCreateCharacterClicked();
            }
        }
        
        private void OnEnterWorldClicked()
        {
            if (selectedIndex < 0 || selectedIndex >= characters.Count)
            {
                return;
            }
            
            CharacterInfo character = characters[selectedIndex];
            
            Debug.Log($"Entering world with character: {character.name}");
            
            // Store selected character ID
            PlayerPrefs.SetString("selected_character_id", character.id);
            
            // Connect to game server and load world
            string authToken = PlayerPrefs.GetString("auth_token", "");
            
            if (Network.NetworkManager.Instance != null)
            {
                Network.NetworkManager.Instance.ConnectToGameServer(authToken, character.id);
            }
            
            // Load world scene
            if (!string.IsNullOrEmpty(gameWorldScene))
            {
                SceneManager.LoadScene(gameWorldScene);
            }
        }
        
        private void OnCreateCharacterClicked()
        {
            ShowPanel(createCharacterPanel);
            
            // Reset creation form
            if (characterNameInput != null)
            {
                characterNameInput.text = "";
                characterNameInput.Select();
            }
            
            if (classDropdown != null) classDropdown.value = 0;
            if (raceDropdown != null) raceDropdown.value = 0;
            
            HideCreateError();
        }
        
        private void OnCancelCreateClicked()
        {
            ShowPanel(characterListPanel);
        }
        
        private async void OnConfirmCreateClicked()
        {
            // Validate
            string characterName = characterNameInput?.text?.Trim() ?? "";
            
            if (string.IsNullOrEmpty(characterName))
            {
                ShowCreateError("Please enter a character name");
                return;
            }
            
            if (characterName.Length < 3 || characterName.Length > 12)
            {
                ShowCreateError("Name must be 3-12 characters");
                return;
            }
            
            string className = classDropdown?.options[classDropdown.value].text ?? "Warrior";
            string raceName = raceDropdown?.options[raceDropdown.value].text ?? "Human";
            
            SetLoading(true);
            
            try
            {
                // In production, send to API
                await System.Threading.Tasks.Task.Delay(500);
                
                // Add new character
                CharacterInfo newCharacter = new CharacterInfo
                {
                    id = "char" + (characters.Count + 1),
                    name = characterName,
                    level = 1,
                    characterClass = className,
                    race = raceName
                };
                
                characters.Add(newCharacter);
                
                ShowPanel(characterListPanel);
                RefreshCharacterList();
                SelectCharacter(characters.Count - 1);
                
                Debug.Log($"Created character: {characterName}");
            }
            catch (System.Exception ex)
            {
                ShowCreateError($"Failed to create: {ex.Message}");
            }
            finally
            {
                SetLoading(false);
            }
        }
        
        private void OnDeleteCharacterClicked()
        {
            if (selectedIndex < 0 || selectedIndex >= characters.Count)
            {
                return;
            }
            
            // Would show confirmation dialog
            Debug.Log("Delete character clicked - would show confirmation");
            
            // For now, just delete
            characters.RemoveAt(selectedIndex);
            selectedIndex = -1;
            RefreshCharacterList();
        }
        
        private void OnBackClicked()
        {
            // Logout and return to login
            PlayerPrefs.DeleteKey("auth_token");
            
            if (!string.IsNullOrEmpty(loginScene))
            {
                SceneManager.LoadScene(loginScene);
            }
        }
        
        #endregion

        #region UI Helpers
        
        private void ShowPanel(GameObject panel)
        {
            if (characterListPanel != null) characterListPanel.SetActive(panel == characterListPanel);
            if (createCharacterPanel != null) createCharacterPanel.SetActive(panel == createCharacterPanel);
        }
        
        private void SetLoading(bool loading)
        {
            isLoading = loading;
            
            if (loadingPanel != null)
            {
                loadingPanel.SetActive(loading);
            }
            
            UpdateButtonStates();
        }
        
        private void ShowCreateError(string message)
        {
            if (createErrorText != null)
            {
                createErrorText.text = message;
                createErrorText.gameObject.SetActive(true);
            }
        }
        
        private void HideCreateError()
        {
            if (createErrorText != null)
            {
                createErrorText.gameObject.SetActive(false);
            }
        }
        
        #endregion
    }
}
