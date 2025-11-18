import React from 'react';

const CargoTrackingCard = ({ cargo }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered': return '✅';
      case 'in_transit': return '🚚';
      case 'awaiting_pickup': return '📍';
      case 'returned': return '↩️';
      default: return '📦';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return '#4caf50';
      case 'in_transit': return '#2196f3';
      case 'awaiting_pickup': return '#ff9800';
      case 'returned': return '#9e9e9e';
      default: return '#757575';
    }
  };

  const formatHandling = (handling) => {
    if (!handling) return null;
    const labels = {
      'fragile': '⚠️ Ömtålig',
      'hazardous': '☢️ Farligt gods',
      'temperature_controlled': '❄️ Temperaturkänsligt'
    };
    return labels[handling] || handling;
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(30,40,60,0.95) 0%, rgba(20,30,45,0.95) 100%)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '12px',
      padding: '1.25rem',
      marginBottom: '1rem',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <div style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.25rem' }}>
            {getStatusIcon(cargo.status)} {cargo.name}
          </div>
          <div style={{ 
            fontSize: '0.9rem', 
            color: '#9ca3af',
            fontFamily: 'monospace'
          }}>
            Tracking: {cargo.tracking_number}
          </div>
        </div>
        <div style={{
          padding: '0.375rem 0.875rem',
          background: getStatusColor(cargo.status),
          borderRadius: '20px',
          fontSize: '0.85rem',
          fontWeight: '600',
          textTransform: 'capitalize'
        }}>
          {cargo.status.replace('_', ' ')}
        </div>
      </div>

      {/* Customer Information */}
      {cargo.customer_info && (
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '8px',
          padding: '0.875rem',
          marginBottom: '1rem'
        }}>
          <div style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '0.5rem' }}>
            📍 Leveransinformation
          </div>
          {cargo.customer_info.pickup && (
            <div style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>
              <strong>Upphämtning:</strong> {cargo.customer_info.pickup}
            </div>
          )}
          {cargo.customer_info.delivery && (
            <div style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>
              <strong>Leverans:</strong> {cargo.customer_info.delivery}
            </div>
          )}
          {cargo.customer_info.contact && (
            <div style={{ fontSize: '0.9rem', color: '#9ca3af' }}>
              <strong>Kontakt:</strong> {cargo.customer_info.contact}
            </div>
          )}
        </div>
      )}

      {/* Package Details */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        {cargo.weight_kg && (
          <div>
            <div style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Vikt</div>
            <div style={{ fontSize: '1rem', fontWeight: '600' }}>{cargo.weight_kg} kg</div>
          </div>
        )}
        {cargo.special_handling && (
          <div>
            <div style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Hantering</div>
            <div style={{ fontSize: '0.95rem', fontWeight: '600' }}>
              {formatHandling(cargo.special_handling)}
            </div>
          </div>
        )}
      </div>

      {/* Vehicle Information */}
      {cargo.vehicle && (
        <div style={{
          background: 'rgba(33,150,243,0.15)',
          border: '1px solid rgba(33,150,243,0.3)',
          borderRadius: '8px',
          padding: '0.75rem',
          marginTop: '1rem'
        }}>
          <div style={{ fontSize: '0.85rem', color: '#64b5f6', marginBottom: '0.25rem' }}>
            🚚 På fordon
          </div>
          <div style={{ fontSize: '0.95rem', fontWeight: '600' }}>
            {cargo.vehicle.registration_number} ({cargo.vehicle.type})
          </div>
        </div>
      )}

      {/* Timeline would go here in a more complete implementation */}
    </div>
  );
};

export default CargoTrackingCard;
