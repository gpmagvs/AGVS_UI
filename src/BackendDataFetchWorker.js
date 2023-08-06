import { EqStore, MapStore } from "./store";
import param from "./gpm_param";

const worker = new Worker('websocket_worker.js')

worker.onmessage = (event) => {
    if (event.data != 'error' && event.data != 'closed')
        EqStore.commit('setData', event.data)
}
worker.postMessage({ command: 'connect', ws_url: param.backend_ws_host + '/ws/EQStatus' });

const worker2 = new Worker('websocket_worker.js')


worker2.onmessage = (event) => {
    if (event.data != 'error' && event.data != 'closed')
        MapStore.commit('setAGVDynamicPathInfo', event.data)
}

worker2.postMessage({ command: 'connect', ws_url: param.vms_ws_host + '/ws/AGVNaviPathsInfo' });
