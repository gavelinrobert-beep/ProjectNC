import React, { useState, useEffect } from 'react';
import {
  fetchInventoryItems,
  getInventoryTransactions,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  createInventoryTransaction
} from '../lib/api';
import { api } from '../lib/api';
import './InventoryManager.css';

const InventoryManager = () => {
  const [inventory, setInventory] = useState([]);
  const [bases, setBases] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBase, setSelectedBase] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showTransactions, setShowTransactions] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    type: 'equipment',
    category: 'equipment',
    quantity: 0,
    unit: 'units',
    location_id: '',
    min_stock_level: 100,
    weight_per_unit: 0,
    description: ''
  });

  const [transferData, setTransferData] = useState({
    item_id: null,
    from_base: '',
    to_base: '',
    quantity: 0,
    asset_id: '',
    mission_name: ''
  });

  const categories = [
    'fuel', 'ammunition', 'medical', 'food',
    'spare_parts', 'equipment', 'consumable'
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [invData, basesData, transData] = await Promise.all([
        fetchInventoryItems(),
        api.bases(),
        getInventoryTransactions(null, 50)
      ]);
      setInventory(invData || []);
      setBases(basesData || []);
      setTransactions(transData || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load data:', error);
      setLoading(false);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      await createInventoryItem(formData);
      setShowAddModal(false);
      setFormData({
        name: '',
        type: 'equipment',
        category: 'equipment',
        quantity: 0,
        unit: 'units',
        location_id: '',
        min_stock_level: 100,
        weight_per_unit: 0,
        description: ''
      });
      loadData();
    } catch (error) {
      alert('Failed to create item: ' + error.message);
    }
  };

  const handleUpdateItem = async (e) => {
    e.preventDefault();
    try {
      await updateInventoryItem(selectedItem.id, formData);
      setSelectedItem(null);
      setShowAddModal(false);
      loadData();
    } catch (error) {
      alert('Failed to update item: ' + error.message);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await deleteInventoryItem(itemId);
      loadData();
    } catch (error) {
      alert('Failed to delete item: ' + error.message);
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    try {
      // Create a transfer mission
      const sourceBase = bases.find(b => b.id === transferData.from_base);
      const destBase = bases.find(b => b.id === transferData.to_base);

      if (!sourceBase || !destBase) {
        alert('Invalid bases selected');
        return;
      }

      const mission = {
        name: transferData.mission_name || `Transfer: ${selectedItem.name}`,
        description: `Transfer ${transferData.quantity} ${selectedItem.unit} of ${selectedItem.name} from ${sourceBase.name} to ${destBase.name}`,
        mission_type: 'transfer',
        status: 'planned',
        priority: 'medium',
        asset_id: transferData.asset_id || null,
        source_base_id: transferData.from_base,
        destination_base_id: transferData.to_base,
        transfer_items: [{
          item_id: transferData.item_id,
          quantity: transferData.quantity
        }],
        waypoints: [
          { lat: sourceBase.lat, lon: sourceBase.lon, action: 'pickup' },
          { lat: destBase.lat, lon: destBase.lon, action: 'deliver' }
        ]
      };

      await api.createMission(mission);

      setShowTransferModal(false);
      setTransferData({
        item_id: null,
        from_base: '',
        to_base: '',
        quantity: 0,
        asset_id: '',
        mission_name: ''
      });

      alert('Transfer mission created successfully! Go to Missions tab to start it.');
      loadData();
    } catch (error) {
      alert('Failed to create transfer mission: ' + error.message);
    }
  };

  const openEditModal = (item) => {
    setSelectedItem(item);
    setFormData({
      name: item.name,
      type: item.type || 'equipment',
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      location_id: item.location_id,
      min_stock_level: item.min_stock_level,
      weight_per_unit: item.weight_per_unit || 0,
      description: item.description || ''
    });
    setShowAddModal(true);
  };

  const openTransferModal = (item) => {
    setSelectedItem(item);
    setTransferData({
      item_id: item.id,
      from_base: item.location_id,
      to_base: '',
      quantity: 0,
      asset_id: '',
      mission_name: `Transfer: ${item.name}`
    });
    setShowTransferModal(true);
  };

  const filteredInventory = inventory.filter(item => {
    if (selectedBase !== 'all' && item.location_id !== selectedBase) return false;
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    return true;
  });

  const getStockStatus = (item) => {
    const percentage = (item.quantity / item.min_stock_level) * 100;
    if (percentage <= 50) return 'critical';
    if (percentage <= 100) return 'low';
    return 'good';
  };

  if (loading) {
    return <div className="content">Loading inventory...</div>;
  }

  return (
    <div className="content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3>📦 Inventory Management</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" onClick={() => setShowTransactions(!showTransactions)}>
            📊 {showTransactions ? 'Hide' : 'Show'} Transactions
          </button>
          <button className="btn" onClick={() => {
            setSelectedItem(null);
            setFormData({
              name: '',
              type: 'equipment',
              category: 'equipment',
              quantity: 0,
              unit: 'units',
              location_id: '',
              min_stock_level: 100,
              weight_per_unit: 0,
              description: ''
            });
            setShowAddModal(true);
          }}>
            ➕ Add Item
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 16, padding: 12 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <label style={{ fontSize: 12 }}>
            Base:
            <select
              value={selectedBase}
              onChange={(e) => setSelectedBase(e.target.value)}
              style={{ marginLeft: 8 }}
            >
              <option value="all">All Bases</option>
              {bases.map(base => (
                <option key={base.id} value={base.id}>{base.name}</option>
              ))}
            </select>
          </label>

          <label style={{ fontSize: 12 }}>
            Category:
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ marginLeft: 8 }}
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </label>

          <div style={{ marginLeft: 'auto', fontSize: 12, color: '#999' }}>
            Showing {filteredInventory.length} of {inventory.length} items
          </div>
        </div>
      </div>

      {/* Inventory Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12, marginBottom: 16 }}>
        {filteredInventory.map(item => {
          const status = getStockStatus(item);
          const stockPercentage = Math.min((item.quantity / item.min_stock_level) * 100, 100);
          const baseName = bases.find(b => b.id === item.location_id)?.name || item.location_id;

          return (
            <div key={item.id} className={`card inventory-item-card status-${status}`} style={{ padding: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: 14 }}>{item.name}</h4>
                  <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>
                    📍 {baseName} • {item.category}
                  </div>
                </div>
                <div style={{ fontSize: 16, fontWeight: 'bold', color: status === 'critical' ? '#ff4444' : status === 'low' ? '#ff9800' : '#4CAF50' }}>
                  {item.quantity.toLocaleString()}
                  <span style={{ fontSize: 10, fontWeight: 'normal', marginLeft: 4 }}>{item.unit}</span>
                </div>
              </div>

              {/* Stock bar */}
              <div style={{ marginBottom: 8 }}>
                <div style={{ height: 6, background: '#333', borderRadius: 3, overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${stockPercentage}%`,
                      background: status === 'critical' ? '#ff4444' : status === 'low' ? '#ff9800' : '#4CAF50',
                      transition: 'width 0.3s ease'
                    }}
                  />
                </div>
                <div style={{ fontSize: 10, color: '#999', marginTop: 4 }}>
                  Min: {item.min_stock_level} {item.unit}
                </div>
              </div>

              {item.description && (
                <div style={{ fontSize: 11, color: '#ccc', marginBottom: 8, lineHeight: 1.4 }}>
                  {item.description}
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                <button
                  className="btn"
                  onClick={() => openEditModal(item)}
                  style={{ flex: 1, padding: '4px 8px', fontSize: 11 }}
                >
                  ✏️ Edit
                </button>
                <button
                  className="btn"
                  onClick={() => openTransferModal(item)}
                  style={{ flex: 1, padding: '4px 8px', fontSize: 11 }}
                >
                  🚚 Transfer
                </button>
                <button
                  className="btn"
                  onClick={() => handleDeleteItem(item.id)}
                  style={{ padding: '4px 8px', fontSize: 11, background: '#ff4444' }}
                >
                  🗑️
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Transactions Panel */}
      {showTransactions && (
        <div className="card" style={{ marginTop: 16 }}>
          <h4>Recent Transactions</h4>
          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            <table style={{ width: '100%', fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #333' }}>
                  <th style={{ textAlign: 'left', padding: 8 }}>Time</th>
                  <th style={{ textAlign: 'left', padding: 8 }}>Item</th>
                  <th style={{ textAlign: 'left', padding: 8 }}>Type</th>
                  <th style={{ textAlign: 'right', padding: 8 }}>Quantity</th>
                  <th style={{ textAlign: 'left', padding: 8 }}>Location</th>
                  <th style={{ textAlign: 'left', padding: 8 }}>Notes</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(trans => {
                  const item = inventory.find(i => i.id === trans.item_id);
                  return (
                    <tr key={trans.id} style={{ borderBottom: '1px solid #222' }}>
                      <td style={{ padding: 8 }}>{new Date(trans.timestamp).toLocaleString('sv-SE')}</td>
                      <td style={{ padding: 8 }}>{item?.name || 'Unknown'}</td>
                      <td style={{ padding: 8 }}>
                        <span style={{
                          padding: '2px 6px',
                          borderRadius: 3,
                          background: trans.transaction_type.includes('in') ? '#3aa86f' : '#ff9800',
                          fontSize: 10
                        }}>
                          {trans.transaction_type}
                        </span>
                      </td>
                      <td style={{ padding: 8, textAlign: 'right', fontWeight: 'bold' }}>
                        {trans.quantity > 0 ? '+' : ''}{trans.quantity}
                      </td>
                      <td style={{ padding: 8 }}>{trans.location_id}</td>
                      <td style={{ padding: 8, fontSize: 11, color: '#999' }}>{trans.notes}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{selectedItem ? 'Edit Item' : 'Add New Item'}</h3>
            <form onSubmit={selectedItem ? handleUpdateItem : handleAddItem}>
              <div style={{ display: 'grid', gap: 12 }}>
                <label>
                  Name:
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </label>

                <label>
                  Type:
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    required
                  >
                    <option value="fuel">Fuel (Bränsle)</option>
                    <option value="spare_parts">Spare Parts (Reservdelar)</option>
                    <option value="equipment">Equipment (Utrustning)</option>
                    <option value="consumable">Consumable (Förbrukningsmaterial)</option>
                    <option value="pallet">Pallet (Pall)</option>
                    <option value="packaging">Packaging (Förpackning)</option>
                  </select>
                </label>

                <label>
                  Category:
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    required
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </label>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <label>
                    Quantity:
                    <input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})}
                      required
                    />
                  </label>

                  <label>
                    Unit:
                    <input
                      type="text"
                      value={formData.unit}
                      onChange={(e) => setFormData({...formData, unit: e.target.value})}
                      required
                    />
                  </label>
                </div>

                <label>
                  Location (Base):
                  <select
                    value={formData.location_id}
                    onChange={(e) => setFormData({...formData, location_id: e.target.value})}
                    required
                  >
                    <option value="">Select base...</option>
                    {bases.map(base => (
                      <option key={base.id} value={base.id}>{base.name}</option>
                    ))}
                  </select>
                </label>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <label>
                    Min Stock Level:
                    <input
                      type="number"
                      value={formData.min_stock_level}
                      onChange={(e) => setFormData({...formData, min_stock_level: parseInt(e.target.value)})}
                      required
                    />
                  </label>

                  <label>
                    Weight per Unit (kg):
                    <input
                      type="number"
                      step="0.01"
                      value={formData.weight_per_unit}
                      onChange={(e) => setFormData({...formData, weight_per_unit: parseFloat(e.target.value)})}
                    />
                  </label>
                </div>

                <label>
                  Description:
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                  />
                </label>
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <button type="submit" className="btn" style={{ flex: 1 }}>
                  {selectedItem ? 'Update' : 'Create'}
                </button>
                <button type="button" className="btn" onClick={() => setShowAddModal(false)} style={{ flex: 1 }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="modal-overlay" onClick={() => setShowTransferModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>🚚 Create Transfer Mission: {selectedItem?.name}</h3>
            <form onSubmit={handleTransfer}>
              <div style={{ display: 'grid', gap: 12 }}>
                <label>
                  Mission Name:
                  <input
                    type="text"
                    value={transferData.mission_name}
                    onChange={(e) => setTransferData({...transferData, mission_name: e.target.value})}
                    required
                  />
                </label>

                <label>
                  From Base:
                  <select
                    value={transferData.from_base}
                    onChange={(e) => setTransferData({...transferData, from_base: e.target.value})}
                    required
                  >
                    <option value="">Select source base...</option>
                    {bases.map(base => (
                      <option key={base.id} value={base.id}>{base.name}</option>
                    ))}
                  </select>
                </label>

                <label>
                  To Base:
                  <select
                    value={transferData.to_base}
                    onChange={(e) => setTransferData({...transferData, to_base: e.target.value})}
                    required
                  >
                    <option value="">Select destination base...</option>
                    {bases.filter(b => b.id !== transferData.from_base).map(base => (
                      <option key={base.id} value={base.id}>{base.name}</option>
                    ))}
                  </select>
                </label>

                <label>
                  Quantity to Transfer:
                  <input
                    type="number"
                    value={transferData.quantity}
                    onChange={(e) => setTransferData({...transferData, quantity: parseInt(e.target.value)})}
                    max={selectedItem?.quantity}
                    required
                  />
                  <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>
                    Available: {selectedItem?.quantity} {selectedItem?.unit}
                  </div>
                </label>

                <label>
                  Assign Asset (Optional):
                  <input
                    type="text"
                    placeholder="e.g., truck-001"
                    value={transferData.asset_id}
                    onChange={(e) => setTransferData({...transferData, asset_id: e.target.value})}
                  />
                </label>

                <div style={{ padding: 12, background: '#1a3a4a', borderRadius: 4, fontSize: 12 }}>
                  <strong>📋 Transfer Summary:</strong>
                  <div style={{ marginTop: 8 }}>
                    • Item: {selectedItem?.name}<br />
                    • Quantity: {transferData.quantity} {selectedItem?.unit}<br />
                    • From: {bases.find(b => b.id === transferData.from_base)?.name || 'Not selected'}<br />
                    • To: {bases.find(b => b.id === transferData.to_base)?.name || 'Not selected'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <button type="submit" className="btn" style={{ flex: 1 }}>
                  Create Transfer Mission
                </button>
                <button type="button" className="btn" onClick={() => setShowTransferModal(false)} style={{ flex: 1 }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManager;