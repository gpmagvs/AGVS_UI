import { EqStore } from "./store";
import param from "./gpm_param";

const worker = new Worker('websocket_worker.js')

worker.onmessage = (event) => {
    debugger
    EqStore.commit('setData', event.data)
}
debugger
worker.postMessage({ command: 'connect', ws_url: param.backend_ws_host + '/ws/EQStatus' });
