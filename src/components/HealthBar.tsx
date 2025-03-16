import React, { useEffect, useCallback } from 'react';

interface HealthBarProps {
  health: number; // Текущее здоровье
  initialHealth: number; // Начальное (максимальное) здоровье
  canHeal?: boolean; // Можно ли исцеляться?
  healAmount?: number; // Количество восстановления
  canRegenerate?: boolean; // Авто-регенерация
  regenerateAmount?: number; // Количество авто-регенерации
  onHealthChange?: (newHealth: number) => void; // Callback при изменении здоровья
  isDefeated?: boolean; // Проиграл ли персонаж?
  damageThreshold?: number; // Порог урона для смены цвета
}

const HealthBar: React.FC<HealthBarProps> = ({
  health,
  initialHealth,
  canHeal = false,
  healAmount = 5,
  canRegenerate = false,
  regenerateAmount = 1,
  onHealthChange,
  isDefeated = false,
  damageThreshold = 80
}) => {
  // Функция регенерации
  const regenerateHealth = useCallback(() => {
    if (canRegenerate && health < initialHealth && !isDefeated && onHealthChange) {
      onHealthChange(Math.min(initialHealth, health + regenerateAmount));
    }
  }, [canRegenerate, health, initialHealth, regenerateAmount, onHealthChange, isDefeated]);

  useEffect(() => {
    if (!canRegenerate || isDefeated) return;
    const intervalId = setInterval(regenerateHealth, 1000);
    return () => clearInterval(intervalId);
  }, [canRegenerate, isDefeated, regenerateHealth]);

  // Функция исцеления
  const heal = useCallback(() => {
    if (canHeal && health < initialHealth && !isDefeated && onHealthChange) {
      onHealthChange(Math.min(initialHealth, health + healAmount));
    }
  }, [canHeal, health, initialHealth, healAmount, onHealthChange, isDefeated]);

  // Вычисление цвета с учетом порога урона
  const calculateColor = () => {
    const healthPercentage = (health / initialHealth) * 100;
    const scaledDamageThreshold = (damageThreshold / 100) * initialHealth;
    if (health <= scaledDamageThreshold) {
      const hue = (healthPercentage / damageThreshold) * 60; // 60 (жёлтый) → 0 (красный)
      return `hsl(${hue}, 100%, 50%)`;
    } else {
      const hue = ((healthPercentage - damageThreshold) / (100 - damageThreshold)) * 60 + 60; // 120 (зелёный) → 60 (жёлтый)
      return `hsl(${hue}, 100%, 50%)`;
    }
  };

  // Динамическая ширина (min 300px, max 600px)
  const calculateWidth = () => {
    return `${Math.max(300, initialHealth * 2)}px`;
  };

  return (
    <div className="health-bar" style={{ width: calculateWidth() }}>
      <div
        className="health-fill"
        style={{
          width: `${(health / initialHealth) * 100}%`,
          backgroundColor: calculateColor(),
        }}
      />
      <span className="health-text">{Math.round((health / initialHealth) * 100)}%</span>
      {canHeal && health < initialHealth && !isDefeated && (
        <button
          onClick={heal}
          style={{
            position: 'absolute',
            right: '-40px',
            padding: '5px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          +
        </button>
      )}
    </div>
  );
};

export default HealthBar;