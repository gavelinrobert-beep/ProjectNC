import React, { useState, useEffect } from 'react';
import MissionPlanner from './MissionPlanner';
import TransferMissionPlanner from './TransferMissionPlanner';
import { api } from '../lib/api';
import './MissionManager.css';

const MissionManager = () => {
  const [activeMode, setActiveMode] = useState('patrol'); // 'patrol' or 'transfer'
  const [missions, setMissions] = useState([]);
  const [assets, setAssets] = useState([]);
  const [bases, setBases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [missionsData, assetsData, basesData] = await Promise.all([
        api.missions(),
        api.assets(),
        api.bases()
      ]);
      console.log('[MissionManager] Loaded data:', {
      missions: missionsData?.length || 0,
      assets: assetsData?.length || 0,
      bases: basesData?.length || 0
    });
    console.log('[MissionManager] Bases data:', basesData);
      setMissions(missionsData);
      setAssets(assetsData);
      setBases(basesData);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load mission data:', err);
      setLoading(false);
    }
  };

  const handleMissionCreated = () => {
    loadData(); // Reload missions after creating a new one
  };

  if (loading) {
    return <div className="mission-manager loading">Loading missions...</div>;
  }

  return (
    <div className="mission-manager">
      {/* Mission Type Toggle */}
      <div className="mission-type-toggle">
        <button
          className={`toggle-btn ${activeMode === 'patrol' ? 'active' : ''}`}
          onClick={() => setActiveMode('patrol')}
        >
          🗺️ Patrol/Recon Missions
        </button>
        <button
          className={`toggle-btn ${activeMode === 'transfer' ? 'active' : ''}`}
          onClick={() => setActiveMode('transfer')}
        >
          📦 Transfer Missions
        </button>
      </div>

      {/* Conditional Rendering based on active mode */}
      <div className="mission-planner-container">
        {activeMode === 'patrol' ? (
          <MissionPlanner
            missions={missions}
            assets={assets}
            bases={bases}
            onMissionCreated={handleMissionCreated}
          />
        ) : (
          <TransferMissionPlanner
            bases={bases}
            assets={assets}
            onMissionCreated={handleMissionCreated}
          />
        )}
      </div>

      {/* Mission List (shared between both types) */}
      <div className="mission-list-section">
        <h2>📋 All Missions</h2>
        {missions.length === 0 ? (
          <p className="no-missions">No missions created yet</p>
        ) : (
          <div className="mission-list">
            {missions.map(mission => (
              <MissionCard
                key={mission.id}
                mission={mission}
                assets={assets}
                onUpdate={loadData}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Mission Card Component
const MissionCard = ({ mission, assets, onUpdate }) => {
  const [expanded, setExpanded] = useState(false);

  const getStatusColor = (status) => {
    const colors = {
      planned: '#4a90e2',
      active: '#3aa86f',
      completed: '#96a39a',
      cancelled: '#b5392f'
    };
    return colors[status] || '#666';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: '#4a90e2',
      medium: '#d9b945',
      high: '#ff9800',
      critical: '#b5392f'
    };
    return colors[priority] || '#666';
  };

  const handleStart = async () => {
    try {
      await api.startMission(mission.id);
      alert('Mission started!');
      onUpdate();
    } catch (err) {
      console.error('Failed to start mission:', err);
      alert('Failed to start mission');
    }
  };

  const handleComplete = async () => {
    try {
      await api.completeMission(mission.id);
      alert('Mission completed!');
      onUpdate();
    } catch (err) {
      console.error('Failed to complete mission:', err);
      alert('Failed to complete mission');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this mission?')) return;
    try {
      await api.deleteMission(mission.id);
      alert('Mission deleted!');
      onUpdate();
    } catch (err) {
      console.error('Failed to delete mission:', err);
      alert('Failed to delete mission');
    }
  };

  const assignedAsset = assets.find(a => a.id === mission.asset_id);
  const isTransferMission = mission.mission_type === 'transfer';

  return (
    <div className="mission-card" style={{ borderLeftColor: getStatusColor(mission.status) }}>
      <div className="mission-card-header" onClick={() => setExpanded(!expanded)}>
        <div className="mission-info">
          <h3>
            {isTransferMission ? '📦' : '🎯'} {mission.name}
            {isTransferMission && <span className="mission-type-badge">TRANSFER</span>}
          </h3>
          <p className="mission-description">{mission.description}</p>
        </div>
        <div className="mission-meta">
          <span className="status-badge" style={{ background: getStatusColor(mission.status) }}>
            {mission.status}
          </span>
          <span className="priority-badge" style={{ background: getPriorityColor(mission.priority) }}>
            {mission.priority}
          </span>
          <span className="expand-icon">{expanded ? '▼' : '▶'}</span>
        </div>
      </div>

      {expanded && (
        <div className="mission-card-body">
          <div className="mission-details-grid">
            <div className="detail-item">
              <strong>Asset:</strong>
              <span>{assignedAsset ? `${assignedAsset.id} (${assignedAsset.type})` : 'Not assigned'}</span>
            </div>
            <div className="detail-item">
              <strong>Waypoints:</strong>
              <span>{mission.waypoints?.length || 0} points</span>
            </div>
            {mission.estimated_duration_minutes && (
              <div className="detail-item">
                <strong>Est. Duration:</strong>
                <span>{mission.estimated_duration_minutes} min</span>
              </div>
            )}
            {mission.total_distance_km && (
              <div className="detail-item">
                <strong>Distance:</strong>
                <span>{mission.total_distance_km.toFixed(1)} km</span>
              </div>
            )}
          </div>

          {/* Transfer Mission Specific Info */}
          {isTransferMission && mission.transfer_items && (
            <div className="transfer-items-section">
              <h4>📦 Items to Transfer:</h4>
              <ul className="transfer-items-list">
                {mission.transfer_items.map((item, idx) => (
                  <li key={idx}>
                    <strong>{item.name}:</strong> {item.quantity} {item.unit}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mission-actions">
            {mission.status === 'planned' && (
              <button className="btn btn-success" onClick={handleStart}>
                ▶️ Start Mission
              </button>
            )}
            {mission.status === 'active' && (
              <button className="btn btn-primary" onClick={handleComplete}>
                ✅ Complete Mission
              </button>
            )}
            {mission.status !== 'active' && (
              <button className="btn btn-danger" onClick={handleDelete}>
                🗑️ Delete
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MissionManager;