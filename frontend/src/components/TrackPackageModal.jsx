/**
 * Track Package Modal Component for searching and viewing shipment status.
 * Allows users to search by tracking number and view delivery details.
 */
import React, { useState } from 'react';
import Modal from './Modal';
import QuickActionButton from './QuickActionButton';
import { api } from '../lib/api';
import { notify } from '../lib/notifications';
import { formatSwedishDateTime } from '../lib/formatters';

export default function TrackPackageModal({ isOpen, onClose }) {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!trackingNumber || trackingNumber.trim().length < 3) {
      notify.warning('Ange ett giltigt spårningsnummer');
      return;
    }

    setLoading(true);
    setError(null);
    setShipment(null);

    try {
      // Search for shipment by tracking number
      const response = await fetch(
        `${api.baseURL}/api/shipments?tracking_number=${encodeURIComponent(trackingNumber.trim())}`,
        {
          headers: api.authHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch shipment');
      }

      const shipments = await response.json();

      if (!shipments || shipments.length === 0) {
        setError('Ingen leverans hittades med detta spårningsnummer');
        notify.warning('Ingen leverans hittades');
        return;
      }

      setShipment(shipments[0]);
    } catch (err) {
      console.error('Error searching shipment:', err);
      setError('Kunde inte söka leverans');
      notify.error('Sökfel uppstod');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setTrackingNumber('');
    setShipment(null);
    setError(null);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#FF9800',
      picked_up: '#2196F3',
      in_transit: '#2196F3',
      out_for_delivery: '#9C27B0',
      delivered: '#4CAF50',
      failed: '#F44336',
      cancelled: '#757575',
    };
    return colors[status] || '#888';
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Väntande',
      picked_up: 'Upphämtad',
      in_transit: 'Under transport',
      out_for_delivery: 'Ute för leverans',
      delivered: 'Levererad',
      failed: 'Misslyckades',
      cancelled: 'Avbruten',
    };
    return labels[status] || status;
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    background: '#2a2a2a',
    border: '1px solid #444',
    borderRadius: '6px',
    color: '#e0e0e0',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.2s ease',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📦 Spåra paket" size="medium">
      {/* Search Form */}
      <form onSubmit={handleSearch} style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="Ange spårningsnummer..."
            style={{ ...inputStyle, flex: 1 }}
            autoFocus
          />
          <QuickActionButton
            label="Sök"
            variant="primary"
            icon="🔍"
            loading={loading}
            disabled={loading || !trackingNumber.trim()}
            onClick={handleSearch}
          />
        </div>
      </form>

      {/* Loading State */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#888' }}>
          <p>Söker...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div
          style={{
            padding: '20px',
            background: 'rgba(244, 67, 54, 0.1)',
            border: '1px solid rgba(244, 67, 54, 0.3)',
            borderRadius: '8px',
            color: '#F44336',
            textAlign: 'center',
          }}
        >
          <p style={{ margin: 0, fontSize: '1rem' }}>{error}</p>
          <QuickActionButton
            label="Försök igen"
            variant="outline"
            onClick={handleReset}
            style={{ marginTop: '10px' }}
          />
        </div>
      )}

      {/* Shipment Details */}
      {shipment && !loading && (
        <div style={{ display: 'grid', gap: '20px' }}>
          {/* Status Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              background: `${getStatusColor(shipment.status)}20`,
              border: `2px solid ${getStatusColor(shipment.status)}`,
              borderRadius: '8px',
              justifyContent: 'center',
            }}
          >
            <span style={{ fontSize: '1.5rem' }}>📦</span>
            <div>
              <div style={{ fontSize: '0.85rem', color: '#888' }}>Status</div>
              <div
                style={{
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  color: getStatusColor(shipment.status),
                }}
              >
                {getStatusLabel(shipment.status)}
              </div>
            </div>
          </div>

          {/* Tracking Number */}
          <div
            style={{
              padding: '15px',
              background: '#2a2a2a',
              borderRadius: '8px',
              border: '1px solid #333',
            }}
          >
            <div style={{ fontSize: '0.85rem', color: '#888', marginBottom: '5px' }}>
              Spårningsnummer
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#2196F3' }}>
              {shipment.tracking_number}
            </div>
          </div>

          {/* Sender and Recipient */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div
              style={{
                padding: '15px',
                background: '#2a2a2a',
                borderRadius: '8px',
                border: '1px solid #333',
              }}
            >
              <div style={{ fontSize: '0.85rem', color: '#888', marginBottom: '8px' }}>
                Avsändare
              </div>
              <div style={{ fontSize: '0.95rem', color: '#e0e0e0', fontWeight: '500' }}>
                {shipment.sender_name}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#aaa', marginTop: '5px' }}>
                {shipment.pickup_address}
              </div>
            </div>

            <div
              style={{
                padding: '15px',
                background: '#2a2a2a',
                borderRadius: '8px',
                border: '1px solid #333',
              }}
            >
              <div style={{ fontSize: '0.85rem', color: '#888', marginBottom: '8px' }}>
                Mottagare
              </div>
              <div style={{ fontSize: '0.95rem', color: '#e0e0e0', fontWeight: '500' }}>
                {shipment.recipient_name}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#aaa', marginTop: '5px' }}>
                {shipment.delivery_address}
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div
            style={{
              padding: '15px',
              background: '#2a2a2a',
              borderRadius: '8px',
              border: '1px solid #333',
            }}
          >
            <div style={{ fontSize: '0.95rem', color: '#bbb', marginBottom: '12px', fontWeight: '500' }}>
              Tidslinje
            </div>
            <div style={{ display: 'grid', gap: '10px' }}>
              {shipment.created_at && (
                <div style={{ display: 'flex', gap: '10px', alignItems: 'start' }}>
                  <span style={{ fontSize: '1.2rem' }}>📝</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.9rem', color: '#e0e0e0' }}>Skapad</div>
                    <div style={{ fontSize: '0.8rem', color: '#888' }}>
                      {formatSwedishDateTime(shipment.created_at)}
                    </div>
                  </div>
                </div>
              )}

              {shipment.picked_up_at && (
                <div style={{ display: 'flex', gap: '10px', alignItems: 'start' }}>
                  <span style={{ fontSize: '1.2rem' }}>📤</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.9rem', color: '#e0e0e0' }}>Upphämtad</div>
                    <div style={{ fontSize: '0.8rem', color: '#888' }}>
                      {formatSwedishDateTime(shipment.picked_up_at)}
                    </div>
                  </div>
                </div>
              )}

              {shipment.delivered_at && (
                <div style={{ display: 'flex', gap: '10px', alignItems: 'start' }}>
                  <span style={{ fontSize: '1.2rem' }}>✅</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.9rem', color: '#4CAF50' }}>Levererad</div>
                    <div style={{ fontSize: '0.8rem', color: '#888' }}>
                      {formatSwedishDateTime(shipment.delivered_at)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
            <QuickActionButton
              label="Ny sökning"
              variant="outline"
              onClick={handleReset}
            />
            <QuickActionButton
              label="Stäng"
              variant="primary"
              onClick={onClose}
            />
          </div>
        </div>
      )}
    </Modal>
  );
}
