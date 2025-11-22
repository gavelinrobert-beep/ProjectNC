import React, { useState } from 'react';
import { formatDate } from '../shared/utils';

const VehicleEquipmentPanel = ({ vehicle, equipment }) => {
  const [expanded, setExpanded] = useState(false);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'assigned': return '✅';
      case 'needs_replacement': return '⚠️';
      case 'missing': return '❌';
      default: return '⚪';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'assigned': return '#4caf50';
      case 'needs_replacement': return '#ff9800';
      case 'missing': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'assigned': return 'OK';
      case 'needs_replacement': return 'Kräver byte';
      case 'missing': return 'Saknas';
      default: return status;
    }
  };

  const isInspectionDue = (dueDate) => {
    if (!dueDate) return false;
    const due = new Date(dueDate);
    const now = new Date();
    const daysUntilDue = Math.floor((due - now) / (1000 * 60 * 60 * 24));
    return daysUntilDue <= 30; // Alert if due within 30 days
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(30,40,60,0.95) 0%, rgba(20,30,45,0.95) 100%)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '12px',
      marginBottom: '1rem',
      overflow: 'hidden',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
    }}>
      {/* Vehicle Header */}
      <div 
        style={{
          padding: '1.25rem',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: expanded ? 'rgba(255,255,255,0.05)' : 'transparent'
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ fontSize: '1.5rem' }}>
            {vehicle.type === 'truck' ? '🚛' : '🚐'}
          </div>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>
              {vehicle.registration_number}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#9ca3af' }}>
              {vehicle.make} {vehicle.model}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ fontSize: '0.9rem', color: '#9ca3af' }}>
            {equipment.length} utrustning
          </div>
          <div style={{
            fontSize: '1.25rem',
            transition: 'transform 0.3s',
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)'
          }}>
            ▼
          </div>
        </div>
      </div>

      {/* Equipment List */}
      {expanded && (
        <div style={{
          padding: '0 1.25rem 1.25rem',
          borderTop: '1px solid rgba(255,255,255,0.1)'
        }}>
          {equipment.length === 0 ? (
            <div style={{ 
              padding: '2rem', 
              textAlign: 'center', 
              color: '#9ca3af',
              fontSize: '0.9rem'
            }}>
              Ingen utrustning registrerad
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '0.75rem', marginTop: '1rem' }}>
              {equipment.map((item) => (
                <div 
                  key={item.id}
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '8px',
                    padding: '1rem',
                    border: item.status === 'needs_replacement' ? '1px solid rgba(255,152,0,0.3)' : 
                            item.status === 'missing' ? '1px solid rgba(244,67,54,0.3)' : 
                            '1px solid transparent'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem',
                        marginBottom: '0.5rem'
                      }}>
                        <span style={{ fontSize: '1.1rem' }}>
                          {getStatusIcon(item.status)}
                        </span>
                        <span style={{ fontSize: '1rem', fontWeight: '600' }}>
                          {item.name}
                        </span>
                      </div>
                      {item.description && (
                        <div style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '0.5rem' }}>
                          {item.description}
                        </div>
                      )}
                      {item.next_inspection_due && (
                        <div style={{
                          fontSize: '0.85rem',
                          color: isInspectionDue(item.next_inspection_due) ? '#ff9800' : '#9ca3af',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}>
                          {isInspectionDue(item.next_inspection_due) && '⚠️'}
                          <span>
                            Nästa kontroll: {formatDate(item.next_inspection_due)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div style={{
                      padding: '0.375rem 0.75rem',
                      background: getStatusColor(item.status) + '20',
                      border: `1px solid ${getStatusColor(item.status)}`,
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      color: getStatusColor(item.status),
                      whiteSpace: 'nowrap'
                    }}>
                      {getStatusText(item.status)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VehicleEquipmentPanel;
