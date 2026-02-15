<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>เข้าสู่ระบบ (Login)</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="login-container">
        <div class="ion-text-center ion-margin-bottom">
          <ion-icon name="person-circle-outline" style="font-size: 80px; color: var(--ion-color-primary);"></ion-icon>
          <h2>ยินดีต้อนรับ</h2>
          <p>กรุณาเลือกวิธีการเข้าสู่ระบบ</p>
        </div>

        <!-- 1. Login by Email/Password -->
        <ion-card>
          <ion-card-content>
            <ion-item lines="full">
              <ion-label position="floating">อีเมล</ion-label>
              <ion-input v-model="email" type="email" placeholder="email@example.com"></ion-input>
            </ion-item>
            <ion-item lines="full">
              <ion-label position="floating">รหัสผ่าน</ion-label>
              <ion-input v-model="password" type="password"></ion-input>
            </ion-item>
            <ion-button expand="block" class="ion-margin-top" @click="loginEmail">
              Login with Email/Password
            </ion-button>
          </ion-card-content>
        </ion-card>

        <div class="divider">หรือ</div>

        <!-- 2. Login by Google -->
        <ion-button expand="block" color="danger" @click="loginGoogle">
          <ion-icon slot="start" name="logo-google"></ion-icon>
          Login with Google
        </ion-button>

        <!-- 3. Login by Phone -->
        <ion-button expand="block" color="success" class="ion-margin-top" @click="loginPhone">
          <ion-icon slot="start" name="call-outline"></ion-icon>
          Login by Phone
        </ion-button>

        <!-- Container สำหรับ reCAPTCHA (จำเป็นสำหรับ Phone Login บน Web) -->
        <div id="recaptcha-container"></div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, 
  IonItem, IonLabel, IonInput, IonButton, IonIcon, 
  IonCard, IonCardContent, toastController 
} from '@ionic/vue';
import { authService } from '@/auth/auth-service';

const router = useRouter();
const email = ref('');
const password = ref('');

// ฟังก์ชันแสดงข้อความแจ้งเตือน
const showToast = async (message: string, color: string = 'dark') => {
  const toast = await toastController.create({
    message: message,
    duration: 2000,
    color: color
  });
  await toast.present();
};

// 2.1 Login Email/Password
const loginEmail = async () => {
  try {
    if (!email.value || !password.value) {
      await showToast('กรุณากรอกข้อมูลให้ครบถ้วน', 'warning');
      return;
    }
    await authService.loginWithEmailPassword({ 
      email: email.value, 
      password: password.value 
    });
    // 2.2 เมื่อ Login สำเร็จให้ไปที่หน้า Tab1
    router.push('/tabs/tab1');
  } catch (error: any) {
    await showToast('ล็อกอินล้มเหลว: ' + error.message, 'danger');
  }
};

// 2.1 Login Google
const loginGoogle = async () => {
  try {
    await authService.loginWithGoogle();
    // 2.2 เมื่อ Login สำเร็จให้ไปที่หน้า Tab1
    router.push('/tabs/tab1');
  } catch (error: any) {
    await showToast('Google Login ล้มเหลว', 'danger');
  }
};

// 2.1 Login by Phone (ตัวอย่างเบื้องต้น)
const loginPhone = async () => {
  await showToast('ระบบ Login ด้วยเบอร์โทรศัพท์กำลังถูกพัฒนา', 'medium');
  // หมายเหตุ: การทำ Phone Login ต้องมีการจัดการ OTP เพิ่มเติม
};
</script>

<style scoped>
.login-container {
  max-width: 450px;
  margin: 0 auto;
}
.divider {
  text-align: center;
  margin: 20px 0;
  color: #888;
  position: relative;
}
.divider::before, .divider::after {
  content: "";
  position: absolute;
  top: 50%;
  width: 35%;
  height: 1px;
  background-color: #ccc;
}
.divider::before { left: 0; }
.divider::after { right: 0; }
</style>