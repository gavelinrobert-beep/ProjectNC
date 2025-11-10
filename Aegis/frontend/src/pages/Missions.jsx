// frontend/src/pages/Missions.jsx
import React, { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { BRAND } from '../lib/constants'
import MissionPlanner from '../components/MissionPlanner'

export default function Missions() {
  const [missions, setMissions] = useState([])
  const [assets, setAssets] = useState([])
  const [bases, setBases] = useState([])
  const [loading, setLoading] = useState(true)
  const [showPlanner, setShowPlanner] = useState(false)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [missionsData, assetsData, basesData] = await Promise.all([
          api.missions(),
          api.assets(),
          api.bases()
        ])
        setMissions(missionsData || [])
        setAssets(assetsData || [])
        setBases(basesData || [])
        setLoading(false)
      } catch (err) {
        console.error('[Missions] Error:', err)
        setLoading(false)
      }
    }
    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [])

  const activeMissions = missions.filter(m => m.status === 'active')
  const plannedMissions = missions.filter(m => m.status === 'planned')
  const completedMissions = missions.filter(m => m.status === 'completed')

  const filteredMissions = filter === 'all' ? missions :
    filter === 'active' ? activeMissions :
    filter === 'planned' ? plannedMissions :
    completedMissions

  if (loading) {
    return <div style={{ padding: 20, textAlign: 'center', color: BRAND.primary }}>Loading missions...</div>
  }

  return (
    <div style={{ maxWidth: '1400px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <h1 style={{ fontSize: '1.5rem', color: '#e0e0e0', margin: 0 }}>
          📋 Missions - Planning & Execution
        </h1>
        <button
          onClick={() => setShowPlanner(true)}
          style={{
            padding: '0.75rem 1.5rem',
            background: BRAND.primary,
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.95rem'
          }}
        >
          + New Mission
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '2rem',
        borderBottom: '2px solid #2d3748',
        paddingBottom: '0.5rem'
      }}>
        {['all', 'active', 'planned', 'completed'].map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'transparent',
              border: 'none',
              color: filter === tab ? '#63b3ed' : '#718096',
              cursor: 'pointer',
              transition: 'all 0.2s',
              borderBottom: filter === tab ? '3px solid #63b3ed' : '3px solid transparent',
              textTransform: 'capitalize',
              fontWeight: filter === tab ? 600 : 400
            }}
          >
            {tab} ({
              tab === 'all' ? missions.length :
              tab === 'active' ? activeMissions.length :
              tab === 'planned' ? plannedMissions.length :
              completedMissions.length
            })
          </button>
        ))}
      </div>

      {/* Active Missions */}
      {filteredMissions.length === 0 ? (
        <div style={{
          padding: '3rem',
          textAlign: 'center',
          background: '#1a1f2e',
          border: '2px dashed #2d3748',
          borderRadius: '12px',
          color: '#718096'
        }}>
          <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>No {filter} missions</p>
          <button
            onClick={() => setShowPlanner(true)}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#2d3748',
              color: '#e0e0e0',
              border: '1px solid #4a5568',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Create First Mission
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredMissions.map(mission => (
            <MissionCard key={mission.id} mission={mission} assets={assets} />
          ))}
        </div>
      )}

      {/* Mission Planner Modal */}
      {showPlanner && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: BRAND.bgCard,
            padding: '2rem',
            borderRadius: '12px',
            maxWidth: '800px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <MissionPlanner
              assets={assets}
              bases={bases}
              onClose={() => {
                setShowPlanner(false)
                // Refresh missions
                api.missions().then(data => setMissions(data || []))
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function MissionCard({ mission, assets }) {
  const asset = assets.find(a => a.id === mission.asset_id)
  const statusColor = mission.status === 'active' ? BRAND.success :
    mission.status === 'planned' ? BRAND.warning :
    '#718096'

  return (
    <div style={{
      background: '#1a1f2e',
      border: '1px solid #2d3748',
      borderRadius: '8px',
      padding: '1.25rem'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.75rem'
      }}>
        <h3 style={{
          fontSize: '1.05rem',
          color: '#63b3ed',
          margin: 0
        }}>
          {mission.name || `Mission #${mission.id}`}
        </h3>
        <span style={{
          padding: '0.25rem 0.75rem',
          background: `${statusColor}22`,
          color: statusColor,
          borderRadius: '12px',
          fontSize: '0.8rem',
          fontWeight: 600,
          textTransform: 'uppercase'
        }}>
          {mission.status}
        </span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '1rem',
        fontSize: '0.9rem',
        color: '#a0aec0'
      }}>
        <div>
          <span style={{ color: '#718096' }}>Asset:</span>{' '}
          <strong style={{ color: '#e0e0e0' }}>
            {asset?.id || mission.asset_id || 'Unassigned'}
          </strong>
        </div>
        <div>
          <span style={{ color: '#718096' }}>Type:</span>{' '}
          <strong style={{ color: '#e0e0e0' }}>
            {mission.mission_type || 'N/A'}
          </strong>
        </div>
        {mission.waypoints && (
          <div>
            <span style={{ color: '#718096' }}>Waypoints:</span>{' '}
            <strong style={{ color: '#e0e0e0' }}>
              {mission.waypoints.length}
            </strong>
          </div>
        )}
      </div>

      <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
        <button style={missionButtonStyle}>View Details</button>
        <button style={missionButtonStyle}>View on Map</button>
        {mission.status === 'active' && (
          <button style={{ ...missionButtonStyle, background: '#742a2a', color: '#fc8181' }}>
            Abort
          </button>
        )}
      </div>
    </div>
  )
}

const missionButtonStyle = {
  padding: '0.5rem 1rem',
  background: '#2d3748',
  color: '#e0e0e0',
  border: '1px solid #4a5568',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '0.85rem'
}