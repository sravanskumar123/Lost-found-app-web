import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';
import ItemLifecycleStepper from '../components/ItemLifecycleStepper';

function MyClaims() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadClaims();
  }, []);

  const loadClaims = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/claims/my');
      setClaims(res.data || []);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        setError("Your session has expired. Please log in again to view your claims.");
      } else {
        setError("Failed to load your verification claims. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch ((status || "").toLowerCase()) {
      case 'approved': 
        return { bg: '#ecfdf5', text: '#059669', icon: 'check_circle', label: 'Approved' };
      case 'rejected': 
        return { bg: '#fef2f2', text: '#e11d48', icon: 'cancel', label: 'Rejected' };
      default: 
        return { bg: '#fffbeb', text: '#d97706', icon: 'pending', label: 'Under Review' };
    }
  };

  return (
    <div>
      <div className="page-header-desktop">
        <div>
          <h1>My Verification Claims</h1>
          <p>Track your ownership claims, contact numbers of finders, and item pickup arrangements</p>
        </div>

        <Link to="/feed" className="btn-primary">
          <span className="material-icons">search</span>
          Browse Feed
        </Link>
      </div>

      <div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
            <span className="material-icons" style={{ fontSize: 44, animation: 'spin 1.5s linear infinite' }}>sync</span>
            <p style={{ marginTop: 12, fontSize: 14 }}>Loading your claims...</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: 24, border: '1px solid #fecaca' }}>
            <span className="material-icons" style={{ fontSize: 44, color: '#ef4444', marginBottom: 12 }}>error_outline</span>
            <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 8px 0', color: '#991b1b' }}>{error}</h3>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 18 }}>
              {error.includes("expired") ? (
                <Link to="/login" className="btn-primary" style={{ padding: '10px 24px' }}>
                  Log In Again
                </Link>
              ) : (
                <button onClick={loadClaims} className="btn-primary" style={{ padding: '10px 24px' }}>
                  Retry
                </button>
              )}
            </div>
          </div>
        ) : claims.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: 'white', borderRadius: 24, border: '1px solid var(--border-light)' }}>
            <div style={{ width: 72, height: 72, borderRadius: 24, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
              <span className="material-icons" style={{ fontSize: 36, color: '#94a3b8' }}>verified</span>
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 8px 0', color: '#0f172a' }}>No claim requests submitted</h3>
            <p style={{ fontSize: 14, margin: '0 0 24px 0', color: '#64748b' }}>When you submit ownership proof for an item in the directory, you can track it here.</p>
            <Link to="/feed" className="btn-primary" style={{ padding: '12px 28px' }}>
              Search Lost Items
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 22 }}>
            {claims.map(claim => {
              const badge = getStatusBadge(claim.status);
              return (
                <div key={claim.id} className="item-card" style={{ padding: '22px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
                      {claim.title || "Found Notice"}
                    </h3>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', background: badge.bg, color: badge.text, borderRadius: 20, fontSize: 12, fontWeight: 800 }}>
                      <span className="material-icons" style={{ fontSize: 15 }}>{badge.icon}</span>
                      {badge.label}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', fontSize: 14, marginBottom: 12 }}>
                    <span className="material-icons" style={{ fontSize: 18 }}>place</span>
                    <span>{claim.location_name || "Campus Location"}</span>
                  </div>

                  {/* Lifecycle Tracker */}
                  <ItemLifecycleStepper 
                    status={claim.item_status || (claim.status?.toLowerCase() === 'approved' ? 'claimed' : 'active')} 
                    claimStatus={claim.status?.toLowerCase()} 
                    title="Your Claim Status & Progress"
                  />

                  {claim.message && (
                    <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: 14, fontSize: 13, color: '#334155', border: '1px solid #e2e8f0', marginBottom: 14 }}>
                      <strong style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase', display: 'block', marginBottom: 3 }}>Submitted Proof:</strong>
                      {claim.message}
                    </div>
                  )}

                  {claim.status?.toLowerCase() === 'approved' && (
                    <div style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', border: '1px solid #a7f3d0', padding: 16, borderRadius: 16, marginTop: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#065f46', fontWeight: 800, fontSize: 14, marginBottom: 10 }}>
                        <span className="material-icons" style={{ fontSize: 20 }}>verified</span>
                        Claim Approved! Contact Poster
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                        <div>
                          <span style={{ fontSize: 14, color: '#047857', fontWeight: 700, display: 'block' }}>
                            Phone: <strong>{claim.owner_phone || "Not listed"}</strong>
                          </span>
                          {claim.owner_email && (
                            <span style={{ fontSize: 12, color: '#065f46', opacity: 0.85 }}>
                              Email: {claim.owner_email}
                            </span>
                          )}
                        </div>
                        {claim.owner_phone ? (
                          <a href={`tel:${claim.owner_phone}`} style={{ textDecoration: 'none' }}>
                            <button style={{ background: '#059669', color: 'white', border: 'none', padding: '10px 18px', borderRadius: 12, display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontWeight: 800, fontSize: 13, boxShadow: '0 4px 10px rgba(5, 150, 105, 0.25)' }}>
                              <span className="material-icons" style={{ fontSize: 18 }}>call</span>
                              Call Now
                            </button>
                          </a>
                        ) : claim.owner_email ? (
                          <a href={`mailto:${claim.owner_email}`} style={{ textDecoration: 'none' }}>
                            <button style={{ background: '#059669', color: 'white', border: 'none', padding: '10px 18px', borderRadius: 12, display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontWeight: 800, fontSize: 13 }}>
                              <span className="material-icons" style={{ fontSize: 18 }}>mail</span>
                              Email
                            </button>
                          </a>
                        ) : null}
                      </div>
                    </div>
                  )}

                  {claim.status?.toLowerCase() === 'pending' && (
                    <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', padding: '12px 14px', borderRadius: 12, marginTop: 8, fontSize: 13, color: '#92400e', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="material-icons" style={{ fontSize: 18, color: '#d97706' }}>info</span>
                      Under review by poster. Contact phone will be revealed once approved.
                    </div>
                  )}

                  {claim.status?.toLowerCase() === 'rejected' && (
                    <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', padding: '14px 16px', borderRadius: 12, marginTop: 8, fontSize: 13, color: '#9a3412', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <span className="material-icons" style={{ fontSize: 20, color: '#c2410c', marginTop: 1 }}>cancel</span>
                      <div>
                        <strong style={{ color: '#9a3412', display: 'block', marginBottom: 2 }}>Claim Declined by Poster</strong>
                        The submitted ownership proof did not match the poster's records. If this was your item, please check other listings or submit an official report to Campus Security.
                      </div>
                    </div>
                  )}

                  {claim.item_status === 'returned' && (
                    <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '12px 14px', borderRadius: 12, marginTop: 8, fontSize: 13, color: '#065f46', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="material-icons" style={{ fontSize: 18, color: '#059669' }}>celebration</span>
                      <strong>Item Successfully Recovered & Returned!</strong>
                    </div>
                  )}

                  <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>Item Listing #{claim.item_id}</span>
                    <Link 
                      to={`/item/${claim.item_id}`}
                      style={{
                        textDecoration: 'none',
                        color: 'var(--primary)',
                        fontWeight: 700,
                        fontSize: 12,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      <span className="material-icons" style={{ fontSize: 15 }}>visibility</span>
                      View Original Notice
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyClaims;
