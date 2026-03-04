import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Trophy, TrendingUp, Users, Clock, Loader } from 'lucide-react';
import './Analysis.css';

function Analysis() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const username = 'CodingGambit';

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('chess_games')
        .select('*')
        .or(`white_username.eq.${username},black_username.eq.${username}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        setGames(data);
        calculateStats(data);
      } else {
        setError('No games found. The database might be empty.');
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
      (g.white_username === username && g.white_result === 'win') ||
      (g.black_username === username && g.black_result === 'win')
    ).length;

    const gamesWithWhite = gamesData.filter(g => g.white_username === username).length;

    const timeClassCounts = {};
    gamesData.forEach(g => {
      timeClassCounts[g.time_class] = (timeClassCounts[g.time_class] || 0) + 1;
    });
    const mostPlayedTimeClass = Object.entries(timeClassCounts).sort((a, b) => b[1] - a[1])[0];

    const ratings = gamesData.map(g =>
      g.white_username === username ? g.white_rating : g.black_rating
    );
    const peakRating = Math.max(...ratings);

    const opponentCounts = {};
    gamesData.forEach(g => {
      const opponent = g.white_username === username ? g.black_username : g.white_username;
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
      const rating = g.white_username === username ? g.white_rating : g.black_rating;
      if (!ratingOverTime[g.time_class]) {
        ratingOverTime[g.time_class] = [];
      }
      ratingOverTime[g.time_class].push({ date, rating });
    });

    setStats({
      totalGames,
      percentRated: ((ratedGames / totalGames) * 100).toFixed(2),
      winRate: ((wins / totalGames) * 100).toFixed(2),
      lossRate: (100 - (wins / totalGames) * 100).toFixed(2),
      whiteRate: ((gamesWithWhite / totalGames) * 100).toFixed(2),
      blackRate: (100 - (gamesWithWhite / totalGames) * 100).toFixed(2),
      mostPlayedTimeClass: mostPlayedTimeClass ? mostPlayedTimeClass[0] : 'N/A',
      mostPlayedTimeClassCount: mostPlayedTimeClass ? mostPlayedTimeClass[1] : 0,
      peakRating,
      topOpponents,
      topTimeControls,
      ratingOverTime
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
          Make sure to set up the database using the SQL migration provided in the instructions.
        </p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="error-container">
        <p>No data available</p>
      </div>
    );
  }

  return (
    <div className="analysis">
      <h1 className="page-title">Chess.com Games Analysis</h1>

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
        <h2>Game Statistics</h2>
        <div className="facts-list">
          <p>Most games played in time format: <strong>{stats.mostPlayedTimeClass}</strong> with <strong>{stats.mostPlayedTimeClassCount}</strong> games</p>
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
  );
}

export default Analysis;
