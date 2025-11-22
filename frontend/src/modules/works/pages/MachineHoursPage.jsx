import React, { useState, useEffect } from 'react';
import { getWorksMachineHours, createWorksMachineHours } from '../../../lib/api';
import toast from 'react-hot-toast';

const MachineHours = () => {
  const [machineHours, setMachineHours] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMachineHours();
  }, []);

  const loadMachineHours = async () => {
    try {
      setLoading(true);
      const data = await getWorksMachineHours({});
      setMachineHours(data);
    } catch (error) {
      console.error('Failed to load machine hours:', error);
      toast.error('Failed to load machine hours');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(amount);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('sv-SE');
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div>Loading machine hours...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#1F2937' }}>
          Machine Hours
        </h1>
        <p style={{ color: '#6B7280' }}>Track equipment usage and costs</p>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.5rem' }}>Total Hours</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#4A90E2' }}>
            {machineHours.reduce((sum, entry) => sum + (parseFloat(entry.hours) || 0), 0).toFixed(1)}
          </div>
        </div>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.5rem' }}>Total Cost</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10B981' }}>
            {formatCurrency(machineHours.reduce((sum, entry) => sum + (parseFloat(entry.total_cost) || 0), 0))}
          </div>
        </div>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.5rem' }}>Entries</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#F59E0B' }}>
            {machineHours.length}
          </div>
        </div>
      </div>

      {/* Machine Hours Table */}
      <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase' }}>
                Asset
              </th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase' }}>
                Start Time
              </th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase' }}>
                End Time
              </th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase' }}>
                Hours
              </th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase' }}>
                Cost
              </th>
            </tr>
          </thead>
          <tbody>
            {machineHours.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: '#6B7280' }}>
                  No machine hours logged yet
                </td>
              </tr>
            ) : (
              machineHours.map(entry => (
                <tr 
                  key={entry.id}
                  style={{ borderBottom: '1px solid #E5E7EB' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                >
                  <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                    {entry.asset_id || '-'}
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                    {formatDateTime(entry.start_time)}
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                    {formatDateTime(entry.end_time)}
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: '600' }}>
                    {entry.hours ? `${parseFloat(entry.hours).toFixed(1)}h` : '-'}
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: '600', color: '#10B981' }}>
                    {formatCurrency(entry.total_cost)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MachineHours;
