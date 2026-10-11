import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';

function AdminClaims() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClaims();
  }, []);

  const loadClaims = async () => {
    try {
      const res = await api.get('/admin/claims');
      setClaims(res.data);
    } catch (err) {
      alert("Failed to load claims");
    } finally {
      setLoading(false);
    }
  };

  const approveClaim = async (id) => {
    if (!window.confirm("Approve this claim as admin?")) return;
    try {
      await api.put(`/claims/${id}/approve`);
      loadClaims();
    } catch (err) {
      alert("Failed to approve");
    }
  };

  const rejectClaim = async (id) => {
    if (!window.confirm("Decline this claim?")) return;
    try {
      await api.put(`/claims/${id}/reject`);
      loadClaims();
    } catch (err) {
      alert("Failed to reject");
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
          <h1>Audit Campus Claims</h1>
          <p>Review ownership disputes and resolutions ({claims.length} claims submitted)</p>
        </div>
      </div>

      <div className="desktop-card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
            <span className="material-icons" style={{ fontSize: 44, animation: 'spin 1.5s linear infinite' }}>sync</span>
            <p style={{ marginTop: 12, fontSize: 14 }}>Loading claims...</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 16, padding: '24px' }}>
            {claims.map(claim => (
              <div 
                key={claim.id} 
                style={{ 
                  background: '#f8fafc', 
                  borderRadius: 16, 
                  padding: '20px', 
                  border: '1px solid var(--border-light)', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-between' 
                }}
              >
                <div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: 17, fontWeight: 800, color: '#0f172a' }}>{claim.item_title}</h4>
                  <div style={{ fontSize: 13, color: '#64748b', marginBottom: 2 }}>Claimant: <strong>{claim.claimant_name}</strong></div>
                  <div style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>Email: {claim.claimant_email}</div>
                  <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 14, color: claim.status === 'approved' ? '#059669' : (claim.status === 'rejected' ? '#e11d48' : '#d97706') }}>
                    ● STATUS: {claim.status.toUpperCase()}
                  </div>
                </div>

                <div style={{ paddingTop: 12, borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
                  {claim.status === 'pending' ? (
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button 
                        onClick={() => approveClaim(claim.id)} 
                        className="btn-primary"
                        style={{ background: 'var(--found-gradient)', padding: '8px 16px', fontSize: 12 }}
                      >
                        <span className="material-icons" style={{ fontSize: 16 }}>check</span>
                        Approve
                      </button>
                      <button 
                        onClick={() => rejectClaim(claim.id)} 
                        style={{ background: '#fef2f2', border: '1px solid #fecdd3', color: '#e11d48', borderRadius: 10, padding: '8px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700, fontSize: 12 }}
                      >
                        <span className="material-icons" style={{ fontSize: 16 }}>close</span>
                        Decline
                      </button>
                    </div>
                  ) : (
                    <span style={{ 
                      padding: '4px 12px', 
                      background: claim.status === 'approved' ? '#ecfdf5' : '#fef2f2', 
                      color: claim.status === 'approved' ? '#059669' : '#e11d48', 
                      borderRadius: 14, 
                      fontSize: 12, 
                      fontWeight: 800, 
                      textTransform: 'uppercase' 
                    }}>
                      {claim.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminClaims;
