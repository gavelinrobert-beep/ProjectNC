import React,{useMemo,useState,useCallback,useEffect} from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import L from 'leaflet'
import { api, API_BASE } from '../lib/api'
import { StatusDot } from '../lib/icons.jsx'
import AdminGeofences from '../components/AdminGeofences'
import Login from '../components/Login.jsx'
import { getUserRole, logout } from '../lib/auth'
import { pointInPoly, minDistToPolyMeters } from '../lib/geometry'

function coloredIcon(color){
  const html = `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid #111;box-shadow:0 0 0 2px rgba(0,0,0,.3)"></div>`
  return L.divIcon({ html, className:'', iconSize:[14,14] })
}

export default function App(){
  const [alerts, setAlerts] = useState([])
  const [assets, setAssets] = useState([])
  const [live, setLive] = useState([])
  const [trails, setTrails] = useState({})
  const [geofences, setGeofences] = useState([])
  const [tab, setTab] = useState('ops')
  const [role, setRole] = useState(getUserRole())
  const [q, setQ] = useState('')

  const refreshAssets = useCallback(async ()=>{ try{ setAssets(await api.assets()) }catch{} }, [])
  const refreshGeofences = useCallback(async ()=>{ try{ setGeofences(await api.geofences()) }catch{} }, [])
  useEffect(()=>{ refreshAssets(); refreshGeofences() }, [refreshAssets, refreshGeofences])

  useEffect(()=>{
    const es = new EventSource(`${API_BASE}/stream/assets`)
    es.onmessage = e => { try{
      const arr = JSON.parse(e.data)
      setLive(arr)
      setTrails(prev=>{
        const next = {...prev}
        for(const a of arr){
          const t = next[a.id] || []
          const last = t[t.length-1]
          const p = [a.lat, a.lon]
          if(!last || Math.hypot((p[0]-last[0]), (p[1]-last[1])) > 1e-6){
            t.push(p)
            if(t.length > 300) t.shift()
          }
          next[a.id] = t
        }
        return next
      })
    }catch{} }
    return ()=> es.close()
  }, [])

  useEffect(()=>{
    const es = new EventSource(`${API_BASE}/stream/alerts`)
    es.onmessage = e => { try{ const d=JSON.parse(e.data); const arr=Array.isArray(d)?d:[d]; setAlerts(prev=>[...arr, ...prev].slice(0,200)) }catch{} }
    return ()=> es.close()
  }, [])

  function statusFor(lat, lon){
    if(!geofences || geofences.length===0) return {color:'#3aa86f', label:'Normal'}
    for(const g of geofences){
      if(Array.isArray(g.polygon) && g.polygon.length>=3 && pointInPoly([lat,lon], g.polygon)){
        return {color:'#b5392f', label:'Intrång', geofence:g.id}
      }
    }
    for(const g of geofences){
      if(Array.isArray(g.polygon) && g.polygon.length>=3){
        const d = minDistToPolyMeters([lat,lon], g.polygon)
        if(d<200) return {color:'#d9b945', label:'Nära', geofence:g.id, distance:Math.round(d)}
      }
    }
    return {color:'#3aa86f', label:'Normal'}
  }

  async function ackAlert(id){
    try{ await api.ackAlert(id); setAlerts(prev=> prev.map(a=> a.id===id? {...a, acknowledged:true}: a)) }catch(e){ alert('Kunde inte kvittera larm: '+e.message) }
  }

  const filteredAssets = useMemo(()=>{
    const t = q.trim().toLowerCase()
    if(!t) return assets
    return assets.filter(a => (a.id.toLowerCase().includes(t) || a.type.toLowerCase().includes(t)))
  }, [q, assets])

  async function exportCsv(){ const csv = await api.alertsCsv(); const blob = new Blob([csv], {type:'text/csv'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='alerts.csv'; a.click() }
  async function exportPdf(){ const resp = await api.alertsPdf(); const blob = await resp.blob(); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='alerts.pdf'; a.click() }

  return (<>
    <header style={{padding:'1rem',background:'#0f1815',borderBottom:'1px solid var(--border)',fontWeight:700,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
      <span>PROJECT AEGIS — C2 <span className='pill'>v2.4</span></span>
      <span style={{ fontWeight: 400 }}>Roll: <b>{role}</b>{' '}{role!=='anonymous' && <button className='btn' onClick={()=>{ logout(); setRole('anonymous') }} style={{marginLeft:8}}>Logga ut</button>}</span>
    </header>

    <div style={{ padding: '0.5rem 1rem' }}>
      <div className='tabs' style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <button className={`btn ${tab==='ops'?'active':''}`} onClick={() => setTab('ops')}>Operations</button>
        <button className={`btn ${tab==='admin'?'active':''}`} onClick={() => setTab('admin')}>Admin</button>
      </div>

      {tab==='admin' ? (
        <div className='wrap'>
          <div className='card'><h2>Administration</h2>{role==='anonymous'? <div className='content'><Login onSuccess={(r)=>setRole(r)} /></div>: <AdminGeofences/>}</div>
        </div>
      ):(
        <div className='wrap'>
          <div className='card'>
            <h2>Panel</h2>
            <div className='content'>
              <div className='toolbar' style={{marginBottom:8}}>
                <input placeholder='Sök tillgång (id/typ)...' value={q} onChange={e=>setQ(e.target.value)} />
                <button className='btn' onClick={exportCsv}>Export CSV</button>
                <button className='btn' onClick={exportPdf}>Export PDF</button>
              </div>

              <div className='muted'>Tillgångar</div>
              <ul className='list'>
                {filteredAssets.map(a=>{
                  const lp=live.find(x=>x.id===a.id)
                  const st=lp? statusFor(lp.lat, lp.lon) : {color:'#3aa86f', label:'Normal'}
                  const label = st.label + (st.distance?` (${st.distance} m)`: '')
                  const cls = st.color==='#b5392f'?'red':(st.color==='#d9b945'?'yellow':'green')
                  return (<li key={a.id}>
                    <span style={{display:'flex',alignItems:'center',gap:8}}>
                      <StatusDot color={cls}/>
                      <b>{a.id}</b> <span className='muted'>({a.type})</span>
                    </span>
                    <span className={`badge ${cls}`}>{label}</span>
                  </li>)
                })}
                {filteredAssets.length===0 && <li className='muted'>Inga tillgångar</li>}
              </ul>

              <div className='muted' style={{ marginTop: 8 }}>Larm</div>
              <ul className='list'>
                {alerts.map(a=>{
                  return (<li key={a.id}>
                    <span><b>{a.rule}</b> — <span className='muted'>{a.asset_id}</span>{a.geofence_id && <span className='muted'> @ {a.geofence_id}</span>}</span>
                    <span style={{display:'flex',gap:8,alignItems:'center'}}>
                      <span className={`badge ${a.acknowledged?'green':'red'}`}>{a.acknowledged?'Kvitterad':'Ohanterad'}</span>
                      <button className='btn' onClick={()=>ackAlert(a.id)} disabled={a.acknowledged}>Kvittera</button>
                    </span>
                  </li>)
                })}
                {alerts.length===0 && <li className='muted'>Inga larm</li>}
              </ul>
            </div>
          </div>

          <div className='card' style={{ padding: '.75rem' }}>
            <MapContainer center={[62.3901, 17.3062]} zoom={11} id='map'>
              <TileLayer url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' attribution='&copy; OpenStreetMap contributors' />
              <MarkerClusterGroup>
                {filteredAssets.map(a=>{
                  const p=live.find(x=>x.id===a.id)
                  const lat=p? p.lat: 62.39+Math.random()*0.01
                  const lon=p? p.lon: 17.31+Math.random()*0.01
                  const st=statusFor(lat,lon)
                  const trail = (trails[a.id]||[]).slice(-120)
                  return (<React.Fragment key={a.id}>
                    {trail.length>1 && <Polyline positions={trail} pathOptions={{color: st.color, weight: 2, opacity: .8}} />}
                    <Marker position={[lat,lon]} icon={coloredIcon(st.color)}>
                      <Popup><b>{a.id}</b><br/>Status: {st.label}</Popup>
                    </Marker>
                  </React.Fragment>)
                })}
              </MarkerClusterGroup>
            </MapContainer>
          </div>
        </div>
      )}
    </div>
  </>)
}
