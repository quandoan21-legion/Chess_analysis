import { useState } from 'react';
import { Download, Loader, CheckCircle, AlertCircle } from 'lucide-react';

function FetchGames() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

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
        body: JSON.stringify({ username: username.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch games');
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
          Enter your Chess.com username to import all your games into the database.
          This may take a few minutes depending on how many games you have played.
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

        <button type="submit" className="fetch-button" disabled={loading}>
          {loading ? (
            <>
              <Loader className="button-icon spinner" size={20} />
              Fetching Games...
            </>
          ) : (
            <>
              <Download className="button-icon" size={20} />
              Fetch All Games
            </>
          )}
        </button>
      </form>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={24} />
          <div>
            <h3>Error</h3>
            <p>{error}</p>
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
              {result.errors > 0 && (
                <span className="error-count"> | Errors: {result.errors}</span>
              )}
            </p>
          </div>
        </div>
      )}

      <div className="info-section">
        <h2>How it works</h2>
        <ol className="info-list">
          <li>Enter your Chess.com username in the form above</li>
          <li>Click "Fetch All Games" to start importing</li>
          <li>The system will fetch all your historical games from Chess.com's public API</li>
          <li>Games are stored in the database for analysis</li>
          <li>Once complete, visit the Home page to see your statistics</li>
        </ol>

        <h2>Note</h2>
        <p className="info-note">
          This uses Chess.com's public API, which has rate limits. If you have thousands of games,
          the import may take several minutes. Please be patient and don't refresh the page.
        </p>
      </div>
    </div>
  );
}

export default FetchGames;
