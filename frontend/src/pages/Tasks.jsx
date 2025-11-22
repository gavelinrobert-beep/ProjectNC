import React, { useEffect, useState } from 'react'
import { api } from '../lib/api'
import MissionPlanner from '../components/MissionPlanner'
import LineChart from '../components/charts/LineChart'

export default function Missions() {
  const [missions, setMissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showPlanner, setShowPlanner] = useState(false)
  const [selectedTab, setSelectedTab] = useState('all')

  useEffect(() => {
    fetchMissions()
  }, [])

  async function fetchMissions() {
    try {
      const data = await api.missions()
      setMissions(data || [])
    } catch (err) {
      console.error('[Missions] Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredMissions = missions.filter(m => {
    if (selectedTab === 'all') return true
    if (selectedTab === 'active') return m.status === 'active'
    if (selectedTab === 'planned') return m.status === 'planned'
    if (selectedTab === 'completed') return m.status === 'completed'
    return true
  })

  if (showPlanner) {
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
            📋 Missions - Planning & Execution
          </h1>
          <button
            onClick={() => {
              setShowPlanner(false)
              fetchMissions()
            }}
            style={{
              padding: '0.6rem 1.2rem',
              background: '#2d3748',
              border: '1px solid #4a5568',
              borderRadius: '8px',
              color: '#e0e0e0',
              cursor: 'pointer',
              fontSize: '0.95rem',
              fontWeight: 500
            }}
          >
            ← Back to Missions
          </button>
        </div>
        <MissionPlanner onClose={() => {
          setShowPlanner(false)
          fetchMissions()
        }} />
      </div>
    )
  }

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
          📋 Missions - Planning & Execution
        </h1>
        <button
          onClick={() => setShowPlanner(true)}
          style={{
            padding: '0.7rem 1.5rem',
            background: '#63b3ed',
            color: '#0a0e14',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: 600
          }}
        >
          + New Mission
        </button>
      </div>

      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        marginBottom: '2rem',
        borderBottom: '2px solid #2d3748'
      }}>
        {[
          { key: 'all', label: `All (${missions.length})` },
          { key: 'active', label: `Active (${missions.filter(m => m.status === 'active').length})` },
          { key: 'planned', label: `Planned (${missions.filter(m => m.status === 'planned').length})` },
          { key: 'completed', label: `Completed (${missions.filter(m => m.status === 'completed').length})` }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setSelectedTab(tab.key)}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'none',
              border: 'none',
              borderBottom: selectedTab === tab.key ? '3px solid #63b3ed' : '3px solid transparent',
              color: selectedTab === tab.key ? '#63b3ed' : '#718096',
              cursor: 'pointer',
              fontSize: '0.95rem',
              fontWeight: selectedTab === tab.key ? 600 : 400,
              transition: 'all 0.2s'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Analytics Section */}
      <div style={{ marginBottom: '2rem' }}>
        <LineChart
          data={[
            { date: 'Mon', count: 5 },
            { date: 'Tue', count: 8 },
            { date: 'Wed', count: 6 },
            { date: 'Thu', count: 10 },
            { date: 'Fri', count: 12 },
            { date: 'Sat', count: 4 },
            { date: 'Sun', count: 3 },
          ]}
          xKey="date"
          yKey="count"
          title="Missions Completed Over Time"
          color="#63b3ed"
          height={250}
        />
      </div>

      {/* Mission List or Empty State */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#718096' }}>
          Loading missions...
        </div>
      ) : filteredMissions.length === 0 ? (
        <div style={{
          background: 'linear-gradient(180deg, #1a1f2e, #0f1419)',
          border: '2px dashed #2d3748',
          borderRadius: '12px',
          padding: '3rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
          <h3 style={{ margin: '0 0 1rem', color: '#718096' }}>No {selectedTab} missions</h3>
          <button
            onClick={() => setShowPlanner(true)}
            style={{
              padding: '0.6rem 1.2rem',
              background: '#2d3748',
              border: '1px solid #4a5568',
              borderRadius: '8px',
              color: '#e0e0e0',
              cursor: 'pointer',
              fontSize: '0.95rem'
            }}
          >
            Create First Mission
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {filteredMissions.map(mission => (
            <div
              key={mission.id}
              style={{
                background: 'linear-gradient(180deg, #1a1f2e, #0f1419)',
                border: '1px solid #2d3748',
                borderRadius: '12px',
                padding: '1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <h3 style={{ margin: '0 0 0.5rem' }}>{mission.name || `Mission #${mission.id}`}</h3>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem', color: '#718096' }}>
                  <span>Type: {mission.mission_type || 'N/A'}</span>
                  <span>Asset: {mission.asset_id || 'Unassigned'}</span>
                  <span>Waypoints: {mission.waypoints?.length || 0}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{
                  padding: '0.3rem 0.8rem',
                  background: mission.status === 'active' ? '#22543d' : mission.status === 'completed' ? '#1a365d' : '#744210',
                  color: mission.status === 'active' ? '#68d391' : mission.status === 'completed' ? '#63b3ed' : '#f6ad55',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  textTransform: 'uppercase'
                }}>
                  {mission.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}