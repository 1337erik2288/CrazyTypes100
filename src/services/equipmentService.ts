import { getPlayerProgress, savePlayerProgress, PlayerProgress } from './playerService';

export interface Equipment {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'weapon' | 'armor' | 'accessory';
  price: number;
  stats: string[];
  effects?: {
    damageBonus?: number;
    healBonus?: number;
    regenerateBonus?: number;
    mistakePenaltyReduction?: number;
  };
}

interface PlayerEquipment {
  owned: Equipment[];
  equipped: Equipment[];
  available: Equipment[];
}

interface PurchaseResult {
  success: boolean;
  message?: string;
  playerEquipment: PlayerEquipment;
  playerProgress: PlayerProgress;
}

// Available equipment in the shop
const AVAILABLE_EQUIPMENT: Equipment[] = [
  {
    id: 'weapon_1',
    name: 'Простой Меч',
    description: 'Простой меч, который увеличивает ваш урон.',
    icon: '🗡️',
    type: 'weapon',
    price: 100,
    stats: ['+1 Урон'],
    effects: {
      damageBonus: 1
    }
  },
  {
    id: 'weapon_2',
    name: 'Магический Жезл',
    description: 'Магический жезл, который значительно увеличивает ваш урон.',
    icon: '🪄',
    type: 'weapon',
    price: 250,
    stats: ['+3 Урон'],
    effects: {
      damageBonus: 3
    }
  },
  {
    id: 'armor_1',
    name: 'Кожаная Броня',
    description: 'Базовая защита, которая уменьшает лечение монстра при ошибках.',
    icon: '🥋',
    type: 'armor',
    price: 150,
    stats: ['-1 Лечение Монстра'],
    effects: {
      mistakePenaltyReduction: 1
    }
  },
  {
    id: 'armor_2',
    name: 'Стальная Кираса',
    description: 'Тяжелая броня, которая значительно уменьшает лечение монстра при ошибках.',
    icon: '🛡️',
    type: 'armor',
    price: 300,
    stats: ['-3 Лечение Монстра'],
    effects: {
      mistakePenaltyReduction: 3
    }
  },
  {
    id: 'accessory_1',
    name: 'Амулет Лечения',
    description: 'Амулет, который увеличивает вашу силу лечения.',
    icon: '📿',
    type: 'accessory',
    price: 200,
    stats: ['+2 Лечение'],
    effects: {
      healBonus: 2
    }
  },
  {
    id: 'accessory_2',
    name: 'Кольцо Регенерации',
    description: 'Кольцо, которое увеличивает вашу регенерацию здоровья.',
    icon: '💍',
    type: 'accessory',
    price: 350,
    stats: ['+2 Регенерация'],
    effects: {
      regenerateBonus: 2
    }
  }
];

// Get player's equipment from localStorage
export const getPlayerEquipment = (): PlayerEquipment => {
  const savedEquipment = localStorage.getItem('playerEquipment');
  const savedEquipped = localStorage.getItem('playerEquippedItems');
  let ownedEquipment: Equipment[] = [];
  let equippedEquipment: Equipment[] = [];
  
  if (savedEquipment) {
    try {
      ownedEquipment = JSON.parse(savedEquipment);
    } catch (error) {
      console.error('Error parsing player equipment:', error);
      ownedEquipment = [];
    }
  }
  
  if (savedEquipped) {
    try {
      equippedEquipment = JSON.parse(savedEquipped);
    } catch (error) {
      console.error('Error parsing equipped items:', error);
      equippedEquipment = [];
    }
  } else if (ownedEquipment.length > 0 && equippedEquipment.length === 0) {
    // For backward compatibility: if we have owned equipment but no equipped items saved,
    // assume all owned items are equipped (previous behavior)
    equippedEquipment = [...ownedEquipment];
    // Save this state for future use
    localStorage.setItem('playerEquippedItems', JSON.stringify(equippedEquipment));
  }
  
  // Filter available equipment to exclude owned items
  const availableEquipment = AVAILABLE_EQUIPMENT.filter(item => 
    !ownedEquipment.some(owned => owned.id === item.id)
  );
  
  return {
    owned: ownedEquipment,
    equipped: equippedEquipment,
    available: availableEquipment
  };
};

// Save player's equipment to localStorage
export const savePlayerEquipment = (equipment: Equipment[]): void => {
  localStorage.setItem('playerEquipment', JSON.stringify(equipment));
};

// Save player's equipped items to localStorage
export const savePlayerEquippedItems = (equipment: Equipment[]): void => {
  localStorage.setItem('playerEquippedItems', JSON.stringify(equipment));
};

// Save full player equipment state
export const savePlayerEquipmentState = (playerEquipment: PlayerEquipment): void => {
  localStorage.setItem('playerEquipment', JSON.stringify(playerEquipment.owned));
  localStorage.setItem('playerEquippedItems', JSON.stringify(playerEquipment.equipped));
};

