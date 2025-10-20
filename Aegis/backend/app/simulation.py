"""
Simulation loop for Aegis backend.

- Maintains ASSET_SUBS and ALERT_SUBS subscriber lists (asyncio.Queue instances).
- Updates asset positions using utils.update_asset_position and constants.STREET_ROUTES.
- Drains batteries for battery-powered assets.
- Broadcasts asset snapshots to ASSET_SUBS every tick.
- Every 10 ticks, fetches geofences from the DB, checks geofence entry/exit,
  creates alarms via alarms.create_alarm (which also notifies ALERT_SUBS).
- Also triggers random communication and maintenance alarms like the original code.

Drop this file into Aegis/backend/app/ and wire up startup code to call:
    asyncio.create_task(simulation_loop())
"""

import asyncio
import random
import json
from datetime import datetime
from typing import List

from .constants import ASSETS, STREET_ROUTES
from .utils import update_asset_position, point_in_poly
from .alarms import create_alarm
from .database import get_pool

# Subscribers for Server-Sent Events (SSE)
ASSET_SUBS: List[asyncio.Queue] = []
ALERT_SUBS: List[asyncio.Queue] = []

async def simulation_loop():
    """
    Main simulation loop.

    - Runs indefinitely.
    - Sleeps 1 second per tick.
    - Updates positions & batteries every tick.
    - Broadcasts asset snapshots every tick.
    - Performs alarm checks (geofence, battery, random) every 10 ticks.
    """
    pool = await get_pool()
    tick = 0

    while True:
        await asyncio.sleep(1.0)
        tick += 1

        # Update positions and battery states
        for a in ASSETS:
            try:
                update_asset_position(a, STREET_ROUTES)
            except Exception:
                # If a route/point is malformed, skip updating this tick
                continue

            # Drain battery if applicable
            if a.get("has_battery", False) and a.get("battery") is not None and a["battery"] > 0:
                a["battery"] = max(0, a["battery"] - a.get("battery_drain", 0))

        # Broadcast updated positions to subscribers
        snapshot = [{
            'id': a['id'],
            'lat': a['lat'],
            'lon': a['lon'],
            'type': a['type'],
            'status': a.get('status', 'mobile'),
            'battery': a.get('battery'),
            'has_battery': a.get('has_battery', False),
            'fuel_type': a.get('fuel_type', 'unknown')
        } for a in ASSETS]

        for q in list(ASSET_SUBS):
            try:
                if not q.full():
                    q.put_nowait(snapshot)
            except Exception:
                # Remove dead/closed queues if they error
                try:
                    ASSET_SUBS.remove(q)
                except ValueError:
                    pass

        # Alarm checks every 10 seconds
        if tick % 10 == 0:
            try:
                async with pool.acquire() as conn:
                    rows = await conn.fetch('SELECT id, polygon FROM geofences')
                    polys = []
                    for g in rows:
                        poly = g['polygon']
                        # polygon may be stored as text/string; ensure it's a list
                        if isinstance(poly, str):
                            try:
                                poly = json.loads(poly)
                            except Exception:
                                poly = []
                        if not isinstance(poly, list):
                            poly = []
                        polys.append({'id': g['id'], 'polygon': poly})

                    for a in ASSETS:
                        # Geofence detection
                        currently_inside = False
                        current_geofence = None

                        for g in polys:
                            try:
                                if point_in_poly(a['lat'], a['lon'], g['polygon']):
                                    currently_inside = True
                                    current_geofence = g['id']

                                    if not a.get('in_geofence', False):
                                        # Entered geofence
                                        await create_alarm(conn, a['id'], 'geofence_entry', g['id'], g['id'], alert_subs=ALERT_SUBS)
                                    break
                            except Exception:
                                # skip malformed polygon or point errors
                                continue

                        if not currently_inside and a.get('in_geofence', False):
                            # Exited geofence
                            await create_alarm(conn, a['id'], 'geofence_exit', None, "Left monitored area", alert_subs=ALERT_SUBS)

                        a['in_geofence'] = currently_inside

                        # Battery alarms (for battery-powered assets)
                        if a.get("has_battery", False) and a.get("battery") is not None:
                            battery = a["battery"]
                            if battery <= 15 and battery > 0:
                                if tick - a.get('last_alarm_tick', 0) > 300:
                                    await create_alarm(conn, a['id'], 'critical_battery', None, f"{battery:.1f}%", alert_subs=ALERT_SUBS)
                                    a['last_alarm_tick'] = tick
                            elif battery <= 30:
                                if tick - a.get('last_alarm_tick', 0) > 600:
                                    await create_alarm(conn, a['id'], 'low_battery', None, f"{battery:.1f}%", alert_subs=ALERT_SUBS)
                                    a['last_alarm_tick'] = tick

                        # Random communication issues for aircraft (1% chance)
                        if a['type'] in ['plane', 'helicopter'] and a.get('status') == 'airborne':
                            if random.random() < 0.01:
                                await create_alarm(conn, a['id'], 'communication_lost', None, "Signal lost", alert_subs=ALERT_SUBS)

                        # Random maintenance alerts for parked assets (0.5% chance)
                        if a.get('status') == 'parked':
                            if random.random() < 0.005:
                                await create_alarm(conn, a['id'], 'maintenance_required', None, "Scheduled service due", alert_subs=ALERT_SUBS)
            except Exception as e:
                # Log and continue loop; don't crash the simulation
                print(f"[SIMULATION] Error during alarm checks: {e}")
                continue
