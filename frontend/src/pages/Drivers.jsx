// frontend/src/pages/Drivers.jsx
import React, { useState, useEffect } from 'react'
import { api } from '../lib/api'

const STATUS_COLORS = {
  active: '#4CAF50',
  on_leave: '#FF9800',
  inactive: '#9E9E9E'
}

export default function Drivers() {
  const [drivers, setDrivers] = useState([])
  const [facilities, setFacilities] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDriver, setSelectedDriver] = useState(null)
  const [statusFilter, setStatusFilter] = useState('active')

  useEffect(() => {
    loadData()
  }, [statusFilter])

  const loadData = async () => {
    try {
      setLoading(true)
      const [driversData, facilitiesData] = await Promise.all([
        api.get(`/api/drivers${statusFilter !== 'all' ? `?employment_status=${statusFilter}` : ''}`),
        api.get('/api/facilities')
      ])
      setDrivers(driversData)
      setFacilities(facilitiesData)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getFacilityName = (facilityId) => {
    const facility = facilities.find(f => f.id === facilityId)
    return facility ? facility.name : 'N/A'
  }

  const isLicenseExpiringSoon = (expiryDate) => {
    if (!expiryDate) return false
    const expiry = new Date(expiryDate)
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
    return expiry <= thirtyDaysFromNow
  }

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
            👷 Driver Management
          </h1>
          <p style={{ margin: '0.5rem 0 0 0', color: 'var(--dark-gray)' }}>
            Manage driver profiles, certifications, and assignments
          </p>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        background: 'white',
        padding: '1.5rem',
        borderRadius: '12px',
        marginBottom: '1.5rem',
        boxShadow: '0 2px 8px rgba(45, 62, 80, 0.08)'
      }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['all', 'active', 'on_leave', 'inactive'].map(status => (
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
                fontWeight: 500,
                textTransform: 'capitalize'
              }}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Drivers Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray)' }}>
          Loading drivers...
        </div>
      ) : drivers.length === 0 ? (
        <div style={{
          background: 'white',
          padding: '3rem',
          borderRadius: '12px',
          textAlign: 'center',
          color: 'var(--gray)'
        }}>
          No drivers found
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
                <th style={{ padding: '1rem', textAlign: 'left', color: 'white', fontWeight: 600 }}>Name</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: 'white', fontWeight: 600 }}>Employee #</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: 'white', fontWeight: 600 }}>License</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: 'white', fontWeight: 600 }}>Home Facility</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: 'white', fontWeight: 600 }}>Certifications</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: 'white', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: 'white', fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((driver, index) => (
                <tr
                  key={driver.id}
                  style={{
                    borderBottom: '1px solid var(--light-gray)',
                    background: index % 2 === 0 ? 'white' : 'var(--off-white)',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(74, 144, 226, 0.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = index % 2 === 0 ? 'white' : 'var(--off-white)'}
                >
                  <td style={{ padding: '1rem', color: 'var(--charcoal)' }}>
                    <div style={{ fontWeight: 600 }}>{driver.first_name} {driver.last_name}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--gray)' }}>{driver.email}</div>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--dark-gray)' }}>
                    {driver.employee_number || 'N/A'}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ color: 'var(--dark-gray)' }}>
                      {driver.license_type}
                    </div>
                    <div style={{
                      fontSize: '0.85rem',
                      color: isLicenseExpiringSoon(driver.license_expiry) ? 'var(--error)' : 'var(--gray)'
                    }}>
                      {isLicenseExpiringSoon(driver.license_expiry) && '⚠️ '}
                      Expires: {new Date(driver.license_expiry).toLocaleDateString()}
                    </div>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--dark-gray)' }}>
                    {getFacilityName(driver.home_facility_id)}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {driver.adr_certified && (
                        <span style={{
                          padding: '0.25rem 0.5rem',
                          background: 'var(--warning)',
                          color: 'white',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 600
                        }}>
                          ADR
                        </span>
                      )}
                      {driver.forklift_certified && (
                        <span style={{
                          padding: '0.25rem 0.5rem',
                          background: 'var(--info)',
                          color: 'white',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 600
                        }}>
                          Forklift
                        </span>
                      )}
                      {!driver.adr_certified && !driver.forklift_certified && (
                        <span style={{ color: 'var(--gray)', fontSize: '0.85rem' }}>None</span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.4rem 0.8rem',
                      background: STATUS_COLORS[driver.employment_status] || 'var(--gray)',
                      color: 'white',
                      borderRadius: '6px',
                      fontSize: '0.85rem',
                      fontWeight: 600
                    }}>
                      {driver.employment_status.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <button
                      onClick={() => setSelectedDriver(driver)}
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
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Driver Detail Modal */}
      {selectedDriver && (
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
          onClick={() => setSelectedDriver(null)}
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
              {selectedDriver.first_name} {selectedDriver.last_name}
            </h2>
            <div style={{ fontSize: '0.95rem', lineHeight: '1.8', color: 'var(--dark-gray)' }}>
              <p><strong>Employee Number:</strong> {selectedDriver.employee_number || 'N/A'}</p>
              <p><strong>Email:</strong> {selectedDriver.email}</p>
              <p><strong>Phone:</strong> {selectedDriver.phone}</p>
              <p><strong>License:</strong> {selectedDriver.license_type} (#{selectedDriver.license_number})</p>
              <p><strong>License Expiry:</strong> {new Date(selectedDriver.license_expiry).toLocaleDateString()}</p>
              {selectedDriver.adr_certified && (
                <p><strong>ADR Certification:</strong> Expires {new Date(selectedDriver.adr_expiry).toLocaleDateString()}</p>
              )}
              <p><strong>Home Facility:</strong> {getFacilityName(selectedDriver.home_facility_id)}</p>
              <p><strong>Role:</strong> {selectedDriver.role}</p>
              <p><strong>Employment Status:</strong> <span style={{
                padding: '0.25rem 0.5rem',
                background: STATUS_COLORS[selectedDriver.employment_status],
                color: 'white',
                borderRadius: '4px'
              }}>{selectedDriver.employment_status}</span></p>
              {selectedDriver.emergency_contact_name && (
                <>
                  <p><strong>Emergency Contact:</strong> {selectedDriver.emergency_contact_name}</p>
                  <p><strong>Emergency Phone:</strong> {selectedDriver.emergency_contact_phone}</p>
                </>
              )}
            </div>
            <button
              onClick={() => setSelectedDriver(null)}
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
