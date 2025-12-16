using UnityEngine;
using MMORPG.Network;
using Newtonsoft.Json;
using System.Collections.Generic;

/// <summary>
/// Manages quest state and UI integration
/// </summary>
public class QuestManager : MonoBehaviour
{
    [Header("UI References")]
    [SerializeField] private QuestLog questLog;
    [SerializeField] private QuestTracker questTracker;

    private MessageRouter messageRouter;
    private NetworkManager networkManager;

    private void Start()
    {
        messageRouter = FindObjectOfType<MessageRouter>();
        networkManager = FindObjectOfType<NetworkManager>();

        // Register message handlers
        if (messageRouter != null)
        {
            messageRouter.RegisterHandler("QUEST_PROGRESS", OnQuestProgress);
            messageRouter.RegisterHandler("QUEST_COMPLETED", OnQuestCompleted);
        }

        // Find UI components if not assigned
        if (questLog == null)
        {
            questLog = FindObjectOfType<QuestLog>();
        }
        if (questTracker == null)
        {
            questTracker = FindObjectOfType<QuestTracker>();
        }
    }

    /// <summary>
    /// Accept a quest
    /// </summary>
    public void AcceptQuest(string questId)
    {
        if (networkManager != null)
        {
            var message = new
            {
                type = "ACCEPT_QUEST",
                payload = new { questId = questId }
            };

            networkManager.SendMessage(JsonConvert.SerializeObject(message));
            Debug.Log($"Accepting quest: {questId}");
        }
    }

    /// <summary>
    /// Complete (turn in) a quest
    /// </summary>
    public void CompleteQuest(string questId)
    {
        if (networkManager != null)
        {
            var message = new
            {
                type = "COMPLETE_QUEST",
                payload = new { questId = questId }
            };

            networkManager.SendMessage(JsonConvert.SerializeObject(message));
            Debug.Log($"Completing quest: {questId}");
        }
    }

    /// <summary>
    /// Abandon a quest
    /// </summary>
    public void AbandonQuest(string questId)
    {
        if (networkManager != null)
        {
            var message = new
            {
                type = "ABANDON_QUEST",
                payload = new { questId = questId }
            };

            networkManager.SendMessage(JsonConvert.SerializeObject(message));
            Debug.Log($"Abandoning quest: {questId}");
        }

        // Update UI immediately
        if (questLog != null)
        {
            questLog.RemoveQuest(questId);
        }
        if (questTracker != null)
        {
            questTracker.UntrackQuest(questId);
        }
    }

    /// <summary>
    /// Handle quest progress update from server
    /// </summary>
    private void OnQuestProgress(string jsonPayload)
    {
        try
        {
            var data = JsonConvert.DeserializeObject<QuestProgressData>(jsonPayload);
            
            Debug.Log($"Quest progress update: {data.questId} - {data.status}");

            // Convert objectives
            List<QuestObjective> objectives = new List<QuestObjective>();
            foreach (var obj in data.objectives)
            {
                objectives.Add(new QuestObjective
                {
                    Id = obj.id,
                    Description = obj.description,
                    Current = obj.current,
                    Required = obj.required,
                    Completed = obj.completed
                });
            }

            // Update quest log
            if (questLog != null)
            {
                questLog.UpdateQuest(data.questId, "Quest Name", "Quest Description", objectives, data.status);
            }

            // Update quest tracker
            if (questTracker != null)
            {
                questTracker.UpdateQuestProgress(data.questId, objectives);
            }
        }
        catch (System.Exception e)
        {
            Debug.LogError($"Failed to parse quest progress: {e.Message}");
        }
    }

    /// <summary>
    /// Handle quest completion notification from server
    /// </summary>
    private void OnQuestCompleted(string jsonPayload)
    {
        try
        {
            var data = JsonConvert.DeserializeObject<QuestCompletedData>(jsonPayload);
            
            Debug.Log($"Quest completed: {data.questName} - Rewards: {data.rewards.experience} XP, {data.rewards.gold} Gold");

            // Show completion notification
            // TODO: Display quest completion popup with rewards

            // Remove from tracker
            if (questTracker != null)
            {
                questTracker.UntrackQuest(data.questId);
            }
        }
        catch (System.Exception e)
        {
            Debug.LogError($"Failed to parse quest completed: {e.Message}");
        }
    }

    #region Data Classes

    [System.Serializable]
    private class QuestProgressData
    {
        public string questId;
        public List<ObjectiveData> objectives;
        public string status;
    }

    [System.Serializable]
    private class ObjectiveData
    {
        public string id;
        public string description;
        public int current;
        public int required;
        public bool completed;
    }

    [System.Serializable]
    private class QuestCompletedData
    {
        public string questId;
        public string questName;
        public RewardsData rewards;
    }

    [System.Serializable]
    private class RewardsData
    {
        public int experience;
        public int gold;
        public List<string> items;
    }

    #endregion
}
