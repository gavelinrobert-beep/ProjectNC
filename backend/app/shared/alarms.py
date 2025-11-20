"""
Alarm creation logic for Aegis backend.
"""
from .constants import ALARM_TYPES
import asyncio

async def create_alarm(conn, asset_id: str, alarm_type: str, geofence_id: str = None, extra_data: str = "", alert_subs=None):
    """Create an alarm with type and color information."""
    # Default alarm info for unknown types
    default_alarm = {
        "name": "System Alert",
        "color": "#808080",
        "severity": "medium",
        "icon": "ℹ️"
    }
    alarm_info = ALARM_TYPES.get(alarm_type, default_alarm)
    rule = f"{alarm_info['icon']} {alarm_info['name']}"
    if extra_data:
        rule += f" - {extra_data}"

    try:
        rec = await conn.fetchrow("""
            INSERT INTO alerts(asset_id, geofence_id, rule)
            VALUES($1,$2,$3)
            RETURNING id, asset_id, geofence_id, rule, acknowledged, ts
        """, asset_id, geofence_id, rule)

        alert = {
            'id': rec['id'],
            'asset_id': rec['asset_id'],
            'geofence_id': rec['geofence_id'],
            'rule': rec['rule'],
            'acknowledged': rec['acknowledged'],
            'ts': rec['ts'].isoformat(),
            'alarm_type': alarm_type,
            'color': alarm_info['color'],
            'severity': alarm_info['severity']
        }

        if alert_subs:
            for q in list(alert_subs):
                if not q.full():
                    q.put_nowait([alert])

        return alert
    except Exception as e:
        print(f"[ERROR] Failed to create alarm: {e}")
        return None
