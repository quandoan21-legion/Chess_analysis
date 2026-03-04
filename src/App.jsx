import { useState } from 'react';
import { ChevronRight, TrendingUp, Users, Clock, Trophy } from 'lucide-react';
import Home from './pages/Home';
import Analysis from './pages/Analysis';
import UserAnalysis from './pages/UserAnalysis';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home />;
      case 'analysis':
        return <Analysis />;
      case 'user-analysis':
        return <UserAnalysis />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-brand" onClick={() => setCurrentPage('home')}>
            <Trophy className="brand-icon" />
            <span>Chess Analyzer</span>
          </div>
          <div className="nav-links">
            <button
              className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}
              onClick={() => setCurrentPage('home')}
            >
              Home
            </button>
            <button
              className={`nav-link ${currentPage === 'analysis' ? 'active' : ''}`}
              onClick={() => setCurrentPage('analysis')}
            >
              Analysis
            </button>
            <button
              className={`nav-link ${currentPage === 'user-analysis' ? 'active' : ''}`}
              onClick={() => setCurrentPage('user-analysis')}
            >
              By Username
            </button>
          </div>
        </div>
      </nav>

      <main className="main-content">
        {renderPage()}
      </main>

      <footer className="footer">
        <div className="footer-content">
          <p>Built with React, Vite & Supabase</p>
          <p>Data from Chess.com API</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
