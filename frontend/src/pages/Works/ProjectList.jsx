import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getWorksProjects, deleteWorksProject } from '../../lib/api';
import toast from 'react-hot-toast';

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [projects, statusFilter, searchQuery]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await getWorksProjects({});
      setProjects(data);
    } catch (error) {
      console.error('Failed to load projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...projects];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.project_number.toLowerCase().includes(query) ||
        (p.description && p.description.toLowerCase().includes(query))
      );
    }

    setFilteredProjects(filtered);
  };

  const handleDelete = async (projectId, projectName) => {
    if (!window.confirm(`Are you sure you want to delete project "${projectName}"?`)) {
      return;
    }

    try {
      await deleteWorksProject(projectId);
      toast.success('Project deleted successfully');
      loadProjects();
    } catch (error) {
      console.error('Failed to delete project:', error);
      toast.error('Failed to delete project');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      planning: '#6B7280',
      active: '#10B981',
      on_hold: '#F59E0B',
      completed: '#3B82F6',
      cancelled: '#EF4444',
    };
    return colors[status] || '#6B7280';
  };

  const formatCurrency = (amount) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('sv-SE');
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div>Loading projects...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#1F2937' }}>
            Projects
          </h1>
          <p style={{ color: '#6B7280' }}>Manage construction and contracting projects</p>
        </div>
        <Link 
          to="/works/projects/new"
          style={{
            padding: '0.75rem 1.5rem',
            background: '#4A90E2',
            color: 'white',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '500',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#357ABD'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#4A90E2'}
        >
          + New Project
        </Link>
      </div>

      {/* Filters */}
      <div style={{ 
        background: 'white', 
        padding: '1.5rem', 
        borderRadius: '8px', 
        border: '1px solid #E5E7EB',
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {/* Search */}
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: '1',
              minWidth: '250px',
              padding: '0.5rem 1rem',
              border: '1px solid #D1D5DB',
              borderRadius: '6px',
              fontSize: '0.875rem'
            }}
          />

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #D1D5DB',
              borderRadius: '6px',
              fontSize: '0.875rem',
              background: 'white'
            }}
          >
            <option value="all">All Statuses</option>
            <option value="planning">Planning</option>
            <option value="active">Active</option>
            <option value="on_hold">On Hold</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#6B7280' }}>
          Showing {filteredProjects.length} of {projects.length} projects
        </div>
      </div>

      {/* Projects Table */}
      <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
              <th style={thStyle}>Project</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Start Date</th>
              <th style={thStyle}>End Date</th>
              <th style={thStyle}>Budget</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProjects.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: '#6B7280' }}>
                  {searchQuery || statusFilter !== 'all' 
                    ? 'No projects match your filters'
                    : 'No projects yet. Create your first project to get started.'
                  }
                </td>
              </tr>
            ) : (
              filteredProjects.map(project => (
                <tr 
                  key={project.id} 
                  style={{ borderBottom: '1px solid #E5E7EB' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                >
                  <td style={tdStyle}>
                    <Link 
                      to={`/works/projects/${project.id}`}
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      <div style={{ fontWeight: '600', color: '#1F2937', marginBottom: '0.25rem' }}>
                        {project.name}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                        {project.project_number}
                      </div>
                    </Link>
                  </td>
                  <td style={tdStyle}>
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
                  </td>
                  <td style={tdStyle}>{formatDate(project.start_date)}</td>
                  <td style={tdStyle}>{formatDate(project.end_date)}</td>
                  <td style={tdStyle}>{formatCurrency(project.budget)}</td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Link
                        to={`/works/projects/${project.id}`}
                        style={actionButtonStyle}
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleDelete(project.id, project.name)}
                        style={{ ...actionButtonStyle, color: '#EF4444' }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const thStyle = {
  padding: '0.75rem 1rem',
  textAlign: 'left',
  fontSize: '0.75rem',
  fontWeight: '600',
  color: '#6B7280',
  textTransform: 'uppercase',
  letterSpacing: '0.05em'
};

const tdStyle = {
  padding: '1rem',
  fontSize: '0.875rem'
};

const actionButtonStyle = {
  padding: '0.25rem 0.75rem',
  border: 'none',
  background: 'transparent',
  color: '#4A90E2',
  fontSize: '0.875rem',
  fontWeight: '500',
  cursor: 'pointer',
  textDecoration: 'none',
  transition: 'opacity 0.2s'
};

export default ProjectList;
