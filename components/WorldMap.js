// ─────────────────────────────────────────────────────────────────────────────
// IMPORTS
// ─────────────────────────────────────────────────────────────────────────────

// React hooks:
//   useEffect — runs code at a specific moment (e.g. "fetch data when page loads")
//   useState  — stores data that can change and triggers a re-render when it does
//   useRef    — holds a value that persists between renders but does NOT trigger a re-render
import { useEffect, useState, useRef } from 'react';

// react-leaflet components — each one is a building block of the interactive map:
//   MapContainer — the outer wrapper that sets up the map (position, zoom limits, etc.)
//   TileLayer    — the visual background tiles (the dark map imagery from CARTO)
//   GeoJSON      — draws country outlines using geographic shape data
//   Marker       — the pin that drops on the map when a stock is searched
//   Popup        — the info bubble that appears when you click a pin
//   useMap       — a hook that gives direct access to the live map object (used to fly to a location)
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMap } from 'react-leaflet';

// Leaflet's default stylesheet — without this the map controls and tiles won't look right
import 'leaflet/dist/leaflet.css';

// The core Leaflet library — used here to build a custom HTML pin icon (L.divIcon)
import L from 'leaflet';


// ─────────────────────────────────────────────────────────────────────────────
// CONTINENT_MAP — lookup table: country name → continent/group label
// ─────────────────────────────────────────────────────────────────────────────
// This works like a dictionary. When the GeoJSON data says a country is called
// "France", we look it up here and get back "Europe". That result tells the map
// which color to apply and which panel to open when the user clicks.
//
// Many countries have multiple spellings because the GeoJSON dataset and our
// own code might use slightly different names (e.g. "S. Korea" vs "South Korea"),
// so both versions are listed to make sure neither is missed.
//
// The UK entries are a special case — England, Scotland, Wales, and N. Ireland
// are each listed as separate features in the GeoJSON, so we map all of them to
// the same label ('United Kingdom') so clicking any part of the British Isles
// highlights the whole thing as one unit.
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


// ─────────────────────────────────────────────────────────────────────────────
// CONTINENT_COLORS — lookup table: continent/group label → hex color code
// ─────────────────────────────────────────────────────────────────────────────
// These colors are applied to countries when they are hovered or selected.
// Each hex value like '#F97316' is a specific color (F97316 = orange, 3B82F6 = blue, etc.)
const CONTINENT_COLORS = {
  'North America': '#F97316', 'South America': '#22C55E', 'Europe': '#3B82F6',
  'Asia': '#A855F7', 'Africa': '#EAB308', 'Oceania': '#06B6D4',
  'United Kingdom': '#EF4444', // red — treated as its own group separate from Europe
};


// ─────────────────────────────────────────────────────────────────────────────
// FlyToMarker — helper component that animates the map camera to a searched stock
// ─────────────────────────────────────────────────────────────────────────────
// This is a small component with one job: smoothly fly the map to a set of GPS
// coordinates when a search result comes in.
//
// Why is it a separate component instead of just calling map.flyTo() directly?
// Because useMap() — the hook that gives access to the live map object — only
// works *inside* a component that is rendered inside <MapContainer>. So we make
// this tiny component, render it inside the map, and it can use useMap() freely.
//
// It renders nothing visible (return null) — it only performs an action.
function FlyToMarker({ markerData }) {
  // useMap() gives us direct access to the Leaflet map instance
  const map = useMap();

  // useEffect runs whenever markerData changes (e.g. user searched a new stock)
  useEffect(() => {
    if (markerData) {
      // flyTo animates the camera to [latitude, longitude] at zoom level 7
      // duration: 1.8 means the animation takes 1.8 seconds
      map.flyTo([markerData.lat, markerData.lng], 7, { duration: 1.8 });
    }
  }, [markerData, map]);

  return null; // this component does not render any visible HTML
}


