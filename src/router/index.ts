import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import TabsPage from '../views/TabsPage.vue';
import LoginPage from '../views/LoginPage.vue';
import { authService } from '@/auth/auth-service';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/login' // เปลี่ยนให้หน้าแรกของแอปเป็นหน้า Login
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage
  },
  {
    path: '/tabs/',
    component: TabsPage,
    children: [
      {
        path: '',
        redirect: '/tabs/tab1'
      },
      {
        path: 'tab1',
        component: () => import('@/views/Tab1Page.vue'),
        meta: { requiresAuth: true } // กำหนดว่าหน้านี้ต้อง Login ก่อนถึงจะเข้าได้
      },
      {
        path: 'tab2',
        component: () => import('@/views/Tab2Page.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'tab3',
        component: () => import('@/views/Tab3Page.vue'),
        meta: { requiresAuth: true }
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

// ส่วนของ Auth Guard สำหรับตรวจสอบสิทธิ์การเข้าถึงหน้าต่างๆ
router.beforeEach(async (to) => {
  const user = await authService.getCurrentUser();

  // กรณี Login แล้ว ห้ามกลับไปหน้า /login ให้ส่งไปที่หน้าหลัก (Tab1)
  if (to.path === "/login" && user) {
    return "/tabs/tab1";
  }

  // กรณีหน้าที่ระบุว่าต้องมี Auth (requiresAuth) แต่ยังไม่ได้ Login ให้ส่งไปหน้า /login
  if (to.meta.requiresAuth && !user) {
    return "/login";
  }

  return true;
});

export default router;