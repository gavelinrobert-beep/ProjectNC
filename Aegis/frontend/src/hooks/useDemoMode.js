// Aegis/frontend/src/hooks/useDemoMode.js
import { useEffect } from 'react'
import { api } from '../lib/api'

export function useDemoMode(
  isDemoActive,
  demoScenario,
  assets,
  bases,
  missions,
  inventory,
  demoSpeed,
  setMissions,
  setDemoMessages
) {
  useEffect(() => {
    if (!isDemoActive) return

    // Register action callbacks
    demoScenario.registerCallback('createMission', async (data) => {
      if (!data?.asset?.id || !data?.sourceBase || !data?.destBase) {
        console.warn('[DEMO] Missing data for mission creation', data)
        return
      }

      try {
        const mission = {
          name: `DEMO ${data.type === 'transfer' ? 'Supply' : 'Patrol'} - ${data.asset.id}`,
          asset_id: data.asset.id,
          mission_type: data.type || 'patrol',
          priority: data.priority || 'high',
          status: 'planned',
          waypoints: [
            {
              lat: data.sourceBase.lat,
              lon: data.sourceBase.lon,
              name: data.sourceBase.name
            },
            {
              lat: data.destBase.lat,
              lon: data.destBase.lon,
              name: data.destBase.name
            }
          ]
        }

        // For transfer missions, find real inventory items at the source base
        if (data.type === 'transfer') {
          mission.source_base_id = data.sourceBase.id
          mission.destination_base_id = data.destBase.id

          const sourceInventory = inventory.filter(item => item.location_id === data.sourceBase.id)

          if (sourceInventory.length > 0) {
            const ammoItem = sourceInventory.find(item =>
              item.name.toLowerCase().includes('ammunition') ||
              item.category === 'ammunition'
            )

            if (ammoItem && ammoItem.quantity >= 100) {
              mission.items = [{
                item_id: ammoItem.id,
                quantity: 100
              }]
              console.log('[DEMO] Using item:', ammoItem.name, ammoItem.id)
            } else {
              const anyItem = sourceInventory.find(item => item.quantity >= 100)
              if (anyItem) {
                mission.items = [{
                  item_id: anyItem.id,
                  quantity: 100
                }]
                console.log('[DEMO] Using fallback item:', anyItem.name, anyItem.id)
              } else {
                console.warn('[DEMO] No items with sufficient quantity, using patrol instead')
                mission.mission_type = 'patrol'
                delete mission.source_base_id
                delete mission.destination_base_id
              }
            }
          } else {
            console.warn('[DEMO] No inventory at source base, converting to patrol')
            mission.mission_type = 'patrol'
            delete mission.source_base_id
            delete mission.destination_base_id
          }
        }

        console.log('[DEMO] Creating mission:', mission)
        const created = await api.createMission(mission)
        console.log('[DEMO] Mission created:', created.id)

        await api.startMission(created.id)
        console.log('[DEMO] Mission started:', created.id)

        const missionsData = await api.missions()
        setMissions(missionsData || [])

      } catch (err) {
        console.error('[DEMO] Failed to create/start mission:', err)
      }
    })

    demoScenario.registerCallback('createLowFuelAlert', async (data) => {
      if (!data.assetId) return
      console.log('[DEMO] Low fuel alert for:', data.assetId)
    })

    demoScenario.registerCallback('restart', () => {
      setTimeout(() => {
        if (isDemoActive) {
          demoScenario.start(demoSpeed, assets, bases, missions)
        }
      }, 2000)
    })

    const interval = setInterval(() => {
      const events = demoScenario.getTriggeredEvents()
      events.forEach(event => {
        console.log('[DEMO EVENT]', event.message)
        setDemoMessages(prev => [...prev.slice(-4), { ...event, timestamp: Date.now() }])
      })
    }, 100)

    return () => clearInterval(interval)
  }, [isDemoActive, demoScenario, assets, bases, missions, demoSpeed, inventory, setMissions, setDemoMessages])
}