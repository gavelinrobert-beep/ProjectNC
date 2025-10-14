import React from 'react'
export function StatusDot({color='green'}){const map={red:'#b5392f',yellow:'#d9b945',green:'#3aa86f'};const c=map[color]||map.green;return <span style={{display:'inline-block',width:10,height:10,borderRadius:999,background:c}}/>}
export function SvgIcon({name}){return <span>{name}</span>}
export function iconForAlert(a){return a.rule||'!'}
