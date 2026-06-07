import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { useState, useEffect, useRef } from 'react';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

const CONTINENT_MAP = {
  'United States of America': 'North America',
  'Canada': 'North America',
  'Mexico': 'North America',
  'Cuba': 'North America',
  'Guatemala': 'North America',
  'Belize': 'North America',
  'Honduras': 'North America',
  'El Salvador': 'North America',
  'Nicaragua': 'North America',
  'Costa Rica': 'North America',
  'Panama': 'North America',
  'Jamaica': 'North America',
  'Haiti': 'North America',
  'Dominican Rep.': 'North America',
  'Puerto Rico': 'North America',
  'Brazil': 'South America',
  'Argentina': 'South America',
  'Chile': 'South America',
  'Colombia': 'South America',
  'Peru': 'South America',
  'Venezuela': 'South America',
  'Ecuador': 'South America',
  'Bolivia': 'South America',
  'Paraguay': 'South America',
  'Uruguay': 'South America',
  'Guyana': 'South America',
  'Suriname': 'South America',
  'France': 'Europe',
  'Germany': 'Europe',
  'United Kingdom': 'Europe',
  'Italy': 'Europe',
  'Spain': 'Europe',
  'Portugal': 'Europe',
  'Netherlands': 'Europe',
  'Belgium': 'Europe',
  'Sweden': 'Europe',
  'Norway': 'Europe',
  'Denmark': 'Europe',
  'Finland': 'Europe',
  'Poland': 'Europe',
  'Ukraine': 'Europe',
  'Russia': 'Europe',
  'Switzerland': 'Europe',
  'Austria': 'Europe',
  'Greece': 'Europe',
  'Czech Rep.': 'Europe',
  'Romania': 'Europe',
  'China': 'Asia',
  'Japan': 'Asia',
  'India': 'Asia',
  'South Korea': 'Asia',
  'Indonesia': 'Asia',
  'Thailand': 'Asia',
  'Vietnam': 'Asia',
  'Malaysia': 'Asia',
  'Philippines': 'Asia',
  'Pakistan': 'Asia',
  'Bangladesh': 'Asia',
  'Saudi Arabia': 'Asia',
  'UAE': 'Asia',
  'Iran': 'Asia',
  'Iraq': 'Asia',
  'Turkey': 'Asia',
  'Israel': 'Asia',
  'Nigeria': 'Africa',
  'South Africa': 'Africa',
  'Egypt': 'Africa',
  'Kenya': 'Africa',
  'Ethiopia': 'Africa',
  'Ghana': 'Africa',
  'Tanzania': 'Africa',
  'Morocco': 'Africa',
  'Algeria': 'Africa',
  'Angola': 'Africa',
  'Australia': 'Oceania',
  'New Zealand': 'Oceania',
};

const CONTINENT_COLORS = {
  'North America': '#F97316',
  'South America': '#22C55E',
  'Europe': '#3B82F6',
  'Asia': '#A855F7',
  'Africa': '#EAB308',
  'Oceania': '#06B6D4',
};

const CONTINENT_FLAGS = {
  'North America': '🇺🇸',
  'South America': '🌎',
  'Europe': '🇪🇺',
  'Asia': '🌏',
  'Africa': '🌍',
  'Oceania': '🌊',
};

