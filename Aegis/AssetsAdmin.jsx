import React, { useState, useEffect } from 'react'
import { api } from '../lib/api'

const ASSET_TYPES = ['vehicle', 'uav', 'truck', 'helicopter', 'plane']
const FUEL_TYPES = ['electric', 'diesel', 'aviation', 'jet', 'gasoline']
const STATUS_TYPES = ['mobile', 'parked', 'airborne']

const TYPE_COLORS = {
  vehicle: '#4a90e2',
  uav: '#9c27b0',
  truck: '#d9b945',
  helicopter: '#ff9800',
  plane: '#e24a4a'
}

const STATUS_COLORS = {
  mobile: '#3aa86f',
  parked: '#999',
  airborne: '#4a90e2'
}

export default function AssetsAdmin() {
  const [assets, setAssets] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({
    type: 'all',
    fuelType: 'all',
    status: 'all',
    battery: 'all'
  })

  useEffect(() => {
    fetchAssets()
    const interval = setInterval(fetchAssets, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchAssets = () => {
    api.assets()
      .then(data => {
        setAssets(data || [])
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching assets:', err)
        setLoading(false)
      })
  }

  // Filter assets
  const filteredAssets = assets.filter(asset => {
    if (filter.type !== 'all' && asset.type !== filter.type) return false
    if (filter.fuelType !== 'all' && asset.fuel_type !== filter.fuelType) return false
    if (filter.status !== 'all' && asset.status !== filter.status) return false
    if (filter.battery !== 'all') {
      if (!asset.has_battery) return false
      const battery = asset.battery || 0
      if (filter.battery === 'critical' && battery > 15) return false
      if (filter.battery === 'low' && (battery <= 15 || battery > 30)) return false
      if (filter.battery === 'good' && battery <= 30) return false
    }
    return true
  })

  // Statistics
  const stats = {
    total: assets.length,
    mobile: assets.filter(a => a.status === 'mobile').length,
    parked: assets.filter(a => a.status === 'parked').length,
    airborne: assets.filter(a => a.status === 'airborne').length,
    battery: assets.filter(a => a.has_battery).length,
    lowBattery: assets.filter(a => a.has_battery && a.battery <= 30).length,
    criticalBattery: assets.filter(a => a.has_battery && a.battery <= 15).length
  }

  const typeStats = {}
  ASSET_TYPES.forEach(type => {
    typeStats[type] = assets.filter(a => a.type === type).length
  })

  if (loading) {
    return <div style={{ padding: 12, background: '#d9b945', color: '#000' }}>Laddar tillgångar...</div>
  }

  return (
    <div>
      <h3>Tillgångshantering</h3>
      
      <div style={{ 
        background: '#1a1a1a', 
        border: '1px solid #d9b945', 
        borderRadius: 8, 
        padding: 12, 
        marginBottom: 16 
      }}>
        <div style={{ fontSize: 13, color: '#d9b945', marginBottom: 8 }}>
          ⚠️ <strong>Skrivskyddad Vy</strong>
        </div>
        <div style={{ fontSize: 12, color: '#999' }}>
          Tillgångar är för närvarande hårdkodade i backend. Fullständig CRUD-funktionalitet kommer snart.
        </div>
      </div>

      {/* Statistics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: 12,
        marginBottom: 16
      }}>
        <div className='card' style={{ background: '#1a1a1a', border: '1px solid #333' }}>
          <div style={{ fontSize: 24, fontWeight: 'bold', color: '#4a90e2' }}>
            {stats.total}
          </div>
          <div style={{ fontSize: 11, color: '#999' }}>Totalt Tillgångar</div>
        </div>

        <div className='card' style={{ background: '#1a1a1a', border: '1px solid #333' }}>
          <div style={{ fontSize: 24, fontWeight: 'bold', color: STATUS_COLORS.mobile }}>
            {stats.mobile}
          </div>
          <div style={{ fontSize: 11, color: '#999' }}>Mobile</div>
        </div>

        <div className='card' style={{ background: '#1a1a1a', border: '1px solid #333' }}>
          <div style={{ fontSize: 24, fontWeight: 'bold', color: STATUS_COLORS.parked }}>
            {stats.parked}
          </div>
          <div style={{ fontSize: 11, color: '#999' }}>Parkerad</div>
        </div>

        <div className='card' style={{ background: '#1a1a1a', border: '1px solid #333' }}>
          <div style={{ fontSize: 24, fontWeight: 'bold', color: STATUS_COLORS.airborne }}>
            {stats.airborne}
          </div>
          <div style={{ fontSize: 11, color: '#999' }}>Luftburen</div>
        </div>

        {stats.criticalBattery > 0 && (
          <div className='card' style={{ background: '#1a1a1a', border: '1px solid #b5392f' }}>
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#b5392f' }}>
              {stats.criticalBattery}
            </div>
            <div style={{ fontSize: 11, color: '#999' }}>Kritiskt Batteri (≤15%)</div>
          </div>
        )}

        {stats.lowBattery > 0 && (
          <div className='card' style={{ background: '#1a1a1a', border: '1px solid #ff9800' }}>
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#ff9800' }}>
              {stats.lowBattery}
            </div>
            <div style={{ fontSize: 11, color: '#999' }}>Lågt Batteri (≤30%)</div>
          </div>
        )}
      </div>

      {/* Type Statistics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: 12,
        marginBottom: 16
      }}>
        {ASSET_TYPES.map(type => {
          const count = typeStats[type]
          if (count === 0) return null
          return (
            <div key={type} className='card' style={{ background: '#1a1a1a', border: '1px solid #333' }}>
              <div style={{ fontSize: 20, fontWeight: 'bold', color: TYPE_COLORS[type] }}>
                {count}
              </div>
              <div style={{ fontSize: 11, color: '#999', textTransform: 'capitalize' }}>{type}</div>
            </div>
          )
        })}
      </div>

      {/* Filters */}
      <div className='card' style={{ marginBottom: 16 }}>
        <h4 style={{ marginTop: 0, marginBottom: 12 }}>Filter</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, color: '#999', display: 'block', marginBottom: 4 }}>
              Typ
            </label>
            <select
              value={filter.type}
              onChange={e => setFilter({ ...filter, type: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                background: '#222',
                border: '1px solid #333',
                borderRadius: 4,
                color: '#fff'
              }}
            >
              <option value='all'>Alla Typer</option>
              {ASSET_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: 12, color: '#999', display: 'block', marginBottom: 4 }}>
              Bränsletyp
            </label>
            <select
              value={filter.fuelType}
              onChange={e => setFilter({ ...filter, fuelType: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                background: '#222',
                border: '1px solid #333',
                borderRadius: 4,
                color: '#fff'
              }}
            >
              <option value='all'>Alla Bränsletyper</option>
              {FUEL_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: 12, color: '#999', display: 'block', marginBottom: 4 }}>
              Status
            </label>
            <select
              value={filter.status}
              onChange={e => setFilter({ ...filter, status: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                background: '#222',
                border: '1px solid #333',
                borderRadius: 4,
                color: '#fff'
              }}
            >
              <option value='all'>Alla Status</option>
              {STATUS_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: 12, color: '#999', display: 'block', marginBottom: 4 }}>
              Batterinivå
            </label>
            <select
              value={filter.battery}
              onChange={e => setFilter({ ...filter, battery: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                background: '#222',
                border: '1px solid #333',
                borderRadius: 4,
                color: '#fff'
              }}
            >
              <option value='all'>Alla Nivåer</option>
              <option value='critical'>Kritiskt (≤15%)</option>
              <option value='low'>Lågt (16-30%)</option>
              <option value='good'>Bra (>30%)</option>
            </select>
          </div>
        </div>

        <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
          <button
            className='btn'
            onClick={() => setFilter({ type: 'all', fuelType: 'all', status: 'all', battery: 'all' })}
            style={{ fontSize: 12, padding: '6px 12px' }}
          >
            Rensa Filter
          </button>
          <div style={{ fontSize: 12, color: '#999', display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
            Visar {filteredAssets.length} av {assets.length} tillgångar
          </div>
        </div>
      </div>

      {/* Assets Table */}
      <div className='card'>
        <h4 style={{ marginTop: 0 }}>Alla Tillgångar ({filteredAssets.length})</h4>
        {filteredAssets.length === 0 ? (
          <div style={{ padding: 20, textAlign: 'center', color: '#999' }}>
            Inga tillgångar matchar de valda filtren.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #333' }}>
                  <th style={{ textAlign: 'left', padding: 8, color: '#999' }}>Typ</th>
                  <th style={{ textAlign: 'left', padding: 8, color: '#999' }}>ID</th>
                  <th style={{ textAlign: 'center', padding: 8, color: '#999' }}>Status</th>
                  <th style={{ textAlign: 'left', padding: 8, color: '#999' }}>Bränsle</th>
                  <th style={{ textAlign: 'center', padding: 8, color: '#999' }}>Batteri</th>
                  <th style={{ textAlign: 'right', padding: 8, color: '#999' }}>Position</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssets.map(asset => {
                  const batteryColor = asset.has_battery && asset.battery !== null
                    ? asset.battery <= 15 ? '#b5392f'
                      : asset.battery <= 30 ? '#ff9800'
                        : asset.battery <= 50 ? '#d9b945'
                          : '#3aa86f'
                    : '#666'

                  return (
                    <tr key={asset.id} style={{ borderBottom: '1px solid #333' }}>
                      <td style={{ padding: 8 }}>
                        <span style={{
                          display: 'inline-block',
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          background: TYPE_COLORS[asset.type] || '#666',
                          marginRight: 6
                        }} />
                        {asset.type}
                      </td>
                      <td style={{ padding: 8, fontFamily: 'monospace', fontSize: 11 }}>
                        {asset.id}
                      </td>
                      <td style={{ padding: 8, textAlign: 'center' }}>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: 4,
                          background: STATUS_COLORS[asset.status] || '#666',
                          color: '#fff',
                          fontSize: 11
                        }}>
                          {asset.status}
                        </span>
                      </td>
                      <td style={{ padding: 8 }}>
                        <span style={{ fontSize: 11 }}>
                          {asset.fuel_type}
                        </span>
                      </td>
                      <td style={{ padding: 8, textAlign: 'center' }}>
                        {asset.has_battery && asset.battery !== null ? (
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: 4,
                            background: batteryColor,
                            color: '#fff',
                            fontSize: 11,
                            fontWeight: 'bold'
                          }}>
                            🔋 {asset.battery.toFixed(0)}%
                          </span>
                        ) : (
                          <span style={{ color: '#666', fontSize: 11 }}>N/A</span>
                        )}
                      </td>
                      <td style={{ padding: 8, textAlign: 'right', fontFamily: 'monospace', fontSize: 11 }}>
                        {asset.lat.toFixed(4)}, {asset.lon.toFixed(4)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
