<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>รายการทั้งหมด</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <!-- ส่วนสรุปยอดเงิน -->
      <ion-grid class="ion-no-padding">
        <ion-row>
          <ion-col size="6">
            <ion-card color="success">
              <ion-card-content class="ion-text-center">
                <ion-text color="light">
                  <p class="ion-no-margin">รายรับ</p>
                  <h2 class="total-amount">฿{{ totalIncome.toLocaleString() }}</h2>
                </ion-text>
              </ion-card-content>
            </ion-card>
          </ion-col>
          <ion-col size="6">
            <ion-card color="danger">
              <ion-card-content class="ion-text-center">
                <ion-text color="light">
                  <p class="ion-no-margin">รายจ่าย</p>
                  <h2 class="total-amount">฿{{ totalExpense.toLocaleString() }}</h2>
                </ion-text>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>
        <ion-row>
          <ion-col size="12">
            <ion-card color="tertiary">
              <ion-card-content class="ion-text-center">
                <ion-text color="light">
                  <p class="ion-no-margin">ยอดคงเหลือ</p>
                  <h1 class="balance-amount">฿{{ (totalIncome - totalExpense).toLocaleString() }}</h1>
                </ion-text>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>
      </ion-grid>

      <!-- รายชื่อรายการ -->
      <ion-list>
        <div class="ion-padding-horizontal">
          <ion-text color="medium">
            <h5>ประวัติรายการ</h5>
          </ion-text>
        </div>

        <div v-if="expenses.length === 0" class="ion-text-center ion-padding">
          <ion-text color="medium">ไม่มีข้อมูลรายการ</ion-text>
        </div>

        <ion-item-sliding v-for="item in expenses" :key="item.id">
          <ion-item>
            <ion-icon 
              slot="start" 
              :icon="item.type === 'income' ? trendingUpOutline : trendingDownOutline"
              :color="item.type === 'income' ? 'success' : 'danger'"
            ></ion-icon>
            <ion-label>
              <h2>{{ item.title }}</h2>
              <p>{{ item.category }} <span v-if="item.note">• {{ item.note }}</span></p>
            </ion-label>
            <ion-text slot="end" :color="item.type === 'income' ? 'success' : 'danger'">
              <h3 class="item-amount">
                {{ item.type === 'income' ? '+' : '-' }} {{ item.amount.toLocaleString() }}
              </h3>
            </ion-text>
          </ion-item>

          <ion-item-options side="end">
            <ion-item-option color="primary" @click="openEditModal(item)">
              <ion-icon slot="icon-only" :icon="createOutline"></ion-icon>
            </ion-item-option>
            <ion-item-option color="danger" @click="confirmDelete(item)">
              <ion-icon slot="icon-only" :icon="trashOutline"></ion-icon>
            </ion-item-option>
          </ion-item-options>
        </ion-item-sliding>
      </ion-list>

      <!-- Modal สำหรับแก้ไข (ขั้นตอนที่ 5) -->
      <ion-modal :is-open="isModalOpen" @didDismiss="isModalOpen = false">
        <ion-header>
          <ion-toolbar color="primary">
            <ion-buttons slot="start">
              <ion-button @click="isModalOpen = false">ยกเลิก</ion-button>
            </ion-buttons>
            <ion-title>แก้ไขรายการ</ion-title>
            <ion-buttons slot="end">
              <ion-button :strong="true" @click="updateExpense">บันทึก</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <ion-item fill="outline" mode="md" class="ion-margin-bottom">
            <ion-label position="floating">ชื่อรายการ</ion-label>
            <ion-input v-model="editingItem.title"></ion-input>
          </ion-item>
          <ion-item fill="outline" mode="md" class="ion-margin-bottom">
            <ion-label position="floating">จำนวนเงิน</ion-label>
            <ion-input type="number" v-model="editingItem.amount"></ion-input>
          </ion-item>
          <ion-item fill="outline" mode="md" class="ion-margin-bottom">
            <ion-label position="floating">ประเภท</ion-label>
            <ion-select v-model="editingItem.type">
              <ion-select-option value="income">รายรับ (+)</ion-select-option>
              <ion-select-option value="expense">รายจ่าย (-)</ion-select-option>
            </ion-select>
          </ion-item>
          <ion-item fill="outline" mode="md" class="ion-margin-bottom">
            <ion-label position="floating">หมวดหมู่</ion-label>
            <ion-input v-model="editingItem.category"></ion-input>
          </ion-item>
          <ion-item fill="outline" mode="md" class="ion-margin-bottom">
            <ion-label position="floating">หมายเหตุ</ion-label>
            <ion-textarea v-model="editingItem.note"></ion-textarea>
          </ion-item>
        </ion-content>
      </ion-modal>

    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonList, IonItem, IonLabel, IonItemSliding, IonItemOptions,
  IonItemOption, IonGrid, IonRow, IonCol, IonCard,
  IonCardContent, IonText, IonIcon, alertController,
  IonModal, IonButtons, IonButton, IonInput, IonSelect,
  IonSelectOption, IonTextarea, toastController
} from '@ionic/vue';
import { 
  trendingUpOutline, 
  trendingDownOutline, 
  createOutline,
  trashOutline 
} from 'ionicons/icons';
import { collection, query, onSnapshot, orderBy, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase'; // ปรับพาธให้ถูกต้องตามโครงสร้างโปรเจคของคุณ

interface Expense {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  note: string;
}

const expenses = ref<Expense[]>([]);
const totalIncome = ref(0);
const totalExpense = ref(0);

// สถานะ Modal แก้ไข
const isModalOpen = ref(false);
const editingItem = ref<Expense>({
  id: '',
  title: '',
  amount: 0,
  type: 'expense',
  category: '',
  note: ''
});

onMounted(() => {
  const q = query(collection(db, "expenses"), orderBy("createdAt", "desc"));
  
  onSnapshot(q, (querySnapshot) => {
    const items: Expense[] = [];
    let income = 0;
    let expense = 0;

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const item = { 
        id: doc.id,
        title: data.title,
        amount: data.amount,
        type: data.type,
        category: data.category,
        note: data.note
      } as Expense;
      
      items.push(item);

      if (item.type === 'income') {
        income += item.amount;
      } else {
        expense += item.amount;
      }
    });

    expenses.value = items;
    totalIncome.value = income;
    totalExpense.value = expense;
  });
});

