import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Trophy, TrendingUp, Users, Clock, Loader, Search } from 'lucide-react';
import './UserAnalysis.css';

function UserAnalysis() {
  const [username, setUsername] = useState('');
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;

    try {
      setLoading(true);
      setError(null);
      setSearched(true);
      const lowerUsername = username.toLowerCase();

      const { data, error } = await supabase
        .from('chess_games')
        .select('*')
        .or(`white_username.ilike.${lowerUsername},black_username.ilike.${lowerUsername}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        setGames(data);
        calculateStats(data, username);
      } else {
        setError(`No games found for username "${username}". The user might not exist or has no games in the database.`);
        setStats(null);
      }
    } catch (err) {
      setError(err.message);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (gamesData, user) => {
    const totalGames = gamesData.length;
    const ratedGames = gamesData.filter(g => g.rated).length;

    const wins = gamesData.filter(g =>
      (g.white_username.toLowerCase() === user.toLowerCase() && g.white_result === 'win') ||
      (g.black_username.toLowerCase() === user.toLowerCase() && g.black_result === 'win')
    ).length;

    const gamesWithWhite = gamesData.filter(g => g.white_username.toLowerCase() === user.toLowerCase()).length;

    const timeClassCounts = {};
    gamesData.forEach(g => {
      timeClassCounts[g.time_class] = (timeClassCounts[g.time_class] || 0) + 1;
    });
    const mostPlayedTimeClass = Object.entries(timeClassCounts).sort((a, b) => b[1] - a[1])[0];

    const ratings = gamesData.map(g =>
      g.white_username.toLowerCase() === user.toLowerCase() ? g.white_rating : g.black_rating
    );
    const peakRating = Math.max(...ratings);

    const opponentCounts = {};
    gamesData.forEach(g => {
      const opponent = g.white_username.toLowerCase() === user.toLowerCase() ? g.black_username : g.white_username;
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

    const ratingOverTime = {};
    gamesData.forEach(g => {
      const date = `${g.year}-${String(g.month).padStart(2, '0')}`;
      const rating = g.white_username.toLowerCase() === user.toLowerCase() ? g.white_rating : g.black_rating;
      if (!ratingOverTime[g.time_class]) {
        ratingOverTime[g.time_class] = [];
      }
      ratingOverTime[g.time_class].push({ date, rating });
    });

    setStats({
      totalGames,
      percentRated: totalGames > 0 ? ((ratedGames / totalGames) * 100).toFixed(2) : 0,
      winRate: totalGames > 0 ? ((wins / totalGames) * 100).toFixed(2) : 0,
      lossRate: totalGames > 0 ? (100 - (wins / totalGames) * 100).toFixed(2) : 0,
      whiteRate: totalGames > 0 ? ((gamesWithWhite / totalGames) * 100).toFixed(2) : 0,
      blackRate: totalGames > 0 ? (100 - (gamesWithWhite / totalGames) * 100).toFixed(2) : 0,
      mostPlayedTimeClass: mostPlayedTimeClass ? mostPlayedTimeClass[0] : 'N/A',
      mostPlayedTimeClassCount: mostPlayedTimeClass ? mostPlayedTimeClass[1] : 0,
      peakRating,
      topOpponents,
      topTimeControls,
      ratingOverTime
    });
  };

  return (
    <div className="user-analysis">
      <h1 className="page-title">Analyze by Username</h1>

      <form onSubmit={handleSearch} className="search-form">
        <div className="search-input-group">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Enter Chess.com username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="search-input"
          />
        </div>
        <button type="submit" className="search-button" disabled={loading}>
          {loading ? <Loader className="button-spinner" size={20} /> : 'Analyze'}
        </button>
      </form>

      {loading && (
        <div className="loading-container">
          <Loader className="spinner" size={48} />
          <p>Analyzing games for {username}...</p>
        </div>
      )}

      {error && searched && !loading && (
        <div className="error-container">
          <p className="error-message">{error}</p>
        </div>
      )}

      {stats && !loading && (
        <div className="analysis">
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
                <span className="stat-detail">{stats.lossRate}% losses</span>
              </div>
            </div>

            <div className="stat-card">
              <Users className="stat-icon" />
              <div className="stat-content">
                <h3>Piece Color</h3>
                <p className="stat-value">{stats.whiteRate}%</p>
                <span className="stat-detail">white pieces</span>
              </div>
            </div>

            <div className="stat-card">
              <Clock className="stat-icon" />
              <div className="stat-content">
                <h3>Peak Rating</h3>
                <p className="stat-value">{stats.peakRating}</p>
                <span className="stat-detail">ELO rating</span>
              </div>
            </div>
          </div>

          <div className="facts-section">
            <h2>Game Statistics for {username}</h2>
            <div className="facts-list">
              <p>{username} has played <strong>{stats.totalGames} games</strong> on Chess.com</p>
              <p>Most games in time format: <strong>{stats.mostPlayedTimeClass}</strong> with <strong>{stats.mostPlayedTimeClassCount}</strong> games</p>
              <p>Win rate: <strong className="success-text">{stats.winRate}%</strong></p>
              <p>Peak rating: <strong className="primary-text">{stats.peakRating}</strong> ELO</p>
            </div>
          </div>

          <div className="charts-section">
            <h2>Visualizations</h2>

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
                  <Bar dataKey="count" fill="#8b5cf6" />
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
      )}

      {!searched && !loading && (
        <div className="empty-state">
          <Search size={64} className="empty-icon" />
          <h2>Ready to Analyze</h2>
          <p>Enter a Chess.com username above to get started with the analysis.</p>
        </div>
      )}
    </div>
  );
}

export default UserAnalysis;