// ─────────────────────────────────────────────────────────────────────────────
// createPinIcon — builds a custom styled map pin using raw HTML
// ─────────────────────────────────────────────────────────────────────────────
// Leaflet's default marker is a plain blue teardrop. L.divIcon lets us replace
// that with any HTML/CSS we want. This function builds a three-part pin:
//   1. A dark rounded label showing the stock ticker symbol + city name
//   2. A thin orange vertical line (the "stem")
//   3. A glowing orange dot at the bottom (the "tip" that touches the map)
//
// iconAnchor: [80, 52] tells Leaflet where on the icon the actual point is,
// so the dot aligns exactly with the coordinate on the map.
const createPinIcon = (symbol, city) => {
  // Take only the city name before the first comma (e.g. "New York, NY" → "New York")
  const cityName = city ? city.split(',')[0] : '';

  return L.divIcon({
    // html is a template string (uses backticks) — it lets us embed variables
    // like ${symbol} and ${cityName} directly inside the HTML
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
    className: '',      // removes Leaflet's default white box around the icon
    iconSize: [160, 52],    // total width and height of the icon in pixels
    iconAnchor: [80, 52],   // which pixel on the icon sits exactly on the map coordinate (center-x, bottom-y)
    popupAnchor: [0, -52],  // where the popup appears relative to the icon anchor (above it)
  });
};


