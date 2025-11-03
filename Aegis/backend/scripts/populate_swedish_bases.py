import asyncio
import asyncpg

# Docker exposes PostgreSQL on port 5432 mapped to host
DATABASE_URL = "postgresql://aegis:aegis_password@localhost:5432/aegis"

SWEDISH_BASES = [
    # Air Force Bases
    {"id": "base-f7-satenas", "name": "F 7 Satenäs", "type": "airfield", "lat": 58.4264, "lon": 12.7144,
     "description": "Swedish Air Force Wing - JAS 39 Gripen fighter jets"},
    {"id": "base-f17-ronneby", "name": "F 17 Ronneby", "type": "airfield", "lat": 56.2667, "lon": 15.2650,
     "description": "Swedish Air Force Wing - Fighter and transport operations"},
    {"id": "base-f21-lulea", "name": "F 21 Luleå", "type": "airfield", "lat": 65.5439, "lon": 22.1219,
     "description": "Swedish Air Force Wing - Northern air defense"},
    {"id": "base-malmen", "name": "Malmen Air Base", "type": "airfield", "lat": 58.4025, "lon": 15.5258,
     "description": "Swedish Air Force - Training and helicopter operations"},
    {"id": "base-uppsala", "name": "Uppsala Garrison", "type": "airfield", "lat": 59.8967, "lon": 17.5936,
     "description": "Swedish Air Force - Helicopter wing"},

    # Army Bases
    {"id": "base-p4-skovde", "name": "P 4 Skövde", "type": "military", "lat": 58.3908, "lon": 13.8456,
     "description": "Swedish Army - Armored Regiment (Skaraborgs regemente)"},
    {"id": "base-p10-strangnas", "name": "P 10 Strängnäs", "type": "military", "lat": 59.3742, "lon": 17.0342,
     "description": "Swedish Army - South Scanian Regiment"},
    {"id": "base-i19-boden", "name": "I 19 Boden", "type": "military", "lat": 65.8250, "lon": 21.6889,
     "description": "Swedish Army - Norrbotten Regiment (Arctic warfare)"},
    {"id": "base-a9-kristinehamn", "name": "A 9 Kristinehamn", "type": "military", "lat": 59.3097, "lon": 14.1083,
     "description": "Swedish Army - Artillery Regiment"},
    {"id": "base-k3-karlsborg", "name": "K 3 Karlsborg", "type": "military", "lat": 58.5364, "lon": 14.5056,
     "description": "Swedish Army - Life Regiment Hussars (Cavalry)"},
    {"id": "base-ing2-eksjo", "name": "Ing 2 Eksjö", "type": "military", "lat": 57.6608, "lon": 14.9706,
     "description": "Swedish Army - Engineer Regiment"},
    {"id": "base-revingehed", "name": "Revingehed", "type": "military", "lat": 55.7333, "lon": 13.4167,
     "description": "Swedish Army - Combat training center"},

    # Naval Bases
    {"id": "base-karlskrona", "name": "Karlskrona Naval Base", "type": "military", "lat": 56.1612, "lon": 15.5869,
     "description": "Swedish Navy HQ - Main naval base (UNESCO World Heritage)"},
    {"id": "base-muskobasen", "name": "Muskö Naval Base", "type": "military", "lat": 58.9833, "lon": 17.9667,
     "description": "Swedish Navy - Underground submarine and corvette base"},
    {"id": "base-berga", "name": "Berga Naval Base", "type": "military", "lat": 59.2142, "lon": 18.4586,
     "description": "Swedish Navy - Stockholm archipelago operations"},

    # Special Forces & Joint Units
    {"id": "base-sof-karlsborg", "name": "SOG Karlsborg", "type": "military", "lat": 58.5364, "lon": 14.5056,
     "description": "Swedish Special Operations Group"},
    {"id": "base-amf1-enkoping", "name": "Amf 1 Enköping", "type": "military", "lat": 59.6356, "lon": 17.0778,
     "description": "Swedish Amphibious Regiment"},

    # Logistics & Support
    {"id": "base-trosso", "name": "Trössö Logistics", "type": "logistics", "lat": 56.1667, "lon": 15.5833,
     "description": "Swedish Armed Forces - Logistics center"},
    {"id": "base-fmv-stockholm", "name": "FMV Stockholm", "type": "logistics", "lat": 59.3293, "lon": 18.0686,
     "description": "Swedish Defence Materiel Administration HQ"},
    {"id": "base-arboga", "name": "Arboga Depot", "type": "storage", "lat": 59.3936, "lon": 15.8397,
     "description": "Swedish Armed Forces - Central storage facility"},

    # Gotland (Strategic)
    {"id": "base-p18-gotland", "name": "P 18 Visby", "type": "military", "lat": 57.6348, "lon": 18.2948,
     "description": "Swedish Army - Gotland Regiment (Strategic Baltic position)"},
    {"id": "base-visby-airport", "name": "Visby Airport", "type": "airfield", "lat": 57.6628, "lon": 18.3464,
     "description": "Dual-use civilian/military airfield on Gotland"},

    # Northern Sweden
    {"id": "base-a8-boden", "name": "A 8 Boden", "type": "military", "lat": 65.8250, "lon": 21.6889,
     "description": "Swedish Army - Artillery Regiment (Arctic warfare)"},
    {"id": "base-vidsel", "name": "Vidsel Test Range", "type": "military", "lat": 65.8783, "lon": 20.1503,
     "description": "Swedish Armed Forces - Weapons testing facility"},
]


async def populate_bases():
    print("🔗 Connecting to PostgreSQL in Docker...")

    try:
        conn = await asyncpg.connect(DATABASE_URL, timeout=10)
        print("✅ Connected successfully!\n")
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        print("\n💡 Make sure Docker container 'aegis-db-1' is running:")
        print("   docker ps | grep aegis-db")
        return

    print("📥 Adding Swedish military bases...\n")

    for base in SWEDISH_BASES:
        try:
            await conn.execute("""
                               INSERT INTO bases (id, name, type, lat, lon, description)
                               VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO
                               UPDATE
                                   SET name = $2, type = $3, lat = $4, lon = $5, description = $6
                               """, base['id'], base['name'], base['type'],
                               base['lat'], base['lon'], base['description'])
            print(f"  ✓ {base['name']}")
        except Exception as e:
            print(f"  ✗ Error adding {base['name']}: {e}")

    count = await conn.fetchval("SELECT COUNT(*) FROM bases")
    print(f"\n🎉 Complete! Total bases in database: {count}")

    await conn.close()


if __name__ == "__main__":
    asyncio.run(populate_bases())