export default function Home() {
  const [selectedContinent, setSelectedContinent] = useState(null);
  const [marketData, setMarketData] = useState(null);
  const [newsData, setNewsData] = useState(null);
  const [loadingMarket, setLoadingMarket] = useState(false);
  const [loadingNews, setLoadingNews] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (selectedContinent === 'North America') {
      setLoadingMarket(true);
      fetch('/api/markets')
        .then((res) => res.json())
        .then((data) => { setMarketData(data); setLoadingMarket(false); })
        .catch(() => setLoadingMarket(false));

      setLoadingNews(true);
      fetch('/api/news')
        .then((res) => res.json())
        .then((data) => { setNewsData(data); setLoadingNews(false); })
        .catch(() => setLoadingNews(false));
    } else {
      setMarketData(null);
      setNewsData(null);
    }
  }, [selectedContinent]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleCountryClick = (geo) => {
    const country = geo.properties.name;
    const continent = CONTINENT_MAP[country] || null;
    setSelectedContinent(continent);
    setChatMessages([]);
  };

  const getCountryColor = (geo) => {
    const country = geo.properties.name;
    const continent = CONTINENT_MAP[country];
    if (continent && continent === selectedContinent) {
      return CONTINENT_COLORS[continent] || '#4FC3F7';
    }
    return '#1E3A5F';
  };

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
      setChatMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, I could not get a response. Please try again.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  const accentColor = selectedContinent ? CONTINENT_COLORS[selectedContinent] : '#3B82F6';

  return (
    <div style={{ background: '#070B14', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>

      {/* ── NAVBAR ── */}
      <nav style={{ background: '#0D1321', borderBottom: '1px solid #1E2D45', padding: '0 32px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
          <button
            onClick={() => setChatOpen(!chatOpen)}
            style={{ background: chatOpen ? accentColor : '#1E2D45', color: 'white', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            🤖 Ask AI
          </button>
        </div>
      </nav>

      <div style={{ display: 'flex', height: 'calc(100vh - 60px)' }}>

        {/* ── MAP SECTION ── */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          {/* Continent label overlay */}
          {!selectedContinent && (
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none', zIndex: 10 }}>
              <p style={{ color: '#334155', fontSize: 14, fontWeight: 500 }}>Click any continent to explore markets</p>
            </div>
          )}

          <ComposableMap style={{ width: '100%', height: '100%' }} projectionConfig={{ scale: 147 }}>
            <ZoomableGroup>
              <Geographies geography={GEO_URL}>
                {({ geographies }) =>
                  geographies.map((geo) => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onClick={() => handleCountryClick(geo)}
                      style={{
                        default: { fill: getCountryColor(geo), stroke: '#0D1321', strokeWidth: 0.5, outline: 'none' },
                        hover: { fill: '#60A5FA', cursor: 'pointer', outline: 'none' },
                        pressed: { fill: '#1E40AF', outline: 'none' },
                      }}
                    />
                  ))
                }
              </Geographies>
            </ZoomableGroup>
          </ComposableMap>
        </div>

        {/* ── RIGHT PANEL ── */}
        {selectedContinent && (
          <div style={{ width: 340, background: '#0D1321', borderLeft: '1px solid #1E2D45', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>

            {/* Panel header */}
            <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #1E2D45', background: '#0A0E1A' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: accentColor }} />
                    <span style={{ color: '#94A3B8', fontSize: 12, fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase' }}>{selectedContinent}</span>
                  </div>
                  <h2 style={{ color: 'white', fontSize: 18, fontWeight: 700, margin: 0 }}>
                    {selectedContinent === 'North America' ? 'US Markets' : `${selectedContinent} Markets`}
                  </h2>
                </div>
                <button onClick={() => setSelectedContinent(null)} style={{ background: '#1E2D45', border: 'none', color: '#64748B', borderRadius: 6, width: 28, height: 28, cursor: 'pointer', fontSize: 14 }}>✕</button>
              </div>
            </div>

            {/* Market data */}
            <div style={{ padding: '16px 20px' }}>
              <p style={{ color: '#475569', fontSize: 11, fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 12 }}>Live Indices</p>

              {loadingMarket && (
                <div style={{ color: '#475569', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>Loading market data...</div>
              )}

              {marketData && !loadingMarket && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {marketData.indices.map((index) => (
                    <div key={index.name} style={{ background: '#111827', border: '1px solid #1E2D45', borderRadius: 10, padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <p style={{ color: '#64748B', fontSize: 11, fontWeight: 500, margin: '0 0 2px' }}>{index.name}</p>
                        <p style={{ color: 'white', fontSize: 16, fontWeight: 700, margin: 0 }}>{index.value}</p>
                      </div>
                      <div style={{ background: index.up ? '#052E16' : '#2D0A0A', border: `1px solid ${index.up ? '#166534' : '#7F1D1D'}`, borderRadius: 6, padding: '4px 10px' }}>
                        <span style={{ color: index.up ? '#4ADE80' : '#F87171', fontSize: 13, fontWeight: 700 }}>{index.change}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedContinent !== 'North America' && !loadingMarket && (
                <div style={{ background: '#111827', border: '1px solid #1E2D45', borderRadius: 10, padding: 20, textAlign: 'center' }}>
                  <p style={{ color: '#475569', fontSize: 13, margin: 0 }}>Market data for {selectedContinent} coming soon</p>
                </div>
              )}
            </div>

            {/* News */}
            {selectedContinent === 'North America' && (
              <div style={{ padding: '0 20px 20px' }}>
                <p style={{ color: '#475569', fontSize: 11, fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 12 }}>Latest News</p>

                {loadingNews && (
                  <div style={{ color: '#475569', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>Loading news...</div>
                )}

                {newsData && !loadingNews && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {newsData.articles.map((article, index) => (
                      <a key={index} href={article.url} target='_blank' rel='noopener noreferrer'
                        style={{ background: '#111827', border: '1px solid #1E2D45', borderRadius: 10, padding: '12px 14px', textDecoration: 'none', display: 'block', transition: 'border-color 0.2s' }}
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
          </div>
        )}
      </div>

      {/* ── FLOATING CHAT PANEL ── */}
      {chatOpen && (
        <div style={{ position: 'fixed', bottom: 20, right: 20, width: 380, height: 520, background: '#0D1321', border: '1px solid #1E2D45', borderRadius: 16, display: 'flex', flexDirection: 'column', zIndex: 100, boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}>

          {/* Chat header */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #1E2D45', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0A0E1A', borderRadius: '16px 16px 0 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🤖</div>
              <div>
                <p style={{ color: 'white', fontSize: 14, fontWeight: 700, margin: 0 }}>Market AI</p>
                <p style={{ color: '#22C55E', fontSize: 11, margin: 0 }}>● Powered by Claude</p>
              </div>
            </div>
            <button onClick={() => setChatOpen(false)} style={{ background: '#1E2D45', border: 'none', color: '#64748B', borderRadius: 6, width: 28, height: 28, cursor: 'pointer', fontSize: 14 }}>✕</button>
          </div>

          {/* Chat messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {chatMessages.length === 0 && (
              <div style={{ textAlign: 'center', padding: '30px 20px' }}>
                <p style={{ color: '#334155', fontSize: 13, marginBottom: 16 }}>Ask me anything about global markets</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {['Why is the S&P 500 up today?', 'What is driving oil prices?', 'Explain what Nasdaq tracks'].map((q) => (
                    <button key={q} onClick={() => { setChatInput(q); }} style={{ background: '#111827', border: '1px solid #1E2D45', color: '#60A5FA', borderRadius: 8, padding: '8px 12px', fontSize: 12, cursor: 'pointer', textAlign: 'left' }}>{q}</button>
                  ))}
                </div>
              </div>
            )}

            {chatMessages.map((msg, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '85%',
                  background: msg.role === 'user' ? accentColor : '#111827',
                  border: msg.role === 'assistant' ? '1px solid #1E2D45' : 'none',
                  borderRadius: msg.role === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                  padding: '10px 14px',
                  fontSize: 13,
                  color: 'white',
                  lineHeight: '1.5',
                }}>
                  {msg.role === 'assistant' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {msg.content.split('\n').map((line, i) => {
                        if (line.startsWith('- ')) {
                          return (
                            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                              <span style={{ color: accentColor, marginTop: 2, flexShrink: 0 }}>•</span>
                              <span style={{ color: '#CBD5E1' }}>{line.substring(2)}</span>
                            </div>
                          );
                        }
                        if (line.startsWith('Bottom Line:')) {
                          return (
                            <div key={i} style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #1E2D45', color: '#F59E0B', fontWeight: 600 }}>{line}</div>
                          );
                        }
                        if (line.trim() === '') return null;
                        return <p key={i} style={{ margin: 0, color: '#CBD5E1' }}>{line}</p>;
                      })}
                    </div>
                  ) : msg.content}
                </div>
              </div>
            ))}

            {chatLoading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ background: '#111827', border: '1px solid #1E2D45', borderRadius: '12px 12px 12px 4px', padding: '10px 16px', color: '#475569', fontSize: 13 }}>
                  Analyzing markets...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat input */}
          <div style={{ padding: '12px 16px', borderTop: '1px solid #1E2D45', display: 'flex', gap: 8 }}>
            <input
              type='text'
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder='Ask about the markets...'
              style={{ flex: 1, background: '#111827', border: '1px solid #1E2D45', color: 'white', borderRadius: 8, padding: '10px 14px', fontSize: 13, outline: 'none' }}
            />
            <button
              onClick={sendMessage}
              disabled={chatLoading}
              style={{ background: accentColor, border: 'none', color: 'white', borderRadius: 8, padding: '10px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: chatLoading ? 0.5 : 1 }}>
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
