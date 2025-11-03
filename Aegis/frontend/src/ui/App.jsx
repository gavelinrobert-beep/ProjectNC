import React, { useState } from 'react';
import Dashboard from '../pages/dashboard';
import AdminGeofences from '../components/AdminGeofences';
import Operations from '../components/Operations';
import AlertsPanel from '../components/AlertsPanel';
import MissionPlanner from '../components/MissionPlanner';
import Login from '../components/Login';
import { isAdmin, setIdToken, setUserRole } from '../lib/auth';


export default function App() {
  const [role, setRole] = useState(isAdmin() ? 'admin' : '');
  const [activeTab, setActiveTab] = useState('dashboard');

  function handleLogout() {
    setIdToken('');
    setUserRole('');
    setRole('');
  }

  if (!role) {
    return <Login onSuccess={setRole} />;
  }

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        padding: '12px 20px',
        background: '#0a0a0a',
        borderBottom: '2px solid #1e5a8e',
        marginBottom: 16 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <img 
            src="/logo.png" 
            alt="AEGIS Logo" 
            style={{ 
              height: 50, 
              width: 'auto',
              filter: 'brightness(1.1)' 
            }} 
          />
          <div>
            <h2 style={{ margin: 0, fontSize: 24, color: '#1e5a8e' }}>PROJECT AEGIS</h2>
            <p style={{ margin: 0, fontSize: 12, color: '#999' }}>Military Logistics Command System</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 13, color: '#999' }}>Roll: <b style={{ color: '#1e5a8e' }}>{role}</b></span>
          <button className='btn' onClick={handleLogout} style={{ padding: '6px 16px' }}>Logga ut</button>
        </div>
      </div>
      {/* ========== END OF LOGO HEADER ========== */}

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, padding: '0 20px' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className='btn'
            onClick={() => setActiveTab('dashboard')}
            style={{
              backgroundColor: activeTab === 'dashboard' ? '#3aa86f' : undefined,
              color: activeTab === 'dashboard' ? '#fff' : undefined
            }}
          >
            📊 Dashboard
          </button>
          <button
            className='btn'
            onClick={() => setActiveTab('operations')}
            style={{
              backgroundColor: activeTab === 'operations' ? '#3aa86f' : undefined,
              color: activeTab === 'operations' ? '#fff' : undefined
            }}
          >
            🗺️ Operationer
          </button>
          <button
            className='btn'
            onClick={() => setActiveTab('missions')}
            style={{
              backgroundColor: activeTab === 'missions' ? '#3aa86f' : undefined,
              color: activeTab === 'missions' ? '#fff' : undefined
            }}
          >
            🎯 Uppdrag
          </button>
          <button
            className='btn'
            onClick={() => setActiveTab('alerts')}
            style={{
              backgroundColor: activeTab === 'alerts' ? '#3aa86f' : undefined,
              color: activeTab === 'alerts' ? '#fff' : undefined
            }}
          >
            🚨 Larm
          </button>
          <button
            className='btn'
            onClick={() => setActiveTab('administration')}
            style={{
              backgroundColor: activeTab === 'administration' ? '#3aa86f' : undefined,
              color: activeTab === 'administration' ? '#fff' : undefined
            }}
          >
            ⚙️ Administration
          </button>
        </div>
      </div>

      {activeTab === 'dashboard' && <Dashboard />}
      {activeTab === 'operations' && <Operations />}
      {activeTab === 'missions' && <MissionPlanner />}
      {activeTab === 'alerts' && <AlertsPanel />}
      {activeTab === 'administration' && <AdminGeofences />}
    </div>
  );
}