// frontend/src/pages/Customers.jsx
import React, { useState, useEffect } from 'react'
import { api } from '../lib/api'

const CUSTOMER_TYPE_ICONS = {
  business: '🏢',
  individual: '👤',
  government: '🏛️',
  municipality: '🏙️'
}

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')

  useEffect(() => {
    loadCustomers()
  }, [])

  const loadCustomers = async () => {
    try {
      setLoading(true)
      const data = await api.get('/api/customers')
      setCustomers(data)
    } catch (error) {
      console.error('Failed to load customers:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = searchQuery === '' ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.contact_email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === 'all' || c.customer_type === typeFilter
    return matchesSearch && matchesType
  })

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
            👥 Customer Management
          </h1>
          <p style={{ margin: '0.5rem 0 0 0', color: 'var(--dark-gray)' }}>
            Manage customer accounts and delivery preferences
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
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '250px' }}>
            <input
              type="text"
              placeholder="🔍 Search customers..."
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
            {['all', 'business', 'individual', 'government', 'municipality'].map(type => (
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
                {type === 'all' ? 'All' : `${CUSTOMER_TYPE_ICONS[type] || ''} ${type}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Customers Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray)' }}>
          Loading customers...
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div style={{
          background: 'white',
          padding: '3rem',
          borderRadius: '12px',
          textAlign: 'center',
          color: 'var(--gray)'
        }}>
          No customers found
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {filteredCustomers.map(customer => (
            <div
              key={customer.id}
              style={{
                background: 'white',
                borderRadius: '12px',
                padding: '1.5rem',
                boxShadow: '0 2px 8px rgba(45, 62, 80, 0.08)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onClick={() => setSelectedCustomer(customer)}
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--charcoal)' }}>
                    {customer.name}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--gray)', marginTop: '0.25rem' }}>
                    {CUSTOMER_TYPE_ICONS[customer.customer_type]} {customer.customer_type}
                  </div>
                </div>
                {customer.active ? (
                  <span style={{
                    padding: '0.25rem 0.5rem',
                    background: 'var(--success)',
                    color: 'white',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 600
                  }}>
                    Active
                  </span>
                ) : (
                  <span style={{
                    padding: '0.25rem 0.5rem',
                    background: 'var(--gray)',
                    color: 'white',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 600
                  }}>
                    Inactive
                  </span>
                )}
              </div>

              {/* Contact Info */}
              <div style={{ fontSize: '0.9rem', color: 'var(--dark-gray)', lineHeight: '1.6' }}>
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>Contact:</strong> {customer.contact_name}
                </div>
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>Email:</strong> {customer.contact_email}
                </div>
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>Phone:</strong> {customer.contact_phone}
                </div>
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>Location:</strong> {customer.address_city}, {customer.address_postal_code}
                </div>
                {customer.service_level && (
                  <div style={{ marginTop: '0.75rem' }}>
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      background: 'var(--nordic-blue-light)',
                      color: 'white',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      fontWeight: 600
                    }}>
                      {customer.service_level.toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Customer Detail Modal */}
      {selectedCustomer && (
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
          onClick={() => setSelectedCustomer(null)}
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
              {CUSTOMER_TYPE_ICONS[selectedCustomer.customer_type]} {selectedCustomer.name}
            </h2>
            <div style={{ fontSize: '0.95rem', lineHeight: '1.8', color: 'var(--dark-gray)' }}>
              <p><strong>Type:</strong> {selectedCustomer.customer_type}</p>
              <p><strong>Contact Person:</strong> {selectedCustomer.contact_name}</p>
              <p><strong>Email:</strong> {selectedCustomer.contact_email}</p>
              <p><strong>Phone:</strong> {selectedCustomer.contact_phone}</p>
              <p><strong>Address:</strong> {selectedCustomer.address_street}, {selectedCustomer.address_city}, {selectedCustomer.address_postal_code}, {selectedCustomer.address_country}</p>
              {selectedCustomer.organization_number && (
                <p><strong>Org. Number:</strong> {selectedCustomer.organization_number}</p>
              )}
              {selectedCustomer.billing_account && (
                <p><strong>Billing Account:</strong> {selectedCustomer.billing_account}</p>
              )}
              <p><strong>Service Level:</strong> {selectedCustomer.service_level}</p>
              {selectedCustomer.preferred_delivery_window && (
                <p><strong>Preferred Delivery:</strong> {selectedCustomer.preferred_delivery_window}</p>
              )}
              {selectedCustomer.access_instructions && (
                <p><strong>Access Instructions:</strong> {selectedCustomer.access_instructions}</p>
              )}
              <p><strong>Status:</strong> <span style={{
                padding: '0.25rem 0.5rem',
                background: selectedCustomer.active ? 'var(--success)' : 'var(--gray)',
                color: 'white',
                borderRadius: '4px'
              }}>{selectedCustomer.active ? 'Active' : 'Inactive'}</span></p>
            </div>
            <button
              onClick={() => setSelectedCustomer(null)}
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
