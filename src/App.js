// =============================================================================
// HUSBAND'S GAMES DATABASE - MAIN APPLICATION COMPONENT
// =============================================================================
// This is a complete React application for managing a video games database.
// Features include:
// - Public viewing of games in a sortable spreadsheet format
// - Admin authentication system for adding/deleting games
// - CSV export functionality
// - Responsive design that works on desktop and mobile
// - Integration with FastAPI backend and PostgreSQL database
// =============================================================================

import React, { useState, useEffect } from 'react';
import config from './config'; // Contains API_URL configuration
import './App.css'; // Styles for the entire application

// =============================================================================
// ADMIN LOGIN MODAL COMPONENT
// =============================================================================
// This modal allows administrators to log in and gain access to add/delete games.
// It appears when the "Admin Login" button is clicked.
// =============================================================================
const AdminLoginModal = ({ isOpen, onClose, onLogin, isLoading }) => {
  // Local state for login form - stores username and password
  const [credentials, setCredentials] = useState({
    username: 'admin',  // Pre-filled with admin username
    password: ''        // Password field starts empty
  });

  // Local state for error messages (like "Invalid credentials")
  const [error, setError] = useState('');

  // Handle form submission when user clicks "Login" button
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    setError('');       // Clear any previous error messages

    try {
      // Send login request to backend API
      const response = await fetch(`${config.API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Tell server we're sending JSON
        },
        body: JSON.stringify(credentials), // Convert credentials object to JSON string
      });

      // Check if login was successful
      if (!response.ok) {
        throw new Error('Invalid admin credentials');
      }

      // Parse the JSON response from the server
      const data = await response.json();

      // Call the parent component's login handler with the received token and user data
      onLogin(data.access_token, data.user);

      // Close the modal
      onClose();

      // Reset the password field for security
      setCredentials({ username: 'admin', password: '' });

    } catch (error) {
      // Display error message to user if login fails
      setError(error.message);
    }
  };

  // Don't render anything if modal should be closed
  if (!isOpen) return null;

  // Render the modal JSX
  return (
    <div className="modal-overlay"> {/* Dark background overlay */}
      <div className="admin-login-modal"> {/* The actual modal box */}

        {/* Modal header with title and close button */}
        <div className="modal-header">
          <h3>Admin Login</h3>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>

        {/* Login form */}
        <form onSubmit={handleSubmit} className="admin-login-form">

          {/* Username field (read-only, always "admin") */}
          <div className="form-group">
            <label>Username:</label>
            <input
              type="text"
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              required
              readOnly // User can't change this - it's always "admin"
            />
          </div>

          {/* Password field */}
          <div className="form-group">
            <label>Password:</label>
            <input
              type="password" // Hide password characters
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              placeholder="Enter admin password"
              required
            />
          </div>

          {/* Display error message if login fails */}
          {error && <div className="error-message">{error}</div>}

          {/* Modal action buttons */}
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className="submit-btn">
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>

        {/* Help text */}
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
// This modal allows admins to add new games to the database.
// It contains a form with all the game fields like title, platform, genre, etc.
// =============================================================================
const AddGameModal = ({ isOpen, onClose, onAddGame, isLoading }) => {
  // Local state for the new game form - contains all the game properties
  const [gameData, setGameData] = useState({
    title: '',           // Game title (required field)
    platform: '',        // Gaming platform (PS5, PC, Switch, etc.)
    genre: '',           // Game genre (Action, RPG, Strategy, etc.)
    release_year: '',    // Year the game was released
    price: '',           // Price paid for the game
    region: '',          // Game region (US, EU, JP, etc.)
    publisher: '',       // Game publisher/developer
    opened: false        // Whether the game has been opened/played
  });

  // Handle form submission when user clicks "Add Game"
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission

    // Process the form data - convert strings to appropriate data types
    const processedData = {
      ...gameData,
      // Convert release_year from string to integer (or null if empty)
      release_year: gameData.release_year ? parseInt(gameData.release_year) : null,
      // Convert price from string to float (or null if empty)
      price: gameData.price ? parseFloat(gameData.price) : null,
    };

    // Call the parent component's add game function
    await onAddGame(processedData);

    // Reset the form to empty values after successful submission
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

  // Don't render anything if modal should be closed
  if (!isOpen) return null;

  // Render the modal JSX
  return (
    <div className="modal-overlay"> {/* Dark background overlay */}
      <div className="modal-content"> {/* The actual modal box */}

        {/* Modal header with title and close button */}
        <div className="modal-header">
          <h3>Add New Game</h3>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>

        {/* Game addition form */}
        <form onSubmit={handleSubmit} className="add-game-form">

          {/* Row 1: Title and Platform */}
          <div className="form-row">
            <div className="form-group">
              <label>Title *</label> {/* Asterisk indicates required field */}
              <input
                type="text"
                value={gameData.title}
                onChange={(e) => setGameData({ ...gameData, title: e.target.value })}
                required // HTML5 validation - form won't submit if empty
              />
            </div>
            <div className="form-group">
              <label>Platform</label>
              <input
                type="text"
                value={gameData.platform}
                onChange={(e) => setGameData({ ...gameData, platform: e.target.value })}
                placeholder="e.g., PS5, PC, Switch" // Helper text for user
              />
            </div>
          </div>

          {/* Row 2: Genre and Release Year */}
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
                type="number" // Numeric input with up/down arrows
                value={gameData.release_year}
                onChange={(e) => setGameData({ ...gameData, release_year: e.target.value })}
                min="1970" // Earliest reasonable video game year
                max="2030" // Future games
              />
            </div>
          </div>

          {/* Row 3: Price and Region */}
          <div className="form-row">
            <div className="form-group">
              <label>Price</label>
              <input
                type="number"
                step="0.01" // Allow decimal places for cents
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

          {/* Row 4: Publisher and Opened checkbox */}
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

          {/* Modal action buttons */}
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

// =============================================================================
// MAIN APP COMPONENT
// =============================================================================
// This is the primary component that contains the entire application.
// It manages all state, handles API calls, and renders the game database table.
// =============================================================================
const App = () => {
  // =============================================================================
  // STATE MANAGEMENT
  // =============================================================================
  // React hooks for managing component state

  // Games data and UI state
  const [data, setData] = useState([]);                    // Array of all games from database
  const [isLoading, setIsLoading] = useState(true);        // Whether we're loading data
  const [error, setError] = useState(null);                // Error message if something goes wrong
  const [sortConfig, setSortConfig] = useState({           // Current sorting configuration
    key: null,      // Which column to sort by (null = no sorting)
    direction: 'asc' // Sort direction: 'asc' or 'desc'
  });

  // Admin authentication state
  const [isAdmin, setIsAdmin] = useState(false);           // Whether user is logged in as admin
  const [adminUser, setAdminUser] = useState(null);        // Admin user information
  const [adminToken, setAdminToken] = useState(null);      // JWT token for API authentication

  // Modal visibility state
  const [showAdminLogin, setShowAdminLogin] = useState(false);  // Whether to show login modal
  const [showAddModal, setShowAddModal] = useState(false);     // Whether to show add game modal
  const [isAddingGame, setIsAddingGame] = useState(false);     // Whether we're currently adding a game

  // =============================================================================
  // EFFECTS (RUN ON COMPONENT MOUNT/UPDATE)
  // =============================================================================

  // Check for existing admin token when component first loads
  useEffect(() => {
    // Try to get saved authentication data from browser's local storage
    const savedToken = localStorage.getItem('admin_token');
    const savedUser = localStorage.getItem('admin_user');

    // If both token and user data exist, log the admin back in automatically
    if (savedToken && savedUser) {
      setAdminToken(savedToken);
      setAdminUser(JSON.parse(savedUser)); // Convert JSON string back to object
      setIsAdmin(true);
    }
  }, []); // Empty dependency array = run only once when component mounts

  // Fetch games data when component loads
  useEffect(() => {
    fetchGames(); // Call the function to load games from API
  }, []); // Empty dependency array = run only once when component mounts

  // =============================================================================
  // API FUNCTIONS
  // =============================================================================

  // Function to fetch all games from the backend API
  const fetchGames = async () => {
    const apiUrl = `${config.API_URL}/games/`; // Construct full API URL

    setIsLoading(true); // Show loading indicator
    try {
      // Make HTTP GET request to fetch games
      const response = await fetch(apiUrl);

      // Check if request was successful
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Parse JSON response
      const gamesData = await response.json();

      // Debug logging to console (can be removed in production)
      console.log('Raw data from API:', gamesData);
      console.log('First game object:', gamesData[0]);
      console.log('All keys in first game:', Object.keys(gamesData[0] || {}));

      // Update state with fetched data
      setData(gamesData);
      setError(null); // Clear any previous errors

    } catch (error) {
      // Handle errors (network issues, API errors, etc.)
      console.error('Error fetching data: ', error);
      setError('Failed to load games data. Please try again later.');
    } finally {
      // Always hide loading indicator, regardless of success or failure
      setIsLoading(false);
    }
  };

  // =============================================================================
  // AUTHENTICATION FUNCTIONS
  // =============================================================================

  // Handle successful admin login
  const handleAdminLogin = (authToken, userData) => {
    // Update component state
    setAdminToken(authToken);
    setAdminUser(userData);
    setIsAdmin(true);

    // Save authentication data to browser's local storage for persistence
    localStorage.setItem('admin_token', authToken);
    localStorage.setItem('admin_user', JSON.stringify(userData));
  };

  // Handle admin logout
  const handleAdminLogout = () => {
    // Clear component state
    setAdminToken(null);
    setAdminUser(null);
    setIsAdmin(false);

    // Remove authentication data from local storage
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
  };

  // =============================================================================
  // GAME MANAGEMENT FUNCTIONS
  // =============================================================================

  // Function to add a new game to the database
  const handleAddGame = async (gameData) => {
    setIsAddingGame(true); // Show loading state on add button
    try {
      // Send POST request to add new game
      const response = await fetch(`${config.API_URL}/admin/games`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`, // Include admin token for authentication
        },
        body: JSON.stringify(gameData), // Convert game data to JSON
      });

      // Check if request was successful
      if (!response.ok) {
        throw new Error('Failed to add game');
      }

      // Parse the newly created game from response
      const newGame = await response.json();

      // Add the new game to the local state (so UI updates immediately)
      setData([...data, newGame]);

      // Close the add game modal
      setShowAddModal(false);

    } catch (error) {
      // Handle errors
      console.error('Error adding game:', error);
      setError('Failed to add game. Please try again.');
    } finally {
      // Hide loading state
      setIsAddingGame(false);
    }
  };

  // Function to delete a game from the database
  const handleDeleteGame = async (gameId, gameTitle) => {
    // Show confirmation dialog to prevent accidental deletions
    if (!window.confirm(`Are you sure you want to delete "${gameTitle}"? This action cannot be undone.`)) {
      return; // User cancelled, don't delete
    }

    try {
      // Send DELETE request to remove game
      const response = await fetch(`${config.API_URL}/admin/games/${gameId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`, // Include admin token for authentication
        },
      });

      // Check if request was successful
      if (!response.ok) {
        throw new Error('Failed to delete game');
      }

      // Remove the game from local state (so UI updates immediately)
      setData(data.filter(game => game.id !== gameId));

    } catch (error) {
      // Handle errors
      console.error('Error deleting game:', error);
      setError('Failed to delete game. Please try again.');
    }
  };

  // =============================================================================
  // TABLE FUNCTIONALITY
  // =============================================================================

  // Function to handle column header clicks for sorting
  const handleSort = (key) => {
    let direction = 'asc'; // Default to ascending

    // If clicking the same column that's already sorted ascending, switch to descending
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }

    // Update sort configuration
    setSortConfig({ key, direction });
  };

  // Memoized computation of sorted data
  // useMemo prevents re-sorting on every render - only when data or sortConfig changes
  const sortedData = React.useMemo(() => {
    // If no sort column is selected, return data as-is
    if (!sortConfig.key) return data;

    // Create a copy of the data array and sort it
    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key]; // Value from first item
      const bValue = b[sortConfig.key]; // Value from second item

      // Compare values and return sort order
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0; // Values are equal
    });
  }, [data, sortConfig]); // Only recalculate when data or sortConfig changes

  // =============================================================================
  // EXPORT FUNCTIONALITY
  // =============================================================================

  // Function to export all games data to CSV file
  const exportToCSV = () => {
    // Don't export if there's no data
    if (!data.length) return;

    // Get all unique column names from all games (in case some games have different fields)
    const allKeys = [...new Set(data.flatMap(item => Object.keys(item)))];

    // Create CSV header row
    const header = allKeys.join(',');

    // Create CSV data rows
    const rows = data.map((item) =>
      allKeys.map(key => {
        const value = item[key];
        // Handle values that contain commas or quotes (escape them for CSV format)
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? ''; // Use empty string for null/undefined values
      }).join(',')
    );

    // Combine header and rows into complete CSV content
    const csvContent = [header, ...rows].join('\n');

    // Create downloadable file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `games_data_${new Date().toISOString().split('T')[0]}.csv`; // Include today's date in filename
    link.click(); // Trigger download
  };

  // =============================================================================
  // UTILITY FUNCTIONS
  // =============================================================================

  // Get all column headers from the data
  const getColumnHeaders = () => {
    if (!data.length) return []; // No data, no columns

    // Get all unique property names from all games
    const allKeys = [...new Set(data.flatMap(game => Object.keys(game)))];
    console.log('All column headers found:', allKeys); // Debug logging
    return allKeys;
  };

  // Get the appropriate sort icon for a column header
  const getSortIcon = (columnKey) => {
    // If this column isn't being sorted, show neutral icon
    if (sortConfig.key !== columnKey) {
      return <span className="sort-icon">↕️</span>;
    }
    // Show up or down arrow based on sort direction
    return sortConfig.direction === 'asc' ?
      <span className="sort-icon active">↑</span> :
      <span className="sort-icon active">↓</span>;
  };

  // =============================================================================
  // CONDITIONAL RENDERING
  // =============================================================================
  // Show different content based on application state

  // Show loading screen while fetching data
  if (isLoading) {
    return (
      <div className="container">
        <h1>Husband's Games</h1>
        <div className="loading">Loading games...</div>
      </div>
    );
  }

  // Show error screen if something went wrong
  if (error) {
    return (
      <div className="container">
        <h1>Husband's Games</h1>
        <div className="error">{error}</div>
        <button onClick={fetchGames} className="retry-btn">Retry</button>
      </div>
    );
  }

  // =============================================================================
  // MAIN APPLICATION RENDER
  // =============================================================================
  // Render the complete application interface

  return (
    <div className="container">

      {/* Header section with title and admin controls */}
      <div className="header">
        <h1>Husband's Games</h1>
        <div className="header-actions">
          {isAdmin ? (
            // If logged in as admin, show user info and logout button
            <div className="admin-info">
              <span>👤 {adminUser?.name}</span>
              <button onClick={handleAdminLogout} className="logout-btn">Logout</button>
            </div>
          ) : (
            // If not logged in, show admin login button
            <button onClick={() => setShowAdminLogin(true)} className="admin-login-btn">
              🔐 Admin Login
            </button>
          )}
        </div>
      </div>

      {/* Controls section with stats and action buttons */}
      <div className="controls">
        <div className="stats">
          <span className="games-count">Total games: {data.length}</span>
          <span className="columns-count">Columns: {getColumnHeaders().length}</span>
        </div>
        <div className="actions">
          {/* Only show "Add Game" button if user is admin */}
          {isAdmin && (
            <button onClick={() => setShowAddModal(true)} className="add-btn">
              ➕ Add Game
            </button>
          )}
          {/* CSV export is available to everyone */}
          <button onClick={exportToCSV} className="export-btn">
            📊 Export to CSV
          </button>
        </div>
      </div>

      {/* Main content area */}
      {data.length === 0 ? (
        // Show empty state if no games exist
        <div className="empty-state">
          <p>No games found.</p>
          {isAdmin && (
            <button onClick={() => setShowAddModal(true)} className="add-btn">
              ➕ Add First Game
            </button>
          )}
        </div>
      ) : (
        // Show games table if data exists
        <div className="table-container">
          <table className="games-table">

            {/* Table header with sortable column headers */}
            <thead>
              <tr>
                {/* Generate a header for each column */}
                {getColumnHeaders().map((header) => (
                  <th
                    key={header}
                    onClick={() => handleSort(header)} // Make header clickable for sorting
                    className="sortable-header"
                  >
                    <div className="header-content">
                      <span className="header-text">{header}</span>
                      {getSortIcon(header)} {/* Show sort direction indicator */}
                    </div>
                  </th>
                ))}
                {/* Add Actions column header if user is admin */}
                {isAdmin && (
                  <th className="actions-header">
                    Actions
                  </th>
                )}
              </tr>
            </thead>

            {/* Table body with game data */}
            <tbody>
              {/* Generate a row for each game */}
              {sortedData.map((game, index) => (
                <tr key={game.id || index}>
                  {/* Generate a cell for each column */}
                  {getColumnHeaders().map((header) => (
                    <td key={header}>
                      {/* Display the game's value for this column, or empty string if null/undefined */}
                      {game[header] !== null && game[header] !== undefined
                        ? String(game[header])  // Convert to string for display
                        : ''}
                    </td>
                  ))}
                  {/* Add Actions column if user is admin */}
                  {isAdmin && (
                    <td className="actions-column">
                      <button
                        onClick={() => handleDeleteGame(game.id, game.title)}
                        className="delete-btn"
                        title="Delete game" // Tooltip text
                      >
                        🗑️
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL COMPONENTS */}
      {/* These are conditionally rendered based on state */}

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={showAdminLogin}                    // Whether to show the modal
        onClose={() => setShowAdminLogin(false)}   // Function to close the modal
        onLogin={handleAdminLogin}                 // Function to handle successful login
        isLoading={isLoading}                      // Whether login is in progress
      />

      {/* Add Game Modal - Only rendered when admin is logged in */}
      {isAdmin && (
        <AddGameModal
          isOpen={showAddModal}                      // Whether to show the modal
          onClose={() => setShowAddModal(false)}     // Function to close the modal
          onAddGame={handleAddGame}                  // Function to handle adding a game
          isLoading={isAddingGame}                   // Whether game addition is in progress
        />
      )}
    </div>
  );
};

// Export the App component as the default export
// This allows other files to import this component
export default App;