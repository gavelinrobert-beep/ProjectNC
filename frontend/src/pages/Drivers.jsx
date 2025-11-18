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
  const [showForm, setShowForm] = useState(false)
  const [editingDriver, setEditingDriver] = useState(null)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    employee_number: '',
    phone: '',
    email: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    license_number: '',
    license_type: 'B',
    license_expiry: '',
    adr_certified: false,
    adr_expiry: '',
    forklift_certified: false,
    home_facility_id: '',
    role: 'driver',
    employment_status: 'active',
    daily_driving_limit_minutes: 540,
    weekly_driving_limit_minutes: 3360,
    notes: ''
  })

  useEffect(() => {
    loadData()
  }, [statusFilter])

  const loadData = async () => {
    try {
      setLoading(true)
      const [driversData, facilitiesData] = await Promise.all([
        api.drivers(),
        api.facilities()
      ])
      // Filter on frontend if needed
      const filtered = statusFilter === 'all' 
        ? driversData 
        : driversData.filter(d => d.employment_status === statusFilter)
      setDrivers(filtered)
      setFacilities(facilitiesData)
    } catch (error) {
      console.error('Failed to load data:', error)
      alert('Failed to load drivers: ' + error.message)
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

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      employee_number: '',
      phone: '',
      email: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      license_number: '',
      license_type: 'B',
      license_expiry: '',
      adr_certified: false,
      adr_expiry: '',
      forklift_certified: false,
      home_facility_id: '',
      role: 'driver',
      employment_status: 'active',
      daily_driving_limit_minutes: 540,
      weekly_driving_limit_minutes: 3360,
      notes: ''
    })
    setEditingDriver(null)
    setShowForm(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingDriver) {
        await api.updateDriver(editingDriver.id, formData)
        alert('Driver updated successfully!')
      } else {
        await api.createDriver(formData)
        alert('Driver created successfully!')
      }
      resetForm()
      loadData()
    } catch (error) {
      console.error('Failed to save driver:', error)
      alert('Failed to save driver: ' + error.message)
    }
  }

  const handleEdit = (driver) => {
    setFormData({
      first_name: driver.first_name,
      last_name: driver.last_name,
      employee_number: driver.employee_number || '',
      phone: driver.phone,
      email: driver.email,
      emergency_contact_name: driver.emergency_contact_name || '',
      emergency_contact_phone: driver.emergency_contact_phone || '',
      license_number: driver.license_number,
      license_type: driver.license_type,
      license_expiry: driver.license_expiry ? driver.license_expiry.split('T')[0] : '',
      adr_certified: driver.adr_certified,
      adr_expiry: driver.adr_expiry ? driver.adr_expiry.split('T')[0] : '',
      forklift_certified: driver.forklift_certified,
      home_facility_id: driver.home_facility_id || '',
      role: driver.role,
      employment_status: driver.employment_status,
      daily_driving_limit_minutes: driver.daily_driving_limit_minutes,
      weekly_driving_limit_minutes: driver.weekly_driving_limit_minutes,
      notes: driver.notes || ''
    })
    setEditingDriver(driver)
    setShowForm(true)
  }

  const handleDelete = async (driverId) => {
    if (!confirm('Are you sure you want to delete this driver?')) return
    try {
      await api.deleteDriver(driverId)
      alert('Driver deleted successfully!')
      loadData()
    } catch (error) {
      console.error('Failed to delete driver:', error)
      alert('Failed to delete driver: ' + error.message)
    }
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
        <button
          onClick={() => setShowForm(true)}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'linear-gradient(135deg, var(--nordic-blue-primary), var(--nordic-blue-accent))',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(74, 144, 226, 0.3)'
          }}
        >
          + Add New Driver
        </button>
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
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => setSelectedDriver(driver)}
                        style={{
                          padding: '0.5rem 0.75rem',
                          background: 'var(--nordic-blue-primary)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          fontWeight: 600
                        }}
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleEdit(driver)}
                        style={{
                          padding: '0.5rem 0.75rem',
                          background: '#FF9800',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          fontWeight: 600
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(driver.id)}
                        style={{
                          padding: '0.5rem 0.75rem',
                          background: '#f44336',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          fontWeight: 600
                        }}
                      >
                        Delete
                      </button>
                    </div>
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

      {/* Create/Edit Driver Form Modal */}
      {showForm && (
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
            zIndex: 1000,
            padding: '2rem'
          }}
          onClick={resetForm}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '2rem',
              maxWidth: '800px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginTop: 0, color: 'var(--charcoal)' }}>
              {editingDriver ? 'Edit Driver' : 'Add New Driver'}
            </h2>
            <form onSubmit={handleSubmit}>
              {/* Personal Information */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ color: 'var(--dark-gray)', fontSize: '1.1rem', marginBottom: '1rem' }}>Personal Information</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>First Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.first_name}
                      onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '6px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Last Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.last_name}
                      onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '6px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Employee Number</label>
                    <input
                      type="text"
                      value={formData.employee_number}
                      onChange={(e) => setFormData({...formData, employee_number: e.target.value})}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '6px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Phone *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '6px' }}
                    />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '6px' }}
                    />
                  </div>
                </div>
              </div>

              {/* License Information */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ color: 'var(--dark-gray)', fontSize: '1.1rem', marginBottom: '1rem' }}>License Information</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>License Number *</label>
                    <input
                      type="text"
                      required
                      value={formData.license_number}
                      onChange={(e) => setFormData({...formData, license_number: e.target.value})}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '6px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>License Type *</label>
                    <select
                      required
                      value={formData.license_type}
                      onChange={(e) => setFormData({...formData, license_type: e.target.value})}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '6px' }}
                    >
                      <option value="B">B - Car</option>
                      <option value="C">C - Truck</option>
                      <option value="CE">CE - Truck with Trailer</option>
                      <option value="D">D - Bus</option>
                      <option value="DE">DE - Bus with Trailer</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>License Expiry *</label>
                    <input
                      type="date"
                      required
                      value={formData.license_expiry}
                      onChange={(e) => setFormData({...formData, license_expiry: e.target.value})}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '6px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Home Facility</label>
                    <select
                      value={formData.home_facility_id}
                      onChange={(e) => setFormData({...formData, home_facility_id: e.target.value})}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '6px' }}
                    >
                      <option value="">Select facility...</option>
                      {facilities.map(f => (
                        <option key={f.id} value={f.id}>{f.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Certifications */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ color: 'var(--dark-gray)', fontSize: '1.1rem', marginBottom: '1rem' }}>Certifications</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input
                        type="checkbox"
                        checked={formData.adr_certified}
                        onChange={(e) => setFormData({...formData, adr_certified: e.target.checked})}
                      />
                      ADR Certified (Dangerous Goods)
                    </label>
                    {formData.adr_certified && (
                      <input
                        type="date"
                        value={formData.adr_expiry}
                        onChange={(e) => setFormData({...formData, adr_expiry: e.target.value})}
                        placeholder="ADR Expiry Date"
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '6px', marginTop: '0.5rem' }}
                      />
                    )}
                  </div>
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input
                        type="checkbox"
                        checked={formData.forklift_certified}
                        onChange={(e) => setFormData({...formData, forklift_certified: e.target.checked})}
                      />
                      Forklift Certified
                    </label>
                  </div>
                </div>
              </div>

              {/* Employment Details */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ color: 'var(--dark-gray)', fontSize: '1.1rem', marginBottom: '1rem' }}>Employment Details</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Role</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '6px' }}
                    >
                      <option value="driver">Driver</option>
                      <option value="operator">Operator</option>
                      <option value="dispatcher">Dispatcher</option>
                      <option value="manager">Manager</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Employment Status</label>
                    <select
                      value={formData.employment_status}
                      onChange={(e) => setFormData({...formData, employment_status: e.target.value})}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '6px' }}
                    >
                      <option value="active">Active</option>
                      <option value="on_leave">On Leave</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ color: 'var(--dark-gray)', fontSize: '1.1rem', marginBottom: '1rem' }}>Emergency Contact</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Contact Name</label>
                    <input
                      type="text"
                      value={formData.emergency_contact_name}
                      onChange={(e) => setFormData({...formData, emergency_contact_name: e.target.value})}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '6px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Contact Phone</label>
                    <input
                      type="tel"
                      value={formData.emergency_contact_phone}
                      onChange={(e) => setFormData({...formData, emergency_contact_phone: e.target.value})}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '6px' }}
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows={3}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '6px' }}
                />
              </div>

              {/* Form Actions */}
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={resetForm}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#9E9E9E',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'linear-gradient(135deg, var(--nordic-blue-primary), var(--nordic-blue-accent))',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  {editingDriver ? 'Update Driver' : 'Create Driver'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
