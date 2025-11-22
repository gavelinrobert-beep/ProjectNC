import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getWorksProjects, getWorksWorkOrders, getWorksMachineHours, getWorksChangeOrders } from '../../lib/api';
import toast from 'react-hot-toast';
import BarChart from '../../components/charts/BarChart';
import LineChart from '../../components/charts/LineChart';
import AreaChart from '../../components/charts/AreaChart';

const WorksDashboard = () => {
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    totalWorkOrders: 0,
    activeWorkOrders: 0,
    totalMachineHours: 0,
    pendingChangeOrders: 0,
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [recentWorkOrders, setRecentWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load projects
      const projects = await getWorksProjects({});
      setRecentProjects(projects.slice(0, 5));
      
      // Load work orders
      const workOrders = await getWorksWorkOrders({});
      setRecentWorkOrders(workOrders.slice(0, 5));
      
      // Load machine hours
      const machineHours = await getWorksMachineHours({});
      const totalHours = machineHours.reduce((sum, entry) => sum + (parseFloat(entry.hours) || 0), 0);
      
      // Load change orders
      const changeOrders = await getWorksChangeOrders({});
      
      setStats({
        totalProjects: projects.length,
        activeProjects: projects.filter(p => p.status === 'active').length,
        totalWorkOrders: workOrders.length,
        activeWorkOrders: workOrders.filter(wo => wo.status === 'in_progress').length,
        totalMachineHours: totalHours.toFixed(1),
        pendingChangeOrders: changeOrders.filter(co => co.status === 'submitted').length,
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      planning: '#6B7280',
      active: '#10B981',
      on_hold: '#F59E0B',
      completed: '#3B82F6',
      cancelled: '#EF4444',
      draft: '#6B7280',
      scheduled: '#3B82F6',
      in_progress: '#10B981',
    };
    return colors[status] || '#6B7280';
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div>Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#1F2937' }}>
          SYLON Works Dashboard
        </h1>
        <p style={{ color: '#6B7280' }}>Construction and contracting operations overview</p>
      </div>

      {/* Statistics Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <StatCard 
          title="Active Projects" 
          value={stats.activeProjects}
          subtitle={`${stats.totalProjects} total`}
          icon="🏗️"
          color="#10B981"
        />
        <StatCard 
          title="Active Work Orders" 
          value={stats.activeWorkOrders}
          subtitle={`${stats.totalWorkOrders} total`}
          icon="📋"
          color="#3B82F6"
        />
        <StatCard 
          title="Machine Hours" 
          value={stats.totalMachineHours}
          subtitle="Total logged"
          icon="⏱️"
          color="#F59E0B"
        />
        <StatCard 
          title="Pending ÄTA" 
          value={stats.pendingChangeOrders}
          subtitle="Change orders"
          icon="📝"
          color="#EF4444"
        />
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#1F2937' }}>
          Quick Actions
        </h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/works/projects/new" style={quickActionStyle}>
            <span style={{ fontSize: '1.5rem' }}>➕</span>
            <span>New Project</span>
          </Link>
          <Link to="/works/work-orders/new" style={quickActionStyle}>
            <span style={{ fontSize: '1.5rem' }}>📝</span>
            <span>New Work Order</span>
          </Link>
          <Link to="/works/machine-hours/new" style={quickActionStyle}>
            <span style={{ fontSize: '1.5rem' }}>⏱️</span>
            <span>Log Machine Hours</span>
          </Link>
          <Link to="/works/change-orders/new" style={quickActionStyle}>
            <span style={{ fontSize: '1.5rem' }}>📄</span>
            <span>New ÄTA</span>
          </Link>
        </div>
      </div>

      {/* Analytics Charts */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#1F2937' }}>
          Analytics
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <BarChart
            data={[
              { project: 'Project A', progress: 85 },
              { project: 'Project B', progress: 60 },
              { project: 'Project C', progress: 45 },
              { project: 'Project D', progress: 30 },
            ]}
            xKey="project"
            yKey="progress"
            title="Project Progress (%)"
            color="#10B981"
            height={250}
          />
          <LineChart
            data={[
              { month: 'Jan', budget: 50000, spent: 45000 },
              { month: 'Feb', budget: 55000, spent: 52000 },
              { month: 'Mar', budget: 60000, spent: 58000 },
              { month: 'Apr', budget: 65000, spent: 61000 },
            ]}
            xKey="month"
            yKey="spent"
            title="Budget vs Spent"
            color="#3B82F6"
            height={250}
          />
        </div>
        <AreaChart
          data={[
            { week: 'Week 1', hours: 120 },
            { week: 'Week 2', hours: 145 },
            { week: 'Week 3', hours: 130 },
            { week: 'Week 4', hours: 160 },
          ]}
          xKey="week"
          yKey="hours"
          title="Machine Hours (Monthly)"
          color="#8B5CF6"
          height={250}
        />
      </div>

      {/* Recent Projects and Work Orders */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Recent Projects */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1F2937' }}>
              Recent Projects
            </h2>
            <Link to="/works/projects" style={{ color: '#4A90E2', textDecoration: 'none', fontSize: '0.875rem' }}>
              View all →
            </Link>
          </div>
          <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
            {recentProjects.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#6B7280' }}>
                No projects yet
              </div>
            ) : (
              recentProjects.map(project => (
                <Link 
                  key={project.id}
                  to={`/works/projects/${project.id}`}
                  style={{
                    display: 'block',
                    padding: '1rem',
                    borderBottom: '1px solid #E5E7EB',
                    textDecoration: 'none',
                    color: 'inherit',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <div style={{ fontWeight: '600', color: '#1F2937', marginBottom: '0.25rem' }}>
                        {project.name}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                        {project.project_number}
                      </div>
                    </div>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      background: `${getStatusColor(project.status)}20`,
                      color: getStatusColor(project.status)
                    }}>
                      {project.status}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent Work Orders */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1F2937' }}>
              Recent Work Orders
            </h2>
            <Link to="/works/work-orders" style={{ color: '#4A90E2', textDecoration: 'none', fontSize: '0.875rem' }}>
              View all →
            </Link>
          </div>
          <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
            {recentWorkOrders.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#6B7280' }}>
                No work orders yet
              </div>
            ) : (
              recentWorkOrders.map(workOrder => (
                <Link 
                  key={workOrder.id}
                  to={`/works/work-orders/${workOrder.id}`}
                  style={{
                    display: 'block',
                    padding: '1rem',
                    borderBottom: '1px solid #E5E7EB',
                    textDecoration: 'none',
                    color: 'inherit',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <div style={{ fontWeight: '600', color: '#1F2937', marginBottom: '0.25rem' }}>
                        {workOrder.title}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                        {workOrder.order_number} • {workOrder.type}
                      </div>
                    </div>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      background: `${getStatusColor(workOrder.status)}20`,
                      color: getStatusColor(workOrder.status)
                    }}>
                      {workOrder.status}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, subtitle, icon, color }) => (
  <div style={{
    background: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    border: '1px solid #E5E7EB',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
      <div style={{ fontSize: '0.875rem', color: '#6B7280', fontWeight: '500' }}>{title}</div>
      <div style={{ fontSize: '1.5rem' }}>{icon}</div>
    </div>
    <div style={{ fontSize: '2rem', fontWeight: 'bold', color, marginBottom: '0.25rem' }}>
      {value}
    </div>
    <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{subtitle}</div>
  </div>
);

const quickActionStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.75rem 1.5rem',
  background: 'white',
  border: '1px solid #E5E7EB',
  borderRadius: '8px',
  textDecoration: 'none',
  color: '#1F2937',
  fontWeight: '500',
  transition: 'all 0.2s',
  cursor: 'pointer',
};

export default WorksDashboard;
