import React, { useState, useEffect } from 'react';
import { api, fetchInventoryItems } from '../lib/api';
import './TransferMissionPlanner.css';

const TransferMissionPlanner = ({ bases, assets, onMissionCreated }) => {
  const [sourceBase, setSourceBase] = useState('');
  const [destBase, setDestBase] = useState('');
  const [sourceInventory, setSourceInventory] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [availableAssets, setAvailableAssets] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [autoSelectAsset, setAutoSelectAsset] = useState(true);
  const [missionName, setMissionName] = useState('');
  const [priority, setPriority] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load inventory when source base changes
  useEffect(() => {
    if (sourceBase) {
      loadSourceInventory();
    } else {
      setSourceInventory([]);
      setSelectedItems([]);
    }
  }, [sourceBase]);

  // Find available assets when bases are selected
  useEffect(() => {
    if (sourceBase && destBase && autoSelectAsset) {
      findAvailableAssets();
    }
  }, [sourceBase, destBase, autoSelectAsset]);

  const loadSourceInventory = async () => {
    try {
      const items = await fetchInventoryItems({ location_id: sourceBase });
      setSourceInventory(items.filter(item => item.quantity > 0));
    } catch (err) {
      console.error('Failed to load inventory:', err);
      setError('Failed to load inventory from source base');
    }
  };

  const findAvailableAssets = async () => {
    if (!sourceBase || !destBase) return;

    const sourceBaseData = bases.find(b => b.id === sourceBase);
    if (!sourceBaseData) return;

    // Filter assets that are available (parked/idle, not on mission)
    const available = assets.filter(asset =>
      (asset.status === 'parked' || asset.status === 'idle') &&
      !asset.mission_id
    );

    // Calculate distance from each asset to source base
    const assetsWithDistance = available.map(asset => {
      const distance = calculateDistance(
        asset.lat, asset.lon,
        sourceBaseData.lat, sourceBaseData.lon
      );
      return { ...asset, distanceToSource: distance };
    });

    // Sort by distance (closest first)
    assetsWithDistance.sort((a, b) => a.distanceToSource - b.distanceToSource);

    setAvailableAssets(assetsWithDistance);

    // Auto-select closest asset
    if (assetsWithDistance.length > 0 && autoSelectAsset) {
      setSelectedAsset(assetsWithDistance[0]);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleItemSelection = (item, quantity) => {
    const existing = selectedItems.find(si => si.id === item.id);

    if (quantity <= 0) {
      // Remove item
      setSelectedItems(selectedItems.filter(si => si.id !== item.id));
    } else if (existing) {
      // Update quantity
      setSelectedItems(selectedItems.map(si =>
        si.id === item.id ? { ...si, quantity: Math.min(quantity, item.quantity) } : si
      ));
    } else {
      // Add new item
      setSelectedItems([...selectedItems, {
        ...item,
        quantity: Math.min(quantity, item.quantity)
      }]);
    }
  };

  const calculateTotalWeight = () => {
    return selectedItems.reduce((total, item) => {
      return total + (item.quantity * (item.weight_per_unit || 0));
    }, 0);
  };

  const handleCreateMission = async () => {
    if (!sourceBase || !destBase || selectedItems.length === 0) {
      setError('Please select source base, destination base, and at least one item');
      return;
    }

    if (!selectedAsset) {
      setError('Please select an asset for the mission');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const sourceBaseData = bases.find(b => b.id === sourceBase);
      const destBaseData = bases.find(b => b.id === destBase);

      // Create waypoints: asset current position -> source base -> destination base
      const waypoints = [
        {
          lat: selectedAsset.lat,
          lon: selectedAsset.lon,
          name: 'Start Position',
          action: 'start'
        },
        {
          lat: sourceBaseData.lat,
          lon: sourceBaseData.lon,
          name: sourceBaseData.name,
          action: 'pickup'
        },
        {
          lat: destBaseData.lat,
          lon: destBaseData.lon,
          name: destBaseData.name,
          action: 'delivery'
        }
      ];

      // Prepare transfer items data
      const transferItems = selectedItems.map(item => ({
        item_id: item.id,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit
      }));

      const missionData = {
        name: missionName || `Transfer: ${sourceBaseData.name} → ${destBaseData.name}`,
        description: `Transfer ${selectedItems.length} item types (${calculateTotalWeight().toFixed(2)} kg total)`,
        asset_id: selectedAsset.id,
        waypoints: waypoints,
        status: 'planned',
        priority: priority,
        mission_type: 'transfer',
        source_base_id: sourceBase,
        destination_base_id: destBase,
        transfer_items: transferItems
      };

      await api.createMission(missionData);

      alert('Transfer mission created successfully!');
      resetForm();
      if (onMissionCreated) onMissionCreated();

    } catch (err) {
      console.error('Failed to create transfer mission:', err);
      setError(err.message || 'Failed to create transfer mission');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSourceBase('');
    setDestBase('');
    setSourceInventory([]);
    setSelectedItems([]);
    setSelectedAsset(null);
    setMissionName('');
    setPriority('medium');
    setError(null);
  };

  return (
    <div className="transfer-mission-planner">
      <h2>📦 Create Transfer Mission</h2>

      {error && (
        <div className="error-message">{error}</div>
      )}

      <div className="planner-grid">
        {/* Left Column: Base Selection */}
        <div className="planner-section">
          <h3>1. Select Bases</h3>

          <div className="form-group">
            <label>Source Base (Pickup):</label>
            <select
              value={sourceBase}
              onChange={(e) => setSourceBase(e.target.value)}
              disabled={loading}
            >
              <option value="">-- Select Source Base --</option>
              {bases.map(base => (
                <option key={base.id} value={base.id}>
                  {base.name} ({base.type})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Destination Base (Delivery):</label>
            <select
              value={destBase}
              onChange={(e) => setDestBase(e.target.value)}
              disabled={loading}
            >
              <option value="">-- Select Destination Base --</option>
              {bases.filter(b => b.id !== sourceBase).map(base => (
                <option key={base.id} value={base.id}>
                  {base.name} ({base.type})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Middle Column: Item Selection */}
        <div className="planner-section">
          <h3>2. Select Items to Transfer</h3>

          {!sourceBase ? (
            <p className="muted">Select a source base first</p>
          ) : sourceInventory.length === 0 ? (
            <p className="muted">No inventory available at source base</p>
          ) : (
            <div className="inventory-list">
              {sourceInventory.map(item => {
                const selected = selectedItems.find(si => si.id === item.id);
                return (
                  <div key={item.id} className="inventory-item-row">
                    <div className="item-info">
                      <strong>{item.name}</strong>
                      <span className="muted">
                        Available: {item.quantity} {item.unit}
                        {item.weight_per_unit && ` (${(item.quantity * item.weight_per_unit).toFixed(2)} kg)`}
                      </span>
                    </div>
                    <div className="item-quantity-input">
                      <input
                        type="number"
                        min="0"
                        max={item.quantity}
                        step="1"
                        value={selected?.quantity || 0}
                        onChange={(e) => handleItemSelection(item, parseFloat(e.target.value) || 0)}
                        placeholder="Qty"
                      />
                      <span>{item.unit}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {selectedItems.length > 0 && (
            <div className="selected-summary">
              <strong>Selected: {selectedItems.length} items</strong>
              <span>Total Weight: {calculateTotalWeight().toFixed(2)} kg</span>
            </div>
          )}
        </div>

        {/* Right Column: Asset Selection */}
        <div className="planner-section">
          <h3>3. Select Asset</h3>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={autoSelectAsset}
                onChange={(e) => setAutoSelectAsset(e.target.checked)}
              />
              Auto-select closest asset
            </label>
          </div>

          {availableAssets.length === 0 ? (
            <p className="muted">No available assets</p>
          ) : (
            <div className="asset-list">
              {availableAssets.slice(0, 5).map(asset => (
                <div
                  key={asset.id}
                  className={`asset-card ${selectedAsset?.id === asset.id ? 'selected' : ''}`}
                  onClick={() => setSelectedAsset(asset)}
                >
                  <div className="asset-header">
                    <strong>{asset.id}</strong>
                    <span className="asset-type">{asset.type}</span>
                  </div>
                  <div className="asset-details">
                    <span>Distance: {asset.distanceToSource.toFixed(1)} km</span>
                    <span>Speed: {asset.speed} km/h</span>
                    <span>Status: {asset.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom: Mission Details */}
      <div className="mission-details">
        <h3>4. Mission Details</h3>

        <div className="form-row">
          <div className="form-group">
            <label>Mission Name (optional):</label>
            <input
              type="text"
              value={missionName}
              onChange={(e) => setMissionName(e.target.value)}
              placeholder="Auto-generated if empty"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Priority:</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value)} disabled={loading}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        <div className="action-buttons">
          <button
            className="btn btn-primary"
            onClick={handleCreateMission}
            disabled={loading || !sourceBase || !destBase || selectedItems.length === 0 || !selectedAsset}
          >
            {loading ? 'Creating...' : '🚀 Create Transfer Mission'}
          </button>
          <button
            className="btn btn-secondary"
            onClick={resetForm}
            disabled={loading}
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransferMissionPlanner;