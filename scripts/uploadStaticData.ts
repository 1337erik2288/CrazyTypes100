import { db } from '../src/firebase.js'; // Убедитесь, что путь к вашему firebase.ts правильный
import { collection, doc, writeBatch } from 'firebase/firestore';
import { levelResources, LevelResource } from '../src/data/levelResources.js'; // Путь к вашим данным об уровнях
import { AVAILABLE_EQUIPMENT, Equipment } from '../src/data/equipmentData.js'; // Путь к вашим данным о снаряжении

async function uploadLevels() {
  const levelsCollectionRef = collection(db, 'static_levels');
  const batch = writeBatch(db);

  levelResources.forEach((level: LevelResource) => {
    const levelDocRef = doc(levelsCollectionRef, level.id.toString());
    // Убедимся, что все поля сериализуемы для Firestore
    const levelData = { ...level }; 
    batch.set(levelDocRef, levelData);
  });

  try {
    await batch.commit();
    console.log('Уровни успешно загружены в Firestore!');
  } catch (error) {
    console.error('Ошибка при загрузке уровней:', error);
  }
}

async function uploadEquipment() {
  const equipmentCollectionRef = collection(db, 'static_equipment');
  const batch = writeBatch(db);

  AVAILABLE_EQUIPMENT.forEach((item: Equipment) => {
    const itemDocRef = doc(equipmentCollectionRef, item.id.toString());
     // Убедимся, что все поля сериализуемы для Firestore
    const itemData = { ...item };
    batch.set(itemDocRef, itemData);
  });

  try {
    await batch.commit();
    console.log('Снаряжение успешно загружено в Firestore!');
  } catch (error) {
    console.error('Ошибка при загрузке снаряжения:', error);
  }
}

async function uploadAllStaticData() {
  console.log('Начало загрузки статических данных...');
  await uploadLevels();
  await uploadEquipment();
  console.log('Загрузка статических данных завершена.');
}

// Запустите эту функцию для загрузки данных
uploadAllStaticData().catch(error => {
  console.error("Произошла ошибка во время выполнения скрипта загрузки:", error);
});