# Week 1 Commercial MVP Testing Guide

This guide helps you test the new customer tracking and driver mobile app features.

## Prerequisites

1. **Start the backend:**
   ```bash
   cd backend
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Start the frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Load demo data** (if not already loaded):
   ```bash
   psql -U postgres -d aegis_light < backend/scripts/sundsvall_demo_data.sql
   ```

## Test Scenarios

### 1. Public Customer Tracking Page

**Objective:** Verify customers can track their deliveries without authentication.

**Steps:**
1. Open browser to: `http://localhost:5173/track/DEL-SND-001`
2. You should see:
   - ✅ Delivery status badge (e.g., "På väg" / "In Transit")
   - ✅ Live map with route
   - ✅ Driver location marker (truck icon)
   - ✅ Status timeline (Created → Picked Up → In Transit → Delivered)
   - ✅ Delivery information (addresses, estimated time)
   - ✅ Vehicle and driver information
   - ✅ All text in Swedish

**Expected Results:**
- Page loads without login
- Map shows route from Sundsvall HQ to ICA Maxi Birsta
- Live indicator shows "LIVE" in green
- Status updates every 10 seconds (check Network tab for SSE)

**Test Multiple Deliveries:**
- `/track/DEL-SND-001` - Express delivery to ICA Maxi (in_transit)
- `/track/DEL-SND-002` - Medical equipment to hospital (picked_up)
- `/track/DEL-SND-003` - Office supplies (assigned)
- `/track/DEL-SND-004` - IT equipment (in_transit)
- `/track/DEL-SND-005` - Sports equipment (planned)

### 2. Driver Mobile App - Login

**Objective:** Verify drivers can login with PIN.

**Steps:**
1. Open browser to: `http://localhost:5173/driver`
2. You should see:
   - ✅ Login screen with truck emoji
   - ✅ PIN input field (4 digits)
   - ✅ All text in Swedish
   - ✅ Demo hint about PIN codes

**Demo PINs (last 4 digits of vehicle ID):**
- `0001` - Erik Andersson (VEH-SND-01, ABC 123)
- `0002` - Anna Bergström (VEH-SND-02, DEF 456)
- `0004` - Lars Carlsson (VEH-SND-04, JKL 012)
- `0006` - Maria Danielsson (VEH-SND-06, PQR 678)
- `0009` - Johan Eriksson (VEH-SND-09, YZÅ 567)

**Test Login:**
1. Enter PIN: `0001`
2. Click "Logga in"
3. Should redirect to deliveries list
4. Header should show: "👋 Hej Erik Andersson" and "ABC 123"

**Expected Results:**
- ✅ Valid PIN logs in successfully
- ✅ Invalid PIN shows error: "Ogiltig PIN eller ingen förare tilldelad"
- ✅ Driver name and vehicle displayed

### 3. Driver Mobile App - Deliveries List

**Objective:** Verify drivers can see their assigned deliveries.

**Steps:**
1. Login with PIN `0001` (Erik Andersson)
2. You should see:
   - ✅ "Dagens leveranser" header
   - ✅ Refresh button (🔄)
   - ✅ List of deliveries with status badges
   - ✅ Delivery names and descriptions
   - ✅ Scheduled times

**For PIN 0001 (Erik), you should see:**
- "Express leverans ICA Maxi" - Status: På väg (orange)

**Test Actions:**
1. Click refresh button - list should update
2. Tap on a delivery card - should show details
3. Check status colors:
   - Orange = På väg (in_transit)
   - Yellow = Upphämtad (picked_up)
   - Blue = Tilldelad (assigned)
   - Gray = Planerad (planned)
   - Green = Klar (completed)

### 4. Driver Mobile App - Delivery Details

**Objective:** Verify delivery details and map display.

**Steps:**
1. From deliveries list, tap "Express leverans ICA Maxi"
2. You should see:
   - ✅ Back button (←)
   - ✅ Delivery name and ID
   - ✅ Map showing pickup and delivery locations
   - ✅ Status section with colored badge
   - ✅ Pickup address (📍 Upphämtning)
   - ✅ Delivery address (🏁 Leverans)
   - ✅ Notes textarea
   - ✅ Action buttons based on status

**Test based on status:**

**If status = "Tilldelad" (assigned):**
- Should see: "📦 Markera som upphämtad" button (orange)

**If status = "På väg" (in_transit):**
- Should see: "✅ Markera som levererad" button (green)

### 5. Driver Mobile App - Mark as Picked Up

**Objective:** Test pickup confirmation.

**Steps:**
1. Find a delivery with status "Tilldelad" (e.g., DEL-SND-003)
2. Add note: "Paket mottaget"
3. Click "📦 Markera som upphämtad"
4. Should return to deliveries list
5. Delivery status should update to "Upphämtad"

**Expected Results:**
- ✅ Status updates in backend
- ✅ `picked_up_at` timestamp recorded
- ✅ Returns to deliveries list
- ✅ Status badge color changes to yellow

### 6. Driver Mobile App - Signature Capture

**Objective:** Test signature capture for delivery completion.

