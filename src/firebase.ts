import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// ข้อมูล Firebase Config ของคุณ
const firebaseConfig = {
  apiKey: "AIzaSyAgFnO8ydnXEVk5GdNZLVaIpWhcmTe7RFc",
  authDomain: "trackerapp-899a9.firebaseapp.com",
  projectId: "trackerapp-899a9",
  storageBucket: "trackerapp-899a9.firebasestorage.app",
  messagingSenderId: "1044180344647",
  appId: "1:1044180344647:web:afdc97aa4deecda8847662",
  measurementId: "G-XNE524J7X9"
};

// เริ่มต้น Firebase App
const app = initializeApp(firebaseConfig);

// สร้างและ Export Firestore Database instance
// บรรทัดนี้สำคัญมาก เพราะหน้า Tab1Page.vue ต้องเรียกใช้ 'db'
export const db = getFirestore(app);