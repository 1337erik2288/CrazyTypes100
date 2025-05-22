import { Equipment, AVAILABLE_EQUIPMENT } from '../data/equipmentData';
import { db } from '../firebase'; // Импорт db
import { doc, getDoc, updateDoc, arrayUnion, setDoc } from 'firebase/firestore'; // Добавлен setDoc, убран arrayRemove (если он не планируется к использованию)
import { UserDocument } from '../types/firestoreTypes'; // Импорт типа UserDocument

// Вспомогательная функция для получения документа пользователя
const getUserDocumentData = async (userId: string): Promise<UserDocument | null> => {
  if (!userId) return null;
  const userDocRef = doc(db, 'users', userId);
  const docSnap = await getDoc(userDocRef);
  return docSnap.exists() ? docSnap.data() as UserDocument : null;
};

// Загружает ID купленных предметов из Firestore и преобразует их в объекты Equipment
export const getOwnedEquipment = async (userId: string): Promise<Equipment[]> => {
  if (!userId) return [];
  const userData = await getUserDocumentData(userId);
  if (userData && userData.inventory) {
    return userData.inventory
      .map(itemId => AVAILABLE_EQUIPMENT.find(eq => eq.id === itemId))
      .filter(item => item !== undefined) as Equipment[];
  }
  return [];
};

// Сохраняет список ID купленных предметов в Firestore (может быть не нужна, если add/remove обновляют напрямую)
// export const saveOwnedEquipment = async (userId: string, ownedItemIds: string[]): Promise<void> => {
//   if (!userId) return;
//   const userDocRef = doc(db, 'users', userId);
//   try {
//     await updateDoc(userDocRef, { inventory: ownedItemIds });
//   } catch (error) {
//     console.error('Error saving owned equipment:', error);
//   }
// };

// Добавляет ID предмета в инвентарь пользователя в Firestore
export const addOwnedItem = async (userId: string, itemToAdd: Equipment): Promise<Equipment[]> => {
  if (!userId) return await getOwnedEquipment(userId); // Возвращаем текущий инвентарь, если нет userId

  const userDocRef = doc(db, 'users', userId);
  try {
    // Сначала убедимся, что документ пользователя существует
    let userData = await getUserDocumentData(userId);
    if (!userData) {
      // Если документа нет, создаем его с начальными данными, включая этот предмет
      const initialProgress = (await import('./playerService')).getInitialPlayerProgress(); // Динамический импорт для избежания циклич. зависимостей
      initialProgress.inventory = [itemToAdd.id];
      await setDoc(userDocRef, initialProgress); // Теперь setDoc должен быть распознан
      return [itemToAdd];
    }

    // Проверяем, есть ли уже такой предмет, чтобы избежать дублирования, если arrayUnion не справляется (хотя должен)
    if (!userData.inventory || !userData.inventory.includes(itemToAdd.id)) {
         await updateDoc(userDocRef, {
            inventory: arrayUnion(itemToAdd.id)
        });
    }
  } catch (error) {
    console.error('Error adding owned item:', error);
  }
  return getOwnedEquipment(userId); // Возвращаем обновленный список
};

// Проверяет, куплен ли предмет, обращаясь к Firestore
export const isItemOwned = async (userId: string, itemId: string): Promise<boolean> => {
  if (!userId) return false;
  const ownedEquipment = await getOwnedEquipment(userId);
  return ownedEquipment.some(item => item.id === itemId);
};

// Получает список предметов, доступных для покупки (еще не купленных) из Firestore
export const getAvailableForPurchaseEquipment = async (userId: string): Promise<Equipment[]> => {
  if (!userId) return AVAILABLE_EQUIPMENT; // Если нет userId, показываем все как доступные
  const ownedEquipment = await getOwnedEquipment(userId);
  const ownedItemIds = ownedEquipment.map(item => item.id);
  return AVAILABLE_EQUIPMENT.filter(shopItem => !ownedItemIds.includes(shopItem.id));
};