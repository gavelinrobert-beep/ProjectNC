import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getWorksChangeOrders } from '../../../lib/api';
import toast from 'react-hot-toast';

const ChangeOrders = () => {
  const [changeOrders, setChangeOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadChangeOrders();
  }, [statusFilter]);

  const loadChangeOrders = async () => {
    try {
      setLoading(true);
      const filters = statusFilter !== 'all' ? { status: statusFilter } : {};
      const data = await getWorksChangeOrders(filters);
      setChangeOrders(data);
    } catch (error) {
      console.error('Failed to load change orders:', error);
      toast.error('Failed to load change orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: '#6B7280',
      submitted: '#3B82F6',
      approved: '#10B981',
      rejected: '#EF4444',
      completed: '#059669',
    };
    return colors[status] || '#6B7280';
  };

  const formatCurrency = (amount) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(amount);
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div>Loading change orders...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#1F2937' }}>
            Change Orders (ÄTA)
          </h1>
          <p style={{ color: '#6B7280' }}>Ändrings- och Tilläggsarbeten</p>
        </div>
        <Link 
          to="/works/change-orders/new"
          style={{
            padding: '0.75rem 1.5rem',
            background: '#4A90E2',
            color: 'white',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '500'
          }}
        >
          + New ÄTA
        </Link>
      </div>

      {/* Status Filter */}
      <div style={{ marginBottom: '1.5rem' }}>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: '0.5rem 1rem',
            border: '1px solid #D1D5DB',
            borderRadius: '6px',
            fontSize: '0.875rem',
            background: 'white'
          }}
        >
          <option value="all">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="submitted">Submitted</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Change Orders List */}
      <div style={{ display: 'grid', gap: '1rem' }}>
        {changeOrders.length === 0 ? (
          <div style={{ 
            background: 'white', 
            padding: '3rem', 
            borderRadius: '8px', 
            border: '1px solid #E5E7EB',
            textAlign: 'center',
            color: '#6B7280'
          }}>
            No change orders found
          </div>
        ) : (
          changeOrders.map(co => (
            <Link
              key={co.id}
              to={`/works/change-orders/${co.id}`}
              style={{
                display: 'block',
                background: 'white',
                padding: '1.5rem',
                borderRadius: '8px',
                border: '1px solid #E5E7EB',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1F2937', margin: 0 }}>
                      {co.title}
                    </h3>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      background: `${getStatusColor(co.status)}20`,
                      color: getStatusColor(co.status)
                    }}>
                      {co.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.75rem' }}>
                    {co.change_order_number}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#374151', lineHeight: '1.5' }}>
                    {co.description}
                  </div>
                </div>
                <div style={{ textAlign: 'right', minWidth: '150px' }}>
                  {co.estimated_cost && (
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>Estimated Cost</div>
                      <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#10B981' }}>
                        {formatCurrency(co.estimated_cost)}
                      </div>
                    </div>
                  )}
                  {co.estimated_hours && (
                    <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '0.5rem' }}>
                      {co.estimated_hours}h estimated
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default ChangeOrders;
