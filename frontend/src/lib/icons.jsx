
export const ICONS = {
  geofence_exit: 'M3 3h10v10H3z M3 8h10',
  low_battery: 'M2 6h8v4H2z M10 7h2v2h-2z',
  temperature_high: 'M6 2v8a2 2 0 1 0 2 0V2z',
  default: 'M1 1h14v14H1z'
}
export function SvgIcon({ name='default', size=14, color='#335039', stroke=2 }){
  const d = ICONS[name] || ICONS.default
  return (<svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d={d} stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"/>
  </svg>)
}
export function iconForAlert(a){
  if(!a) return 'default'
  if((a.rule||'').includes('geofence')) return 'geofence_exit'
  if((a.rule||'').includes('battery')) return 'low_battery'
  if((a.rule||'').includes('temp')) return 'temperature_high'
  return 'default'
}
