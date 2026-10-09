import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Link, useNavigate } from 'react-router-dom';

function MyItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/items/my');
      setItems(res.data || []);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        setError("Your session has expired. Please log in again to view your listings.");
      } else {
        setError("Failed to load listings. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMarkReturned = async (itemId, e) => {
    e.stopPropagation();
    if (!window.confirm("Confirm that this item has been safely returned to its verified owner?")) return;
    setActionLoading(itemId);
    try {
      await api.put(`/items/${itemId}/mark-returned`);
      alert("Item status updated to Returned!");
      loadItems();
    } catch (err) {
      alert("Failed to mark as returned: " + (err.response?.data?.detail || err.message));
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'claimed': 
        return { bg: '#fef3c7', text: '#d97706', label: 'Claimed (Pending Return)' };
      case 'returned': 
        return { bg: '#ecfdf5', text: '#059669', label: 'Returned & Resolved' };
      default: 
        return { bg: '#e0e7ff', text: '#4338ca', label: 'Active' };
    }
  };

  return (
    <div>
      <div className="page-header-desktop">
        <div>
          <h1>My Published Listings</h1>
          <p>Track your posted lost and found notices, review incoming claims, and resolve returned items</p>
        </div>

        <Link to="/submit" className="btn-primary">
          <span className="material-icons">add_circle</span>
          Post New Notice
        </Link>
      </div>

      <div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
            <span className="material-icons" style={{ fontSize: 44, animation: 'spin 1.5s linear infinite' }}>sync</span>
            <p style={{ marginTop: 12, fontSize: 14 }}>Loading your listings...</p>
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
                <button onClick={loadItems} className="btn-primary" style={{ padding: '10px 24px' }}>
                  Retry
                </button>
              )}
            </div>
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: 'white', borderRadius: 24, border: '1px solid var(--border-light)' }}>
            <div style={{ width: 72, height: 72, borderRadius: 24, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
              <span className="material-icons" style={{ fontSize: 36, color: '#94a3b8' }}>inventory_2</span>
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 8px 0', color: '#0f172a' }}>No listings published yet</h3>
            <p style={{ fontSize: 14, margin: '0 0 24px 0', color: '#64748b' }}>When you report lost or found items, they appear here.</p>
            <Link to="/submit" className="btn-primary" style={{ padding: '12px 28px' }}>
              Post Your First Item
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 22 }}>
            {items.map(item => {
              const badge = getStatusBadge(item.status);
              return (
                <div 
                  key={item.id} 
                  className="item-card" 
                  style={{ padding: '22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0f172a' }}>{item.title}</h3>
                      <span className={`item-badge-pill ${item.type === 'lost' ? 'item-badge-lost' : 'item-badge-found'}`}>
                        {item.type}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#475569', fontSize: 14, marginBottom: 8 }}>
                      <span className="material-icons" style={{ fontSize: 18, color: '#64748b' }}>place</span>
                      <span>{item.location_name || "Campus location"}</span>
                    </div>

                    {item.description && (
                      <p style={{ margin: '0 0 16px 0', fontSize: 13, color: '#64748b', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {item.description}
                      </p>
                    )}
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14, borderTop: '1px solid #f1f5f9', marginBottom: 14 }}>
                      <span style={{ padding: '4px 12px', background: badge.bg, color: badge.text, borderRadius: 20, fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>
                        {badge.label}
                      </span>

                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 5,
                        padding: '4px 12px', 
                        background: item.claim_count > 0 ? '#fef3c7' : '#f1f5f9', 
                        color: item.claim_count > 0 ? '#b45309' : '#64748b', 
                        borderRadius: 20, 
                        fontWeight: 800, 
                        fontSize: 12 
                      }}>
                        <span className="material-icons" style={{ fontSize: 15 }}>assignment</span>
                        {item.claim_count || 0} Claim Request{(item.claim_count !== 1) ? 's' : ''}
                      </div>
                    </div>

                    {/* Dedicated Action Buttons */}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => navigate(`/item/${item.id}/claims`)}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          background: item.claim_count > 0 ? 'var(--primary)' : '#f1f5f9',
                          color: item.claim_count > 0 ? 'white' : '#334155',
                          border: 'none',
                          borderRadius: 10,
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 5
                        }}
                      >
                        <span className="material-icons" style={{ fontSize: 16 }}>verified</span>
                        Review Claims ({item.claim_count || 0})
                      </button>

                      <button
                        type="button"
                        onClick={() => navigate(`/item/${item.id}`)}
                        style={{
                          padding: '8px 12px',
                          background: 'white',
                          color: '#475569',
                          border: '1px solid #cbd5e1',
                          borderRadius: 10,
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                        title="View Notice & Radar"
                      >
                        <span className="material-icons" style={{ fontSize: 16 }}>visibility</span>
                        View
                      </button>

                      {item.status === 'claimed' && (
                        <button
                          type="button"
                          onClick={(e) => handleMarkReturned(item.id, e)}
                          disabled={actionLoading === item.id}
                          style={{
                            width: '100%',
                            marginTop: 6,
                            padding: '9px 12px',
                            background: '#059669',
                            color: 'white',
                            border: 'none',
                            borderRadius: 10,
                            fontSize: 12,
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 5,
                            boxShadow: '0 2px 6px rgba(5, 150, 105, 0.25)'
                          }}
                        >
                          <span className="material-icons" style={{ fontSize: 16 }}>task_alt</span>
                          {actionLoading === item.id ? 'Updating...' : 'Mark as Returned & Handed Over'}
                        </button>
                      )}
                    </div>
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

export default MyItems;