// Purchase equipment
export const purchaseEquipment = (equipmentId: string): PurchaseResult => {
  const playerProgress = getPlayerProgress();
  const playerEquipment = getPlayerEquipment();
  
  // Find the equipment in available items
  const itemToPurchase = playerEquipment.available.find(item => item.id === equipmentId);
  
  if (!itemToPurchase) {
    return {
      success: false,
      message: 'Item not found',
      playerEquipment,
      playerProgress
    };
  }
  
  // Check if player has enough gold
  if (playerProgress.gold < itemToPurchase.price) {
    return {
      success: false,
      message: 'Not enough gold',
      playerEquipment,
      playerProgress
    };
  }
  
  // Deduct gold from player
  playerProgress.gold -= itemToPurchase.price;
  
  // Add item to player's owned equipment
  const updatedOwnedEquipment = [...playerEquipment.owned, itemToPurchase];
  
  // Update available equipment
  const updatedAvailableEquipment = playerEquipment.available.filter(
    item => item.id !== equipmentId
  );
  
  // Save changes
  savePlayerProgress(playerProgress);
  savePlayerEquipment(updatedOwnedEquipment);
  
  // Create updated player equipment state
  const updatedPlayerEquipment = {
    owned: updatedOwnedEquipment,
    equipped: playerEquipment.equipped,
    available: updatedAvailableEquipment
  };
  
  return {
    success: true,
    playerEquipment: updatedPlayerEquipment,
    playerProgress
  };
};

// Equip an item
export const equipItem = (itemId: string): PurchaseResult => {
  const playerProgress = getPlayerProgress();
  const playerEquipment = getPlayerEquipment();
  
  // Find the item in owned equipment
  const itemToEquip = playerEquipment.owned.find(item => item.id === itemId);
  
  if (!itemToEquip) {
    return {
      success: false,
      message: 'Item not found in your inventory',
      playerEquipment,
      playerProgress
    };
  }
  
  // Check if an item of the same type is already equipped
  const alreadyEquippedItem = playerEquipment.equipped.find(item => item.type === itemToEquip.type);
  
  // If an item of the same type is already equipped, replace it
  let updatedEquippedEquipment = [...playerEquipment.equipped];
  
  if (alreadyEquippedItem) {
    // Replace the item of the same type
    updatedEquippedEquipment = updatedEquippedEquipment.filter(item => item.type !== itemToEquip.type);
  }
  
  // Add the new item to equipped items
  updatedEquippedEquipment.push(itemToEquip);
  
  // Save changes
  savePlayerEquippedItems(updatedEquippedEquipment);
  
  // Create updated player equipment state
  const updatedPlayerEquipment = {
    owned: playerEquipment.owned,
    equipped: updatedEquippedEquipment,
    available: playerEquipment.available
  };
  
  return {
    success: true,
    message: `${itemToEquip.name} equipped`,
    playerEquipment: updatedPlayerEquipment,
    playerProgress
  };
};

// Unequip an item
export const unequipItem = (itemId: string): PurchaseResult => {
  const playerProgress = getPlayerProgress();
  const playerEquipment = getPlayerEquipment();
  
  // Find the item in equipped items
  const itemToUnequip = playerEquipment.equipped.find(item => item.id === itemId);
  
  if (!itemToUnequip) {
    return {
      success: false,
      message: 'Item not equipped',
      playerEquipment,
      playerProgress
    };
  }
  
  // Remove the item from equipped items
  const updatedEquippedEquipment = playerEquipment.equipped.filter(item => item.id !== itemId);
  
  // Save changes
  savePlayerEquippedItems(updatedEquippedEquipment);
  
  // Create updated player equipment state
  const updatedPlayerEquipment = {
    owned: playerEquipment.owned,
    equipped: updatedEquippedEquipment,
    available: playerEquipment.available
  };
  
  return {
    success: true,
    message: `${itemToUnequip.name} unequipped`,
    playerEquipment: updatedPlayerEquipment,
    playerProgress
  };
};

// Apply equipment effects to game configuration
export const applyEquipmentEffects = (config: any, equipment: Equipment[]): any => {
  const updatedConfig = { ...config };
  
  equipment.forEach(item => {
    if (item.effects) {
      if (item.effects.damageBonus) {
        updatedConfig.damageAmount += item.effects.damageBonus;
      }
      
      if (item.effects.healBonus) {
        updatedConfig.healAmount += item.effects.healBonus;
      }
      
      if (item.effects.regenerateBonus) {
        updatedConfig.regenerateAmount += item.effects.regenerateBonus;
      }
      
      if (item.effects.mistakePenaltyReduction) {
        updatedConfig.healOnMistake = Math.max(
          1, 
          updatedConfig.healOnMistake - item.effects.mistakePenaltyReduction
        );
      }
    }
  });
  
  return updatedConfig;
};