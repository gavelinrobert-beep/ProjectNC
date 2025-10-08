
// src/components/AdminGeofences.jsx
import React, { useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'
import GeofenceMapEditor from './GeofenceMapEditor'

export default function AdminGeofences(){
  const [items, setItems] = useState([])
  const [form, setForm] = useState({ id:'', name:'', polygon:'[[62.39,17.30],[62.39,17.34],[62.36,17.34],[62.36,17.30]]' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [draftPoints, setDraftPoints] = useState([])

  async function refresh(){
    try { setItems(await api.geofences()) }
    catch(e){ console.error(e); setError('Kunde inte hämta geofences') }
  }
  useEffect(()=>{ refresh() }, [])

  function parsePoly(s){
    const p = JSON.parse(s)
    if (!Array.isArray(p) || !Array.isArray(p[0]) || p[0].length !== 2) throw new Error('Polygon måste vara [[lat,lon],...]')
    return p
  }

  useEffect(()=>{
    try { const p = parsePoly(form.polygon); setDraftPoints(p); setError('') }
    catch { /* ignore */ }
  }, [form.polygon])

  function onDraftChange(points){
    setDraftPoints(points)
    try { setForm(f => ({ ...f, polygon: JSON.stringify(points) })) } catch {}
  }

  async function onCreate(e){
    e.preventDefault()
    setLoading(true); setError('')
    try{
      const body = { id: form.id || undefined, name: form.name, polygon: parsePoly(form.polygon) }
      await api.createGeofence(body)
      setForm({ id:'', name:'', polygon: form.polygon })
      await refresh()
    }catch(err){ console.error(err); setError('Skapa misslyckades') } finally{ setLoading(false) }
  }

  async function onUpdate(id){
    setLoading(true); setError('')
    try{
      await api.updateGeofence(id, { name: form.name || id, polygon: parsePoly(form.polygon) })
      await refresh()
    }catch(err){ console.error(err); setError('Uppdatering misslyckades') } finally{ setLoading(false) }
  }

  async function onDelete(id){
    if(!confirm(`Ta bort geofence ${id}?`)) return
    setLoading(true); setError('')
    try{ await api.deleteGeofence(id); await refresh() }catch(err){ console.error(err); setError('Radering misslyckades') } finally{ setLoading(false) }
  }

  function startEdit(g){
    setForm({ id:g.id, name:g.name, polygon: JSON.stringify(g.polygon) })
  }

  const parsedItems = useMemo(()=> (items||[]).map(g=>({...g, polygon: Array.isArray(g.polygon)?g.polygon:[]})), [items])

  return (
    <div className="content" style={{display:'grid', gridTemplateColumns:'380px 1fr', gap:12}}>
      <div className="card" style={{border:'none', boxShadow:'none'}}>
        <h3>Geofences (Admin)</h3>
        {error && <div style={{color:'#b5392f', margin:'8px 0'}}>{error}</div>}

        <form onSubmit={onCreate} style={{display:'grid', gap:8}}>
          <input placeholder="id (valfritt)" value={form.id} onChange={e=>setForm({...form, id:e.target.value})}/>
          <input placeholder="name" required value={form.name} onChange={e=>setForm({...form, name:e.target.value})}/>
          <label className="muted" style={{fontSize:12}}>Polygon (JSON: [[lat,lon], ...])</label>
          <textarea rows={6} value={form.polygon} onChange={e=>setForm({...form, polygon:e.target.value})}/>
          <div style={{display:'flex', gap:8}}>
            <button className="btn" disabled={loading} type="submit">Skapa</button>
            {form.id && <button className="btn" type="button" onClick={()=>onUpdate(form.id)} disabled={loading}>Spara ändring</button>}
          </div>
        </form>

        <div style={{marginTop:12}} className="muted">Befintliga</div>
        <ul className="list">
          {parsedItems.map(g=>(
            <li key={g.id}>
              <span><b>{g.id}</b> — {g.name}</span>
              <span style={{display:'flex', gap:8}}>
                <button className="btn" onClick={()=>startEdit(g)}>Redigera</button>
                <button className="btn" onClick={()=>onDelete(g.id)}>Radera</button>
              </span>
            </li>
          ))}
          {parsedItems.length===0 && <li className="muted">Inga geofences ännu</li>}
        </ul>
      </div>

      <GeofenceMapEditor geofences={parsedItems} draft={draftPoints} setDraft={onDraftChange} showExisting />
    </div>
  )
}
