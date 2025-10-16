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
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [formData, setFormData] = useState({
    id: '',
    type: 'vehicle',
    lat: 59.3293,
    lon: 18.0686,
    route: 'stationary',
    route_index: 0.0,
    speed: 0.0,
    status: 'parked',
    battery: null,
    battery_drain: 0.0,
    has_battery: false,
    fuel_type: 'diesel'
  })
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

  const handleSubmit = (e) => {
    e.preventDefault()

    const assetData = {
      ...formData,
      lat: parseFloat(formData.lat),
      lon: parseFloat(formData.lon),
      route_index: parseFloat(formData.route_index),
      speed: parseFloat(formData.speed),
      battery: formData.has_battery ? parseFloat(formData.battery) : null,
      battery_drain: parseFloat(formData.battery_drain)
    }

    if (editing) {
      api.updateAsset(editing, assetData)
        .then(() => {
          alert('Asset updated!')
          resetForm()
          fetchAssets()
        })
        .catch(err => {
          console.error('Error updating asset:', err)
          alert('Error updating asset: ' + err.message)
        })
    } else {
      api.createAsset(assetData)
        .then(() => {
          alert('Asset created!')
          resetForm()
          fetchAssets()
        })
        .catch(err => {
          console.error('Error creating asset:', err)
          alert('Error creating asset: ' + err.message)
        })
    }
  }

  const handleEdit = (asset) => {
    setFormData({
      id: asset.id,
      type: asset.type,
      lat: asset.lat,
      lon: asset.lon,
      route: asset.route,
      route_index: asset.route_index,
      speed: asset.speed,
      status: asset.status,
      battery: asset.battery,
      battery_drain: asset.battery_drain,
      has_battery: asset.has_battery,
      fuel_type: asset.fuel_type
    })
    setEditing(asset.id)
    setShowForm(true)
  }

  const handleDelete = (assetId) => {
    if (!confirm(`Are you sure you want to delete asset ${assetId}?`)) return

    api.deleteAsset(assetId)
      .then(() => {
        alert('Asset deleted!')
        fetchAssets()
      })
      .catch(err => {
        console.error('Error deleting asset:', err)
        alert('Error deleting asset: ' + err.message)
      })
  }

  const resetForm = () => {
    setFormData({
      id: '',
      type: 'vehicle',
      lat: 59.3293,
      lon: 18.0686,
      route: 'stationary',
      route_index: 0.0,
      speed: 0.0,
      status: 'parked',
      battery: null,
      battery_drain: 0.0,
      has_battery: false,
      fuel_type: 'diesel'
    })
    setEditing(null)
    setShowForm(false)
  }

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ margin: 0 }}>Tillgångshantering</h3>
        <button
          className='btn'
          onClick={() => setShowForm(!showForm)}
          style={{ background: showForm ? '#666' : '#3aa86f' }}
        >
          {showForm ? '✖ Stäng Formulär' : '➕ Skapa Ny Tillgång'}
        </button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className='card' style={{ marginBottom: 16, background: '#1a1a1a', border: '2px solid #3aa86f' }}>
          <h4 style={{ marginTop: 0 }}>
            {editing ? `Redigera Tillgång: ${editing}` : 'Skapa Ny Tillgång'}
          </h4>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ fontSize: 12, color: '#999', display: 'block', marginBottom: 4 }}>
                  Tillgångs ID *
                </label>
                <input
                  type='text'
                  required
                  disabled={editing !== null}
                  value={formData.id}
                  onChange={e => setFormData({ ...formData, id: e.target.value })}
                  placeholder='asset-vehicle-01'
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    background: '#222',
                    border: '1px solid #333',
                    borderRadius: 4,
                    color: '#fff'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, color: '#999', display: 'block', marginBottom: 4 }}>
                  Typ *
                </label>
                <select
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    background: '#222',
                    border: '1px solid #333',
                    borderRadius: 4,
                    color: '#fff'
                  }}
                >
                  {ASSET_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: 12, color: '#999', display: 'block', marginBottom: 4 }}>
                  Latitud *
                </label>
                <input
                  type='number'
                  required
                  step='0.000001'
                  value={formData.lat}
                  onChange={e => setFormData({ ...formData, lat: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    background: '#222',
                    border: '1px solid #333',
                    borderRadius: 4,
                    color: '#fff'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, color: '#999', display: 'block', marginBottom: 4 }}>
                  Longitud *
                </label>
                <input
                  type='number'
                  required
                  step='0.000001'
                  value={formData.lon}
                  onChange={e => setFormData({ ...formData, lon: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    background: '#222',
                    border: '1px solid #333',
                    borderRadius: 4,
                    color: '#fff'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, color: '#999', display: 'block', marginBottom: 4 }}>
                  Status *
                </label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    background: '#222',
                    border: '1px solid #333',
                    borderRadius: 4,
                    color: '#fff'
                  }}
                >
                  {STATUS_TYPES.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: 12, color: '#999', display: 'block', marginBottom: 4 }}>
                  Bränsletyp *
                </label>
                <select
                  value={formData.fuel_type}
                  onChange={e => setFormData({ ...formData, fuel_type: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    background: '#222',
                    border: '1px solid #333',
                    borderRadius: 4,
                    color: '#fff'
                  }}
                >
                  {FUEL_TYPES.map(fuel => (
                    <option key={fuel} value={fuel}>{fuel}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: 12, color: '#999', display: 'block', marginBottom: 4 }}>
                  Hastighet (km/h)
                </label>
                <input
                  type='number'
                  step='0.1'
                  value={formData.speed}
                  onChange={e => setFormData({ ...formData, speed: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    background: '#222',
                    border: '1px solid #333',
                    borderRadius: 4,
                    color: '#fff'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, color: '#999', display: 'block', marginBottom: 4 }}>
                  <input
                    type='checkbox'
                    checked={formData.has_battery}
                    onChange={e => setFormData({ ...formData, has_battery: e.target.checked, battery: e.target.checked ? 100 : null })}
                    style={{ marginRight: 6 }}
                  />
                  Har Batteri
                </label>
                {formData.has_battery && (
                  <input
                    type='number'
                    min='0'
                    max='100'
                    value={formData.battery || 100}
                    onChange={e => setFormData({ ...formData, battery: e.target.value })}
                    placeholder='Batterinivå (%)'
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      background: '#222',
                      border: '1px solid #333',
                      borderRadius: 4,
                      color: '#fff',
                      marginTop: 8
                    }}
                  />
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button type='submit' className='btn' style={{ background: '#3aa86f' }}>
                {editing ? 'Uppdatera Tillgång' : 'Skapa Tillgång'}
              </button>
              <button type='button' className='btn' onClick={resetForm}>
                Avbryt
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Statistics */}
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
            <div style={{ fontSize: 11, color: '#999' }}>Kritiskt Batteri</div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className='card' style={{ marginBottom: 16 }}>
        <h4 style={{ marginTop: 0, marginBottom: 12 }}>Filter</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          <select
            value={filter.type}
            onChange={e => setFilter({ ...filter, type: e.target.value })}
            style={{ padding: '8px 12px', background: '#222', border: '1px solid #333', borderRadius: 4, color: '#fff' }}
          >
            <option value='all'>Alla Typer</option>
            {ASSET_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
          </select>

          <select
            value={filter.fuelType}
            onChange={e => setFilter({ ...filter, fuelType: e.target.value })}
            style={{ padding: '8px 12px', background: '#222', border: '1px solid #333', borderRadius: 4, color: '#fff' }}
          >
            <option value='all'>Alla Bränsletyper</option>
            {FUEL_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
          </select>

          <select
            value={filter.status}
            onChange={e => setFilter({ ...filter, status: e.target.value })}
            style={{ padding: '8px 12px', background: '#222', border: '1px solid #333', borderRadius: 4, color: '#fff' }}
          >
            <option value='all'>Alla Status</option>
            {STATUS_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
          </select>

          <button
            className='btn'
            onClick={() => setFilter({ type: 'all', fuelType: 'all', status: 'all', battery: 'all' })}
            style={{ fontSize: 12 }}
          >
            Rensa Filter
          </button>
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
                  <th style={{ textAlign: 'center', padding: 8, color: '#999' }}>Åtgärder</th>
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
                      <td style={{ padding: 8, fontSize: 11 }}>
                        {asset.fuel_type}
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
                      <td style={{ padding: 8, textAlign: 'center' }}>
                        <button
                          className='btn'
                          onClick={() => handleEdit(asset)}
                          style={{ fontSize: 11, padding: '4px 8px', marginRight: 4 }}
                        >
                          Redigera
                        </button>
                        <button
                          className='btn'
                          onClick={() => handleDelete(asset.id)}
                          style={{ fontSize: 11, padding: '4px 8px', background: '#b5392f' }}
                        >
                          Radera
                        </button>
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
