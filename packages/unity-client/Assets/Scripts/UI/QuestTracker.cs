using UnityEngine;
using UnityEngine.UI;
using System.Collections.Generic;
using TMPro;

/// <summary>
/// On-screen quest tracker showing active quest objectives
/// </summary>
public class QuestTracker : MonoBehaviour
{
    [Header("UI References")]
    [SerializeField] private Transform trackerContainer;
    [SerializeField] private GameObject questTrackerEntryPrefab;
    [SerializeField] private int maxTrackedQuests = 5;

    private Dictionary<string, QuestTrackerEntry> trackedQuests = new Dictionary<string, QuestTrackerEntry>();

    /// <summary>
    /// Track a quest on the HUD
    /// </summary>
    public void TrackQuest(string questId, string questName, List<QuestObjective> objectives)
    {
        if (trackedQuests.Count >= maxTrackedQuests && !trackedQuests.ContainsKey(questId))
        {
            Debug.LogWarning("Quest tracker full, cannot track more quests");
            return;
        }

        if (!trackedQuests.ContainsKey(questId))
        {
            // Create new tracker entry
            if (questTrackerEntryPrefab != null && trackerContainer != null)
            {
                GameObject entryObj = Instantiate(questTrackerEntryPrefab, trackerContainer);
                QuestTrackerEntry entry = entryObj.GetComponent<QuestTrackerEntry>();
                if (entry != null)
                {
                    entry.Initialize(questId, questName, objectives);
                    trackedQuests[questId] = entry;
                }
            }
        }
        else
        {
            // Update existing entry
            trackedQuests[questId].UpdateObjectives(objectives);
        }
    }

    /// <summary>
    /// Untrack a quest from the HUD
    /// </summary>
    public void UntrackQuest(string questId)
    {
        if (trackedQuests.ContainsKey(questId))
        {
            Destroy(trackedQuests[questId].gameObject);
            trackedQuests.Remove(questId);
        }
    }

    /// <summary>
    /// Update quest progress
    /// </summary>
    public void UpdateQuestProgress(string questId, List<QuestObjective> objectives)
    {
        if (trackedQuests.ContainsKey(questId))
        {
            trackedQuests[questId].UpdateObjectives(objectives);
        }
    }
}

/// <summary>
/// Single quest tracker entry
/// </summary>
public class QuestTrackerEntry : MonoBehaviour
{
    [SerializeField] private TextMeshProUGUI questNameText;
    [SerializeField] private TextMeshProUGUI objectivesText;

    private string questId;
    private string questName;
    private List<QuestObjective> objectives = new List<QuestObjective>();

    public void Initialize(string questId, string questName, List<QuestObjective> objectives)
    {
        this.questId = questId;
        this.questName = questName;
        this.objectives = objectives;
        UpdateDisplay();
    }

    public void UpdateObjectives(List<QuestObjective> objectives)
    {
        this.objectives = objectives;
        UpdateDisplay();
    }

    private void UpdateDisplay()
    {
        if (questNameText != null)
        {
            questNameText.text = questName;
        }

        if (objectivesText != null)
        {
            string text = "";
            foreach (var obj in objectives)
            {
                if (!obj.Completed)
                {
                    text += $"- {obj.Description}: {obj.Current}/{obj.Required}\n";
                }
            }
            objectivesText.text = text;
        }
    }
}
