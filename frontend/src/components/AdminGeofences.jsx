
// src/components/AdminGeofences.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../lib/api';
import { isAdmin } from '../lib/auth';
import GeofenceMapEditor from './GeofenceMapEditor';

const IconButton = ({ icon, label, ...props }) => (
  <button {...props} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    <i className={`fas fa-${icon}`} />
    {label}
  </button>
);

export default function AdminGeofences() {
  const [geofences, setGeofences] = useState([]);
  const [mode, setMode] = useState('view'); // view, draw, edit, delete
  const [selectedGeofence, setSelectedGeofence] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const refreshGeofences = useCallback(async () => {
    try {
      setLoading(true);
      const list = await api.geofences();
      setGeofences(list);
      setError('');
    } catch (e) {
      console.error(e);
      setError('Kunde inte hämta geofences');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshGeofences();
  }, [refreshGeofences]);

  const handleSave = async (geofenceData) => {
    if (!isAdmin()) {
      setError('Endast administratörer kan spara geofences.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      if (geofenceData.id) {
        await api.updateGeofence(geofenceData.id, geofenceData);
      } else {
        await api.createGeofence(geofenceData);
      }
      await refreshGeofences();
      setMode('view');
      setSelectedGeofence(null);
    } catch (err) {
      console.error(err);
      setError(String(err.message || err));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (geofenceId) => {
    if (!isAdmin()) {
      setError('Endast administratörer kan radera geofences.');
      return;
    }
    if (!window.confirm(`Är du säker på att du vill radera geofence ${geofenceId}?`)) return;

    setLoading(true);
    setError('');
    try {
      await api.deleteGeofence(geofenceId);
      await refreshGeofences();
      setMode('view');
      setSelectedGeofence(null);
    } catch (err) {
      console.error(err);
      setError(String(err.message || err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
      <div className="card" style={{ border: 'none', boxShadow: 'none' }}>
        <h3>Geofence Editor (Admin)</h3>
        {error && <div style={{ color: '#b5392f', margin: '8px 0' }}>{error}</div>}

        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <IconButton icon="eye" label="View" onClick={() => setMode('view')} disabled={mode === 'view'} />
          <IconButton icon="draw-polygon" label="Draw" onClick={() => setMode('draw')} disabled={mode === 'draw'} />
          <IconButton icon="edit" label="Edit" onClick={() => setMode('edit')} disabled={mode === 'edit'} />
          <IconButton icon="trash" label="Delete" onClick={() => setMode('delete')} disabled={mode === 'delete'} />
        </div>

        <GeofenceMapEditor
          geofences={geofences}
          mode={mode}
          selectedGeofence={selectedGeofence}
          onSelectGeofence={setSelectedGeofence}
          onSave={handleSave}
          onDelete={handleDelete}
          loading={loading}
        />
      </div>
    </div>
  );
}
