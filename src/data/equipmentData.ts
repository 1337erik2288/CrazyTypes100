export interface EquipmentEffects {
  playerDamageBonus?: number;       // 1. бонус к урону игрока
  playerHealBonus?: number;         // 2. бонус к лечению игрока
  monsterDamageReduction?: number;  // 3. уменьшение урона от монстра (абсолютное значение)
  monsterHealReduction?: number;    // 4. уменьшение лечения монстра (при ошибке игрока)
  monsterRegenReduction?: number;   // 4. уменьшение регенерации монстра
  monsterHealBonus?: number; // <--- ДОБАВЬТЕ ЭТУ СТРОКУ
}

export interface Equipment {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'weapon' | 'armor' | 'accessory';
  price: number;
  stats: string[]; // Строки для отображения бонусов предмета
  effects?: EquipmentEffects; // Используем новый интерфейс
}

// Available equipment in the shop
export const AVAILABLE_EQUIPMENT: Equipment[] = [
  {
    id: 'weapon_1',
    name: 'Простой Меч',
    description: 'Простой меч, который увеличивает ваш урон.',
    icon: '🗡️',
    type: 'weapon',
    price: 100,
    stats: ['Урон игрока +1'],
    effects: {
      playerDamageBonus: 1
    }
  },
  {
    id: 'weapon_2',
    name: 'Магический Жезл',
    description: 'Магический жезл, который значительно увеличивает ваш урон.',
    icon: '🪄',
    type: 'weapon',
    price: 250,
    stats: ['Урон игрока +3'],
    effects: {
      playerDamageBonus: 3
    }
  },
  {
    id: 'armor_1',
    name: 'Кожаная Броня',
    description: 'Базовая защита, которая уменьшает лечение монстра при ошибках.',
    icon: '🥋',
    type: 'armor',
    price: 150,
    stats: ['Лечение монстра -1'], 
    effects: {
      monsterHealReduction: 1
    }
  },
  {
    id: 'armor_2',
    name: 'Стальная Кираса',
    description: 'Тяжелая броня, которая значительно уменьшает лечение монстра при ошибках.',
    icon: '🛡️',
    type: 'armor',
    price: 300,
    stats: ['Лечение монстра -3'], 
    effects: {
      monsterHealReduction: 3
    }
  },
  {
    id: 'accessory_1',
    name: 'Амулет Лечения',
    description: 'Амулет, который увеличивает вашу силу лечения.',
    icon: '📿',
    type: 'accessory',
    price: 200,
    stats: ['Лечение игрока +2'],
    effects: {
      playerHealBonus: 2
    }
  },
  {
    id: 'accessory_2',
    name: 'Ослабляющее Кольцо', // Переименовано с "Кольцо Регенерации"
    description: 'Кольцо, которое уменьшает регенерацию здоровья монстра.',
    icon: '💍',
    type: 'accessory',
    price: 350,
    stats: ['Реген. монстра -1'], // Новый эффект
    effects: {
      monsterRegenReduction: 1 // Пример значения
    }
  },
  // Новый предмет для уменьшения урона от монстра
  {
    id: 'shield_1',
    name: 'Прочный Щит',
    description: 'Щит, уменьшающий урон, получаемый от монстров.',
    icon: '🔰', // Другая иконка для щита
    type: 'accessory', // Можно сделать тип 'shield', но пока оставим 'accessory'
    price: 220,
    stats: ['Урон монстра -2'],
    effects: {
      monsterDamageReduction: 2 // Пример значения, уменьшает урон на 2
    }
  }
];