import React, { useState, useEffect } from 'react';
import config from './config';

const App = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const apiUrl = `${config.API_URL}/games/`;

    setIsLoading(true);
    fetch(apiUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setData(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching data: ', error);
        setError('Failed to load games data. Please try again later.');
        setIsLoading(false);
      });
  }, []);

  const exportToCSV = () => {
    if (!data.length) return;

    const header = Object.keys(data[0]).join(',');
    const rows = data.map((item) => Object.values(item).join(','));
    const csvContent = [header, ...rows].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'games_data.csv';
    link.click();
  };

  return (
    <div>
      <h1>Husband's Games</h1>

      {isLoading && <p>Loading games...</p>}

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!isLoading && !error && (
        <>
          {data.length === 0 ? (
            <p>No games found.</p>
          ) : (
            <>
              <ul>
                {data.map((item) => (
                  <li key={item.id}>{item.title}</li>
                ))}
              </ul>
              <button onClick={exportToCSV}>Export to CSV</button>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default App;