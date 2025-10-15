import React, { useState } from 'react';
import AdminGeofences from '../components/AdminGeofences';
import Operations from '../components/Operations';
import Login from '../components/Login';
import { isAdmin, setIdToken, setUserRole } from '../lib/auth';


export default function App() {
  const [role, setRole] = useState(isAdmin() ? 'admin' : '');
  const [activeTab, setActiveTab] = useState('operations');

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className='btn'
            onClick={() => setActiveTab('operations')}
            style={{
              backgroundColor: activeTab === 'operations' ? '#3aa86f' : undefined,
              color: activeTab === 'operations' ? '#fff' : undefined
            }}
          >
            Operationer
          </button>
          <button
            className='btn'
            onClick={() => setActiveTab('administration')}
            style={{
              backgroundColor: activeTab === 'administration' ? '#3aa86f' : undefined,
              color: activeTab === 'administration' ? '#fff' : undefined
            }}
          >
            Administration
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ marginRight: 12 }}>Roll: <b>{role}</b></span>
          <button className='btn' onClick={handleLogout}>Logga ut</button>
        </div>
      </div>

      {activeTab === 'operations' ? <Operations /> : <AdminGeofences />}
    </div>
  );
}