**Steps:**
1. Find a delivery with status "På väg" or "Upphämtad"
2. Click "✅ Markera som levererad"
3. Should show signature screen:
   - ✅ "Signatur krävs" header
   - ✅ Recipient name input field
   - ✅ Signature canvas (white with dashed border)
   - ✅ "Rensa" button to clear canvas
   - ✅ "Avbryt" and "Spara signatur" buttons

**Test signature:**
1. Enter recipient name: "Anna Svensson"
2. Draw signature on canvas (use mouse or touch)
3. Click "Rensa" - canvas should clear
4. Draw signature again
5. Click "Spara signatur"
6. Should return to detail screen
7. Button should now show: "✅ Bekräfta leverans med signatur"

**Expected Results:**
- ✅ Canvas is touch-friendly
- ✅ Drawing works smoothly
- ✅ Clear button works
- ✅ Signature is saved as base64 PNG
- ✅ Cannot save without recipient name

### 7. Driver Mobile App - Complete Delivery

**Objective:** Test delivery completion with signature.

**Steps:**
1. After capturing signature, click "✅ Bekräfta leverans med signatur"
2. Optional: Add notes in textarea before confirming
3. Loading state should show "Sparar..."
4. Should return to deliveries list
5. Delivery should disappear or show as "Klar"

**Expected Results:**
- ✅ Status updates to "completed"
- ✅ `delivered_at` timestamp recorded
- ✅ Signature saved in `signature_image` column
- ✅ Recipient name saved in `delivered_to` column

### 8. Real-Time GPS Location Updates

**Objective:** Verify GPS tracking works automatically.

**Steps:**
1. Login as driver
2. Open delivery details
3. Check browser console for GPS permissions
4. Allow location access when prompted
5. Open Network tab, filter by "update-location"
6. You should see POST requests every 30 seconds

**Expected Results:**
- ✅ Browser requests location permission
- ✅ Location updates sent every 30 seconds
- ✅ Vehicle position updates in database
- ✅ Customer tracking page shows updated position

**Note:** For testing without real GPS:
- Browser will simulate location if GPS not available
- You can use Chrome DevTools > Sensors to mock GPS coordinates

### 9. Public Tracking - Proof of Delivery

**Objective:** Verify completed deliveries show signature.

