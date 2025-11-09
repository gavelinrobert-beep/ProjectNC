<!-- frontend/src/routes/operations/+page.svelte -->
<script>
  // TODO: Move your existing full map component here
  // This will be your main operational picture view
</script>

<div class="operations-page">
  <div class="page-header">
    <h1>🗺️ Operations - Common Operational Picture</h1>
    <div class="controls">
      <button class="btn">Layers</button>
      <button class="btn">Filters</button>
      <select class="time-select">
        <option>LIVE</option>
        <option>Playback</option>
      </select>
    </div>
  </div>

  <!-- Layer Toggles -->
  <div class="layer-controls">
    <label><input type="checkbox" checked> ✓ Assets</label>
    <label><input type="checkbox" checked> ✓ Bases</label>
    <label><input type="checkbox" checked> ✓ Geofences</label>
    <label><input type="checkbox"> ☐ Threats</label>
    <label><input type="checkbox"> ☐ Weather</label>
    <label><input type="checkbox"> ☐ Missions</label>
  </div>

  <!-- Map Container -->
  <div class="map-container">
    <p style="text-align: center; padding: 4rem; color: #718096;">
      📍 Move your existing map component here from the dashboard
    </p>
  </div>
</div>

<style>
  .operations-page {
    height: calc(100vh - 120px);
    display: flex;
    flex-direction: column;
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .page-header h1 {
    font-size: 1.5rem;
    color: #e0e0e0;
  }

  .controls {
    display: flex;
    gap: 0.75rem;
  }

  .btn {
    padding: 0.6rem 1.2rem;
    background: #2d3748;
    color: #e0e0e0;
    border: 1px solid #4a5568;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn:hover {
    background: #4a5568;
  }

  .time-select {
    padding: 0.6rem 1rem;
    background: #2d3748;
    color: #e0e0e0;
    border: 1px solid #4a5568;
    border-radius: 6px;
    cursor: pointer;
  }

  .layer-controls {
    display: flex;
    gap: 1.5rem;
    padding: 1rem;
    background: #1a1f2e;
    border-radius: 8px;
    margin-bottom: 1rem;
  }

  .layer-controls label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #a0aec0;
    cursor: pointer;
    font-size: 0.9rem;
  }

  .map-container {
    flex: 1;
    background: #1a1f2e;
    border: 2px solid #2d3748;
    border-radius: 12px;
    overflow: hidden;
  }
</style>