using UnityEngine;
using UnityEngine.UI;
using UnityEngine.EventSystems;
using System.Collections.Generic;
using TMPro;

/// <summary>
/// Inventory UI for displaying and managing player items
/// </summary>
public class InventoryUI : MonoBehaviour
{
    [Header("UI References")]
    [SerializeField] private GameObject inventoryPanel;
    [SerializeField] private Transform bagSlotsContainer;
    [SerializeField] private GameObject inventorySlotPrefab;
    [SerializeField] private Button closeButton;
    [SerializeField] private TextMeshProUGUI goldText;

    [Header("Settings")]
    [SerializeField] private int bagSlots = 40;

    private Dictionary<int, InventorySlot> slots = new Dictionary<int, InventorySlot>();
    private bool isVisible = false;

    private void Start()
    {
        InitializeSlots();

        if (closeButton != null)
        {
            closeButton.onClick.AddListener(Hide);
        }

        Hide();
    }

    private void Update()
    {
        // Toggle inventory with 'B' key
        if (Input.GetKeyDown(KeyCode.B))
        {
            Toggle();
        }
    }

    private void InitializeSlots()
    {
        if (inventorySlotPrefab == null || bagSlotsContainer == null)
        {
            return;
        }

        // Create bag slots
        for (int i = 0; i < bagSlots; i++)
        {
            GameObject slotObj = Instantiate(inventorySlotPrefab, bagSlotsContainer);
            InventorySlot slot = slotObj.GetComponent<InventorySlot>();
            if (slot != null)
            {
                slot.Initialize(i, this);
                slots[i] = slot;
            }
        }
    }

    public void Show()
    {
        isVisible = true;
        if (inventoryPanel != null)
        {
            inventoryPanel.SetActive(true);
        }
    }

    public void Hide()
    {
        isVisible = false;
        if (inventoryPanel != null)
        {
            inventoryPanel.SetActive(false);
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
    /// Update inventory with items from server
    /// </summary>
    public void UpdateInventory(List<InventoryItemData> items)
    {
        // Clear all slots first
        foreach (var slot in slots.Values)
        {
            slot.ClearItem();
        }

        // Populate with items
        foreach (var item in items)
        {
            if (item.Slot >= 0 && item.Slot < bagSlots && slots.ContainsKey(item.Slot))
            {
                slots[item.Slot].SetItem(item);
            }
        }
    }

    /// <summary>
    /// Update gold display
    /// </summary>
    public void UpdateGold(int gold)
    {
        if (goldText != null)
        {
            goldText.text = $"Gold: {gold}";
        }
    }

    /// <summary>
    /// Called when an item is clicked
    /// </summary>
    public void OnItemClicked(InventorySlot slot)
    {
        Debug.Log($"Item clicked in slot {slot.SlotIndex}");
        // TODO: Show item tooltip or context menu
    }

    /// <summary>
    /// Called when an item is right-clicked
    /// </summary>
    public void OnItemRightClicked(InventorySlot slot)
    {
        if (slot.HasItem)
        {
            Debug.Log($"Using item in slot {slot.SlotIndex}");
            // TODO: Send use item message to server
        }
    }
}

/// <summary>
/// Represents a single inventory slot
/// </summary>
public class InventorySlot : MonoBehaviour, IPointerClickHandler, IBeginDragHandler, IDragHandler, IEndDragHandler
{
    [SerializeField] private Image itemIcon;
    [SerializeField] private TextMeshProUGUI quantityText;
    [SerializeField] private Image slotBackground;

    public int SlotIndex { get; private set; }
    public bool HasItem => itemData != null;

    private InventoryUI inventoryUI;
    private InventoryItemData itemData;
    private Canvas canvas;

    public void Initialize(int slotIndex, InventoryUI ui)
    {
        SlotIndex = slotIndex;
        inventoryUI = ui;
        canvas = GetComponentInParent<Canvas>();
        ClearItem();
    }

    public void SetItem(InventoryItemData item)
    {
        itemData = item;

        if (itemIcon != null)
        {
            itemIcon.enabled = true;
            // TODO: Load actual item icon from item definition
            itemIcon.color = Color.white;
        }

        if (quantityText != null)
        {
            if (item.Quantity > 1)
            {
                quantityText.enabled = true;
                quantityText.text = item.Quantity.ToString();
            }
            else
            {
                quantityText.enabled = false;
            }
        }
    }

    public void ClearItem()
    {
        itemData = null;

        if (itemIcon != null)
        {
            itemIcon.enabled = false;
        }

        if (quantityText != null)
        {
            quantityText.enabled = false;
        }
    }

    public void OnPointerClick(PointerEventData eventData)
    {
        if (eventData.button == PointerEventData.InputButton.Left)
        {
            inventoryUI?.OnItemClicked(this);
        }
        else if (eventData.button == PointerEventData.InputButton.Right)
        {
            inventoryUI?.OnItemRightClicked(this);
        }
    }

    public void OnBeginDrag(PointerEventData eventData)
    {
        if (!HasItem) return;
        
        // TODO: Create drag visual
        Debug.Log($"Begin dragging item from slot {SlotIndex}");
    }

    public void OnDrag(PointerEventData eventData)
    {
        if (!HasItem) return;
        
        // TODO: Update drag visual position
    }

    public void OnEndDrag(PointerEventData eventData)
    {
        if (!HasItem) return;
        
        // TODO: Handle item drop
        Debug.Log($"End dragging item from slot {SlotIndex}");
    }
}

/// <summary>
/// Inventory item data from server
/// </summary>
[System.Serializable]
public class InventoryItemData
{
    public string Id;
    public string ItemDefinitionId;
    public int Quantity;
    public int Slot;
}
