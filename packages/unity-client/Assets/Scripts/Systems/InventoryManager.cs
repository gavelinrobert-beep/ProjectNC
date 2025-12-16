using UnityEngine;
using MMORPG.Network;
using Newtonsoft.Json;
using System.Collections.Generic;

/// <summary>
/// Manages inventory state and UI integration
/// </summary>
public class InventoryManager : MonoBehaviour
{
    [Header("UI References")]
    [SerializeField] private InventoryUI inventoryUI;
    [SerializeField] private CharacterEquipmentUI equipmentUI;

    private MessageRouter messageRouter;
    private NetworkManager networkManager;

    private void Start()
    {
        messageRouter = FindObjectOfType<MessageRouter>();
        networkManager = FindObjectOfType<NetworkManager>();

        // Register message handlers
        if (messageRouter != null)
        {
            messageRouter.RegisterHandler("INVENTORY_UPDATE", OnInventoryUpdate);
            messageRouter.RegisterHandler("ITEM_LOOTED", OnItemLooted);
        }

        // Find UI components if not assigned
        if (inventoryUI == null)
        {
            inventoryUI = FindObjectOfType<InventoryUI>();
        }
        if (equipmentUI == null)
        {
            equipmentUI = FindObjectOfType<CharacterEquipmentUI>();
        }
    }

    /// <summary>
    /// Use an item from inventory
    /// </summary>
    public void UseItem(string inventoryItemId)
    {
        if (networkManager != null)
        {
            var message = new
            {
                type = "USE_ITEM",
                payload = new { inventoryItemId = inventoryItemId }
            };

            networkManager.SendMessage(JsonConvert.SerializeObject(message));
            Debug.Log($"Using item: {inventoryItemId}");
        }
    }

    /// <summary>
    /// Equip an item
    /// </summary>
    public void EquipItem(string inventoryItemId, int slot)
    {
        if (networkManager != null)
        {
            var message = new
            {
                type = "EQUIP_ITEM",
                payload = new { inventoryItemId = inventoryItemId, slot = slot }
            };

            networkManager.SendMessage(JsonConvert.SerializeObject(message));
            Debug.Log($"Equipping item: {inventoryItemId} to slot {slot}");
        }
    }

    /// <summary>
    /// Move an item in inventory
    /// </summary>
    public void MoveItem(string inventoryItemId, int newSlot)
    {
        if (networkManager != null)
        {
            var message = new
            {
                type = "MOVE_ITEM",
                payload = new { inventoryItemId = inventoryItemId, newSlot = newSlot }
            };

            networkManager.SendMessage(JsonConvert.SerializeObject(message));
            Debug.Log($"Moving item: {inventoryItemId} to slot {newSlot}");
        }
    }

    /// <summary>
    /// Handle inventory update from server
    /// </summary>
    private void OnInventoryUpdate(string jsonPayload)
    {
        try
        {
            var data = JsonConvert.DeserializeObject<InventoryUpdateData>(jsonPayload);
            
            Debug.Log($"Inventory update received: {data.items.Count} items");

            // Convert items
            List<InventoryItemData> items = new List<InventoryItemData>();
            foreach (var item in data.items)
            {
                items.Add(new InventoryItemData
                {
                    Id = item.id,
                    ItemDefinitionId = item.itemDefinitionId,
                    Quantity = item.quantity,
                    Slot = item.slot
                });
            }

            // Update inventory UI (bag slots)
            if (inventoryUI != null)
            {
                var bagItems = items.FindAll(i => i.Slot >= 0);
                inventoryUI.UpdateInventory(bagItems);
            }

            // Update equipment UI (negative slots)
            if (equipmentUI != null)
            {
                var equipmentItems = items.FindAll(i => i.Slot < 0);
                equipmentUI.UpdateEquipment(equipmentItems);
            }
        }
        catch (System.Exception e)
        {
            Debug.LogError($"Failed to parse inventory update: {e.Message}");
        }
    }

    /// <summary>
    /// Handle item looted notification from server
    /// </summary>
    private void OnItemLooted(string jsonPayload)
    {
        try
        {
            var data = JsonConvert.DeserializeObject<ItemLootedData>(jsonPayload);
            
            Debug.Log($"Item looted: {data.itemDefinitionId} x{data.quantity}");

            // Show loot notification
            // TODO: Display item looted popup or notification
        }
        catch (System.Exception e)
        {
            Debug.LogError($"Failed to parse item looted: {e.Message}");
        }
    }

    #region Data Classes

    [System.Serializable]
    private class InventoryUpdateData
    {
        public List<ItemData> items;
    }

    [System.Serializable]
    private class ItemData
    {
        public string id;
        public string itemDefinitionId;
        public int quantity;
        public int slot;
    }

    [System.Serializable]
    private class ItemLootedData
    {
        public string itemDefinitionId;
        public int quantity;
    }

    #endregion
}
