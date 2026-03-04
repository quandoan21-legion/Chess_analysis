import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader, ChevronRight, Filter } from 'lucide-react';

function GamesList() {
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterUsername, setFilterUsername] = useState('');
  const [filterTimeClass, setFilterTimeClass] = useState('');
  const [availableUsernames, setAvailableUsernames] = useState([]);
  const [timeClasses, setTimeClasses] = useState([]);

  useEffect(() => {
    fetchGames();
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchGames();
  }, [filterUsername, filterTimeClass]);

  const fetchFilters = async () => {
    try {
      const { data, error } = await supabase
        .from('chess_games')
        .select('white_username, black_username, time_class')
        .limit(1000);

      if (error) throw error;

      if (data) {
        const usernames = new Set();
        const classes = new Set();
        data.forEach(game => {
          usernames.add(game.white_username);
          usernames.add(game.black_username);
          classes.add(game.time_class);
        });
        setAvailableUsernames(Array.from(usernames).sort());
        setTimeClasses(Array.from(classes).sort());
      }
    } catch (err) {
      console.error('Error fetching filters:', err);
    }
  };

  const fetchGames = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('chess_games')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (filterUsername) {
        query = query.or(`white_username.eq.${filterUsername},black_username.eq.${filterUsername}`);
      }

      if (filterTimeClass) {
        query = query.eq('time_class', filterTimeClass);
      }

      const { data, error } = await query;

      if (error) throw error;

      setGames(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const viewGame = (gameId) => {
    navigate(`/game?id=${gameId}`);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Loader className="spinner" size={48} />
        <p>Loading games...</p>
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

  return (
    <div className="games-list">
      <div className="page-header">
        <h1 className="page-title">All Games</h1>
      </div>

      <div className="filters">
        <div className="filter-group">
          <label htmlFor="username-filter">
            <Filter size={16} />
            Player
          </label>
          <select
            id="username-filter"
            value={filterUsername}
            onChange={(e) => setFilterUsername(e.target.value)}
            className="filter-select"
          >
            <option value="">All Players</option>
            {availableUsernames.map((username) => (
              <option key={username} value={username}>
                {username}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="timeclass-filter">
            <Filter size={16} />
            Time Class
          </label>
          <select
            id="timeclass-filter"
            value={filterTimeClass}
            onChange={(e) => setFilterTimeClass(e.target.value)}
            className="filter-select"
          >
            <option value="">All Time Classes</option>
            {timeClasses.map((timeClass) => (
              <option key={timeClass} value={timeClass}>
                {timeClass}
              </option>
            ))}
          </select>
        </div>
      </div>

      {games.length === 0 ? (
        <div className="no-games">
          <p>No games found</p>
        </div>
      ) : (
        <div className="games-table">
          <div className="table-header">
            <span className="col-players">Players</span>
            <span className="col-result">Result</span>
            <span className="col-time">Time Class</span>
            <span className="col-date">Date</span>
            <span className="col-action"></span>
          </div>
          {games.map((game) => (
            <div
              key={game.id}
              className="table-row"
              onClick={() => viewGame(game.id)}
            >
              <div className="col-players">
                <div className="player-item">
                  <span className="player-piece white">♔</span>
                  <span>{game.white_username} ({game.white_rating})</span>
                </div>
                <div className="player-item">
                  <span className="player-piece black">♚</span>
                  <span>{game.black_username} ({game.black_rating})</span>
                </div>
              </div>
              <div className="col-result">
                <span className={`result-badge ${game.white_result === 'win' ? 'white-win' : game.black_result === 'win' ? 'black-win' : 'draw'}`}>
                  {game.white_result === 'win' ? '1-0' : game.black_result === 'win' ? '0-1' : '½-½'}
                </span>
              </div>
              <div className="col-time">
                <span className="badge">{game.time_class}</span>
                <span className="time-control">{game.time_control}</span>
              </div>
              <div className="col-date">
                {game.month}/{game.year}
              </div>
              <div className="col-action">
                <ChevronRight size={20} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default GamesList;
