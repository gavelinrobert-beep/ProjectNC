/**
 * Fuel Consumption Chart Component with weekly and cost analytics.
 * Displays bar chart for weekly consumption, line chart for costs, and horizontal bar for efficiency.
 */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { api } from '../lib/api';
import { formatSwedishShortDate, formatSEK, formatSwedishNumber, formatFuelEfficiency } from '../lib/formatters';

export default function FuelConsumptionChart() {
  const [period, setPeriod] = useState('30days');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFuelData();
  }, [period]);

  const fetchFuelData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${api.baseURL}/api/inventory/fuel/analytics?period=${period}`, {
        headers: api.authHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch fuel data');
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error('Error fetching fuel data:', err);
      setError('Kunde inte hämta bränsledata');
    } finally {
      setLoading(false);
    }
  };

  const cardStyle = {
    background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
    border: '1px solid #333',
  };

  const buttonStyle = (active) => ({
    padding: '8px 16px',
    background: active ? '#4CAF50' : 'transparent',
    color: active ? '#fff' : '#aaa',
    border: `1px solid ${active ? '#4CAF50' : '#444'}`,
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: active ? '600' : '400',
    transition: 'all 0.2s ease',
  });

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.9)',
            border: '1px solid #333',
            borderRadius: '8px',
            padding: '12px',
            color: '#fff',
          }}
        >
          <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>
            {label}
          </p>
          {payload.map((entry, index) => (
            <p
              key={index}
              style={{ margin: '4px 0', color: entry.color, fontSize: '0.9rem' }}
            >
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Colors for efficiency bars based on performance
  const getEfficiencyColor = (efficiency) => {
    if (efficiency >= 12) return '#4CAF50'; // Good
    if (efficiency >= 8) return '#FF9800'; // Medium
    return '#F44336'; // Poor
  };

  return (
    <motion.div
      style={cardStyle}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        <h3 style={{ margin: 0, color: '#e0e0e0', fontSize: '1.2rem' }}>
          ⛽ Bränsleförbrukning & Kostnader
        </h3>

        {/* Period toggle */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            style={buttonStyle(period === '7days')}
            onClick={() => setPeriod('7days')}
          >
            7 dagar
          </button>
          <button
            style={buttonStyle(period === '30days')}
            onClick={() => setPeriod('30days')}
          >
            30 dagar
          </button>
          <button
            style={buttonStyle(period === '90days')}
            onClick={() => setPeriod('90days')}
          >
            90 dagar
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ color: '#aaa', textAlign: 'center', padding: '40px 20px' }}>
          <p style={{ fontSize: '1rem', margin: 0 }}>Laddar data...</p>
        </div>
      ) : error ? (
        <div style={{ color: '#ef4444', textAlign: 'center', padding: '40px 20px' }}>
          <p style={{ fontSize: '1rem', margin: 0 }}>{error}</p>
        </div>
      ) : !data ? (
        <div style={{ color: '#aaa', textAlign: 'center', padding: '40px 20px' }}>
          <p style={{ fontSize: '1rem', margin: 0 }}>Ingen data tillgänglig</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '15px',
              marginBottom: '30px',
            }}
          >
            <div
              style={{
                background: 'rgba(76, 175, 80, 0.1)',
                border: '1px solid rgba(76, 175, 80, 0.3)',
                borderRadius: '8px',
                padding: '15px',
                textAlign: 'center',
              }}
            >
              <div style={{ color: '#4CAF50', fontSize: '1.5rem', fontWeight: 'bold' }}>
                {formatSwedishNumber(data.summary?.total_fuel || 0)} L
              </div>
              <div style={{ color: '#aaa', fontSize: '0.85rem', marginTop: '5px' }}>
                Total bränsle
              </div>
            </div>

            <div
              style={{
                background: 'rgba(33, 150, 243, 0.1)',
                border: '1px solid rgba(33, 150, 243, 0.3)',
                borderRadius: '8px',
                padding: '15px',
                textAlign: 'center',
              }}
            >
              <div style={{ color: '#2196F3', fontSize: '1.5rem', fontWeight: 'bold' }}>
                {formatSEK(data.summary?.total_cost || 0)}
              </div>
              <div style={{ color: '#aaa', fontSize: '0.85rem', marginTop: '5px' }}>
                Totalkostnad
              </div>
            </div>

            <div
              style={{
                background: 'rgba(255, 152, 0, 0.1)',
                border: '1px solid rgba(255, 152, 0, 0.3)',
                borderRadius: '8px',
                padding: '15px',
                textAlign: 'center',
              }}
            >
              <div style={{ color: '#FF9800', fontSize: '1.5rem', fontWeight: 'bold' }}>
                {data.summary?.total_refuels || 0}
              </div>
              <div style={{ color: '#aaa', fontSize: '0.85rem', marginTop: '5px' }}>
                Tanktillfällen
              </div>
            </div>

            <div
              style={{
                background: 'rgba(156, 39, 176, 0.1)',
                border: '1px solid rgba(156, 39, 176, 0.3)',
                borderRadius: '8px',
                padding: '15px',
                textAlign: 'center',
              }}
            >
              <div style={{ color: '#9C27B0', fontSize: '1.5rem', fontWeight: 'bold' }}>
                {formatSEK(data.summary?.avg_cost_per_liter || 0)}
              </div>
              <div style={{ color: '#aaa', fontSize: '0.85rem', marginTop: '5px' }}>
                Genomsnittspris/L
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }}>
            {/* Weekly Consumption Bar Chart */}
            {data.weekly_consumption && data.weekly_consumption.length > 0 && (
              <div>
                <h4 style={{ color: '#bbb', marginBottom: '10px', fontSize: '0.95rem' }}>
                  Veckovis förbrukning (liter)
                </h4>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={data.weekly_consumption}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis
                      dataKey="week"
                      stroke="#888"
                      tickFormatter={formatSwedishShortDate}
                      style={{ fontSize: '0.75rem' }}
                    />
                    <YAxis stroke="#888" style={{ fontSize: '0.75rem' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '0.85rem' }} />
                    <Bar
                      dataKey="total_liters"
                      name="Liter"
                      fill="#4CAF50"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Daily Cost Trends Line Chart */}
            {data.cost_trends && data.cost_trends.length > 0 && (
              <div>
                <h4 style={{ color: '#bbb', marginBottom: '10px', fontSize: '0.95rem' }}>
                  Kostnadstrend (SEK)
                </h4>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={data.cost_trends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis
                      dataKey="date"
                      stroke="#888"
                      tickFormatter={formatSwedishShortDate}
                      style={{ fontSize: '0.75rem' }}
                    />
                    <YAxis stroke="#888" style={{ fontSize: '0.75rem' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '0.85rem' }} />
                    <Line
                      type="monotone"
                      dataKey="total_cost"
                      name="Kostnad (SEK)"
                      stroke="#2196F3"
                      strokeWidth={2}
                      dot={{ fill: '#2196F3', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Vehicle Efficiency Horizontal Bar Chart */}
            {data.vehicle_efficiency && data.vehicle_efficiency.length > 0 && (
              <div>
                <h4 style={{ color: '#bbb', marginBottom: '10px', fontSize: '0.95rem' }}>
                  Effektivitet per fordon (km/L)
                </h4>
                <ResponsiveContainer width="100%" height={Math.max(200, data.vehicle_efficiency.length * 40)}>
                  <BarChart
                    data={data.vehicle_efficiency}
                    layout="vertical"
                    margin={{ left: 100 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis type="number" stroke="#888" style={{ fontSize: '0.75rem' }} />
                    <YAxis
                      dataKey="license_plate"
                      type="category"
                      stroke="#888"
                      style={{ fontSize: '0.75rem' }}
                      width={90}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="km_per_liter" name="km/L" radius={[0, 4, 4, 0]}>
                      {data.vehicle_efficiency.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getEfficiencyColor(entry.km_per_liter)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </>
      )}
    </motion.div>
  );
}
