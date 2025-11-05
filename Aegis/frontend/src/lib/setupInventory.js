import { api } from './api'

export async function setupBaseInventory() {
  try {
    const bases = await api.bases()
    console.log('[SETUP] Found', bases.length, 'bases')

    const inventoryItems = [
      { name: 'Ammunition 5.56mm', category: 'ammunition', quantity: 5000, unit: 'rounds', min: 1000, max: 10000 },
      { name: 'Ammunition 7.62mm', category: 'ammunition', quantity: 3000, unit: 'rounds', min: 500, max: 8000 },
      { name: 'Diesel Fuel', category: 'fuel', quantity: 10000, unit: 'liters', min: 2000, max: 50000 },
      { name: 'Aviation Fuel', category: 'fuel', quantity: 8000, unit: 'liters', min: 1000, max: 30000 },
      { name: 'Medical Supplies', category: 'medical', quantity: 500, unit: 'units', min: 100, max: 2000 },
      { name: 'MRE Rations', category: 'provisions', quantity: 2000, unit: 'meals', min: 500, max: 10000 },
      { name: 'Water', category: 'provisions', quantity: 5000, unit: 'liters', min: 1000, max: 20000 },
      { name: 'Spare Parts', category: 'maintenance', quantity: 200, unit: 'units', min: 50, max: 1000 }
    ]

    // Add inventory to first 5 bases
    for (let i = 0; i < Math.min(5, bases.length); i++) {
      const base = bases[i]
      console.log('[SETUP] Adding inventory to base:', base.name)

      for (const item of inventoryItems) {
        try {
          const response = await fetch('http://localhost:8000/api/inventory/items', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: item.name,
              category: item.category,
              quantity: item.quantity,
              unit: item.unit,
              location_id: base.id,
              min_stock_level: item.min,
              max_stock_level: item.max
            })
          })

          if (response.ok) {
            console.log('[SETUP] ✅ Added', item.name, 'to', base.name)
          } else {
            console.warn('[SETUP] ⚠️ Failed to add', item.name)
          }
        } catch (err) {
          console.error('[SETUP] Error adding item:', err)
        }
      }
    }

    console.log('[SETUP] ✅ Inventory setup complete!')
    return true
  } catch (err) {
    console.error('[SETUP] Failed to setup inventory:', err)
    return false
  }
}