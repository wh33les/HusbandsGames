// Updated App.js - Public access with optional admin login

import React, { useState, useEffect } from 'react';
import config from './config';
import './App.css';

// Simple Admin Login Modal
const AdminLoginModal = ({ isOpen, onClose, onLogin, isLoading }) => {
  const [credentials, setCredentials] = useState({ username: 'admin', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch(`${config.API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error('Invalid admin credentials');
      }

      const data = await response.json();
      onLogin(data.access_token, data.user);
      onClose();
      setCredentials({ username: 'admin', password: '' });
    } catch (error) {
      setError(error.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="admin-login-modal">
        <div className="modal-header">
          <h3>Admin Login</h3>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="form-group">
            <label>Username:</label>
            <input
              type="text"
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              required
              readOnly
            />
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              placeholder="Enter admin password"
              required
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className="submit-btn">
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>
        <div className="login-help">
          <p><small>Admin login is required to add, edit, or delete games.</small></p>
        </div>
      </div>
    </div>
  );
};

// Add Game Modal Component
const AddGameModal = ({ isOpen, onClose, onAddGame, isLoading }) => {
  const [gameData, setGameData] = useState({
    title: '',
    platform: '',
    genre: '',
    release_year: '',
    price: '',
    region: '',
    publisher: '',
    opened: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const processedData = {
      ...gameData,
      release_year: gameData.release_year ? parseInt(gameData.release_year) : null,
      price: gameData.price ? parseFloat(gameData.price) : null,
    };

    await onAddGame(processedData);
    setGameData({
      title: '',
      platform: '',
      genre: '',
      release_year: '',
      price: '',
      region: '',
      publisher: '',
      opened: false
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Add New Game</h3>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="add-game-form">
          <div className="form-row">
            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                value={gameData.title}
                onChange={(e) => setGameData({ ...gameData, title: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Platform</label>
              <input
                type="text"
                value={gameData.platform}
                onChange={(e) => setGameData({ ...gameData, platform: e.target.value })}
                placeholder="e.g., PS5, PC, Switch"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Genre</label>
              <input
                type="text"
                value={gameData.genre}
                onChange={(e) => setGameData({ ...gameData, genre: e.target.value })}
                placeholder="e.g., Action, RPG, Strategy"
              />
            </div>
            <div className="form-group">
              <label>Release Year</label>
              <input
                type="number"
                value={gameData.release_year}
                onChange={(e) => setGameData({ ...gameData, release_year: e.target.value })}
                min="1970"
                max="2030"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Price</label>
              <input
                type="number"
                step="0.01"
                value={gameData.price}
                onChange={(e) => setGameData({ ...gameData, price: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div className="form-group">
              <label>Region</label>
              <input
                type="text"
                value={gameData.region}
                onChange={(e) => setGameData({ ...gameData, region: e.target.value })}
                placeholder="e.g., US, EU, JP"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Publisher</label>
              <input
                type="text"
                value={gameData.publisher}
                onChange={(e) => setGameData({ ...gameData, publisher: e.target.value })}
              />
            </div>
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={gameData.opened}
                  onChange={(e) => setGameData({ ...gameData, opened: e.target.checked })}
                />
                Opened/Played
              </label>
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className="submit-btn">
              {isLoading ? 'Adding...' : 'Add Game'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Admin authentication state
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [adminToken, setAdminToken] = useState(null);

  // Modal state
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isAddingGame, setIsAddingGame] = useState(false);

  // Check for existing admin token on load
  useEffect(() => {
    const savedToken = localStorage.getItem('admin_token');
    const savedUser = localStorage.getItem('admin_user');

    if (savedToken && savedUser) {
      setAdminToken(savedToken);
      setAdminUser(JSON.parse(savedUser));
      setIsAdmin(true);
    }
  }, []);

  // Fetch games data (public - no authentication required)
  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    const apiUrl = `${config.API_URL}/games/`;

    setIsLoading(true);
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const gamesData = await response.json();
      setData(gamesData);
      setError(null);
    } catch (error) {
      console.error('Error fetching data: ', error);
      setError('Failed to load games data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminLogin = (authToken, userData) => {
    setAdminToken(authToken);
    setAdminUser(userData);
    setIsAdmin(true);

    // Save to localStorage
    localStorage.setItem('admin_token', authToken);
    localStorage.setItem('admin_user', JSON.stringify(userData));
  };

  const handleAdminLogout = () => {
    setAdminToken(null);
    setAdminUser(null);
    setIsAdmin(false);

    // Clear localStorage
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
  };

  const handleAddGame = async (gameData) => {
    setIsAddingGame(true);
    try {
      const response = await fetch(`${config.API_URL}/admin/games`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
        body: JSON.stringify(gameData),
      });

      if (!response.ok) {
        throw new Error('Failed to add game');
      }

      const newGame = await response.json();
      setData([...data, newGame]);
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding game:', error);
      setError('Failed to add game. Please try again.');
    } finally {
      setIsAddingGame(false);
    }
  };

  // Sorting function
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Sort data based on current sort config
  const sortedData = React.useMemo(() => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortConfig]);

  // CSV export function
  const exportToCSV = () => {
    if (!data.length) return;

    const allKeys = [...new Set(data.flatMap(item => Object.keys(item)))];
    const header = allKeys.join(',');
    const rows = data.map((item) =>
      allKeys.map(key => {
        const value = item[key];
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? '';
      }).join(',')
    );

    const csvContent = [header, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `games_data_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const getColumnHeaders = () => {
    if (!data.length) return [];
    return [...new Set(data.flatMap(game => Object.keys(game)))];
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <span className="sort-icon">↕️</span>;
    }
    return sortConfig.direction === 'asc' ?
      <span className="sort-icon active">↑</span> :
      <span className="sort-icon active">↓</span>;
  };

  if (isLoading) {
    return (
      <div className="container">
        <h1>Husband's Games</h1>
        <div className="loading">Loading games...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <h1>Husband's Games</h1>
        <div className="error">{error}</div>
        <button onClick={fetchGames} className="retry-btn">Retry</button>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <h1>Husband's Games</h1>
        <div className="header-actions">
          {isAdmin ? (
            <div className="admin-info">
              <span>👤 {adminUser?.name}</span>
              <button onClick={handleAdminLogout} className="logout-btn">Logout</button>
            </div>
          ) : (
            <button onClick={() => setShowAdminLogin(true)} className="admin-login-btn">
              🔐 Admin Login
            </button>
          )}
        </div>
      </div>

      <div className="controls">
        <div className="stats">
          <span className="games-count">Total games: {data.length}</span>
          <span className="columns-count">Columns: {getColumnHeaders().length}</span>
        </div>
        <div className="actions">
          {isAdmin && (
            <button onClick={() => setShowAddModal(true)} className="add-btn">
              ➕ Add Game
            </button>
          )}
          <button onClick={exportToCSV} className="export-btn">
            📊 Export to CSV
          </button>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="empty-state">
          <p>No games found.</p>
          {isAdmin && (
            <button onClick={() => setShowAddModal(true)} className="add-btn">
              ➕ Add First Game
            </button>
          )}
        </div>
      ) : (
        <div className="table-container">
          <table className="games-table">
            <thead>
              <tr>
                {getColumnHeaders().map((header) => (
                  <th
                    key={header}
                    onClick={() => handleSort(header)}
                    className="sortable-header"
                  >
                    <div className="header-content">
                      <span className="header-text">{header}</span>
                      {getSortIcon(header)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedData.map((game, index) => (
                <tr key={game.id || index}>
                  {getColumnHeaders().map((header) => (
                    <td key={header}>
                      {game[header] !== null && game[header] !== undefined
                        ? String(game[header])
                        : ''}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={showAdminLogin}
        onClose={() => setShowAdminLogin(false)}
        onLogin={handleAdminLogin}
        isLoading={isLoading}
      />

      {/* Add Game Modal - Only shown when admin is logged in */}
      {isAdmin && (
        <AddGameModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAddGame={handleAddGame}
          isLoading={isAddingGame}
        />
      )}
    </div>
  );
};

export default App;