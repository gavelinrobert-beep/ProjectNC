import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getWorksWorkOrders, updateWorksWorkOrder } from '../../../lib/api';
import toast from 'react-hot-toast';
import { formatDate } from '../../../shared/utils';

const WorkOrderBoard = () => {
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterProject, setFilterProject] = useState('');

  const columns = [
    { id: 'draft', label: 'Draft', color: '#6B7280' },
    { id: 'scheduled', label: 'Scheduled', color: '#3B82F6' },
    { id: 'in_progress', label: 'In Progress', color: '#10B981' },
    { id: 'completed', label: 'Completed', color: '#059669' },
  ];

  useEffect(() => {
    loadWorkOrders();
  }, []);

  const loadWorkOrders = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (filterProject) {
        filters.project_id = filterProject;
      }
      const data = await getWorksWorkOrders(filters);
      // Filter out cancelled work orders for the board view
      setWorkOrders(data.filter(wo => wo.status !== 'cancelled'));
    } catch (error) {
      console.error('Failed to load work orders:', error);
      toast.error('Failed to load work orders');
    } finally {
      setLoading(false);
    }
  };

  const getWorkOrdersByStatus = (status) => {
    return workOrders.filter(wo => wo.status === status);
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: '#6B7280',
      medium: '#3B82F6',
      high: '#F59E0B',
      urgent: '#EF4444',
    };
    return colors[priority] || '#6B7280';
  };

  const getTypeIcon = (type) => {
    const icons = {
      construction: '🏗️',
      maintenance: '🔧',
      winter_maintenance: '❄️',
      emergency: '🚨',
      other: '📋',
    };
    return icons[type] || '📋';
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div>Loading work orders...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', height: 'calc(100vh - 100px)', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#1F2937' }}>
            Work Order Board
          </h1>
          <p style={{ color: '#6B7280' }}>Manage work orders across different stages</p>
        </div>
        <Link 
          to="/works/work-orders/new"
          style={{
            padding: '0.75rem 1.5rem',
            background: '#4A90E2',
            color: 'white',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '500',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#357ABD'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#4A90E2'}
        >
          + New Work Order
        </Link>
      </div>

      {/* Kanban Board */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(4, 1fr)', 
        gap: '1.5rem',
        height: 'calc(100% - 100px)',
        overflow: 'auto'
      }}>
        {columns.map(column => (
          <div key={column.id} style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Column Header */}
            <div style={{
              padding: '1rem',
              background: 'white',
              borderRadius: '8px 8px 0 0',
              border: '1px solid #E5E7EB',
              borderBottom: 'none'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ 
                  fontSize: '0.875rem', 
                  fontWeight: '600', 
                  color: column.color,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  {column.label}
                </h3>
                <span style={{
                  background: `${column.color}20`,
                  color: column.color,
                  padding: '0.125rem 0.5rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: '600'
                }}>
                  {getWorkOrdersByStatus(column.id).length}
                </span>
              </div>
            </div>

            {/* Column Content */}
            <div style={{
              flex: 1,
              background: '#F9FAFB',
              border: '1px solid #E5E7EB',
              borderTop: `3px solid ${column.color}`,
              borderRadius: '0 0 8px 8px',
              padding: '1rem',
              overflowY: 'auto',
              minHeight: '400px'
            }}>
              {getWorkOrdersByStatus(column.id).length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '2rem 1rem', 
                  color: '#9CA3AF',
                  fontSize: '0.875rem'
                }}>
                  No work orders
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {getWorkOrdersByStatus(column.id).map(wo => (
                    <WorkOrderCard 
                      key={wo.id} 
                      workOrder={wo}
                      getPriorityColor={getPriorityColor}
                      getTypeIcon={getTypeIcon}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const WorkOrderCard = ({ workOrder, getPriorityColor, getTypeIcon }) => (
  <Link
    to={`/works/work-orders/${workOrder.id}`}
    style={{
      display: 'block',
      background: 'white',
      padding: '1rem',
      borderRadius: '6px',
      border: '1px solid #E5E7EB',
      textDecoration: 'none',
      color: 'inherit',
      transition: 'all 0.2s',
      cursor: 'pointer'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
      e.currentTarget.style.transform = 'translateY(-2px)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.boxShadow = 'none';
      e.currentTarget.style.transform = 'translateY(0)';
    }}
  >
    {/* Priority Badge */}
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
      <span style={{
        padding: '0.125rem 0.5rem',
        borderRadius: '4px',
        fontSize: '0.625rem',
        fontWeight: '600',
        textTransform: 'uppercase',
        background: `${getPriorityColor(workOrder.priority)}20`,
        color: getPriorityColor(workOrder.priority)
      }}>
        {workOrder.priority}
      </span>
      <span style={{ fontSize: '1.25rem' }}>
        {getTypeIcon(workOrder.type)}
      </span>
    </div>

    {/* Work Order Info */}
    <h4 style={{ 
      fontSize: '0.875rem', 
      fontWeight: '600', 
      color: '#1F2937',
      marginBottom: '0.5rem',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical'
    }}>
      {workOrder.title}
    </h4>
    
    <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.5rem' }}>
      {workOrder.order_number}
    </div>

    {workOrder.assigned_to && (
      <div style={{ 
        fontSize: '0.75rem', 
        color: '#4A90E2',
        marginTop: '0.75rem',
        paddingTop: '0.75rem',
        borderTop: '1px solid #E5E7EB'
      }}>
        👤 Assigned
      </div>
    )}

    {workOrder.scheduled_start && (
      <div style={{ 
        fontSize: '0.75rem', 
        color: '#6B7280',
        marginTop: '0.5rem'
      }}>
        📅 {formatDate(workOrder.scheduled_start)}
      </div>
    )}
  </Link>
);

export default WorkOrderBoard;
