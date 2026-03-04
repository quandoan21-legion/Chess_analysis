import { useState } from 'react';
import { Download, Loader, CheckCircle, AlertCircle } from 'lucide-react';

function FetchGames() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [limit, setLimit] = useState(20);

  const handleFetchGames = async (e) => {
    e.preventDefault();

    if (!username.trim()) {
      setError('Please enter a Chess.com username');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const apiUrl = `${supabaseUrl}/functions/v1/fetch-chess-games`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ username: username.trim(), limit }),
      });

      const data = await response.json();

      if (!response.ok) {
        let errorMessage = data.error || 'Failed to fetch games';

        if (data.errorLog && data.errorLog.length > 0) {
          errorMessage += '\n\nError Details:\n' + data.errorLog.join('\n\n');
        }

        if (data.details) {
          errorMessage += '\n\nDetails: ' + data.details;
        }

        if (data.hint) {
          errorMessage += '\n\nHint: ' + data.hint;
        }

        throw new Error(errorMessage);
      }

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fetch-games">
      <div className="fetch-header">
        <h1 className="page-title">Fetch Chess.com Games</h1>
        <p className="fetch-description">
          Enter your Chess.com username to import your recent games into the database.
          You can import up to your most recent games for analysis.
        </p>
      </div>

      <form onSubmit={handleFetchGames} className="fetch-form">
        <div className="form-group">
          <label htmlFor="username">Chess.com Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username (e.g., hikaru)"
            className="username-input"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="limit">Number of Recent Games</label>
          <input
            type="number"
            id="limit"
            value={limit}
            onChange={(e) => setLimit(parseInt(e.target.value) || 20)}
            min="1"
            max="500"
            placeholder="20"
            className="username-input"
            disabled={loading}
          />
          <p className="input-hint">Import the most recent games (1-500)</p>
        </div>

        <button type="submit" className="fetch-button" disabled={loading}>
          {loading ? (
            <>
              <Loader className="button-icon spinner" size={20} />
              Fetching Games...
            </>
          ) : (
            <>
              <Download className="button-icon" size={20} />
              Fetch Recent Games
            </>
          )}
        </button>
      </form>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={24} />
          <div>
            <h3>Error</h3>
            <pre className="error-details">{error}</pre>
          </div>
        </div>
      )}

      {result && (
        <div className="alert alert-success">
          <CheckCircle size={24} />
          <div>
            <h3>Success!</h3>
            <p>{result.message}</p>
            <p className="result-stats">
              Games imported: <strong>{result.gamesImported}</strong>
            </p>
          </div>
        </div>
      )}

      <div className="info-section">
        <h2>How it works</h2>
        <ol className="info-list">
          <li>Enter your Chess.com username in the form above</li>
          <li>Set the number of recent games you want to import (default is 20)</li>
          <li>Click "Fetch Recent Games" to start importing</li>
          <li>The system will fetch your most recent games from Chess.com's public API</li>
          <li>Games are stored in the database for analysis</li>
          <li>Once complete, visit the Home page to see your statistics</li>
        </ol>

        <h2>Note</h2>
        <p className="info-note">
          This uses Chess.com's public API. The system fetches your most recent games
          starting from the current month and working backwards until it reaches your requested limit.
        </p>
      </div>
    </div>
  );
}

export default FetchGames;
