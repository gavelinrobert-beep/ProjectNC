import React, { useState, useEffect } from 'react'
import { api } from '../lib/api'

const BASE_TYPES = ['military', 'airfield', 'logistics', 'storage']

const BASE_COLORS = {
  military: '#b5392f',
  airfield: '#4a90e2',
  logistics: '#d9b945',
  storage: '#9c27b0'
}

export default function BasesAdmin() {
  const [bases, setBases] = useState([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    type: 'storage',
    lat: 59.3293,
    lon: 18.0686,
    capacity: 50,
    description: ''
  })
  const [editing, setEditing] = useState(null)

  useEffect(() => {
    fetchBases()
  }, [])

  const fetchBases = () => {
    api.bases()
      .then(data => {
        setBases(data || [])
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching bases:', err)
        setLoading(false)
      })
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const baseData = {
      ...formData,
      lat: parseFloat(formData.lat),
      lon: parseFloat(formData.lon),
      capacity: parseInt(formData.capacity)
    }

    if (editing) {
      // Note: Update not implemented in backend yet
      alert('Update functionality not available yet')
    } else {
      // Create new base using api helper with auth
      api.createBase(baseData)
        .then(() => {
          alert('Base created!')
          resetForm()
          fetchBases()
        })
        .catch(err => {
          console.error('Error creating base:', err)
          alert('Error creating base: ' + err.message)
        })
    }
  }

  const handleEdit = (base) => {
    setFormData({
      id: base.id,
      name: base.name,
      type: base.type,
      lat: base.lat,
      lon: base.lon,
      capacity: base.capacity,
      description: base.description || ''
    })
    setEditing(base.id)
  }

  const handleDelete = (baseId) => {
    if (!confirm(`Are you sure you want to delete base ${baseId}?`)) return

    // Use api helper with auth
    api.deleteBase(baseId)
      .then(() => {
        alert('Base deleted!')
        fetchBases()
      })
      .catch(err => {
        console.error('Error deleting base:', err)
        alert('Error deleting base: ' + err.message)
      })
  }

  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      type: 'storage',
      lat: 59.3293,
      lon: 18.0686,
      capacity: 50,
      description: ''
    })
    setEditing(null)
  }

  if (loading) {
    return <div style={{ padding: 12, background: '#d9b945', color: '#000' }}>Laddar baser...</div>
  }

  return (
    <div>
      <h3>Bashantering</h3>

      {/* Statistics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: 12,
        marginBottom: 16
      }}>
        <div className='card' style={{ background: '#1a1a1a', border: '1px solid #333' }}>
          <div style={{ fontSize: 24, fontWeight: 'bold', color: '#4a90e2' }}>
            {bases.length}
          </div>
          <div style={{ fontSize: 11, color: '#999' }}>Totalt Baser</div>
        </div>

        {BASE_TYPES.map(type => {
          const count = bases.filter(b => b.type === type).length
          if (count === 0) return null
          return (
            <div key={type} className='card' style={{ background: '#1a1a1a', border: '1px solid #333' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: BASE_COLORS[type] }}>
                {count}
              </div>
              <div style={{ fontSize: 11, color: '#999', textTransform: 'capitalize' }}>{type}</div>
            </div>
          )
        })}
      </div>

      {/* Form */}
      <div className='card' style={{ marginBottom: 16 }}>
        <h4 style={{ marginTop: 0 }}>
          {editing ? `Redigera Bas: ${editing}` : 'Skapa Ny Bas'}
        </h4>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: '#999', display: 'block', marginBottom: 4 }}>
                Bas ID *
              </label>
              <input
                type='text'
                required
                disabled={editing !== null}
                value={formData.id}
                onChange={e => setFormData({ ...formData, id: e.target.value })}
                placeholder='base-stockholm-01'
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
                Namn *
              </label>
              <input
                type='text'
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder='Stockholm Base 01'
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
                {BASE_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: 12, color: '#999', display: 'block', marginBottom: 4 }}>
                Kapacitet *
              </label>
              <input
                type='number'
                required
                value={formData.capacity}
                onChange={e => setFormData({ ...formData, capacity: e.target.value })}
                min='1'
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
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, color: '#999', display: 'block', marginBottom: 4 }}>
              Beskrivning
            </label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder='Optional description...'
              rows={3}
              style={{
                width: '100%',
                padding: '8px 12px',
                background: '#222',
                border: '1px solid #333',
                borderRadius: 4,
                color: '#fff',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button type='submit' className='btn' style={{ background: '#3aa86f' }}>
              {editing ? 'Uppdatera Bas' : 'Skapa Bas'}
            </button>
            {editing && (
              <button type='button' className='btn' onClick={resetForm}>
                Avbryt
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Bases List */}
      <div className='card'>
        <h4 style={{ marginTop: 0 }}>Alla Baser ({bases.length})</h4>
        {bases.length === 0 ? (
          <div style={{ padding: 20, textAlign: 'center', color: '#999' }}>
            Inga baser ännu. Skapa en ovan!
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #333' }}>
                  <th style={{ textAlign: 'left', padding: 8, color: '#999' }}>Typ</th>
                  <th style={{ textAlign: 'left', padding: 8, color: '#999' }}>ID</th>
                  <th style={{ textAlign: 'left', padding: 8, color: '#999' }}>Namn</th>
                  <th style={{ textAlign: 'right', padding: 8, color: '#999' }}>Kapacitet</th>
                  <th style={{ textAlign: 'right', padding: 8, color: '#999' }}>Position</th>
                  <th style={{ textAlign: 'center', padding: 8, color: '#999' }}>Åtgärder</th>
                </tr>
              </thead>
              <tbody>
                {bases.map(base => (
                  <tr key={base.id} style={{ borderBottom: '1px solid #333' }}>
                    <td style={{ padding: 8 }}>
                      <span style={{
                        display: 'inline-block',
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        background: BASE_COLORS[base.type] || '#666',
                        marginRight: 6
                      }} />
                      {base.type}
                    </td>
                    <td style={{ padding: 8, fontFamily: 'monospace', fontSize: 11 }}>
                      {base.id}
                    </td>
                    <td style={{ padding: 8 }}>{base.name}</td>
                    <td style={{ padding: 8, textAlign: 'right' }}>{base.capacity}</td>
                    <td style={{ padding: 8, textAlign: 'right', fontFamily: 'monospace', fontSize: 11 }}>
                      {base.lat.toFixed(4)}, {base.lon.toFixed(4)}
                    </td>
                    <td style={{ padding: 8, textAlign: 'center' }}>
                      <button
                        className='btn'
                        onClick={() => handleEdit(base)}
                        style={{ fontSize: 11, padding: '4px 8px', marginRight: 4 }}
                      >
                        Redigera
                      </button>
                      <button
                        className='btn'
                        onClick={() => handleDelete(base.id)}
                        style={{ fontSize: 11, padding: '4px 8px', background: '#b5392f' }}
                      >
                        Radera
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
