import React, { useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { Link, useNavigate } from 'react-router-dom';
import CampusMapView from '../components/CampusMapView';
import { AuthContext } from '../context/AuthContext';

function ItemsFeed() {
  const { user } = useContext(AuthContext);
  const [allItems, setAllItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all"); // 'all', 'found', 'lost'
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'map'
  const [userLocation, setUserLocation] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchItems();
    getUserLocation();
  }, [user?.id]);

  useEffect(() => {
    applyFilter();
  }, [search, selectedCategory, selectedType, allItems, user?.id]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = { status: 'active' };
      if (user?.id) {
        params.exclude_user_id = user.id;
      }
      const res = await api.get('/items', { params });
      const items = Array.isArray(res.data) ? res.data : [];
      setAllItems(items);
      setFilteredItems(items);
    } catch (err) {
      console.error("Failed to load items:", err);
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
        },
        () => {}
      );
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c;
    if (d < 1) {
      return `${Math.round(d * 1000)} m away`;
    }
    return `${d.toFixed(1)} km away`;
  };

  const timeAgo = (dateString) => {
    if (!dateString) return "";
    const diff = Date.now() - new Date(dateString).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins} min ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hr ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateString).toLocaleDateString();
  };

  const applyFilter = () => {
    const query = search.trim().toLowerCase();
    const results = allItems.filter(item => {
      // Exclude items personally reported by the logged-in user
      if (user?.id && item.user_id === user.id) {
        return false;
      }

      const title = (item.title || "").toLowerCase();
      const location = (item.location_name || "").toLowerCase();
      const category = (item.category || "").toLowerCase();
      const description = (item.description || "").toLowerCase();

      const matchesSearch = !query || 
        title.includes(query) || 
        location.includes(query) || 
        category.includes(query) ||
        description.includes(query);

      const matchesCategory = selectedCategory === "all" || 
        category === selectedCategory.toLowerCase();

      const itemType = (item.type || "").toLowerCase();
      const matchesType = selectedType === "all" || 
        itemType === selectedType.toLowerCase();

      return matchesSearch && matchesCategory && matchesType;
    });
    setFilteredItems(results);
  };

  const categories = ["all", "electronics", "documents", "accessories", "bags", "valuables", "others"];

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

  return (
    <div>
      {/* Desktop Page Title & Controls */}
      <div className="page-header-desktop">
        <div>
          <h1>Campus Directory</h1>
          <p>Search, filter, and recover lost belongings across university grounds</p>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button 
            onClick={fetchItems} 
            className="btn-black"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'white' }}
          >
            <span className="material-icons">refresh</span>
            Refresh
          </button>
          <Link to="/submit" className="btn-primary">
            <span className="material-icons">add_circle</span>
            Post Item
          </Link>
        </div>
      </div>

      {/* Notice Banner when logged in */}
      {user && (
        <div style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #e8f5e9 100%)',
          border: '1px solid #bbf7d0',
          borderRadius: 14,
          padding: '12px 18px',
          marginBottom: 20,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 10,
          fontSize: 13,
          color: '#166534'
        }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 500 }}>
            <span className="material-icons" style={{ fontSize: 18, color: '#15803d' }}>visibility</span>
            Showing items found and reported by others across campus. Your own reported items are stored separately.
          </span>
          <Link 
            to="/my-items" 
            style={{ 
              color: '#15803d', 
              fontWeight: 800, 
              textDecoration: 'none', 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: 4,
              background: 'white',
              padding: '5px 12px',
              borderRadius: 8,
              border: '1px solid #bbf7d0',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
          >
            Manage My Items <span className="material-icons" style={{ fontSize: 16 }}>arrow_forward</span>
          </Link>
        </div>
      )}

      {/* Desktop Search & Filter Card */}
      <div style={{
        background: 'white',
        borderRadius: 20,
        padding: '24px',
        border: '1px solid var(--border-light)',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: 28
      }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', marginBottom: 18 }}>
          {/* Search Input */}
          <div style={{ flex: 2, minWidth: 260, position: 'relative' }}>
            <span className="material-icons" style={{ position: 'absolute', top: 12, left: 14, color: '#94a3b8', fontSize: 20 }}>search</span>
            <input 
              type="text" 
              placeholder="Search by title, location, category..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field"
              style={{ paddingLeft: 42, paddingRight: 36, margin: 0 }}
            />
            {search && (
              <span 
                className="material-icons" 
                style={{ position: 'absolute', right: 12, top: 12, color: '#94a3b8', fontSize: 18, cursor: 'pointer' }}
                onClick={() => setSearch('')}
              >
                close
              </span>
            )}
          </div>

          {/* Type Selector (ALL, FOUND, LOST) */}
          <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 14, padding: 4, gap: 4 }}>
            {['all', 'found', 'lost'].map(t => {
              const isSelected = selectedType === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSelectedType(t)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: 10,
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: 13,
                    background: isSelected 
                      ? (t === 'found' ? 'var(--found-gradient)' : (t === 'lost' ? 'var(--lost-gradient)' : '#0f172a')) 
                      : 'transparent',
                    color: isSelected ? 'white' : '#64748b',
                    transition: 'all 0.2s ease',
                    textTransform: 'uppercase'
                  }}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        {/* Categories Bar & View Mode Switcher */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: 16 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginRight: 4 }}>
              Category:
            </span>
            {categories.map(cat => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`category-pill ${isSelected ? 'active' : 'inactive'}`}
                >
                  {cat !== 'all' && (
                    <span className="material-icons" style={{ fontSize: 13, marginRight: 4, verticalAlign: 'middle' }}>
                      {getCategoryIcon(cat)}
                    </span>
                  )}
                  {cat.toUpperCase()}
                </button>
              );
            })}
          </div>

          {/* View Mode Toggle: Grid vs Map */}
          <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 12, padding: 3, gap: 4 }}>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              style={{
                padding: '7px 16px',
                borderRadius: 9,
                border: 'none',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: 13,
                background: viewMode === 'grid' ? '#0f172a' : 'transparent',
                color: viewMode === 'grid' ? 'white' : '#64748b',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.15s ease'
              }}
            >
              <span className="material-icons" style={{ fontSize: 16 }}>grid_view</span>
              Grid View
            </button>
            <button
              type="button"
              onClick={() => setViewMode('map')}
              style={{
                padding: '7px 16px',
                borderRadius: 9,
                border: 'none',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: 13,
                background: viewMode === 'map' ? '#0284c7' : 'transparent',
                color: viewMode === 'map' ? 'white' : '#64748b',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.15s ease'
              }}
            >
              <span className="material-icons" style={{ fontSize: 16 }}>map</span>
              Campus Map
            </button>
          </div>
        </div>
      </div>

      {/* Results View: Map or Grid */}
      {viewMode === 'map' ? (
        <CampusMapView items={filteredItems} userLocation={userLocation} />
      ) : loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8' }}>
          <span className="material-icons" style={{ fontSize: 44, animation: 'spin 1.5s linear infinite' }}>sync</span>
          <p style={{ marginTop: 12, fontSize: 15, fontWeight: 600 }}>Loading campus items...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: 24, border: '1px solid var(--border-light)' }}>
          <span className="material-icons" style={{ fontSize: 56, color: '#cbd5e1' }}>search_off</span>
          <h3 style={{ margin: '14px 0 6px', color: '#0f172a', fontSize: 18, fontWeight: 800 }}>No items match your query</h3>
          <p style={{ fontSize: 14, margin: '0 0 20px', color: '#64748b' }}>
            Try clearing filters or changing the category/type.
          </p>
          <button 
            onClick={() => { setSearch(''); setSelectedCategory('all'); setSelectedType('all'); }}
            className="btn-primary"
            style={{ padding: '10px 20px' }}
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="feed-desktop-grid">
          {filteredItems.map(item => {
            const distance = userLocation ? calculateDistance(userLocation.lat, userLocation.lng, item.latitude, item.longitude) : null;
            const isFound = (item.type || '').toLowerCase() === 'found';

            return (
              <div 
                key={item.id} 
                className="item-card" 
                onClick={() => navigate(`/item/${item.id}`)}
              >
                {item.image_url ? (
                  <img src={item.image_url} alt={item.title} style={{ width: '100%', height: 200, objectFit: 'cover' }} />
                ) : (
                  <div style={{ 
                    width: '100%', 
                    height: 140, 
                    background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    borderBottom: '1px solid #e2e8f0'
                  }}>
                    <div style={{ width: 48, height: 48, borderRadius: 16, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}>
                      <span className="material-icons" style={{ fontSize: 26, color: '#475569' }}>
                        {getCategoryIcon(item.category)}
                      </span>
                    </div>
                    <span style={{ color: '#64748b', fontSize: 11, marginTop: 8, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                      {item.category || 'General Item'}
                    </span>
                  </div>
                )}

                <div style={{ padding: '18px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                    <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#0f172a' }}>
                      {item.title}
                    </h3>
                    <span className={`item-badge-pill ${isFound ? 'item-badge-found' : 'item-badge-lost'}`}>
                      {item.type}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#475569', fontSize: 13, marginBottom: 8 }}>
                    <span className="material-icons" style={{ fontSize: 16, color: '#64748b' }}>place</span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.location_name || "Campus premises"}
                    </span>
                    {distance && (
                      <span style={{ color: '#059669', fontWeight: 700, fontSize: 11, background: '#ecfdf5', padding: '2px 6px', borderRadius: 6, marginLeft: 4 }}>
                        {distance}
                      </span>
                    )}
                  </div>

                  <div style={{ flex: 1 }} />

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, paddingTop: 12, borderTop: '1px solid #f1f5f9', fontSize: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#94a3b8' }}>
                      <span className="material-icons" style={{ fontSize: 14 }}>schedule</span>
                      {timeAgo(item.created_at)}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {item.owner_phone && (
                        <a 
                          href={`tel:${item.owner_phone}`} 
                          onClick={(e) => e.stopPropagation()} 
                          style={{ textDecoration: 'none' }}
                        >
                          <button style={{
                            padding: '6px 12px',
                            background: '#ecfdf5',
                            border: '1px solid #a7f3d0',
                            color: '#059669',
                            borderRadius: 8,
                            fontWeight: 700,
                            fontSize: 12,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3,
                            cursor: 'pointer'
                          }}>
                            <span className="material-icons" style={{ fontSize: 14 }}>call</span>
                            Call
                          </button>
                        </a>
                      )}

                      <span style={{ color: 'var(--primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 2 }}>
                        Details <span className="material-icons" style={{ fontSize: 14 }}>arrow_forward</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ItemsFeed;
