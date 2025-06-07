// =============================================================================
// HUSBAND'S GAMES DATABASE - MAIN APPLICATION COMPONENT
// =============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import config from './config';
import './App.css';

// =============================================================================
// ADMIN LOGIN MODAL COMPONENT
// =============================================================================

const AdminLoginModal = ({ isOpen, onClose, onLogin, isLoading }) => {
  const [credentials, setCredentials] = useState({
    username: 'admin',
    password: ''
  });

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
          <h3>Admin login</h3>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="form-group">
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

// =============================================================================
// ADD GAME MODAL COMPONENT
// =============================================================================

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
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              value={gameData.title}
              onChange={(e) => setGameData({ ...gameData, title: e.target.value })}
              required
              placeholder="Enter game title"
            />
          </div>

          <div className="form-group">
            <label>Platform</label>
            <input
              type="text"
              value={gameData.platform}
              onChange={(e) => setGameData({ ...gameData, platform: e.target.value })}
              placeholder="e.g., PS5, PC, Nintendo Switch, Xbox Series X"
            />
          </div>

          <div className="form-group">
            <label>Genre</label>
            <input
              type="text"
              value={gameData.genre}
              onChange={(e) => setGameData({ ...gameData, genre: e.target.value })}
              placeholder="e.g., Action, RPG, Strategy, Adventure"
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
              placeholder="e.g., 2023"
            />
          </div>

          <div className="form-group">
            <label>Price</label>
            <input
              type="number"
              step="0.01"
              value={gameData.price}
              onChange={(e) => setGameData({ ...gameData, price: e.target.value })}
              placeholder="e.g., 59.99"
            />
          </div>

          <div className="form-group">
            <label>Region</label>
            <input
              type="text"
              value={gameData.region}
              onChange={(e) => setGameData({ ...gameData, region: e.target.value })}
              placeholder="e.g., US, EU, JP, Worldwide"
            />
          </div>

          <div className="form-group">
            <label>Publisher</label>
            <input
              type="text"
              value={gameData.publisher}
              onChange={(e) => setGameData({ ...gameData, publisher: e.target.value })}
              placeholder="e.g., Nintendo, Sony, Microsoft, EA"
            />
          </div>

          <div className="form-group">
            <div className="checkbox-group">
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
            <button type="submit" disabled={isLoading} className="submit-btn">
              {isLoading ? 'Adding...' : 'Add Game'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// =============================================================================
// EDIT GAME MODAL COMPONENT
// =============================================================================

const EditGameModal = ({ isOpen, onClose, onEditGame, isLoading, gameToEdit }) => {
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

  useEffect(() => {
    if (gameToEdit) {
      setGameData({
        title: gameToEdit.title || '',
        platform: gameToEdit.platform || '',
        genre: gameToEdit.genre || '',
        release_year: gameToEdit.release_year ? String(gameToEdit.release_year) : '',
        price: gameToEdit.price ? String(gameToEdit.price) : '',
        region: gameToEdit.region || '',
        publisher: gameToEdit.publisher || '',
        opened: Boolean(gameToEdit.opened)
      });
    }
  }, [gameToEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const processedData = {
      ...gameData,
      id: gameToEdit.id,
      release_year: gameData.release_year ? parseInt(gameData.release_year) : null,
      price: gameData.price ? parseFloat(gameData.price) : null,
    };

    await onEditGame(processedData);
  };

  if (!isOpen || !gameToEdit) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Edit Game</h3>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="add-game-form">
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              value={gameData.title}
              onChange={(e) => setGameData({ ...gameData, title: e.target.value })}
              required
              placeholder="Enter game title"
            />
          </div>

          <div className="form-group">
            <label>Platform</label>
            <input
              type="text"
              value={gameData.platform}
              onChange={(e) => setGameData({ ...gameData, platform: e.target.value })}
              placeholder="e.g., PS5, PC, Nintendo Switch, Xbox Series X"
            />
          </div>

          <div className="form-group">
            <label>Genre</label>
            <input
              type="text"
              value={gameData.genre}
              onChange={(e) => setGameData({ ...gameData, genre: e.target.value })}
              placeholder="e.g., Action, RPG, Strategy, Adventure"
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
              placeholder="e.g., 2023"
            />
          </div>

          <div className="form-group">
            <label>Price</label>
            <input
              type="number"
              step="0.01"
              value={gameData.price}
              onChange={(e) => setGameData({ ...gameData, price: e.target.value })}
              placeholder="e.g., 59.99"
            />
          </div>

          <div className="form-group">
            <label>Region</label>
            <input
              type="text"
              value={gameData.region}
              onChange={(e) => setGameData({ ...gameData, region: e.target.value })}
              placeholder="e.g., US, EU, JP, Worldwide"
            />
          </div>

          <div className="form-group">
            <label>Publisher</label>
            <input
              type="text"
              value={gameData.publisher}
              onChange={(e) => setGameData({ ...gameData, publisher: e.target.value })}
              placeholder="e.g., Nintendo, Sony, Microsoft, EA"
            />
          </div>

          <div className="form-group">
            <div className="checkbox-group">
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
            <button type="submit" disabled={isLoading} className="submit-btn">
              {isLoading ? 'Updating...' : 'Update Game'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// =============================================================================
// MAIN APPLICATION COMPONENT
// =============================================================================

const App = () => {
  // Core data state
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc'
  });

  // Admin authentication state
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [adminToken, setAdminToken] = useState(null);

  // UI state for modals
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isAddingGame, setIsAddingGame] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isEditingGame, setIsEditingGame] = useState(false);
  const [gameToEdit, setGameToEdit] = useState(null);

  // Check for existing admin session on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('admin_token');
    const savedUser = localStorage.getItem('admin_user');

    if (savedToken && savedUser) {
      setAdminToken(savedToken);
      setAdminUser(JSON.parse(savedUser));
      setIsAdmin(true);
    }
  }, []);

  // Fetch games data on mount
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

  const calculateTotalPrice = () => {
    return data.reduce((total, game) => {
      const price = parseFloat(game.price) || 0;
      return total + price;
    }, 0);
  };

  const formatPrice = (price) => {
    return price.toFixed(2);
  };

  const handleAdminLogin = (authToken, userData) => {
    setAdminToken(authToken);
    setAdminUser(userData);
    setIsAdmin(true);
    localStorage.setItem('admin_token', authToken);
    localStorage.setItem('admin_user', JSON.stringify(userData));
  };

  const handleAdminLogout = () => {
    setAdminToken(null);
    setAdminUser(null);
    setIsAdmin(false);
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

  const handleEditGame = (game) => {
    setGameToEdit(game);
    setShowEditModal(true);
  };

  const handleUpdateGame = async (updatedGameData) => {
    setIsEditingGame(true);

    try {
      const response = await fetch(`${config.API_URL}/admin/games/${updatedGameData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
        body: JSON.stringify(updatedGameData),
      });

      if (!response.ok) {
        throw new Error('Failed to update game');
      }

      const updatedGame = await response.json();
      setData(data.map(game =>
        game.id === updatedGame.id ? updatedGame : game
      ));

      setShowEditModal(false);
      setGameToEdit(null);

    } catch (error) {
      console.error('Error updating game:', error);
      setError('Failed to update game. Please try again.');
    } finally {
      setIsEditingGame(false);
    }
  };

  const handleDeleteGame = async (gameId) => {
    if (!window.confirm('Are you sure you want to delete this game?')) {
      return;
    }

    try {
      const response = await fetch(`${config.API_URL}/admin/games/${gameId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete game');
      }

      setData(data.filter(game => game.id !== gameId));

    } catch (error) {
      console.error('Error deleting game:', error);
      setError('Failed to delete game. Please try again.');
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const formatCellValue = (header, value) => {
    if (header === 'price') {
      if (value === null || value === undefined || value === '') {
        return <span className="price-cell empty"></span>;
      }
      const price = parseFloat(value);
      if (isNaN(price)) {
        return <span className="price-cell empty"></span>;
      }

      // Split the price into dollar part and cents part for decimal alignment
      const formattedPrice = price.toFixed(2);
      const [dollarPart, centsPart] = formattedPrice.split('.');

      return (
        <span className="price-cell">
          <span className="price-dollars">${dollarPart}</span>
          <span className="price-cents">.{centsPart}</span>
        </span>
      );
    }
    return value !== null && value !== undefined ? String(value) : '';
  };

  const sortedData = useMemo(() => {
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
        <div className="top">
          <h1>Husband's Games</h1>
          <hr></hr>
          <p>A database of Husband's video game collection.  Husband can log in to perform CRUD operations.  Work in progress, stay tuned for more features and games.</p>
          <p>Click on the table headers to sort!</p>
        </div>
        <div className="right-side-container">
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
      </div>

      <div className="controls">
        <div className="stats">
          <span className="games-count">
            {data.length} Games shown | Total value: ${formatPrice(calculateTotalPrice())}
          </span>
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
        <div className={`table-container ${isAdmin ? 'admin-mode' : 'public-mode'}`}>
          <table className="games-table">
            <thead>
              <tr>
                {isAdmin && (
                  <th className="actions-header">
                    Actions
                  </th>
                )}

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
                  {isAdmin && (
                    <td className="actions-cell">
                      <button
                        className="edit-btn"
                        onClick={() => handleEditGame(game)}
                        title="Edit game"
                      >
                        ✏️
                      </button>
                      <button
                        className="delete-btn-small"
                        onClick={() => handleDeleteGame(game.id)}
                        title="Delete game"
                      >
                        🗑️
                      </button>
                    </td>
                  )}

                  {getColumnHeaders().map((header) => (
                    <td key={header}>
                      {formatCellValue(header, game[header])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AdminLoginModal
        isOpen={showAdminLogin}
        onClose={() => setShowAdminLogin(false)}
        onLogin={handleAdminLogin}
        isLoading={isLoading}
      />

      {isAdmin && (
        <AddGameModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAddGame={handleAddGame}
          isLoading={isAddingGame}
        />
      )}

      {isAdmin && (
        <EditGameModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setGameToEdit(null);
          }}
          onEditGame={handleUpdateGame}
          isLoading={isEditingGame}
          gameToEdit={gameToEdit}
        />
      )}
    </div>
  );
};

export default App;