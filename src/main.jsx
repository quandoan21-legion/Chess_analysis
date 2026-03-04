import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import Home from './pages/Home';
import FetchGames from './pages/FetchGames';
import GamesList from './pages/GamesList';
import GameViewer from './pages/GameViewer';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Home />} />
          <Route path="games" element={<GamesList />} />
          <Route path="game" element={<GameViewer />} />
          <Route path="fetch" element={<FetchGames />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
