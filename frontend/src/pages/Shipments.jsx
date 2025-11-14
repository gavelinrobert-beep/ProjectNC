// frontend/src/pages/Shipments.jsx
import React, { useState, useEffect } from 'react'
import { api } from '../lib/api'

const STATUS_COLORS = {
  created: '#B8C5D0',
  picked_up: '#5B9BD5',
  in_transit: '#4A90E2',
  out_for_delivery: '#FF9800',
  delivered: '#4CAF50',
  failed: '#F44336',
  cancelled: '#9E9E9E',
  returned: '#FF5722'
}

const STATUS_LABELS = {
  created: 'Created',
  picked_up: 'Picked Up',
  in_transit: 'In Transit',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  failed: 'Failed Delivery',
  cancelled: 'Cancelled',
  returned: 'Returned'
}

const PRIORITY_ICONS = {
  low: '🟢',
  normal: '🟡',
  high: '🟠',
  urgent: '🔴'
}

export default function Shipments() {
  const [shipments, setShipments] = useState([])
  const [customers, setCustomers] = useState([])
  const [facilities, setFacilities] = useState([])
  const [drivers, setDrivers] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedShipment, setSelectedShipment] = useState(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadData()
  }, [statusFilter])

  const loadData = async () => {
    try {
      setLoading(true)
      const [shipmentsData, customersData, facilitiesData, driversData, vehiclesData] = await Promise.all([
        api.get('/api/shipments' + (statusFilter !== 'all' ? `?status=${statusFilter}` : '')),
        api.get('/api/customers'),
        api.get('/api/facilities'),
        api.get('/api/drivers'),
        api.get('/api/assets')
      ])
      setShipments(shipmentsData)
      setCustomers(customersData)
      setFacilities(facilitiesData)
      setDrivers(driversData)
      setVehicles(vehiclesData)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateShipmentStatus = async (shipmentId, newStatus) => {
    try {
      await api.post(`/api/shipments/${shipmentId}/status?new_status=${newStatus}`)
      loadData()
    } catch (error) {
      console.error('Failed to update status:', error)
      alert('Failed to update shipment status')
    }
  }

  const filteredShipments = shipments.filter(s =>
    searchQuery === '' ||
    s.tracking_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getCustomerName = (customerId) => {
    const customer = customers.find(c => c.id === customerId)
    return customer ? customer.name : 'Unknown'
  }

  const getFacilityName = (facilityId) => {
    const facility = facilities.find(f => f.id === facilityId)
    return facility ? facility.name : 'Unknown'
  }

  const getDriverName = (driverId) => {
    const driver = drivers.find(d => d.id === driverId)
    return driver ? `${driver.first_name} ${driver.last_name}` : 'Unassigned'
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
            📦 Shipment Tracking
          </h1>
          <p style={{ margin: '0.5rem 0 0 0', color: 'var(--dark-gray)' }}>
            Track and manage shipment lifecycle from creation to delivery
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'var(--nordic-blue-primary)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '0.95rem'
          }}
        >
          + Create Shipment
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
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '250px' }}>
            <input
              type="text"
              placeholder="🔍 Search by tracking number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid var(--light-gray)',
                borderRadius: '8px',
                fontSize: '0.95rem'
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['all', 'created', 'in_transit', 'out_for_delivery', 'delivered'].map(status => (
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
                {status === 'all' ? 'All' : STATUS_LABELS[status] || status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Shipments Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray)' }}>
          Loading shipments...
        </div>
      ) : filteredShipments.length === 0 ? (
        <div style={{
          background: 'white',
          padding: '3rem',
          borderRadius: '12px',
          textAlign: 'center',
          color: 'var(--gray)'
        }}>
          No shipments found
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
          {filteredShipments.map(shipment => (
            <div
              key={shipment.id}
              style={{
                background: 'white',
                borderRadius: '12px',
                padding: '1.5rem',
                boxShadow: '0 2px 8px rgba(45, 62, 80, 0.08)',
                border: `2px solid ${STATUS_COLORS[shipment.status] || 'var(--light-gray)'}`,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onClick={() => setSelectedShipment(shipment)}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(45, 62, 80, 0.15)'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(45, 62, 80, 0.08)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              {/* Header */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                  <div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--charcoal)' }}>
                      {shipment.tracking_number}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--gray)', marginTop: '0.25rem' }}>
                      {PRIORITY_ICONS[shipment.priority]} {shipment.priority.toUpperCase()}
                    </div>
                  </div>
                  <div style={{
                    padding: '0.4rem 0.8rem',
                    background: STATUS_COLORS[shipment.status] || 'var(--gray)',
                    color: 'white',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 600
                  }}>
                    {STATUS_LABELS[shipment.status] || shipment.status}
                  </div>
                </div>
              </div>

              {/* Details */}
              <div style={{ fontSize: '0.9rem', color: 'var(--dark-gray)', lineHeight: '1.6' }}>
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>Customer:</strong> {getCustomerName(shipment.customer_id)}
                </div>
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>Route:</strong> {getFacilityName(shipment.origin_facility_id)} → {shipment.destination_facility_id ? getFacilityName(shipment.destination_facility_id) : 'Direct Delivery'}
                </div>
                {shipment.assigned_driver_id && (
                  <div style={{ marginBottom: '0.5rem' }}>
                    <strong>Driver:</strong> {getDriverName(shipment.assigned_driver_id)}
                  </div>
                )}
                {shipment.requested_delivery_date && (
                  <div style={{ marginBottom: '0.5rem' }}>
                    <strong>Delivery Date:</strong> {new Date(shipment.requested_delivery_date).toLocaleDateString()}
                  </div>
                )}
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>Service:</strong> {shipment.service_level.toUpperCase()}
                </div>
              </div>

              {/* Quick Actions */}
              {shipment.status !== 'delivered' && shipment.status !== 'cancelled' && (
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--light-gray)' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {shipment.status === 'created' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          updateShipmentStatus(shipment.id, 'picked_up')
                        }}
                        style={{
                          flex: 1,
                          padding: '0.5rem',
                          background: 'var(--nordic-blue-light)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Mark Picked Up
                      </button>
                    )}
                    {shipment.status === 'picked_up' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          updateShipmentStatus(shipment.id, 'in_transit')
                        }}
                        style={{
                          flex: 1,
                          padding: '0.5rem',
                          background: 'var(--nordic-blue-primary)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        In Transit
                      </button>
                    )}
                    {shipment.status === 'in_transit' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          updateShipmentStatus(shipment.id, 'out_for_delivery')
                        }}
                        style={{
                          flex: 1,
                          padding: '0.5rem',
                          background: 'var(--warning)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Out for Delivery
                      </button>
                    )}
                    {shipment.status === 'out_for_delivery' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedShipment(shipment)
                        }}
                        style={{
                          flex: 1,
                          padding: '0.5rem',
                          background: 'var(--success)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Complete Delivery
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Shipment Detail Modal (simplified for now) */}
      {selectedShipment && (
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
          onClick={() => setSelectedShipment(null)}
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
            <h2 style={{ marginTop: 0 }}>Shipment Details</h2>
            <div style={{ fontSize: '0.95rem', lineHeight: '1.8' }}>
              <p><strong>Tracking Number:</strong> {selectedShipment.tracking_number}</p>
              <p><strong>Status:</strong> <span style={{
                padding: '0.25rem 0.5rem',
                background: STATUS_COLORS[selectedShipment.status],
                color: 'white',
                borderRadius: '4px'
              }}>{STATUS_LABELS[selectedShipment.status]}</span></p>
              <p><strong>Customer:</strong> {getCustomerName(selectedShipment.customer_id)}</p>
              <p><strong>Priority:</strong> {PRIORITY_ICONS[selectedShipment.priority]} {selectedShipment.priority}</p>
              {selectedShipment.special_instructions && (
                <p><strong>Instructions:</strong> {selectedShipment.special_instructions}</p>
              )}
            </div>
            <button
              onClick={() => setSelectedShipment(null)}
              style={{
                marginTop: '1rem',
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
