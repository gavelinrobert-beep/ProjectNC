
// src/components/GeofenceMapEditor.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

const defaultCenter = [62.3901, 17.3062];
const toLatLngs = (poly = []) => poly.map(([lat, lon]) => [lat, lon]);

function DraggableVertex({ index, pos, onDragEnd }) {
  const icon = useMemo(() => L.divIcon({ className: 'vertex-handle', html: '', iconSize: [10, 10] }), []);
  const ref = useRef(null);
  return (
    <Marker
      position={pos}
      icon={icon}
      draggable
      eventHandlers={{
        dragend: () => {
          const m = ref.current;
          if (!m) return;
          const p = m.getLatLng();
          onDragEnd(index, [p.lat, p.lng]);
        },
      }}
      ref={ref}
    />
  );
}

function MapEvents({ mode, onAddPoint, onSelectGeofence, onFinish }) {
  useMapEvents({
    click(e) {
      if (mode === 'draw') {
        onAddPoint?.([e.latlng.lat, e.latlng.lng]);
      }
    },
    dblclick() {
      if (mode === 'draw') {
        onFinish?.();
      }
    },
  });
  return null;
}

export default function GeofenceMapEditor({ geofences = [], mode = 'view', selectedGeofence, onSelectGeofence, onSave, onDelete, loading }) {
  const [draft, setDraft] = useState(null);

  useEffect(() => {
    if (mode === 'draw' && !draft) {
      setDraft({ name: 'New Geofence', polygon: [] });
    }
    if (mode !== 'draw') {
      setDraft(null);
    }
  }, [mode, draft]);

  const handleSaveDraft = () => {
    if (draft && draft.polygon.length >= 3) {
      onSave(draft);
      setDraft(null);
    }
  };

  return (
    <div style={{ height: 'calc(100vh - 220px)' }}>
      <div className="map-toolbar" style={{ display: 'flex', gap: 8, margin: '6px 0' }}>
        {mode === 'draw' && (
          <>
            <button className="btn" onClick={() => setDraft({ ...draft, polygon: draft.polygon.slice(0, -1) })} disabled={!draft?.polygon.length}>
              Undo
            </button>
            <button className="btn" onClick={handleSaveDraft} disabled={!draft || draft.polygon.length < 3}>
              Save
            </button>
            <span className="muted">Points: {draft?.polygon.length || 0}</span>
          </>
        )}
      </div>
      <MapContainer center={defaultCenter} zoom={11} style={{ height: '100%', borderRadius: 12, zIndex: 1, cursor: mode === 'draw' ? 'crosshair' : 'grab' }} doubleClickZoom={false}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
        {geofences.map((g) => (
          <Polygon
            key={g.id}
            positions={toLatLngs(g.polygon)}
            pathOptions={{
              color: selectedGeofence?.id === g.id ? '#b58900' : '#335039',
              weight: 2,
              fillOpacity: 0.1,
            }}
            eventHandlers={{
              click: () => {
                if (mode === 'edit') {
                  onSelectGeofence(g);
                } else if (mode === 'delete') {
                  onDelete(g.id);
                }
              },
            }}
          >
            <Popup>
              <b>{g.name}</b>
              <br />
              {g.id}
            </Popup>
          </Polygon>
        ))}
        {draft && draft.polygon.length >= 2 && (
          <Polygon positions={toLatLngs(draft.polygon)} pathOptions={{ color: '#b58900', weight: 2, dashArray: '6 6', fillOpacity: 0.08 }} />
        )}
        {draft &&
          draft.polygon.map((p, i) => (
            <DraggableVertex
              key={i}
              index={i}
              pos={p}
              onDragEnd={(index, latlng) => {
                const newPolygon = [...draft.polygon];
                newPolygon[index] = latlng;
                setDraft({ ...draft, polygon: newPolygon });
              }}
            />
          ))}
        <MapEvents
          mode={mode}
          onAddPoint={(p) => setDraft({ ...draft, polygon: [...draft.polygon, p] })}
          onFinish={handleSaveDraft}
        />
      </MapContainer>
    </div>
  );
}
