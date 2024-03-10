import { EqStore, agv_states_store, userStore, TaskStore, AlarmStore, UIStore } from "./store";
import { MapStore } from '@/components/Map/store'
import param from "./gpm_param";
import clsAGVStateDto from "@/ViewModels/clsAGVStateDto.js"
import { GetEQOptions, GetWIPOptions } from '@/api/EquipmentAPI.js';
import { Throttle } from '@/api/Common/UtilityTools.js'
function generateRandomUserID(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

var user_id = generateRandomUserID(10);
userStore.commit('setUserID', user_id);

GetEQOptions().then(option => EqStore.commit('EqOptions', option));
GetWIPOptions().then(option => EqStore.commit('WIPOptions', option));

const throttledHandleAGVSData = Throttle(function (event) {
    if (event.data != 'error' && event.data != 'closed') {

        if (event.data.VMSStatus) {
            var data = Object.values(event.data.VMSStatus).map(d => new clsAGVStateDto(d));
            agv_states_store.commit('storeAgvStates', data)
        }

        EqStore.commit('setData', event.data.EQStatus)
        agv_states_store.commit('setHotRunStates', event.data.HotRun)
        TaskStore.commit('StoreTaskData', event.data.TaskData);
        AlarmStore.commit('StoreAlarmData', event.data.UncheckedAlarm);
        MapStore.commit('setControledPathesBySystem', event.data.ControledPathesByTraffic)
        UIStore.commit('SetVMSAlive', event.data.VMSAliveCheck);
    }
}, 110);

const agvs_websocket_worker = new Worker('/websocket_worker.js')
agvs_websocket_worker.onmessage = (event) => throttledHandleAGVSData(event)
agvs_websocket_worker.postMessage({ command: 'connect', ws_url: param.backend_ws_host + `/ws?user_id=${user_id}` });



const throttledHandleVMSData = Throttle(function (event) {
    if (event.data != 'error' && event.data != 'closed') {
        MapStore.commit('setAGVDynamicPathInfo', event.data.AGVNaviPathsInfoVM);

    }
}, 33);

const vms_websocket_worker = new Worker('/websocket_worker.js')
vms_websocket_worker.onmessage = (event) => throttledHandleVMSData(event)
vms_websocket_worker.postMessage({ command: 'connect', ws_url: param.vms_ws_host + `/ws?user_id=${user_id}` });
