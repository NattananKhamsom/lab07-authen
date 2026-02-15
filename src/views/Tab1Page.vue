<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>โปรไฟล์ผู้ใช้งาน</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="handleLogout">
            <ion-icon slot="icon-only" :icon="logOutOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <!-- ส่วนแสดงข้อมูล User (ตามโจทย์ขั้นตอนที่ 12) -->
      <ion-card v-if="user">
        <div class="ion-text-center ion-padding">
          <ion-avatar style="margin: 0 auto; width: 80px; height: 80px;">
            <img :src="user.photoUrl || 'https://ionicframework.com/docs/img/demos/avatar.svg'" />
          </ion-avatar>
          <ion-card-header>
            <ion-card-title>{{ user.displayName || 'ผู้ใช้งาน Firebase' }}</ion-card-title>
            <ion-card-subtitle>{{ user.email }}</ion-card-subtitle>
          </ion-card-header>
        </div>
        
        <ion-list lines="inset">
          <ion-item>
            <ion-icon slot="start" :icon="fingerPrintOutline"></ion-icon>
            <ion-label>
              <h3>UID</h3>
              <p>{{ user.uid }}</p>
            </ion-label>
          </ion-item>
          <ion-item v-if="user.phoneNumber">
            <ion-icon slot="start" :icon="callOutline"></ion-icon>
            <ion-label>
              <h3>เบอร์โทรศัพท์</h3>
              <p>{{ user.phoneNumber }}</p>
            </ion-label>
          </ion-item>
        </ion-list>
      </ion-card>

      <!-- ส่วนของฟอร์มบันทึกข้อมูลเดิม -->
      <div class="form-container ion-margin-top">
        <h3 class="ion-padding-horizontal">เพิ่มรายการใหม่</h3>
        
        <ion-item fill="outline" mode="md" class="ion-margin-bottom">
          <ion-label position="floating">ชื่อรายการ</ion-label>
          <ion-input v-model="expense.title" placeholder="เช่น เงินเดือน, ค่าอาหาร"></ion-input>
        </ion-item>

        <ion-item fill="outline" mode="md" class="ion-margin-bottom">
          <ion-label position="floating">จำนวนเงิน</ion-label>
          <ion-input type="number" v-model="expense.amount" placeholder="0.00"></ion-input>
        </ion-item>

        <ion-item fill="outline" mode="md" class="ion-margin-bottom">
          <ion-label position="floating">ประเภท</ion-label>
          <ion-select v-model="expense.type">
            <ion-select-option value="income">รายรับ (+)</ion-select-option>
            <ion-select-option value="expense">รายจ่าย (-)</ion-select-option>
          </ion-select>
        </ion-item>

        <ion-item fill="outline" mode="md" class="ion-margin-bottom">
          <ion-label position="floating">หมวดหมู่</ion-label>
          <ion-input v-model="expense.category" placeholder="เช่น อาหาร, การเดินทาง"></ion-input>
        </ion-item>

        <ion-item fill="outline" mode="md" class="ion-margin-bottom">
          <ion-label position="floating">หมายเหตุ</ion-label>
          <ion-textarea v-model="expense.note" placeholder="รายละเอียดเพิ่มเติม..."></ion-textarea>
        </ion-item>

        <ion-button expand="block" shape="round" color="success" class="ion-margin-top" @click="saveExpense">
          <ion-icon slot="start" :icon="saveOutline"></ion-icon>
          บันทึกข้อมูล
        </ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, 
  IonItem, IonLabel, IonInput, IonSelect, IonSelectOption, 
  IonTextarea, IonButton, IonIcon, IonAvatar, IonCard, 
  IonCardHeader, IonCardTitle, IonCardSubtitle, IonList,
  IonButtons, toastController 
} from '@ionic/vue';
import { saveOutline, logOutOutline, fingerPrintOutline, callOutline } from 'ionicons/icons';
import { useRouter } from 'vue-router';

// นำเข้า Service และ Interface จากโครงสร้างที่เราออกแบบในขั้นตอนที่ 2
import { authService } from '@/auth/auth-service';
import type { AuthUser } from '@/auth/auth-interface';

// นำเข้า Firebase Firestore (ตรวจสอบตำแหน่งไฟล์ firebase.ts ของคุณให้ถูกต้อง)
// หาก error ที่ @firebase ให้เปลี่ยนเป็น import { db } from '../firebase' หรือตามพาธจริง
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase'; // ปรับพาธให้ถูกต้องตามโครงสร้างโปรเจคของคุณ

const router = useRouter();
const user = ref<AuthUser | null>(null);

// สร้าง Reactive Object สำหรับเก็บข้อมูลฟอร์ม
const expense = ref({
  title: '',
  amount: 0,
  type: 'expense',
  category: '',
  note: ''
});

// โหลดข้อมูล User เมื่อ Component ถูกสร้าง (Lifecycle Hook)
onMounted(async () => {
  user.value = await authService.getCurrentUser();
});

// ฟังก์ชันออกจากระบบ
const handleLogout = async () => {
  await authService.logout();
  router.replace('/login');
};

// ฟังก์ชันสำหรับแจ้งเตือน (Toast)
const showToast = async (message: string, color: string) => {
  const toast = await toastController.create({
    message: message,
    duration: 2000,
    color: color,
    position: 'top'
  });
  await toast.present();
};

// ฟังก์ชันบันทึกข้อมูลลง Firestore
const saveExpense = async () => {
  if (!expense.value.title || expense.value.amount <= 0) {
    await showToast('กรุณากรอกชื่อรายการและจำนวนเงินที่ถูกต้อง', 'warning');
    return;
  }

  try {
    // บันทึกลง Collection "expenses" โดยผูกกับ UID ของผู้ใช้งาน
    await addDoc(collection(db, "expenses"), {
      userId: user.value?.uid, // ระบุเจ้าของข้อมูล
      title: expense.value.title,
      amount: Number(expense.value.amount),
      type: expense.value.type,
      category: expense.value.category,
      note: expense.value.note,
      createdAt: serverTimestamp()
    });

    await showToast('บันทึกข้อมูลสำเร็จแล้ว!', 'success');

    // ล้างฟอร์ม
    expense.value = {
      title: '',
      amount: 0,
      type: 'expense',
      category: '',
      note: ''
    };

    router.push('/tabs/tab2');
    
  } catch (error) {
    console.error("Error adding document: ", error);
    await showToast('เกิดข้อผิดพลาดในการบันทึกข้อมูล', 'danger');
  }
};
</script>

<style scoped>
.form-container {
  max-width: 500px;
  margin: 0 auto;
}
ion-item {
  --border-radius: 8px;
}
ion-avatar {
  border: 3px solid var(--ion-color-primary);
  padding: 4px;
  background: white;
}
</style>