// ─────────────────────────────────────────────────────────────────────────────
// WorldMap — the main exported component
// ─────────────────────────────────────────────────────────────────────────────
// 'export default' means this is what other files get when they import this file.
//
// Props (data passed in from the parent page index.js):
//   selectedContinent  — which continent is currently active/selected
//   onContinentSelect  — a function to call when the user clicks a country
//   searchMarker       — data for the pin to drop when a stock is searched
export default function WorldMap({ selectedContinent, onContinentSelect, searchMarker }) {

  // geoData holds the raw geographic shape data (country outlines) fetched from GitHub.
  // It starts as null (nothing loaded yet) and gets filled in once the fetch completes.
  const [geoData, setGeoData] = useState(null);

  // layersRef stores a dictionary that groups Leaflet layer objects by continent.
  // e.g. layersRef.current['Europe'] = [franceLayer, germanyLayer, italyLayer, ...]
  // This is how hovering over one country can highlight all countries in the same group.
  // useRef is used (not useState) because updating it should NOT trigger a re-render.
  const layersRef = useRef({});

  // prevKeyRef tracks which continent was selected last time onEachFeature ran.
  // When selectedContinent changes, we need to clear and rebuild the layersRef groups.
  const prevKeyRef = useRef(null);


  // ── Fetch GeoJSON on mount ──────────────────────────────────────────────────
  // useEffect with an empty [] runs exactly once when the component first loads.
  // It fetches a GeoJSON file — a standard format for geographic shapes — from GitHub.
  // .then(r => r.json()) converts the raw network response into a JavaScript object.
  // .then(setGeoData) saves the result into state, which triggers the map to render.
  useEffect(() => {
    fetch('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson')
      .then((r) => r.json())
      .then(setGeoData);
  }, []);


  // ── getStyle — tells Leaflet how to color each country shape ────────────────
  // Leaflet calls this function for every country when drawing the map.
  // It receives 'feature' (one country's data object) and returns a style object.
  //
  // Logic:
  //   - Look up the country name in CONTINENT_MAP to find its continent/group
  //   - If that group matches the currently selected continent → apply accent color at 15% opacity
  //   - Otherwise → draw in the default dark navy (#1E3A5F) at full opacity
  const getStyle = (feature) => {
    const continent = CONTINENT_MAP[feature.properties.name];
    if (continent === selectedContinent) {
      // Selected continent: semi-transparent accent color so the base map shows through
      return { fillColor: CONTINENT_COLORS[continent], fillOpacity: 0.15, color: '#0D1321', weight: 0.5 };
    }
    // All other countries: solid dark navy
    return { fillColor: '#1E3A5F', fillOpacity: 1, color: '#0D1321', weight: 0.5 };
  };


  // ── onEachFeature — attaches hover and click events to each country ─────────
  // Leaflet also calls this for every country, but instead of returning styles
  // it is used to attach event listeners (what happens on hover, mouseout, click).
  const onEachFeature = (feature, layer) => {
    console.log('Feature name:', feature.properties.name); // TEMPORARY — remove after debugging

    // If the selected continent changed since last render, clear the layer groups
    // so they get rebuilt fresh — otherwise old hover groups would remain stale
    if (prevKeyRef.current !== selectedContinent) {
      prevKeyRef.current = selectedContinent;
      layersRef.current = {};
    }

    // Look up which continent/group this country belongs to
    const continent = CONTINENT_MAP[feature.properties.name];

    // Add this country's layer to its continent's group in layersRef
    // This is what allows hovering France to also highlight Germany, Italy, etc.
    if (continent) {
      if (!layersRef.current[continent]) layersRef.current[continent] = [];
      layersRef.current[continent].push(layer);
    }

    // Attach the three mouse events to this country's layer
    layer.on({
      // mouseover: when cursor enters this country, highlight every country in the same group
      mouseover: () => {
        // Skip if this country has no continent, or if its continent is already selected
        if (!continent || continent === selectedContinent) return;
        layersRef.current[continent]?.forEach((l) =>
          l.setStyle({ fillColor: CONTINENT_COLORS[continent] || '#4FC3F7', fillOpacity: 0.2 })
        );
      },
      // mouseout: when cursor leaves, restore all countries in the group back to navy
      mouseout: () => {
        if (!continent || continent === selectedContinent) return;
        layersRef.current[continent]?.forEach((l) =>
          l.setStyle({ fillColor: '#1E3A5F', fillOpacity: 1 })
        );
      },
      // click: tell the parent page (index.js) which continent was selected
      // onContinentSelect is a function passed in as a prop from index.js
      click: () => { if (continent) onContinentSelect(continent); },
    });
  };


  // ── Loading state ───────────────────────────────────────────────────────────
  // While the GeoJSON is still being fetched, geoData is null.
  // Show a placeholder so the user sees something instead of a blank/broken map.
  if (!geoData) {
    return (
      <div style={{ width: '100%', height: '100%', background: '#070B14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#334155', fontSize: 14 }}>Loading map...</p>
      </div>
    );
  }


  // ── Rendered map ────────────────────────────────────────────────────────────
  return (
    // MapContainer sets up the map with a starting position and zoom limits.
    //   center={[20, 0]}       — starting latitude/longitude (roughly middle of the world)
    //   zoom={3}               — starting zoom level (lower = more zoomed out)
    //   minZoom / maxZoom      — how far the user can zoom in or out
    //   maxBounds              — prevents panning beyond one copy of the world ([lat,lng] corners)
    //   maxBoundsViscosity=1.0 — makes the boundary feel like a hard wall (no elastic bounce)
    //   worldCopyJump={false}  — stops the map jumping to a repeated world copy when panning past the date line
    <MapContainer center={[20, 0]} zoom={3} minZoom={2} maxZoom={12}
      maxBounds={[[-90, -180], [90, 180]]} maxBoundsViscosity={1.0}
      worldCopyJump={false}
      style={{ width: '100%', height: '100%', background: '#070B14' }}>

      {/* TileLayer loads the visual map tiles from CARTO's servers.
          noWrap={true} stops the tile layer repeating horizontally past the world edge.
          subdomains="abcd" spreads tile requests across multiple servers for speed. */}
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        subdomains="abcd" maxZoom={19} noWrap={true}
      />

      {/* GeoJSON draws every country outline using the fetched shape data.
          key={selectedContinent} forces a full re-render when the selection changes,
          which resets all country colors back to their correct state. */}
      <GeoJSON key={selectedContinent} data={geoData} style={getStyle} onEachFeature={onEachFeature} />

      {/* Only render the pin and camera-fly logic if a search result exists.
          The && operator means "if searchMarker is truthy, render what follows". */}
      {searchMarker && (
        <>
          {/* FlyToMarker is rendered inside the map so it can use useMap().
              It has no visible output — it just triggers the fly animation. */}
          <FlyToMarker markerData={searchMarker} />

          {/* Marker drops a pin at the stock's GPS coordinates using our custom icon */}
          <Marker position={[searchMarker.lat, searchMarker.lng]} icon={createPinIcon(searchMarker.symbol, searchMarker.city)}>
            {/* Popup is the info bubble that appears when the user clicks the pin */}
            <Popup>
              <div style={{ fontFamily: 'system-ui', minWidth: 160, padding: '2px 0' }}>
                <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 2 }}>{searchMarker.symbol}</div>
                <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>{searchMarker.name}</div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>
                  ${searchMarker.value}
                  {/* Ternary operator: if up is true show green ▲, otherwise show red ▼ */}
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
