import React, { useEffect, useCallback } from 'react';

interface HealthBarProps {
  health: number;
  canHeal?: boolean;
  healAmount?: number;
  canRegenerate?: boolean;
  regenerateAmount?: number;
  onHealthChange?: (newHealth: number) => void;
  isDefeated?: boolean;
  damageThreshold?: number;
}

const HealthBar: React.FC<HealthBarProps> = ({
  health,
  canHeal = false,
  healAmount = 5,
  canRegenerate = false,
  regenerateAmount = 1,
  onHealthChange,
  isDefeated = false,
  damageThreshold = 80
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

  // Calculate the visual width based on actual health percentage
  const calculateVisualWidth = () => {
    return `${health}%`;
  };

  // Calculate color based on health percentage
  const calculateColor = () => {
    // Start with green (120), transition to yellow (60), then red (0)
    const hue = health > damageThreshold
      ? 120 // Green when health is high
      : health > damageThreshold / 2
      ? 60 + ((health - (damageThreshold / 2)) / (damageThreshold / 2)) * 60 // Transition yellow to green
      : (health / (damageThreshold / 2)) * 60; // Transition red to yellow
    
    return `hsl(${hue}, 100%, 50%)`;
  };

  return (
    <div className="health-bar">
      <div 
        className="health-fill" 
        style={{ 
          width: calculateVisualWidth(),
          backgroundColor: calculateColor(),
          '--health': health
        } as React.CSSProperties}
      />
    </div>
  );
};

export default HealthBar;