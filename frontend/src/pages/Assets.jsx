
import React, { useState } from 'react'
import AssetsAdmin from '../components/AssetsAdmin'
import BasesAdmin from '../components/BasesAdmin'
import LineChart from '../components/charts/LineChart'
import AreaChart from '../components/charts/AreaChart'

export default function Assets() {
  const [selectedTab, setSelectedTab] = useState('assets')

  return (
    <div style={{ 
      padding: '2rem',
      background: 'linear-gradient(135deg, #0a0e14 0%, #1a1f2e 100%)',
      minHeight: '100vh'
    }}>
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
          🚚 Assets & Logistics
        </h1>
      </div>

      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        marginBottom: '2rem',
        borderBottom: '2px solid #2d3748'
      }}>
        <button
          onClick={() => setSelectedTab('assets')}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'none',
            border: 'none',
            borderBottom: selectedTab === 'assets' ? '3px solid #63b3ed' : '3px solid transparent',
            color: selectedTab === 'assets' ? '#63b3ed' : '#718096',
            cursor: 'pointer',
            fontSize: '0.95rem',
            fontWeight: selectedTab === 'assets' ? 600 : 400,
            transition: 'all 0.2s'
          }}
        >
          📦 Assets
        </button>
        <button
          onClick={() => setSelectedTab('bases')}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'none',
            border: 'none',
            borderBottom: selectedTab === 'bases' ? '3px solid #63b3ed' : '3px solid transparent',
            color: selectedTab === 'bases' ? '#63b3ed' : '#718096',
            cursor: 'pointer',
            fontSize: '0.95rem',
            fontWeight: selectedTab === 'bases' ? 600 : 400,
            transition: 'all 0.2s'
          }}
        >
          🏢 Bases
        </button>
      </div>

      {/* Analytics Section - Only show for assets tab */}
      {selectedTab === 'assets' && (
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', 
            gap: '1.5rem',
            marginBottom: '1.5rem'
          }}>
            <LineChart
              data={[
                { date: 'Mon', efficiency: 82 },
                { date: 'Tue', efficiency: 85 },
                { date: 'Wed', efficiency: 78 },
                { date: 'Thu', efficiency: 88 },
                { date: 'Fri', efficiency: 91 },
                { date: 'Sat', efficiency: 75 },
                { date: 'Sun', efficiency: 70 },
              ]}
              xKey="date"
              yKey="efficiency"
              title="Fleet Fuel Efficiency (Last 7 Days)"
              color="#10B981"
              height={250}
            />
            <AreaChart
              data={[
                { month: 'Jan', odometer: 12500 },
                { month: 'Feb', odometer: 15200 },
                { month: 'Mar', odometer: 18900 },
                { month: 'Apr', odometer: 22100 },
              ]}
              xKey="month"
              yKey="odometer"
              title="Fleet Mileage Trend"
              color="#4A90E2"
              height={250}
            />
          </div>
        </div>
      )}

      {/* Tab Content */}
      <div>
        {selectedTab === 'assets' ? <AssetsAdmin /> : <BasesAdmin />}
      </div>
    </div>
  )
}
