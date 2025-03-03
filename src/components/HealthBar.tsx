import React, { useEffect, useCallback } from 'react';

interface HealthBarProps {
  health: number;
  canHeal?: boolean;
  healAmount?: number;
  canRegenerate?: boolean;
  regenerateAmount?: number;
  onHealthChange?: (newHealth: number) => void;
  isDefeated?: boolean;
}

const HealthBar: React.FC<HealthBarProps> = ({
  health,
  canHeal = false,
  healAmount = 5,
  canRegenerate = false,
  regenerateAmount = 1,
  onHealthChange,
  isDefeated = false
}) => {
  const regenerateHealth = useCallback(() => {
    if (canRegenerate && health < 100 && !isDefeated) {
      const newHealth = Math.min(100, health + regenerateAmount);
      onHealthChange?.(newHealth);
    }
  }, [canRegenerate, health, regenerateAmount, onHealthChange, isDefeated]);

  useEffect(() => {
    if (!canRegenerate) return;

    const intervalId = setInterval(regenerateHealth, 1000);
    return () => clearInterval(intervalId);
  }, [canRegenerate, regenerateHealth]);

  return (
    <div className="health-bar">
      <div 
        className="health-fill" 
        style={{ 
          width: `${health}%`,
          backgroundColor: `hsl(${Math.max(0, (health * 1.2) - 120)}, 100%, 50%)`
        }}
      />
    </div>
  );
};

export default HealthBar;