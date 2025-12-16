package network

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
	"github.com/mmorpg/gameserver/internal/combat"
	"github.com/mmorpg/gameserver/internal/entity"
	"github.com/mmorpg/gameserver/internal/inventory"
	"github.com/mmorpg/gameserver/internal/quest"
	"github.com/mmorpg/gameserver/internal/world"
	"github.com/mmorpg/gameserver/pkg/protocol"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all origins for now (configure CORS properly in production)
	},
}

// Manager handles all network connections and message routing
type Manager struct {
	world            *world.World
	combatManager    *combat.CombatManager
	questManager     *quest.QuestManager
	inventoryManager *inventory.InventoryManager
	
	mu      sync.RWMutex
	clients map[string]*Client // player ID -> client
}

// Client represents a connected player
type Client struct {
	conn     *websocket.Conn
	playerID string
	entity   *entity.Entity
	send     chan []byte
}

// NewManager creates a new network manager
func NewManager(w *world.World) *Manager {
	m := &Manager{
		world:            w,
		combatManager:    combat.NewCombatManager(),
		questManager:     quest.NewQuestManager(),
		inventoryManager: inventory.NewInventoryManager(),
		clients:          make(map[string]*Client),
	}
	
	// Register quest callback for broadcasting progress updates
	m.questManager.RegisterCallback("broadcast", func(playerID string, questID string, completed bool) {
		m.broadcastQuestProgress(playerID, questID, completed)
	})
	
	return m
}

// HandleConnection handles a new WebSocket connection
func (m *Manager) HandleConnection(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Upgrade error:", err)
		return
	}

	client := &Client{
		conn: conn,
		send: make(chan []byte, 256),
	}

	// Start goroutines for reading and writing
	go client.readPump(m)
	go client.writePump()
}

// readPump reads messages from the WebSocket connection
func (c *Client) readPump(m *Manager) {
	defer func() {
		c.conn.Close()
		if c.playerID != "" {
			m.handleDisconnect(c)
		}
	}()

	for {
		_, message, err := c.conn.ReadMessage()
		if err != nil {
			break
		}

		// Parse message
		var msg protocol.GameMessage
		if err := json.Unmarshal(message, &msg); err != nil {
			log.Println("JSON parse error:", err)
			continue
		}

		// Route message
		m.handleMessage(c, &msg)
	}
}

// writePump writes messages to the WebSocket connection
func (c *Client) writePump() {
	defer c.conn.Close()

	for message := range c.send {
		if err := c.conn.WriteMessage(websocket.TextMessage, message); err != nil {
			break
		}
	}
}

// handleMessage routes incoming messages to appropriate handlers
func (m *Manager) handleMessage(c *Client, msg *protocol.GameMessage) {
	switch msg.Type {
	case "CONNECT":
		m.handleConnect(c, msg)
	case "PLAYER_MOVE":
		m.handlePlayerMove(c, msg)
	case "ATTACK_REQUEST":
		m.handleAttackRequest(c, msg)
	case "CHAT":
		m.handleChat(c, msg)
	case "ACCEPT_QUEST":
		m.handleAcceptQuest(c, msg)
	case "COMPLETE_QUEST":
		m.handleCompleteQuest(c, msg)
	case "ABANDON_QUEST":
		m.handleAbandonQuest(c, msg)
	case "USE_ITEM":
		m.handleUseItem(c, msg)
	case "EQUIP_ITEM":
		m.handleEquipItem(c, msg)
	case "MOVE_ITEM":
		m.handleMoveItem(c, msg)
	case "INTERACT":
		m.handleInteract(c, msg)
	default:
		log.Println("Unknown message type:", msg.Type)
	}
}

// handleConnect handles player connection and authentication
func (m *Manager) handleConnect(c *Client, msg *protocol.GameMessage) {
	var data protocol.ConnectMessage
	if err := mapToStruct(msg.Payload, &data); err != nil {
		return
	}

	// TODO: Validate JWT token with API backend
	// For now, create a test player

	// Create player entity
	player := entity.NewPlayerEntity(
		data.CharacterID,
		"TestPlayer",
		"WARRIOR",
		entity.Stats{Strength: 15, Agility: 10, Intellect: 10, Stamina: 12, Spirit: 10},
		entity.Position{X: 0, Y: 0, Z: 0},
	)

	c.playerID = data.CharacterID
	c.entity = player

	// Add to world
	m.world.AddPlayer(player)

	// Register client
	m.mu.Lock()
	m.clients[c.playerID] = c
	m.mu.Unlock()

	// Send welcome message
	welcome := protocol.WelcomeMessage{
		PlayerID:  player.ID,
		Character: protocol.CharacterData{
			ID:    player.ID,
			Name:  player.Name,
			Level: player.Level,
			Class: player.Class,
		},
		ServerTime: 0,
	}

	c.sendMessage("WELCOME", welcome)
}

