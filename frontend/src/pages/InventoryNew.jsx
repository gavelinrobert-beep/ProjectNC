import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import CargoTrackingCard from '../components/CargoTrackingCard';
import VehicleEquipmentPanel from '../components/VehicleEquipmentPanel';
import StockLevelIndicator from '../components/StockLevelIndicator';

const InventoryNew = () => {
  const [activeTab, setActiveTab] = useState('cargo');
  const [loading, setLoading] = useState(true);
  
  // Cargo state
  const [cargoItems, setCargoItems] = useState([]);
  const [cargoFilter, setCargoFilter] = useState('all');
  
  // Vehicle equipment state
  const [vehicles, setVehicles] = useState([]);
  const [vehicleEquipment, setVehicleEquipment] = useState({});
  
  // Facility stock state
  const [facilities, setFacilities] = useState([]);
  const [selectedFacility, setSelectedFacility] = useState('');
  const [facilityStock, setFacilityStock] = useState([]);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  
  // Fuel tracking state
  const [fuelReport, setFuelReport] = useState(null);
  const [fuelPeriod, setFuelPeriod] = useState('7days');

  useEffect(() => {
    loadData();
  }, [activeTab, selectedFacility, fuelPeriod]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'cargo') {
        await loadCargoData();
      } else if (activeTab === 'vehicle') {
        await loadVehicleEquipment();
      } else if (activeTab === 'facility') {
        await loadFacilityStock();
      } else if (activeTab === 'fuel') {
        await loadFuelData();
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCargoData = async () => {
  try {
    const response = await fetch('/api/inventory/cargo/in-transit', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });

    if (!response.ok) {
      console.error('Failed to load cargo:', response.status);
      setCargoItems([]);  // Set empty array on error
      return;
    }

    const cargo = await response.json();
    setCargoItems(Array.isArray(cargo) ? cargo : []);  // Ensure it's always an array
  } catch (error) {
    console.error('Failed to load cargo:', error);
    setCargoItems([]);  // Set empty array on error
  }
};

  const loadVehicleEquipment = async () => {
    try {
      // Get all assets
      const assets = await api.assets();
      const vehicleList = assets.filter(a => a.type === 'van' || a.type === 'truck' || a.type === 'car');
      setVehicles(vehicleList);

      // Load equipment for each vehicle
      const equipmentData = {};
      for (const vehicle of vehicleList) {
        try {
          const response = await fetch(`/api/inventory/vehicle/${vehicle.id}/equipment`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          });
          if (response.ok) {
            const data = await response.json();
            equipmentData[vehicle.id] = data.equipment || [];
          }
        } catch (err) {
          console.error(`Failed to load equipment for ${vehicle.id}:`, err);
          equipmentData[vehicle.id] = [];
        }
      }
      setVehicleEquipment(equipmentData);
    } catch (error) {
      console.error('Failed to load vehicles:', error);
    }
  };

  const loadFacilityStock = async () => {
    try {
      // Load facilities
      const facilitiesData = await api.facilities();
      setFacilities(facilitiesData);
      
      if (!selectedFacility && facilitiesData.length > 0) {
        setSelectedFacility(facilitiesData[0].id);
      }

      // Load low stock alerts
      const alerts = await fetch('/api/inventory/alerts/low-stock', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      }).then(r => r.json());
      setLowStockAlerts(alerts);

      // Load stock for selected facility
      if (selectedFacility) {
        const stock = await fetch(`/api/inventory/facility/${selectedFacility}/stock`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }).then(r => r.json());
        setFacilityStock(stock.stock || []);
      }
    } catch (error) {
      console.error('Failed to load facility stock:', error);
    }
  };

  const loadFuelData = async () => {
    try {
      const report = await fetch(`/api/inventory/fuel/consumption-report?period=${fuelPeriod}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      }).then(r => r.json());
      setFuelReport(report);
    } catch (error) {
      console.error('Failed to load fuel data:', error);
    }
  };

  const filteredCargo = (cargoItems || []).filter(item => {
    if (cargoFilter === 'all') return true;
    return item.status === cargoFilter;
  });

  const tabs = [
    { id: 'cargo', label: '📦 Frakt & Leveranser', icon: '📦' },
    { id: 'vehicle', label: '🚚 Fordonsutrustning', icon: '🚚' },
    { id: 'facility', label: '🏢 Anläggningslager', icon: '🏢' },
    { id: 'fuel', label: '⛽ Bränslespårning', icon: '⛽' }
  ];

  return (
    <div style={{
      padding: '2rem',
      background: 'linear-gradient(135deg, #0a0e14 0%, #1a1f2e 100%)',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '2rem'
      }}>
        <h1 style={{
          margin: 0,
          fontSize: '1.8rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          📦 Lagerhantering
        </h1>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '2rem',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        overflowX: 'auto'
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '1rem 1.5rem',
              background: activeTab === tab.id 
                ? 'linear-gradient(135deg, rgba(33,150,243,0.2) 0%, rgba(33,150,243,0.1) 100%)'
                : 'transparent',
              border: 'none',
              borderBottom: activeTab === tab.id ? '3px solid #2196f3' : '3px solid transparent',
              color: activeTab === tab.id ? '#fff' : '#9ca3af',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s',
              whiteSpace: 'nowrap'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
            Laddar...
          </div>
        ) : (
          <>
            {/* Cargo Tab */}
            {activeTab === 'cargo' && (
              <div>
                {/* Filters */}
                <div style={{
                  display: 'flex',
                  gap: '0.75rem',
                  marginBottom: '1.5rem',
                  flexWrap: 'wrap'
                }}>
                  {['all', 'in_transit', 'awaiting_pickup', 'delivered'].map(filter => (
                    <button
                      key={filter}
                      onClick={() => setCargoFilter(filter)}
                      style={{
                        padding: '0.5rem 1rem',
                        background: cargoFilter === filter 
                          ? 'rgba(33,150,243,0.2)' 
                          : 'rgba(255,255,255,0.05)',
                        border: cargoFilter === filter 
                          ? '1px solid #2196f3' 
                          : '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '20px',
                        color: '#fff',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        transition: 'all 0.3s'
                      }}
                    >
                      {filter === 'all' ? 'Alla' : 
                       filter === 'in_transit' ? 'Under transport' :
                       filter === 'awaiting_pickup' ? 'Väntar upphämtning' :
                       'Levererade'}
                    </button>
                  ))}
                </div>

                {filteredCargo.length === 0 ? (
                  <div style={{
                    padding: '3rem',
                    textAlign: 'center',
                    color: '#9ca3af',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '12px'
                  }}>
                    Inga paket hittades
                  </div>
                ) : (
                  <div>
                    {filteredCargo.map(cargo => (
                      <CargoTrackingCard key={cargo.id} cargo={cargo} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Vehicle Equipment Tab */}
            {activeTab === 'vehicle' && (
              <div>
                {vehicles.length === 0 ? (
                  <div style={{
                    padding: '3rem',
                    textAlign: 'center',
                    color: '#9ca3af',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '12px'
                  }}>
                    Inga fordon hittades
                  </div>
                ) : (
                  <div>
                    {vehicles.map(vehicle => (
                      <VehicleEquipmentPanel
                        key={vehicle.id}
                        vehicle={vehicle}
                        equipment={vehicleEquipment[vehicle.id] || []}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Facility Stock Tab */}
            {activeTab === 'facility' && (
              <div>
                {/* Facility Selector */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontSize: '0.9rem',
                    color: '#9ca3af'
                  }}>
                    Välj anläggning
                  </label>
                  <select
                    value={selectedFacility}
                    onChange={(e) => setSelectedFacility(e.target.value)}
                    style={{
                      width: '100%',
                      maxWidth: '400px',
                      padding: '0.75rem',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '1rem'
                    }}
                  >
                    {facilities.map(facility => (
                      <option key={facility.id} value={facility.id}>
                        {facility.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Low Stock Alerts */}
                {lowStockAlerts.length > 0 && (
                  <div style={{
                    background: 'rgba(244,67,54,0.15)',
                    border: '1px solid rgba(244,67,54,0.3)',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    marginBottom: '1.5rem'
                  }}>
                    <div style={{
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      marginBottom: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      ⚠️ Låga lagernivåer ({lowStockAlerts.length})
                    </div>
                    {lowStockAlerts.slice(0, 3).map(alert => (
                      <div key={alert.id} style={{
                        fontSize: '0.9rem',
                        marginBottom: '0.5rem',
                        paddingBottom: '0.5rem',
                        borderBottom: '1px solid rgba(244,67,54,0.2)'
                      }}>
                        <strong>{alert.name}</strong> vid {alert.facility_name}: {alert.quantity} {alert.unit} (min: {alert.min_stock_level})
                      </div>
                    ))}
                  </div>
                )}

                {/* Stock Items */}
                {facilityStock.length === 0 ? (
                  <div style={{
                    padding: '3rem',
                    textAlign: 'center',
                    color: '#9ca3af',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '12px'
                  }}>
                    Inget lager hittades för denna anläggning
                  </div>
                ) : (
                  <div>
                    {facilityStock.map(item => (
                      <StockLevelIndicator key={item.id} item={item} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Fuel Tracking Tab */}
            {activeTab === 'fuel' && (
              <div>
                {/* Period Selector */}
                <div style={{
                  display: 'flex',
                  gap: '0.75rem',
                  marginBottom: '1.5rem',
                  flexWrap: 'wrap'
                }}>
                  {['7days', '30days', '90days'].map(period => (
                    <button
                      key={period}
                      onClick={() => setFuelPeriod(period)}
                      style={{
                        padding: '0.5rem 1rem',
                        background: fuelPeriod === period 
                          ? 'rgba(33,150,243,0.2)' 
                          : 'rgba(255,255,255,0.05)',
                        border: fuelPeriod === period 
                          ? '1px solid #2196f3' 
                          : '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '20px',
                        color: '#fff',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        transition: 'all 0.3s'
                      }}
                    >
                      {period === '7days' ? '7 dagar' :
                       period === '30days' ? '30 dagar' :
                       '90 dagar'}
                    </button>
                  ))}
                </div>

                {fuelReport && (
                  <>
                    {/* Summary Card */}
                    <div style={{
                      background: 'linear-gradient(135deg, rgba(30,40,60,0.95) 0%, rgba(20,30,45,0.95) 100%)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      padding: '1.5rem',
                      marginBottom: '1.5rem',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                    }}>
                      <div style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1.5rem' }}>
                        ⛽ Sammanfattning
                      </div>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1.5rem'
                      }}>
                        <div>
                          <div style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '0.5rem' }}>
                            Total förbrukning
                          </div>
                          <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#2196f3' }}>
                            {fuelReport.summary.total_liters.toFixed(0)} L
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '0.5rem' }}>
                            Total kostnad
                          </div>
                          <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#4caf50' }}>
                            {fuelReport.summary.total_cost.toFixed(0)} SEK
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '0.5rem' }}>
                            Tankningar
                          </div>
                          <div style={{ fontSize: '1.8rem', fontWeight: '700' }}>
                            {fuelReport.summary.total_refuels}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '0.5rem' }}>
                            Fordon tankade
                          </div>
                          <div style={{ fontSize: '1.8rem', fontWeight: '700' }}>
                            {fuelReport.summary.vehicles_refueled}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* By Vehicle */}
                    <div style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem' }}>
                      Per fordon
                    </div>
                    {fuelReport.by_vehicle.map(vehicle => (
                      <div
                        key={vehicle.vehicle_id}
                        style={{
                          background: 'linear-gradient(135deg, rgba(30,40,60,0.95) 0%, rgba(20,30,45,0.95) 100%)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '12px',
                          padding: '1.25rem',
                          marginBottom: '1rem',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '1rem'
                        }}>
                          <div>
                            <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>
                              {vehicle.registration_number}
                            </div>
                            <div style={{ fontSize: '0.9rem', color: '#9ca3af' }}>
                              {vehicle.make} {vehicle.model}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.85rem', color: '#9ca3af' }}>
                              {vehicle.refuel_count} tankningar
                            </div>
                          </div>
                        </div>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: '1rem'
                        }}>
                          <div>
                            <div style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Totalt bränsle</div>
                            <div style={{ fontSize: '1.4rem', fontWeight: '700', color: '#2196f3' }}>
                              {vehicle.total_liters.toFixed(0)} L
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Kostnad</div>
                            <div style={{ fontSize: '1.4rem', fontWeight: '700', color: '#4caf50' }}>
                              {vehicle.total_cost.toFixed(0)} SEK
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default InventoryNew;
