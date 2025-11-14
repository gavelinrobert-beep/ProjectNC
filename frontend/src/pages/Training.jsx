// frontend/src/pages/Training.jsx
import React, { useState, useEffect } from 'react'
import { api } from '../lib/api'

export default function Training() {
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedStaff, setSelectedStaff] = useState(null)
  const [filterExpiring, setFilterExpiring] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      // Use drivers as staff proxy
      const staffData = await api.get('/api/drivers')
      setStaff(staffData)
    } catch (error) {
      console.error('Failed to load data:', error)
      setStaff([])
    } finally {
      setLoading(false)
    }
  }

  const isExpiringSoon = (expiryDate, days = 90) => {
    if (!expiryDate) return false
    const expiry = new Date(expiryDate)
    const threshold = new Date()
    threshold.setDate(threshold.getDate() + days)
    return expiry <= threshold
  }

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false
    return new Date(expiryDate) < new Date()
  }

  const getCertifications = (person) => {
    const certs = []
    if (person.license_number) {
      certs.push({
        name: `Driving License (${person.license_type})`,
        expiry: person.license_expiry,
        type: 'license'
      })
    }
    if (person.adr_certified) {
      certs.push({
        name: 'ADR (Dangerous Goods)',
        expiry: person.adr_expiry,
        type: 'adr'
      })
    }
    if (person.forklift_certified) {
      certs.push({
        name: 'Forklift Operator',
        expiry: null, // Assume no expiry tracked
        type: 'forklift'
      })
    }
    return certs
  }

  const filteredStaff = staff.filter(person => {
    if (!filterExpiring) return true
    const certs = getCertifications(person)
    return certs.some(cert => cert.expiry && isExpiringSoon(cert.expiry, 90))
  })

  const expiringCount = staff.reduce((count, person) => {
    const certs = getCertifications(person)
    const hasExpiring = certs.some(cert => cert.expiry && isExpiringSoon(cert.expiry, 90) && !isExpired(cert.expiry))
    return hasExpiring ? count + 1 : count
  }, 0)

  const expiredCount = staff.reduce((count, person) => {
    const certs = getCertifications(person)
    const hasExpired = certs.some(cert => cert.expiry && isExpired(cert.expiry))
    return hasExpired ? count + 1 : count
  }, 0)

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
            📜 Training & Certifications
          </h1>
          <p style={{ margin: '0.5rem 0 0 0', color: 'var(--dark-gray)' }}>
            Staff qualifications and equipment operator certifications
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 2px 8px rgba(45, 62, 80, 0.08)',
          borderTop: '4px solid var(--nordic-blue-primary)'
        }}>
          <div style={{ fontSize: '0.9rem', color: 'var(--dark-gray)', marginBottom: '0.5rem', fontWeight: 600 }}>
            Total Staff
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--nordic-blue-primary)' }}>
            {staff.length}
          </div>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 2px 8px rgba(45, 62, 80, 0.08)',
          borderTop: '4px solid var(--warning)'
        }}>
          <div style={{ fontSize: '0.9rem', color: 'var(--dark-gray)', marginBottom: '0.5rem', fontWeight: 600 }}>
            ⚠️ Expiring Soon (90 days)
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--warning)' }}>
            {expiringCount}
          </div>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 2px 8px rgba(45, 62, 80, 0.08)',
          borderTop: '4px solid var(--error)'
        }}>
          <div style={{ fontSize: '0.9rem', color: 'var(--dark-gray)', marginBottom: '0.5rem', fontWeight: 600 }}>
            🔴 Expired
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--error)' }}>
            {expiredCount}
          </div>
        </div>
      </div>

      {/* Filter */}
      <div style={{
        background: 'white',
        padding: '1.5rem',
        borderRadius: '12px',
        marginBottom: '1.5rem',
        boxShadow: '0 2px 8px rgba(45, 62, 80, 0.08)'
      }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setFilterExpiring(false)}
            style={{
              padding: '0.5rem 1rem',
              background: !filterExpiring ? 'var(--nordic-blue-primary)' : 'white',
              color: !filterExpiring ? 'white' : 'var(--dark-gray)',
              border: `2px solid ${!filterExpiring ? 'var(--nordic-blue-primary)' : 'var(--light-gray)'}`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 500
            }}
          >
            All Staff
          </button>
          <button
            onClick={() => setFilterExpiring(true)}
            style={{
              padding: '0.5rem 1rem',
              background: filterExpiring ? 'var(--nordic-blue-primary)' : 'white',
              color: filterExpiring ? 'white' : 'var(--dark-gray)',
              border: `2px solid ${filterExpiring ? 'var(--nordic-blue-primary)' : 'var(--light-gray)'}`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 500
            }}
          >
            ⚠️ Expiring Soon
          </button>
        </div>
      </div>

      {/* Staff Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray)' }}>
          Loading staff...
        </div>
      ) : filteredStaff.length === 0 ? (
        <div style={{
          background: 'white',
          padding: '3rem',
          borderRadius: '12px',
          textAlign: 'center',
          color: 'var(--gray)'
        }}>
          No staff found
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
                <th style={{ padding: '1rem', textAlign: 'left', color: 'white', fontWeight: 600 }}>Role</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: 'white', fontWeight: 600 }}>Certifications</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: 'white', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: 'white', fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.map((person, index) => {
                const certs = getCertifications(person)
                const hasExpired = certs.some(cert => cert.expiry && isExpired(cert.expiry))
                const hasExpiring = certs.some(cert => cert.expiry && isExpiringSoon(cert.expiry, 90) && !isExpired(cert.expiry))
                
                return (
                  <tr
                    key={person.id}
                    style={{
                      borderBottom: '1px solid var(--light-gray)',
                      background: index % 2 === 0 ? 'white' : 'var(--off-white)',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(74, 144, 226, 0.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = index % 2 === 0 ? 'white' : 'var(--off-white)'}
                  >
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--charcoal)' }}>
                        {person.first_name} {person.last_name}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--gray)' }}>
                        {person.email}
                      </div>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--dark-gray)', textTransform: 'capitalize' }}>
                      {person.role}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {certs.map((cert, i) => (
                          <span
                            key={i}
                            style={{
                              padding: '0.25rem 0.5rem',
                              background: cert.expiry && isExpired(cert.expiry) ? 'var(--error)' :
                                         cert.expiry && isExpiringSoon(cert.expiry, 90) ? 'var(--warning)' :
                                         'var(--success)',
                              color: 'white',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 600
                            }}
                          >
                            {cert.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {hasExpired ? (
                        <span style={{ color: 'var(--error)', fontWeight: 600 }}>🔴 Expired</span>
                      ) : hasExpiring ? (
                        <span style={{ color: 'var(--warning)', fontWeight: 600 }}>⚠️ Expiring</span>
                      ) : (
                        <span style={{ color: 'var(--success)', fontWeight: 600 }}>✅ Current</span>
                      )}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <button
                        onClick={() => setSelectedStaff(person)}
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
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Staff Detail Modal */}
      {selectedStaff && (
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
          onClick={() => setSelectedStaff(null)}
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
              {selectedStaff.first_name} {selectedStaff.last_name}
            </h2>
            <div style={{ fontSize: '0.95rem', lineHeight: '1.8', color: 'var(--dark-gray)' }}>
              <p><strong>Role:</strong> {selectedStaff.role}</p>
              <p><strong>Employee Number:</strong> {selectedStaff.employee_number || 'N/A'}</p>
              <p><strong>Email:</strong> {selectedStaff.email}</p>
              <p><strong>Phone:</strong> {selectedStaff.phone}</p>
              
              <h3 style={{ marginTop: '1.5rem', color: 'var(--charcoal)' }}>Certifications:</h3>
              {getCertifications(selectedStaff).map((cert, i) => (
                <div key={i} style={{ 
                  padding: '1rem', 
                  background: 'var(--off-white)', 
                  borderRadius: '8px',
                  marginBottom: '0.5rem'
                }}>
                  <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{cert.name}</div>
                  {cert.expiry && (
                    <div style={{ 
                      fontSize: '0.9rem',
                      color: isExpired(cert.expiry) ? 'var(--error)' :
                             isExpiringSoon(cert.expiry, 90) ? 'var(--warning)' :
                             'var(--success)'
                    }}>
                      {isExpired(cert.expiry) ? '🔴 Expired: ' :
                       isExpiringSoon(cert.expiry, 90) ? '⚠️ Expires: ' :
                       '✅ Valid until: '}
                      {new Date(cert.expiry).toLocaleDateString()}
                    </div>
                  )}
                  {!cert.expiry && (
                    <div style={{ fontSize: '0.9rem', color: 'var(--gray)' }}>
                      ✅ No expiry date
                    </div>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={() => setSelectedStaff(null)}
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
