
import param from "@/gpm_param"
import ROSLIB from "roslib";
var ros = new ROSLIB.Ros({
    url: param.ros_bridge_url
})
import { SystemSettingsStore } from '@/store'
import { ROS_STORE } from "@/store/ros_store";
console.log('ros url:' + param.ros_bridge_url);

/**直線速度 */
export var linear_speed = 0.0
/**角速度 */
export var angular_speed = 0.0

var _ls_delta = 0.05;
var _as_delta = 0.05;

var _max_linear_speed = 0.8;
var _max_angular_speed = 0.5;

var _keyboardControlEnable = false;

export function KeyboardControlEnable(enable) {
    if (SystemSettingsStore.getters.Settings.WebKeyboardMoveControl) {
        _keyboardControlEnable = enable;
    }
}
export function Stop() {

    linear_speed = 0.0
    angular_speed = 0.0
}



ros.on('connection', function () {
    console.log('ros bridge server connected!');
    linear_speed = 0.0
    angular_speed = 0.0

    var module_info_listener = new ROSLIB.Topic({
        ros: ros,
        name: '/module_information',
        messageType: 'gpm_msgs/ModuleInformation',
        throttle_rate: 100,
        queue_length: 5
    })
    module_info_listener.subscribe(function (module_info) {
        ROS_STORE.commit('update_module_info', module_info)
    })
})
ros.on('error', function () {
    console.warn('ROS Connection not estimated');
})
var keyboard_move_topic = new ROSLIB.Topic({
    ros: ros,
    name: '/cmd_vel',
    messageType: 'geometry_msgs/Twist'
})

export function AGVMoveUp(speed) {
    keyboard_move_topic.publish(new ROSLIB.Message({
        linear: {
            x: speed,
            y: 0,
            z: 0,
        },
        angular: {
            x: 0,
            y: 0,
            z: 0,
        }
    }))
}
export function AGVMoveDown(speed) {
    keyboard_move_topic.publish(new ROSLIB.Message({
        linear: {
            x: -speed,
            y: 0,
            z: 0,
        },
        angular: {
            x: 0,
            y: 0,
            z: 0,
        }
    }))
}

export function AGVMoveRight(speed) {
    keyboard_move_topic.publish(new ROSLIB.Message({
        linear: {
            x: 0,
            y: 0,
            z: 0,
        },
        angular: {
            x: 0,
            y: 0,
            z: -speed,
        }
    }))
}


export function AGVMoveLeft(speed) {
    keyboard_move_topic.publish(new ROSLIB.Message({
        linear: {
            x: 0,
            y: 0,
            z: 0,
        },
        angular: {
            x: 0,
            y: 0,
            z: speed,
        }
    }))
}
export function AGVMove_FordwardRight(linear, rotation) {
    keyboard_move_topic.publish(new ROSLIB.Message({
        linear: {
            x: linear,
            y: 0,
            z: 0,
        },
        angular: {
            x: 0,
            y: 0,
            z: -rotation,
        }
    }))
}

export function AGVMove_FordwardLeft(linear, rotation) {
    keyboard_move_topic.publish(new ROSLIB.Message({
        linear: {
            x: linear,
            y: 0,
            z: 0,
        },
        angular: {
            x: 0,
            y: 0,
            z: rotation,
        }
    }))
}


export function AGVMove_BackwardLeft(linear, rotation) {
    keyboard_move_topic.publish(new ROSLIB.Message({
        linear: {
            x: -linear,
            y: 0,
            z: 0,
        },
        angular: {
            x: 0,
            y: 0,
            z: -rotation,
        }
    }))
}


export function AGVMove_BackwardRight(linear, rotation) {
    keyboard_move_topic.publish(new ROSLIB.Message({
        linear: {
            x: -linear,
            y: 0,
            z: 0,
        },
        angular: {
            x: 0,
            y: 0,
            z: rotation,
        }
    }))
}

export function AGVMove_ShiftLeft(linear) {
    keyboard_move_topic.publish(new ROSLIB.Message({
        linear: {
            x: 0,
            y: linear,
            z: 0,
        },
        angular: {
            x: 0,
            y: 0,
            z: 0,
        }
    }))
}
export function AGVMove_ShiftRight(linear) {
    keyboard_move_topic.publish(new ROSLIB.Message({
        linear: {
            x: 0,
            y: -linear,
            z: 0,
        },
        angular: {
            x: 0,
            y: 0,
            z: 0,
        }
    }))
}

export function AGVStop() {
    keyboard_move_topic.publish(new ROSLIB.Message({
        linear: {
            x: 0,
            y: 0,
            z: 0,
        },
        angular: {
            x: 0,
            y: 0,
            z: 0,
        }
    }))
}
document.addEventListener('keydown', (event) => {
    var name = event.key;
    var code = event.code;
    if (!_keyboardControlEnable)
        return;

    if (code == 'KeyW') {
        linear_speed += _ls_delta
    }
    if (code == 'KeyX') {
        linear_speed -= _ls_delta
    }
    if (code == 'KeyS' || code == 'Space') {
        linear_speed = 0.0
        angular_speed = 0.0
    }
    if (code == 'KeyD') {
        angular_speed += _as_delta
    }
    if (code == 'KeyA') {
        angular_speed -= _as_delta
    }
    // console.log('linear speed:' + linear_speed);
    // console.log('angular speed:' + angular_speed);
})
