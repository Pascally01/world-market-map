import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

const WorldMap = dynamic(() => import('../components/WorldMap'), { ssr: false });

const COMPANY_LOCATIONS = {
  // New York, NY
  'JPM':   { lat: 40.7580, lng: -73.9855, city: 'New York, NY' },
  'GS':    { lat: 40.7614, lng: -74.0010, city: 'New York, NY' },
  'C':     { lat: 40.7549, lng: -73.9840, city: 'New York, NY' },
  'MS':    { lat: 40.7580, lng: -73.9855, city: 'New York, NY' },
  'PFE':   { lat: 40.7579, lng: -73.9855, city: 'New York, NY' },
  'VZ':    { lat: 40.7282, lng: -74.0059, city: 'New York, NY' },
  'IBM':   { lat: 41.1190, lng: -73.9763, city: 'Armonk, NY' },
  'MET':   { lat: 40.7614, lng: -73.9776, city: 'New York, NY' },
  'AXP':   { lat: 40.7127, lng: -74.0059, city: 'New York, NY' },
  'BRK-B': { lat: 41.2565, lng: -95.9345, city: 'Omaha, NE' },
  'T':     { lat: 32.7767, lng: -96.7970, city: 'Dallas, TX' },
  // Bay Area, CA
  'AAPL':  { lat: 37.3349, lng: -122.0090, city: 'Cupertino, CA' },
  'GOOGL': { lat: 37.4220, lng: -122.0841, city: 'Mountain View, CA' },
  'GOOG':  { lat: 37.4220, lng: -122.0841, city: 'Mountain View, CA' },
  'META':  { lat: 37.4847, lng: -122.1477, city: 'Menlo Park, CA' },
  'NVDA':  { lat: 37.3710, lng: -121.9637, city: 'Santa Clara, CA' },
  'INTC':  { lat: 37.3875, lng: -121.9636, city: 'Santa Clara, CA' },
  'ADBE':  { lat: 37.3340, lng: -121.8946, city: 'San Jose, CA' },
  'CRM':   { lat: 37.7947, lng: -122.3995, city: 'San Francisco, CA' },
  'PYPL':  { lat: 37.3769, lng: -121.9784, city: 'San Jose, CA' },
  'V':     { lat: 37.4285, lng: -121.9074, city: 'Foster City, CA' },
  'ORCL':  { lat: 37.5295, lng: -122.2621, city: 'Austin, TX' },
  // Seattle, WA
  'AMZN':  { lat: 47.6205, lng: -122.3493, city: 'Seattle, WA' },
  'MSFT':  { lat: 47.6423, lng: -122.1391, city: 'Redmond, WA' },
  'SBUX':  { lat: 47.5809, lng: -122.3352, city: 'Seattle, WA' },
  'COST':  { lat: 47.6018, lng: -122.1631, city: 'Issaquah, WA' },
  'TMUS':  { lat: 47.6150, lng: -122.1956, city: 'Bellevue, WA' },
  'EXPD':  { lat: 47.6205, lng: -122.3493, city: 'Seattle, WA' },
  // Los Angeles, CA
  'DIS':   { lat: 34.0537, lng: -118.2427, city: 'Burbank, CA' },
  'NFLX':  { lat: 37.2502, lng: -121.9602, city: 'Los Gatos, CA' },
  'SNAP':  { lat: 34.0195, lng: -118.4912, city: 'Santa Monica, CA' },
  'LYFT':  { lat: 37.7749, lng: -122.4194, city: 'San Francisco, CA' },
  'LULU':  { lat: 49.2827, lng: -123.1207, city: 'Vancouver, Canada' },
  // Houston, TX
  'XOM':   { lat: 32.8998, lng: -97.0403, city: 'Spring, TX' },
  'CVX':   { lat: 37.8271, lng: -122.2913, city: 'San Ramon, CA' },
  'OXY':   { lat: 29.7604, lng: -95.3698, city: 'Houston, TX' },
  'HAL':   { lat: 29.7604, lng: -95.3698, city: 'Houston, TX' },
  'SLB':   { lat: 29.7604, lng: -95.3698, city: 'Houston, TX' },
  'PSX':   { lat: 29.7604, lng: -95.3698, city: 'Houston, TX' },
  'VLO':   { lat: 29.4241, lng: -98.4936, city: 'San Antonio, TX' },
  'COP':   { lat: 29.7604, lng: -95.3698, city: 'Houston, TX' },
  'MRO':   { lat: 29.7604, lng: -95.3698, city: 'Houston, TX' },
  'BKR':   { lat: 29.7604, lng: -95.3698, city: 'Houston, TX' },
  // Chicago, IL
  'CME':   { lat: 41.8781, lng: -87.6298, city: 'Chicago, IL' },
  'ABBV':  { lat: 42.1300, lng: -87.8690, city: 'North Chicago, IL' },
  'MCD':   { lat: 41.7905, lng: -88.0117, city: 'Chicago, IL' },
  'CBOE':  { lat: 41.8781, lng: -87.6298, city: 'Chicago, IL' },
  'MDLZ':  { lat: 40.7580, lng: -73.9855, city: 'Chicago, IL' },
  // Dallas, TX
  'AAL':   { lat: 32.8998, lng: -97.0403, city: 'Fort Worth, TX' },
  'LUV':   { lat: 32.7767, lng: -96.7970, city: 'Dallas, TX' },
  'HLT':   { lat: 38.9072, lng: -77.0369, city: 'McLean, VA' },
  'CBRE':  { lat: 34.0522, lng: -118.2437, city: 'Dallas, TX' },
  // Atlanta, GA
  'HD':    { lat: 33.7490, lng: -84.3880, city: 'Atlanta, GA' },
  'KO':    { lat: 33.7490, lng: -84.3880, city: 'Atlanta, GA' },
  'UPS':   { lat: 33.8400, lng: -84.2200, city: 'Sandy Springs, GA' },
  'FIS':   { lat: 30.3322, lng: -81.6557, city: 'Jacksonville, FL' },
  // Boston, MA
  'BIIB':  { lat: 42.3601, lng: -71.0589, city: 'Cambridge, MA' },
  'VRTX':  { lat: 42.3601, lng: -71.0589, city: 'Boston, MA' },
  'ALGN':  { lat: 37.3861, lng: -122.0839, city: 'Tempe, AZ' },
  'IDXX':  { lat: 43.6591, lng: -70.2568, city: 'Westbrook, ME' },
  // Minneapolis, MN
  'UNH':   { lat: 44.8547, lng: -93.4708, city: 'Minnetonka, MN' },
  'TGT':   { lat: 44.9778, lng: -93.2650, city: 'Minneapolis, MN' },
  'MMM':   { lat: 44.9537, lng: -92.9442, city: 'Maplewood, MN' },
  'TSN':   { lat: 36.1627, lng: -94.1282, city: 'Springdale, AR' },
  'USB':   { lat: 44.9778, lng: -93.2650, city: 'Minneapolis, MN' },
  // Charlotte, NC
  'BAC':   { lat: 35.2271, lng: -80.8431, city: 'Charlotte, NC' },
  'LNC':   { lat: 40.7580, lng: -73.9855, city: 'Radnor, PA' },
  'DUK':   { lat: 35.2271, lng: -80.8431, city: 'Charlotte, NC' },
  // Detroit, MI
  'F':     { lat: 42.3314, lng: -83.0458, city: 'Dearborn, MI' },
  'GM':    { lat: 42.3314, lng: -83.0458, city: 'Detroit, MI' },
  'APTV':  { lat: 48.7758, lng: 9.1829,   city: 'Dublin, Ireland' },
  'STLA':  { lat: 42.3314, lng: -83.0458, city: 'Auburn Hills, MI' },
  // Philadelphia, PA
  'CVS':   { lat: 41.8240, lng: -71.4128, city: 'Woonsocket, RI' },
  'JNJ':   { lat: 40.5795, lng: -74.5154, city: 'New Brunswick, NJ' },
  'MRK':   { lat: 40.6976, lng: -74.0431, city: 'Rahway, NJ' },
  'ABT':   { lat: 42.1300, lng: -87.8690, city: 'Abbott Park, IL' },
  'MDT':   { lat: 44.9778, lng: -93.2650, city: 'Dublin, Ireland' },
  // Miami, FL
  'RCL':   { lat: 25.7617, lng: -80.1918, city: 'Miami, FL' },
  'CCL':   { lat: 25.7617, lng: -80.1918, city: 'Miami, FL' },
  'NCLH':  { lat: 25.7617, lng: -80.1918, city: 'Miami, FL' },
  // Denver, CO
  'DISH':  { lat: 39.7392, lng: -104.9903, city: 'Englewood, CO' },
  // Phoenix, AZ
  'FSLR':  { lat: 33.4484, lng: -112.0740, city: 'Tempe, AZ' },
  // Toronto
  'RY':    { lat: 43.6532, lng: -79.3832, city: 'Toronto, Canada' },
  'TD':    { lat: 43.6532, lng: -79.3832, city: 'Toronto, Canada' },
  'BNS':   { lat: 43.6532, lng: -79.3832, city: 'Toronto, Canada' },
  'BMO':   { lat: 43.6532, lng: -79.3832, city: 'Toronto, Canada' },
  'CP':    { lat: 51.0447, lng: -114.0719, city: 'Calgary, Canada' },
  'CNQ':   { lat: 51.0447, lng: -114.0719, city: 'Calgary, Canada' },
  // Vancouver
  'TECK':  { lat: 49.2827, lng: -123.1207, city: 'Vancouver, Canada' },
  'WPM':   { lat: 49.2827, lng: -123.1207, city: 'Vancouver, Canada' },
  'GOLD':  { lat: 49.2827, lng: -123.1207, city: 'Vancouver, Canada' },
  'AEM':   { lat: 43.6532, lng: -79.3832, city: 'Toronto, Canada' },
  // Mexico City
  'AMX':   { lat: 19.4326, lng: -99.1332, city: 'Mexico City, Mexico' },
  'FMX':   { lat: 25.6866, lng: -100.3161, city: 'Monterrey, Mexico' },
  'KOF':   { lat: 19.4326, lng: -99.1332, city: 'Mexico City, Mexico' },
  'CX':    { lat: 25.6866, lng: -100.3161, city: 'Monterrey, Mexico' },
  // Extra well-known stocks
  'TSLA':  { lat: 30.2240, lng: -97.6343, city: 'Austin, TX' },
  'SQ':    { lat: 37.7749, lng: -122.4194, city: 'San Francisco, CA' },
  'UBER':  { lat: 37.7749, lng: -122.4194, city: 'San Francisco, CA' },
  'AIRBNB':{ lat: 37.7749, lng: -122.4194, city: 'San Francisco, CA' },
  'ABNB':  { lat: 37.7749, lng: -122.4194, city: 'San Francisco, CA' },
  'COIN':  { lat: 37.7749, lng: -122.4194, city: 'San Francisco, CA' },
  'HOOD':  { lat: 37.7749, lng: -122.4194, city: 'Menlo Park, CA' },
  'PLTR':  { lat: 39.7392, lng: -104.9903, city: 'Denver, CO' },
  'RBLX':  { lat: 37.7749, lng: -122.4194, city: 'San Mateo, CA' },
  'SPOT':  { lat: 40.7580, lng: -73.9855, city: 'New York, NY' },
  'EA':    { lat: 37.5477, lng: -122.0547, city: 'Redwood City, CA' },
  'WMT':   { lat: 36.3729, lng: -94.2088, city: 'Bentonville, AR' },
  'AMGN':  { lat: 34.2805, lng: -118.7741, city: 'Thousand Oaks, CA' },
  'QCOM':  { lat: 32.8998, lng: -117.1825, city: 'San Diego, CA' },
  'AMD':   { lat: 37.3861, lng: -121.9822, city: 'Santa Clara, CA' },
  'AVGO':  { lat: 37.3861, lng: -121.9822, city: 'San Jose, CA' },
  'NOW':   { lat: 37.3861, lng: -121.9822, city: 'Santa Clara, CA' },
  'INTU':  { lat: 37.3861, lng: -122.0341, city: 'Mountain View, CA' },
  'MA':    { lat: 40.7580, lng: -73.9855, city: 'Purchase, NY' },
  'WFC':   { lat: 37.7749, lng: -122.4194, city: 'San Francisco, CA' },
  'PG':    { lat: 39.1031, lng: -84.5120, city: 'Cincinnati, OH' },
  'XEL':   { lat: 44.9778, lng: -93.2650, city: 'Minneapolis, MN' },
  'SPG':   { lat: 39.7684, lng: -86.1581, city: 'Indianapolis, IN' },
  'GE':    { lat: 42.3601, lng: -71.0589, city: 'Boston, MA' },
  'RTX':   { lat: 41.7640, lng: -72.6851, city: 'Farmington, CT' },
  'BA':    { lat: 38.9072, lng: -77.0369, city: 'Arlington, VA' },
  'LMT':   { lat: 38.9072, lng: -77.0369, city: 'Bethesda, MD' },
  'NOC':   { lat: 38.9072, lng: -77.0369, city: 'Falls Church, VA' },
  // Austin, TX
'DELL':  { lat: 30.5083, lng: -97.6789, city: 'Round Rock, TX' },
'SCHW':  { lat: 32.9618, lng: -97.1081, city: 'Westlake, TX' },
'BMBL':  { lat: 30.2672, lng: -97.7431, city: 'Austin, TX' },
'CRUS':  { lat: 30.2672, lng: -97.7431, city: 'Austin, TX' },
'SWI':   { lat: 30.2672, lng: -97.7431, city: 'Austin, TX' },
'QTWO':  { lat: 30.2672, lng: -97.7431, city: 'Austin, TX' },
// Washington, DC / N. Virginia
'FNMA':  { lat: 38.9072, lng: -77.0369, city: 'Washington, DC' },
'FMCC':  { lat: 38.9339, lng: -77.1773, city: 'McLean, VA' },
'DHR':   { lat: 38.9072, lng: -77.0369, city: 'Washington, DC' },
'COF':   { lat: 38.9339, lng: -77.1773, city: 'McLean, VA' },
'MAR':   { lat: 38.9847, lng: -77.0947, city: 'Bethesda, MD' },
'GD':    { lat: 38.9586, lng: -77.3570, city: 'Reston, VA' },
'BAH':   { lat: 38.9339, lng: -77.1773, city: 'McLean, VA' },
'LDOS':  { lat: 38.9586, lng: -77.3570, city: 'Reston, VA' },
// San Diego, CA
'ILMN':  { lat: 32.7157, lng: -117.1611, city: 'San Diego, CA' },
'SRE':   { lat: 32.7157, lng: -117.1611, city: 'San Diego, CA' },
'RMD':   { lat: 32.7157, lng: -117.1611, city: 'San Diego, CA' },
// Nashville, TN
'HCA':   { lat: 36.1627, lng: -86.7816, city: 'Nashville, TN' },
'TSCO':  { lat: 36.0331, lng: -86.7828, city: 'Brentwood, TN' },
'CYH':   { lat: 35.9251, lng: -86.8689, city: 'Franklin, TN' },
'DK':    { lat: 36.0331, lng: -86.7828, city: 'Brentwood, TN' },
// Columbus, OH
'AEP':   { lat: 39.9612, lng: -82.9988, city: 'Columbus, OH' },
'BBWI':  { lat: 39.9612, lng: -82.9988, city: 'Columbus, OH' },
'HBAN':  { lat: 39.9612, lng: -82.9988, city: 'Columbus, OH' },
'ANF':   { lat: 40.0815, lng: -82.8088, city: 'New Albany, OH' },
'BIG':   { lat: 39.9612, lng: -82.9988, city: 'Columbus, OH' },
// Las Vegas, NV
'WYNN':  { lat: 36.1699, lng: -115.1398, city: 'Las Vegas, NV' },
'LVS':   { lat: 36.1699, lng: -115.1398, city: 'Las Vegas, NV' },
'MGM':   { lat: 36.1699, lng: -115.1398, city: 'Las Vegas, NV' },
'CZR':   { lat: 39.5296, lng: -119.8138, city: 'Reno, NV' },
};

