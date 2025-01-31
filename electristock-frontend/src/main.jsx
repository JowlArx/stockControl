import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import VerifyEmail from './pages/VerifyEmail'; // Importa el componente VerifyEmail
import Dashboard from './pages/Dashboard';

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/signUp" element={<SignUp />} />
      <Route path="/verify-email" element={<VerifyEmail />} /> {/* Añade la ruta para VerifyEmail */}
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  </BrowserRouter>
);