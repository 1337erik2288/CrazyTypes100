import React from 'react';
import './EquipmentStats.css';
import { Equipment } from '../data/equipmentData'; // Импортируем EquipmentEffects

interface EquipmentStatsProps {
  equipment: Equipment[];
}

interface TotalStats {
  playerDamageBonus: number;
  playerHealBonus: number;
  monsterHealBonus: number;
  monsterDamageReduction: number;
  monsterHealReduction: number;
  monsterRegenReduction: number;
}

const EquipmentStats: React.FC<EquipmentStatsProps> = ({ equipment }) => {
  const calculateTotalStats = (): TotalStats => {
    let playerDamageBonus = 0;
    let playerHealBonus = 0;
    let monsterHealBonus = 0; // <--- Добавлено объявление
    let monsterDamageReduction = 0;
    let monsterHealReduction = 0;
    let monsterRegenReduction = 0;

    equipment.forEach((item /*, index */) => { // <--- Удален неиспользуемый 'index'
      const effects = item.effects;
      if (effects) {
        playerDamageBonus += effects.playerDamageBonus || 0;
        playerHealBonus += effects.playerHealBonus || 0;
        monsterHealBonus += effects.monsterHealBonus || 0; // <--- Добавлено суммирование
        monsterDamageReduction += effects.monsterDamageReduction || 0;
        monsterHealReduction += effects.monsterHealReduction || 0;
        monsterRegenReduction += effects.monsterRegenReduction || 0;
      }
    });

    return {
      playerDamageBonus,
      playerHealBonus,
      monsterHealBonus, // <--- Добавлено в возвращаемый объект
      monsterDamageReduction,
      monsterHealReduction,
      monsterRegenReduction
    };
  };

  const totalStats = calculateTotalStats();
  // console.log('Calculated totalStats:', totalStats); 

  const noBonusesFromEquipment = Object.values(totalStats).every(value => value === 0);

  return (
    <div className="equipment-stats-container">
      <h4>Общие бонусы от экипировки:</h4>
      {equipment.length === 0 ? (
        <p>Нет экипированных предметов.</p>
      ) : noBonusesFromEquipment ? (
        <p>Экипированные предметы не дают активных бонусов.</p>
      ) : (
        <ul className="stats-summary">
          {totalStats.playerDamageBonus > 0 && (
            <li>Урон игрока: +{totalStats.playerDamageBonus}</li>
          )}
          {totalStats.playerHealBonus > 0 && (
            <li>Лечение игрока: +{totalStats.playerHealBonus}</li>
          )}
          {totalStats.monsterDamageReduction > 0 && (
            <li>Урон монстра: -{totalStats.monsterDamageReduction}</li>
          )}
          {totalStats.monsterHealReduction > 0 && (
            <li>Лечение монстра: -{totalStats.monsterHealReduction}</li>
          )}
          {totalStats.monsterRegenReduction > 0 && (
            <li>Реген. монстра: -{totalStats.monsterRegenReduction}</li>
          )}
        </ul>
      )}
    </div>
  );
};

export default EquipmentStats;