import { Equipment, AVAILABLE_EQUIPMENT } from '../data/equipmentData';

const OWNED_EQUIPMENT_STORAGE_KEY = 'playerOwnedEquipment';

// Загружает купленные предметы из localStorage
export const getOwnedEquipment = (): Equipment[] => {
  const savedData = localStorage.getItem(OWNED_EQUIPMENT_STORAGE_KEY);
  if (savedData) {
    try {
      return JSON.parse(savedData);
    } catch (error) {
      console.error('Error parsing owned equipment:', error);
    }
  }
  return [];
};

// Сохраняет список купленных предметов в localStorage
export const saveOwnedEquipment = (ownedItems: Equipment[]): void => {
  localStorage.setItem(OWNED_EQUIPMENT_STORAGE_KEY, JSON.stringify(ownedItems));
};

// Добавляет предмет в список купленных
export const addOwnedItem = (itemToAdd: Equipment): Equipment[] => {
  const currentOwned = getOwnedEquipment();
  if (!currentOwned.find(item => item.id === itemToAdd.id)) {
    const updatedOwned = [...currentOwned, itemToAdd];
    saveOwnedEquipment(updatedOwned);
    return updatedOwned;
  }
  return currentOwned;
};

// Проверяет, куплен ли предмет
export const isItemOwned = (itemId: string): boolean => {
  const owned = getOwnedEquipment();
  return owned.some(item => item.id === itemId);
};

// Получает список предметов, доступных для покупки (еще не купленных)
export const getAvailableForPurchaseEquipment = (): Equipment[] => {
  const ownedEquipment = getOwnedEquipment();
  return AVAILABLE_EQUIPMENT.filter(shopItem => 
    !ownedEquipment.some(ownedItem => ownedItem.id === shopItem.id)
  );
};