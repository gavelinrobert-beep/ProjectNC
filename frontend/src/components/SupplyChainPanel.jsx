import React from 'react'

const BRAND = {
  primary: '#00BFFF',
  secondary: '#FFD700',
  success: '#00FF88',
  warning: '#FFA500',
  danger: '#FF4444',
  card: '#1a1a1a',
  border: '#2a2a2a',
}

const SupplyChainPanel = ({ inventory, bases, missions }) => {
  // Categorize supplies
  const categorizeSupply = (name) => {
    const n = name.toLowerCase()
    if (n.includes('ammunition') || n.includes('ammo') || n.includes('rounds')) return 'ammunition'
    if (n.includes('fuel') || n.includes('diesel') || n.includes('gasoline')) return 'fuel'
    if (n.includes('medical') || n.includes('bandage') || n.includes('medicine')) return 'medical'
    if (n.includes('food') || n.includes('ration') || n.includes('water')) return 'provisions'
    if (n.includes('spare') || n.includes('parts') || n.includes('maintenance')) return 'maintenance'
    return 'other'
  }

  const categories = {
    ammunition: { icon: '💣', label: 'Ammunition', items: [], color: BRAND.danger },
    fuel: { icon: '⛽', label: 'Fuel & Energy', items: [], color: BRAND.warning },
    medical: { icon: '🏥', label: 'Medical', items: [], color: BRAND.success },
    provisions: { icon: '🍽️', label: 'Provisions', items: [], color: BRAND.secondary },
    maintenance: { icon: '🔧', label: 'Maintenance', items: [], color: BRAND.primary },
    other: { icon: '📦', label: 'Other', items: [], color: '#9c27b0' }
  }

  // Group inventory by category
  inventory.forEach(item => {
    const cat = categorizeSupply(item.name)
    categories[cat].items.push(item)
  })

  // Calculate category health
  const getCategoryHealth = (items) => {
    if (items.length === 0) return { status: 'N/A', percentage: 0, color: '#666' }
    const totalHealth = items.reduce((sum, item) => {
      const pct = (item.quantity / item.min_stock_level) * 100
      return sum + Math.min(pct, 100)
    }, 0)
    const avgHealth = totalHealth / items.length

    if (avgHealth >= 80) return { status: 'EXCELLENT', percentage: avgHealth, color: BRAND.success }
    if (avgHealth >= 60) return { status: 'GOOD', percentage: avgHealth, color: BRAND.secondary }
    if (avgHealth >= 40) return { status: 'LOW', percentage: avgHealth, color: BRAND.warning }
    return { status: 'CRITICAL', percentage: avgHealth, color: BRAND.danger }
  }

  const CategoryCard = ({ category, data }) => {
    const health = getCategoryHealth(data.items)
    const criticalItems = data.items.filter(item => (item.quantity / item.min_stock_level) * 100 < 50)

    return (
      <div style={{
        background: `linear-gradient(135deg, ${data.color}11 0%, ${data.color}05 100%)`,
        border: `1px solid ${data.color}44`,
        borderRadius: 6,
        padding: 12,
        marginBottom: 10
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 20 }}>{data.icon}</span>
            <div>
              <div style={{ fontSize: 11, fontWeight: 'bold', color: data.color }}>{data.label}</div>
              <div style={{ fontSize: 9, color: '#666' }}>{data.items.length} item types</div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 14, fontWeight: 'bold', color: health.color }}>
              {health.percentage.toFixed(0)}%
            </div>
            <div style={{ fontSize: 8, color: health.color, fontWeight: 'bold' }}>
              {health.status}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{
          height: 6,
          background: '#222',
          borderRadius: 3,
          overflow: 'hidden',
          marginBottom: 8
        }}>
          <div style={{
            width: `${health.percentage}%`,
            height: '100%',
            background: health.color,
            transition: 'width 0.5s ease'
          }} />
        </div>

        {/* Critical items warning */}
        {criticalItems.length > 0 && (
          <div style={{
            background: 'rgba(255, 68, 68, 0.1)',
            border: '1px solid rgba(255, 68, 68, 0.3)',
            borderRadius: 4,
            padding: 6,
            fontSize: 9,
            color: BRAND.danger
          }}>
            ⚠️ {criticalItems.length} item{criticalItems.length > 1 ? 's' : ''} below 50% stock
          </div>
        )}
      </div>
    )
  }

  // Calculate overall supply health
  const overallHealth = () => {
    const allItems = Object.values(categories).flatMap(cat => cat.items)
    if (allItems.length === 0) return 0
    const totalHealth = allItems.reduce((sum, item) => {
      const pct = Math.min((item.quantity / item.min_stock_level) * 100, 100)
      return sum + pct
    }, 0)
    return Math.round(totalHealth / allItems.length)
  }

  const overall = overallHealth()
  const overallColor = overall >= 80 ? BRAND.success : overall >= 60 ? BRAND.secondary : overall >= 40 ? BRAND.warning : BRAND.danger

  return (
    <div style={{
      background: BRAND.card,
      border: `1px solid ${BRAND.primary}44`,
      borderRadius: 8,
      padding: 16,
      height: '100%'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginBottom: 16,
        paddingBottom: 12,
        borderBottom: `1px solid ${BRAND.border}`
      }}>
        <span style={{ fontSize: 20 }}>📊</span>
        <div>
          <h3 style={{ margin: 0, color: BRAND.primary, fontSize: 14 }}>SUPPLY CHAIN STATUS</h3>
          <div style={{ fontSize: 9, color: '#666', marginTop: 2 }}>
            {bases.length} Active Bases • {inventory.length} Item Types
          </div>
        </div>
      </div>

      {/* Overall Health */}
      <div style={{
        background: `linear-gradient(135deg, ${overallColor}22 0%, ${overallColor}11 100%)`,
        border: `2px solid ${overallColor}`,
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        textAlign: 'center'
      }}>
        <div style={{ fontSize: 10, color: '#999', marginBottom: 4 }}>OVERALL SUPPLY STATUS</div>
        <div style={{ fontSize: 32, fontWeight: 'bold', color: overallColor }}>
          {overall}%
        </div>
        <div style={{ fontSize: 9, color: '#666', marginTop: 4 }}>
          Active Supply Routes: {missions.filter(m => m.mission_type === 'transfer' && m.status === 'active').length}
        </div>
      </div>

      {/* Category Cards */}
      <div style={{ maxHeight: 400, overflowY: 'auto', paddingRight: 4 }}>
        {Object.entries(categories).map(([key, data]) => (
          data.items.length > 0 && <CategoryCard key={key} category={key} data={data} />
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{
        marginTop: 12,
        paddingTop: 12,
        borderTop: `1px solid ${BRAND.border}`,
        display: 'flex',
        gap: 8
      }}>
        <button style={{
          flex: 1,
          background: BRAND.primary,
          color: '#000',
          border: 'none',
          padding: '8px 12px',
          borderRadius: 4,
          fontSize: 10,
          fontWeight: 'bold',
          cursor: 'pointer'
        }}>
          📋 RESUPPLY PLAN
        </button>
        <button style={{
          flex: 1,
          background: BRAND.secondary,
          color: '#000',
          border: 'none',
          padding: '8px 12px',
          borderRadius: 4,
          fontSize: 10,
          fontWeight: 'bold',
          cursor: 'pointer'
        }}>
          🚚 TRANSFER MISSION
        </button>
      </div>
    </div>
  )
}

export default SupplyChainPanel