// handlePlayerMove handles player movement input
func (m *Manager) handlePlayerMove(c *Client, msg *protocol.GameMessage) {
	if c.entity == nil {
		return
	}

	var data protocol.PlayerMoveMessage
	if err := mapToStruct(msg.Payload, &data); err != nil {
		return
	}

	// Set move target on entity
	c.entity.SetMoveTarget(data.X, data.Y, data.Z)

	// Broadcast entity update to nearby players
	m.broadcastEntityUpdate(c.entity)
}

// handleAttackRequest handles ability usage
func (m *Manager) handleAttackRequest(c *Client, msg *protocol.GameMessage) {
	if c.entity == nil {
		return
	}

	var data protocol.AttackRequestMessage
	if err := mapToStruct(msg.Payload, &data); err != nil {
		return
	}

	// Get target entity
	target := m.world.GetEntity(data.TargetEntityID)
	if target == nil {
		return
	}

	// Execute ability
	event := m.combatManager.ExecuteAbility(data.AbilityID, c.entity, target)
	if event == nil {
		return // Ability failed (cooldown, range, etc.)
	}

	// Check if target died and notify quest system
	if event.IsDead && target.Type != entity.TypePlayer {
		m.questManager.OnEntityKilled(c.playerID, data.TargetEntityID)
	}

	// Broadcast combat event to nearby players
	m.broadcastCombatEvent(event, c.entity.Position)
}

// handleChat handles chat messages
func (m *Manager) handleChat(c *Client, msg *protocol.GameMessage) {
	// Broadcast chat to all players (simplified)
	m.broadcastToAll(msg.Type, msg.Payload)
}

// handleDisconnect handles player disconnect
func (m *Manager) handleDisconnect(c *Client) {
	m.mu.Lock()
	delete(m.clients, c.playerID)
	m.mu.Unlock()

	m.world.RemovePlayer(c.playerID)

	log.Println("Player disconnected:", c.playerID)
}

// sendMessage sends a message to a specific client
func (c *Client) sendMessage(msgType string, payload interface{}) {
	msg := protocol.GameMessage{
		Type:    msgType,
		Payload: payload,
	}

	data, err := json.Marshal(msg)
	if err != nil {
		return
	}

	select {
	case c.send <- data:
	default:
		// Channel full, disconnect client
		close(c.send)
	}
}

// broadcastEntityUpdate broadcasts entity state to nearby players
func (m *Manager) broadcastEntityUpdate(e *entity.Entity) {
	update := protocol.EntityUpdate{
		EntityID: e.ID,
		Type:     string(e.Type),
		X:        e.Position.X,
		Y:        e.Position.Y,
		Z:        e.Position.Z,
		Name:     e.Name,
		Health:   e.CombatState.CurrentHealth,
		MaxHealth: e.CombatState.MaxHealth,
		IsMoving: e.IsMoving,
	}

	m.broadcastToAll("ENTITY_UPDATE", update)
}

// broadcastCombatEvent broadcasts combat event to nearby players
func (m *Manager) broadcastCombatEvent(event *combat.CombatEvent, pos entity.Position) {
	msg := protocol.CombatEventMessage{
		Type:           string(event.Type),
		SourceEntityID: event.SourceEntityID,
		TargetEntityID: event.TargetEntityID,
		AbilityID:      event.AbilityID,
		Value:          event.Value,
		TargetHealth:   event.TargetHealth,
		TargetMaxHealth: event.TargetMaxHealth,
		IsCritical:     event.IsCritical,
	}

	m.broadcastToAll("COMBAT_EVENT", msg)
}

// broadcastToAll sends a message to all connected clients
func (m *Manager) broadcastToAll(msgType string, payload interface{}) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	for _, client := range m.clients {
		client.sendMessage(msgType, payload)
	}
}

// GetPlayerCount returns the number of connected players
func (m *Manager) GetPlayerCount() int {
	m.mu.RLock()
	defer m.mu.RUnlock()
	return len(m.clients)
}

