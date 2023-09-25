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
    component: HomeView
  },
  {
    path: '/OP',
    name: 'OP',
    component: () => import('../views/SimpleOpUsePage.vue'),
  },
  {
    path: '/maptest',
    name: 'maptest',
    component: () => import('../components/Map/Map.vue'),
    meta: {
      isAdminUse: true
    }
  },
  {
    path: '/map',
    name: 'map',
    component: () => import('../views/MapView.vue'),
    meta: {
      isAdminUse: true
    }
  },
  {
    path: '/racks_status',
    name: 'racks_status',
    component: () => import('../views/RacksStatusView.vue'),
  },
  {
    path: '/sys_settings',
    name: 'sys_settings',
    component: SystemSettings,
    meta: {
      isAdminUse: true
    }
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

export const tsmc_routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/TSMC/TSMC_Home.vue'),
    children: [
      {
        path: '/',
        name: '/',
        component: () => import('@/views/TSMC/Components/TaskDispatch.vue'),
        meta: {
          Display: "車輛狀態與任務"
        }
      },
      {
        path: 'BirdView',
        name: 'BirdView',
        component: () => import('@/views/TSMC/Components/BirdView.vue'),
        meta: {
          Display: "Bird View"
        }
      }, {
        path: 'AGVLocus',
        name: 'AGVLocus',
        component: () => import('@/components/DataView/AGVLocus.vue'),
        meta: {
          Display: "AGV軌跡"
        }
      }
    ]
  },
  {
    path: '/map',
    name: 'map',
    component: () => import('../views/MapView.vue'),
  },
  {
    path: '/alarm',
    name: 'alarm',
    component: AlarmView,
  },
  {
    path: '/data',
    name: 'data',
    component: DataVue,
  },
]

const router = createRouter({
  history: createWebHistory(),
  // routes: tsmc_routes,
  routes: routes,
})

export default router
