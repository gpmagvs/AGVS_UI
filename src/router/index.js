<<<<<<< HEAD
﻿import {
  createRouter,
  createWebHashHistory,
  createWebHistory,
  createMemoryHistory,
} from 'vue-router'
import HomeView from '../views/HomeView.vue'
import DataVue from '../views/DataView.vue'
import AlarmView from '@/views/AlarmView.vue'
import ChargeStationView from '@/views/ChargeStation/ChargeStationHomeView.vue'
=======
import {
  createRouter,
  createWebHistory
} from 'vue-router'
import HomeView from '../views/HomeView.vue'
import HomeViewVersion2 from '../views/Version2/HomeView.vue'
import Admin from '../views/Admin.vue'
import MainStatuShow from '@/components/Version2/MainStatuShow.vue'
import { UIStore } from '@/store'
import AgvOverview from '@/components/AGVStatusOverview.vue';

>>>>>>> ae44f2291e3361fe9e9cbc8a15ef35f6dcc8c6c7
const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
<<<<<<< HEAD
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
    children: [
      {
        path: 'map_editor',
        name: 'map_editor',
        component: () => import('../views/MapManager.vue'),
      },
      {
        path: 'agv_display',
        name: 'agv_display',
        component: () => import('../components/Map/AGVDesigner/AGVDisplaySettings.vue'),
      }
    ],
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
    path: '/vehicle',
    name: 'vehicle',
    component: () => import('../views/VehicleManager.vue'),
  },
  {
    path: '/sys_settings',
    name: 'sys_settings',
    children: [
      {
        path: 'AGV_Battery_Setting',
        name: 'AGV_Battery_Setting',
        component: () => import('@/components/SystemSettings/AGVBatterySetting.vue')
      },
      {
        path: 'Equipment_Setting',
        name: 'Equipment_Setting',
        component: () => import('@/components/SystemSettings/EquipmentManager.vue')
      },
      {
        path: 'User_Setting',
        name: 'User_Setting',
        component: () => import('@/components/SystemSettings/UserManager.vue')
      },
      {
        path: 'Charge_Station_Setting',
        name: 'Charge_Station_Setting',
        component: ChargeStationView
      }
    ],
    meta: {
      isAdminUse: true
    }
  },
  {
    path: '/data',
    name: 'data',
    children: [
      {
        path: 'task_history',
        name: 'task_history',
        component: () => import('@/components/DataView/TaskQuery.vue')
      },
      {
        path: 'alarm_history',
        name: 'alarm_history',
        component: () => import('@/components/DataView/AlarmQuery.vue')
      },
      {
        path: 'agv_locus',
        name: 'agv_locus',
        component: () => import('@/components/DataView/AGVLocus.vue')
      },
      {
        path: 'InstrumentMeasureQuery',
        name: 'InstrumentMeasureQuery',
        component: () => import('@/components/DataView/InstrumentMeasureQuery.vue')
      },
      {
        path: 'Avalibility',
        name: 'Avalibility',
        component: () => import('@/components/DataView/AvalibilityQuery.vue')
      }
    ]
  },
  {
    path: '/alarm',
    name: 'alarm',
    component: AlarmView,
  },
  {
    path: '/developing',
    name: 'dev_ui',
    component: () => import('../components/Map/AGVDesigner/AGVDisplaySettings.vue'),
  },
  {
    path: '/hotrun',
    name: 'hotrun',
    component: () => import('../views/HotRun.vue'),
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
=======
    path: '/v2',
    name: '',
    component: HomeViewVersion2,
    children: [
      {

        path: '/v2',
        name: 'MainStatuShow',
        component: AgvOverview,
      },
      {
        path: 'IOTable',
        component: () => import('../components/Version2/DIOViewer.vue'),
      },
      {
        path: 'Alarm',
        component: () => import('../components/AlarmWarningTable.vue'),
      },
      {
        path: 'controller',
        component: () => import('../components/Admin/Controller.vue'),
        children: [
          {
            path: 'move',
            component: () => import('../components/Controller/MoveController.vue')
          },
          {
            path: 'fork',
            component: () => import('../components/Controller/ForkController.vue')
          }
        ]
      },
      {
        path: 'rd_test',
        component: () =>
          import(/* webpackChunkName: "about" */ '../views/RDTestView.vue'),
      },
    ]
  },
  {
    path: '/rd_test',
    name: 'rd_test',
    component: () =>
      import(/* webpackChunkName: "about" */ '../views/RDTestView.vue'),
  },
  {
    path: '/admin',
    name: 'admin',
    component: Admin,
    children: [
      {
        path: 'controller',
        name: 'controller',
        component: () => import('../components/Admin/Controller.vue')
>>>>>>> ae44f2291e3361fe9e9cbc8a15ef35f6dcc8c6c7
      }
    ]
  },
  {
<<<<<<< HEAD
    path: '/map',
    name: 'map',
    component: () => import('../views/MapManager.vue'),
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
=======
    path: '/idle',
    name: 'idle',
    component: () => import('../views/IdleView.vue')
  },
  {
    path: '/playground',
    name: 'playground',
    component: () => import('../views/Playground.vue')
  }
>>>>>>> ae44f2291e3361fe9e9cbc8a15ef35f6dcc8c6c7
]

const router = createRouter({
  history: createWebHistory(),
<<<<<<< HEAD
  // routes: tsmc_routes,
  routes: routes,
=======
  routes,
>>>>>>> ae44f2291e3361fe9e9cbc8a15ef35f6dcc8c6c7
})

export default router
