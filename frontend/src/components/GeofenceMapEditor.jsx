
// src/components/GeofenceMapEditor.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { MapContainer, TileLayer, Polygon, Marker, Popup, useMapEvents } from 'react-leaflet'
import L from 'leaflet'

const defaultCenter = [62.3901, 17.3062]
const toLatLngs = (poly=[]) => poly.map(([lat,lon]) => [lat,lon])

function DraggableVertex({ index, pos, onDragEnd }) {
  const icon = useMemo(()=>L.divIcon({ className:'vertex-handle', html:'', iconSize:[10,10] }),[])
  const ref = useRef(null)
  return (
    <Marker position={pos} icon={icon} draggable eventHandlers={{
      dragend: () => {
        const m = ref.current
        if (!m) return
        const p = m.getLatLng()
        onDragEnd(index, [p.lat, p.lng])
      }
    }} ref={ref}/>
  )
}

function ClickCatcher({ onAddPoint, onFinish }) {
  useMapEvents({
    click(e){ onAddPoint?.([e.latlng.lat, e.latlng.lng]) },
    dblclick(){ onFinish?.() }
  })
  return null
}

export default function GeofenceMapEditor({ geofences=[], draft=[], setDraft, showExisting=true, mode='draw' }){
  const [localDraft, setLocalDraft] = useState(draft)
  useEffect(()=>{ setLocalDraft(draft) }, [draft])
  useEffect(()=>{ setDraft && setDraft(localDraft) }, [localDraft]) // eslint-disable-line

  const isDrawing = mode === 'draw'

  function addPoint(p){ if(isDrawing) setLocalDraft(prev => [...prev, p]) }
  function finishDraw(){ /* no-op */ }
  function removeLast(){ setLocalDraft(prev => prev.slice(0,-1)) }
  function onVertexMove(idx, latlng){ setLocalDraft(prev => prev.map((p,i)=> i===idx ? latlng : p)) }

  return (
    <div style={{height:'calc(100vh - 180px)'}}>
      <div className="map-toolbar" style={{display:'flex', gap:8, margin:'6px 0'}}>
        <button className="btn" onClick={removeLast} disabled={!localDraft.length}>Ångra</button>
        <span className="muted">Punkter: {localDraft.length}</span>
      </div>
      <MapContainer center={defaultCenter} zoom={11} style={{height:'100%', borderRadius:12, zIndex:1, cursor: isDrawing ? 'crosshair' : 'grab'}} doubleClickZoom={false}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
        {showExisting && geofences.map(g => (
          <Polygon key={g.id} positions={toLatLngs(g.polygon)} pathOptions={{color:'#335039',weight:2,fillOpacity:0.1}}>
            <Popup><b>{g.name}</b><br/>{g.id}</Popup>
          </Polygon>
        ))}
        {localDraft.length>=2 && (
          <Polygon positions={toLatLngs(localDraft)} pathOptions={{color:'#b58900',weight:2,dashArray:'6 6',fillOpacity:0.08}} />
        )}
        {localDraft.map((p,i)=>(<DraggableVertex key={i} index={i} pos={p} onDragEnd={onVertexMove}/>))}
        {isDrawing && <ClickCatcher onAddPoint={addPoint} onFinish={finishDraw}/>}
      </MapContainer>
    </div>
  )
}
