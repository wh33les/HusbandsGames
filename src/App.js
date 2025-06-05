// =============================================================================
// HUSBAND'S GAMES DATABASE - MAIN APPLICATION COMPONENT
// =============================================================================
//
// This is the main React application for a games database management system.
// The app provides both public viewing and administrative functionality.
//
// MAIN FEATURES:
// - Public read-only access to games database
// - Admin authentication for CRUD operations
// - Sortable data table with responsive design
// - CSV export functionality
// - Modal-based forms for adding new games (FIXED: single-column layout)
// - Persistent admin sessions using localStorage
//
// ARCHITECTURE:
// - React functional components with hooks
// - RESTful API integration with backend
// - Component-based modular design
// - Responsive UI with custom CSS styling
//
// DEPENDENCIES:
// - React (hooks: useState, useEffect, useMemo)
// - Custom CSS file (App.css)
// - Configuration file (config.js) for API endpoints
// =============================================================================

import React, { useState, useEffect } from 'react';
import config from './config';  // Contains API_URL and other configuration
import './App.css'; // All styling for the application

// =============================================================================
// ADMIN LOGIN MODAL COMPONENT
// =============================================================================
//
// This component provides a secure login interface for administrators.
// It handles authentication via JWT tokens and manages login state.
//
// PROPS:
// - isOpen: Boolean controlling modal visibility
// - onClose: Function to close the modal
// - onLogin: Callback function when login succeeds (receives token & user data)
// - isLoading: Boolean indicating if login request is in progress
//
// FEATURES:
// - Form validation and error handling
// - JWT token-based authentication
// - Integration with backend login endpoint
// - User feedback during login process
// - COMPACT DESIGN: Uses compressed layout to fit small modal
// =============================================================================

