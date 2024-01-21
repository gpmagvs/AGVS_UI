import { EqStore, agv_states_store, userStore } from "./store";
import { MapStore } from '@/components/Map/store'
import param from "./gpm_param";
import clsAGVStateDto from "@/ViewModels/clsAGVStateDto.js"
import { GetEQOptions } from '@/api/EquipmentAPI.js';

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


/**VMS數據 */
const agv_states_data_fetch_worker = new Worker('websocket_worker.js')
agv_states_data_fetch_worker.onmessage = (event) => {
    if (event.data != 'error' && event.data != 'closed') {

        var data = Object.values(event.data).map(d => new clsAGVStateDto(d));
        agv_states_store.commit('storeAgvStates', data)
    }
}
agv_states_data_fetch_worker.postMessage({ command: 'connect', ws_url: param.backend_ws_host + `/ws/VMSStatus?user_id=${user_id}` });

/**設備狀態 */
const worker = new Worker('websocket_worker.js')
worker.onmessage = (event) => {
    if (event.data != 'error' && event.data != 'closed')
        EqStore.commit('setData', event.data)
}
worker.postMessage({ command: 'connect', ws_url: param.backend_ws_host + `/ws/EQStatus` });


/**AGV導航狀態 */
const worker2 = new Worker('websocket_worker.js')
worker2.onmessage = (event) => {
    if (event.data != 'error' && event.data != 'closed')
        MapStore.commit('setAGVDynamicPathInfo', event.data)
}
worker2.postMessage({ command: 'connect', ws_url: param.vms_ws_host + `/ws/AGVNaviPathsInfo` });

/**HotRun 狀態 */
const worker_hotrun_data = new Worker('websocket_worker.js')
worker_hotrun_data.onmessage = (event) => {
    if (event.data != 'error' && event.data != 'closed')
        agv_states_store.commit('setHotRunStates', event.data)
}
worker_hotrun_data.postMessage({ command: 'connect', ws_url: param.backend_ws_host + `/ws/HotRun` });

/**動態交通狀態數據 */
const worker_dynamic_traffic_data = new Worker('websocket_worker.js')
worker_dynamic_traffic_data.onmessage = (event) => {
    if (event.data != 'error' && event.data != 'closed') {
        MapStore.commit('setControledPathesBySystem', event.data.ControledPathesByTraffic)
    }
}
worker_dynamic_traffic_data.postMessage({ command: 'connect', ws_url: param.vms_ws_host + `/ws/DynamicTrafficData` });

