# Week 1 MVP Demo Quick Start

**Demo Date:** November 19-24, 2025  
**Target:** Sundsvall transport companies (2-10 vehicles)

## 🚀 Quick Demo Setup (5 minutes)

### 1. Start Services

```bash
# Terminal 1: Backend
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2: Frontend  
cd frontend
npm run dev

# Terminal 3: Load demo data (first time only)
psql -U postgres -d aegis_light < backend/scripts/sundsvall_demo_data.sql
```

### 2. Demo URLs

**For Customers (Public - No Login):**
- Track delivery: `http://localhost:5173/track/DEL-SND-001`
- Track urgent delivery: `http://localhost:5173/track/DEL-SND-002`

**For Drivers (Mobile - PIN Login):**
- Driver app: `http://localhost:5173/driver`
- Demo PIN: `0001` (Erik Andersson, vehicle ABC 123)

**For Admin (Dashboard - Login Required):**
- Admin dashboard: `http://localhost:5173/`
- Default credentials (if needed)

## 📱 Demo Flow (Customer Perspective)

### Scenario: Customer tracking their delivery

1. **Share link with customer:**
   - "Spåra din leverans här: http://aegis.se/track/DEL-SND-001"

2. **Customer opens link** (no login required):
   - Sees real-time map with driver location
   - Status: "På väg" (In transit)
   - ETA: 25 minutes
   - Pickup: Sundsvall HQ
   - Delivery: ICA Maxi Birsta
   - Driver: Erik Andersson (ABC 123)

3. **Live updates every 10 seconds:**
   - Green "LIVE" indicator pulses
   - Driver location updates on map
   - Status changes automatically

4. **When delivered:**
   - Status changes to "Levererad" (Delivered)
   - Shows proof of delivery:
     - Recipient signature
     - Delivery timestamp
     - Recipient name
     - Driver notes

## 🚛 Demo Flow (Driver Perspective)

### Scenario: Driver completing a delivery

1. **Driver opens app on phone:**
   - Navigate to: `http://localhost:5173/driver`
   - See login screen in Swedish

2. **Login with PIN:**
   - Enter: `0001`
   - Click "Logga in"
   - Logged in as: Erik Andersson (ABC 123)

