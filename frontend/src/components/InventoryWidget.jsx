import React, { useState, useEffect } from 'react';
import { fetchInventoryItems, getInventoryAlerts /* v5 */ } from '../lib/api';
import './InventoryWidget.css';

const InventoryWidget = () => {
  const [inventory, setInventory] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');

  useEffect(() => {
    loadInventory();
    loadAlerts();
    const interval = setInterval(() => {
      loadInventory();
      loadAlerts();
    }, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadInventory = async () => {
    try {
      const data = await fetchInventoryItems();
      setInventory(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load inventory:', error);
      setLoading(false);
    }
  };

  const loadAlerts = async () => {
    try {
      const data = await getInventoryAlerts();
      setAlerts(data);
    } catch (error) {
      console.error('Failed to load alerts:', error);
    }
  };

  const getStockStatus = (item) => {
    const percentage = (item.quantity / item.min_stock_level) * 100;
    if (percentage <= 50) return 'critical';
    if (percentage <= 100) return 'low';
    return 'good';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      fuel: '⛽',
      ammunition: '💣',
      medical: '🏥',
      food: '🍽️',
      spare_parts: '🔧',
      equipment: '📦',
      consumable: '📊',
    };
    return icons[category] || '📦';
  };

  const filteredInventory = inventory.filter(item => {
    if (filter !== 'all' && item.category !== filter) return false;
    if (selectedLocation !== 'all' && item.location_id !== selectedLocation) return false;
    return true;
  });

  const locations = [...new Set(inventory.map(item => item.location_id))];
  const categories = [...new Set(inventory.map(item => item.category))];

  const getTotalWeight = () => {
    return filteredInventory.reduce((sum, item) => {
      return sum + (item.quantity * (item.weight_per_unit || 0));
    }, 0).toFixed(2);
  };

  if (loading) {
    return <div className="inventory-widget loading">Loading inventory...</div>;
  }

  return (
    <div className="inventory-widget">
      <div className="inventory-header">
        <h3>📦 Inventory Management</h3>
        {alerts.length > 0 && (
          <div className="alert-badge">{alerts.length} Low Stock Alert{alerts.length > 1 ? 's' : ''}</div>
        )}
      </div>

      <div className="inventory-filters">
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <select value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)}>
          <option value="all">All Locations</option>
          {locations.map(loc => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>

        <div className="inventory-stats">
          <span>Total Items: {filteredInventory.length}</span>
          <span>Total Weight: {getTotalWeight()} kg</span>
        </div>
      </div>

      {alerts.length > 0 && (
        <div className="inventory-alerts">
          <h4>⚠️ Low Stock Alerts</h4>
          {alerts.map(alert => (
            <div key={alert.id} className="alert-item">
              <span className="alert-icon">🔴</span>
              <span className="alert-name">{alert.name}</span>
              <span className="alert-quantity">{alert.quantity} {alert.unit}</span>
              <span className="alert-location">{alert.location_name || alert.location_id}</span>
            </div>
          ))}
        </div>
      )}

      <div className="inventory-list">
        {filteredInventory.length === 0 ? (
          <div className="no-items">No inventory items found</div>
        ) : (
          filteredInventory.map(item => {
            const status = getStockStatus(item);
            const stockPercentage = Math.min((item.quantity / item.min_stock_level) * 100, 100);

            return (
              <div key={item.id} className={`inventory-item status-${status}`}>
                <div className="item-header">
                  <span className="item-icon">{getCategoryIcon(item.category)}</span>
                  <div className="item-info">
                    <h4 className="item-name">{item.name}</h4>
                    <span className="item-location">{item.location_id}</span>
                  </div>
                  <div className="item-quantity">
                    <span className="quantity-value">{item.quantity.toLocaleString()}</span>
                    <span className="quantity-unit">{item.unit}</span>
                  </div>
                </div>

                <div className="item-details">
                  <div className="stock-bar">
                    <div
                      className={`stock-fill status-${status}`}
                      style={{ width: `${stockPercentage}%` }}
                    />
                  </div>
                  <div className="stock-info">
                    <span>Min: {item.min_stock_level} {item.unit}</span>
                    {item.weight_per_unit && (
                      <span>Weight: {(item.quantity * item.weight_per_unit).toFixed(2)} kg</span>
                    )}
                  </div>
                </div>

                {item.description && (
                  <div className="item-description">{item.description}</div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default InventoryWidget;