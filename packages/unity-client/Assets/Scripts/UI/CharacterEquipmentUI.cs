using UnityEngine;
using UnityEngine.UI;
using System.Collections.Generic;
using TMPro;

/// <summary>
/// Character equipment UI showing equipped items
/// </summary>
public class CharacterEquipmentUI : MonoBehaviour
{
    [Header("UI References")]
    [SerializeField] private GameObject equipmentPanel;
    [SerializeField] private Button closeButton;

    [Header("Equipment Slots")]
    [SerializeField] private EquipmentSlot headSlot;
    [SerializeField] private EquipmentSlot chestSlot;
    [SerializeField] private EquipmentSlot legsSlot;
    [SerializeField] private EquipmentSlot feetSlot;
    [SerializeField] private EquipmentSlot handsSlot;
    [SerializeField] private EquipmentSlot mainHandSlot;
    [SerializeField] private EquipmentSlot offHandSlot;
    [SerializeField] private EquipmentSlot neckSlot;
    [SerializeField] private EquipmentSlot ring1Slot;
    [SerializeField] private EquipmentSlot ring2Slot;

    private Dictionary<int, EquipmentSlot> equipmentSlots = new Dictionary<int, EquipmentSlot>();
    private bool isVisible = false;

    private void Start()
    {
        InitializeEquipmentSlots();

        if (closeButton != null)
        {
            closeButton.onClick.AddListener(Hide);
        }

        Hide();
    }

    private void Update()
    {
        // Toggle equipment with 'C' key
        if (Input.GetKeyDown(KeyCode.C))
        {
            Toggle();
        }
    }

    private void InitializeEquipmentSlots()
    {
        // Equipment slots use negative slot indices
        if (headSlot != null) { headSlot.Initialize(-1, "Head"); equipmentSlots[-1] = headSlot; }
        if (chestSlot != null) { chestSlot.Initialize(-2, "Chest"); equipmentSlots[-2] = chestSlot; }
        if (legsSlot != null) { legsSlot.Initialize(-3, "Legs"); equipmentSlots[-3] = legsSlot; }
        if (feetSlot != null) { feetSlot.Initialize(-4, "Feet"); equipmentSlots[-4] = feetSlot; }
        if (handsSlot != null) { handsSlot.Initialize(-5, "Hands"); equipmentSlots[-5] = handsSlot; }
        if (mainHandSlot != null) { mainHandSlot.Initialize(-6, "Main Hand"); equipmentSlots[-6] = mainHandSlot; }
        if (offHandSlot != null) { offHandSlot.Initialize(-7, "Off Hand"); equipmentSlots[-7] = offHandSlot; }
        if (neckSlot != null) { neckSlot.Initialize(-8, "Neck"); equipmentSlots[-8] = neckSlot; }
        if (ring1Slot != null) { ring1Slot.Initialize(-9, "Ring 1"); equipmentSlots[-9] = ring1Slot; }
        if (ring2Slot != null) { ring2Slot.Initialize(-10, "Ring 2"); equipmentSlots[-10] = ring2Slot; }
    }

    public void Show()
    {
        isVisible = true;
        if (equipmentPanel != null)
        {
            equipmentPanel.SetActive(true);
        }
    }

    public void Hide()
    {
        isVisible = false;
        if (equipmentPanel != null)
        {
            equipmentPanel.SetActive(false);
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
    /// Update equipment from inventory items
    /// </summary>
    public void UpdateEquipment(List<InventoryItemData> items)
    {
        // Clear all slots
        foreach (var slot in equipmentSlots.Values)
        {
            slot.ClearItem();
        }

        // Populate equipped items
        foreach (var item in items)
        {
            if (item.Slot < 0 && equipmentSlots.ContainsKey(item.Slot))
            {
                equipmentSlots[item.Slot].SetItem(item);
            }
        }
    }
}

/// <summary>
/// Represents a single equipment slot
/// </summary>
public class EquipmentSlot : MonoBehaviour
{
    [SerializeField] private Image itemIcon;
    [SerializeField] private TextMeshProUGUI slotNameText;
    [SerializeField] private Image slotBackground;

    public int SlotIndex { get; private set; }
    public string SlotName { get; private set; }
    public bool HasItem => itemData != null;

    private InventoryItemData itemData;

    public void Initialize(int slotIndex, string slotName)
    {
        SlotIndex = slotIndex;
        SlotName = slotName;

        if (slotNameText != null)
        {
            slotNameText.text = slotName;
        }

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
    }

    public void ClearItem()
    {
        itemData = null;

        if (itemIcon != null)
        {
            itemIcon.enabled = false;
        }
    }
}
