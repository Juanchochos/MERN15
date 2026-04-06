//import React from 'react';
import { BrowserRouter as Router, Route, Navigate, Routes } from 'react-router-dom';
import './styles/App.css';

import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import CardPage from './pages/CardPage';
import CreatePage from './pages/CreatePage';

function App() {
  return (
    <Router >
      <Routes>
        <Route path="/" element={<LoginPage/>}/>
		<Route path="/signup" element={<SignUpPage />} />
		<Route path="/create" element={<CreatePage />} />
        <Route path="/cards" element={<CardPage/>}/>
        <Route path="*" element={<Navigate to="/" replace />}/>
      </Routes>  
    </Router>
  );
}
export default App;