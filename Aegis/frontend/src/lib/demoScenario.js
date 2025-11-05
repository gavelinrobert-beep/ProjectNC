// Enhanced demo scenario engine with real system integration
export class DemoScenario {
  constructor() {
    this.events = []
    this.currentEventIndex = 0
    this.startTime = null
    this.speed = 1
    this.isRunning = false
    this.actionCallbacks = {}
  }

  registerCallback(action, callback) {
    this.actionCallbacks[action] = callback
  }

  async executeAction(event) {
    const callback = this.actionCallbacks[event.action]
    if (callback) {
      try {
        await callback(event.data)
        console.log('[DEMO] Executed action:', event.action, event.data)
      } catch (err) {
        console.error('[DEMO] Action failed:', event.action, err)
      }
    }
  }

  generateScenario(assets, bases, missions) {
    const availableHelicopter = assets.find(a => a.type === 'helicopter' && !missions.some(m => m.asset_id === a.id && m.status === 'active'))
    const availableUAV = assets.find(a => a.type === 'uav' && !missions.some(m => m.asset_id === a.id && m.status === 'active'))
    const availableTruck = assets.find(a => a.type === 'truck' && !missions.some(m => m.asset_id === a.id && m.status === 'active'))

    const satenasBase = bases.find(b => b.id === 'base-f7-satenas') || bases[0]
    const ronnebyBase = bases.find(b => b.id === 'base-f17-ronneby') || bases[1]
    const luleaBase = bases.find(b => b.id === 'base-f21-lulea') || bases[2]
    const malmenBase = bases.find(b => b.id === 'base-malmen') || bases[3]
    const uppsalaBase = bases.find(b => b.id === 'base-uppsala') || bases[4]

    console.log('[DEMO] Available assets:')
    console.log('  Helicopter:', availableHelicopter?.id || 'NONE')
    console.log('  UAV:', availableUAV?.id || 'NONE')
    console.log('  Truck:', availableTruck?.id || 'NONE')

    this.events = [
      {
        time: 0,
        type: 'info',
        message: '🎬 DEMO MODE ACTIVE - Automated operations commencing',
        action: null
      },
      {
        time: 3000,
        type: 'mission_start',
        message: 'Emergency supply run: F 7 Såtenäs to Malmen Air Base',
        action: 'createMission',
        data: {
          asset: availableHelicopter,
          sourceBase: satenasBase,
          destBase: malmenBase,
          type: 'transfer',
          priority: 'high',
          items: [{ item_id: 'ammunition', quantity: 100 }]
        }
      },
      {
        time: 8000,
        type: 'alert',
        message: 'LOW FUEL WARNING - Asset requires attention',
        action: 'createLowFuelAlert',
        data: {
          assetId: assets[Math.floor(Math.random() * Math.min(5, assets.length))]?.id
        }
      }
    ]

    if (availableUAV) {
      this.events.push({
        time: 12000,
        type: 'mission_start',
        message: 'UAV reconnaissance patrol initiated',
        action: 'createMission',
        data: {
          asset: availableUAV,
          sourceBase: uppsalaBase,
          destBase: luleaBase,
          type: 'patrol',
          priority: 'medium'
        }
      })
    } else {
      this.events.push({
        time: 12000,
        type: 'info',
        message: 'UAV mission skipped - No available UAV assets',
        action: null
      })
    }

    this.events.push(
      {
        time: 16000,
        type: 'supply',
        message: 'Ammunition stocks low - automatic resupply triggered',
        action: 'updateInventory',
        data: { item: 'ammunition', change: -500 }
      },
      {
        time: 20000,
        type: 'nato',
        message: 'NATO Joint Exercise - Allied forces coordinating',
        action: 'natoUpdate',
        data: { allies: ['Norway', 'Finland', 'Denmark'], readiness: 96 }
      }
    )

    if (availableTruck) {
      this.events.push({
        time: 24000,
        type: 'mission_start',
        message: 'Ground convoy departing',
        action: 'createMission',
        data: {
          asset: availableTruck,
          sourceBase: ronnebyBase,
          destBase: uppsalaBase,
          type: 'transfer',
          priority: 'medium',
          items: [{ item_id: 'ammunition', quantity: 200 }]
        }
      })
    } else {
      this.events.push({
        time: 24000,
        type: 'info',
        message: 'Ground convoy skipped - No available truck assets',
        action: null
      })
    }

    this.events.push(
      {
        time: 28000,
        type: 'alert',
        message: 'CRITICAL: Geofence breach detected',
        action: 'createGeofenceAlert',
        data: { severity: 'critical', zone: 'Restricted Airspace Alpha' }
      },
      {
        time: 32000,
        type: 'readiness',
        message: 'Force readiness increased to 99%',
        action: 'updateReadiness',
        data: { readiness: 99 }
      },
      {
        time: 36000,
        type: 'mission_progress',
        message: 'First mission 75% complete',
        action: 'updateMissionProgress',
        data: { progress: 75 }
      },
      {
        time: 40000,
        type: 'alert',
        message: 'Maintenance alert - Routine inspection required',
        action: 'createMaintenanceAlert',
        data: { assetId: assets[Math.floor(Math.random() * Math.min(8, assets.length))]?.id }
      },
      {
        time: 44000,
        type: 'mission_complete',
        message: 'Mission Alpha-1 COMPLETED - All objectives achieved',
        action: 'completeMission',
        data: { missionIndex: 0 }
      },
      {
        time: 48000,
        type: 'supply',
        message: 'Resupply convoy arrived',
        action: 'updateInventory',
        data: { item: 'ammunition', change: 1000 }
      },
      {
        time: 52000,
        type: 'alert_resolved',
        message: 'All critical alerts acknowledged and resolved',
        action: 'resolveAlerts',
        data: {}
      },
      {
        time: 56000,
        type: 'info',
        message: 'MISSION SUCCESS - System operating at peak efficiency',
        action: null
      },
      {
        time: 60000,
        type: 'info',
        message: 'Demo cycle complete - Restarting scenario...',
        action: 'restart',
        data: {}
      }
    )

    this.currentEventIndex = 0
  }

  start(speed, assets, bases, missions) {
    this.speed = speed
    this.isRunning = true
    this.startTime = Date.now()
    this.currentEventIndex = 0
    this.generateScenario(assets, bases, missions)
    console.log('[DEMO] Scenario started at speed:', speed, 'with', this.events.length, 'events')
  }

  stop() {
    this.isRunning = false
    this.startTime = null
    this.currentEventIndex = 0
    console.log('[DEMO] Scenario stopped')
  }

  setSpeed(speed) {
    if (!this.startTime) return
    const elapsed = (Date.now() - this.startTime) * this.speed
    this.startTime = Date.now() - (elapsed / speed)
    this.speed = speed
    console.log('[DEMO] Speed changed to:', speed)
  }

  getTriggeredEvents() {
    if (!this.isRunning || !this.startTime) return []

    const elapsed = (Date.now() - this.startTime) * this.speed
    const triggered = []

    while (this.currentEventIndex < this.events.length) {
      const event = this.events[this.currentEventIndex]
      if (event.time <= elapsed) {
        triggered.push(event)
        this.currentEventIndex++

        if (event.action) {
          this.executeAction(event)
        }

        if (this.currentEventIndex >= this.events.length) {
          console.log('[DEMO] Restarting scenario...')
        }
      } else {
        break
      }
    }

    return triggered
  }
}

export default DemoScenario