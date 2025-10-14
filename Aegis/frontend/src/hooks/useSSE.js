import React from 'react'
import { API_BASE } from '../lib/api'
export function useSSE(path,onMessage){React.useEffect(()=>{const es=new EventSource(`${API_BASE}${path}`);es.onmessage=(e)=>{try{onMessage&&onMessage(JSON.parse(e.data))}catch{}};es.onerror=()=>{};return()=>es.close()},[path,onMessage])}
