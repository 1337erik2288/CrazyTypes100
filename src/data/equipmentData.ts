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

// Available equipment in the shop
export const AVAILABLE_EQUIPMENT: Equipment[] = [
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