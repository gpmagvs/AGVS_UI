import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
<<<<<<< HEAD
import { userStore } from './store'
import { MapStore } from '@/components/Map/store'
=======
import { ROS_STORE } from './store/ros_store'
>>>>>>> ae44f2291e3361fe9e9cbc8a15ef35f6dcc8c6c7
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import BootstrapVue3 from 'bootstrap-vue-3'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue-3/dist/bootstrap-vue-3.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import { createI18n } from 'vue-i18n'
<<<<<<< HEAD
import './global.scss'
import Modal from './components/ModalHelper'
import Vuesax from 'vuesax3'
import 'vuesax3/dist/vuesax.css'
import VueApexCharts from 'vue3-apexcharts'
import VueSweetalert2 from 'vue-sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'
import './BackendDataFetchWorker.js'
import './idling_detector.js'

document.title = "GPV AGVS"
=======

import VueSweetalert2 from 'vue-sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'
import './my_style.scss'
import './AGVDataFetchWorker.js'
import VueApexCharts from "vue3-apexcharts";
import './idling_detector'
>>>>>>> ae44f2291e3361fe9e9cbc8a15ef35f6dcc8c6c7
const i18n = createI18n({
  legacy: false,
  locale: 'zh-TW',
  fallbackLocale: 'en-US',
  messages: {
    'zh-TW': require('./locales/zh-TW.json'),
    'en-US': require('./locales/en-US.json'),
  },
})

const Sweetalert_options = {
  confirmButtonColor: 'rgb(13, 110, 253)',
  cancelButtonColor: '#ff7674',
}

<<<<<<< HEAD
const app = createApp(App)
// 合併 store
const mergedStore = { ...store, ...userStore };

app.use(mergedStore);
app.use(VueApexCharts)
app.use(Vuesax)
app.use(mergedStore)
=======

const app = createApp(App)

app.use(store)
>>>>>>> ae44f2291e3361fe9e9cbc8a15ef35f6dcc8c6c7
app.use(router)
app.use(BootstrapVue3)
app.use(ElementPlus)
app.use(i18n)
app.use(VueSweetalert2, Sweetalert_options)
<<<<<<< HEAD
=======
app.use(VueApexCharts);

>>>>>>> ae44f2291e3361fe9e9cbc8a15ef35f6dcc8c6c7
app.mount('#app')
