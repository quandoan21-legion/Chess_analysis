import { Outlet, Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

function App() {
  const location = useLocation();

  return (
    <div className="app">
      <nav className="nav">
        <div className="nav-content">
          <h1 className="nav-title">Chess.com Analyzer</h1>
          <div className="nav-links">
            <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
              Home
            </Link>
            <Link to="/fetch" className={location.pathname === '/fetch' ? 'active' : ''}>
              Fetch Games
            </Link>
          </div>
        </div>
      </nav>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}

export default App;
