import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const CONTINENT_MAP = {
  'United States of America': 'North America', 'USA': 'North America',
  'Canada': 'North America', 'Mexico': 'North America', 'Cuba': 'North America',
  'Guatemala': 'North America', 'Honduras': 'North America', 'El Salvador': 'North America',
  'Nicaragua': 'North America', 'Costa Rica': 'North America', 'Panama': 'North America',
  'Haiti': 'North America', 'Dominican Rep.': 'North America', 'Dominican Republic': 'North America',
  'Brazil': 'South America', 'Argentina': 'South America', 'Chile': 'South America',
  'Colombia': 'South America', 'Peru': 'South America', 'Venezuela': 'South America',
  'Ecuador': 'South America', 'Bolivia': 'South America', 'Paraguay': 'South America',
  'Uruguay': 'South America', 'Guyana': 'South America', 'Suriname': 'South America',
  'France': 'Europe', 'Germany': 'Europe', 'United Kingdom': 'United Kingdom', 'UK': 'United Kingdom',
  'England': 'United Kingdom', 'Scotland': 'United Kingdom', 'Wales': 'United Kingdom', 'N. Ireland': 'United Kingdom',
  'Italy': 'Europe', 'Spain': 'Europe', 'Portugal': 'Europe', 'Netherlands': 'Europe',
  'Belgium': 'Europe', 'Sweden': 'Europe', 'Norway': 'Europe', 'Denmark': 'Europe',
  'Finland': 'Europe', 'Poland': 'Europe', 'Ukraine': 'Europe', 'Russia': 'Europe',
  'Switzerland': 'Europe', 'Austria': 'Europe', 'Greece': 'Europe',
  'Czech Rep.': 'Europe', 'Czech Republic': 'Europe', 'Romania': 'Europe',
  'Serbia': 'Europe', 'Croatia': 'Europe', 'Bosnia and Herz.': 'Europe',
  'China': 'Asia', 'Japan': 'Asia', 'India': 'Asia', 'South Korea': 'Asia',
  'S. Korea': 'Asia', 'Indonesia': 'Asia', 'Thailand': 'Asia', 'Vietnam': 'Asia',
  'Malaysia': 'Asia', 'Philippines': 'Asia', 'Pakistan': 'Asia', 'Bangladesh': 'Asia',
  'Saudi Arabia': 'Asia', 'United Arab Emirates': 'Asia', 'UAE': 'Asia',
  'Iran': 'Asia', 'Iraq': 'Asia', 'Turkey': 'Asia', 'Israel': 'Asia',
  'Kazakhstan': 'Asia', 'Uzbekistan': 'Asia', 'Myanmar': 'Asia',
  'Nigeria': 'Africa', 'South Africa': 'Africa', 'Egypt': 'Africa', 'Kenya': 'Africa',
  'Ethiopia': 'Africa', 'Ghana': 'Africa', 'Tanzania': 'Africa', 'Morocco': 'Africa',
  'Algeria': 'Africa', 'Angola': 'Africa', 'Dem. Rep. Congo': 'Africa', 'Congo': 'Africa',
  'Mozambique': 'Africa', 'Zimbabwe': 'Africa', 'Uganda': 'Africa', 'Sudan': 'Africa',
  'S. Sudan': 'Africa', 'Cameroon': 'Africa', 'Mali': 'Africa', 'Senegal': 'Africa',
  'Tunisia': 'Africa', 'Libya': 'Africa',
  'Australia': 'Oceania', 'New Zealand': 'Oceania',
};

const CONTINENT_COLORS = {
  'North America': '#F97316', 'South America': '#22C55E', 'Europe': '#3B82F6',
  'Asia': '#A855F7', 'Africa': '#EAB308', 'Oceania': '#06B6D4',
  'United Kingdom': '#EF4444',
};

// Auto-fly to marker when search result comes in
function FlyToMarker({ markerData }) {
  const map = useMap();
  useEffect(() => {
    if (markerData) {
      map.flyTo([markerData.lat, markerData.lng], 7, { duration: 1.8 });
    }
  }, [markerData, map]);
  return null;
}

