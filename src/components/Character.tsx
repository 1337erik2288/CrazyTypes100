import React from 'react';
import './Character.css';
import { Equipment } from '../data/equipmentData';

interface CharacterProps {
  equipment: Equipment[];
  ownedEquipment?: Equipment[];
  onEquipmentChange?: (item: Equipment, action: 'equip' | 'unequip') => void;
  showEquipControls?: boolean;
}

const Character: React.FC<CharacterProps> = ({ equipment, ownedEquipment = [], onEquipmentChange, showEquipControls = false }) => {
  // Find equipped items by type
  const getEquippedItem = (type: string) => {
    return equipment.find(item => item.type === type);
  };

  const weapon = getEquippedItem('weapon');
  const armor = getEquippedItem('armor');
  const accessory = getEquippedItem('accessory');
  
  // Handle equipping an item
  const handleEquip = (item: Equipment) => {
    if (!onEquipmentChange) return;
    
    // const result = equipItem(item.id); // <-- REMOVE THIS LINE
    // if (result.success) { // <-- REMOVE THIS LINE
    //   onEquipmentChange(result.playerEquipment.equipped); // <-- REMOVE THIS LINE
    // } // <-- REMOVE THIS LINE
    onEquipmentChange(item, 'equip'); // <-- ADD THIS LINE
  };
  
  // Handle unequipping an item
  const handleUnequip = (item: Equipment) => {
    if (!onEquipmentChange) return;
    
    // const result = unequipItem(item.id); // <-- REMOVE THIS LINE
    // if (result.success) { // <-- REMOVE THIS LINE
    //   onEquipmentChange(result.playerEquipment.equipped); // <-- REMOVE THIS LINE
    // } // <-- REMOVE THIS LINE
    onEquipmentChange(item, 'unequip'); // <-- ADD THIS LINE
  };
  
  // Get available items by type that are not equipped
  const getAvailableItems = (type: string) => {
    return ownedEquipment.filter(item => 
      item.type === type && !equipment.some(equip => equip.id === item.id)
    );
  };
  
  const availableWeapons = getAvailableItems('weapon');
  const availableArmors = getAvailableItems('armor');
  const availableAccessories = getAvailableItems('accessory');

  return (
    <div className="character-container">
      <div className="character-model">
        {/* Base character */}
        <div className="character-base">👤</div>
        
        {/* Equipped items */}
        <div className="equipment-slots">
          <div className="equipment-slot weapon-slot">
            {weapon ? (
              <div className="equipped-item" title={weapon.name}>
                {weapon.icon}
              </div>
            ) : (
              <div className="empty-slot">🔄</div>
            )}
          </div>
          
          <div className="equipment-slot armor-slot">
            {armor ? (
              <div className="equipped-item" title={armor.name}>
                {armor.icon}
              </div>
            ) : (
              <div className="empty-slot">🔄</div>
            )}
          </div>
          
          <div className="equipment-slot accessory-slot">
            {accessory ? (
              <div className="equipped-item" title={accessory.name}>
                {accessory.icon}
              </div>
            ) : (
              <div className="empty-slot">🔄</div>
            )}
          </div>
        </div>
      </div>
      
      <div className="character-stats">
        {equipment.length > 0 ? (
          <div className="stats-list">
            {equipment.map(item => (
              <div key={item.id} className="equipped-stat">
                <span className="stat-icon">{item.icon}</span>
                <span className="stat-name">{item.name}</span>
                {/* Добавляем отображение бонусов для экипированного предмета */}
                <div className="item-bonuses">
                  {item.stats.map((stat, index) => (
                    <span key={index} className="bonus-stat">{stat}</span>
                  ))}
                </div>
                {showEquipControls && (
                  <button 
                    className="unequip-button" 
                    onClick={() => handleUnequip(item)}
                    title="Unequip"
                  >
                    ❌
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="no-equipment">Нет экипировки</div>
        )}
        
        {showEquipControls && ownedEquipment.length > 0 && (
          <div className="available-equipment">
            <h3>Доступная экипировка</h3>
            
            {availableWeapons.length > 0 && (
              <div className="equipment-category">
                <h4>Оружие</h4>
                {availableWeapons.map(item => (
                  <div key={item.id} className="available-item">
                    <span className="item-icon">{item.icon}</span>
                    <span className="item-name">{item.name}</span>
                    {/* Добавляем отображение бонусов для доступного предмета */}
                    <div className="item-bonuses">
                      {item.stats.map((stat, index) => (
                        <span key={index} className="bonus-stat">{stat}</span>
                      ))}
                    </div>
                    <button 
                      className="equip-button" 
                      onClick={() => handleEquip(item)}
                      title="Экипировать"
                    >
                      ✅
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {availableArmors.length > 0 && (
              <div className="equipment-category">
                <h4>Броня</h4>
                {availableArmors.map(item => (
                  <div key={item.id} className="available-item">
                    <span className="item-icon">{item.icon}</span>
                    <span className="item-name">{item.name}</span>
                    {/* Добавляем отображение бонусов для доступного предмета */}
                    <div className="item-bonuses">
                      {item.stats.map((stat, index) => (
                        <span key={index} className="bonus-stat">{stat}</span>
                      ))}
                    </div>
                    <button 
                      className="equip-button" 
                      onClick={() => handleEquip(item)}
                      title="Экипировать"
                    >
                      ✅
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {availableAccessories.length > 0 && (
              <div className="equipment-category">
                <h4>Аксессуары</h4>
                {availableAccessories.map(item => (
                  <div key={item.id} className="available-item">
                    <span className="item-icon">{item.icon}</span>
                    <span className="item-name">{item.name}</span>
                    {/* Добавляем отображение бонусов для доступного предмета */}
                    <div className="item-bonuses">
                      {item.stats.map((stat, index) => (
                        <span key={index} className="bonus-stat">{stat}</span>
                      ))}
                    </div>
                    <button 
                      className="equip-button" 
                      onClick={() => handleEquip(item)}
                      title="Экипировать"
                    >
                      ✅
                    </button>
                  </div>
                ))}
              </div>
            )}
            
          </div>
        )}
      </div>
    </div>
  );
};

export default Character;