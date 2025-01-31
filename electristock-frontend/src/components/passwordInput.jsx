import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Asegúrate de tener react-icons instalado
import '../styles/passwordInput.css'; // Importa el archivo CSS

const PasswordInput = ({ value, onChange, placeholder }) => {
  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="password-input-container">
      <input
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
      />
      <span className="password-toggle-icon" onClick={toggleShowPassword}>
        {showPassword ? <FaEyeSlash /> : <FaEye />}
      </span>
    </div>
  );
};

export default PasswordInput;