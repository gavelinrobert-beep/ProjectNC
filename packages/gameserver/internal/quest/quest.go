package quest

import (
	"encoding/json"
	"sync"
)

// ObjectiveType represents the type of quest objective
type ObjectiveType string

const (
	ObjectiveKill     ObjectiveType = "KILL"
	ObjectiveCollect  ObjectiveType = "COLLECT"
	ObjectiveInteract ObjectiveType = "INTERACT"
)

// QuestStatus represents the status of a quest
type QuestStatus string

const (
	StatusAvailable  QuestStatus = "AVAILABLE"
	StatusInProgress QuestStatus = "IN_PROGRESS"
	StatusCompleted  QuestStatus = "COMPLETED"
	StatusTurnedIn   QuestStatus = "TURNED_IN"
)

// Objective represents a single quest objective
type Objective struct {
	ID          string        `json:"id"`
	Description string        `json:"description"`
	Type        ObjectiveType `json:"type"`
	TargetID    string        `json:"targetId"`
	Required    int           `json:"required"`
	Current     int           `json:"current"`
	Completed   bool          `json:"completed"`
}

// QuestProgress tracks a player's progress on a quest
type QuestProgress struct {
	mu sync.RWMutex

	QuestID    string       `json:"questId"`
	Status     QuestStatus  `json:"status"`
	Objectives []*Objective `json:"objectives"`
}

// NewQuestProgress creates a new quest progress tracker
func NewQuestProgress(questID string, objectivesJSON string) (*QuestProgress, error) {
	var objectives []*Objective
	if err := json.Unmarshal([]byte(objectivesJSON), &objectives); err != nil {
		return nil, err
	}

	return &QuestProgress{
		QuestID:    questID,
		Status:     StatusInProgress,
		Objectives: objectives,
	}, nil
}

// UpdateObjective updates progress for a specific objective
func (qp *QuestProgress) UpdateObjective(objectiveID string, increment int) bool {
	qp.mu.Lock()
	defer qp.mu.Unlock()

	for _, obj := range qp.Objectives {
		if obj.ID == objectiveID {
			obj.Current += increment
			if obj.Current >= obj.Required {
				obj.Current = obj.Required
				obj.Completed = true
			}
			break
		}
	}

	// Check if all objectives are complete
	allComplete := true
	for _, obj := range qp.Objectives {
		if !obj.Completed {
			allComplete = false
			break
		}
	}

	if allComplete {
		qp.Status = StatusCompleted
		return true
	}

	return false
}

// GetProgressJSON returns the progress as JSON string
func (qp *QuestProgress) GetProgressJSON() (string, error) {
	qp.mu.RLock()
	defer qp.mu.RUnlock()

	data, err := json.Marshal(qp.Objectives)
	if err != nil {
		return "", err
	}
	return string(data), nil
}

// QuestManager manages quest state for all players
type QuestManager struct {
	mu             sync.RWMutex
	playerQuests   map[string]map[string]*QuestProgress // playerID -> questID -> progress
	questCallbacks map[string]func(playerID string, questID string, completed bool)
}

// NewQuestManager creates a new quest manager
func NewQuestManager() *QuestManager {
	return &QuestManager{
		playerQuests:   make(map[string]map[string]*QuestProgress),
		questCallbacks: make(map[string]func(playerID string, questID string, completed bool)),
	}
}

// AddPlayerQuest adds a quest to a player's quest log
func (qm *QuestManager) AddPlayerQuest(playerID string, questProgress *QuestProgress) {
	qm.mu.Lock()
	defer qm.mu.Unlock()

	if qm.playerQuests[playerID] == nil {
		qm.playerQuests[playerID] = make(map[string]*QuestProgress)
	}

	qm.playerQuests[playerID][questProgress.QuestID] = questProgress
}

// GetPlayerQuest gets a specific quest progress for a player
func (qm *QuestManager) GetPlayerQuest(playerID string, questID string) *QuestProgress {
	qm.mu.RLock()
	defer qm.mu.RUnlock()

	if playerQuests, exists := qm.playerQuests[playerID]; exists {
		return playerQuests[questID]
	}
	return nil
}

