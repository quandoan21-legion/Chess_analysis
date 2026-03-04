import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Trophy, TrendingUp, Users, Clock, Loader, BarChart2 } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

function Home() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [selectedUsername, setSelectedUsername] = useState('');
  const [availableUsernames, setAvailableUsernames] = useState([]);

  useEffect(() => {
    fetchAvailableUsernames();
  }, []);

  useEffect(() => {
    if (selectedUsername) {
      fetchGames();
    }
  }, [selectedUsername]);

  const fetchAvailableUsernames = async () => {
    try {
      const { data, error } = await supabase
        .from('chess_games')
        .select('white_username, black_username')
        .limit(1000);

      if (error) throw error;

      if (data && data.length > 0) {
        const usernames = new Set();
        data.forEach(game => {
          usernames.add(game.white_username);
          usernames.add(game.black_username);
        });
        const sortedUsernames = Array.from(usernames).sort();
        setAvailableUsernames(sortedUsernames);

        if (sortedUsernames.length > 0) {
          setSelectedUsername(sortedUsernames[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching usernames:', err);
    }
  };

  const fetchGames = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('chess_games')
        .select('*')
        .or(`white_username.eq.${selectedUsername},black_username.eq.${selectedUsername}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        setGames(data);
        calculateStats(data);
      } else {
        setError('No games found for this user.');
        setStats(null);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (gamesData) => {
    const totalGames = gamesData.length;
    const ratedGames = gamesData.filter(g => g.rated).length;

    const wins = gamesData.filter(g =>
      (g.white_username === selectedUsername && g.white_result === 'win') ||
      (g.black_username === selectedUsername && g.black_result === 'win')
    ).length;

    const losses = gamesData.filter(g =>
      (g.white_username === selectedUsername && g.white_result !== 'win' && g.white_result !== 'agreed' && g.white_result !== 'stalemate' && g.white_result !== 'repetition' && g.white_result !== 'insufficient' && g.white_result !== 'timevsinsufficient') ||
      (g.black_username === selectedUsername && g.black_result !== 'win' && g.black_result !== 'agreed' && g.black_result !== 'stalemate' && g.black_result !== 'repetition' && g.black_result !== 'insufficient' && g.black_result !== 'timevsinsufficient')
    ).length;

    const draws = totalGames - wins - losses;

    const gamesWithWhite = gamesData.filter(g => g.white_username === selectedUsername).length;

    const timeClassCounts = {};
    gamesData.forEach(g => {
      timeClassCounts[g.time_class] = (timeClassCounts[g.time_class] || 0) + 1;
    });
    const mostPlayedTimeClass = Object.entries(timeClassCounts).sort((a, b) => b[1] - a[1])[0];

    const ratings = gamesData.map(g =>
      g.white_username === selectedUsername ? g.white_rating : g.black_rating
    );
    const peakRating = Math.max(...ratings);
    const currentRating = ratings[0] || 0;

    const opponentCounts = {};
    gamesData.forEach(g => {
      const opponent = g.white_username === selectedUsername ? g.black_username : g.white_username;
      opponentCounts[opponent] = (opponentCounts[opponent] || 0) + 1;
    });
    const topOpponents = Object.entries(opponentCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    const timeControlCounts = {};
    gamesData.forEach(g => {
      timeControlCounts[g.time_control] = (timeControlCounts[g.time_control] || 0) + 1;
    });
    const topTimeControls = Object.entries(timeControlCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([control, count]) => ({ control, count }));

    const resultData = [
      { name: 'Wins', value: wins, color: '#10b981' },
      { name: 'Losses', value: losses, color: '#ef4444' },
      { name: 'Draws', value: draws, color: '#94a3b8' },
    ];

    const ratingOverTime = {};
    gamesData.forEach(g => {
      const date = `${g.year}-${String(g.month).padStart(2, '0')}`;
      const rating = g.white_username === selectedUsername ? g.white_rating : g.black_rating;
      if (!ratingOverTime[g.time_class]) {
        ratingOverTime[g.time_class] = [];
      }
      ratingOverTime[g.time_class].push({ date, rating });
    });

    setStats({
      totalGames,
      percentRated: ((ratedGames / totalGames) * 100).toFixed(1),
      winRate: ((wins / totalGames) * 100).toFixed(1),
      wins,
      losses,
      draws,
      whiteRate: ((gamesWithWhite / totalGames) * 100).toFixed(1),
      blackRate: (100 - (gamesWithWhite / totalGames) * 100).toFixed(1),
      mostPlayedTimeClass: mostPlayedTimeClass ? mostPlayedTimeClass[0] : 'N/A',
      mostPlayedTimeClassCount: mostPlayedTimeClass ? mostPlayedTimeClass[1] : 0,
      peakRating,
      currentRating,
      topOpponents,
      topTimeControls,
      ratingOverTime,
      resultData,
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Loader className="spinner" size={48} />
        <p>Loading analysis data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <p className="error-hint">
          Go to the Fetch Games page to import games from Chess.com
        </p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="error-container">
        <p>No data available</p>
        <p className="error-hint">
          Go to the Fetch Games page to import games from Chess.com
        </p>
      </div>
    );
  }

  return (
    <div className="analysis">
      <div className="page-header">
        <h1 className="page-title">Chess Game Analysis</h1>
        {availableUsernames.length > 0 && (
          <div className="username-selector">
            <label htmlFor="username">Select Player:</label>
            <select
              id="username"
              value={selectedUsername}
              onChange={(e) => setSelectedUsername(e.target.value)}
              className="username-select"
            >
              {availableUsernames.map((username) => (
                <option key={username} value={username}>
                  {username}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <Trophy className="stat-icon" />
          <div className="stat-content">
            <h3>Total Games</h3>
            <p className="stat-value">{stats.totalGames}</p>
            <span className="stat-detail">{stats.percentRated}% rated</span>
          </div>
        </div>

        <div className="stat-card">
          <TrendingUp className="stat-icon success" />
          <div className="stat-content">
            <h3>Win Rate</h3>
            <p className="stat-value success">{stats.winRate}%</p>
            <span className="stat-detail">{stats.wins}W / {stats.losses}L / {stats.draws}D</span>
          </div>
        </div>

        <div className="stat-card">
          <Users className="stat-icon" />
          <div className="stat-content">
            <h3>White Games</h3>
            <p className="stat-value">{stats.whiteRate}%</p>
            <span className="stat-detail">{stats.blackRate}% black</span>
          </div>
        </div>

        <div className="stat-card">
          <Clock className="stat-icon" />
          <div className="stat-content">
            <h3>Peak Rating</h3>
            <p className="stat-value">{stats.peakRating}</p>
            <span className="stat-detail">Current: {stats.currentRating}</span>
          </div>
        </div>
      </div>

      <div className="facts-section">
        <h2>Game Statistics</h2>
        <div className="facts-list">
          <p>Most played time format: <strong>{stats.mostPlayedTimeClass}</strong> with <strong>{stats.mostPlayedTimeClassCount}</strong> games</p>
        </div>
      </div>

      <div className="charts-section">
        <h2>Visualizations</h2>

        <div className="chart-container">
          <h3>Win/Loss/Draw Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.resultData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {stats.resultData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3>Top 5 Opponents</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.topOpponents}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                labelStyle={{ color: '#f1f5f9' }}
              />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3>Top 5 Time Controls</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.topTimeControls}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="control" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                labelStyle={{ color: '#f1f5f9' }}
              />
              <Bar dataKey="count" fill="#059669" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {Object.entries(stats.ratingOverTime).map(([timeClass, data]) => (
          <div key={timeClass} className="chart-container">
            <h3>Rating Over Time - {timeClass}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#f1f5f9' }}
                />
                <Line type="monotone" dataKey="rating" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
