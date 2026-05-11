import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { useState, useEffect } from 'react';

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
  'North America': '#E65100',
  'South America': '#2E7D32',
  'Europe': '#1565C0',
  'Asia': '#6A1B9A',
  'Africa': '#F9A825',
  'Oceania': '#00838F',
};

export default function Home() {
  const [selectedContinent, setSelectedContinent] = useState(null);
  const [marketData, setMarketData] = useState(null);
  const [newsData, setNewsData] = useState(null);
  const [loadingMarket, setLoadingMarket] = useState(false);
  const [loadingNews, setLoadingNews] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (selectedContinent === 'North America') {
      // Fetch market data
      setLoadingMarket(true);
      setError(null);
      fetch('/api/market')
        .then((res) => res.json())
        .then((data) => {
          setMarketData(data);
          setLoadingMarket(false);
        })
        .catch(() => {
          setError('Failed to load market data');
          setLoadingMarket(false);
        });

      // Fetch news data
      setLoadingNews(true);
      fetch('/api/news')
        .then((res) => res.json())
        .then((data) => {
          setNewsData(data);
          setLoadingNews(false);
        })
        .catch(() => {
          setLoadingNews(false);
        });
    } else {
      setMarketData(null);
      setNewsData(null);
    }
  }, [selectedContinent]);

  const handleCountryClick = (geo) => {
    const country = geo.properties.name;
    const continent = CONTINENT_MAP[country] || null;
    setSelectedContinent(continent);
  };

  const getCountryColor = (geo) => {
    const country = geo.properties.name;
    const continent = CONTINENT_MAP[country];
    if (continent && continent === selectedContinent) {
      return CONTINENT_COLORS[continent] || '#4FC3F7';
    }
    return '#2E75B6';
  };

  return (
    <main className='min-h-screen bg-gray-900 flex flex-col items-center p-8'>
      <h1 className='text-white text-4xl font-bold mb-2'>World Market Map</h1>
      <p className='text-gray-400 mb-6'>Click a continent to explore its markets</p>

      {selectedContinent && (
        <div className='mb-4 px-6 py-2 rounded-full text-white font-semibold text-lg'
          style={{ backgroundColor: CONTINENT_COLORS[selectedContinent] }}>
          {selectedContinent}
        </div>
      )}

      <div className='flex w-full max-w-7xl gap-6'>

        {/* Map */}
        <div className='flex-1'>
          <ComposableMap style={{ width: '100%' }}>
            <ZoomableGroup>
              <Geographies geography={GEO_URL}>
                {({ geographies }) =>
                  geographies.map((geo) => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onClick={() => handleCountryClick(geo)}
                      style={{
                        default: { fill: getCountryColor(geo), stroke: '#1A375E', strokeWidth: 0.5, outline: 'none' },
                        hover: { fill: '#4FC3F7', cursor: 'pointer', outline: 'none' },
                        pressed: { fill: '#1A375E', outline: 'none' },
                      }}
                    />
                  ))
                }
              </Geographies>
            </ZoomableGroup>
          </ComposableMap>
        </div>

        {/* Right Panel */}
        {selectedContinent && (
          <div className='w-80 flex flex-col gap-4 self-start mt-8'>

            {/* Market Data Card */}
            <div className='bg-gray-800 rounded-2xl p-6'>
              <h2 className='text-white text-xl font-bold mb-4'>
                {selectedContinent === 'North America' ? '🇺🇸 US Stock Market' : `${selectedContinent} Markets`}
              </h2>

              {loadingMarket && <p className='text-gray-400 text-sm'>Loading market data...</p>}
              {error && <p className='text-red-400 text-sm'>{error}</p>}

              {marketData && !loadingMarket && (
                <div className='flex flex-col gap-3'>
                  {marketData.indices.map((index) => (
                    <div key={index.name} className='bg-gray-700 rounded-xl p-4'>
                      <p className='text-gray-400 text-sm'>{index.name}</p>
                      <p className='text-white text-lg font-bold'>{index.value}</p>
                      <p className={`text-sm font-semibold ${index.up ? 'text-green-400' : 'text-red-400'}`}>
                        {index.change}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {selectedContinent !== 'North America' && (
                <p className='text-gray-400 text-sm'>Market data coming soon!</p>
              )}
            </div>

            {/* News Card */}
            {selectedContinent === 'North America' && (
              <div className='bg-gray-800 rounded-2xl p-6'>
                <h2 className='text-white text-xl font-bold mb-4'>📰 Latest Market News</h2>

                {loadingNews && <p className='text-gray-400 text-sm'>Loading news...</p>}

                {newsData && !loadingNews && (
                  <div className='flex flex-col gap-4'>
                    {newsData.articles.map((article, index) => (
                      <a
                        key={index}
                        href={article.url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='block border-b border-gray-700 pb-3 last:border-0 hover:opacity-80 transition'
                      >
                        <p className='text-white text-sm font-semibold leading-snug mb-1'>
                          {article.headline}
                        </p>
                        <p className='text-gray-500 text-xs'>
                          {article.source} · {article.time}
                        </p>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        )}
      </div>
    </main>
  );
}