import { Equipment, AVAILABLE_EQUIPMENT } from '../data/equipmentData';
import { GamePlayConfig } from '../components/GamePlay';
import { db } from '../firebase'; // Измененный путь импорта
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore'; // Импорт функций Firestore
import { UserDocument } from '../types/firestoreTypes'; // Импорт типа UserDocument

// Вспомогательная функция для получения документа пользователя
const getUserDocumentData = async (userId: string): Promise<UserDocument | null> => {
  if (!userId) return null;
  const userDocRef = doc(db, 'users', userId);
  const docSnap = await getDoc(userDocRef);
  return docSnap.exists() ? docSnap.data() as UserDocument : null;
};

// Загружает надетые предметы из Firestore
export const getEquippedItems = async (userId: string): Promise<Equipment[]> => {
  if (!userId) return [];
  const userData = await getUserDocumentData(userId);
  if (userData && userData.equippedGear) {
    return Object.values(userData.equippedGear)
      .map(itemId => AVAILABLE_EQUIPMENT.find(eq => eq.id === itemId))
      .filter(item => item !== undefined) as Equipment[];
  }
  return [];
};

// Сохраняет карту надетых предметов в Firestore (может быть не нужна)
// export const saveEquippedItems = async (userId: string, equippedGearMap: { [slot: string]: string }): Promise<void> => {
//   if (!userId) return;
//   const userDocRef = doc(db, 'users', userId);
//   try {
//     await updateDoc(userDocRef, { equippedGear: equippedGearMap });
//   } catch (error) {
//     console.error('Error saving equipped items:', error);
//   }
// };

// Экипирует предмет и обновляет Firestore
export const equipItem = async (userId: string, itemToEquip: Equipment): Promise<{ success: boolean, equipped: Equipment[], message?: string }> => {
  if (!userId) return { success: false, equipped: [], message: "Пользователь не найден." };

  const userData = await getUserDocumentData(userId);
  if (!userData) {
     // Если документа нет, создаем его с начальными данными
    const initialProgress = (await import('./playerService')).getInitialPlayerProgress();
    initialProgress.equippedGear = { [itemToEquip.type]: itemToEquip.id };
    initialProgress.inventory = [itemToEquip.id]; // Предполагаем, что если экипируем, то владеем
    await setDoc(doc(db, 'users', userId), initialProgress);
    return { success: true, equipped: [itemToEquip] };
  }

  // Проверка, есть ли предмет в инвентаре
  if (!userData.inventory || !userData.inventory.includes(itemToEquip.id)) {
    return { success: false, equipped: await getEquippedItems(userId), message: "Предмет не найден в инвентаре." };
  }

  let equippedGearMap = { ...(userData.equippedGear || {}) };
  // Снять предмет того же типа, если он уже надет
  // (Это делается путем перезаписи ключа, если тип используется как ключ)
  equippedGearMap[itemToEquip.type] = itemToEquip.id;

  try {
    await updateDoc(doc(db, 'users', userId), { equippedGear: equippedGearMap });
    return { success: true, equipped: await getEquippedItems(userId) };
  } catch (error) {
    console.error('Error equipping item:', error);
    return { success: false, equipped: await getEquippedItems(userId), message: "Ошибка при экипировке предмета." };
  }
};

// Снимает предмет и обновляет Firestore
export const unequipItem = async (userId: string, itemIdToUnequip: string): Promise<{ success: boolean, equipped: Equipment[] }> => {
  if (!userId) return { success: false, equipped: [] };

  const userData = await getUserDocumentData(userId);
  if (!userData || !userData.equippedGear) {
    return { success: true, equipped: [] }; // Нечего снимать
  }

  let equippedGearMap = { ...userData.equippedGear };
  let itemFoundAndRemoved = false;
  for (const slot in equippedGearMap) {
    if (equippedGearMap[slot] === itemIdToUnequip) {
      delete equippedGearMap[slot];
      itemFoundAndRemoved = true;
      break;
    }
  }

  if (!itemFoundAndRemoved) {
    return { success: false, equipped: await getEquippedItems(userId) }; // Предмет не был надет
  }

  try {
    await updateDoc(doc(db, 'users', userId), { equippedGear: equippedGearMap });
    return { success: true, equipped: await getEquippedItems(userId) };
  } catch (error) {
    console.error('Error unequipping item:', error);
    return { success: false, equipped: await getEquippedItems(userId) };
  }
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