import { AGVStatusStore, DIOStore, RDTestDataStore, UIStore } from "./store";
import param from "./gpm_param";
import MapAPI from './api/MapAPI'
import bus from "./event-bus";
console.log('Fetch Worker Start');
function Throttle(func, limit) {
    let inThrottle;
    return function () {
        const context = this, args = arguments;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}
function generateRandomUserID(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
var backend_ws_host = param.backend_host.replace('http', 'ws')
var user_id = generateRandomUserID(8);
var _isDisconnceted = false;
const throttledHandleBackendData = Throttle(function (event) {
    if (event.data != 'error' && event.data != 'closed') {
        if (_isDisconnceted) {
            location.reload();
        }
        var ConnectionData = event.data.ConnectionStatesVM;
        var VMSData = event.data.VMSStatesVM;
        var DIOTableData = event.data.DIOTableVM;
        var testData = event.data.RDTestData;

        if (VMSData)
            AGVStatusStore.commit('updateStatus', VMSData)
        if (ConnectionData)
            UIStore.commit("StoreConnectionState", ConnectionData);
        if (DIOTableData)
            DIOStore.commit('updateStatus', DIOTableData);
        if (testData)
            RDTestDataStore.commit('SetData', testData)

    } else {
        _isDisconnceted = true;
        bus.emit('ws_disconnect');
    }
}, 50);


const backend_websocket_worker = new Worker('/websocket_worker.js')

function DisconnectHandler() {

}

backend_websocket_worker.onmessage = (event) => throttledHandleBackendData(event)
backend_websocket_worker.postMessage({ command: 'connect', ws_url: backend_ws_host + `/ws?user_id=${user_id}` });


setTimeout(() => {
    MapAPI.GetMapFromServer()
}, 500);

window.addEventListener('beforeunload', function (event) {
    backend_websocket_worker.postMessage({ command: 'disconnect' });
});