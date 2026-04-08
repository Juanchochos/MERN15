//import React from 'react';
import { BrowserRouter as Router, Route, Navigate, Routes } from 'react-router-dom';
import './styles/App.css';

import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import MainPage from './pages/MainPage';
import GameRoomPage from './pages/GameRoomPage';
import JoinPage from './pages/JoinPage';
import LobbyPage from './pages/LobbyPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="/Join" element={<JoinPage />} />
        <Route path="/Lobby" element={<LobbyPage />} />
        <Route path="/game" element={<GameRoomPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
