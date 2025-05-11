import React, { useState, useEffect } from 'react';
import { PlayerProgress, addRewards } from '../services/playerService';
import Character from './Character';
import { Equipment, getPlayerEquipment, purchaseEquipment, equipItem, unequipItem } from '../services/equipmentService';
import Casino from './Casino';
import './Casino.css';
import './Shop.css';

interface ShopProps {
  playerProgress: PlayerProgress;
  onReturnToMenu: () => void;
  onEquipmentPurchased: (updatedProgress: PlayerProgress) => void;
}

const Shop: React.FC<ShopProps> = ({ playerProgress, onReturnToMenu, onEquipmentPurchased }) => {
  const [availableEquipment, setAvailableEquipment] = useState<Equipment[]>([]);
  const [playerEquipment, setPlayerEquipment] = useState<Equipment[]>([]);
  const [equippedItems, setEquippedItems] = useState<Equipment[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showCasino, setShowCasino] = useState<boolean>(false);

  useEffect(() => {
    // Load player's equipment and available equipment for purchase
    const equipment = getPlayerEquipment();
    setPlayerEquipment(equipment.owned);
    setEquippedItems(equipment.equipped);
    setAvailableEquipment(equipment.available);
  }, []);

  const handlePurchase = (item: Equipment) => {
    if (playerProgress.gold < item.price) {
      setErrorMessage('Not enough gold!');
      setTimeout(() => setErrorMessage(''), 2000);
      return;
    }

    const result = purchaseEquipment(item.id);
    if (result.success) {
      setPlayerEquipment(result.playerEquipment.owned);
      setEquippedItems(result.playerEquipment.equipped);
      setAvailableEquipment(result.playerEquipment.available);
      onEquipmentPurchased(result.playerProgress);
      setErrorMessage('');
    } else {
      setErrorMessage(result.message || 'Failed to purchase item');
      setTimeout(() => setErrorMessage(''), 2000);
    }
  };
  
  // Handle equipment change (equip/unequip)
  const handleEquipmentChange = (updatedEquipment: Equipment[]) => {
    setEquippedItems(updatedEquipment);
  };
  
  // Обработчик для открытия/закрытия казино
  const toggleCasino = () => {
    setShowCasino(prev => !prev);
  };
  
  // Обработчик выигрыша в казино
  const handleCasinoWin = (amount: number) => {
    const updatedProgress = addRewards(0, amount);
    onEquipmentPurchased(updatedProgress);
  };

  const filteredEquipment = selectedCategory === 'all' 
    ? availableEquipment 
    : availableEquipment.filter(item => item.type === selectedCategory);

  return (
    <div className="shop-container" style={{ position: 'relative' }}>
      <div className="shop-header">
        <h1>Магазин экипировки</h1>
        <button className="menu-button-shop" onClick={onReturnToMenu}>Вернуться в меню</button>
      </div>

      <div className="shop-content">
        <div className="character-preview">
          <Character 
            equipment={equippedItems} 
            ownedEquipment={playerEquipment}
            onEquipmentChange={handleEquipmentChange}
            showEquipControls={true}
          />
          <div className="player-gold">
            <span className="gold-icon">💰</span>
            <span className="gold-amount">{playerProgress.gold}</span>
          </div>
        </div>

        <div className="shop-items">
          <div className="category-filter">
            <button 
              className={`category-button ${selectedCategory === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('all')}
            >
              Все
            </button>
            <button 
              className={`category-button ${selectedCategory === 'weapon' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('weapon')}
            >
              Оружие
            </button>
            <button 
              className={`category-button ${selectedCategory === 'armor' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('armor')}
            >
              Броня
            </button>
            <button 
              className={`category-button ${selectedCategory === 'accessory' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('accessory')}
            >
              Аксессуары
            </button>
          </div>

          {errorMessage && <div className="error-message">{errorMessage === 'Not enough gold!' ? 'Недостаточно золота!' : errorMessage === 'Failed to purchase item' ? 'Не удалось купить предмет' : errorMessage}</div>}

          <div className="equipment-grid">
            {filteredEquipment.map(item => {
              const isOwned = playerEquipment.some(equip => equip.id === item.id);
              return (
                <div key={item.id} className={`equipment-item ${isOwned ? 'owned' : ''}`}>
                  <div className="equipment-icon">{item.icon}</div>
                  <div className="equipment-details">
                    <h3>{item.name}</h3>
                    <p className="equipment-description">{item.description}</p>
                    <div className="equipment-stats">
                      {item.stats.map((stat: string, index: number) => (
                        <span key={index} className="stat">{stat}</span>
                      ))}
                    </div>
                  </div>
                  <div className="equipment-price">
                    <span className="gold-icon">💰</span>
                    <span>{item.price}</span>
                  </div>
                  <button 
                    className="purchase-button" 
                    onClick={() => handlePurchase(item)}
                    disabled={isOwned || playerProgress.gold < item.price}
                  >
                    {isOwned ? 'Куплено' : 'Купить'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Секретная кнопка казино */}
      <button 
        className="secret-casino-button" 
        onClick={toggleCasino} 
        aria-label="Secret Casino"
      />
      
      {/* Модальное окно казино */}
      {showCasino && (
        <Casino onClose={toggleCasino} onWin={handleCasinoWin} />
      )}
    </div>
  );
};

export default Shop;