const createPinIcon = (symbol, city) => {
  const cityName = city ? city.split(',')[0] : '';
  return L.divIcon({
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;">
        <div style="
          background:rgba(13,19,33,0.95);
          border:1.5px solid #F97316;
          border-radius:8px;
          padding:5px 12px;
          display:flex;
          align-items:center;
          gap:7px;
          box-shadow:0 4px 20px rgba(249,115,22,0.35);
          white-space:nowrap;
        ">
          <div style="width:8px;height:8px;background:#F97316;border-radius:50%;box-shadow:0 0 6px #F97316;flex-shrink:0;"></div>
          <span style="color:white;font-size:12px;font-weight:800;font-family:system-ui,sans-serif;letter-spacing:0.3px;">${symbol}</span>
          <span style="color:#94A3B8;font-size:10px;font-family:system-ui,sans-serif;">${cityName}</span>
        </div>
        <div style="width:2px;height:10px;background:linear-gradient(to bottom,#F97316,transparent);"></div>
        <div style="width:9px;height:9px;background:#F97316;border-radius:50%;box-shadow:0 0 10px #F97316,0 0 20px rgba(249,115,22,0.5);margin-top:-1px;"></div>
      </div>
    `,
    className: '',
    iconSize: [160, 52],
    iconAnchor: [80, 52],
    popupAnchor: [0, -52],
  });
};

export default function WorldMap({ selectedContinent, onContinentSelect, searchMarker }) {
  const [geoData, setGeoData] = useState(null);
  const layersRef = useRef({});
  const prevKeyRef = useRef(null);

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson')
      .then((r) => r.json())
      .then(setGeoData);
  }, []);

  const getStyle = (feature) => {
    const continent = CONTINENT_MAP[feature.properties.name];
    if (continent === selectedContinent) {
      return { fillColor: CONTINENT_COLORS[continent], fillOpacity: 0.15, color: '#0D1321', weight: 0.5 };
    }
    return { fillColor: '#1E3A5F', fillOpacity: 1, color: '#0D1321', weight: 0.5 };
  };

  const onEachFeature = (feature, layer) => {
    console.log('Feature name:', feature.properties.name); // TEMPORARY — remove after debugging
    if (prevKeyRef.current !== selectedContinent) {
      prevKeyRef.current = selectedContinent;
      layersRef.current = {};
    }
    const continent = CONTINENT_MAP[feature.properties.name];
    if (continent) {
      if (!layersRef.current[continent]) layersRef.current[continent] = [];
      layersRef.current[continent].push(layer);
    }
    layer.on({
      mouseover: () => {
        if (!continent || continent === selectedContinent) return;
        layersRef.current[continent]?.forEach((l) =>
          l.setStyle({ fillColor: CONTINENT_COLORS[continent] || '#4FC3F7', fillOpacity: 0.2 })
        );
      },
      mouseout: () => {
        if (!continent || continent === selectedContinent) return;
        layersRef.current[continent]?.forEach((l) =>
          l.setStyle({ fillColor: '#1E3A5F', fillOpacity: 1 })
        );
      },
      click: () => { if (continent) onContinentSelect(continent); },
    });
  };

  if (!geoData) {
    return (
      <div style={{ width: '100%', height: '100%', background: '#070B14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#334155', fontSize: 14 }}>Loading map...</p>
      </div>
    );
  }

  return (
    <MapContainer center={[20, 0]} zoom={3} minZoom={2} maxZoom={12}
      maxBounds={[[-90, -180], [90, 180]]} maxBoundsViscosity={1.0}
      worldCopyJump={false}
      style={{ width: '100%', height: '100%', background: '#070B14' }}>
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        subdomains="abcd" maxZoom={19} noWrap={true}
      />
      <GeoJSON key={selectedContinent} data={geoData} style={getStyle} onEachFeature={onEachFeature} />

      {searchMarker && (
        <>
          <FlyToMarker markerData={searchMarker} />
          <Marker position={[searchMarker.lat, searchMarker.lng]} icon={createPinIcon(searchMarker.symbol, searchMarker.city)}>
            <Popup>
              <div style={{ fontFamily: 'system-ui', minWidth: 160, padding: '2px 0' }}>
                <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 2 }}>{searchMarker.symbol}</div>
                <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>{searchMarker.name}</div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>
                  ${searchMarker.value}
                  <span style={{ color: searchMarker.up ? '#16a34a' : '#dc2626', marginLeft: 8, fontSize: 13 }}>
                    {searchMarker.up ? '▲' : '▼'} {searchMarker.change}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: '#888', marginTop: 6 }}>📍 {searchMarker.city}</div>
                <div style={{ fontSize: 10, color: '#aaa' }}>{searchMarker.exchange}</div>
              </div>
            </Popup>
          </Marker>
        </>
      )}
    </MapContainer>
  );
}