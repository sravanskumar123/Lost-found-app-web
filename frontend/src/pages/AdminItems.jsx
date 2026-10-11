import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Link, useNavigate } from 'react-router-dom';

function AdminItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const res = await api.get('/admin/items');
      setItems(res.data);
    } catch (err) {
      alert("Failed to load items");
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id) => {
    if (!window.confirm("Soft delete this item notice?")) return;
    try {
      await api.delete(`/admin/items/${id}`);
      setItems(items.map(i => i.id === id ? { ...i, is_deleted: 1 } : i));
    } catch (err) {
      alert("Delete failed");
    }
  };

  const restoreItem = async (id) => {
    try {
      await api.put(`/admin/items/${id}/restore`);
      setItems(items.map(i => i.id === id ? { ...i, is_deleted: 0 } : i));
    } catch (err) {
      alert("Restore failed");
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
          <h1>Moderate Item Listings</h1>
          <p>Review, audit, or remove published notices across campus ({items.length} items)</p>
        </div>
      </div>

      <div className="desktop-card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
            <span className="material-icons" style={{ fontSize: 44, animation: 'spin 1.5s linear infinite' }}>sync</span>
            <p style={{ marginTop: 12, fontSize: 14 }}>Loading listings...</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 16, padding: '24px' }}>
            {items.map(item => {
              const isDeleted = item.is_deleted === 1;
              return (
                <div 
                  key={item.id} 
                  style={{ 
                    background: '#f8fafc', 
                    borderRadius: 16, 
                    padding: '20px', 
                    border: '1px solid var(--border-light)', 
                    display: 'flex', 
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    opacity: isDeleted ? 0.6 : 1,
                    cursor: 'pointer'
                  }}
                  onClick={() => navigate(`/item/${item.id}/claims`)}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                      <h4 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0f172a' }}>{item.title}</h4>
                      <span className={`item-badge-pill ${item.type === 'lost' ? 'item-badge-lost' : 'item-badge-found'}`}>
                        {item.type}
                      </span>
                    </div>

                    <div style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>
                      Posted by: <strong>{item.owner_name || "Unknown"}</strong>
                    </div>
                    <div style={{ fontSize: 13, color: '#64748b', marginBottom: 10 }}>
                      Location: {item.location_name || "Campus location"}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: isDeleted ? '#e11d48' : '#059669' }}>
                      {isDeleted ? "● DELETED" : `● ${(item.status || "ACTIVE").toUpperCase()}`}
                    </span>

                    {isDeleted ? (
                      <button 
                        onClick={(e) => { e.stopPropagation(); restoreItem(item.id); }}
                        style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#059669', borderRadius: 8, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}
                      >
                        <span className="material-icons" style={{ fontSize: 16 }}>restore</span>
                        Restore
                      </button>
                    ) : (
                      <button 
                        onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }}
                        style={{ background: '#fef2f2', border: '1px solid #fecdd3', color: '#e11d48', borderRadius: 8, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}
                      >
                        <span className="material-icons" style={{ fontSize: 16 }}>delete</span>
                        Remove
                      </button>
                    )}
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

export default AdminItems;
