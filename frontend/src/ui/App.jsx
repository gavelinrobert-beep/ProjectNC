
/* src/ui/App.jsx */
import React, { useMemo, useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, CircleMarker, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { api } from '../lib/api';
import { SvgIcon, iconForAlert } from '../lib/icons.jsx';
import AdminGeofences from '../components/AdminGeofences';
import AdminUsers from '../components/AdminUsers'; // Import the new component
import Login from '../components/Login.jsx';
import { getUserRole, logout } from '../lib/auth';
import { useSSE } from '../hooks/useSSE';

const Role = ({ role }) => {
  const colors = {
    admin: '#9f9',
    operator: '#ff9',
    viewer: '#9ff',
    anonymous: '#ccc',
  };

  const style = {
    display: 'inline-block',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    backgroundColor: colors[role] || '#ccc',
    color: '#000',
    fontWeight: 700,
  };

  return <span style={style}>{role}</span>;
};

function App() {
  const [trail, setTrail] = useState([]);
  const [assetId, setAssetId] = useState(null);
  const [tab, setTab] = useState('ops');
  const [adminTab, setAdminTab] = useState('geofences'); // New state for admin sub-tabs
  const [role, setRole] = useState(getUserRole());

  const streamData = useSSE(`${api.baseUrl}/stream`, { assets: [], alerts: [] });
  const { assets, alerts } = streamData;

  const selectedAsset = useMemo(() => {
    if (!assetId && assets.length > 0) {
      setAssetId(assets[0].id);
    }
    return assets.find((a) => a.id === assetId);
  }, [assets, assetId]);

  useEffect(() => {
    if (selectedAsset) {
      setTrail((prevTrail) => [...prevTrail, selectedAsset]);
    }
  }, [selectedAsset]);

  const replayPoly = useMemo(
    () => trail.filter((p) => p.lat && p.lon).map((p) => [p.lat, p.lon]),
    [trail]
  );

  return (
    <>
      <header
        style={{
          padding: '1rem',
          background: '#0f1815',
          borderBottom: '1px solid var(--border)',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span>PROJECT AEGIS — Real‑Time Logistics</span>
        <span style={{ fontWeight: 400, display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Role role={role} />
          {role !== 'anonymous' && (
            <button
              className="btn"
              onClick={() => {
                logout();
                setRole('anonymous');
              }}
            >
              Logga ut
            </button>
          )}
        </span>
      </header>
      <main>
        <div className="sidebar">
          <button
            className={`nav-button ${tab === 'ops' ? 'active' : ''}`}
            onClick={() => setTab('ops')}
          >
            Operations
          </button>
          <button
            className={`nav-button ${tab === 'admin' ? 'active' : ''}`}
            onClick={() => setTab('admin')}
          >
            Admin
          </button>
        </div>
        <div className="content">
          {tab === 'admin' ? (
            <div className="card">
              <h2>Administration</h2>
              <div className="content">
                {role === 'anonymous' ? (
                  <Login onSuccess={(r) => setRole(r)} />
                ) : (
                  <>
                    <div className="sub-nav">
                      <button
                        className={`nav-button ${adminTab === 'geofences' ? 'active' : ''}`}
                        onClick={() => setAdminTab('geofences')}
                      >
                        Geofences
                      </button>
                      <button
                        className={`nav-button ${adminTab === 'users' ? 'active' : ''}`}
                        onClick={() => setAdminTab('users')}
                      >
                        Users
                      </button>
                    </div>
                    {adminTab === 'geofences' && <AdminGeofences />}
                    {adminTab === 'users' && <AdminUsers />}
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="wrap">
              <div className="card">
                <h2>Panel</h2>
                <div className="content">
                  <div className="muted">Tillgångar</div>
                  <ul className="list">
                    {assets.map((a) => (
                      <li key={a.id}>
                        <span>
                          <b>{a.id}</b> <span className="muted">({a.type})</span>
                        </span>
                        <button
                          className="btn"
                          onClick={() => setAssetId(a.id)}
                        >
                          Välj
                        </button>
                      </li>
                    ))}
                    {assets.length === 0 && (
                      <li className="muted">Inga tillgångar</li>
                    )}
                  </ul>

                  <div className="muted" style={{ marginTop: 8 }}>
                    Larm
                  </div>
                  <ul className="list">
                    {alerts.map((a) => (
                      <li key={a.id}>
                        <span
                          style={{
                            display: 'flex',
                            gap: 8,
                            alignItems: 'center',
                          }}
                        >
                          <SvgIcon name={iconForAlert(a)} />
                          <b>{a.rule}</b> —{' '}
                          <span className="muted">{a.asset_id}</span>
                        </span>
                        <span className="muted">
                          {new Date(a.ts).toLocaleTimeString()}
                        </span>
                      </li>
                    ))}
                    {alerts.length === 0 && (
                      <li className="muted">Inga larm</li>
                    )}
                  </ul>
                </div>
              </div>

              <div className="card" style={{ padding: '.75rem' }}>
                <MapContainer
                  center={[62.3901, 17.3062]}
                  zoom={11}
                  id="map"
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                  />
                  {assets.map((a) => (
                    <Marker
                      key={a.id}
                      position={[a.lat, a.lon]}
                      icon={L.icon({
                        iconUrl:
                          'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                        shadowUrl:
                          'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
                        iconSize: [25, 41],
                        iconAnchor: [12, 41],
                        popupAnchor: [1, -34],
                        shadowSize: [41, 41],
                      })}
                    >
                      <Popup>
                        <b>{a.id}</b>
                        <br />
                        Typ: {a.type}
                      </Popup>
                    </Marker>
                  ))}
                  {replayPoly.length > 1 && (
                    <Polyline positions={replayPoly} />
                  )}
                  {replayPoly.length > 0 && (
                    <CircleMarker
                      center={replayPoly[replayPoly.length - 1]}
                      radius={6}
                      pathOptions={{ color: '#b5392f' }}
                    />
                  )}
                </MapContainer>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export default App;