const openEditModal = (item: Expense) => {
  editingItem.value = { ...item };
  isModalOpen.value = true;
};

const updateExpense = async () => {
  if (!editingItem.value.title || editingItem.value.amount <= 0) return;

  try {
    const docRef = doc(db, "expenses", editingItem.value.id);
    await updateDoc(docRef, {
      title: editingItem.value.title,
      amount: Number(editingItem.value.amount),
      type: editingItem.value.type,
      category: editingItem.value.category,
      note: editingItem.value.note
    });

    isModalOpen.value = false;
    const toast = await toastController.create({
      message: 'อัปเดตข้อมูลสำเร็จ',
      duration: 2000,
      color: 'success'
    });
    await toast.present();
  } catch (error) {
    console.error("Error updating document: ", error);
  }
};

const confirmDelete = async (item: Expense) => {
  const alert = await alertController.create({
    header: 'ยืนยันการลบ',
    message: `คุณต้องการลบรายการ "${item.title}" ใช่หรือไม่?`,
    buttons: [
      { text: 'ยกเลิก', role: 'cancel' },
      {
        text: 'ลบ',
        role: 'destructive',
        handler: async () => {
          await deleteDoc(doc(db, "expenses", item.id));
        }
      }
    ]
  });
  await alert.present();
};
</script>

<style scoped>
.total-amount {
  font-weight: bold;
  font-size: 1.2rem;
  margin-top: 5px;
}
.balance-amount {
  font-weight: bold;
  margin-top: 5px;
}
.item-amount {
  font-weight: bold;
}
</style>