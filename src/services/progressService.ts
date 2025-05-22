// import { PlayerProgress } from '../types'; // Этот импорт может быть не нужен, если PlayerProgress из playerService используется
// Вместо него будем использовать UserDocument или его части
import { db } from '../firebase'; // Импорт db
import { doc, getDoc, updateDoc, arrayUnion, setDoc } from 'firebase/firestore'; // Импорт функций Firestore
import { UserDocument } from '../types/firestoreTypes'; // Импорт типа UserDocument
// getPlayerProgress и savePlayerProgress больше не нужны здесь, т.к. работаем напрямую с документом
// import { getPlayerProgress, savePlayerProgress } from './playerService';

// Сохраняет результат уровня в Firestore
export async function saveLevelResult(userId: string, levelId: string, speed: number, accuracy: number): Promise<void> {
  if (!userId) {
    console.error("saveLevelResult: userId is not provided.");
    return;
  }

  const userDocRef = doc(db, 'users', userId);
  const newLevelStat = { speed, accuracy, date: Date.now() };

  try {
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      const userData = docSnap.data() as UserDocument;
      const updatedLevelStats = {
        ...(userData.levelStats || {}),
        [levelId]: newLevelStat,
      };
      const updatedCompletedLevels = userData.completedLevels?.includes(levelId)
        ? userData.completedLevels
        : arrayUnion(levelId); // Используем arrayUnion для добавления без дубликатов

      await updateDoc(userDocRef, {
        levelStats: updatedLevelStats,
        completedLevels: updatedCompletedLevels,
      });
    } else {
      // Если документ пользователя не существует, создаем его с этим результатом уровня
      console.log(`User document for ${userId} not found. Creating new one with level result.`);
      const initialProgress = (await import('./playerService')).getInitialPlayerProgress(); // Динамический импорт
      initialProgress.levelStats = { [levelId]: newLevelStat };
      initialProgress.completedLevels = [levelId];
      await setDoc(userDocRef, initialProgress);
    }
  } catch (error) {
    console.error('Error saving level result:', error);
  }
}