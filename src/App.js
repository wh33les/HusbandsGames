// =============================================================================
<<<<<<< HEAD
// HUSBAND'S GAMES DATABASE - MAIN APPLICATION COMPONENT
// =============================================================================

import React, { useState, useEffect, useMemo } from 'react';
=======
// HUSBAND'S GAMES DATABASE - MAIN APPLICATION COMPONENT WITH FULL CRUD
// =============================================================================

import React, { useState, useEffect } from 'react';
>>>>>>> d2bc7a675be16e7fec30ddba2f86dcac4ba23568
import config from './config';
import './App.css';

// =============================================================================
// ADMIN LOGIN MODAL COMPONENT (UNCHANGED)
// =============================================================================
<<<<<<< HEAD

=======
>>>>>>> d2bc7a675be16e7fec30ddba2f86dcac4ba23568
const AdminLoginModal = ({ isOpen, onClose, onLogin, isLoading }) => {
  const [credentials, setCredentials] = useState({
    username: 'admin',
    password: ''
  });
<<<<<<< HEAD

=======
>>>>>>> d2bc7a675be16e7fec30ddba2f86dcac4ba23568
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
<<<<<<< HEAD
// ADD GAME MODAL COMPONENT
// =============================================================================

const AddGameModal = ({ isOpen, onClose, onAddGame, isLoading }) => {
=======
// GAME MODAL COMPONENT - HANDLES BOTH ADD AND EDIT
// =============================================================================
const GameModal = ({ isOpen, onClose, onSaveGame, isLoading, editingGame }) => {
>>>>>>> d2bc7a675be16e7fec30ddba2f86dcac4ba23568
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

<<<<<<< HEAD
  const handleSubmit = async (e) => {
    e.preventDefault();

    const processedData = {
      ...gameData,
=======
  // Initialize form with editing game data when modal opens
  useEffect(() => {
    if (editingGame) {
      setGameData({
        title: editingGame.title || '',
        platform: editingGame.platform || '',
        genre: editingGame.genre || '',
        release_year: editingGame.release_year ? String(editingGame.release_year) : '',
        price: editingGame.price ? String(editingGame.price) : '',
        region: editingGame.region || '',
        publisher: editingGame.publisher || '',
        opened: Boolean(editingGame.opened)
      });
    } else {
      // Reset form for adding new game
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
    }
  }, [editingGame, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('Form data before processing:', gameData);

    const processedData = {
      title: gameData.title.trim(),
      platform: gameData.platform.trim(),
      genre: gameData.genre.trim(),
>>>>>>> d2bc7a675be16e7fec30ddba2f86dcac4ba23568
      release_year: gameData.release_year ? parseInt(gameData.release_year) : null,
      price: gameData.price ? parseFloat(gameData.price) : null,
      region: gameData.region.trim(),
      publisher: gameData.publisher.trim(),
      opened: Boolean(gameData.opened),
    };

<<<<<<< HEAD
    await onAddGame(processedData);

=======
    // Include ID if editing
    if (editingGame) {
      processedData.id = editingGame.id;
    }

    console.log('Processed data being sent to handleSaveGame:', processedData);

    await onSaveGame(processedData);

    // Reset form after successful submission
>>>>>>> d2bc7a675be16e7fec30ddba2f86dcac4ba23568
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
          <h3>{editingGame ? 'Edit Game' : 'Add New Game'}</h3>
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
              {isLoading ? (editingGame ? 'Updating...' : 'Adding...') : (editingGame ? 'Update Game' : 'Add Game')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// =============================================================================
<<<<<<< HEAD
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
=======
// DELETE CONFIRMATION MODAL
>>>>>>> d2bc7a675be16e7fec30ddba2f86dcac4ba23568
// =============================================================================
const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, gameName, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="admin-login-modal"> {/* Reusing compact modal styling */}
        <div className="modal-header">
          <h3>Delete Game</h3>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>

        <div className="delete-content">
          <p>Are you sure you want to delete "<strong>{gameName}</strong>"?</p>
          <p><small>This action cannot be undone.</small></p>
        </div>

        <div className="modal-actions">
          <button onClick={onClose} className="cancel-btn" disabled={isLoading}>
            Cancel
          </button>
          <button onClick={onConfirm} className="delete-btn" disabled={isLoading}>
            {isLoading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// MAIN APPLICATION COMPONENT WITH FULL CRUD
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

<<<<<<< HEAD
  // UI state for modals
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isAddingGame, setIsAddingGame] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isEditingGame, setIsEditingGame] = useState(false);
  const [gameToEdit, setGameToEdit] = useState(null);

  // Check for existing admin session on mount
=======
  // UI state for modals and interactions
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showGameModal, setShowGameModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isSavingGame, setIsSavingGame] = useState(false);
  const [isDeletingGame, setIsDeletingGame] = useState(false);

  // State for editing/deleting operations
  const [editingGame, setEditingGame] = useState(null);
  const [deletingGame, setDeletingGame] = useState(null);

  // Initialization
>>>>>>> d2bc7a675be16e7fec30ddba2f86dcac4ba23568
  useEffect(() => {
    const savedToken = localStorage.getItem('admin_token');
    const savedUser = localStorage.getItem('admin_user');

    if (savedToken && savedUser) {
      setAdminToken(savedToken);
      setAdminUser(JSON.parse(savedUser));
      setIsAdmin(true);
    }
  }, []);

<<<<<<< HEAD
  // Fetch games data on mount
=======
>>>>>>> d2bc7a675be16e7fec30ddba2f86dcac4ba23568
  useEffect(() => {
    fetchGames();
  }, []);

<<<<<<< HEAD
=======
  // API functions
>>>>>>> d2bc7a675be16e7fec30ddba2f86dcac4ba23568
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

<<<<<<< HEAD
  const calculateTotalPrice = () => {
    return data.reduce((total, game) => {
      const price = parseFloat(game.price) || 0;
      return total + price;
    }, 0);
  };

  const formatPrice = (price) => {
    return price.toFixed(2);
  };

=======
  // Admin session management
>>>>>>> d2bc7a675be16e7fec30ddba2f86dcac4ba23568
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

<<<<<<< HEAD
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

=======
  // CRUD operations
  const handleSaveGame = async (gameData) => {
    setIsSavingGame(true);

    try {
      const isEditing = gameData.id;

      if (isEditing) {
        // For editing, find the original game
        const originalGame = data.find(game => game.id === gameData.id);
        console.log('Original game data:', originalGame);
        console.log('Form data received:', gameData);

        // Create data to send - only include fields that have actual values
        const dataToSend = {};

        // Always include fields that have values, preserve original if form field is empty
        dataToSend.title = gameData.title || originalGame.title;
        dataToSend.platform = gameData.platform || originalGame.platform;
        dataToSend.genre = gameData.genre || originalGame.genre;
        dataToSend.release_year = gameData.release_year !== null ? gameData.release_year : originalGame.release_year;
        dataToSend.price = gameData.price !== null ? gameData.price : originalGame.price;
        dataToSend.region = gameData.region || originalGame.region;
        dataToSend.publisher = gameData.publisher || originalGame.publisher;
        dataToSend.opened = gameData.opened;

        console.log('Data being sent to server:', dataToSend);

        const response = await fetch(`${config.API_URL}/admin/games/${gameData.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`,
          },
          body: JSON.stringify(dataToSend),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Server error response:', errorText);
          throw new Error(`Failed to update game: ${response.status} - ${errorText}`);
        }

        const savedGame = await response.json();
        console.log('Server returned:', savedGame);

        // Update local state with server response
        setData(data.map(game => game.id === savedGame.id ? savedGame : game));

      } else {
        // For new games
        const dataToSend = { ...gameData };
        delete dataToSend.id;

        console.log('Creating new game:', dataToSend);

        const response = await fetch(`${config.API_URL}/admin/games`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`,
          },
          body: JSON.stringify(dataToSend),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Server error response:', errorText);
          throw new Error(`Failed to add game: ${response.status} - ${errorText}`);
        }

        const savedGame = await response.json();
        console.log('New game created:', savedGame);

        // Add new game to local state
        setData([...data, savedGame]);
      }

      setShowGameModal(false);
      setEditingGame(null);

    } catch (error) {
      console.error('Error saving game:', error);
      setError(`Failed to ${gameData.id ? 'update' : 'add'} game: ${error.message}`);
    } finally {
      setIsSavingGame(false);
    }
  };

  const handleDeleteGame = async () => {
    if (!deletingGame) return;

    setIsDeletingGame(true);

    try {
      const response = await fetch(`${config.API_URL}/admin/games/${deletingGame.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete game');
      }

      // Remove game from local state
      setData(data.filter(game => game.id !== deletingGame.id));
      setShowDeleteModal(false);
      setDeletingGame(null);

    } catch (error) {
      console.error('Error deleting game:', error);
      setError('Failed to delete game. Please try again.');
    } finally {
      setIsDeletingGame(false);
    }
  };

  // UI handlers
  const handleEditGame = (game) => {
    setEditingGame(game);
    setShowGameModal(true);
  };

  const handleDeleteClick = (game) => {
    setDeletingGame(game);
    setShowDeleteModal(true);
  };

  const handleAddGame = () => {
    setEditingGame(null);
    setShowGameModal(true);
  };

  // Table sorting
>>>>>>> d2bc7a675be16e7fec30ddba2f86dcac4ba23568
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

<<<<<<< HEAD
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
=======
  const sortedData = React.useMemo(() => {
>>>>>>> d2bc7a675be16e7fec30ddba2f86dcac4ba23568
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

<<<<<<< HEAD
=======
  // CSV export
>>>>>>> d2bc7a675be16e7fec30ddba2f86dcac4ba23568
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

<<<<<<< HEAD
=======
  // Utility functions
>>>>>>> d2bc7a675be16e7fec30ddba2f86dcac4ba23568
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

<<<<<<< HEAD
=======
  // Render loading state
>>>>>>> d2bc7a675be16e7fec30ddba2f86dcac4ba23568
  if (isLoading) {
    return (
      <div className="container">
        <h1>Husband's Games</h1>
        <div className="loading">Loading games...</div>
      </div>
    );
  }

<<<<<<< HEAD
=======
  // Render error state
>>>>>>> d2bc7a675be16e7fec30ddba2f86dcac4ba23568
  if (error) {
    return (
      <div className="container">
        <h1>Husband's Games</h1>
        <div className="error">{error}</div>
        <button onClick={fetchGames} className="retry-btn">Retry</button>
      </div>
    );
  }

<<<<<<< HEAD
=======
  // Render main application
>>>>>>> d2bc7a675be16e7fec30ddba2f86dcac4ba23568
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
              <button onClick={handleAddGame} className="add-btn">
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
<<<<<<< HEAD
          <span className="games-count">
            {data.length} Games shown | Total value: ${formatPrice(calculateTotalPrice())}
          </span>
=======
          <span className="games-count">{data.length} games shown</span>
>>>>>>> d2bc7a675be16e7fec30ddba2f86dcac4ba23568
        </div>
      </div>

      {data.length === 0 ? (
        <div className="empty-state">
          <p>No games found.</p>
          {isAdmin && (
<<<<<<< HEAD
            <button onClick={() => setShowAddModal(true)} className="add-btn">
=======
            <button onClick={handleAddGame} className="add-btn">
>>>>>>> d2bc7a675be16e7fec30ddba2f86dcac4ba23568
              ➕ Add First Game
            </button>
          )}
        </div>
      ) : (
<<<<<<< HEAD
        <div className={`table-container ${isAdmin ? 'admin-mode' : 'public-mode'}`}>
          <table className="games-table">
            <thead>
              <tr>
                {isAdmin && (
                  <th className="actions-header">
                    Actions
                  </th>
                )}

=======
        <div className="table-container">
          <table className={`games-table ${isAdmin ? 'admin-mode' : 'public-mode'}`}>
            <thead>
              <tr>
                {isAdmin && (
                  <th className="actions-header">Actions</th>
                )}
>>>>>>> d2bc7a675be16e7fec30ddba2f86dcac4ba23568
                {getColumnHeaders().map((header) => (
                  <th
                    key={header}
                    onClick={() => handleSort(header)}
                    className="sortable-header"
                  >
                    <div className="header-content">
                      <span className="header-text">{header}</span>
<<<<<<< HEAD
                      {getSortIcon(header)}
=======
                      {/*{getSortIcon(header)}*/}
>>>>>>> d2bc7a675be16e7fec30ddba2f86dcac4ba23568
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
<<<<<<< HEAD

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
=======

            <tbody>
              {sortedData.map((game, index) => (
                <tr key={game.id || index}>
                  {isAdmin && (
                    <td className="actions-cell">
                      <button
                        onClick={() => handleEditGame(game)}
                        className="edit-btn"
                        title="Edit game"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteClick(game)}
                        className="delete-btn-small"
                        title="Delete game"
                      >
                        🗑️
                      </button>
                    </td>
                  )}
                  {getColumnHeaders().map((header) => (
                    <td key={header}>
                      {game[header] !== null && game[header] !== undefined
                        ? String(game[header])
                        : ''}
>>>>>>> d2bc7a675be16e7fec30ddba2f86dcac4ba23568
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

<<<<<<< HEAD
=======
      {/* Modals */}
>>>>>>> d2bc7a675be16e7fec30ddba2f86dcac4ba23568
      <AdminLoginModal
        isOpen={showAdminLogin}
        onClose={() => setShowAdminLogin(false)}
        onLogin={handleAdminLogin}
        isLoading={isLoading}
      />

      {isAdmin && (
<<<<<<< HEAD
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
=======
        <>
          <GameModal
            isOpen={showGameModal}
            onClose={() => {
              setShowGameModal(false);
              setEditingGame(null);
            }}
            onSaveGame={handleSaveGame}
            isLoading={isSavingGame}
            editingGame={editingGame}
          />

          <DeleteConfirmModal
            isOpen={showDeleteModal}
            onClose={() => {
              setShowDeleteModal(false);
              setDeletingGame(null);
            }}
            onConfirm={handleDeleteGame}
            gameName={deletingGame?.title}
            isLoading={isDeletingGame}
          />
        </>
>>>>>>> d2bc7a675be16e7fec30ddba2f86dcac4ba23568
      )}
    </div>
  );
};

export default App;