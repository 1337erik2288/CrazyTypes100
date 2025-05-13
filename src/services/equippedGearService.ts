import { Equipment } from '../data/equipmentData';
import { GamePlayConfig } from '../components/GamePlay'; // Предполагаем, что GamePlayConfig экспортируется

const EQUIPPED_ITEMS_STORAGE_KEY = 'playerEquippedItems';

// Загружает надетые предметы из localStorage
export const getEquippedItems = (): Equipment[] => {
  const savedData = localStorage.getItem(EQUIPPED_ITEMS_STORAGE_KEY);
  if (savedData) {
    try {
      return JSON.parse(savedData);
    } catch (error) {
      console.error('Error parsing equipped items:', error);
    }
  }
  return [];
};

// Сохраняет список надетых предметов в localStorage
export const saveEquippedItems = (equippedItems: Equipment[]): void => {
  localStorage.setItem(EQUIPPED_ITEMS_STORAGE_KEY, JSON.stringify(equippedItems));
};

// Экипирует предмет
export const equipItem = (itemToEquip: Equipment, currentOwned: Equipment[]): { success: boolean, equipped: Equipment[], message?: string } => {
  if (!currentOwned.find(owned => owned.id === itemToEquip.id)) {
    return { success: false, equipped: getEquippedItems(), message: "Предмет не найден в инвентаре." };
  }

  let equipped = getEquippedItems();
  // Снять предмет того же типа, если он уже надет
  equipped = equipped.filter(e => e.type !== itemToEquip.type);
  equipped.push(itemToEquip);
  saveEquippedItems(equipped);
  return { success: true, equipped };
};

// Снимает предмет
export const unequipItem = (itemIdToUnequip: string): { success: boolean, equipped: Equipment[] } => {
  let equipped = getEquippedItems();
  equipped = equipped.filter(e => e.id !== itemIdToUnequip);
  saveEquippedItems(equipped);
  return { success: true, equipped };
};

// Применяет эффекты от надетых предметов к конфигурации игры
export const applyEquipmentEffects = (config: GamePlayConfig, equipment: Equipment[]): GamePlayConfig => {
  let newConfig = { ...config };
  equipment.forEach(item => {
    if (item.effects) {
      if (item.effects.damageBonus) {
        // Логика бонуса к урону теперь обрабатывается в GamePlay.tsx напрямую с playerBaseDamage
        // Здесь можно оставить место для других глобальных эффектов, если они появятся
      }
      if (item.effects.healBonus) {
        newConfig.healAmount = (newConfig.healAmount || 0) + item.effects.healBonus;
      }
      if (item.effects.regenerateBonus) {
        newConfig.regenerateAmount = (newConfig.regenerateAmount || 0) + item.effects.regenerateBonus;
      }
      if (item.effects.mistakePenaltyReduction) {
        newConfig.healOnMistake = Math.max(0, (newConfig.healOnMistake || 0) - item.effects.mistakePenaltyReduction);
      }
      // Добавьте другие эффекты по мере необходимости
    }
  });
  return newConfig;
};