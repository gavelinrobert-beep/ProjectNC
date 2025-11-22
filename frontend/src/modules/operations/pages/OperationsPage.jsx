// frontend/src/modules/operations/pages/OperationsPage.jsx
import React, { useEffect, useState } from 'react'
import { useVehicleTracking } from '../../fleet/hooks/useVehicles'
import { api, fetchInventoryItems } from '../../../lib/api'
import { BRAND } from '../../../lib/constants'
import DashboardMap from '../../../components/DashboardMap'
import AssetDetailModal from '../../../components/AssetDetailModal'
import MapView from '../../../components/map/MapView'

export default function OperationsPage() {
  const [assets, setAssets] = useState([])
  const [bases, setBases] = useState([])
  const [missions, setMissions] = useState([])
  const [inventory, setInventory] = useState([])
  const [baseWeather, setBaseWeather] = useState({})
  const [selectedAsset, setSelectedAsset] = useState(null)
  const [loading, setLoading] = useState(true)

  // Layer toggles
  const [layers, setLayers] = useState({
    assets: true,
    bases: true,
    geofences: true,
    threats: false,
    weather: false,
    missions: true
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assetsData, basesData, missionsData, inventoryData] = await Promise.all([
          api.assets(),
          api.facilities(),
          api.missions(),
          fetchInventoryItems()
        ])
        setAssets(assetsData || [])
        setBases(basesData || [])
        setMissions(missionsData || [])
        setInventory(inventoryData || [])
        setLoading(false)
      } catch (err) {
        console.error('[Operations] Error:', err)
        setLoading(false)
      }
    }
    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [])

  const loadBaseWeather = async (base) => {
    const id = base.id
    if (baseWeather[id]?.loading) return
    setBaseWeather(prev => ({ ...prev, [id]: { loading: true, err: null, data: null } }))
    try {
      let data = null
      if (api.weatherByBase) {
        try { data = await api.weatherByBase(base.id) } catch (e) { console.warn(e) }
      }
      if (!data) data = await api.weather(base.lat, base.lon)
      setBaseWeather(prev => ({ ...prev, [id]: { loading: false, err: null, data } }))
    } catch (err) {
      setBaseWeather(prev => ({ ...prev, [id]: { loading: false, err, data: null } }))
    }
  }

  const toggleLayer = (layer) => {
    setLayers(prev => ({ ...prev, [layer]: !prev[layer] }))
  }

  // Real-time vehicle tracking (5s polling)
  const { data: vehicles, isLoading: vehiclesLoading } = useVehicleTracking()

  const vehicleMarkers = vehicles?.map(v => ({
    id: v.id,
    name: v.registration_number || `Vehicle ${v.id}`,
    lat: v.lat || 59.3293,
    lng: v.lon || 18.0686,
    status: v.status || 'idle',
    driver: v.driver_name,
    speed: v.speed || 0
  })) || []

  if (loading) {
    return <div style={{ padding: 20, textAlign: 'center', color: BRAND.primary }}>Loading resource map...</div>
  }

  return (
    <div style={{
      height: 'calc(100vh - 120px)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem'
      }}>
        <h1 style={{ fontSize: '1.5rem', color: '#e0e0e0', margin: 0 }}>
          🗺️ Resource Map - Live Asset Tracking
        </h1>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button style={buttonStyle}>Layers</button>
          <button style={buttonStyle}>Filters</button>
          <select style={selectStyle}>
            <option>LIVE</option>
            <option>Playback</option>
          </select>
        </div>
      </div>

      {/* Live Vehicle Tracking Section */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#e0e0e0', marginBottom: '1rem' }}>
          Live Vehicle Tracking
        </h2>
        <MapView
          center={[59.3293, 18.0686]}
          zoom={13}
          markers={vehicleMarkers}
          height={500}
        />
      </div>

      {/* Layer Controls */}
      <div style={{
        display: 'flex',
        gap: '1.5rem',
        padding: '1rem',
        background: '#1a1f2e',
        borderRadius: '8px',
        marginBottom: '1rem'
      }}>
        {Object.entries(layers).map(([key, value]) => (
          <label key={key} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#a0aec0',
            cursor: 'pointer',
            fontSize: '0.9rem'
          }}>
            <input
              type="checkbox"
              checked={value}
              onChange={() => toggleLayer(key)}
            />
            <span>{value ? '✓' : '☐'} {key.charAt(0).toUpperCase() + key.slice(1)}</span>
          </label>
        ))}
      </div>

      {/* Map Container */}
      <div style={{
        flex: 1,
        background: '#1a1f2e',
        border: '2px solid #2d3748',
        borderRadius: '12px',
        overflow: 'hidden'
      }}>
        <DashboardMap
          assets={layers.assets ? assets : []}
          bases={layers.bases ? bases : []}
          missions={layers.missions ? missions : []}
          inventory={inventory}
          baseWeather={baseWeather}
          loadBaseWeather={loadBaseWeather}
          setSelectedAsset={setSelectedAsset}
        />
      </div>

      {/* Asset Detail Modal */}
      {selectedAsset && (
        <AssetDetailModal
          asset={selectedAsset}
          onClose={() => setSelectedAsset(null)}
        />
      )}
    </div>
  )
}

const buttonStyle = {
  padding: '0.6rem 1.2rem',
  background: '#2d3748',
  color: '#e0e0e0',
  border: '1px solid #4a5568',
  borderRadius: '6px',
  cursor: 'pointer',
  transition: 'all 0.2s'
}

const selectStyle = {
  padding: '0.6rem 1rem',
  background: '#2d3748',
  color: '#e0e0e0',
  border: '1px solid #4a5568',
  borderRadius: '6px',
  cursor: 'pointer'
}