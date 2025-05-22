import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './Auth.css'; // Импортируем стили
import { AuthError } from 'firebase/auth';

const SignUpForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }
    if (password.length < 6) {
      setError("Пароль должен быть не менее 6 символов.");
      return;
    }
    try {
      const user = await signUp(email, password);
      if (user) {
        console.log('User signed up:', user);
        // Успешная регистрация, можно добавить редирект или очистку формы
        // alert('Регистрация прошла успешно!'); // Убираем alert
      }
    } catch (err) {
      const firebaseError = err as AuthError;
      if (firebaseError.code === 'auth/email-already-in-use') {
        setError('Этот email уже используется.');
      } else if (firebaseError.code === 'auth/invalid-email') {
        setError('Некорректный формат email.');
      } else if (firebaseError.code === 'auth/weak-password') {
        setError('Пароль слишком слабый.');
      }
      else {
        setError(firebaseError.message || "Не удалось создать аккаунт. Пожалуйста, попробуйте еще раз.");
      }
    }
  };

  return (
    <div className="auth-form-container">
      <h2>Регистрация</h2>
      {error && <p className="auth-error-message">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="signup-email">Email:</label>
          <input id="signup-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="signup-password">Пароль:</label>
          <input id="signup-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="signup-confirm-password">Подтвердите пароль:</label>
          <input id="signup-confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
        </div>
        <button type="submit">Зарегистрироваться</button>
      </form>
    </div>
  );
};

export default SignUpForm;