3. **View deliveries:**
   - "Dagens leveranser" (Today's deliveries)
   - See: "Express leverans ICA Maxi" - Status: På väg

4. **Select delivery:**
   - Tap delivery card
   - See map with route
   - See pickup and delivery addresses
   - See current status

5. **Mark as picked up:**
   - If status is "Tilldelad" (Assigned)
   - Tap "📦 Markera som upphämtad"
   - Status changes to "Upphämtad"

6. **Mark as delivered:**
   - Tap "✅ Markera som levererad"
   - Enter recipient name: "Anna Svensson"
   - Draw signature on canvas
   - Tap "Spara signatur"
   - Tap "Bekräfta leverans med signatur"
   - Status changes to "Levererad" (Delivered)

7. **GPS tracking (automatic):**
   - Location updates every 30 seconds
   - Customer sees live position
   - No action needed from driver

## 🎯 Key Selling Points to Demonstrate

### 1. **Eliminates Phone Calls** (20+ per day)
- **Before:** "Where's my delivery?" calls every 30 minutes
- **After:** Customer tracks in real-time, no calls needed
- **Demo:** Show live tracking page updating automatically

### 2. **Proof of Delivery** (Legal protection)
- **Before:** Disputes about "never received" deliveries
- **After:** Digital signature + timestamp + GPS proof
- **Demo:** Show completed delivery with signature

### 3. **No App Store Needed** (Instant deployment)
- **Before:** Weeks to develop and deploy native apps
- **After:** Works immediately in any phone browser
- **Demo:** Open on iPhone Safari AND Android Chrome

### 4. **Professional Customer Experience**
- **Before:** Generic text message or email
- **After:** Branded tracking page like DHL/UPS
- **Demo:** Show clean, Swedish UI on mobile

### 5. **Driver-Friendly** (Easy to use while working)
- **Before:** Paper forms, manual signatures, phone calls
- **After:** Tap buttons, draw signature, automatic GPS
- **Demo:** Complete delivery in under 60 seconds

## 📊 Demo Data Overview

### Facilities (5)
- **Sundsvall HQ** - Main warehouse (Norra Kajen)
- **Birsta Terminal** - Distribution center
- **Timrå Depot** - Local depot
- **Stockholm DC** - Long-haul hub
- **Göteborg Warehouse** - West coast hub

### Vehicles (10 Swedish plates)
- ABC 123, DEF 456, GHI 789, JKL 012, MNO 345
- PQR 678, STU 901, VWX 234, YZÅ 567, ÄÖÅ 890
- Mix of Skåpbilar (vans) and Lastbilar (trucks)

### Drivers (8 Swedish names)
- Erik Andersson (PIN: 0001)
- Anna Bergström (PIN: 0002)
- Lars Carlsson (PIN: 0004)
- Maria Danielsson (PIN: 0006)
- Johan Eriksson (PIN: 0009)

### Active Deliveries (5)
1. **DEL-SND-001** - Express to ICA Maxi (in_transit)
2. **DEL-SND-002** - Medical equipment to hospital (picked_up, urgent)
3. **DEL-SND-003** - Office supplies to Länsförsäkringar (assigned)
4. **DEL-SND-004** - IT equipment to university (in_transit)
5. **DEL-SND-005** - Sports equipment to Nordichallen (planned)

### Completed Deliveries (3 - showing history)
- Shows system handles real operations
- Demonstrates reporting capabilities

## 🎬 Demo Script (5-Minute Version)

**Opening (30 seconds):**
> "Dagens transportföretag får 20+ samtal per dag: 'Var är min leverans?' 
> Låt mig visa hur AEGIS löser detta på 60 sekunder."

**Customer Tracking (2 minutes):**
1. Open: `http://localhost:5173/track/DEL-SND-001`
2. Point out:
   - ✅ No login required (public link)
   - ✅ Real-time map with driver location
   - ✅ Live updates (green indicator)
   - ✅ Professional Swedish interface
   - ✅ Works on any device (show on phone)

**Driver App (2 minutes):**
1. Open: `http://localhost:5173/driver` on phone
2. Login with PIN: `0001`
3. Show today's deliveries
4. Select a delivery
5. Demonstrate:
   - ✅ Simple interface (large buttons)
   - ✅ Mark as picked up (one tap)
   - ✅ Signature capture (touch-friendly)
   - ✅ Automatic GPS tracking

**Proof of Delivery (30 seconds):**
1. Show completed delivery with signature
2. Point out:
   - ✅ Legal proof (signature + timestamp + GPS)
   - ✅ Protects against disputes
   - ✅ Customer can see immediately

**Closing (30 seconds):**
> "Redo att testa med era förare imorgon. Ingen app-installation. 
> Fungerar direkt i mobilen. Frågor?"

## 🔧 Troubleshooting During Demo

### "Page not loading"
- Check WiFi connection
- Verify services are running: `ps aux | grep uvicorn`
- Restart services if needed

### "Delivery not found"
- Demo data might not be loaded
- Run: `psql -U postgres -d aegis_light < backend/scripts/sundsvall_demo_data.sql`

### "Map not showing"
- Internet required for map tiles (OpenStreetMap)
- Check browser console for errors
- Use mobile hotspot as backup

### "GPS not working"
- Browser needs location permission
- HTTPS required (or localhost)
- Use Chrome DevTools > Sensors to simulate if needed

### "Invalid PIN"
- Use exact PIN: `0001` (not `1` or `001`)
- Check driver assignments in database if custom data loaded

## 📈 Metrics to Mention

**Time Savings:**
- 20+ phone calls eliminated per day = 2-3 hours saved
- Driver completes delivery in 60 seconds (vs 5+ minutes with paper)
- Instant proof of delivery (vs waiting for driver return)

**Cost Savings:**
- No app development costs (€50,000+ for native apps)
- No App Store fees (€100/year per platform)
- Instant deployment (vs 2-4 week app approval)
- No training required (intuitive Swedish interface)

**Customer Satisfaction:**
- Real-time tracking (like DHL, UPS)
- Professional branded experience
- Swedish language (local trust)
- Mobile-friendly (90% use phones)

**Legal Protection:**
- Digital signature with timestamp
- GPS location proof
- Photo capability (future)
- Audit trail for disputes

## 🎯 Target Customer Profile

**Company Size:** 2-10 vehicles  
**Industry:** Local transport, courier services  
**Location:** Sundsvall and surrounding area  
**Current Pain:** Manual processes, customer phone calls, delivery disputes

**Ideal Prospects:**
- Sundsvall Express AB
- Timrå Transport
- Mittrans Logistik
- Local flower delivery services
- Restaurant food deliveries
- Medical supply distributors

## 📞 Demo Follow-Up

After demo, offer:
1. **Free trial:** 30 days with their data
2. **Setup assistance:** Load their vehicles and drivers
3. **Training session:** 1-hour Zoom for their team
4. **Custom branding:** Add their logo and colors
5. **Integration:** Connect to their existing systems

**Next Steps:**
- Send demo video recording
- Schedule follow-up call (1 week)
- Prepare pricing based on vehicle count
- Gather their specific requirements

## 🚀 Production Deployment Checklist

Before going live with real customer:

- [ ] Set up production database (PostgreSQL)
- [ ] Configure domain name (e.g., track.sundsvallexpress.se)
- [ ] Enable HTTPS with SSL certificate
- [ ] Set up proper authentication (JWT tokens)
- [ ] Hash driver PINs (bcrypt)
- [ ] Configure email notifications
- [ ] Set up monitoring and alerts
- [ ] Add data backup system
- [ ] Create admin user accounts
- [ ] Load real vehicle and driver data
- [ ] Test with 1-2 real deliveries first
- [ ] Train all drivers (30-minute session)
- [ ] Prepare customer communication (email template)

## 📋 Demo Checklist

Before each demo:

- [ ] Backend running on port 8000
- [ ] Frontend running on port 5173
- [ ] Demo data loaded in database
- [ ] Test tracking link: DEL-SND-001
- [ ] Test driver login: PIN 0001
- [ ] Check internet connection for maps
- [ ] Have backup mobile hotspot ready
- [ ] Phone charged and ready
- [ ] Browser tabs pre-opened
- [ ] Demo script printed/accessible
- [ ] Business cards ready
- [ ] Pricing sheet prepared

## 💡 Demo Tips

1. **Start with problem:** "20+ daily phone calls"
2. **Show, don't tell:** Let them see it work
3. **Use their language:** "Sundsvall addresses" "Swedish interface"
4. **Mobile first:** Most impact is on driver's phone
5. **Speed matters:** Complete delivery in 60 seconds
6. **Legal angle:** Proof of delivery protects them
7. **Cost comparison:** vs app development (€50k+)
8. **Instant deployment:** "Ready tomorrow"
9. **Professional look:** "Like DHL/UPS tracking"
10. **Local trust:** Swedish language builds confidence

## 🎁 Value Proposition

**For Transport Company Owner:**
- Reduce phone interruptions (20+ calls/day → 0)
- Professional customer experience
- Legal protection from disputes
- No IT investment required
- Pay per vehicle (predictable cost)

**For Drivers:**
- Simple, fast interface
- No paper forms
- Automatic GPS tracking
- Works on any phone
- Minimal training needed

**For Customers:**
- Track delivery like DHL/UPS
- No phone calls needed
- Know exactly when delivery arrives
- Professional experience
- Works on any device

---

**Demo Contact:**  
Robert Gavelin  
gavelinrobert-beep  
Target Launch: November 24, 2025
