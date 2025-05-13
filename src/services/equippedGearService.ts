import { Equipment } from '../data/equipmentData';
import { GamePlayConfig } from '../components/GamePlay'; // Убедитесь, что GamePlayConfig импортирован

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

  let totalPlayerHealBonus = 0;
  let totalMonsterHealReduction = 0;
  let totalMonsterRegenReduction = 0;
  // playerDamageBonus и monsterDamageReduction обрабатываются напрямую в GamePlay.tsx

  equipment.forEach(item => {
    if (item.effects) {
      totalPlayerHealBonus += item.effects.playerHealBonus || 0;
      totalMonsterHealReduction += item.effects.monsterHealReduction || 0;
      totalMonsterRegenReduction += item.effects.monsterRegenReduction || 0;
      // playerDamageBonus не меняет GamePlayConfig напрямую
      // monsterDamageReduction не меняет GamePlayConfig напрямую
    }
  });

  // Применяем бонусы, влияющие на GamePlayConfig
  newConfig.healAmount = (config.healAmount || 0) + totalPlayerHealBonus; // Бонус к лечению игрока
  newConfig.healOnMistake = Math.max(0, (config.healOnMistake || 0) - totalMonsterHealReduction); // Уменьшение лечения монстра при ошибке
  newConfig.regenerateAmount = Math.max(0, (config.regenerateAmount || 0) - totalMonsterRegenReduction); // Уменьшение регенерации монстра

  return newConfig;
};