import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './Auth.css'; // Импортируем стили
import { AuthError } from 'firebase/auth';

const AuthDetails: React.FC = () => {
  const { currentUser, logOut } = useAuth();

  if (!currentUser) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await logOut();
      // Успешный выход, можно добавить редирект
      // alert('Вы успешно вышли из системы.'); // Убираем alert
    } catch (error) {
      // Можно отобразить ошибку выхода, если это необходимо, но обычно это редкий случай
      console.error("Logout failed:", (error as AuthError).message);
      alert(`Ошибка выхода: ${(error as AuthError).message}`); // Оставим alert для критической ошибки выхода, если нужно
    }
  };

  return (
    <div className="auth-details-container">
      <p>Вы вошли как: {currentUser.email}</p>
      <button onClick={handleLogout}>Выйти</button>
    </div>
  );
};

export default AuthDetails;