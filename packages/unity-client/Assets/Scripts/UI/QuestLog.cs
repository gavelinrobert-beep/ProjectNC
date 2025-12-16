using UnityEngine;
using UnityEngine.UI;
using System.Collections.Generic;
using TMPro;

/// <summary>
/// Quest log UI for displaying active and available quests
/// </summary>
public class QuestLog : MonoBehaviour
{
    [Header("UI References")]
    [SerializeField] private GameObject questLogPanel;
    [SerializeField] private Transform questListContainer;
    [SerializeField] private GameObject questEntryPrefab;
    [SerializeField] private TextMeshProUGUI questDetailsText;
    [SerializeField] private Button closeButton;

    private Dictionary<string, QuestEntry> activeQuests = new Dictionary<string, QuestEntry>();
    private bool isVisible = false;

    private void Start()
    {
        if (closeButton != null)
        {
            closeButton.onClick.AddListener(Hide);
        }

        Hide();
    }

    private void Update()
    {
        // Toggle quest log with 'L' key
        if (Input.GetKeyDown(KeyCode.L))
        {
            Toggle();
        }
    }

    public void Show()
    {
        isVisible = true;
        if (questLogPanel != null)
        {
            questLogPanel.SetActive(true);
        }
    }

    public void Hide()
    {
        isVisible = false;
        if (questLogPanel != null)
        {
            questLogPanel.SetActive(false);
        }
    }

    public void Toggle()
    {
        if (isVisible)
        {
            Hide();
        }
        else
        {
            Show();
        }
    }

    /// <summary>
    /// Add or update a quest in the log
    /// </summary>
    public void UpdateQuest(string questId, string questName, string description, List<QuestObjective> objectives, string status)
    {
        if (!activeQuests.ContainsKey(questId))
        {
            // Create new quest entry
            if (questEntryPrefab != null && questListContainer != null)
            {
                GameObject entryObj = Instantiate(questEntryPrefab, questListContainer);
                QuestEntry entry = entryObj.GetComponent<QuestEntry>();
                if (entry != null)
                {
                    entry.Initialize(questId, questName, description, objectives, status);
                    activeQuests[questId] = entry;
                }
            }
        }
        else
        {
            // Update existing quest entry
            activeQuests[questId].UpdateProgress(objectives, status);
        }
    }

    /// <summary>
    /// Remove a quest from the log
    /// </summary>
    public void RemoveQuest(string questId)
    {
        if (activeQuests.ContainsKey(questId))
        {
            Destroy(activeQuests[questId].gameObject);
            activeQuests.Remove(questId);
        }
    }

    /// <summary>
    /// Display quest details
    /// </summary>
    public void ShowQuestDetails(string questId)
    {
        if (activeQuests.ContainsKey(questId) && questDetailsText != null)
        {
            QuestEntry entry = activeQuests[questId];
            questDetailsText.text = $"<b>{entry.QuestName}</b>\n\n{entry.Description}\n\n{entry.GetObjectivesText()}";
        }
    }
}

/// <summary>
/// Represents a single quest entry in the UI
/// </summary>
public class QuestEntry : MonoBehaviour
{
    [SerializeField] private TextMeshProUGUI questNameText;
    [SerializeField] private TextMeshProUGUI questProgressText;
    [SerializeField] private Button selectButton;

    public string QuestId { get; private set; }
    public string QuestName { get; private set; }
    public string Description { get; private set; }
    public string Status { get; private set; }
    private List<QuestObjective> objectives = new List<QuestObjective>();

    public void Initialize(string questId, string questName, string description, List<QuestObjective> objectives, string status)
    {
        QuestId = questId;
        QuestName = questName;
        Description = description;
        this.objectives = objectives;
        Status = status;

        UpdateDisplay();

        if (selectButton != null)
        {
            selectButton.onClick.AddListener(OnSelectQuest);
        }
    }

    public void UpdateProgress(List<QuestObjective> objectives, string status)
    {
        this.objectives = objectives;
        Status = status;
        UpdateDisplay();
    }

    private void UpdateDisplay()
    {
        if (questNameText != null)
        {
            questNameText.text = QuestName;
            
            // Color code based on status
            if (Status == "COMPLETED")
            {
                questNameText.color = Color.yellow;
            }
            else if (Status == "IN_PROGRESS")
            {
                questNameText.color = Color.white;
            }
        }

        if (questProgressText != null)
        {
            int completed = 0;
            foreach (var obj in objectives)
            {
                if (obj.Completed)
                {
                    completed++;
                }
            }
            questProgressText.text = $"{completed}/{objectives.Count}";
        }
    }

    public string GetObjectivesText()
    {
        string text = "Objectives:\n";
        foreach (var obj in objectives)
        {
            string checkmark = obj.Completed ? "✓" : " ";
            text += $"[{checkmark}] {obj.Description} ({obj.Current}/{obj.Required})\n";
        }
        return text;
    }

    private void OnSelectQuest()
    {
        QuestLog questLog = FindObjectOfType<QuestLog>();
        if (questLog != null)
        {
            questLog.ShowQuestDetails(QuestId);
        }
    }
}

/// <summary>
/// Quest objective data
/// </summary>
[System.Serializable]
public class QuestObjective
{
    public string Id;
    public string Description;
    public int Current;
    public int Required;
    public bool Completed;
}
