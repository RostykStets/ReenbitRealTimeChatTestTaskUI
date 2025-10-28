import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createInitialRegisterForm } from '../models/initialState';

const API_URL_BASE = process.env.REACT_APP_API_URL_BASE;
const AUTH_URL = `${API_URL_BASE}/auth`;

function Register() {
  const [registerForm, setRegisterForm] = useState(createInitialRegisterForm());
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRegisterForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch(`${AUTH_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerForm),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.errorMsg || 'Сталася помилка');
      } else {
        console.log('Реєстрація успішна:', data);

        localStorage.setItem('currentUser', JSON.stringify(data));

        navigate('/');
      }
    } catch (error) {
      console.error('Мережева помилка:', error);
      setError('Не вдалося підключитися до сервера.');
    }
  };

  return (
    <div className="auth-container">
      <h2>Реєстрація</h2>
      <form onSubmit={handleSubmit}>
        <input name="name" value={registerForm.name} onChange={handleChange} placeholder="Ім'я" />
        <input name="surname" value={registerForm.surname} onChange={handleChange} placeholder="Прізвище" />
        <input name="email" value={registerForm.email} onChange={handleChange} placeholder="Email" type="email" />
        <input name="password" value={registerForm.password} onChange={handleChange} placeholder="Пароль" type="password" />
        <button type="submit">Зареєструватись</button>
      </form>
      {error && <div className="error-message">Помилка: {error}</div>}
      <p>Вже маєте акаунт? <Link to="/login">Увійти</Link></p>
    </div>
  );
}

export default Register;