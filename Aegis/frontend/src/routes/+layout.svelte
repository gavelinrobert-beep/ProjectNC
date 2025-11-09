<!-- frontend/src/routes/+layout.svelte -->
<script>
  import { page } from '$app/stores'
  import { goto } from '$app/navigation'

  let sidebarOpen = true

  const navigation = [
    { name: 'Dashboard', icon: '📊', path: '/' },
    { name: 'Operations', icon: '🗺️', path: '/operations' },
    { name: 'Missions', icon: '📋', path: '/missions' },
    { name: 'Assets & Logistics', icon: '🚛', path: '/assets' },
    { name: 'Communications', icon: '💬', path: '/communications', badge: 'NEW' },
    { name: 'Intelligence', icon: '🎯', path: '/intelligence', badge: 'NEW' },
    { name: 'Inventory', icon: '📦', path: '/inventory' },
    { name: 'Administration', icon: '⚙️', path: '/admin' }
  ]

  function isActive(path) {
    if (path === '/') return $page.url.pathname === '/'
    return $page.url.pathname.startsWith(path)
  }
</script>

<div class="app-shell">
  <!-- Top Bar -->
  <header class="top-bar">
    <div class="top-bar-left">
      <button class="menu-toggle" on:click={() => sidebarOpen = !sidebarOpen}>
        ☰
      </button>
      <div class="logo">
        <span class="logo-icon">🛡️</span>
        <span class="logo-text">PROJECT AEGIS</span>
      </div>
    </div>

    <div class="top-bar-center">
      <span class="subtitle">Military Logistics Command System</span>
    </div>

    <div class="top-bar-right">
      <span class="time-display">{new Date().toISOString().slice(0, 19)}Z</span>
      <span class="user-badge">👤 admin</span>
      <button class="notifications">🔔 <span class="badge">3</span></button>
    </div>
  </header>

  <!-- Sidebar -->
  <aside class="sidebar" class:collapsed={!sidebarOpen}>
    <nav class="nav-menu">
      {#each navigation as item}
        <a
          href={item.path}
          class="nav-item"
          class:active={isActive(item.path)}
        >
          <span class="nav-icon">{item.icon}</span>
          {#if sidebarOpen}
            <span class="nav-label">{item.name}</span>
            {#if item.badge}
              <span class="nav-badge">{item.badge}</span>
            {/if}
          {/if}
        </a>
      {/each}
    </nav>

    {#if sidebarOpen}
      <div class="demo-status">
        <div class="demo-indicator">
          <span class="demo-dot"></span>
          <span>DEMO MODE ACTIVE</span>
        </div>
        <button class="demo-stop">⏹️ Stop Demo</button>
      </div>
    {/if}
  </aside>

  <!-- Main Content -->
  <main class="content" class:expanded={!sidebarOpen}>
    <slot />
  </main>
</div>

<style>
  .app-shell {
    display: grid;
    grid-template-areas:
      "topbar topbar"
      "sidebar content";
    grid-template-columns: 250px 1fr;
    grid-template-rows: 60px 1fr;
    height: 100vh;
    background: #0a0e14;
    color: #e0e0e0;
  }

  /* Top Bar */
  .top-bar {
    grid-area: topbar;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 1.5rem;
    background: linear-gradient(135deg, #1a1f2e 0%, #0f1419 100%);
    border-bottom: 2px solid #2d3748;
    box-shadow: 0 2px 10px rgba(0,0,0,0.3);
  }

  .top-bar-left {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .menu-toggle {
    background: none;
    border: none;
    color: #e0e0e0;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0.5rem;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 700;
    font-size: 1.1rem;
  }

  .logo-icon {
    font-size: 1.5rem;
  }

  .subtitle {
    color: #718096;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .top-bar-right {
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }

  .time-display {
    font-family: monospace;
    color: #63b3ed;
    font-size: 0.9rem;
  }

  .user-badge {
    padding: 0.4rem 0.8rem;
    background: #2d3748;
    border-radius: 6px;
    font-size: 0.9rem;
  }

  .notifications {
    position: relative;
    background: none;
    border: none;
    color: #e0e0e0;
    font-size: 1.2rem;
    cursor: pointer;
    padding: 0.5rem;
  }

  .notifications .badge {
    position: absolute;
    top: 0;
    right: 0;
    background: #f56565;
    color: white;
    font-size: 0.7rem;
    padding: 0.1rem 0.4rem;
    border-radius: 10px;
    font-family: sans-serif;
  }

  /* Sidebar */
  .sidebar {
    grid-area: sidebar;
    background: #1a1f2e;
    border-right: 2px solid #2d3748;
    display: flex;
    flex-direction: column;
    transition: all 0.3s ease;
    overflow: hidden;
  }

  .sidebar.collapsed {
    grid-column: 1;
    width: 70px;
  }

  .nav-menu {
    flex: 1;
    padding: 1rem 0;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.9rem 1.25rem;
    color: #a0aec0;
    text-decoration: none;
    transition: all 0.2s;
    border-left: 3px solid transparent;
  }

  .nav-item:hover {
    background: rgba(99, 179, 237, 0.1);
    color: #63b3ed;
  }

  .nav-item.active {
    background: rgba(99, 179, 237, 0.15);
    color: #63b3ed;
    border-left-color: #63b3ed;
  }

  .nav-icon {
    font-size: 1.3rem;
    min-width: 1.5rem;
  }

  .nav-label {
    font-size: 0.95rem;
    font-weight: 500;
    white-space: nowrap;
  }

  .nav-badge {
    margin-left: auto;
    background: #48bb78;
    color: white;
    font-size: 0.65rem;
    padding: 0.15rem 0.5rem;
    border-radius: 10px;
    font-weight: 600;
  }

  /* Demo Status */
  .demo-status {
    padding: 1rem;
    border-top: 1px solid #2d3748;
    background: rgba(245, 101, 101, 0.1);
  }

  .demo-indicator {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #fc8181;
    font-size: 0.85rem;
    font-weight: 600;
    margin-bottom: 0.75rem;
  }

  .demo-dot {
    width: 8px;
    height: 8px;
    background: #fc8181;
    border-radius: 50%;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  .demo-stop {
    width: 100%;
    padding: 0.6rem;
    background: #742a2a;
    color: #fc8181;
    border: 1px solid #9b2c2c;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.85rem;
    transition: all 0.2s;
  }

  .demo-stop:hover {
    background: #9b2c2c;
    color: white;
  }

  /* Main Content */
  .content {
    grid-area: content;
    padding: 2rem;
    overflow-y: auto;
    background: #0f1419;
  }

  .content.expanded {
    margin-left: -180px;
  }

  /* Scrollbar Styling */
  .content::-webkit-scrollbar {
    width: 8px;
  }

  .content::-webkit-scrollbar-track {
    background: #1a1f2e;
  }

  .content::-webkit-scrollbar-thumb {
    background: #2d3748;
    border-radius: 4px;
  }

  .content::-webkit-scrollbar-thumb:hover {
    background: #4a5568;
  }
</style>