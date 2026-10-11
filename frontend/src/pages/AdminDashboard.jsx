import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/dashboard');
      setData(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, gradient }) => (
    <div className="stat-card-modern">
      <div style={{ width: 52, height: 52, borderRadius: 16, background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', marginBottom: 14 }}>
        <span className="material-icons" style={{ fontSize: 26 }}>{icon}</span>
      </div>
      <div style={{ fontSize: 32, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: '2px 0' }}>{value}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>{title}</div>
    </div>
  );

  return (
    <div>
      <div className="page-header-desktop">
        <div>
          <h1>Admin Command Dashboard</h1>
          <p>Real-time system analytics and campus moderation controls</p>
        </div>

        <button 
          onClick={loadDashboard}
          className="btn-black"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'white' }}
        >
          <span className="material-icons">refresh</span>
          Refresh Stats
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
          <span className="material-icons" style={{ fontSize: 44, animation: 'spin 1.5s linear infinite' }}>sync</span>
          <p style={{ marginTop: 12, fontSize: 14 }}>Loading analytics...</p>
        </div>
      ) : data && (
        <>
          {/* 4-Column Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 32 }}>
            <StatCard title="Active Users" value={data.total_users} icon="people" gradient="var(--primary-gradient)" />
            <StatCard title="Total Notices" value={data.total_items} icon="inventory" gradient="var(--purple-gradient)" />
            <StatCard title="Reported Lost" value={data.lost_count} icon="search" gradient="var(--lost-gradient)" />
            <StatCard title="Reported Found" value={data.found_count} icon="check_circle" gradient="var(--found-gradient)" />
          </div>

          {/* 3 Action Panels */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 22 }}>
            <div 
              className="desktop-card" 
              style={{ padding: '28px', cursor: 'pointer', transition: 'all 0.25s ease' }}
              onClick={() => navigate('/admin/users')}
            >
              <div style={{ width: 48, height: 48, borderRadius: 14, background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4338ca', marginBottom: 18 }}>
                <span className="material-icons" style={{ fontSize: 26 }}>manage_accounts</span>
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 8px 0', color: '#0f172a' }}>Manage Campus Users</h3>
              <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 20px 0', lineHeight: 1.5 }}>
                View all registered students, review roles, departments, and phone contact records.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--primary)', fontWeight: 800, fontSize: 14 }}>
                <span>Access Users</span>
                <span className="material-icons" style={{ fontSize: 18 }}>arrow_forward</span>
              </div>
            </div>

            <div 
              className="desktop-card" 
              style={{ padding: '28px', cursor: 'pointer', transition: 'all 0.25s ease' }}
              onClick={() => navigate('/admin/items')}
            >
              <div style={{ width: 48, height: 48, borderRadius: 14, background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669', marginBottom: 18 }}>
                <span className="material-icons" style={{ fontSize: 26 }}>inventory_2</span>
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 8px 0', color: '#0f172a' }}>Moderate Notices</h3>
              <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 20px 0', lineHeight: 1.5 }}>
                Audit all active, claimed, and returned item postings. Soft-delete inappropriate posts.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#059669', fontWeight: 800, fontSize: 14 }}>
                <span>Moderate Items</span>
                <span className="material-icons" style={{ fontSize: 18 }}>arrow_forward</span>
              </div>
            </div>

            <div 
              className="desktop-card" 
              style={{ padding: '28px', cursor: 'pointer', transition: 'all 0.25s ease' }}
              onClick={() => navigate('/admin/claims')}
            >
              <div style={{ width: 48, height: 48, borderRadius: 14, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706', marginBottom: 18 }}>
                <span className="material-icons" style={{ fontSize: 26 }}>verified</span>
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 8px 0', color: '#0f172a' }}>Audit Resolution Claims</h3>
              <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 20px 0', lineHeight: 1.5 }}>
                Review ownership claims across the entire campus, approve disputes, or decline invalid claims.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#d97706', fontWeight: 800, fontSize: 14 }}>
                <span>Audit Claims</span>
                <span className="material-icons" style={{ fontSize: 18 }}>arrow_forward</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default AdminDashboard;
