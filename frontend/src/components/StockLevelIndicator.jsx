import React from 'react';

const StockLevelIndicator = ({ item }) => {
  const percentage = item.max_stock_level > 0 
    ? Math.min(100, (item.quantity / item.max_stock_level) * 100)
    : 0;

  const getBarColor = () => {
    if (item.quantity < item.min_stock_level) return '#f44336'; // Red
    if (percentage < 50) return '#ff9800'; // Orange
    return '#4caf50'; // Green
  };

  const getStatusText = () => {
    if (item.quantity < item.min_stock_level) return 'Låg lagernivå';
    if (percentage < 50) return 'Normal';
    return 'Bra lagernivå';
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
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.25rem' }}>
            {item.name}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#9ca3af' }}>
            {item.type} - {item.description || 'Ingen beskrivning'}
          </div>
        </div>
        <div style={{
          padding: '0.375rem 0.875rem',
          background: getBarColor() + '20',
          border: `1px solid ${getBarColor()}`,
          borderRadius: '20px',
          fontSize: '0.8rem',
          fontWeight: '600',
          color: getBarColor(),
          whiteSpace: 'nowrap'
        }}>
          {getStatusText()}
        </div>
      </div>

      {/* Stock Level Bar */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.5rem'
        }}>
          <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
            {item.quantity} {item.unit}
          </div>
          <div style={{ fontSize: '0.9rem', color: '#9ca3af' }}>
            av {item.max_stock_level} {item.unit}
          </div>
        </div>
        
        <div style={{
          width: '100%',
          height: '12px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '6px',
          overflow: 'hidden',
          position: 'relative'
        }}>
          {/* Min level marker */}
          {item.min_stock_level > 0 && (
            <div style={{
              position: 'absolute',
              left: `${(item.min_stock_level / item.max_stock_level) * 100}%`,
              top: 0,
              bottom: 0,
              width: '2px',
              background: '#ff9800',
              zIndex: 2
            }} />
          )}
          
          {/* Progress bar */}
          <div style={{
            width: `${percentage}%`,
            height: '100%',
            background: `linear-gradient(90deg, ${getBarColor()} 0%, ${getBarColor()}dd 100%)`,
            borderRadius: '6px',
            transition: 'width 0.3s ease'
          }} />
        </div>
        
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '0.5rem',
          fontSize: '0.8rem',
          color: '#9ca3af'
        }}>
          <div>Min: {item.min_stock_level} {item.unit}</div>
          <div>{percentage.toFixed(0)}%</div>
        </div>
      </div>

      {/* Cost Information */}
      {item.unit_cost && (
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '8px',
          padding: '0.75rem',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem'
        }}>
          <div>
            <div style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Styckpris</div>
            <div style={{ fontSize: '0.95rem', fontWeight: '600' }}>
              {item.unit_cost} {item.currency || 'SEK'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Totalt värde</div>
            <div style={{ fontSize: '0.95rem', fontWeight: '600' }}>
              {(item.quantity * item.unit_cost).toFixed(2)} {item.currency || 'SEK'}
            </div>
          </div>
        </div>
      )}

      {/* Low stock warning */}
      {item.quantity < item.min_stock_level && (
        <div style={{
          marginTop: '1rem',
          padding: '0.75rem',
          background: 'rgba(244,67,54,0.15)',
          border: '1px solid rgba(244,67,54,0.3)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.9rem'
        }}>
          <span style={{ fontSize: '1.25rem' }}>⚠️</span>
          <span>Lager under minimumnivå - beställ mer</span>
        </div>
      )}
    </div>
  );
};

export default StockLevelIndicator;