// handleAcceptQuest handles accepting a quest
func (m *Manager) handleAcceptQuest(c *Client, msg *protocol.GameMessage) {
	if c.entity == nil {
		return
	}

	var data protocol.AcceptQuestMessage
	if err := mapToStruct(msg.Payload, &data); err != nil {
		return
	}

	// Quest progress should be loaded from API, but for now create a simple one
	// In production, this would call the API to accept the quest and get objectives
	log.Printf("Player %s accepting quest %s", c.playerID, data.QuestID)
}

// handleCompleteQuest handles completing a quest
func (m *Manager) handleCompleteQuest(c *Client, msg *protocol.GameMessage) {
	if c.entity == nil {
		return
	}

	var data protocol.CompleteQuestMessage
	if err := mapToStruct(msg.Payload, &data); err != nil {
		return
	}

	questProgress := m.questManager.GetPlayerQuest(c.playerID, data.QuestID)
	if questProgress != nil && questProgress.Status == quest.StatusCompleted {
		// Quest is ready to turn in
		// In production, call API to give rewards
		log.Printf("Player %s completing quest %s", c.playerID, data.QuestID)
	}
}

// handleAbandonQuest handles abandoning a quest
func (m *Manager) handleAbandonQuest(c *Client, msg *protocol.GameMessage) {
	if c.entity == nil {
		return
	}

	var data protocol.AbandonQuestMessage
	if err := mapToStruct(msg.Payload, &data); err != nil {
		return
	}

	m.questManager.RemovePlayerQuest(c.playerID, data.QuestID)
	log.Printf("Player %s abandoned quest %s", c.playerID, data.QuestID)
}

// handleUseItem handles using a consumable item
func (m *Manager) handleUseItem(c *Client, msg *protocol.GameMessage) {
	if c.entity == nil {
		return
	}

	var data protocol.UseItemMessage
	if err := mapToStruct(msg.Payload, &data); err != nil {
		return
	}

	// Item usage logic would go here
	log.Printf("Player %s using item %s", c.playerID, data.InventoryItemID)
}

// handleEquipItem handles equipping an item
func (m *Manager) handleEquipItem(c *Client, msg *protocol.GameMessage) {
	if c.entity == nil {
		return
	}

	var data protocol.EquipItemMessage
	if err := mapToStruct(msg.Payload, &data); err != nil {
		return
	}

	// Equipment logic would go here
	log.Printf("Player %s equipping item %s to slot %d", c.playerID, data.InventoryItemID, data.Slot)
}

// handleMoveItem handles moving an item in inventory
func (m *Manager) handleMoveItem(c *Client, msg *protocol.GameMessage) {
	if c.entity == nil {
		return
	}

	var data protocol.MoveItemMessage
	if err := mapToStruct(msg.Payload, &data); err != nil {
		return
	}

	// Move item logic would go here
	log.Printf("Player %s moving item %s to slot %d", c.playerID, data.InventoryItemID, data.NewSlot)
}

// handleInteract handles interacting with NPCs or objects
func (m *Manager) handleInteract(c *Client, msg *protocol.GameMessage) {
	if c.entity == nil {
		return
	}

	var data protocol.InteractMessage
	if err := mapToStruct(msg.Payload, &data); err != nil {
		return
	}

	// Notify quest system of interaction
	m.questManager.OnEntityInteracted(c.playerID, data.TargetEntityID)

	log.Printf("Player %s interacting with %s", c.playerID, data.TargetEntityID)
}

// broadcastQuestProgress broadcasts quest progress update to a player
func (m *Manager) broadcastQuestProgress(playerID string, questID string, completed bool) {
	m.mu.RLock()
	client := m.clients[playerID]
	m.mu.RUnlock()

	if client == nil {
		return
	}

	questProgress := m.questManager.GetPlayerQuest(playerID, questID)
	if questProgress == nil {
		return
	}

	objectives := make([]protocol.QuestObjectiveProgress, len(questProgress.Objectives))
	for i, obj := range questProgress.Objectives {
		objectives[i] = protocol.QuestObjectiveProgress{
			ID:          obj.ID,
			Description: obj.Description,
			Current:     obj.Current,
			Required:    obj.Required,
			Completed:   obj.Completed,
		}
	}

	status := "IN_PROGRESS"
	if completed {
		status = "COMPLETED"
	}

	msg := protocol.QuestProgressMessage{
		QuestID:    questID,
		Objectives: objectives,
		Status:     status,
	}

	client.sendMessage("QUEST_PROGRESS", msg)
}

// Helper function to convert map to struct
func mapToStruct(data interface{}, result interface{}) error {
	jsonData, err := json.Marshal(data)
	if err != nil {
		return err
	}
	return json.Unmarshal(jsonData, result)
}
