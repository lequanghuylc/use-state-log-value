import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Link, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { setLogServer, useStateLogValue } from '../../../src/frontend/useStateLogValue';

type ImdbItem = {
  id: string;
  type: 'movie' | 'tv';
  title: string;
  year: number;
  rating: number;
  overview: string;
};

const imdbData: ImdbItem[] = [
  {
    id: 'tt0111161',
    type: 'movie',
    title: 'The Shawshank Redemption',
    year: 1994,
    rating: 9.3,
    overview: 'Two imprisoned men bond over years, finding solace and redemption.',
  },
  {
    id: 'tt0903747',
    type: 'tv',
    title: 'Breaking Bad',
    year: 2008,
    rating: 9.5,
    overview: 'A chemistry teacher turned meth producer navigates a criminal world.',
  },
  {
    id: 'tt0468569',
    type: 'movie',
    title: 'The Dark Knight',
    year: 2008,
    rating: 9.0,
    overview: 'Batman faces the Joker in Gotham\'s most chaotic battle.',
  },
  {
    id: 'tt0944947',
    type: 'tv',
    title: 'Game of Thrones',
    year: 2011,
    rating: 9.2,
    overview: 'Noble families fight for control of the Iron Throne.',
  },
];

setLogServer('/api/logs');

function ListPage() {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useStateLogValue<'all' | 'movie' | 'tv'>('all', 'imdb-filter');

  const visible = imdbData.filter((item) => selectedType === 'all' || item.type === selectedType);

  return (
    <div style={{ fontFamily: 'Arial', padding: 24 }}>
      <h1 data-cy="page-list">IMDb List</h1>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button data-cy="filter-all" onClick={() => setSelectedType('all')}>All</button>
        <button data-cy="filter-movie" onClick={() => setSelectedType('movie')}>Movie</button>
        <button data-cy="filter-tv" onClick={() => setSelectedType('tv')}>TV Series</button>
      </div>

      <div style={{ display: 'grid', gap: 12 }}>
        {visible.map((item) => (
          <div
            key={item.id}
            data-cy={`card-${item.id}`}
            style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12, cursor: 'pointer' }}
            onClick={() => navigate(`/details/${item.id}`)}
          >
            <strong>{item.title}</strong>
            <div>Type: {item.type === 'tv' ? 'tv series' : 'movie'}</div>
            <div>Year: {item.year}</div>
            <div>Rating: {item.rating}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DetailPage() {
  const { id } = useParams();
  const item = imdbData.find((d) => d.id === id);
  const [logsJson, setLogsJson] = React.useState<string>('Loading logs...');

  React.useEffect(() => {
    const fetchLogs = async () => {
      const response = await fetch('/api/logs');
      const data = await response.json();
      setLogsJson(JSON.stringify(data, null, 2));
    };
    void fetchLogs();
  }, []);

  if (!item) {
    return (
      <div style={{ fontFamily: 'Arial', padding: 24 }}>
        <h1>Not Found</h1>
        <Link to="/">Back</Link>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'Arial', padding: 24 }}>
      <h1 data-cy="page-detail">IMDb Details</h1>
      <h2 data-cy="detail-title">{item.title}</h2>
      <p>Type: {item.type === 'tv' ? 'tv series' : 'movie'}</p>
      <p>Year: {item.year}</p>
      <p>Overview: {item.overview}</p>

      <h3>Raw JSON of logged values</h3>
      <pre data-cy="logs-json" style={{ background: '#111', color: '#0f0', padding: 12, borderRadius: 8, overflow: 'auto' }}>
        {logsJson}
      </pre>

      <Link data-cy="back-link" to="/">Back to list</Link>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ListPage />} />
        <Route path="/details/:id" element={<DetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