**Steps:**
1. Complete a delivery with signature (see test #7)
2. Open tracking page: `/track/{delivery_id}`
3. Scroll down to "Leveransbevis" (Proof of Delivery) section
4. You should see:
   - ✅ Green background section
   - ✅ "✅ Leveransbevis" header
   - ✅ Recipient name (Mottagare)
   - ✅ Delivery timestamp (Levererad)
   - ✅ Signature image (Signatur)
   - ✅ Driver notes if any

**Expected Results:**
- ✅ Signature displays correctly
- ✅ All information is in Swedish
- ✅ Timestamp is formatted as Swedish locale

### 10. Real-Time SSE Updates

**Objective:** Verify Server-Sent Events work for live tracking.

**Steps:**
1. Open tracking page: `/track/DEL-SND-001`
2. Open browser DevTools > Network tab
3. Look for connection to `/track/DEL-SND-001/live`
4. Connection type should be "eventsource"
5. Should see periodic updates every 5-10 seconds

**Test live updates:**
1. Keep tracking page open
2. In another tab/device, login as driver
3. Update location or status
4. Tracking page should update automatically (no refresh needed)

**Expected Results:**
- ✅ SSE connection established
- ✅ Heartbeat messages every 5 seconds
- ✅ Location updates appear in real-time
- ✅ Status changes trigger immediate update

## API Testing with cURL

### Public Tracking API

```bash
# Get delivery details
curl http://localhost:8000/track/DEL-SND-001

# Expected response:
{
  "id": "DEL-SND-001",
  "status": "in_transit",
  "name": "Express leverans ICA Maxi",
  "waypoints": [...],
  "vehicle": { ... },
  "driver": { ... }
}
```

### Driver Login API

```bash
# Login with PIN
curl -X POST http://localhost:8000/api/driver/login \
  -H "Content-Type: application/json" \
  -d '{"pin": "0001"}'

# Expected response:
{
  "success": true,
  "driver_id": "DRV-SND-01",
  "driver_name": "Erik Andersson",
  "vehicle_id": "VEH-SND-01",
  "vehicle_registration": "ABC 123",
  "message": "Inloggning lyckades"
}
```

### Get Driver Deliveries

```bash
# Get today's deliveries for vehicle
curl http://localhost:8000/api/driver/deliveries/VEH-SND-01

# Expected response:
{
  "vehicle_id": "VEH-SND-01",
  "date": "2025-11-17",
  "deliveries": [...],
  "total_count": 1
}
```

### Update Delivery Status

```bash
# Mark as picked up
curl -X POST http://localhost:8000/api/driver/update-status \
  -H "Content-Type: application/json" \
  -d '{
    "delivery_id": "DEL-SND-003",
    "status": "picked_up",
    "driver_notes": "Paket mottaget"
  }'

# Mark as delivered with signature
curl -X POST http://localhost:8000/api/driver/update-status \
  -H "Content-Type: application/json" \
  -d '{
    "delivery_id": "DEL-SND-003",
    "status": "delivered",
    "signature_image": "data:image/png;base64,iVBORw0KG...",
    "delivered_to": "Anna Svensson",
    "driver_notes": "Leverans klar"
  }'
```

### Update GPS Location

```bash
# Send location update
curl -X POST http://localhost:8000/api/driver/update-location \
  -H "Content-Type: application/json" \
  -d '{
    "delivery_id": "DEL-SND-001",
    "lat": 62.4127,
    "lon": 17.3291,
    "speed": 45.5,
    "heading": 90.0,
    "accuracy": 10.0
  }'
```

## Mobile Testing

### iOS Safari
1. Open Safari on iPhone
2. Navigate to `http://[your-ip]:5173/driver`
3. Test PIN login with on-screen keyboard
4. Test signature capture with finger
5. Allow location access when prompted

### Android Chrome
1. Open Chrome on Android
2. Navigate to `http://[your-ip]:5173/driver`
3. Test PIN login
4. Test signature capture
5. Allow location access

### Mobile-Specific Features to Test
- ✅ Touch events work on signature canvas
- ✅ Virtual keyboard appears for PIN input
- ✅ Large buttons are easy to tap
- ✅ GPS location updates work
- ✅ Layout is responsive on small screens
- ✅ Maps are interactive (pinch to zoom)

## Performance Checks

### Backend
- [ ] API responses < 200ms
- [ ] SSE connections stay alive for 5+ minutes
- [ ] Location updates process within 100ms
- [ ] Database queries optimized with indexes

### Frontend
- [ ] Initial page load < 3 seconds
- [ ] Map renders within 1 second
- [ ] Signature canvas responds immediately
- [ ] GPS updates don't block UI

## Known Issues / Limitations

1. **Demo PIN Security:** PINs are simple (last 4 digits). Production should use proper authentication with hashed PINs and JWT tokens.

2. **GPS Accuracy:** Browser geolocation can be inaccurate (10-100m). For production, consider using a dedicated GPS device.

3. **Offline Support:** Currently requires internet connection. Future version should cache delivery data for offline viewing.

4. **Signature Storage:** Stored as base64 in database. For production with many deliveries, consider storing in object storage (S3, etc.).

5. **SSE Reconnection:** If connection drops, page needs manual refresh. Consider automatic reconnection logic.

## Success Criteria Checklist

After testing, verify all success criteria are met:

- [ ] Can share tracking link with customer: `http://localhost:5173/track/DEL-SND-001`
- [ ] Customer sees live driver location on map
- [ ] Driver can login with PIN on phone
- [ ] Driver can see today's deliveries
- [ ] Driver can mark delivery as picked up
- [ ] Driver can capture signature and mark delivered
- [ ] GPS position updates automatically every 30 seconds
- [ ] Demo data shows realistic Sundsvall scenario
- [ ] All text in Swedish

## Troubleshooting

### "Delivery not found" error
- Check that demo data is loaded: `psql -U postgres -d aegis_light -c "SELECT id, name FROM tasks WHERE id LIKE 'DEL-SND-%'"`
- Verify delivery ID is correct (case-sensitive)

### "Invalid PIN" error
- Check driver-vehicle assignments: `psql -U postgres -d aegis_light -c "SELECT d.id, d.first_name, d.assigned_vehicle_id, a.id, a.registration FROM drivers d LEFT JOIN assets a ON d.assigned_vehicle_id = a.id WHERE d.id LIKE 'DRV-SND-%'"`
- Remember PIN is last 4 characters of vehicle ID (e.g., "0001" for "VEH-SND-01")

### GPS not working
- Check browser console for permission errors
- Ensure HTTPS or localhost (HTTP geolocation only works on secure origins)
- Use Chrome DevTools > Sensors to simulate location

### Map not loading
- Check internet connection (tiles loaded from OpenStreetMap)
- Check browser console for Leaflet errors
- Verify coordinates are valid (lat: 62.x, lon: 17.x for Sundsvall)

### SSE connection failing
- Check CORS settings in backend
- Verify backend is running on port 8000
- Check browser Network tab for connection errors
- Some browsers limit number of concurrent SSE connections (max 6)

## Next Steps for Production

1. **Security:**
   - Implement proper JWT authentication
   - Hash and salt driver PINs
   - Add rate limiting to prevent brute force
   - Validate all input data

2. **Performance:**
   - Add caching for delivery data
   - Optimize database queries
   - Implement connection pooling
   - Add CDN for static assets

3. **Features:**
   - Push notifications for status updates
   - Offline mode with service workers
   - Photo capture for proof of delivery
   - Route optimization
   - Multi-stop deliveries
   - Customer SMS/email notifications

4. **Monitoring:**
   - Add logging for all API calls
   - Track SSE connection health
   - Monitor GPS accuracy
   - Alert on failed deliveries

5. **Compliance:**
   - GDPR compliance for customer data
   - Data retention policies
   - Audit logs for deliveries
   - Signature legal validity
