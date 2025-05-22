import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './Auth.css'; // Импортируем стили
import { AuthError } from 'firebase/auth';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const user = await signIn(email, password);
      if (user) {
        console.log('User signed in:', user);
        // Успешный вход, можно добавить редирект
        // alert('Вход выполнен успешно!'); // Убираем alert
      }
    } catch (err) {
      const firebaseError = err as AuthError;
      if (firebaseError.code === 'auth/user-not-found' || firebaseError.code === 'auth/wrong-password' || firebaseError.code === 'auth/invalid-credential') {
        setError('Неверный email или пароль.');
      } else if (firebaseError.code === 'auth/invalid-email') {
        setError('Некорректный формат email.');
      } else {
        setError(firebaseError.message || "Не удалось войти. Проверьте email и пароль.");
      }
    }
  };

  return (
    <div className="auth-form-container">
      <h2>Вход</h2>
      {error && <p className="auth-error-message">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="login-email">Email:</label>
          <input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="login-password">Пароль:</label>
          <input id="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit">Войти</button>
      </form>
    </div>
  );
};

export default LoginForm;