// GetPlayerQuests gets all quests for a player
func (qm *QuestManager) GetPlayerQuests(playerID string) []*QuestProgress {
	qm.mu.RLock()
	defer qm.mu.RUnlock()

	quests := make([]*QuestProgress, 0)
	if playerQuests, exists := qm.playerQuests[playerID]; exists {
		for _, quest := range playerQuests {
			quests = append(quests, quest)
		}
	}
	return quests
}

// OnEntityKilled should be called when a player kills an entity
func (qm *QuestManager) OnEntityKilled(playerID string, entityID string) {
	qm.mu.RLock()
	playerQuests := qm.playerQuests[playerID]
	qm.mu.RUnlock()

	if playerQuests == nil {
		return
	}

	for questID, questProgress := range playerQuests {
		if questProgress.Status != StatusInProgress {
			continue
		}

		// Check if any objectives match this entity
		for _, obj := range questProgress.Objectives {
			if obj.Type == ObjectiveKill && obj.TargetID == entityID && !obj.Completed {
				completed := questProgress.UpdateObjective(obj.ID, 1)
				qm.notifyQuestUpdate(playerID, questID, completed)
			}
		}
	}
}

// OnItemCollected should be called when a player collects an item
func (qm *QuestManager) OnItemCollected(playerID string, itemID string, quantity int) {
	qm.mu.RLock()
	playerQuests := qm.playerQuests[playerID]
	qm.mu.RUnlock()

	if playerQuests == nil {
		return
	}

	for questID, questProgress := range playerQuests {
		if questProgress.Status != StatusInProgress {
			continue
		}

		// Check if any objectives match this item
		for _, obj := range questProgress.Objectives {
			if obj.Type == ObjectiveCollect && obj.TargetID == itemID && !obj.Completed {
				completed := questProgress.UpdateObjective(obj.ID, quantity)
				qm.notifyQuestUpdate(playerID, questID, completed)
			}
		}
	}
}

// OnEntityInteracted should be called when a player interacts with an entity
func (qm *QuestManager) OnEntityInteracted(playerID string, entityID string) {
	qm.mu.RLock()
	playerQuests := qm.playerQuests[playerID]
	qm.mu.RUnlock()

	if playerQuests == nil {
		return
	}

	for questID, questProgress := range playerQuests {
		if questProgress.Status != StatusInProgress {
			continue
		}

		// Check if any objectives match this entity
		for _, obj := range questProgress.Objectives {
			if obj.Type == ObjectiveInteract && obj.TargetID == entityID && !obj.Completed {
				completed := questProgress.UpdateObjective(obj.ID, 1)
				qm.notifyQuestUpdate(playerID, questID, completed)
			}
		}
	}
}

// RegisterCallback registers a callback for quest updates
func (qm *QuestManager) RegisterCallback(name string, callback func(playerID string, questID string, completed bool)) {
	qm.mu.Lock()
	defer qm.mu.Unlock()

	qm.questCallbacks[name] = callback
}

// notifyQuestUpdate notifies all callbacks about quest update
func (qm *QuestManager) notifyQuestUpdate(playerID string, questID string, completed bool) {
	qm.mu.RLock()
	callbacks := make([]func(string, string, bool), 0, len(qm.questCallbacks))
	for _, callback := range qm.questCallbacks {
		callbacks = append(callbacks, callback)
	}
	qm.mu.RUnlock()

	for _, callback := range callbacks {
		go callback(playerID, questID, completed)
	}
}

// RemovePlayerQuest removes a quest from a player's quest log
func (qm *QuestManager) RemovePlayerQuest(playerID string, questID string) {
	qm.mu.Lock()
	defer qm.mu.Unlock()

	if playerQuests, exists := qm.playerQuests[playerID]; exists {
		delete(playerQuests, questID)
	}
}

// RemovePlayer removes all quests for a player (on disconnect)
func (qm *QuestManager) RemovePlayer(playerID string) {
	qm.mu.Lock()
	defer qm.mu.Unlock()

	delete(qm.playerQuests, playerID)
}
