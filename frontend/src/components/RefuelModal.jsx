/**
 * Refuel Modal Component for recording vehicle refueling.
 * Allows users to log fuel quantity, cost, and location.
 */
import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import QuickActionButton from './QuickActionButton';
import { api } from '../lib/api';
import { notify, notificationMessages } from '../lib/notifications';
import { formatSEK } from '../lib/formatters';

export default function RefuelModal({ isOpen, onClose, onSuccess, vehicleId = null }) {
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [formData, setFormData] = useState({
    vehicle_id: vehicleId || '',
    facility_id: '',
    quantity_liters: '',
    cost_sek: '',
    notes: '',
  });

  // Fetch vehicles and facilities
  useEffect(() => {
    if (isOpen) {
      fetchVehiclesAndFacilities();
    }
  }, [isOpen]);

  const fetchVehiclesAndFacilities = async () => {
    try {
      const [vehiclesData, facilitiesData] = await Promise.all([
        api.assets(),
        api.facilities(),
      ]);
      
      // Filter to only vehicles
      const vehicleAssets = (vehiclesData || []).filter(
        (a) => a.asset_type === 'vehicle' || a.asset_type === 'truck' || a.asset_type === 'van'
      );
      
      setVehicles(vehicleAssets);
      setFacilities(facilitiesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      notify.error('Kunde inte hämta fordon och anläggningar');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate
      if (!formData.vehicle_id) {
        notify.warning('Välj ett fordon');
        setLoading(false);
        return;
      }

      if (!formData.quantity_liters || parseFloat(formData.quantity_liters) <= 0) {
        notify.warning('Ange giltig bränslemängd');
        setLoading(false);
        return;
      }

      if (!formData.cost_sek || parseFloat(formData.cost_sek) <= 0) {
        notify.warning('Ange giltig kostnad');
        setLoading(false);
        return;
      }

      // Create refuel record
      const refuelData = {
        asset_id: formData.vehicle_id,
        facility_id: formData.facility_id || null,
        quantity_liters: parseFloat(formData.quantity_liters),
        cost_sek: parseFloat(formData.cost_sek),
        notes: formData.notes || null,
        timestamp: new Date().toISOString(),
      };

      const response = await fetch(`${api.baseURL}/api/inventory/fuel/refuel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...api.authHeaders(),
        },
        body: JSON.stringify(refuelData),
      });

      if (!response.ok) {
        throw new Error('Failed to record refuel');
      }

      const vehicle = vehicles.find((v) => v.id === formData.vehicle_id);
      notify.success(
        notificationMessages.refuelCompleted(
          vehicle?.name || vehicle?.license_plate || 'Fordon',
          formData.quantity_liters
        )
      );

      // Reset form
      setFormData({
        vehicle_id: vehicleId || '',
        facility_id: '',
        quantity_liters: '',
        cost_sek: '',
        notes: '',
      });

      if (onSuccess) {
        onSuccess();
      }

      onClose();
    } catch (error) {
      console.error('Error recording refuel:', error);
      notify.error('Kunde inte registrera tankning');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    background: '#2a2a2a',
    border: '1px solid #444',
    borderRadius: '6px',
    color: '#e0e0e0',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'border-color 0.2s ease',
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    color: '#bbb',
    fontSize: '0.9rem',
    fontWeight: '500',
  };

  const costPerLiter = formData.quantity_liters && formData.cost_sek
    ? (parseFloat(formData.cost_sek) / parseFloat(formData.quantity_liters)).toFixed(2)
    : 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="⛽ Registrera tankning" size="medium">
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gap: '20px' }}>
          {/* Vehicle Selection */}
          <div>
            <label style={labelStyle} htmlFor="vehicle_id">
              Fordon *
            </label>
            <select
              id="vehicle_id"
              name="vehicle_id"
              value={formData.vehicle_id}
              onChange={handleChange}
              style={inputStyle}
              required
              disabled={!!vehicleId}
            >
              <option value="">Välj fordon...</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.name || vehicle.license_plate} - {vehicle.license_plate}
                </option>
              ))}
            </select>
          </div>

          {/* Facility Selection (Optional) */}
          <div>
            <label style={labelStyle} htmlFor="facility_id">
              Anläggning (valfritt)
            </label>
            <select
              id="facility_id"
              name="facility_id"
              value={formData.facility_id}
              onChange={handleChange}
              style={inputStyle}
            >
              <option value="">Välj anläggning...</option>
              {facilities.map((facility) => (
                <option key={facility.id} value={facility.id}>
                  {facility.name} - {facility.type}
                </option>
              ))}
            </select>
          </div>

          {/* Quantity and Cost */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={labelStyle} htmlFor="quantity_liters">
                Mängd (liter) *
              </label>
              <input
                id="quantity_liters"
                name="quantity_liters"
                type="number"
                step="0.1"
                min="0"
                value={formData.quantity_liters}
                onChange={handleChange}
                style={inputStyle}
                placeholder="0.0"
                required
              />
            </div>

            <div>
              <label style={labelStyle} htmlFor="cost_sek">
                Kostnad (SEK) *
              </label>
              <input
                id="cost_sek"
                name="cost_sek"
                type="number"
                step="0.01"
                min="0"
                value={formData.cost_sek}
                onChange={handleChange}
                style={inputStyle}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          {/* Cost per liter calculation */}
          {costPerLiter > 0 && (
            <div
              style={{
                padding: '12px',
                background: 'rgba(33, 150, 243, 0.1)',
                border: '1px solid rgba(33, 150, 243, 0.3)',
                borderRadius: '6px',
                fontSize: '0.9rem',
                color: '#2196F3',
              }}
            >
              Pris per liter: {formatSEK(costPerLiter)}
            </div>
          )}

          {/* Notes */}
          <div>
            <label style={labelStyle} htmlFor="notes">
              Anteckningar (valfritt)
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
              placeholder="T.ex. tankställe, mätarställning..."
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
            <QuickActionButton
              label="Avbryt"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            />
            <QuickActionButton
              label={loading ? 'Registrerar...' : 'Registrera tankning'}
              variant="primary"
              loading={loading}
              disabled={loading}
              icon="⛽"
              onClick={handleSubmit}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}
