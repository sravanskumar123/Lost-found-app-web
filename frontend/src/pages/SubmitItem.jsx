import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';

function SubmitItem() {
  const [formData, setFormData] = useState({
    type: 'lost', 
    title: '', 
    category: '', 
    description: '', 
    location_name: '',
    latitude: '',
    longitude: ''
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [potentialMatches, setPotentialMatches] = useState([]);
  const [checkingMatches, setCheckingMatches] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationNotice, setLocationNotice] = useState(null);
  const navigate = useNavigate();

  // Campus landmark presets
  const campusPresets = [
    { name: "Central Library", lat: "8.548446", lng: "76.938576", icon: "menu_book" },
    { name: "Main Canteen", lat: "8.549100", lng: "76.939200", icon: "restaurant" },
    { name: "CS & Tech Labs", lat: "8.547800", lng: "76.937900", icon: "computer" },
    { name: "Block B Halls", lat: "8.548900", lng: "76.937500", icon: "apartment" },
    { name: "Sports Complex", lat: "8.550200", lng: "76.939800", icon: "fitness_center" },
    { name: "Security Helpdesk", lat: "8.547200", lng: "76.938900", icon: "shield" }
  ];

  // Proactive Match Checking with debounce
  useEffect(() => {
    if (!formData.title || formData.title.trim().length < 3) {
      setPotentialMatches([]);
      return;
    }

    const timer = setTimeout(async () => {
      setCheckingMatches(true);
      try {
        const res = await api.get('/items/potential-matches', {
          params: {
            type: formData.type,
            category: formData.category,
            title: formData.title,
            location_name: formData.location_name
          }
        });
        setPotentialMatches(res.data || []);
      } catch (err) {
        console.warn("Matchmaker check failed:", err);
      } finally {
        setCheckingMatches(false);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [formData.title, formData.category, formData.type, formData.location_name]);

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSelectPreset = (preset) => {
    setFormData(prev => ({
      ...prev,
      location_name: preset.name,
      latitude: preset.lat,
      longitude: preset.lng
    }));
    setLocationNotice({
      type: 'success',
      text: `Selected ${preset.name} (Campus GPS pin attached)`
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.location_name || !formData.category) {
      alert("Please fill all required fields");
      return;
    }
    
    setLoading(true);
    const data = new FormData();
    for (const key in formData) {
      if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
        data.append(key, formData[key]);
      }
    }
    if (image && formData.type === 'lost') {
      data.append('image', image);
    }

    try {
      await api.post('/items', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      alert('Item notice published successfully!');
      navigate('/feed');
    } catch (err) {
      alert('Failed to post item: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const getLocation = () => {
    setDetectingLocation(true);
    setLocationNotice({ type: 'info', text: 'Detecting campus coordinates...' });

    const applyLocation = (lat, lng, label, sourceNotice) => {
      setFormData(prev => ({
        ...prev,
        latitude: lat,
        longitude: lng,
        location_name: prev.location_name && prev.location_name.trim().length > 0 ? prev.location_name : label
      }));
      setLocationNotice({
        type: 'success',
        text: sourceNotice
      });
      setDetectingLocation(false);
    };

    const tryIpFallback = async () => {
      try {
        const res = await fetch('https://ipwho.is/');
        const ipData = await res.json();
        if (ipData && ipData.latitude && ipData.longitude) {
          const lat = parseFloat(ipData.latitude).toFixed(6);
          const lng = parseFloat(ipData.longitude).toFixed(6);
          const label = ipData.city ? `${ipData.city} Campus Area` : `Campus Area (${parseFloat(lat).toFixed(3)}, ${parseFloat(lng).toFixed(3)})`;
          applyLocation(lat, lng, label, `Area detected via network (${ipData.city || 'Campus'} - GPS attached)`);
          return;
        }
      } catch (e1) {
        try {
          const res2 = await fetch('https://freeipapi.com/api/json');
          const data2 = await res2.json();
          if (data2 && data2.latitude && data2.longitude) {
            const lat = parseFloat(data2.latitude).toFixed(6);
            const lng = parseFloat(data2.longitude).toFixed(6);
            const label = data2.cityName ? `${data2.cityName} Campus Area` : `Campus Area`;
            applyLocation(lat, lng, label, `Area detected via network (${data2.cityName || 'Campus'} - GPS attached)`);
            return;
          }
        } catch (e2) {
          // Fall through to campus center preset
        }
      }

      // If both GPS hardware and IP lookup are unavailable/blocked on desktop, attach Central Campus preset
      const defaultCampus = campusPresets[0];
      applyLocation(
        defaultCampus.lat,
        defaultCampus.lng,
        defaultCampus.name,
        `Device GPS access restricted. Attached Central Campus pin (${defaultCampus.name}). Tap any landmark below to adjust.`
      );
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude.toFixed(6);
          const lng = pos.coords.longitude.toFixed(6);
          applyLocation(
            lat,
            lng,
            `Campus Coordinates (${parseFloat(lat).toFixed(4)}, ${parseFloat(lng).toFixed(4)})`,
            `Precise GPS coordinates attached (${parseFloat(lat).toFixed(4)}, ${parseFloat(lng).toFixed(4)})`
          );
        },
        () => {
          // If browser GPS fails or is blocked on desktop, seamlessly fallback
          tryIpFallback();
        },
        { enableHighAccuracy: false, timeout: 3500, maximumAge: 300000 }
      );
    } else {
      tryIpFallback();
    }
  };

  return (
    <div style={{ maxWidth: 840, margin: '0 auto' }}>
      <div className="page-header-desktop">
        <div>
          <h1>Publish Item Notice</h1>
          <p>Report a lost belonging or submit an item found on campus</p>
        </div>
      </div>

      <div className="desktop-card" style={{ padding: '36px 40px' }}>
        {/* Type Toggle */}
        <div style={{ 
          display: 'flex', 
          background: '#f1f5f9', 
          borderRadius: 16, 
          padding: 6, 
          marginBottom: 28,
          gap: 6
        }}>
          <button 
            type="button"
            onClick={() => {
              setFormData({...formData, type: 'lost'});
            }}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: 12,
              border: 'none',
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: 14,
              background: formData.type === 'lost' ? 'var(--lost-gradient)' : 'transparent',
              color: formData.type === 'lost' ? 'white' : '#64748b',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8
            }}
          >
            <span className="material-icons" style={{ fontSize: 18 }}>search</span>
            I LOST AN ITEM (REPORT LOSS)
          </button>

          <button 
            type="button"
            onClick={() => {
              setFormData({...formData, type: 'found'});
              setImage(null);
            }}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: 12,
              border: 'none',
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: 14,
              background: formData.type === 'found' ? 'var(--found-gradient)' : 'transparent',
              color: formData.type === 'found' ? 'white' : '#64748b',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8
            }}
          >
            <span className="material-icons" style={{ fontSize: 18 }}>inventory_2</span>
            I FOUND AN ITEM (REPORT FIND)
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 8, textTransform: 'uppercase' }}>
                Item Title / Name *
              </label>
              <input 
                className="input-field" 
                name="title" 
                placeholder="e.g. Blue Dell Laptop Charger" 
                value={formData.title} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 8, textTransform: 'uppercase' }}>
                Category *
              </label>
              <select 
                className="input-field" 
                name="category" 
                value={formData.category} 
                onChange={handleChange} 
                required
              >
                <option value="" disabled>Choose Category</option>
                <option value="electronics">Electronics (Phones, Laptops, Earbuds, Chargers)</option>
                <option value="documents">Documents (IDs, Passports, Notes, Cards)</option>
                <option value="accessories">Accessories (Watches, Glasses, Keys, Wallets)</option>
                <option value="bags">Bags (Backpacks, Totes, Pouches)</option>
                <option value="valuables">Valuables (Cash, Jewelry)</option>
                <option value="others">Others (Bottles, Umbrellas, Jackets)</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 8, textTransform: 'uppercase' }}>
              Detailed Description *
            </label>
            <textarea 
              className="input-field" 
              name="description" 
              placeholder="Provide color, brand, stickers, unique scratches, distinguishing features or details..." 
              rows="4" 
              value={formData.description} 
              onChange={handleChange} 
              required 
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                Campus Location *
              </label>
              <button 
                type="button" 
                onClick={getLocation} 
                disabled={detectingLocation}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: 'var(--primary)', 
                  fontSize: 13, 
                  fontWeight: 700, 
                  cursor: detectingLocation ? 'default' : 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 4,
                  opacity: detectingLocation ? 0.7 : 1
                }}
              >
                <span className="material-icons" style={{ fontSize: 16, animation: detectingLocation ? 'spin 1.5s linear infinite' : 'none' }}>
                  {detectingLocation ? 'sync' : 'my_location'}
                </span>
                {detectingLocation ? 'Detecting Area...' : 'Auto Detect Location'}
              </button>
            </div>

            <input 
              className="input-field" 
              name="location_name" 
              placeholder="e.g., Central Library Floor 2, Main Canteen, Block B Room 301" 
              value={formData.location_name} 
              onChange={handleChange} 
              required 
              style={{ marginBottom: 8 }}
            />

            {/* Location Feedback Notification */}
            {locationNotice && (
              <div style={{
                background: locationNotice.type === 'success' ? '#edf9f4' : '#fffbeb',
                border: `1px solid ${locationNotice.type === 'success' ? '#b2e3d3' : '#fde68a'}`,
                borderRadius: 10,
                padding: '8px 12px',
                fontSize: 12,
                fontWeight: 600,
                color: locationNotice.type === 'success' ? '#107e5b' : '#b47836',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                marginBottom: 10
              }}>
                <span className="material-icons" style={{ fontSize: 16 }}>
                  {locationNotice.type === 'success' ? 'check_circle' : 'info'}
                </span>
                {locationNotice.text}
              </div>
            )}

            {/* Attached GPS Coordinates Tag */}
            {formData.latitude && formData.longitude && (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: '#edf9f4',
                color: '#107e5b',
                border: '1px solid #b2e3d3',
                padding: '4px 10px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 700,
                marginBottom: 10
              }}>
                <span className="material-icons" style={{ fontSize: 14 }}>place</span>
                Map Pin Attached ({parseFloat(formData.latitude).toFixed(4)}, {parseFloat(formData.longitude).toFixed(4)})
                <span 
                  className="material-icons" 
                  style={{ fontSize: 14, cursor: 'pointer', marginLeft: 4 }}
                  onClick={() => setFormData(prev => ({ ...prev, latitude: '', longitude: '' }))}
                  title="Clear Coordinates"
                >
                  close
                </span>
              </div>
            )}

            {/* 1-Click Campus Landmark Presets */}
            <div style={{ marginTop: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                Quick Campus Landmarks (1-click pin):
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {campusPresets.map(preset => {
                  const isSelected = formData.location_name === preset.name;
                  return (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 8,
                        border: isSelected ? '1.5px solid var(--primary)' : '1px solid var(--border-light)',
                        background: isSelected ? '#eaf0ec' : '#ffffff',
                        color: isSelected ? 'var(--primary)' : '#475569',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span className="material-icons" style={{ fontSize: 14, color: isSelected ? 'var(--primary)' : '#64748b' }}>
                        {preset.icon}
                      </span>
                      {preset.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Photo upload: Only applicable for Lost items */}
          {formData.type === 'lost' && (
            <div style={{ marginBottom: 28 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 8, textTransform: 'uppercase' }}>
                Reference Photo (Optional)
              </label>
              <div 
                className="image-picker-box" 
                style={{ height: 200 }}
                onClick={() => document.getElementById('file-input').click()}
              >
                <input 
                  id="file-input" 
                  type="file" 
                  accept="image/*" 
                  style={{ display: 'none' }} 
                  onChange={handleImageChange} 
                />
                {image ? (
                  <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                    <img src={URL.createObjectURL(image)} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    <button 
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setImage(null); }}
                      style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.65)', color: 'white', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    >
                      <span className="material-icons" style={{ fontSize: 18 }}>close</span>
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="material-icons" style={{ fontSize: 44, color: '#94a3b8' }}>add_photo_alternate</span>
                    <span style={{ marginTop: 8, fontSize: 14, fontWeight: 700, color: '#475569' }}>Click to select reference photo</span>
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>PNG, JPG or WEBP up to 5MB</span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Proactive Live Matchmaker Radar Banner */}
          {potentialMatches.length > 0 && (
            <div style={{
              background: '#f0fdf4',
              border: '1.5px solid #86efac',
              borderRadius: 18,
              padding: '20px 24px',
              marginBottom: 28,
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="material-icons" style={{ color: '#16a34a', fontSize: 24 }}>auto_awesome</span>
                  <strong style={{ color: '#14532d', fontSize: 15 }}>
                    Instant Match Alert: {potentialMatches.length} Similar Item{potentialMatches.length > 1 ? 's' : ''} Already Reported!
                  </strong>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#15803d', background: '#dcfce7', padding: '3px 10px', borderRadius: 999 }}>
                  Cross-Match Detected
                </span>
              </div>

              <p style={{ margin: '0 0 14px 0', fontSize: 13, color: '#166534', lineHeight: 1.45 }}>
                Before submitting a duplicate report, check these existing campus reports. One of them might already be what you're looking for!
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
                {potentialMatches.slice(0, 3).map(match => (
                  <div key={match.id} style={{
                    background: 'white',
                    borderRadius: 14,
                    padding: '12px 14px',
                    border: '1px solid #bbf7d0',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <span className={`item-badge-pill ${match.type === 'lost' ? 'item-badge-lost' : 'item-badge-found'}`} style={{ fontSize: 9, padding: '2px 6px' }}>
                          {match.type}
                        </span>
                        <span style={{ fontSize: 11, fontWeight: 800, color: '#059669' }}>
                          {match.match_percentage}% MATCH
                        </span>
                      </div>
                      <div style={{ fontWeight: 800, fontSize: 14, color: '#0f172a', marginBottom: 2 }}>
                        {match.title}
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>
                        📍 {match.location_name || 'Campus site'}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate(`/item/${match.id}`)}
                      style={{
                        marginTop: 10,
                        padding: '6px 10px',
                        background: '#0f172a',
                        color: 'white',
                        border: 'none',
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 4
                      }}
                    >
                      Inspect This Item
                      <span className="material-icons" style={{ fontSize: 14 }}>arrow_forward</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 14 }}>
            <Link to="/feed" className="btn-black" style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1' }}>
              Cancel
            </Link>
            <button 
              className="btn-primary" 
              type="submit" 
              disabled={loading}
              style={{ 
                background: formData.type === 'lost' ? 'var(--lost-gradient)' : 'var(--found-gradient)',
                padding: '14px 32px',
                fontSize: 15
              }}
            >
              {loading ? 'Publishing...' : (formData.type === 'lost' ? 'Publish Lost Item Notice' : 'Publish Found Item Notice')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SubmitItem;
