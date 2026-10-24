import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const dropdownRef = useRef(null);

  // Get logged-in user from localStorage
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Live stats state populated from the MySQL database
  const [stats, setStats] = useState({
    wins: 0,
    losses: 0,
    totalGames: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);

  // Enforce login check & block access via browser Back arrow after logout
  useEffect(() => {
    const checkAuth = () => {
      const currentUser = localStorage.getItem('user');
      if (!currentUser) {
        setUser(null);
        navigate('/', { replace: true });
      } else {
        setUser(JSON.parse(currentUser));
      }
    };

    checkAuth();
    window.addEventListener('pageshow', checkAuth);
    window.addEventListener('popstate', checkAuth);

    return () => {
      window.removeEventListener('pageshow', checkAuth);
      window.removeEventListener('popstate', checkAuth);
    };
  }, [navigate]);

  // Fetch real analyzed stats from FastAPI + MySQL database
  useEffect(() => {
    if (!user?.id) return;

    const fetchUserStats = async () => {
      try {
        setLoadingStats(true);
        const response = await fetch(`http://127.0.0.1:8000/users/${user.id}/stats`);
        if (response.ok) {
          const data = await response.json();
          setStats({
            wins: data.wins,
            losses: data.losses,
            totalGames: data.total_games
          });
        }
      } catch (error) {
        console.error('Failed to fetch stats from database:', error);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchUserStats();
  }, [user?.id]);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Logout and replace history entry so back button cannot return here
  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/', { replace: true });
  };

  // Generate random 6-character room code for friend match
  const handleOpenRoomModal = () => {
    const generated = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomCode(generated);
    setShowRoomModal(true);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    alert(`Room Code ${roomCode} copied! Share it with your friend.`);
  };

  if (!user) return null;

  return (
    <div className="dashboard-page">
      {/* 3D Glass Chess Background */}
      <div className="bg-3d-scene">
        <div className="bg-chessboard-tilt">
          <div className="glowing-ambient-light"></div>
          <div className="ambient-particles"></div>
        </div>
      </div>

      {/* Top Navigation Bar */}
      <header className="dashboard-nav">
        <div className="nav-brand">
          <span className="brand-crown">♔</span>
          <span>GLASS CHESS 3D</span>
        </div>

        {/* Profile Icon & Dropdown */}
        <div className="profile-wrapper" ref={dropdownRef}>
          <div 
            className="profile-trigger" 
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <span className="username-label">{user.username}</span>
            <div className="profile-avatar">👤</div>
          </div>

          {showDropdown && (
            <div className="profile-dropdown glass-panel">
              <div className="dropdown-header">
                <strong>{user.username}</strong>
                <span>Online</span>
              </div>
              <hr className="dropdown-divider" />
              <button 
                className="dropdown-item" 
                onClick={() => {
                  setShowDropdown(false);
                  alert('Settings panel coming soon!');
                }}
              >
                ⚙️ Settings
              </button>
              <button 
                className="dropdown-item logout-item" 
                onClick={handleLogout}
              >
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Dashboard Body */}
      <main className="dashboard-container">
        
        {/* Welcome Banner */}
        <section className="welcome-section glass-panel">
          <div>
            <h1>Welcome back, <span className="highlight">{user.username}</span>!</h1>
            <p>Ready for your next 3D glass chess match?</p>
          </div>
          <div className="banner-piece">♕</div>
        </section>

        {/* Stats Row: Live Data from MySQL Database */}
        <section className="stats-grid">
          <div className="stat-card glass-panel">
            <div className="stat-icon win-bg">🏆</div>
            <div className="stat-info">
              <h3>Total Wins</h3>
              <p className="stat-value win-text">
                {loadingStats ? '...' : stats.wins}
              </p>
            </div>
          </div>

          <div className="stat-card glass-panel">
            <div className="stat-icon loss-bg">⚔️</div>
            <div className="stat-info">
              <h3>Total Loss</h3>
              <p className="stat-value loss-text">
                {loadingStats ? '...' : stats.losses}
              </p>
            </div>
          </div>

          <div className="stat-card glass-panel">
            <div className="stat-icon total-bg">📊</div>
            <div className="stat-info">
              <h3>Total Games</h3>
              <p className="stat-value total-text">
                {loadingStats ? '...' : stats.totalGames}
              </p>
            </div>
          </div>
        </section>

        {/* Game Modes Row: Computer vs You & Create Room */}
        <section className="modes-grid">
          
          {/* Mode 1: Computer vs You */}
          <div className="mode-card glass-panel" onClick={() => navigate('/game?mode=computer')}>
            <div className="mode-orb">🤖</div>
            <h2>Computer vs You</h2>
            <p>Challenge the AI chess engine and sharpen your grandmaster strategies.</p>
            <button className="mode-btn">Play vs Computer</button>
          </div>

          {/* Mode 2: Create Room (You + Your Friend) */}
          <div className="mode-card glass-panel" onClick={handleOpenRoomModal}>
            <div className="mode-orb">👥</div>
            <h2>Create Room</h2>
            <p>You + Your Friend! Create a private glass table or join a friend's room code.</p>
            <button className="mode-btn friend-btn">Play with Friend</button>
          </div>

        </section>
      </main>

      {/* Create / Join Room Modal (You + Your Friend) */}
      {showRoomModal && (
        <div className="modal-overlay" onClick={() => setShowRoomModal(false)}>
          <div className="room-modal glass-panel" onClick={(e) => e.stopPropagation()}>
            <h2>👥 Play With Your Friend</h2>
            <p>Share this room code with your friend or enter theirs below.</p>
            
            <div className="room-box">
              <span>Your Room Code:</span>
              <div className="code-display">
                <strong>{roomCode}</strong>
                <button onClick={handleCopyCode} className="copy-btn">Copy</button>
              </div>
              <button 
                className="mode-btn full-width" 
                onClick={() => navigate(`/game?mode=friend&room=${roomCode}`)}
              >
                Start Room ({roomCode})
              </button>
            </div>

            <div className="divider"><span>OR JOIN FRIEND</span></div>

            <div className="join-box">
              <input 
                type="text" 
                placeholder="Enter Friend's Room Code" 
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              />
              <button 
                className="mode-btn friend-btn full-width"
                onClick={() => {
                  if (!joinCode) return alert('Please enter a room code!');
                  navigate(`/game?mode=friend&room=${joinCode}`);
                }}
              >
                Join Friend's Game
              </button>
            </div>

            <button className="close-modal-btn" onClick={() => setShowRoomModal(false)}>✕ Close</button>
          </div>
        </div>
      )}
    </div>
  );
}