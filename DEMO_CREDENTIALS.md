# AEGIS Light - Demo Credentials & Test Data

This document contains all login credentials and test data for the AEGIS Light demo, including Swedish test data for realistic demonstrations.

## 🔐 Login Credentials

### Admin Dashboard Access
**For: Administrators and dispatchers**

- **URL:** `http://localhost:5173/` (or ngrok URL)
- **Email:** `admin@sundsvall.se`
- **Password:** `admin123`

**Capabilities:**
- Full system access
- View all deliveries and drivers
- Assign tasks
- Generate reports
- Manage users and settings

---

### Driver Mobile App Access
**For: Delivery drivers using mobile devices**

- **URL:** `http://localhost:5173/driver` (or ngrok URL + /driver)
- **Authentication:** PIN-based login (no password needed)

#### Available Driver PINs:

| Driver Name          | PIN  | Vehicle    | License Plate |
|---------------------|------|------------|---------------|
| Erik Andersson      | 0001 | Skåpbil    | ABC 123       |
| Anna Bergström      | 0002 | Lastbil    | DEF 456       |
| Lars Carlsson       | 0004 | Skåpbil    | GHI 789       |
| Maria Danielsson    | 0006 | Lastbil    | JKL 012       |
| Johan Eriksson      | 0009 | Skåpbil    | MNO 345       |

**Driver App Features:**
- View assigned deliveries
- Mark packages as picked up
- Mark deliveries as completed
- Capture digital signatures
- Add delivery notes
- Automatic GPS tracking

---

### Public Tracking (No Login Required)
**For: Customers tracking their deliveries**

Customers can track deliveries without any login using a tracking link:

- **Format:** `http://localhost:5173/track/{TRACKING_NUMBER}`

#### Demo Tracking Numbers:

| Tracking Number | Description                | Status      | Driver           |
|----------------|----------------------------|-------------|------------------|
| DEL-SND-001    | Express leverans ICA Maxi  | in_transit  | Erik Andersson   |
| DEL-SND-002    | Medicinsk utrustning       | picked_up   | Anna Bergström   |
| DEL-SND-003    | Kontorsmaterial            | assigned    | Lars Carlsson    |
| DEL-SND-004    | IT-utrustning              | in_transit  | Maria Danielsson |
| DEL-SND-005    | Sportutrustning            | planned     | Johan Eriksson   |

**Public Tracking Features:**
- Real-time driver location on map
- Live delivery status updates
- Estimated time of arrival (ETA)
- Driver contact information
- Delivery proof (once completed)
- No login or registration required

---

## 🇸🇪 Swedish Test Data

### Facilities (Anläggningar)

| Name                    | Type              | Address                        | Coordinates      |
|-------------------------|-------------------|--------------------------------|------------------|
| Sundsvall HQ            | Warehouse         | Norra Kajen 12, Sundsvall      | 62.3908, 17.3069 |
| Birsta Terminal         | Distribution      | Birsta Industriområde          | 62.4325, 17.3182 |
| Timrå Depot             | Local Depot       | Industrivägen 5, Timrå         | 62.4886, 17.3275 |
| Stockholm DC            | Hub               | Frihamnen, Stockholm           | 59.3294, 18.0686 |
| Göteborg Warehouse      | Warehouse         | Hamnvägen 22, Göteborg         | 57.7089, 11.9746 |

### Vehicles (Fordon)

| License Plate | Type     | Make/Model        | Status    | Current Driver    |
|--------------|----------|-------------------|-----------|-------------------|
| ABC 123      | Skåpbil  | Mercedes Sprinter | active    | Erik Andersson    |
| DEF 456      | Lastbil  | Volvo FH16        | active    | Anna Bergström    |
| GHI 789      | Skåpbil  | Ford Transit      | active    | Lars Carlsson     |
| JKL 012      | Lastbil  | Scania R450       | active    | Maria Danielsson  |
| MNO 345      | Skåpbil  | VW Crafter        | active    | Johan Eriksson    |
| PQR 678      | Lastbil  | Mercedes Actros   | available | -                 |
| STU 901      | Skåpbil  | Renault Master    | available | -                 |
| VWX 234      | Lastbil  | Volvo FM          | available | -                 |
| YZÅ 567      | Skåpbil  | Iveco Daily       | available | -                 |
| ÄÖÅ 890      | Lastbil  | MAN TGX           | maintenance | -               |

