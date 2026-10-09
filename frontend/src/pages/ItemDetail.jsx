import React, { useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ItemLifecycleStepper from '../components/ItemLifecycleStepper';

function ItemDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchItem();
    fetchMatches();
  }, [id]);

  const fetchItem = async () => {
    try {
      const res = await api.get(`/items/${id}`);
      setItem(res.data);
    } catch (err) {
      alert("Failed to load item details");
    } finally {
      setLoading(false);
    }
  };

  const fetchMatches = async () => {
    setLoadingMatches(true);
    try {
      const res = await api.get(`/items/${id}/matches`);
      setMatches(res.data || []);
    } catch (err) {
      console.warn("Matches endpoint error:", err);
    } finally {
      setLoadingMatches(false);
    }
  };

  const getCategoryIcon = (cat) => {
    switch(cat?.toLowerCase()) {
      case 'electronics': return 'devices';
      case 'documents': return 'description';
      case 'accessories': return 'watch';
      case 'bags': return 'backpack';
      case 'valuables': return 'account_balance_wallet';
      default: return 'inventory_2';
    }
  };

  const isMyItem = user && item && (user.id === item.user_id);

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '60vh', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
        <span className="material-icons" style={{ fontSize: 44, animation: 'spin 1.5s linear infinite' }}>sync</span>
      </div>
    );
  }
  
  if (!item) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
        <h2>Item not found</h2>
        <Link to="/feed" className="btn-primary" style={{ marginTop: 16 }}>Back to Directory</Link>
      </div>
    );
  }

  return (
    <div>
      {/* Breadcrumb Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <Link to="/feed" style={{ color: '#94a3b8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, fontSize: 14, fontWeight: 600 }}>
          <span className="material-icons" style={{ fontSize: 18 }}>arrow_back</span>
          Back to Directory
        </Link>
        <span style={{ color: '#94a3b8' }}>/</span>
        <span style={{ color: 'var(--primary)', fontSize: 14, fontWeight: 700 }}>{item.title}</span>
      </div>

      {/* Visual Lifecycle Stepper Component */}
      <ItemLifecycleStepper status={item.status} isOwner={isMyItem} title="Item Recovery Progress" />

      {/* 2-Column Desktop Card */}
      <div className="desktop-card" style={{ display: 'flex', flexWrap: 'wrap', overflow: 'hidden' }}>
        {/* Left Column: Media & Location */}
        <div style={{ flex: '1 1 450px', background: '#f8fafc', borderRight: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column' }}>
          {item.image_url ? (
            <img src={item.image_url} alt={item.title} style={{ width: '100%', height: 380, objectFit: 'cover' }} />
          ) : (
            <div style={{ 
              width: '100%', 
              height: 320, 
              background: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <div style={{ width: 80, height: 80, borderRadius: 24, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-md)' }}>
                <span className="material-icons" style={{ fontSize: 48, color: '#475569' }}>
                  {getCategoryIcon(item.category)}
                </span>
              </div>
              <span style={{ color: '#475569', fontSize: 14, marginTop: 14, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {item.category || 'General Notice'}
              </span>
            </div>
          )}

          <div style={{ padding: '24px', flex: 1 }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Reported Location
            </h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#0f172a', fontWeight: 700, fontSize: 15, marginBottom: 16 }}>
              <span className="material-icons" style={{ color: 'var(--primary)', fontSize: 22 }}>place</span>
              {item.location_name || "Campus location"}
            </div>

            <button 
              onClick={() => window.open(`https://www.google.com/maps?q=${item.latitude || ''},${item.longitude || ''}`, '_blank')}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 14,
                background: '#ffffff',
                border: '1.5px solid #cbd5e1',
                color: '#334155',
                fontSize: 14,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                cursor: 'pointer'
              }}
            >
              <span className="material-icons" style={{ fontSize: 20, color: '#0284c7' }}>map</span>
              Open in Google Maps
            </button>
          </div>
        </div>

        {/* Right Column: Details & Contact & Actions */}
        <div style={{ flex: '1 1 500px', padding: '36px 40px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 14 }}>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
              {item.title}
            </h1>
            <span className={`item-badge-pill ${item.type === 'lost' ? 'item-badge-lost' : 'item-badge-found'}`} style={{ fontSize: 13, padding: '6px 14px' }}>
              {item.type}
            </span>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f1f5f9', padding: '6px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600, color: '#475569' }}>
              <span className="material-icons" style={{ fontSize: 16, color: '#64748b' }}>schedule</span>
              Posted on {new Date(item.created_at).toLocaleDateString()}
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f1f5f9', padding: '6px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600, color: '#475569' }}>
              <span className="material-icons" style={{ fontSize: 16, color: '#64748b' }}>category</span>
              {item.category || 'General'}
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: item.status === 'active' ? '#ecfdf5' : '#fef2f2', padding: '6px 14px', borderRadius: 10, fontSize: 13, fontWeight: 700, color: item.status === 'active' ? '#059669' : '#e11d48' }}>
              <span className="material-icons" style={{ fontSize: 16 }}>
                {item.status === 'active' ? 'check_circle' : 'lock'}
              </span>
              STATUS: {item.status?.toUpperCase()}
            </div>
          </div>

          {/* Description Card */}
          <div style={{ background: '#f8fafc', borderRadius: 18, padding: '20px', border: '1px solid var(--border-light)', marginBottom: 20 }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Item Description
            </h4>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: '#1e293b' }}>
              {item.description || "No specific details provided."}
            </p>
          </div>

          {/* Contact Poster & Call Box */}
          <div style={{ background: 'white', borderRadius: 18, padding: '20px', border: '1.5px solid #e2e8f0', marginBottom: 24, boxShadow: 'var(--shadow-sm)' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Direct Contact & Call Option
            </h4>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
              <div>
                <div style={{ fontWeight: 800, color: '#0f172a', fontSize: 16 }}>
                  Posted by: {item.owner_name || 'Campus Member'}
                </div>
                {item.owner_phone ? (
                  <div style={{ fontSize: 14, color: '#475569', marginTop: 4 }}>
                    Phone: <strong style={{ color: '#0f172a' }}>{item.owner_phone}</strong>
                  </div>
                ) : (
                  <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>
                    Contact available via verification claim
                  </div>
                )}
              </div>

              {item.owner_phone && (
                <a href={`tel:${item.owner_phone}`} style={{ textDecoration: 'none' }}>
                  <button style={{
                    padding: '12px 22px',
                    borderRadius: 14,
                    background: 'var(--found-gradient)',
                    color: 'white',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: 14,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)'
                  }}>
                    <span className="material-icons" style={{ fontSize: 20 }}>call</span>
                    Call Now ({item.owner_phone})
                  </button>
                </a>
              )}
            </div>
          </div>

          <div style={{ flex: 1 }} />

          {/* Claim Action Button */}
          {isMyItem ? (
            <button 
              className="btn-black" 
              onClick={() => navigate(`/item/${item.id}/claims`)}
              style={{ width: '100%', padding: '16px', fontSize: 15 }}
            >
              <span className="material-icons">inventory</span>
              Manage Claims on this Item
            </button>
          ) : item.status === 'active' ? (
            <button 
              className="btn-primary" 
              onClick={() => navigate(`/item/${item.id}/submit-claim`)}
              style={{ width: '100%', padding: '16px', fontSize: 15 }}
            >
              <span className="material-icons">verified</span>
              Submit Ownership Claim
            </button>
          ) : (
            <div style={{ textAlign: 'center', padding: '16px', background: '#f1f5f9', borderRadius: 14, color: '#64748b', fontWeight: 600, fontSize: 14 }}>
              This item is marked as {item.status}.
            </div>
          )}
        </div>
      </div>

      {/* Automated Matchmaker Radar Section */}
      <div style={{ marginTop: 32 }}>
        <div style={{
          background: 'white',
          borderRadius: 24,
          padding: '28px 32px',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="material-icons" style={{ color: '#0284c7', fontSize: 24 }}>radar</span>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
                  Automated Matchmaker Radar
                </h3>
              </div>
              <p style={{ margin: '4px 0 0 32px', fontSize: 13, color: '#64748b' }}>
                Cross-matching active campus reports by category, keywords, and location proximity
              </p>
            </div>

            {matches.length > 0 && (
              <span style={{
                background: '#ecfdf5',
                color: '#059669',
                padding: '6px 14px',
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 800,
                border: '1px solid #a7f3d0',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}>
                <span className="material-icons" style={{ fontSize: 16 }}>auto_awesome</span>
                {matches.length} Potential Counterpart{matches.length > 1 ? 's' : ''} Detected
              </span>
            )}
          </div>

          {loadingMatches ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: '#94a3b8' }}>
              <span className="material-icons" style={{ fontSize: 32, animation: 'spin 1.5s linear infinite' }}>sync</span>
              <p style={{ marginTop: 8, fontSize: 13, fontWeight: 600 }}>Analyzing campus counterpart database...</p>
            </div>
          ) : matches.length === 0 ? (
            <div style={{
              background: '#f8fafc',
              border: '1.5px dashed #cbd5e1',
              borderRadius: 16,
              padding: '24px',
              textAlign: 'center',
              color: '#64748b'
            }}>
              <span className="material-icons" style={{ fontSize: 36, color: '#94a3b8' }}>search</span>
              <h4 style={{ margin: '8px 0 4px', fontSize: 15, fontWeight: 700, color: '#334155' }}>
                No direct counterpart detected yet
              </h4>
              <p style={{ margin: 0, fontSize: 13, color: '#64748b', maxWidth: 500, marginInline: 'auto' }}>
                Our automated algorithm runs continuously. The moment an opposite {item.type === 'lost' ? 'found' : 'lost'} item with matching keywords or location is published, it will be highlighted here immediately.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
              {matches.map(m => (
                <div 
                  key={m.id} 
                  style={{
                    background: '#f8fafc',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: 18,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.2s ease',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <div style={{ padding: '16px 18px 12px 18px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: 'white',
                      fontWeight: 800,
                      fontSize: 11,
                      padding: '3px 10px',
                      borderRadius: 999,
                      letterSpacing: '0.04em',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}>
                      <span className="material-icons" style={{ fontSize: 14 }}>bolt</span>
                      {m.match_percentage}% MATCH
                    </span>

                    <span className={`item-badge-pill ${m.type === 'lost' ? 'item-badge-lost' : 'item-badge-found'}`} style={{ fontSize: 10, padding: '2px 8px' }}>
                      {m.type}
                    </span>
                  </div>

                  <div style={{ padding: '16px 18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h4 style={{ margin: '0 0 6px 0', fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
                      {m.title}
                    </h4>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#64748b', marginBottom: 12 }}>
                      <span className="material-icons" style={{ fontSize: 15, color: '#0284c7' }}>place</span>
                      {m.location_name || 'Campus site'}
                    </div>

                    {/* Match Reasons Badges */}
                    {m.match_reasons && m.match_reasons.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 16 }}>
                        {m.match_reasons.map((reason, idx) => (
                          <span key={idx} style={{
                            fontSize: 11,
                            fontWeight: 700,
                            background: '#e0f2fe',
                            color: '#0369a1',
                            padding: '3px 8px',
                            borderRadius: 6
                          }}>
                            ✓ {reason}
                          </span>
                        ))}
                      </div>
                    )}

                    <div style={{ flex: 1 }} />

                    <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                      <button
                        onClick={() => navigate(`/item/${m.id}`)}
                        className="btn-primary"
                        style={{ flex: 1, padding: '9px 12px', fontSize: 12, justifyContent: 'center' }}
                      >
                        Compare & View
                      </button>

                      {m.owner_phone && (
                        <a href={`tel:${m.owner_phone}`} style={{ textDecoration: 'none' }}>
                          <button
                            style={{
                              padding: '9px 12px',
                              borderRadius: 10,
                              background: '#ffffff',
                              border: '1.5px solid #10b981',
                              color: '#059669',
                              fontSize: 12,
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                              cursor: 'pointer'
                            }}
                          >
                            <span className="material-icons" style={{ fontSize: 15 }}>call</span>
                            Call
                          </button>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ItemDetail;
