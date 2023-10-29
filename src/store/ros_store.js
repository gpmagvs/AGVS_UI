import { createStore } from 'vuex'
import '@/api/WebRos.js'
import { KeyboardControlEnable, Stop, linear_speed, angular_speed } from '@/api/WebRos.js'


export var ROS_STORE = createStore({
    state: {
        keyboard_move_enable: false,
        module_info: {
        }
    },
    getters: {
        linear_speed: state => {
            return linear_speed
        },
        angular_speed: state => {
            return angular_speed
        },
        BatteryInfo: state => {
            return state.module_info.Battery
        },
        Module_Information: state => {
            return state.module_info
        }
    },
    mutations: {
        setKeyBoardMoveEnable(state, enable) {
            state.keyboard_move_enable = enable;
            KeyboardControlEnable(enable)
        },
        update_module_info(state, module_info) {
            debugger
            state.module_info = module_info
        }
    },
    actions: {
        keyboard_move_enable({ commit }, enable) {
            commit('setKeyBoardMoveEnable', enable)
        },
        force_stop({ commit }) {
            Stop();
        }
    }
})