export default function Home() {
  const [selectedContinent, setSelectedContinent] = useState(null);
  const [marketData, setMarketData] = useState(null);
  const [newsData, setNewsData] = useState(null);
  const [loadingNews, setLoadingNews] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [cityStocks, setCityStocks] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchMarker, setSearchMarker] = useState(null);
  const [outletQuery, setOutletQuery] = useState('');
  const [outletNews, setOutletNews] = useState(null);
  const [outletLoading, setOutletLoading] = useState(false);
  const [outletError, setOutletError] = useState(null);
  const [outletCollapsed, setOutletCollapsed] = useState(false);
  const chatEndRef = useRef(null);
  const [chatPos, setChatPos] = useState(null);
  const dragState = useRef({ dragging: false, offsetX: 0, offsetY: 0 });

  const startChatDrag = (e) => {
    if (!chatPos) return;
    dragState.current = { dragging: true, offsetX: e.clientX - chatPos.x, offsetY: e.clientY - chatPos.y };
    const onMove = (ev) => {
      if (!dragState.current.dragging) return;
      setChatPos({ x: ev.clientX - dragState.current.offsetX, y: ev.clientY - dragState.current.offsetY });
    };
    const onUp = () => {
      dragState.current.dragging = false;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };
const [chatSize, setChatSize] = useState({ width: 300, height: 380 });
const resizeState = useRef({ resizing: false, startX: 0, startY: 0, startW: 0, startH: 0 });

const startChatResize = (e) => {
  e.stopPropagation(); // don't trigger drag at the same time
  resizeState.current = { resizing: true, startX: e.clientX, startY: e.clientY, startW: chatSize.width, startH: chatSize.height };
  const onMove = (ev) => {
    if (!resizeState.current.resizing) return;
    const newWidth = Math.max(260, resizeState.current.startW + (ev.clientX - resizeState.current.startX));
    const newHeight = Math.max(300, resizeState.current.startH + (ev.clientY - resizeState.current.startY));
    setChatSize({ width: newWidth, height: newHeight });
  };
  const onUp = () => {
    resizeState.current.resizing = false;
    window.removeEventListener('mousemove', onMove);
    window.removeEventListener('mouseup', onUp);
  };
  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onUp);
};
  // Fetch market data and city stocks on page load for ticker tape
  useEffect(() => {
    fetch('/api/markets')
      .then(r => r.json())
      .then(setMarketData);

    fetch('/api/citystocks')
      .then(r => r.json())
      .then(data => setCityStocks(data.cities || {}));
  }, []);

  // Fetch news when North America is selected
  useEffect(() => {
    if (selectedContinent === 'North America') {
      setLoadingNews(true);
      fetch('/api/news')
        .then((r) => r.json())
        .then((data) => { setNewsData(data); setLoadingNews(false); })
        .catch(() => setLoadingNews(false));
    } else {
      setNewsData(null);
    }
  }, [selectedContinent]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    if (chatOpen && !chatPos) {
      setChatPos({ x: window.innerWidth - 360, y: window.innerHeight - 460 });
    }
  }, [chatOpen, chatPos]);

  useEffect(() => {
  if (selectedContinent === 'North America') {
    fetch('/api/citystocks')
      .then((r) => r.json())
      .then((data) => setCityStocks(data.cities))
      .catch(console.error);
  } else {
    setCityStocks(null);
    setSearchResult(null);
    setSearchQuery('');
  }
}, [selectedContinent]);

  const ACCENT_COLORS = {
    'North America': '#F97316',
    'South America': '#22C55E',
    'Europe': '#3B82F6',
    'Asia': '#A855F7',
    'Africa': '#EAB308',
    'Oceania': '#06B6D4',
    'United Kingdom': '#EF4444',
  };
  const accentColor = ACCENT_COLORS[selectedContinent] || '#3B82F6';

  const sendMessage = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMessage = chatInput.trim();
    setChatInput('');
    setChatMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setChatLoading(true);
    const marketContext = marketData
      ? marketData.indices.map((i) => `${i.name}: ${i.value} (${i.change})`).join(', ')
      : 'No market data loaded';
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, marketContext }),
      });
      const data = await response.json();
      setChatMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    } catch {
      setChatMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, could not get a response. Try again.' }]);
    } finally {
      setChatLoading(false);
    }
  };
  const searchStock = async () => {
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    setSearchResult(null);
    setSearchMarker(null);
    try {
      const res = await fetch(`/api/stocksearch?symbol=${searchQuery.trim()}`);
      const data = await res.json();
      setSearchResult(data);
      const location = COMPANY_LOCATIONS[searchQuery.trim().toUpperCase()];
      if (location && !data.error) {
        setSearchMarker({
          ...location,
          symbol: data.symbol,
          name: data.name,
          value: data.value,
          change: data.change,
          up: data.up,
          exchange: data.exchange,
        });
      }
    } catch {
      setSearchResult({ error: 'Search failed' });
    } finally {
      setSearchLoading(false);
    }
  };

  const TOP_OUTLETS = ['Fox News', 'CNN', 'CNBC', 'Reuters', 'Bloomberg', 'WSJ', 'Washington Post', 'ABC News', 'CBS News', 'NBC News', 'USA Today', 'AP'];

  const searchOutlet = async (name) => {
    const query = (name ?? outletQuery).trim();
    if (!query) return;
    setOutletQuery(query);
    setOutletLoading(true);
    setOutletNews(null);
    setOutletError(null);
    setOutletCollapsed(false);
    try {
      const res = await fetch(`/api/outletnews?outlet=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.error) setOutletError(data.error);
      else setOutletNews(data.articles);
    } catch {
      setOutletError('Search failed. Try again.');
    } finally {
      setOutletLoading(false);
    }
  };

  return (
    <div style={{ background: '#070B14', height: '100vh', overflow: 'hidden', fontFamily: 'system-ui, sans-serif', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @keyframes tickerScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        .ticker-track {
          animation: tickerScroll 35s linear infinite;
          display: flex;
          width: max-content;
        }
        .ticker-track:hover { animation-play-state: paused; }
        .leaflet-container { background: #070B14 !important; }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav style={{ background: '#0D1321', borderBottom: '1px solid #1E2D45', padding: '0 32px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🌐</div>
          <span style={{ color: 'white', fontWeight: 700, fontSize: 18, letterSpacing: '-0.3px' }}>World Market Map</span>
          <span style={{ background: '#1E3A5F', color: '#60A5FA', fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, letterSpacing: '0.5px' }}>LIVE</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          {selectedContinent && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: accentColor, boxShadow: `0 0 8px ${accentColor}` }} />
              <span style={{ color: '#94A3B8', fontSize: 13 }}>{selectedContinent}</span>
            </div>
          )}
          <button onClick={() => setChatOpen(!chatOpen)} style={{ background: chatOpen ? accentColor : '#1E2D45', color: 'white', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            🤖 Ask AI
          </button>
        </div>
      </nav>

      {/* ── TICKER TAPE ── */}
      <div style={{ background: '#080C18', borderBottom: '1px solid #1E2D45', height: 40, overflow: 'hidden', display: 'flex', alignItems: 'center', flexShrink: 0, zIndex: 40 }}>
        <div style={{ background: '#DC2626', color: 'white', padding: '0 14px', height: '100%', display: 'flex', alignItems: 'center', fontSize: 11, fontWeight: 800, letterSpacing: '1.5px', flexShrink: 0 }}>
          ● LIVE
        </div>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          {marketData ? (() => {
            const tickerItems = [
              ...(marketData?.indices || []),
              ...Object.values(cityStocks || {}).flat(),
            ];
            const tickerLoop = [...tickerItems, ...tickerItems, ...tickerItems];
            return (
              <div className="ticker-track">
                {tickerLoop.map((item, i) => (
                  <span className="ticker-item" key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '0 24px', borderRight: '1px solid #1A2540', height: 40, whiteSpace: 'nowrap' }}>
                    <strong style={{ color: '#64748B', fontSize: 11 }}>{item.symbol || item.name}</strong>{' '}
                    <span style={{ color: item.up ? '#22C55E' : '#EF4444', fontSize: 11, fontWeight: 700 }}>
                      {item.value} {item.change}
                    </span>
                  </span>
                ))}
              </div>
            );
          })() : (
            <span style={{ color: '#334155', fontSize: 12, paddingLeft: 16 }}>Connecting to markets...</span>
          )}
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* MAP */}
        <div style={{ flex: 1, position: 'relative' }}>
          {!selectedContinent && (
            <div style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: 'rgba(13,19,33,0.9)', border: '1px solid #1E2D45', borderRadius: 8, padding: '8px 18px', pointerEvents: 'none', zIndex: 10 }}>
              <p style={{ color: '#475569', fontSize: 13, margin: 0 }}>Click any continent to explore markets</p>
            </div>
          )}
          <WorldMap
            selectedContinent={selectedContinent}
            onContinentSelect={(continent) => {
              setSelectedContinent(continent);
              setChatMessages([]);
            }}
            searchMarker={searchMarker}
          />
        </div>

        {/* RIGHT PANEL */}
        {selectedContinent && (
          <div style={{ width: 320, background: '#0D1321', borderLeft: '1px solid #1E2D45', overflowY: 'auto', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>

            {/* Panel Header */}
            <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid #1E2D45', background: '#0A0E1A' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: accentColor }} />
                    <span style={{ color: '#64748B', fontSize: 11, fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase' }}>{selectedContinent}</span>
                  </div>
                  <h2 style={{ color: 'white', fontSize: 17, fontWeight: 700, margin: 0 }}>
                    {selectedContinent === 'North America' ? 'US Markets' : `${selectedContinent} Markets`}
                  </h2>
                </div>
                <button onClick={() => setSelectedContinent(null)} style={{ background: '#1E2D45', border: 'none', color: '#64748B', borderRadius: 6, width: 28, height: 28, cursor: 'pointer', fontSize: 14 }}>✕</button>
              </div>
            </div>

            {/* Search Bar */}
            {selectedContinent === 'North America' && (
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #1E2D45' }}>
                <p style={{ color: '#475569', fontSize: 11, fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 10 }}>Search Any Stock</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === 'Enter' && searchStock()}
                    placeholder="e.g. AAPL, TSLA, MSFT"
                    style={{ flex: 1, background: '#111827', border: '1px solid #1E2D45', color: 'white', borderRadius: 8, padding: '8px 12px', fontSize: 13, outline: 'none' }}
                  />
                  <button onClick={searchStock} disabled={searchLoading} style={{ background: accentColor, border: 'none', color: 'white', borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                    {searchLoading ? '...' : 'GO'}
                  </button>
                </div>

                {/* Search result */}
                {searchResult && !searchResult.error && (
                  <div style={{ marginTop: 10, background: '#111827', border: `1px solid ${accentColor}`, borderRadius: 10, padding: '12px 14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <p style={{ color: accentColor, fontSize: 12, fontWeight: 700, margin: '0 0 2px' }}>{searchResult.symbol}</p>
                        <p style={{ color: '#94A3B8', fontSize: 11, margin: '0 0 6px' }}>{searchResult.name}</p>
                        <p style={{ color: 'white', fontSize: 18, fontWeight: 700, margin: 0 }}>{searchResult.value}</p>
                      </div>
                      <div style={{ background: searchResult.up ? '#052E16' : '#2D0A0A', border: `1px solid ${searchResult.up ? '#166534' : '#7F1D1D'}`, borderRadius: 6, padding: '4px 10px' }}>
                        <span style={{ color: searchResult.up ? '#4ADE80' : '#F87171', fontSize: 13, fontWeight: 700 }}>{searchResult.up ? '▲' : '▼'} {searchResult.change}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                      <span style={{ color: '#475569', fontSize: 11 }}>H: <span style={{ color: '#94A3B8' }}>{searchResult.high}</span></span>
                      <span style={{ color: '#475569', fontSize: 11 }}>L: <span style={{ color: '#94A3B8' }}>{searchResult.low}</span></span>
                      <span style={{ color: '#475569', fontSize: 11 }}>Vol: <span style={{ color: '#94A3B8' }}>{searchResult.volume}</span></span>
                    </div>
                  </div>
                )}
                {searchResult?.error && (
                  <p style={{ color: '#EF4444', fontSize: 12, marginTop: 8 }}>Symbol not found. Try again.</p>
                )}
              </div>
            )}

            {/* City Stocks */}
            {selectedContinent === 'North America' && cityStocks && (
              <div style={{ padding: '16px 20px' }}>
                <p style={{ color: '#475569', fontSize: 11, fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 12 }}>Top Stocks by City</p>
                {Object.entries(cityStocks).map(([city, stocks]) => (
                  stocks.length === 0 ? null : (
                    <div key={city} style={{ marginBottom: 16 }}>
                      <p style={{ color: '#60A5FA', fontSize: 11, fontWeight: 700, marginBottom: 6, letterSpacing: '0.3px' }}>📍 {city}</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {stocks.map((stock) => (
                          <div key={stock.symbol} style={{ background: '#111827', border: '1px solid #1E2D45', borderRadius: 8, padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                              <span style={{ color: 'white', fontSize: 12, fontWeight: 700 }}>{stock.symbol}</span>
                              <span style={{ color: '#475569', fontSize: 11, marginLeft: 8 }}>{stock.value}</span>
                            </div>
                            <span style={{ color: stock.up ? '#4ADE80' : '#F87171', fontSize: 11, fontWeight: 700 }}>
                              {stock.up ? '▲' : '▼'} {stock.change}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                ))}
              </div>
            )}

            {/* Coming soon */}
            {selectedContinent !== 'North America' && (
              <div style={{ padding: 20 }}>
                <div style={{ background: '#111827', border: '1px solid #1E2D45', borderRadius: 10, padding: 20, textAlign: 'center' }}>
                  <p style={{ color: '#475569', fontSize: 13, margin: 0 }}>{selectedContinent} markets coming soon</p>
                </div>
              </div>
            )}

            {/* News */}
            {selectedContinent === 'North America' && (
              <div style={{ padding: '0 20px 20px' }}>
                <p style={{ color: '#475569', fontSize: 11, fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 12 }}>Market News</p>
                {loadingNews && <div style={{ color: '#475569', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>Loading news...</div>}
                {newsData && !loadingNews && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {newsData.articles.map((article, i) => (
                      <a key={i} href={article.url} target="_blank" rel="noopener noreferrer"
                        style={{ background: '#111827', border: '1px solid #1E2D45', borderRadius: 10, padding: '12px 14px', textDecoration: 'none', display: 'block' }}
                        onMouseOver={(e) => e.currentTarget.style.borderColor = accentColor}
                        onMouseOut={(e) => e.currentTarget.style.borderColor = '#1E2D45'}>
                        <p style={{ color: '#E2E8F0', fontSize: 13, fontWeight: 600, margin: '0 0 6px', lineHeight: '1.4' }}>{article.headline}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ background: '#1E2D45', color: '#60A5FA', fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 4 }}>{article.source}</span>
                          <span style={{ color: '#475569', fontSize: 11 }}>{article.time}</span>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}

            {selectedContinent === 'North America' && (
              <div style={{ padding: '0 20px 20px' }}>
                <p style={{ color: '#475569', fontSize: 11, fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 10 }}>Search News by Outlet</p>
                <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                  <input
                    type="text"
                    value={outletQuery}
                    onChange={(e) => setOutletQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && searchOutlet()}
                    placeholder="e.g. Fox News, CNN, Bloomberg"
                    style={{ flex: 1, background: '#111827', border: '1px solid #1E2D45', color: 'white', borderRadius: 8, padding: '8px 12px', fontSize: 13, outline: 'none' }}
                  />
                  <button onClick={() => searchOutlet()} disabled={outletLoading} style={{ background: accentColor, border: 'none', color: 'white', borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                    {outletLoading ? '...' : 'GO'}
                  </button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                  {TOP_OUTLETS.map((name) => (
                    <button key={name} onClick={() => searchOutlet(name)} style={{ background: '#111827', border: '1px solid #1E2D45', color: '#60A5FA', borderRadius: 6, padding: '4px 10px', fontSize: 11, cursor: 'pointer' }}>
                      {name}
                    </button>
                  ))}
                </div>
                {outletError && <p style={{ color: '#EF4444', fontSize: 12 }}>{outletError}</p>}
                {outletNews && (
                  <div>
                    <button
                      onClick={() => setOutletCollapsed(!outletCollapsed)}
                      style={{ background: 'transparent', border: '1px solid #1E2D45', color: '#94A3B8', borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 600, cursor: 'pointer', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      {outletCollapsed ? '▸ Show results' : '▾ Hide results'}
                      <span style={{ color: '#475569' }}>({outletNews.length})</span>
                    </button>
                    {!outletCollapsed && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {outletNews.map((article, i) => (
                          <a key={i} href={article.url} target="_blank" rel="noopener noreferrer"
                            style={{ background: '#111827', border: '1px solid #1E2D45', borderRadius: 10, padding: '12px 14px', textDecoration: 'none', display: 'block' }}>
                            <p style={{ color: '#E2E8F0', fontSize: 13, fontWeight: 600, margin: '0 0 6px', lineHeight: '1.4' }}>{article.headline}</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ background: '#1E2D45', color: '#60A5FA', fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 4 }}>{article.source}</span>
                              <span style={{ color: '#475569', fontSize: 11 }}>{article.time}</span>
                            </div>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── FLOATING CHAT ── */}
      {chatOpen && chatPos && (
        <div style={{ position: 'fixed', left: chatPos.x, top: chatPos.y, width: chatSize.width, height: chatSize.height, background: '#0D1321', border: '1px solid #1E2D45', borderRadius: 16, display: 'flex', flexDirection: 'column', zIndex: 9999, boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}>
          <div onMouseDown={startChatDrag} style={{ padding: '16px 20px', borderBottom: '1px solid #1E2D45', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0A0E1A', borderRadius: '16px 16px 0 0', cursor: 'move', userSelect: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🤖</div>
              <div>
                <p style={{ color: 'white', fontSize: 14, fontWeight: 700, margin: 0 }}>Market AI</p>
                <p style={{ color: '#22C55E', fontSize: 11, margin: 0 }}>● Powered by Claude</p>
              </div>
            </div>
            <button onMouseDown={(e) => e.stopPropagation()} onClick={() => setChatOpen(false)} style={{ background: '#1E2D45', border: 'none', color: '#64748B', borderRadius: 6, width: 28, height: 28, cursor: 'pointer', fontSize: 14 }}>✕</button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {chatMessages.length === 0 && (
              <div style={{ textAlign: 'center', padding: '30px 20px' }}>
                <p style={{ color: '#334155', fontSize: 13, marginBottom: 16 }}>Ask me anything about global markets</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {["Why is the S&P 500 moving today?", "What is driving oil prices?", "Explain what Nasdaq tracks"].map((q) => (
                    <button key={q} onClick={() => setChatInput(q)} style={{ background: '#111827', border: '1px solid #1E2D45', color: '#60A5FA', borderRadius: 8, padding: '8px 12px', fontSize: 12, cursor: 'pointer', textAlign: 'left' }}>{q}</button>
                  ))}
                </div>
              </div>
            )}
            {chatMessages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{ maxWidth: '85%', background: msg.role === 'user' ? accentColor : '#111827', border: msg.role === 'assistant' ? '1px solid #1E2D45' : 'none', borderRadius: msg.role === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px', padding: '10px 14px', fontSize: 13, color: 'white', lineHeight: 1.5 }}>
                  {msg.role === 'assistant' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {msg.content.split('\n').map((line, j) => {
                        if (line.startsWith('- ')) return <div key={j} style={{ display: 'flex', gap: 8 }}><span style={{ color: accentColor, flexShrink: 0 }}>•</span><span style={{ color: '#CBD5E1' }}>{line.substring(2)}</span></div>;
                        if (line.startsWith('Bottom Line:')) return <div key={j} style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #1E2D45', color: '#F59E0B', fontWeight: 600 }}>{line}</div>;
                        if (!line.trim()) return null;
                        return <p key={j} style={{ margin: 0, color: '#CBD5E1' }}>{line}</p>;
                      })}
                    </div>
                  ) : msg.content}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ background: '#111827', border: '1px solid #1E2D45', borderRadius: '12px 12px 12px 4px', padding: '10px 16px', color: '#475569', fontSize: 13 }}>Analyzing markets...</div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <div style={{ padding: '12px 16px', borderTop: '1px solid #1E2D45', display: 'flex', gap: 8 }}>
            <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()} placeholder="Ask about the markets..." style={{ flex: 1, background: '#111827', border: '1px solid #1E2D45', color: 'white', borderRadius: 8, padding: '10px 14px', fontSize: 13, outline: 'none' }} />
            <button onClick={sendMessage} disabled={chatLoading} style={{ background: accentColor, border: 'none', color: 'white', borderRadius: 8, padding: '10px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: chatLoading ? 0.5 : 1 }}>Send</button>
          </div>
          <div
            onMouseDown={startChatResize}
            style={{
              position: 'absolute',
              bottom: 4,
              right: 4,
              width: 16,
              height: 16,
              cursor: 'nwse-resize',
              background: 'linear-gradient(135deg, transparent 50%, #475569 50%, #475569 60%, transparent 60%, transparent 70%, #475569 70%, #475569 80%, transparent 80%)',
              borderRadius: '0 0 12px 0',
            }}
          />
        </div>
      )}
    </div>
  );
}