### Drivers (Förare)

| Name                | Email                      | Phone          | License Number | Status    |
|--------------------|----------------------------|----------------|----------------|-----------|
| Erik Andersson     | erik.andersson@demo.se     | +46 70 123 4567| B,C,CE        | active    |
| Anna Bergström     | anna.bergstrom@demo.se     | +46 70 234 5678| B,C,CE        | active    |
| Lars Carlsson      | lars.carlsson@demo.se      | +46 70 345 6789| B,C           | active    |
| Maria Danielsson   | maria.danielsson@demo.se   | +46 70 456 7890| B,C,CE        | active    |
| Johan Eriksson     | johan.eriksson@demo.se     | +46 70 567 8901| B,C           | active    |
| Sara Fransson      | sara.fransson@demo.se      | +46 70 678 9012| B             | available |
| Kalle Gustafsson   | kalle.gustafsson@demo.se   | +46 70 789 0123| B,C,CE        | available |
| Emma Holmström     | emma.holmstrom@demo.se     | +46 70 890 1234| B,C           | available |

### Active Deliveries (Aktiva Leveranser)

#### 1. DEL-SND-001 - Express leverans ICA Maxi
- **Status:** På väg (In Transit)
- **Från:** Sundsvall HQ → Norra Kajen 12
- **Till:** ICA Maxi Birsta → Gesällvägen 4, Sundsvall
- **Förare:** Erik Andersson (ABC 123)
- **Kund:** ICA Maxi Birsta
- **Innehåll:** Livsmedel och färskvaror
- **Vikt:** 350 kg
- **ETA:** 25 minuter
- **Prioritet:** Normal

#### 2. DEL-SND-002 - Medicinsk utrustning till sjukhus
- **Status:** Upphämtad (Picked Up)
- **Från:** Stockholm DC
- **Till:** Sundsvalls Sjukhus → Sjukhusvägen 1
- **Förare:** Anna Bergström (DEF 456)
- **Kund:** Region Västernorrland
- **Innehåll:** Medicinsk utrustning
- **Vikt:** 180 kg
- **ETA:** 1 timme 15 min
- **Prioritet:** Brådskande (Urgent)

#### 3. DEL-SND-003 - Kontorsmaterial Länsförsäkringar
- **Status:** Tilldelad (Assigned)
- **Från:** Birsta Terminal
- **Till:** Länsförsäkringar → Storgatan 15, Sundsvall
- **Förare:** Lars Carlsson (GHI 789)
- **Kund:** Länsförsäkringar Västernorrland
- **Innehåll:** Kontorsmaterial
- **Vikt:** 85 kg
- **ETA:** Ej påbörjad
- **Prioritet:** Normal

#### 4. DEL-SND-004 - IT-utrustning Mittuniversitetet
- **Status:** På väg (In Transit)
- **Från:** Sundsvall HQ
- **Till:** Mittuniversitetet → Holmgatan 10
- **Förare:** Maria Danielsson (JKL 012)
- **Kund:** Mittuniversitetet
- **Innehåll:** IT-utrustning (datorer och servrar)
- **Vikt:** 425 kg
- **ETA:** 35 minuter
- **Prioritet:** Normal

#### 5. DEL-SND-005 - Sportutrustning Nordichallen
- **Status:** Planerad (Planned)
- **Från:** Göteborg Warehouse
- **Till:** Nordichallen → Idrottsvägen 1, Timrå
- **Förare:** Johan Eriksson (MNO 345)
- **Kund:** Timrå Kommun
- **Innehåll:** Sportutrustning
- **Vikt:** 520 kg
- **ETA:** Schemalagd för imorgon
- **Prioritet:** Normal

### Completed Deliveries (Levererade - Historik)

