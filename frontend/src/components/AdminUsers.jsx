
// src/components/AdminUsers.jsx
import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { isAdmin } from '../lib/auth';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    email: '',
    password: '',
    role: 'viewer',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function refreshUsers() {
    try {
      const list = await api.users();
      setUsers(list);
    } catch (e) {
      console.error(e);
      setError('Kunde inte hämta användare');
    }
  }

  useEffect(() => {
    refreshUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError('');
    if (!isAdmin()) {
      setError('Kräver admin');
      return;
    }
    if (!form.email || !form.password) {
      setError('E-post och lösenord krävs');
      return;
    }

    setLoading(true);
    try {
      await api.createUser(form);
      await refreshUsers();
      setForm({ email: '', password: '', role: 'viewer' });
    } catch (err) {
      console.error(err);
      setError(String(err.message || err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3>User Management (Admin)</h3>
      {error && <div style={{ color: '#b5392f', margin: '8px 0' }}>{error}</div>}

      <form onSubmit={handleCreateUser} style={{ display: 'grid', gap: 8, maxWidth: 300 }}>
        <input
          type="email"
          placeholder="E-post"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Lösenord"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
          <option value="viewer">Viewer</option>
          <option value="operator">Operator</option>
          <option value="admin">Admin</option>
        </select>
        <button className="btn" type="submit" disabled={loading || !isAdmin()}>
          Skapa användare
        </button>
      </form>

      <div style={{ marginTop: 12 }} className="muted">Befintliga användare</div>
      <ul className="list">
        {users.map((user) => (
          <li key={user.email}>
            <span>
              <b>{user.email}</b> — {user.role}
            </span>
          </li>
        ))}
        {users.length === 0 && <li className="muted">Inga användare</li>}
      </ul>
    </div>
  );
}
