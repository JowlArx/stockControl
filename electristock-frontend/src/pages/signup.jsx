import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Importa el componente Link y useNavigate
import '../styles/signup.css'; // Importa el archivo CSS
import logo from '../../../resources/logo.png'; // Asegúrate de que la ruta sea correcta
import logoDark from '../../../resources/logoDarkmode.png'; 
import PasswordInput from '../components/PasswordInput'; // Importa el componente PasswordInput

const SignUp = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate(); // Hook para redirigir

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, full_name: fullName, email }),
      });
      const data = await response.json();

      if (response.ok) {
        alert('Registro exitoso. Por favor, verifica tu correo electrónico.');
        navigate('/verify-email', { state: { email } }); // Redirigir a la página de verificación de correo
      } else {
        alert(data.message || 'Registro fallido');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Algo salió mal');
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
        <h1>Registro</h1>
        <form className="signupForm" onSubmit={handleSignUp}>
          <input
            type="text"
            placeholder="Nombre de usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <PasswordInput
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <PasswordInput
            type="password"
            placeholder="Confirmar Contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Nombre completo"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit">Registrarse</button>
        </form>
        <p>¿Ya tenes una cuenta? <Link to="/">Inicia sesión</Link></p>
      </div>
    </div>
  );
};

export default SignUp;