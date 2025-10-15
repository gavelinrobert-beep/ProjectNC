import { authHeader } from './auth'
export const API_BASE=(import.meta.env.VITE_API_BASE&&import.meta.env.VITE_API_BASE.replace(/\/$/,''))||`${location.protocol}//${location.hostname}:8000`

console.log('[API] Using API_BASE:', API_BASE)

async function send(method,path,body){
  const url = API_BASE+path
  console.log(`[API] ${method} ${url}`)

  const res=await fetch(url,{method,headers:{'Content-Type':'application/json',...authHeader()},body:body?JSON.stringify(body):undefined})
  const txt=await res.text().catch(()=> '')

  if(!res.ok){
    console.error(`[API] Error ${res.status}:`, txt)
    try{const j=JSON.parse(txt);throw new Error(j.detail||j.message||txt||`${res.status} ${res.statusText}`)}catch{throw new Error(txt||`${res.status} ${res.statusText}`)}}
  try{return JSON.parse(txt)}catch{return txt}
}

export const api={
  login:(e,p)=>send('POST','/auth/login',{email:e,password:p}),
  alerts:()=>send('GET','/alerts'),
  alertsCsv:()=>fetch(API_BASE+'/alerts.csv',{headers:authHeader()}).then(r=>r.text()),
  alertsPdf:()=>fetch(API_BASE+'/alerts.pdf',{headers:authHeader()}),
  ackAlert:(id)=>send('PUT',`/alerts/${id}/ack`),
  assets:()=>send('GET','/assets'),
  bases:()=>send('GET','/bases'),
  createBase:(b)=>send('POST','/bases',b),
  deleteBase:(id)=>send('DELETE',`/bases/${id}`),
  geofences:()=>send('GET','/geofences'),
  createGeofence:(g)=>send('POST','/geofences',g),
  updateGeofence:(id,g)=>send('PUT',`/geofences/${id}`,g),
  deleteGeofence:(id)=>send('DELETE',`/geofences/${id}`),
  weather:(lat,lon)=>send('GET',`/weather?lat=${lat}&lon=${lon}`),
  weatherByBase:(baseId)=>send('GET',`/weather/${baseId}`)
}