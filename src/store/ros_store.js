import { createStore } from 'vuex'
import '@/api/WebRos.js'
import { KeyboardControlEnable, Stop, linear_speed, angular_speed } from '@/api/WebRos.js'


export var ROS_STORE = createStore({
    state: {
        keyboard_move_enable: false,
        module_info: {
            IMU: {
                imuData: {
                    linear_acceleration: {
                        x: 0,
                        y: 0,
                        z: 0
                    }
                }
            },
            PinsState: {
                PinState: [
                    {
                        name: '',
                        state: '',
                        ORG_S: '',
                        INPOSITION: '',
                        READY: '',
                        SERVO_S: '',
                        ALARM: '',
                        pose: '',
                    }
                ]
            }
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
        },
        ImuData_Acc: state => {
            var _acc_data = state.module_info.IMU.imuData.linear_acceleration;
            return {
                x: _acc_data.x,
                y: _acc_data.y,
                z: _acc_data.z
            }
        },
        Pin_State: state => {
            return state.module_info.PinsState.PinState[0]
        }
    },
    mutations: {
        setKeyBoardMoveEnable(state, enable) {
            state.keyboard_move_enable = enable;
            KeyboardControlEnable(enable)
        },
        update_module_info(state, module_info) {
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