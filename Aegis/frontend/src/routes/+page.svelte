<!-- frontend/src/routes/+page.svelte -->
<script>
  import { onMount } from 'svelte'

  let stats = {
    forcePosture: 'NORMAL',
    activeMissions: 3,
    criticalAlerts: 2,
    readiness: 96
  }

  let activeOperations = [
    { name: 'Supply Run → Gotland', progress: 75, eta: '2h 15m' },
    { name: 'Patrol Route Alpha', progress: 40, eta: '4h 30m' },
    { name: 'Maintenance Window', progress: 0, eta: 'Scheduled 14:00Z' }
  ]

  let readinessIndicators = {
    assets: { total: 45, airborne: 3, mobile: 5, ready: 37 },
    alerts: { lowFuel: 2, maintenance: 1 },
    supply: 'All bases green'
  }
</script>

<div class="dashboard">
  <div class="page-header">
    <h1>📊 Dashboard - Executive Overview</h1>
    <p class="subtitle">Real-time operational status and force readiness</p>
  </div>

  <!-- Status Cards -->
  <div class="status-grid">
    <div class="status-card">
      <div class="status-icon">⚡</div>
      <div class="status-content">
        <h3>Force Posture</h3>
        <div class="status-value status-normal">● {stats.forcePosture}</div>
      </div>
    </div>

    <div class="status-card">
      <div class="status-icon">🎯</div>
      <div class="status-content">
        <h3>Active Missions</h3>
        <div class="status-value">{stats.activeMissions}</div>
      </div>
    </div>

    <div class="status-card">
      <div class="status-icon">⚠️</div>
      <div class="status-content">
        <h3>Critical Alerts</h3>
        <div class="status-value status-warning">{stats.criticalAlerts}</div>
      </div>
    </div>

    <div class="status-card">
      <div class="status-icon">📈</div>
      <div class="status-content">
        <h3>Readiness Level</h3>
        <div class="status-value status-excellent">{stats.readiness}%</div>
        <div class="status-label">EXCELLENT</div>
      </div>
    </div>
  </div>

  <!-- Quick Access -->
  <div class="quick-access">
    <a href="/operations" class="quick-link">
      <span class="quick-icon">🗺️</span>
      <div>
        <h3>View Operations Map</h3>
        <p>Full situational awareness picture</p>
      </div>
    </a>

    <a href="/missions" class="quick-link">
      <span class="quick-icon">📋</span>
      <div>
        <h3>Manage Missions</h3>
        <p>Plan and execute operations</p>
      </div>
    </a>

    <a href="/assets" class="quick-link">
      <span class="quick-icon">🚛</span>
      <div>
        <h3>Assets & Logistics</h3>
        <p>Track fleet and supplies</p>
      </div>
    </a>
  </div>

  <!-- Active Operations -->
  <div class="section">
    <h2>🎯 Active Operations</h2>
    <div class="operations-list">
      {#each activeOperations as op}
        <div class="operation-card">
          <div class="operation-header">
            <h3>{op.name}</h3>
            <span class="operation-eta">ETA: {op.eta}</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: {op.progress}%"></div>
          </div>
          <span class="progress-label">{op.progress}% Complete</span>
        </div>
      {/each}
    </div>
  </div>

  <!-- Readiness Indicators -->
  <div class="section">
    <h2>📈 Readiness Indicators</h2>
    <div class="readiness-grid">
      <div class="readiness-card">
        <h3>Assets Status</h3>
        <ul>
          <li>✈️ Airborne: <strong>{readinessIndicators.assets.airborne}</strong></li>
          <li>🚗 Mobile: <strong>{readinessIndicators.assets.mobile}</strong></li>
          <li>🅿️ Ready: <strong>{readinessIndicators.assets.ready}</strong></li>
          <li>📊 Total: <strong>{readinessIndicators.assets.total}</strong></li>
        </ul>
      </div>

      <div class="readiness-card">
        <h3>Critical Alerts</h3>
        <ul>
          <li class="alert-warning">⛽ Low Fuel: <strong>{readinessIndicators.alerts.lowFuel}</strong></li>
          <li class="alert-warning">🔧 Maintenance: <strong>{readinessIndicators.alerts.maintenance}</strong></li>
        </ul>
      </div>

      <div class="readiness-card">
        <h3>Supply Status</h3>
        <div class="status-badge status-good">✅ {readinessIndicators.supply}</div>
      </div>
    </div>
  </div>
</div>

<style>
  .dashboard {
    max-width: 1400px;
  }

  .page-header {
    margin-bottom: 2rem;
  }

  .page-header h1 {
    font-size: 2rem;
    margin-bottom: 0.5rem;
    color: #e0e0e0;
  }

  .subtitle {
    color: #718096;
    font-size: 1rem;
  }

  /* Status Grid */
  .status-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .status-card {
    background: linear-gradient(135deg, #1a1f2e 0%, #242b3d 100%);
    border: 1px solid #2d3748;
    border-radius: 12px;
    padding: 1.5rem;
    display: flex;
    gap: 1rem;
    transition: all 0.3s;
  }

  .status-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.3);
    border-color: #4a5568;
  }

  .status-icon {
    font-size: 2.5rem;
  }

  .status-content h3 {
    font-size: 0.9rem;
    color: #718096;
    margin-bottom: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .status-value {
    font-size: 2rem;
    font-weight: 700;
    color: #63b3ed;
  }

  .status-normal { color: #48bb78; }
  .status-warning { color: #ed8936; }
  .status-excellent { color: #48bb78; }

  .status-label {
    font-size: 0.75rem;
    color: #48bb78;
    font-weight: 600;
    margin-top: 0.25rem;
  }

  /* Quick Access */
  .quick-access {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .quick-link {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.25rem;
    background: #1a1f2e;
    border: 2px solid #2d3748;
    border-radius: 10px;
    text-decoration: none;
    color: #e0e0e0;
    transition: all 0.2s;
  }

  .quick-link:hover {
    border-color: #63b3ed;
    background: rgba(99, 179, 237, 0.05);
  }

  .quick-icon {
    font-size: 2.5rem;
  }

  .quick-link h3 {
    font-size: 1.1rem;
    margin-bottom: 0.25rem;
  }

  .quick-link p {
    font-size: 0.85rem;
    color: #718096;
  }

  /* Sections */
  .section {
    background: #1a1f2e;
    border: 1px solid #2d3748;
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .section h2 {
    font-size: 1.3rem;
    margin-bottom: 1.5rem;
    color: #e0e0e0;
    border-bottom: 2px solid #2d3748;
    padding-bottom: 0.75rem;
  }

  /* Operations List */
  .operations-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .operation-card {
    background: #0f1419;
    border: 1px solid #2d3748;
    border-radius: 8px;
    padding: 1.25rem;
  }

  .operation-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
  }

  .operation-header h3 {
    font-size: 1.05rem;
    color: #63b3ed;
  }

  .operation-eta {
    font-size: 0.85rem;
    color: #718096;
  }

  .progress-bar {
    height: 8px;
    background: #2d3748;
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 0.5rem;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #4299e1 0%, #48bb78 100%);
    transition: width 0.5s;
  }

  .progress-label {
    font-size: 0.8rem;
    color: #718096;
  }

  /* Readiness Grid */
  .readiness-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
  }

  .readiness-card {
    background: #0f1419;
    border: 1px solid #2d3748;
    border-radius: 8px;
    padding: 1.25rem;
  }

  .readiness-card h3 {
    font-size: 1rem;
    color: #718096;
    margin-bottom: 1rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .readiness-card ul {
    list-style: none;
    padding: 0;
  }

  .readiness-card li {
    padding: 0.5rem 0;
    color: #a0aec0;
    font-size: 0.95rem;
  }

  .readiness-card li strong {
    color: #63b3ed;
    float: right;
  }

  .alert-warning {
    color: #ed8936 !important;
  }

  .status-badge {
    padding: 0.75rem;
    border-radius: 6px;
    text-align: center;
    font-weight: 600;
  }

  .status-good {
    background: rgba(72, 187, 120, 0.2);
    color: #48bb78;
  }
</style>