const AdminLoginModal = ({ isOpen, onClose, onLogin, isLoading }) => {
  // Local state for form input values
  // Pre-fills username as 'admin' since this is a single-admin system
  const [credentials, setCredentials] = useState({
    username: 'admin',  // Fixed username for this application
    password: ''        // User must enter password
  });

  // State for displaying login error messages
  const [error, setError] = useState('');

  // Handle form submission and authentication
  const handleSubmit = async (e) => {
    e.preventDefault();  // Prevent default form submission behavior
    setError('');        // Clear any previous error messages

    try {
      // Send POST request to backend login endpoint
      const response = await fetch(`${config.API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',  // Specify JSON content type
        },
        body: JSON.stringify(credentials),     // Send credentials as JSON
      });

      // Check if login request was successful
      if (!response.ok) {
        throw new Error('Invalid admin credentials');
      }

      // Extract JWT token and user data from response
      const data = await response.json();

      // Call parent component's login handler with authentication data
      onLogin(data.access_token, data.user);

      // Close the modal after successful login
      onClose();

      // Reset form fields for next use
      setCredentials({ username: 'admin', password: '' });

    } catch (error) {
      // Display error message to user if login fails
      setError(error.message);
    }
  };

  // Don't render anything if modal should be closed
  if (!isOpen) return null;

  return (
    // Modal overlay covers entire screen with semi-transparent background
    <div className="modal-overlay">
      <div className="admin-login-modal">

        {/* COMPACT LOGIN MODAL: Minimal header, form, and help sections
            This modal uses compressed styling to fit in a small space */}

        {/* Commented out header for ultra-compact design - uncomment if needed
        <div className="modal-header">
          <h3>Admin Login</h3>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>
        */}
        <div className="modal-header">
          <h3>Admin login</h3>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>

        {/* Login form with minimal fields for compact design */}
        <form onSubmit={handleSubmit} className="admin-login-form">

          {/* Username field commented out since it's always 'admin'
          <div className="form-group">
            <label>Username:</label>
            <input
              type="text"
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              required
              readOnly  // Username is fixed as 'admin'
            />
          </div>
          */}

          {/* Password field for admin authentication */}
          <div className="form-group">
            {/*<label>Password:</label>*/}
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              placeholder="Enter admin password"
              required
            />
          </div>

          {/* Display error message if login fails */}
          {error && <div className="error-message">{error}</div>}

          {/* Modal action buttons - uses compact styling */}
          <div className="modal-actions">
            {/*<button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>*/}
            <button type="submit" disabled={isLoading} className="submit-btn">
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>

        {/* Help text explaining admin privileges */}
        <div className="login-help">
          <p><small>Admin login is required to add, edit, or delete games.</small></p>
        </div>
      </div >
    </div >
  );
};

// =============================================================================
// ADD GAME MODAL COMPONENT - COMPLETELY REWRITTEN FOR SINGLE COLUMN
// =============================================================================
//
// This component provides a form interface for administrators to add new games
// to the database. It includes all necessary fields for game information.
//
// PROPS:
// - isOpen: Boolean controlling modal visibility
// - onClose: Function to close the modal
// - onAddGame: Callback function to handle game creation
// - isLoading: Boolean indicating if add operation is in progress
//
// FEATURES:
// - Comprehensive form with all game attributes
// - Data validation and type conversion
// - Form reset after successful submission
// - Integration with backend API for game creation
// - FIXED: Single-column layout prevents field cutoff
// - FIXED: Larger modal size accommodates all content
// =============================================================================

const AddGameModal = ({ isOpen, onClose, onAddGame, isLoading }) => {
  // Local state for new game form data
  // Initializes all fields with empty/default values
  const [gameData, setGameData] = useState({
    title: '',           // Game title (required field)
    platform: '',        // Gaming platform (PS5, PC, Switch, etc.)
    genre: '',           // Game genre (Action, RPG, Strategy, etc.)
    release_year: '',    // Year the game was released
    price: '',           // Price of the game
    region: '',          // Region code (US, EU, JP, etc.)
    publisher: '',       // Game publisher/developer
    opened: false        // Boolean: has the game been opened/played
  });

  // Handle form submission and data processing
  const handleSubmit = async (e) => {
    e.preventDefault();  // Prevent default form submission

    // Process form data to convert string inputs to appropriate types
    const processedData = {
      ...gameData,
      // Convert release_year string to integer (or null if empty)
      release_year: gameData.release_year ? parseInt(gameData.release_year) : null,
      // Convert price string to float (or null if empty)
      price: gameData.price ? parseFloat(gameData.price) : null,
    };

    // Call parent component's add game function
    await onAddGame(processedData);

    // Reset form to initial state after successful submission
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

  // Don't render if modal should be closed
  if (!isOpen) return null;

  return (
    // Modal overlay and container
    <div className="modal-overlay">
      <div className="modal-content">

        {/* Modal header with title and close button */}
        <div className="modal-header">
          <h3>Add New Game</h3>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>

        {/* FIXED: Add game form with SINGLE-COLUMN layout
            All fields now stack vertically to prevent cutoff and ensure visibility */}
        <form onSubmit={handleSubmit} className="add-game-form">

          {/* SINGLE COLUMN LAYOUT: Each field gets its own row
              This prevents fields from being cut off or hidden */}

          {/* Game Title - Required field */}
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              value={gameData.title}
              onChange={(e) => setGameData({ ...gameData, title: e.target.value })}
              required  // This field is mandatory
              placeholder="Enter game title"
            />
          </div>

          {/* Gaming Platform */}
          <div className="form-group">
            <label>Platform</label>
            <input
              type="text"
              value={gameData.platform}
              onChange={(e) => setGameData({ ...gameData, platform: e.target.value })}
              placeholder="e.g., PS5, PC, Nintendo Switch, Xbox Series X"
            />
          </div>

          {/* Game Genre */}
          <div className="form-group">
            <label>Genre</label>
            <input
              type="text"
              value={gameData.genre}
              onChange={(e) => setGameData({ ...gameData, genre: e.target.value })}
              placeholder="e.g., Action, RPG, Strategy, Adventure"
            />
          </div>

          {/* Release Year */}
          <div className="form-group">
            <label>Release Year</label>
            <input
              type="number"
              value={gameData.release_year}
              onChange={(e) => setGameData({ ...gameData, release_year: e.target.value })}
              min="1970"    // Reasonable minimum year for video games
              max="2030"    // Reasonable maximum year for future releases
              placeholder="e.g., 2023"
            />
          </div>

          {/* Game Price */}
          <div className="form-group">
            <label>Price</label>
            <input
              type="number"
              step="0.01"   // Allow decimal values for currency
              value={gameData.price}
              onChange={(e) => setGameData({ ...gameData, price: e.target.value })}
              placeholder="e.g., 59.99"
            />
          </div>

          {/* Region Code */}
          <div className="form-group">
            <label>Region</label>
            <input
              type="text"
              value={gameData.region}
              onChange={(e) => setGameData({ ...gameData, region: e.target.value })}
              placeholder="e.g., US, EU, JP, Worldwide"
            />
          </div>

          {/* Publisher/Developer */}
          <div className="form-group">
            <label>Publisher</label>
            <input
              type="text"
              value={gameData.publisher}
              onChange={(e) => setGameData({ ...gameData, publisher: e.target.value })}
              placeholder="e.g., Nintendo, Sony, Microsoft, EA"
            />
          </div>

          {/* Opened/Played Status - Checkbox */}
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

          {/* Form action buttons - positioned at bottom */}
          <div className="modal-actions">
            {/*<button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>*/}
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
// MAIN APPLICATION COMPONENT
// =============================================================================
//
// This is the root component that orchestrates the entire application.
// It manages global state, handles API communications, and renders all UI.
//
// MAIN RESPONSIBILITIES:
// - Fetch and display games data from API
// - Handle user authentication and admin sessions
// - Manage sorting and filtering of games table
// - Coordinate modal dialogs and user interactions
// - Provide CSV export functionality
// - Handle error states and loading indicators
//
// STATE MANAGEMENT:
// - Uses React hooks for local state management
// - Persists admin session in localStorage
// - Manages UI state for modals and user interactions
// =============================================================================

const App = () => {
  // ==========================================================================
  // CORE DATA STATE
  // ==========================================================================

  // Main games data array fetched from the API
  const [data, setData] = useState([]);

  // Loading state for initial data fetch and other async operations
  const [isLoading, setIsLoading] = useState(true);

  // Error state for displaying error messages to users
  const [error, setError] = useState(null);

  // Sorting configuration for the games table
  // Tracks which column is sorted and in which direction
  const [sortConfig, setSortConfig] = useState({
    key: null,        // Column currently being sorted
    direction: 'asc'  // Sort direction: 'asc' or 'desc'
  });

  // ==========================================================================
  // ADMIN AUTHENTICATION STATE
  // ==========================================================================

  // Boolean indicating if current user has admin privileges
  const [isAdmin, setIsAdmin] = useState(false);

  // Admin user information (name, permissions, etc.)
  const [adminUser, setAdminUser] = useState(null);

  // JWT token for authenticating admin API requests
  const [adminToken, setAdminToken] = useState(null);

  // ==========================================================================
  // UI STATE FOR MODALS AND INTERACTIONS
  // ==========================================================================

  // Controls visibility of admin login modal
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  // Controls visibility of add game modal
  const [showAddModal, setShowAddModal] = useState(false);

  // Loading state specifically for add game operation
  const [isAddingGame, setIsAddingGame] = useState(false);

  // ==========================================================================
  // INITIALIZATION AND SESSION MANAGEMENT
  // ==========================================================================

  // Check for existing admin session on component mount
  // This allows admin users to stay logged in across browser sessions
  useEffect(() => {
    const savedToken = localStorage.getItem('admin_token');
    const savedUser = localStorage.getItem('admin_user');

    // If both token and user data exist in localStorage, restore admin session
    if (savedToken && savedUser) {
      setAdminToken(savedToken);
      setAdminUser(JSON.parse(savedUser));  // Parse JSON string back to object
      setIsAdmin(true);
    }
  }, []);  // Empty dependency array means this runs once on mount

  // Fetch games data when component mounts
  // This is the initial data load that populates the table
  useEffect(() => {
    fetchGames();
  }, []);  // Empty dependency array means this runs once on mount

  // ==========================================================================
  // API COMMUNICATION FUNCTIONS
  // ==========================================================================

  // Fetch games data from the public API endpoint
  // This function can be called by anyone (no authentication required)
  const fetchGames = async () => {
    const apiUrl = `${config.API_URL}/games/`;  // Public games endpoint

    setIsLoading(true);  // Show loading indicator

    try {
      // Make GET request to fetch games data
      const response = await fetch(apiUrl);

      // Check if request was successful
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Parse JSON response
      const gamesData = await response.json();

      // Update state with fetched data
      setData(gamesData);
      setError(null);  // Clear any previous errors

    } catch (error) {
      // Log error for debugging
      console.error('Error fetching data: ', error);

      // Set user-friendly error message
      setError('Failed to load games data. Please try again later.');

    } finally {
      // Always hide loading indicator when done
      setIsLoading(false);
    }
  };

  // ==========================================================================
  // ADMIN SESSION MANAGEMENT
  // ==========================================================================

  // Handle successful admin login
  // Called by AdminLoginModal when authentication succeeds
  const handleAdminLogin = (authToken, userData) => {
    // Update component state
    setAdminToken(authToken);
    setAdminUser(userData);
    setIsAdmin(true);

    // Persist session data in localStorage for future visits
    localStorage.setItem('admin_token', authToken);
    localStorage.setItem('admin_user', JSON.stringify(userData));
  };

  // Handle admin logout
  // Clears all admin session data and returns to public view
  const handleAdminLogout = () => {
    // Clear component state
    setAdminToken(null);
    setAdminUser(null);
    setIsAdmin(false);

    // Clear persisted session data
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
  };

  // ==========================================================================
  // GAME MANAGEMENT FUNCTIONS (ADMIN ONLY)
  // ==========================================================================

  // Add new game to the database
  // This function requires admin authentication
  const handleAddGame = async (gameData) => {
    setIsAddingGame(true);  // Show loading state in modal

    try {
      // Send POST request to admin endpoint with JWT authentication
      const response = await fetch(`${config.API_URL}/admin/games`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,  // JWT token for authentication
        },
        body: JSON.stringify(gameData),  // Send game data as JSON
      });

      // Check if request was successful
      if (!response.ok) {
        throw new Error('Failed to add game');
      }

      // Parse the newly created game from response
      const newGame = await response.json();

      // Add new game to local state (optimistic update)
      setData([...data, newGame]);

      // Close the add game modal
      setShowAddModal(false);

    } catch (error) {
      // Log error and show user-friendly message
      console.error('Error adding game:', error);
      setError('Failed to add game. Please try again.');

    } finally {
      // Always hide loading state when done
      setIsAddingGame(false);
    }
  };

  // ==========================================================================
  // TABLE SORTING FUNCTIONALITY
  // ==========================================================================

  // Handle column header clicks for sorting
  // Toggles between ascending, descending, and no sort
  const handleSort = (key) => {
    let direction = 'asc';  // Default to ascending

    // If clicking the same column that's already sorted ascending, switch to descending
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }

    // Update sort configuration
    setSortConfig({ key, direction });
  };

  // Create sorted version of data based on current sort configuration
  // Uses React.useMemo for performance optimization
  const sortedData = React.useMemo(() => {
    // If no sort is active, return original data
    if (!sortConfig.key) return data;

    // Create a sorted copy of the data array
    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      // Handle comparison of different data types
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;  // Values are equal
    });
  }, [data, sortConfig]);  // Recompute when data or sort config changes

  // ==========================================================================
  // DATA EXPORT FUNCTIONALITY
  // ==========================================================================

  // Export games data to CSV file
  // Creates a downloadable CSV file with all game information
  const exportToCSV = () => {
    // Don't export if there's no data
    if (!data.length) return;

    // Get all unique column headers from all games
    // This handles cases where different games might have different fields
    const allKeys = [...new Set(data.flatMap(item => Object.keys(item)))];

    // Create CSV header row
    const header = allKeys.join(',');

    // Create data rows, handling CSV special characters
    const rows = data.map((item) =>
      allKeys.map(key => {
        const value = item[key];

        // Handle strings that contain commas or quotes (CSV special characters)
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;  // Escape quotes and wrap in quotes
        }

        // Return value or empty string if null/undefined
        return value ?? '';
      }).join(',')
    );

    // Combine header and rows into complete CSV content
    const csvContent = [header, ...rows].join('\n');

    // Create downloadable blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `games_data_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();  // Trigger download
  };

  // ==========================================================================
  // UTILITY FUNCTIONS FOR UI RENDERING
  // ==========================================================================

  // Get column headers for table rendering
  // Returns array of all unique column names from the data
  const getColumnHeaders = () => {
    if (!data.length) return [];
    return [...new Set(data.flatMap(game => Object.keys(game)))];
  };

  // Get appropriate sort icon for column headers
  // Shows different arrows based on current sort state
  const getSortIcon = (columnKey) => {
    // If this column is not currently being sorted, show neutral icon
    if (sortConfig.key !== columnKey) {
      return <span className="sort-icon">↕️</span>;
    }

    // Show appropriate directional arrow based on sort direction
    return sortConfig.direction === 'asc' ?
      <span className="sort-icon active">↑</span> :
      <span className="sort-icon active">↓</span>;
  };

  // ==========================================================================
  // RENDER LOADING STATE
  // ==========================================================================

  // Show loading message while initial data is being fetched
  if (isLoading) {
    return (
      <div className="container">
        <h1>Husband's Games</h1>
        <div className="loading">Loading games...</div>
      </div>
    );
  }

  // ==========================================================================
  // RENDER ERROR STATE
  // ==========================================================================

  // Show error message and retry button if data fetch failed
  if (error) {
    return (
      <div className="container">
        <h1>Husband's Games</h1>
        <div className="error">{error}</div>
        <button onClick={fetchGames} className="retry-btn">Retry</button>
      </div>
    );
  }

  // ==========================================================================
  // RENDER MAIN APPLICATION UI
  // ==========================================================================

  return (
    <div className="container">

      {/* Application header with title and admin controls */}
      <div className="header">
        <h1>Husband's Games</h1>
        <div className="header-actions">
          {isAdmin ? (
            // Show admin info and logout button when logged in
            <div className="admin-info">
              <span>👤 {adminUser?.name}</span><p></p>
              <button onClick={handleAdminLogout} className="logout-btn">Logout</button>
            </div>
          ) : (
            // Show login button when not authenticated
            <button onClick={() => setShowAdminLogin(true)} className="admin-login-btn">
              🔐 Admin Login
            </button>
          )}
        </div>
      </div>

      {/* Controls section with statistics and action buttons */}
      <div className="controls">
        <div className="stats">
          <span className="games-count">{data.length} games shown</span>
          {/*<span className="columns-count">Columns: {getColumnHeaders().length}</span>*/}
        </div>
      </div>

      {/* Main content area - either empty state or data table */}
      {
        data.length === 0 ? (
          // Empty state when no games are in the database
          <div className="empty-state">
            <p>No games found.</p>
            {isAdmin && (
              <button onClick={() => setShowAddModal(true)} className="add-btn">
                ➕ Add First Game
              </button>
            )}
          </div>
        ) : (
          // Data table showing all games
          <div className="table-container">
            <table className="games-table">

              {/* Table header with sortable column headers */}
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

              {/* Table body with game data rows */}
              <tbody>
                {sortedData.map((game, index) => (
                  <tr key={game.id || index}>
                    {getColumnHeaders().map((header) => (
                      <td key={header}>
                        {/* Safely display game data, handling null/undefined values */}
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
        )
      }
      <div className="actions">
        {/* Export button - available to all users */}
        <button onClick={exportToCSV} className="export-btn">
          📊 Export to CSV
        </button>
        {/* Add Game button - only visible to admins */}
        {isAdmin && (
          <button onClick={() => setShowAddModal(true)} className="add-btn">
            ➕ Add Game
          </button>
        )}
      </div>

      {/* Admin Login Modal - always rendered but conditionally visible
          Uses compact design with minimal fields and tight spacing */}
      <AdminLoginModal
        isOpen={showAdminLogin}
        onClose={() => setShowAdminLogin(false)}
        onLogin={handleAdminLogin}
        isLoading={isLoading}
      />

      {/* Add Game Modal - only rendered when admin is logged in
          FIXED: Now uses single-column layout to prevent field cutoff */}
      {
        isAdmin && (
          <AddGameModal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            onAddGame={handleAddGame}
            isLoading={isAddingGame}
          />
        )
      }
    </div >
  );
};

// Export the main App component as the default export
// This allows other files to import and use this component
export default App;

// =============================================================================
// SUMMARY OF ADD GAME MODAL FIXES APPLIED
// =============================================================================
//
// PROBLEMS FIXED:
// ✅ FIXED: Fields getting cut off on the right
//    - Removed two-column layout (form-row with grid)
//    - All fields now use single-column layout
//    - Increased modal max-width from 350px to 450px
//
// ✅ FIXED: Two fields per white box reduced to one
//    - Eliminated form-row grid layout
//    - Each form-group now gets its own full row
//    - Fields stack vertically for better visibility
//
// ✅ FIXED: Fields disappearing when window gets bigger
//    - Proper responsive design with flexible modal sizing
//    - Modal adapts to content rather than forcing fixed layouts
//    - Consistent field visibility across all screen sizes
//
// ✅ FIXED: Submit button getting cut off
//    - Modal width increased to accommodate all content
//    - Button container uses proper flexbox layout
//    - Buttons positioned correctly at bottom of modal
//
// TECHNICAL CHANGES MADE:
// - Modal max-width: 350px → 450px (larger to fit content)
// - Form layout: CSS Grid 2-column → Single column block layout
// - Button layout: Improved spacing and positioning
// - Added better placeholders for user guidance
// - Maintained compact design for login modal
// - Ensured responsive behavior on mobile devices
//
// The Add Game modal now provides a much better user experience with
// all fields clearly visible and accessible on any screen size.
// =============================================================================