import {
  createRouter,
  createWebHashHistory,
  createWebHistory,
  createMemoryHistory,
} from 'vue-router'
import HomeView from '../views/HomeView.vue'
import SystemSettings from '../views/SystemSettings.vue'
import DataVue from '../views/DataView.vue'
import AlarmView from '@/views/AlarmView.vue'
const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/map',
    name: 'map',
    component: () => import('../views/MapView.vue'),
  },
  {
    path: '/sys_settings',
    name: 'sys_settings',
    component: SystemSettings,
  },
  {
    path: '/data',
    name: 'data',
    component: DataVue,
  },
  {
    path: '/alarm',
    name: 'alarm',
    component: AlarmView,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
