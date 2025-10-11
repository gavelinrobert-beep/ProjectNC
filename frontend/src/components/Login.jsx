import React, { useState } from 'react';
import { api } from '../lib/api';
import { setIdToken, setUserRole } from '../lib/auth';

const Login = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const { access_token, role } = await api.login(email, password);
      setIdToken(access_token);
      setUserRole(role);
      onSuccess(role);
    } catch (err) {
      setError('Felaktiga inloggningsuppgifter');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="email">E-post</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={inputStyle}
        />
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="password">Lösenord</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={inputStyle}
        />
      </div>
      {error && <div style={{ color: 'var(--alert)', marginBottom: '1rem' }}>{error}</div>}
      <button type="submit" className="btn">Logga in</button>
    </form>
  );
};

const inputStyle = {
  width: '100%',
  padding: '0.5rem',
  border: '1px solid var(--border)',
  borderRadius: '4px',
  backgroundColor: 'var(--bg)',
  color: 'var(--text)',
  marginTop: '0.25rem',
};

export default Login;
