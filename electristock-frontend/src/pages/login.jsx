import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Importa useNavigate
import '../styles/login.css';
import PasswordInput from '../components/PasswordInput';
import logo from '../../../resources/logo.png';
import logoDark from '../../../resources/logoDarkmode.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate(); // Inicializa useNavigate

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        alert('Login exitoso');
        navigate('/dashboard'); // Redirige a dashboard con useNavigate
      } else {
        alert(data.message || 'Error en el inicio de sesión');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Ocurrió un problema con el servidor');
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`loginContainer ${darkMode ? 'dark' : ''}`}>
      <div className="leftContainer">
        <h1 className="title">Bienvenido a electriStock</h1>
        <h3 className="subTitle">Sistema de gestión y administración de inventario para la empresa Electriled's</h3>
      </div>
      <div className="rightContainer">
        <div className="logoContainer" onClick={toggleDarkMode}>
          <img src={darkMode ? logoDark : logo} alt="logo" />
        </div>
        <h1>Inicio de sesión</h1>
        <form className="loggin" onSubmit={handleLogin}>
          <h6>Email</h6>
          <input
            type="email"
            placeholder="tumail@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <h6>Contraseña</h6>
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Tu contraseña"
          />
          <button type="submit">Continuar</button>
        </form>
        <p>Aún no tienes cuenta? <Link to="/signUp">Crea una</Link></p>
      </div>
    </div>
  );
};

export default Login;
