// frontend/src/pages/Resources.jsx
import React, { useState, useEffect } from 'react'
import { api } from '../lib/api'

const RESOURCE_STATUS_COLORS = {
  available: '#4CAF50',
  reserved: '#FFC107',
  deployed: '#FF9800',
  maintenance: '#F44336',
  decommissioned: '#9E9E9E'
}

const RESOURCE_STATUS_LABELS = {
  available: 'Available',
  reserved: 'Reserved',
  deployed: 'Deployed',
  maintenance: 'Maintenance',
  decommissioned: 'Decommissioned'
}

export default function Resources() {
  const [resources, setResources] = useState([])
  const [facilities, setFacilities] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedResource, setSelectedResource] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [resourcesData, facilitiesData] = await Promise.all([
        api.get('/api/assets'),
        api.get('/api/facilities')
      ])
      setResources(resourcesData)
      setFacilities(facilitiesData)
    } catch (error) {
      console.error('Failed to load data:', error)
      setResources([])
      setFacilities([])
    } finally {
      setLoading(false)
    }
  }

  const getFacilityName = (facilityId) => {
    const facility = facilities.find(f => f.id === facilityId)
    return facility ? facility.name : 'Unknown'
  }

  const getResourceStatus = (resource) => {
    // Map asset status to resource classification
    if (resource.status === 'parked' || resource.status === 'idle') return 'available'
    if (resource.status === 'active' || resource.status === 'moving') return 'deployed'
    if (resource.status === 'maintenance') return 'maintenance'
    return 'available'
  }

  const calculateResponseTime = (resource) => {
    // Simple estimation based on status
    const status = getResourceStatus(resource)
    if (status === 'available') return '< 15 min'
    if (status === 'reserved') return '< 30 min'
    if (status === 'deployed') return 'On mission'
    return 'N/A'
  }

  const filteredResources = resources.filter(r => {
    const matchesStatus = statusFilter === 'all' || getResourceStatus(r) === statusFilter
    const matchesType = typeFilter === 'all' || r.type === typeFilter
    return matchesStatus && matchesType
  })

  const resourceTypes = [...new Set(resources.map(r => r.type))].filter(Boolean)

  const statusSummary = resources.reduce((acc, r) => {
    const status = getResourceStatus(r)
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {})

  return (
    <div style={{ padding: '2rem' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <div>
          <h1 style={{ margin: 0, color: 'var(--charcoal)', fontSize: '1.75rem', fontWeight: 600 }}>
            🛡️ Resource Classification
          </h1>
          <p style={{ margin: '0.5rem 0 0 0', color: 'var(--dark-gray)' }}>
            Civil contingency resource status and readiness management
          </p>
        </div>
      </div>

      {/* Status Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        {Object.entries(RESOURCE_STATUS_LABELS).map(([status, label]) => (
          <div
            key={status}
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 2px 8px rgba(45, 62, 80, 0.08)',
              borderTop: `4px solid ${RESOURCE_STATUS_COLORS[status]}`
            }}
          >
            <div style={{ fontSize: '0.85rem', color: 'var(--dark-gray)', marginBottom: '0.5rem', fontWeight: 600 }}>
              {label}
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: RESOURCE_STATUS_COLORS[status] }}>
              {statusSummary[status] || 0}
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{
        background: 'white',
        padding: '1.5rem',
        borderRadius: '12px',
        marginBottom: '1.5rem',
        boxShadow: '0 2px 8px rgba(45, 62, 80, 0.08)'
      }}>
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontWeight: 600, color: 'var(--dark-gray)', marginBottom: '0.5rem' }}>Filter by Status:</div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setStatusFilter('all')}
              style={{
                padding: '0.5rem 1rem',
                background: statusFilter === 'all' ? 'var(--nordic-blue-primary)' : 'white',
                color: statusFilter === 'all' ? 'white' : 'var(--dark-gray)',
                border: `2px solid ${statusFilter === 'all' ? 'var(--nordic-blue-primary)' : 'var(--light-gray)'}`,
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 500
              }}
            >
              All
            </button>
            {Object.entries(RESOURCE_STATUS_LABELS).map(([status, label]) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                style={{
                  padding: '0.5rem 1rem',
                  background: statusFilter === status ? 'var(--nordic-blue-primary)' : 'white',
                  color: statusFilter === status ? 'white' : 'var(--dark-gray)',
                  border: `2px solid ${statusFilter === status ? 'var(--nordic-blue-primary)' : 'var(--light-gray)'}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 500
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        {resourceTypes.length > 0 && (
          <div>
            <div style={{ fontWeight: 600, color: 'var(--dark-gray)', marginBottom: '0.5rem' }}>Filter by Type:</div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => setTypeFilter('all')}
                style={{
                  padding: '0.5rem 1rem',
                  background: typeFilter === 'all' ? 'var(--nordic-blue-primary)' : 'white',
                  color: typeFilter === 'all' ? 'white' : 'var(--dark-gray)',
                  border: `2px solid ${typeFilter === 'all' ? 'var(--nordic-blue-primary)' : 'var(--light-gray)'}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  textTransform: 'capitalize'
                }}
              >
                All Types
              </button>
              {resourceTypes.map(type => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  style={{
                    padding: '0.5rem 1rem',
                    background: typeFilter === type ? 'var(--nordic-blue-primary)' : 'white',
                    color: typeFilter === type ? 'white' : 'var(--dark-gray)',
                    border: `2px solid ${typeFilter === type ? 'var(--nordic-blue-primary)' : 'var(--light-gray)'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    textTransform: 'capitalize'
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Resources Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray)' }}>
          Loading resources...
        </div>
      ) : filteredResources.length === 0 ? (
        <div style={{
          background: 'white',
          padding: '3rem',
          borderRadius: '12px',
          textAlign: 'center',
          color: 'var(--gray)'
        }}>
          No resources found matching filters
        </div>
      ) : (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(45, 62, 80, 0.08)'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(135deg, var(--nordic-blue-primary), var(--nordic-blue-accent))' }}>
                <th style={{ padding: '1rem', textAlign: 'left', color: 'white', fontWeight: 600 }}>Resource ID</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: 'white', fontWeight: 600 }}>Type</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: 'white', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: 'white', fontWeight: 600 }}>Location</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: 'white', fontWeight: 600 }}>Response Time</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: 'white', fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredResources.map((resource, index) => {
                const status = getResourceStatus(resource)
                return (
                  <tr
                    key={resource.id}
                    style={{
                      borderBottom: '1px solid var(--light-gray)',
                      background: index % 2 === 0 ? 'white' : 'var(--off-white)',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(74, 144, 226, 0.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = index % 2 === 0 ? 'white' : 'var(--off-white)'}
                  >
                    <td style={{ padding: '1rem', color: 'var(--charcoal)', fontWeight: 600 }}>
                      {resource.registration_number || resource.id}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--dark-gray)', textTransform: 'capitalize' }}>
                      {resource.type}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.4rem 0.8rem',
                        background: RESOURCE_STATUS_COLORS[status],
                        color: 'white',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        fontWeight: 600
                      }}>
                        {RESOURCE_STATUS_LABELS[status]}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--dark-gray)' }}>
                      {resource.current_base_id ? getFacilityName(resource.current_base_id) : 
                       resource.lat && resource.lon ? `${resource.lat.toFixed(2)}, ${resource.lon.toFixed(2)}` : 'Unknown'}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--dark-gray)', fontWeight: 500 }}>
                      {calculateResponseTime(resource)}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <button
                        onClick={() => setSelectedResource(resource)}
                        style={{
                          padding: '0.5rem 1rem',
                          background: 'var(--nordic-blue-primary)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          fontWeight: 600
                        }}
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Resource Detail Modal */}
      {selectedResource && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setSelectedResource(null)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '2rem',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginTop: 0, color: 'var(--charcoal)' }}>
              Resource: {selectedResource.registration_number || selectedResource.id}
            </h2>
            <div style={{ fontSize: '0.95rem', lineHeight: '1.8', color: 'var(--dark-gray)' }}>
              <p><strong>Type:</strong> {selectedResource.type}</p>
              <p><strong>Status:</strong> <span style={{
                padding: '0.25rem 0.5rem',
                background: RESOURCE_STATUS_COLORS[getResourceStatus(selectedResource)],
                color: 'white',
                borderRadius: '4px'
              }}>{RESOURCE_STATUS_LABELS[getResourceStatus(selectedResource)]}</span></p>
              <p><strong>Response Time Estimate:</strong> {calculateResponseTime(selectedResource)}</p>
              {selectedResource.current_base_id && (
                <p><strong>Current Location:</strong> {getFacilityName(selectedResource.current_base_id)}</p>
              )}
              {selectedResource.make && (
                <p><strong>Make/Model:</strong> {selectedResource.make} {selectedResource.model}</p>
              )}
              {selectedResource.fuel_level !== undefined && (
                <p><strong>Fuel Level:</strong> {selectedResource.fuel_level}%</p>
              )}
            </div>
            <button
              onClick={() => setSelectedResource(null)}
              style={{
                marginTop: '1.5rem',
                padding: '0.75rem 1.5rem',
                background: 'var(--nordic-blue-primary)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
