//import React from 'react';
import { BrowserRouter as Router, Route, Navigate, Routes } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import './styles/App.css';

const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignUpPage = lazy(() => import('./pages/SignUpPage'));
const MainPage = lazy(() => import('./pages/MainPage'));
const GameRoomPage = lazy(() => import('./pages/GameRoomPage'));
const JoinPage = lazy(() => import('./pages/JoinPage'));
const LobbyPage = lazy(() => import('./pages/LobbyPage'));
const MatchHistoryPage = lazy(() => import('./pages/MatchHistoryPage'));

function App() {
  return (
    <Router>
		<Suspense fallback={<div>Loading...</div>}>
			<Routes>
			  <Route path="/" element={<LoginPage />} />
			  <Route path="/signup" element={<SignUpPage />} />
			  <Route path="/main" element={<MainPage />} />
			  <Route path="/Join" element={<JoinPage />} />
			  <Route path="/Lobby" element={<LobbyPage />} />
			  <Route path="/game" element={<GameRoomPage />} />
			  <Route path="/match-history" element={<MatchHistoryPage />} />
			  <Route path="*" element={<Navigate to="/" replace />} />
			</Routes>
		</Suspense>
    </Router>
  );
}

export default App;
