import React, { useState, useEffect } from 'react';
import { PlayerProgress, addRewards, getPlayerProgress, savePlayerProgress } from '../services/playerService'; // getPlayerProgress, savePlayerProgress
import Character from './Character';
// import { Equipment, getPlayerEquipment, purchaseEquipment, equipItem, unequipItem } from '../services/equipmentService'; // <--- УДАЛИТЬ ЭТОТ ИМПОРТ
import { Equipment } from '../data/equipmentData'; // <--- Импорт Equipment
import { getOwnedEquipment, addOwnedItem, getAvailableForPurchaseEquipment } from '../services/inventoryService'; // <--- Новый сервис инвентаря
import { getEquippedItems, equipItem as equipItemService, unequipItem as unequipItemService } from '../services/equippedGearService'; // <--- Новый сервис экипировки
import Casino from './Secret';
import './Secret.css';
import './Shop.css';

interface ShopProps {
  // playerProgress: PlayerProgress; // Удалено, так как не используется напрямую
  onReturnToMenu: () => void;
  onEquipmentPurchased: (updatedProgress: PlayerProgress) => void;
}

const Shop: React.FC<ShopProps> = ({ /* playerProgress, */ onReturnToMenu, onEquipmentPurchased }) => { // playerProgress удален из деструктуризации
  const [currentGold, setCurrentGold] = useState<number>(0);
  const [availableForPurchase, setAvailableForPurchase] = useState<Equipment[]>([]);
  const [ownedEquipment, setOwnedEquipment] = useState<Equipment[]>([]);
  const [equippedItems, setEquippedItems] = useState<Equipment[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showCasino, setShowCasino] = useState<boolean>(false);

  useEffect(() => {
    const progress = getPlayerProgress(); // Загружаем актуальный прогресс
    setCurrentGold(progress.gold);

    setOwnedEquipment(getOwnedEquipment());
    setEquippedItems(getEquippedItems());
    setAvailableForPurchase(getAvailableForPurchaseEquipment());
  }, []);

  const refreshShopData = () => {
    const progress = getPlayerProgress();
    setCurrentGold(progress.gold);
    setOwnedEquipment(getOwnedEquipment());
    setEquippedItems(getEquippedItems());
    setAvailableForPurchase(getAvailableForPurchaseEquipment());
  };

  const handlePurchase = (itemToPurchase: Equipment) => {
    let progress = getPlayerProgress(); // Получаем текущий прогресс

    if (progress.gold < itemToPurchase.price) {
      setErrorMessage('Недостаточно золота!');
      setTimeout(() => setErrorMessage(''), 2000);
      return;
    }

    // Вычитаем золото
    progress.gold -= itemToPurchase.price;
    savePlayerProgress(progress); // Сохраняем обновленный прогресс (золото)

    // Добавляем предмет в инвентарь
    const updatedOwned = addOwnedItem(itemToPurchase);
    setOwnedEquipment(updatedOwned);

    // Обновляем список доступных для покупки
    setAvailableForPurchase(getAvailableForPurchaseEquipment());
    setCurrentGold(progress.gold); // Обновляем золото в UI

    // Note: playerProgress passed to onEquipmentPurchased might be stale here if it was from props.
    // It's better to pass the 'progress' variable that was just updated.
    onEquipmentPurchased(progress); 
    setErrorMessage('');
  };
  
  const handleEquipmentChange = (item: Equipment, action: 'equip' | 'unequip') => {
    if (action === 'equip') {
      const result = equipItemService(item, ownedEquipment); 
      if (result.success) {
        setEquippedItems(result.equipped);
      } else if (result.message) { // Check for message only on equip action result
        setErrorMessage(result.message);
        setTimeout(() => setErrorMessage(''), 2000);
      }
    } else { // action === 'unequip'
      const result = unequipItemService(item.id); // This result does not have a 'message' property
      if (result.success) {
        setEquippedItems(result.equipped);
      }
      // If unequipItemService could fail with a message, its return type and handling here would need adjustment.
    }
  };
  
  // Обработчик для открытия/закрытия казино
  const toggleCasino = () => {
    setShowCasino(prev => !prev);
  };
  
  // Обработчик выигрыша в казино
  const handleCasinoWin = (amount: number) => {
    const updatedProgress = addRewards(0, amount); // addRewards уже сохраняет прогресс
    // Note: playerProgress passed to onEquipmentPurchased might be stale here if it was from props.
    // It's better to pass the 'updatedProgress' variable that was just updated.
    onEquipmentPurchased(updatedProgress);
    refreshShopData(); // Обновляем данные магазина после выигрыша
  };

  const filteredEquipment = selectedCategory === 'all' 
    ? availableForPurchase
    : availableForPurchase.filter(item => item.type === selectedCategory);

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
            ownedEquipment={ownedEquipment} // Передаем купленное снаряжение
            // Следующая строка вызовет ошибку TypeScript до тех пор, пока тип onEquipmentChange
            // в CharacterProps (в файле Character.tsx) не будет изменен на:
            // (item: Equipment, action: 'equip' | 'unequip') => void;
            onEquipmentChange={handleEquipmentChange} 
            showEquipControls={true}
          />
          <div className="player-gold">
            <span className="gold-icon">💰</span>
            <span className="gold-amount">{currentGold}</span> {/* Используем currentGold */}
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
              // const isOwned = ownedEquipment.some(equip => equip.id === item.id); // Уже отфильтровано в availableForPurchase
              return (
                <div key={item.id} className={`equipment-item`}> {/* Удален класс 'owned', т.к. показываем только доступные */}
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
                    disabled={currentGold < item.price} // Проверяем по currentGold
                  >
                    Купить
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