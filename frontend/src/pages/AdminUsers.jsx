import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (err) {
      alert("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <Link to="/admin" style={{ color: '#94a3b8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, fontSize: 14, fontWeight: 600 }}>
          <span className="material-icons" style={{ fontSize: 18 }}>arrow_back</span>
          Back to Dashboard
        </Link>
      </div>

      <div className="page-header-desktop">
        <div>
          <h1>Registered Campus Users</h1>
          <p>Complete directory of student and faculty accounts ({users.length} registered)</p>
        </div>
      </div>

      <div className="desktop-card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
            <span className="material-icons" style={{ fontSize: 44, animation: 'spin 1.5s linear infinite' }}>sync</span>
            <p style={{ marginTop: 12, fontSize: 14 }}>Loading user records...</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 16, padding: '24px' }}>
            {users.map(u => (
              <div 
                key={u.id} 
                style={{ 
                  background: '#f8fafc', 
                  borderRadius: 16, 
                  padding: '18px 20px', 
                  border: '1px solid var(--border-light)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between' 
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, background: u.role === 'admin' ? '#fef3c7' : '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: u.role === 'admin' ? '#d97706' : '#4f46e5' }}>
                    <span className="material-icons" style={{ fontSize: 22 }}>
                      {u.role === 'admin' ? 'admin_panel_settings' : 'person'}
                    </span>
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 3px 0', fontSize: 16, fontWeight: 800, color: '#0f172a' }}>{u.name}</h4>
                    <div style={{ fontSize: 13, color: '#64748b' }}>{u.email}</div>
                    <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Phone: {u.phone || 'Not listed'}</div>
                  </div>
                </div>

                <span style={{ 
                  padding: '4px 10px', 
                  background: u.role === 'admin' ? '#fef3c7' : '#e2e8f0', 
                  color: u.role === 'admin' ? '#b45309' : '#334155', 
                  borderRadius: 20, 
                  fontSize: 11, 
                  fontWeight: 800, 
                  textTransform: 'uppercase' 
                }}>
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminUsers;
