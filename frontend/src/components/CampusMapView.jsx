import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function CampusMapView({ items = [], userLocation = null }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const navigate = useNavigate();

  // Filter items with valid coordinates
  const geoItems = items.filter(
    (item) => item.latitude && item.longitude && 
    !isNaN(parseFloat(item.latitude)) && !isNaN(parseFloat(item.longitude)) &&
    (parseFloat(item.latitude) !== 0 || parseFloat(item.longitude) !== 0)
  );

  const nonGeoItems = items.filter(item => !geoItems.includes(item));

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (typeof window.L === 'undefined') {
      console.warn("Leaflet not loaded yet");
      return;
    }

    // Default campus coordinates (e.g. 8.5484, 76.9385 if available, else first item or user location)
    let initialCenter = [8.5484467, 76.9385767];
    if (userLocation && userLocation.lat && userLocation.lng) {
      initialCenter = [userLocation.lat, userLocation.lng];
    } else if (geoItems.length > 0) {
      initialCenter = [parseFloat(geoItems[0].latitude), parseFloat(geoItems[0].longitude)];
    }

    // Initialize map if not already created
    if (!mapInstanceRef.current) {
      const map = window.L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: 15,
        zoomControl: true
      });

      // CartoDB Positron / OSM tiles for a clean, modern aesthetic
      window.L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear old markers
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];

    // Add markers for geo items
    const bounds = [];

    geoItems.forEach((item) => {
      const lat = parseFloat(item.latitude);
      const lng = parseFloat(item.longitude);
      bounds.push([lat, lng]);

      const isFound = item.type?.toLowerCase() === 'found';
      const color = isFound ? '#107e5b' : '#c2410c';
      const badge = isFound ? 'FOUND' : 'LOST';

      // Custom HTML Marker Pin
      const customIcon = window.L.divIcon({
        className: 'campus-map-pin',
        html: `
          <div style="
            background: ${color};
            width: 36px;
            height: 36px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 3px 8px rgba(30,41,59,0.2);
            border: 2px solid white;
            cursor: pointer;
          ">
            <span style="
              transform: rotate(45deg);
              font-family: 'Material Icons';
              color: white;
              font-size: 18px;
            ">${isFound ? 'inventory_2' : 'search'}</span>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36]
      });

      const marker = window.L.marker([lat, lng], { icon: customIcon }).addTo(map);

      // Popup Content
      const popupHtml = `
        <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 4px; min-width: 200px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="
              background: ${isFound ? '#edf9f4' : '#fdf4f3'};
              color: ${color};
              border: 1px solid ${isFound ? '#b2e3d3' : '#f5cfcc'};
              font-weight: 800;
              font-size: 10px;
              padding: 2px 8px;
              border-radius: 4px;
              letter-spacing: 0.05em;
            ">${badge}</span>
            <span style="font-size: 11px; color: #64748b; font-weight: 600;">${item.category || 'General'}</span>
          </div>
          <h4 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 800; color: #1e293b;">${item.title}</h4>
          <p style="margin: 0 0 10px 0; font-size: 12px; color: #64748b; display: flex; align-items: center; gap: 4px;">
            <span style="font-family: 'Material Icons'; font-size: 14px; color: #107e5b;">place</span>
            ${item.location_name || 'Campus site'}
          </p>
          <button id="view-pin-${item.id}" style="
            width: 100%;
            background: #1b382f;
            color: white;
            border: none;
            padding: 8px 10px;
            border-radius: 8px;
            font-size: 12px;
            font-weight: 700;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
          ">
            View Details & Claim ➔
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.on('click', () => {
        setSelectedItem(item);
      });

      // Handle popup open to bind button click
      marker.on('popupopen', () => {
        const btn = document.getElementById(`view-pin-${item.id}`);
        if (btn) {
          btn.onclick = () => navigate(`/item/${item.id}`);
        }
      });

      markersRef.current.push(marker);
    });

    // Fit bounds if markers exist
    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
    }
  }, [items, userLocation]);

  const flyToItem = (item) => {
    if (!mapInstanceRef.current || !item.latitude || !item.longitude) return;
    setSelectedItem(item);
    const lat = parseFloat(item.latitude);
    const lng = parseFloat(item.longitude);
    mapInstanceRef.current.flyTo([lat, lng], 17, { duration: 1.2 });
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: 24,
      overflow: 'hidden',
      border: '1px solid var(--border-light)',
      boxShadow: 'var(--shadow-md)',
      marginBottom: 32
    }}>
      {/* Map Header Toolbar */}
      <div style={{
        padding: '18px 24px',
        borderBottom: '1px solid var(--border-light)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        background: '#f8fafc'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="material-icons" style={{ color: '#0284c7', fontSize: 22 }}>map</span>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
              Interactive Campus Lost & Found Radar
            </h3>
          </div>
          <p style={{ margin: '2px 0 0 30px', fontSize: 12, color: '#64748b' }}>
            Showing {geoItems.length} geo-pinned items across university grounds
          </p>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: '#059669' }}>
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--found-gradient)', display: 'inline-block' }}></span>
            Found Item Pins ({geoItems.filter(i => i.type === 'found').length})
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: '#e11d48' }}>
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--lost-gradient)', display: 'inline-block' }}></span>
            Lost Item Pins ({geoItems.filter(i => i.type === 'lost').length})
          </div>
        </div>
      </div>

      {/* Main Map + Sidebar Split View */}
      <div style={{ display: 'flex', flexWrap: 'wrap', minHeight: 520 }}>
        {/* Leaflet Map Canvas */}
        <div 
          ref={mapContainerRef} 
          style={{ flex: '1 1 540px', height: 520, background: '#e2e8f0', position: 'relative' }} 
        />

        {/* Sidebar Pin Directory */}
        <div style={{
          width: 340,
          maxHeight: 520,
          overflowY: 'auto',
          borderLeft: '1px solid var(--border-light)',
          background: '#ffffff',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc', fontWeight: 800, fontSize: 12, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em' }}>
            Pin Quick Navigator ({geoItems.length})
          </div>

          <div style={{ flex: 1, padding: '12px' }}>
            {geoItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 10px', color: '#94a3b8' }}>
                <span className="material-icons" style={{ fontSize: 32 }}>location_off</span>
                <p style={{ marginTop: 8, fontSize: 13, fontWeight: 600 }}>No geo-tagged pins match your current search.</p>
              </div>
            ) : (
              geoItems.map((item) => {
                const isSelected = selectedItem?.id === item.id;
                const isFound = item.type === 'found';

                return (
                  <div
                    key={item.id}
                    onClick={() => flyToItem(item)}
                    style={{
                      padding: '12px',
                      borderRadius: 14,
                      border: isSelected ? '2px solid #0284c7' : '1px solid #e2e8f0',
                      background: isSelected ? '#f0f9ff' : '#ffffff',
                      marginBottom: 8,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? '0 4px 12px rgba(2, 132, 199, 0.15)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span className={`item-badge-pill ${isFound ? 'item-badge-found' : 'item-badge-lost'}`} style={{ fontSize: 10, padding: '2px 8px' }}>
                        {item.type}
                      </span>
                      <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>
                        {item.category || 'General'}
                      </span>
                    </div>

                    <div style={{ fontWeight: 800, fontSize: 14, color: '#0f172a', marginBottom: 4 }}>
                      {item.title}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#64748b', marginBottom: 8 }}>
                      <span className="material-icons" style={{ fontSize: 15, color: '#0284c7' }}>place</span>
                      {item.location_name || 'Campus Grounds'}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/item/${item.id}`);
                      }}
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        borderRadius: 8,
                        background: '#0f172a',
                        color: 'white',
                        border: 'none',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6
                      }}
                    >
                      View Details & Claim
                      <span className="material-icons" style={{ fontSize: 14 }}>arrow_forward</span>
                    </button>
                  </div>
                );
              })
            )}

            {nonGeoItems.length > 0 && (
              <div style={{ marginTop: 12, padding: '12px', borderRadius: 12, background: '#f8fafc', border: '1px dashed #cbd5e1' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span className="material-icons" style={{ fontSize: 16, color: '#f59e0b' }}>info</span>
                  {nonGeoItems.length} Items without GPS pins
                </div>
                <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.3 }}>
                  Switch to Grid View to explore items described with landmark descriptions only.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CampusMapView;
