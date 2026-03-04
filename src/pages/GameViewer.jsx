import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { Play, Pause, SkipBack, SkipForward, RotateCcw, Loader } from 'lucide-react';

function GameViewer() {
  const [searchParams] = useSearchParams();
  const gameId = searchParams.get('id');

  const [game, setGame] = useState(null);
  const [chess, setChess] = useState(new Chess());
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [moves, setMoves] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (gameId) {
      fetchGame();
    }
  }, [gameId]);

  useEffect(() => {
    let interval;
    if (isPlaying && currentMoveIndex < moves.length) {
      interval = setInterval(() => {
        goToNextMove();
      }, 1000);
    } else if (currentMoveIndex >= moves.length) {
      setIsPlaying(false);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentMoveIndex, moves.length]);

  const fetchGame = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('chess_games')
        .select('*')
        .eq('id', gameId)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Game not found');

      setGame(data);

      const tempChess = new Chess();
      tempChess.loadPgn(data.pgn);
      const history = tempChess.history({ verbose: true });
      setMoves(history);

      const resetChess = new Chess();
      setChess(resetChess);
      setCurrentMoveIndex(0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const goToMove = (index) => {
    const newChess = new Chess();
    for (let i = 0; i <= index; i++) {
      if (moves[i]) {
        newChess.move(moves[i]);
      }
    }
    setChess(newChess);
    setCurrentMoveIndex(index);
  };

  const goToNextMove = () => {
    if (currentMoveIndex < moves.length) {
      goToMove(currentMoveIndex + 1);
    } else {
      setIsPlaying(false);
    }
  };

  const goToPreviousMove = () => {
    if (currentMoveIndex > 0) {
      goToMove(currentMoveIndex - 1);
    }
  };

  const resetGame = () => {
    setChess(new Chess());
    setCurrentMoveIndex(0);
    setIsPlaying(false);
  };

  const togglePlayPause = () => {
    if (currentMoveIndex >= moves.length) {
      resetGame();
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Loader className="spinner" size={48} />
        <p>Loading game...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="error-container">
        <p>Game not found</p>
      </div>
    );
  }

  return (
    <div className="game-viewer">
      <div className="game-viewer-header">
        <h1>Game Replay</h1>
        <div className="game-info">
          <div className="player-info">
            <span className="player-color white">White: {game.white_username} ({game.white_rating})</span>
            <span className={`player-result ${game.white_result === 'win' ? 'win' : ''}`}>
              {game.white_result}
            </span>
          </div>
          <div className="player-info">
            <span className="player-color black">Black: {game.black_username} ({game.black_rating})</span>
            <span className={`player-result ${game.black_result === 'win' ? 'win' : ''}`}>
              {game.black_result}
            </span>
          </div>
          <div className="game-meta">
            <span>{game.time_class} • {game.time_control}</span>
            <span>{game.month}/{game.year}</span>
          </div>
        </div>
      </div>

      <div className="game-viewer-content">
        <div className="board-container">
          <Chessboard
            position={chess.fen()}
            boardWidth={560}
            arePiecesDraggable={false}
          />

          <div className="controls">
            <button onClick={resetGame} className="control-btn" title="Reset">
              <RotateCcw size={20} />
            </button>
            <button onClick={goToPreviousMove} className="control-btn" title="Previous">
              <SkipBack size={20} />
            </button>
            <button onClick={togglePlayPause} className="control-btn play-btn" title={isPlaying ? 'Pause' : 'Play'}>
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </button>
            <button onClick={goToNextMove} className="control-btn" title="Next">
              <SkipForward size={20} />
            </button>
          </div>

          <div className="move-counter">
            Move {currentMoveIndex} / {moves.length}
          </div>
        </div>

        <div className="moves-list">
          <h3>Moves</h3>
          <div className="moves-grid">
            {moves.map((move, index) => (
              <button
                key={index}
                className={`move-item ${index === currentMoveIndex - 1 ? 'active' : ''}`}
                onClick={() => goToMove(index)}
              >
                <span className="move-number">{Math.floor(index / 2) + 1}{index % 2 === 0 ? '.' : '...'}</span>
                <span className="move-san">{move.san}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GameViewer;
