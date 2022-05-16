import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import Verify from '../views/Verify.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'verify',
    component: Verify
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
