import React, { useState, useEffect } from 'react';

const App = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch('http://13.53.175.140:8000/games/') // Replace with your FastAPI endpoint
      .then((response) => response.json())
      .then((data) => setData(data))
      .catch((error) => console.error('Error fetching data: ', error));
  }, []);

  const exportToCSV = () => {
    const header = Object.keys(data[0]).join(','); // Get headers from data keys
    const rows = data.map((item) => Object.values(item).join(',')); // Get rows from data values
    const csvContent = [header, ...rows].join('\n'); // Combine header and rows

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'games_data.csv'; // Filename for downloaded file
    link.click();
  };

  return (
    <div>
      <h1>Husband's Games</h1>
      <ul>
        {data.map((item) => (
          <li key={item.id}>{item.title}</li> // Adjust according to the structure of your data
        ))}
      </ul>
      <button onClick={exportToCSV}>Export to CSV</button>
    </div>
  );
};

export default App;
