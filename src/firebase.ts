import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Ваши конфигурационные данные из консоли Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCGAHjvvGPBsOXRkWvSjJ0Ph-nlAm_p7RU",
  authDomain: "crazytypes100.firebaseapp.com",
  projectId: "crazytypes100",
  storageBucket: "crazytypes100.appspot.com",
  messagingSenderId: "55020658917",
  appId: "1:55020658917:web:a7739cb162139cf909b40c" 
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);

// Получение экземпляров сервисов
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;