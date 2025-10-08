
// src/ui/App.jsx
import React, { useMemo, useState, useCallback, useEffect } from 'react'
import { MapContainer, TileLayer, Polyline, CircleMarker, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { api } from '../lib/api'
import { SvgIcon, iconForAlert } from '../lib/icons.jsx'
import AdminGeofences from '../components/AdminGeofences'
import Login from '../components/Login.jsx'
import { getUserRole, isAdmin, logout } from '../lib/auth'

export default function App(){
  const [alerts, setAlerts] = useState([])
  const [assets, setAssets] = useState([])
  const [trail, setTrail] = useState([])
  const [assetId, setAssetId] = useState(null)
  const [tab, setTab] = useState('admin')

  const replayPoly = useMemo(()=> trail.filter(p=>p.lat&&p.lon).map(p=>[p.lat,p.lon]), [trail])

  const refreshAssets = useCallback(async ()=>{ const as = await api.assets(); setAssets(as); if(!assetId && as.length) setAssetId(as[0].id) }, [assetId])
  useEffect(()=>{ refreshAssets() }, [])

  return (<>
    <header style={{ padding:'1rem', background:'#e9eee9', borderBottom:'1px solid #d9e0d9', fontWeight:700 }}>
      PROJECT AEGIS — Real-Time Logistics
    </header>
    <div style={{padding:'0.5rem 1rem'}}>
      <div style={{display:'flex', gap:8, marginBottom:8}}>
        <button className="btn" onClick={()=>setTab('ops')}>Operations</button>
        <button className="btn" onClick={()=>setTab('admin')}>Admin</button>
      </div>
    </div>

    {tab === 'ops' ? (
      <div className="wrap">
        <div className="card">
          <h2>Panel</h2>
          <div className="content">
            <div className="muted">Tillgångar</div>
            <ul className="list">
              {assets.map(a=>(
                <li key={a.id}>
                  <span><b>{a.id}</b> <span className="muted">({a.type})</span></span>
                  <button className="btn" onClick={()=>setAssetId(a.id)}>Välj</button>
                </li>
              ))}
              {assets.length===0 && <li className="muted">Inga tillgångar</li>}
            </ul>

            <div className="muted" style={{marginTop:8}}>Larm</div>
            <ul className="list">
              {alerts.map(a => (
                <li key={a.id}>
                  <span style={{display:'flex',gap:8,alignItems:'center'}}>
                    <SvgIcon name={iconForAlert(a)} />
                    <b>{a.rule}</b> — <span className="muted">{a.asset_id}</span>
                  </span>
                  <span className="muted">{new Date(a.ts).toLocaleTimeString()}</span>
                </li>
              ))}
              {alerts.length===0 && <li className="muted">Inga larm</li>}
            </ul>
          </div>
        </div>

        <div className="card" style={{padding:'.75rem'}}>
          <MapContainer center={[62.3901, 17.3062]} zoom={11} id="map">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
            {assets.map(a => (
              <Marker key={a.id} position={[62.39 + Math.random()*0.01, 17.31 + Math.random()*0.01]} icon={L.icon({
                iconUrl:'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                shadowUrl:'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
                iconSize:[25,41], iconAnchor:[12,41], popupAnchor:[1,-34], shadowSize:[41,41]
              })}>
                <Popup><b>{a.id}</b><br/>Typ: {a.type}</Popup>
              </Marker>
            ))}
            {replayPoly.length>1 && <Polyline positions={replayPoly} />}
            {replayPoly.length>0 && (<CircleMarker center={replayPoly[replayPoly.length-1]} radius={6} pathOptions={{color:'#b5392f'}} />)}
          </MapContainer>
        </div>
      </div>
    ) : (
      <div className="wrap">
        <div className="card"><h2>Administration</h2><AdminGeofences/></div>
      </div>
    )}
  </>)
}
