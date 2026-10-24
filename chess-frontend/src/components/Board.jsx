import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Chess } from 'chess.js';
import './Board.css';

// Transparent Refractive Glass Pieces (Clear Crystal & Cyan Crystal)
const TransparentGlassPiece = ({ type, color }) => {
  const isWhite = color === 'w'; 
  const gradId = `glass-grad-${color}-${type}`;
  const strokeGradId = `glass-stroke-${color}-${type}`;
  const filterId = `glass-refract-${color}`;

  return (
    <svg viewBox="0 0 45 45" className={`glass-sculpture ${isWhite ? 'glass-clear' : 'glass-cyan'}`}>
      <defs>
        {/* Core Transparent Fill Gradient */}
        <linearGradient id={gradId} x1="10%" y1="0%" x2="90%" y2="100%">
          {isWhite ? (
            <>
              {/* Clear Crystal (Reference 1) */}
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
              <stop offset="30%" stopColor="#e2f1ff" stopOpacity="0.2" />
              <stop offset="60%" stopColor="#cbd5e1" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.9" />
            </>
          ) : (
            <>
              {/* Cyan Crystal (Reference 2) */}
              <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.85" />
              <stop offset="35%" stopColor="#06b6d4" stopOpacity="0.35" />
              <stop offset="65%" stopColor="#083344" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#a5f3fc" stopOpacity="0.95" />
            </>
          )}
        </linearGradient>

        {/* Thick Glass Edge Reflection Gradient */}
        <linearGradient id={strokeGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          {isWhite ? (
            <>
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="50%" stopColor="#94a3b8" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
            </>
          ) : (
            <>
              <stop offset="0%" stopColor="#cffafe" stopOpacity="1" />
              <stop offset="50%" stopColor="#0891b2" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="1" />
            </>
          )}
        </linearGradient>

        {/* Photorealistic Refraction & Specular Light Filter */}
        <filter id={filterId} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
          
          {/* Intense specular highlight for glassy shine */}
          <feSpecularLighting in="blur" surfaceScale="6" specularConstant="2.5" specularExponent="50" lighting-color="#ffffff" result="specOut">
            <fePointLight x="-15" y="-30" z="60" />
          </feSpecularLighting>
          
          <feComposite in="specOut" in2="SourceAlpha" operator="in" result="specOut" />
          
          {/* Inner refraction shadow mimicking solid glass thickness */}
          <feOffset dx="1" dy="2" in="SourceAlpha" result="offsetAlpha" />
          <feGaussianBlur stdDeviation="1.5" in="offsetAlpha" result="offsetBlur" />
          <feComposite operator="out" in="SourceGraphic" in2="offsetBlur" result="inverse" />
          <feFlood floodColor={isWhite ? "#0f172a" : "#083344"} floodOpacity="0.5" result="shadowColor" />
          <feComposite operator="in" in="shadowColor" in2="inverse" result="innerShadow" />
          
          {/* Blend layers together */}
          <feComposite operator="over" in="innerShadow" in2="SourceGraphic" result="baseWithShadow" />
          <feComposite operator="arithmetic" k1="0" k2="1" k3="1" k4="0" in="specOut" in2="baseWithShadow" result="finalGlass" />
          
          {/* Subtle colored drop shadow to simulate light passing through glass */}
          <feDropShadow dx="0" dy="8" stdDeviation="4" floodColor={isWhite ? "#000000" : "#0891b2"} floodOpacity="0.4" />
        </filter>
      </defs>

      <g filter={`url(#${filterId})`} fill={`url(#${gradId})`} stroke={`url(#${strokeGradId})`} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round">
        {type === 'p' && (
          <path d="M 22.5,9 C 19.5,9 17,11.5 17,14.5 C 17,16.8 18.4,18.7 20.4,19.5 C 17,21 15,24.5 15,29 L 30,29 C 30,24.5 28,21 24.6,19.5 C 26.6,18.7 28,16.8 28,14.5 C 28,11.5 25.5,9 22.5,9 z M 11.5,33 L 33.5,33 L 35,37 L 10,37 L 11.5,33 z" />
        )}
        {type === 'r' && (
          <path d="M 9,39 L 36,39 L 36,36 L 9,36 L 9,39 z M 12,36 L 12,32 L 33,32 L 33,36 L 12,36 z M 14,29.5 L 14,16.5 L 31,16.5 L 31,29.5 L 14,29.5 z M 14,16.5 L 11,14 L 34,14 L 31,16.5 L 14,16.5 z M 11,14 L 11,9 L 15,9 L 15,11 L 20,11 L 20,9 L 25,9 L 25,11 L 30,11 L 30,9 L 34,9 L 34,14" />
        )}
        {type === 'n' && (
          <>
            <path d="M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18" />
            <path d="M 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.958,30.06 12.41,27.96 11,28 C 10,28 11.19,29.23 10,30 C 9,30 5.997,31 6,26 C 6,24 12,14 12,14 C 12,14 13.89,12.1 14,10.5 C 13.27,9.506 13.5,8.5 13.5,7.5 C 14.5,6.5 16.5,10 16.5,10 L 18.5,10 C 18.5,10 19.28,8.008 21,7 C 22,7 22,10 22,10" />
          </>
        )}
        {type === 'b' && (
          <>
            <path d="M 9,36 C 12.39,35.03 19.11,36.43 22.5,34 C 25.89,36.43 32.61,35.03 36,36 C 36,36 37.65,36.54 39,38 C 38.32,38.97 37.35,38.99 36,38.5 C 32.61,37.53 25.89,38.96 22.5,37.5 C 19.11,38.96 12.39,37.53 9,38.5 C 7.646,38.99 6.677,38.97 6,38 C 7.354,36.06 9,36 9,36 z" />
            <path d="M 15,32 C 17.5,34.5 27.5,34.5 30,32 C 30.5,30.5 30,30 30,30 C 30,27.5 27.5,26 27.5,26 C 33,24.5 33.5,14.5 22.5,10.5 C 11.5,14.5 12,24.5 17.5,26 C 17.5,26 15,27.5 15,30 C 15,30 14.5,30.5 15,32 z" />
            <circle cx="22.5" cy="8" r="2.5" />
          </>
        )}
        {type === 'q' && (
          <>
            <path d="M 9,26 C 17.5,24.5 30,24.5 36,26 L 38.5,13.5 L 31,25 L 30.7,10.9 L 25.5,24.5 L 22.5,10 L 19.5,24.5 L 14.3,10.9 L 14,25 L 6.5,13.5 L 9,26 z" />
            <path d="M 9,26 C 9,28 10.5,28 11.5,30 C 12.5,31.5 12.5,31 12,33.5 C 10.5,34.5 11,36 11,36 C 9.5,37.5 11,38.5 11,38.5 C 17.5,39.5 27.5,39.5 34,38.5 C 34,38.5 35.5,37.5 34,36 C 34,36 34.5,34.5 33,33.5 C 32.5,31 32.5,31.5 33.5,30 C 34.5,28 36,28 36,26 C 27.5,24.5 17.5,24.5 9,26 z" />
            <circle cx="6" cy="12" r="2" />
            <circle cx="14" cy="9" r="2" />
            <circle cx="22.5" cy="8" r="2" />
            <circle cx="31" cy="9" r="2" />
            <circle cx="39" cy="12" r="2" />
          </>
        )}
        {type === 'k' && (
          <>
            <path d="M 22.5,11.63 L 22.5,6" strokeWidth="2.5" />
            <path d="M 20,8 L 25,8" strokeWidth="2.5" />
            <path d="M 22.5,25 C 22.5,25 27,17.5 25.5,14.5 C 25.5,14.5 24.5,12 22.5,12 C 20.5,12 19.5,14.5 19.5,14.5 C 18,17.5 22.5,25 22.5,25" />
            <path d="M 11.5,37 C 17,40.5 27,40.5 32.5,37 L 32.5,30 C 32.5,30 41.5,25.5 38.5,19.5 C 34.5,13 25,16 22.5,23.5 L 22.5,27 L 22.5,23.5 C 19,16 9.5,13 6.5,19.5 C 3.5,25.5 11.5,29.5 11.5,29.5 L 11.5,37 z" />
          </>
        )}
      </g>
    </svg>
  );
};

export default function Board() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'computer';
  const roomCode = searchParams.get('room') || '';

  const [game, setGame] = useState(() => new Chess());
  const [board, setBoard] = useState(() => game.board());
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const [lastMove, setLastMove] = useState({ from: null, to: null });
  const [viewMode, setViewMode] = useState('isometric');
  const [capturedWhite, setCapturedWhite] = useState([]);
  const [capturedBlack, setCapturedBlack] = useState([]);
  const [gameStatus, setGameStatus] = useState('Active Match');
  const [matchRecorded, setMatchRecorded] = useState(false);

  const user = useMemo(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : { username: 'Player' };
  }, []);

  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

  const saveMatchResult = useCallback(async (resultType) => {
    if (matchRecorded || !user?.id) return;
    setMatchRecorded(true);
    try {
      await fetch('http://127.0.0.1:8000/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          mode: mode,
          result: resultType,
        }),
      });
    } catch (err) {
      console.error('Failed to save match result:', err);
    }
  }, [matchRecorded, mode, user?.id]);

  const syncGameState = useCallback((chessInstance) => {
    setBoard([...chessInstance.board()]);

    const history = chessInstance.history({ verbose: true });
    const whiteCaps = [];
    const blackCaps = [];
    history.forEach((m) => {
      if (m.captured) {
        if (m.color === 'w') blackCaps.push(m.captured);
        else whiteCaps.push(m.captured);
      }
    });
    setCapturedWhite(whiteCaps);
    setCapturedBlack(blackCaps);

    if (chessInstance.isCheckmate()) {
      const winner = chessInstance.turn() === 'w' ? 'Black' : 'White';
      setGameStatus(`Checkmate! ${winner} Wins!`);
      saveMatchResult(winner === 'White' ? 'win' : 'loss');
    } else if (chessInstance.isDraw()) {
      setGameStatus('Draw Game!');
      saveMatchResult('draw');
    } else if (chessInstance.inCheck()) {
      setGameStatus(`${chessInstance.turn() === 'w' ? 'White' : 'Black'} is in Check!`);
    } else {
      setGameStatus(`${chessInstance.turn() === 'w' ? "White's Turn" : "Black's Turn"}`);
    }
  }, [saveMatchResult]);

  useEffect(() => {
    if (mode === 'computer' && game.turn() === 'b' && !game.isGameOver()) {
      const timer = setTimeout(() => {
        const possibleMoves = game.moves({ verbose: true });
        if (possibleMoves.length === 0) return;

        const pieceValues = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
        possibleMoves.sort((a, b) => {
          const scoreA = a.captured ? pieceValues[a.captured] * 10 : 0;
          const scoreB = b.captured ? pieceValues[b.captured] * 10 : 0;
          return scoreB - scoreA + (Math.random() * 2 - 1);
        });

        const chosenMove = possibleMoves[0];
        const moveResult = game.move(chosenMove);
        if (moveResult) {
          setLastMove({ from: moveResult.from, to: moveResult.to });
          syncGameState(game);
        }
      }, 550);
      return () => clearTimeout(timer);
    }
  }, [board, mode, game, syncGameState]);

  const handleSquareClick = (squareName) => {
    if (game.isGameOver()) return;
    if (mode === 'computer' && game.turn() === 'b') return;

    if (selectedSquare && validMoves.some((m) => m.to === squareName)) {
      try {
        const moveResult = game.move({
          from: selectedSquare,
          to: squareName,
          promotion: 'q',
        });
        if (moveResult) {
          setLastMove({ from: moveResult.from, to: moveResult.to });
          setSelectedSquare(null);
          setValidMoves([]);
          syncGameState(game);
          return;
        }
      } catch (e) {
        console.error(e);
      }
    }

    const pieceOnSquare = game.get(squareName);
    if (pieceOnSquare && pieceOnSquare.color === game.turn()) {
      setSelectedSquare(squareName);
      const moves = game.moves({ square: squareName, verbose: true });
      setValidMoves(moves);
    } else {
      setSelectedSquare(null);
      setValidMoves([]);
    }
  };

  const handleResetGame = () => {
    const freshGame = new Chess();
    setGame(freshGame);
    setBoard(freshGame.board());
    setSelectedSquare(null);
    setValidMoves([]);
    setLastMove({ from: null, to: null });
    setCapturedWhite([]);
    setCapturedBlack([]);
    setGameStatus("White's Turn");
    setMatchRecorded(false);
  };

  return (
    <div className="glass-arena-wrapper">
      <div className="arena-ambient-glow"></div>

      <header className="arena-hud">
        <button className="hud-btn back-btn" onClick={() => navigate('/dashboard')}>← Dashboard</button>
        <div className="hud-status-pill">
          <span className={`turn-dot ${game.turn() === 'w' ? 'white-turn' : 'black-turn'}`}></span>
          <span className="status-text">{gameStatus}</span>
          {roomCode && <span className="room-badge">Room: {roomCode}</span>}
        </div>
        <div className="hud-controls">
          <div className="view-switcher">
            <button className={`hud-btn ${viewMode === 'isometric' ? 'active' : ''}`} onClick={() => setViewMode('isometric')}>3D Iso</button>
            <button className={`hud-btn ${viewMode === 'tilted' ? 'active' : ''}`} onClick={() => setViewMode('tilted')}>3D Classic</button>
            <button className={`hud-btn ${viewMode === 'flat' ? 'active' : ''}`} onClick={() => setViewMode('flat')}>2D Top</button>
          </div>
          <button className="hud-btn reset-btn" onClick={handleResetGame}>↻ New Match</button>
        </div>
      </header>

      <div className="arena-stage">
        <aside className="player-glass-panel opponent-panel">
          <div className="player-header">
            <div className="avatar-orb black-orb">{mode === 'computer' ? '🤖' : '👤'}</div>
            <div>
              <h4>{mode === 'computer' ? 'Grandmaster AI' : 'Friend Challenger'}</h4>
              <span className="piece-tag">Cyan Sapphire Glass</span>
            </div>
          </div>
          <div className="captured-tray">
            {capturedWhite.map((type, idx) => (
              <div key={idx} className="mini-captured"><TransparentGlassPiece type={type} color="w" /></div>
            ))}
          </div>
        </aside>

        <div className={`scene-3d view-${viewMode}`}>
          {/* Circular Metallic Coin Chassis */}
          <div className="metallic-coin-chassis">
            <div className="coin-engraving-ring"></div>
            <div className="coin-inner-rim"></div>

            <div className="crown crown-top">♔</div>
            <div className="crown crown-bottom">♔</div>
            <div className="crown crown-left">♔</div>
            <div className="crown crown-right">♔</div>

            <div className="chessboard-grid">
              {board.map((row, rIdx) =>
                row.map((piece, cIdx) => {
                  const squareName = `${files[cIdx]}${ranks[rIdx]}`;
                  const isLight = (rIdx + cIdx) % 2 === 0;
                  const isSelected = selectedSquare === squareName;
                  const moveOption = validMoves.find((m) => m.to === squareName);
                  const isLastMove = lastMove.from === squareName || lastMove.to === squareName;
                  const isKingInCheck = game.inCheck() && piece?.type === 'k' && piece?.color === game.turn();

                  return (
                    <div
                      key={squareName}
                      className={`glass-tile ${isLight ? 'silver-light' : 'obsidian-dark'} 
                        ${isSelected ? 'tile-selected' : ''} 
                        ${isLastMove ? 'tile-last-move' : ''}
                        ${isKingInCheck ? 'tile-check-alert' : ''}`}
                      onClick={() => handleSquareClick(squareName)}
                    >
                      {moveOption && (
                        <div className={piece ? 'capture-ring-indicator' : 'move-dot-indicator'} />
                      )}

                      {piece && (
                        <div className={`glass-piece-wrapper ${piece.color === 'w' ? 'piece-clear' : 'piece-cyan'} ${isSelected ? 'piece-lifted' : ''}`}>
                          <div className="sculpture-container">
                            <TransparentGlassPiece type={piece.type} color={piece.color} />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <aside className="player-glass-panel user-panel">
          <div className="player-header">
            <div className="avatar-orb white-orb">👑</div>
            <div>
              <h4>{user.username} (You)</h4>
              <span className="piece-tag">White Clear Crystal</span>
            </div>
          </div>
          <div className="captured-tray">
            {capturedBlack.map((type, idx) => (
              <div key={idx} className="mini-captured"><TransparentGlassPiece type={type} color="b" /></div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}