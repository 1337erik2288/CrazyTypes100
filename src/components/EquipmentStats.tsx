import React from 'react';
import './EquipmentStats.css';
import { Equipment } from '../data/equipmentData'; // Импортируем EquipmentEffects

interface EquipmentStatsProps {
  equipment: Equipment[];
}

// interface TotalStats extends EquipmentEffects { // <-- REMOVE THIS LINE
//   // Можно добавить сюда другие общие статы, если они появятся
// }

// Define TotalStats with required number properties
interface TotalStats { // <-- ADD THIS BLOCK
  playerDamageBonus: number;
  playerHealBonus: number;
  monsterDamageReduction: number;
  monsterHealReduction: number;
  monsterRegenReduction: number;
}

const EquipmentStats: React.FC<EquipmentStatsProps> = ({ equipment }) => {
  console.log('EquipmentStats received equipment:', equipment); 

  const calculateTotalStats = (): TotalStats => {
    let playerDamageBonus = 0;
    let playerHealBonus = 0;
    let monsterDamageReduction = 0;
    let monsterHealReduction = 0;
    let monsterRegenReduction = 0;
    
    equipment.forEach((item, index) => {
      const effects = item.effects as any; // Используем 'as any' для гибкости
      
      console.log(`Item ${index} (${item.name}):`, JSON.parse(JSON.stringify(item))); 
      if (effects) {
        console.log(`Item ${index} (${item.name}) effects:`, JSON.parse(JSON.stringify(effects))); 
        
        // Используем имена свойств из логов:
        playerDamageBonus += effects.damageBonus || 0; 
        playerHealBonus += effects.healBonus || 0;
        monsterDamageReduction += effects.monsterDamageReduction || 0;
        monsterHealReduction += effects.monsterHealReduction || 0; // <-- Исправлено имя свойства
        monsterRegenReduction += effects.monsterRegenReduction || 0;
      } else {
        console.log(`Item ${index} (${item.name}) has NO effects property or it is undefined.`);
      }
    });
    
    return {
      playerDamageBonus,
      playerHealBonus,
      monsterDamageReduction,
      monsterHealReduction,
      monsterRegenReduction
    };
  };

  const totalStats = calculateTotalStats();
  console.log('Calculated totalStats:', totalStats); 

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