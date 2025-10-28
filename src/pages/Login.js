import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const API_URL_BASE = process.env.REACT_APP_API_URL_BASE;
const AUTH_URL = `${API_URL_BASE}/auth`;

console.log('API Base URL:', API_URL_BASE);
console.log('Auth URL:', AUTH_URL);

function Login() {
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch(`${AUTH_URL}/login?email=${loginForm.email}&password=${loginForm.password}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.errorMsg || 'Помилка логіну');
      } else {
        
        localStorage.setItem('currentUser', JSON.stringify(data));
        
        navigate('/');
      }
    } catch (err) {
      setError('Не вдалося підключитися до сервера.');
    }
  };

  return (
    <div className="auth-container">
      <h2>Вхід</h2>
      <form onSubmit={handleSubmit}>
        <input name="email" value={loginForm.email} onChange={handleChange} placeholder="Email" type="email" />
        <input name="password" value={loginForm.password} onChange={handleChange} placeholder="Пароль" type="password" />
        <button type="submit">Увійти</button>
      </form>
      {error && <div className="error-message">Помилка: {error}</div>}
      <p>Немає акаунту? <Link to="/register">Зареєструватись</Link></p>
    </div>
  );
}

export default Login;