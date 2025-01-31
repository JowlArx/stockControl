import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // Importa useLocation y useNavigate
import '../styles/verifyEmail.css'; // Importa el archivo CSS

const VerifyEmail = () => {
  const [verificationCode, setVerificationCode] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { email } = location.state || {};

  const handleVerifyEmail = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`http://localhost:3000/auth/verify-email?token=${verificationCode}`, {
        method: 'GET',
      });

      if (response.ok) {
        alert('Correo electrónico verificado exitosamente');
        navigate('/'); // Redirigir a la página de inicio de sesión
      } else {
        const data = await response.text(); // Cambiar a .text() para manejar respuestas no JSON
        alert(data || 'Verificación fallida');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Algo salió mal');
    }
  };

  return (
    <div className="verifyEmail">
      <div className="cardContainer">
        <h1>Verificación de correo electrónico</h1>
        <div className="textContainer">
          <p>Se ha enviado un código de verificación a {email}. <p>Por favor, ingrésalo a continuación para verificar tu cuenta.</p></p>
        </div>
        <form className="verifyEmailform" onSubmit={handleVerifyEmail}>
          <input
            type="text"
            placeholder="Código de verificación"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            required
          />
          <button type="submit">Verificar</button>   
        </form>
      </div>
    </div>
  );
};

export default VerifyEmail;