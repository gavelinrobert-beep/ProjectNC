package inventory

import (
	"errors"
	"sync"
)

const (
	// Slot ranges
	BagSlotMin      = 0
	BagSlotMax      = 39
	EquipSlotMin    = -10
	EquipSlotMax    = -1
	MaxBagSlots     = 40
	MaxEquipSlots   = 10
)

var (
	ErrInventoryFull = errors.New("inventory is full")
	ErrInvalidSlot   = errors.New("invalid slot")
	ErrItemNotFound  = errors.New("item not found")
)

// InventoryItem represents an item instance in a player's inventory
type InventoryItem struct {
	ID               string `json:"id"`
	ItemDefinitionID string `json:"itemDefinitionId"`
	Quantity         int    `json:"quantity"`
	Slot             int    `json:"slot"`
}

// Inventory manages a player's items
type Inventory struct {
	mu    sync.RWMutex
	items map[int]*InventoryItem // slot -> item
}

// NewInventory creates a new inventory
func NewInventory() *Inventory {
	return &Inventory{
		items: make(map[int]*InventoryItem),
	}
}

// AddItem adds an item to the inventory
func (inv *Inventory) AddItem(item *InventoryItem) error {
	inv.mu.Lock()
	defer inv.mu.Unlock()

	// Find first available slot if slot is not specified
	if item.Slot == 0 {
		slot := inv.findAvailableSlot()
		if slot == -1 {
			return ErrInventoryFull
		}
		item.Slot = slot
	}

	// Check if slot is already occupied
	if _, exists := inv.items[item.Slot]; exists {
		return ErrInvalidSlot
	}

	inv.items[item.Slot] = item
	return nil
}

// RemoveItem removes an item from the inventory
func (inv *Inventory) RemoveItem(slot int) (*InventoryItem, error) {
	inv.mu.Lock()
	defer inv.mu.Unlock()

	item, exists := inv.items[slot]
	if !exists {
		return nil, ErrItemNotFound
	}

	delete(inv.items, slot)
	return item, nil
}

// GetItem gets an item at a specific slot
func (inv *Inventory) GetItem(slot int) *InventoryItem {
	inv.mu.RLock()
	defer inv.mu.RUnlock()

	return inv.items[slot]
}

// GetItems returns all items
func (inv *Inventory) GetItems() []*InventoryItem {
	inv.mu.RLock()
	defer inv.mu.RUnlock()

	items := make([]*InventoryItem, 0, len(inv.items))
	for _, item := range inv.items {
		items = append(items, item)
	}
	return items
}

// MoveItem moves an item to a different slot
func (inv *Inventory) MoveItem(fromSlot, toSlot int) error {
	inv.mu.Lock()
	defer inv.mu.Unlock()

	item, exists := inv.items[fromSlot]
	if !exists {
		return ErrItemNotFound
	}

	// Check if target slot is occupied
	if targetItem, occupied := inv.items[toSlot]; occupied {
		// Swap items
		targetItem.Slot = fromSlot
		inv.items[fromSlot] = targetItem
	} else {
		delete(inv.items, fromSlot)
	}

	item.Slot = toSlot
	inv.items[toSlot] = item
	return nil
}

// findAvailableSlot finds the first available bag slot
func (inv *Inventory) findAvailableSlot() int {
	for i := BagSlotMin; i <= BagSlotMax; i++ {
		if _, exists := inv.items[i]; !exists {
			return i
		}
	}
	return -1
}

// GetEquippedItems returns all equipped items
func (inv *Inventory) GetEquippedItems() []*InventoryItem {
	inv.mu.RLock()
	defer inv.mu.RUnlock()

	equipped := make([]*InventoryItem, 0)
	for slot := EquipSlotMin; slot <= EquipSlotMax; slot++ {
		if item, exists := inv.items[slot]; exists {
			equipped = append(equipped, item)
		}
	}
	return equipped
}

// InventoryManager manages inventories for all players
type InventoryManager struct {
	mu          sync.RWMutex
	inventories map[string]*Inventory // playerID -> inventory
}

// NewInventoryManager creates a new inventory manager
func NewInventoryManager() *InventoryManager {
	return &InventoryManager{
		inventories: make(map[string]*Inventory),
	}
}

// GetInventory gets a player's inventory, creating one if needed
func (im *InventoryManager) GetInventory(playerID string) *Inventory {
	im.mu.RLock()
	inventory := im.inventories[playerID]
	im.mu.RUnlock()

	if inventory == nil {
		im.mu.Lock()
		// Double-check after acquiring write lock
		if im.inventories[playerID] == nil {
			im.inventories[playerID] = NewInventory()
		}
		inventory = im.inventories[playerID]
		im.mu.Unlock()
	}

	return inventory
}

// SetInventory sets a player's inventory (used when loading from database)
func (im *InventoryManager) SetInventory(playerID string, items []*InventoryItem) {
	im.mu.Lock()
	defer im.mu.Unlock()

	inventory := NewInventory()
	for _, item := range items {
		inventory.items[item.Slot] = item
	}

	im.inventories[playerID] = inventory
}

// RemovePlayer removes a player's inventory (on disconnect)
func (im *InventoryManager) RemovePlayer(playerID string) {
	im.mu.Lock()
	defer im.mu.Unlock()

	delete(im.inventories, playerID)
}

// AddItem adds an item to a player's inventory
func (im *InventoryManager) AddItem(playerID string, item *InventoryItem) error {
	inventory := im.GetInventory(playerID)
	return inventory.AddItem(item)
}

// RemoveItem removes an item from a player's inventory
func (im *InventoryManager) RemoveItem(playerID string, slot int) (*InventoryItem, error) {
	inventory := im.GetInventory(playerID)
	return inventory.RemoveItem(slot)
}

// MoveItem moves an item in a player's inventory
func (im *InventoryManager) MoveItem(playerID string, fromSlot, toSlot int) error {
	inventory := im.GetInventory(playerID)
	return inventory.MoveItem(fromSlot, toSlot)
}

// GetEquippedItems gets all equipped items for a player
func (im *InventoryManager) GetEquippedItems(playerID string) []*InventoryItem {
	inventory := im.GetInventory(playerID)
	return inventory.GetEquippedItems()
}
