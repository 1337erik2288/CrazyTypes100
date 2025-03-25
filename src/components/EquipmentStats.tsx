import React from 'react';
import { Equipment } from '../services/equipmentService';
import './EquipmentStats.css';

interface EquipmentStatsProps {
  equipment: Equipment[];
}

const EquipmentStats: React.FC<EquipmentStatsProps> = ({ equipment }) => {
  // Calculate total stats from equipment
  const calculateTotalStats = () => {
    let damageBonus = 0;
    let healBonus = 0;
    let regenerateBonus = 0;
    let mistakePenaltyReduction = 0;
    
    equipment.forEach(item => {
      if (item.effects) {
        damageBonus += item.effects.damageBonus || 0;
        healBonus += item.effects.healBonus || 0;
        regenerateBonus += item.effects.regenerateBonus || 0;
        mistakePenaltyReduction += item.effects.mistakePenaltyReduction || 0;
      }
    });
    
    return {
      damageBonus,
      healBonus,
      regenerateBonus,
      mistakePenaltyReduction
    };
  };
  
  const stats = calculateTotalStats();
  
  return (
    <div className="equipment-stats-container">
      <div className="stat-item">
        <span className="stat-value">+{stats.damageBonus}</span>
        <span className="stat-label">Damage</span>
      </div>
      <div className="stat-item">
        <span className="stat-value">+{stats.healBonus}</span>
        <span className="stat-label">Healing</span>
      </div>
      <div className="stat-item">
        <span className="stat-value">+{stats.regenerateBonus}</span>
        <span className="stat-label">Regeneration</span>
      </div>
      <div className="stat-item">
        <span className="stat-value">-{stats.mistakePenaltyReduction}</span>
        <span className="stat-label">Monster Heal</span>
      </div>
    </div>
  );
};

export default EquipmentStats;