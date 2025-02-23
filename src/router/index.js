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
import Login from '@/views/Login.vue'
import AGVBatterySetting from '@/components/SystemSettings/AGVBatterySetting.vue'
import EquipmentManager from '@/components/SystemSettings/EquipmentManager.vue'
import SECSGEM from '@/views/SECSGEM.vue'
import { Verify } from '@/api/UserAPI'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: {
      Display: "首頁",
      Display_Eng: "Home"
    }
  },
  {
    path: '/Login',
    name: 'Login',
    component: Login,
    meta: {
      Display: "登入",
      Display_Eng: "Login"
    }
  },
  {
    path: '/OP',
    name: 'OP',
    component: () => import('../views/SimpleOpUsePage.vue'),
    meta: {
      Display: "操作模式",
      Display_Eng: "Operation Mode"
    }
  },
  {
    path: '/maptest',
    name: 'maptest',
    component: () => import('../components/Map/Map.vue'),
    meta: {
      isAdminUse: true,
      Display: "地圖測試",
      Display_Eng: "Map Test"
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
        meta: {
          Display: "地圖編輯",
          Display_Eng: "Map Editor"
        }
      },
      {
        path: 'agv_display',
        name: 'agv_display',
        component: () => import('../components/Map/AGVDesigner/AGVDisplaySettings.vue'),
        meta: {
          Display: "AGV顯示",
          Display_Eng: "AGV Display"
        }
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
    meta: {
      Display: "帳籍管理",
      Display_Eng: "Material Management"
    }
  },
  {
    path: '/vehicle',
    name: 'vehicle',
    component: () => import('../views/VehicleManager.vue'),
    meta: {
      Display: "車輛管理",
      Display_Eng: "Vehicle Manager"
    }
  },
  {
    path: '/sys_settings',
    name: 'sys_settings',
    meta: {
      requiresAuth: true,
      Display: "系統設定",
      Display_Eng: "System Settings"
    },
    children: [
      {
        path: 'AGV_Battery_Setting',
        name: 'AGV_Battery_Setting',
        meta: {
          requiresAuth: true,
          Display: "AGV電量管理",
          Display_Eng: "AGV Battery Management"
        },
        component: AGVBatterySetting
      },
      {
        path: 'Equipment_Setting',
        name: 'Equipment_Setting',
        meta: {
          requiresAuth: true,
          Display: "設備管理",
          Display_Eng: "Equipment Manager"
        },
        component: EquipmentManager
      },
      {
        path: 'RacksManagement',
        name: 'RacksManagement',
        meta: {
          requiresAuth: true,
          Display: "Rack 設定",
          Display_Eng: "Racks Setting"
        },
        component: () => import('@/components/SystemSettings/RacksManager.vue')
      },
      {
        path: 'User_Setting',
        name: 'User_Setting',
        meta: {
          requiresAuth: true,
          Display: "使用者管理",
          Display_Eng: "User Manager"
        },
        component: () => import('@/components/SystemSettings/UserManager.vue')
      },
      {
        path: 'Charge_Station_Setting',
        name: 'Charge_Station_Setting',
        meta: {
          requiresAuth: true,
          Display: "充電站管理",
          Display_Eng: "Charge Station Manager"
        },
        component: ChargeStationView
      },
      {
        path: 'secs_gem_settings',
        name: 'secs_gem_settings',
        meta: {
          requiresAuth: true,
          Display: "SECS/GEM 設定",
          Display_Eng: "SECS/GEM Settings"
        },
        component: () => import('@/views/SecsGemSettings.vue')
      },
      {
        path: 'dispatch_settings',
        name: 'dispatch_settings',
        meta: {
          requiresAuth: true,
          Display: "任務派送設定",
          Display_Eng: "Dispatch Settings"
        },
        component: () => import('@/components/SystemSettings/Dispatch/Index.vue')
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
        component: () => import('@/components/DataView/TaskQuery.vue'),
        meta: {
          Display: "歷史任務查詢",
          Display_Eng: "Task History"
        }
      },
      {
        path: 'alarm_history',
        name: 'alarm_history',
        component: () => import('@/components/DataView/AlarmQuery.vue'),
        meta: {
          Display: "歷史警報查詢",
          Display_Eng: "Alarm History"
        }
      },
      {
        path: 'agv_locus',
        name: 'agv_locus',
        component: () => import('@/components/DataView/AGVLocus.vue'),
        meta: {
          Display: "AGV軌跡",
          Display_Eng: "AGV Locus"
        }
      },
      {
        path: 'InstrumentMeasureQuery',
        name: 'InstrumentMeasureQuery',
        component: () => import('@/components/DataView/InstrumentMeasureQuery.vue'),
        meta: {
          Display: "儀器量測查詢",
          Display_Eng: "Instrument Measure Query"
        }
      },
      {
        path: 'Avalibility',
        name: 'Avalibility',
        component: () => import('@/components/DataView/AvalibilityQuery.vue'),
        meta: {
          Display: "稼動率",
          Display_Eng: "Avalibility"
        }
      },
      {
        path: 'TrafficState',
        name: 'TrafficState',
        component: () => import('@/components/DataView/TrafficState.vue'),
        meta: {
          Display: "交通狀態",
          Display_Eng: "Traffic State"
        }
      }
    ]
  },
  {
    path: '/alarm',
    name: 'alarm',
    component: AlarmView,
    meta: {
      Display: "系統警報",
      Display_Eng: "System Alarm"
    }
  },
  {
    path: '/playground',
    name: 'dev_ui',
    meta: {
      requiresAuth: true
    },
    component: () => import('../views/Playground.vue'),
  },
  {
    path: '/hotrun',
    name: 'hotrun',
    meta: {
      requiresAuth: true,
      Display: "HOT RUN",
      Display_Eng: "HOT RUN"
    },
    component: () => import('../views/HotRun.vue'),
  },
  {
    path: '/secsgem',
    name: 'secsgem',
    meta: {
      requiresAuth: false,
      Display: "SECS/GEM",
      Display_Eng: "SECS/GEM"
    },
    component: SECSGEM,
  },
  {
    path: '/maintaining',
    name: 'maintaining',
    meta: {
      requiresAuth: false,
      Display: "SECS/GEM",
      Display_Eng: "SECS/GEM"
    },
    component: () => import('../views/SystemMaintaining.vue'),
  }
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
]

const router = createRouter({
  history: createWebHistory(),
  // routes: tsmc_routes,
  routes: routes,
})
router.beforeEach(async (to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    try {
      if (await Verify()) {
        next();
      } else {
        next('/login');
      }
    } catch (error) {
      next('/login');
    }
  } else {
    next();
  }
})
export default router