| Tracking # | Destination           | Driver            | Delivered At        | Recipient         |
|-----------|-----------------------|-------------------|---------------------|-------------------|
| DEL-001   | Coop Birsta           | Erik Andersson    | 2024-11-18 14:30   | Anna Svensson     |
| DEL-002   | Bauhaus Sundsvall     | Lars Carlsson     | 2024-11-18 11:15   | Per Johansson     |
| DEL-003   | Elgiganten            | Anna Bergström    | 2024-11-17 16:45   | Maria Lindqvist   |

---

## 🎯 Demo Scenarios

### Scenario 1: Customer Real-Time Tracking
**Purpose:** Show customers how they track deliveries

1. Share link: `http://your-ngrok-url/track/DEL-SND-001`
2. Customer sees:
   - Live map with driver location
   - Status: "På väg" (In transit)
   - ETA: 25 minutes
   - Driver: Erik Andersson (ABC 123)
3. Location updates every 10 seconds
4. Status changes automatically when driver marks as delivered

### Scenario 2: Driver Completing Delivery
**Purpose:** Show driver workflow on mobile device

1. Open driver app: `http://your-ngrok-url/driver`
2. Login with PIN: `0001`
3. Select delivery: DEL-SND-001
4. Mark as picked up (if not already)
5. Mark as delivered:
   - Enter recipient name: "Anna Svensson"
   - Capture signature
   - Add notes: "Levererat till kundtjänst"
6. GPS location and timestamp recorded automatically

### Scenario 3: Admin Dashboard Management
**Purpose:** Show dispatcher/admin capabilities

1. Login: `admin@sundsvall.se` / `admin123`
2. View all active deliveries on map
3. Monitor driver locations in real-time
4. Check delivery statistics
5. Generate reports
6. Assign new delivery to available driver

---

## 📱 Demo Best Practices

### For Customer Tracking Demo:
- Use mobile phone to show mobile experience
- Refresh page to show live updates
- Demonstrate on different devices (iPhone, Android)
- Show "no login required" advantage

### For Driver App Demo:
- Use tablet or large phone for better visibility
- Enable location services for GPS tracking
- Practice signature capture beforehand
- Show offline capability if available

### For Admin Dashboard Demo:
- Use desktop/laptop for full view
- Show multiple deliveries simultaneously
- Demonstrate search and filter features
- Export a sample report

---

## 🔧 Test Data Management

### Loading Demo Data

The demo data is automatically loaded when the application starts. If you need to reload it:

```bash
# From backend directory
docker compose exec api python -m app.database
```

### Resetting Demo Data

To reset all demo data to initial state:

```bash
# Stop containers
docker compose down

# Remove volumes
docker volume rm sylon_aegis_dbdata_v16

# Restart
docker compose up -d
```

---

## 🌐 Swedish Language Reference

Common terms used in the demo:

| English           | Swedish              |
|------------------|---------------------|
| Delivery         | Leverans            |
| Driver           | Förare              |
| Vehicle          | Fordon              |
| Van              | Skåpbil             |
| Truck            | Lastbil             |
| In transit       | På väg              |
| Picked up        | Upphämtad           |
| Delivered        | Levererad           |
| Assigned         | Tilldelad           |
| Planned          | Planerad            |
| Customer         | Kund                |
| Recipient        | Mottagare           |
| Signature        | Signatur            |
| Location         | Plats               |

---

## 🆘 Troubleshooting

### Issue: "Invalid PIN"
- Use exact format: `0001` (not `1` or `001`)
- Check that demo data is loaded

### Issue: "Tracking number not found"
- Verify demo data is loaded
- Use exact tracking numbers from this document
- Check uppercase/lowercase (case-sensitive)

### Issue: "Driver has no deliveries"
- Make sure you're using the correct PIN
- Check that deliveries are assigned to that driver
- Reload demo data if needed

### Issue: "Map not showing location"
- Enable location permissions in browser
- Check internet connection (maps require online access)
- Verify GPS is working on mobile device

---

## 📞 Support

For issues with demo credentials or test data:
- Check demo data loading in logs: `docker compose logs api`
- Verify database connection: `docker compose ps`
- Reload demo data using reset instructions above

---

**Last Updated:** November 2024  
**Demo Version:** 1.0 (Sundsvall Commercial MVP)
