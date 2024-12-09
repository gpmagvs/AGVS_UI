import { EqStore, agv_states_store, userStore, TaskStore, AlarmStore, UIStore } from "./store";
import store from "./store";
import { MapStore } from '@/components/Map/store'
import param from "./gpm_param";
import { GetEQOptions, GetWIPOptions } from '@/api/EquipmentAPI.js';
import { ElMessage } from "element-plus";
import * as signalR from "@microsoft/signalr";
import bus from "./event-bus";

var agvsHubConnection = null;
var vmsHubConnection = null;
var secs_platformHubConnection = null;
var _previousAGVSData;
var _previousVMSData;
let agvsTimeStamp = Date.now();
let vmsTimeStamp = Date.now();
let isVMSDataFetchDelayDetected = true;
let isAGVSDataFetchDelayDetected = true;
var user_id = generateRandomUserID(10);

function generateRandomUserID(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function ShowAlertDialog(message) {
    bus.emit('on-data-fetch-delay-detected', message);
}

function StoreAGVSData(data) {
    if (!data) return;
    const timeStamp = data.TimeStamp;
    _previousAGVSData = data;
    agvsTimeStamp = timeStamp;
    agv_states_store.commit('setHotRunStates', data.HotRun)
    EqStore.commit('setData', data.EQStatus)
    TaskStore.commit('StoreTaskData', data.TaskData);
    AlarmStore.commit('StoreAlarmData', data.UncheckedAlarm);
    MapStore.commit('setControledPathesBySystem', data.ControledPathesByTraffic)
    UIStore.commit('SetVMSAlive', data.VMSAliveCheck);
}

function StoreVMSData(data) {
    if (!data) return;
    const timeStamp = data.TimeStamp;
    _previousVMSData = data;
    vmsTimeStamp = timeStamp;

    if (data.VMSStatus) {
        agv_states_store.commit('storeAgvStates', data.VMSStatus)
    }
    if (data.VehicleBatteryStatus) {
        agv_states_store.commit('setVehiclesBatteryStatus', data.VehicleBatteryStatus)
    }
    MapStore.commit('setAGVDynamicPathInfo', data.AGVNaviPathsInfoVM);
    MapStore.commit('setOtherAGVLocateInfo', data.OtherAGVLocations);
}

async function fetchOptions() {
    const eqOptions = await GetEQOptions();
    EqStore.commit('EqOptions', eqOptions);

    const wipOptions = await GetWIPOptions();
    EqStore.commit('WIPOptions', wipOptions);
}

async function AGVSAliveCheck() {
    return await fetch(param.backend_host + '/api/system/alivecheck')
        .then(response => true)
        .catch(error => {
            console.error('AGVS alive check error', error);
            return false;
        })
}

async function VMSAliveCheck() {
    return await fetch(param.vms_host + '/api/system/alivecheck')
        .then(response => true)
        .catch(error => {
            console.error('VMS alive check error', error);
            return false;
        })
}

async function StartHubsConnection() {
    let hubUrls = param.hubs;
    agvsHubConnection = new signalR.HubConnectionBuilder()
        .withUrl(hubUrls.agvs)
        .withAutomaticReconnect([0, 1000, 2000, 3000])
        .build();

    vmsHubConnection = new signalR.HubConnectionBuilder()
        .withUrl(hubUrls.vms)
        .withAutomaticReconnect([0, 1000, 2000, 3000])
        .build();

    secs_platformHubConnection = new signalR.HubConnectionBuilder()
        .withUrl(hubUrls.secs_platform)
        .withAutomaticReconnect([0, 1000, 2000, 3000])
        .build();

    agvsHubConnection.on("ReceiveData", (user, data) => {
        StoreAGVSData(data);
    });

    agvsHubConnection.on("RegularHotRunInfo", data => {
        store.commit('setRegularHotRunState', data)
    })

    agvsHubConnection.on('Notify', message => {
        ElMessage.info({
            message: message
        })
    })
    agvsHubConnection.on('MCSMessage', msg => {
        console.info(msg);
        bus.emit(msg);
    });

    vmsHubConnection.on("ReceiveData", (user, data) => {
        StoreVMSData(data);
    });

    vmsHubConnection.onreconnected((connectionId) => {
        console.log(`VMS Hub Connection reestablished. Connected with connectionId "${connectionId}".`);
    });


    secs_platformHubConnection.on("ControlState", (_cs) => {
        console.info(_cs);
        if (_cs == -1) {
            bus.emit('secs-offline-by-agvs-disoneect');
        }
    })

    secs_platformHubConnection.on('HostMessage', msg => {
        bus.emit('secs-host-message', msg);
    })

    secs_platformHubConnection.onreconnected(() => {
        console.log(`SECS Platform Hub Connection reestablished. Connected with connectionId "${connectionId}".`);
    });

    try {
        await agvsHubConnection.start();
    } catch (err) {
        console.error("AGVS SignalR connection error: ", err);
    }
    try {
        await vmsHubConnection.start();
    } catch (err) {
        console.error("VMS SignalR connection error: ", err);
    }
    try {
        await secs_platformHubConnection.start();
    } catch (err) {
        console.error("SECS Platform SignalR connection error: ", err);
    }
}


function CheckBackendConnectStatus() {
    setInterval(async () => {
        const agvsAlive = await AGVSAliveCheck();
        const isAGVSConnectRestored = agvsAlive && !isAGVSDataFetchDelayDetected;
        isAGVSDataFetchDelayDetected = agvsAlive;
        const vmsAlive = await VMSAliveCheck();
        const isVMSConnectRestored = vmsAlive && !isVMSDataFetchDelayDetected;
        isVMSDataFetchDelayDetected = vmsAlive;

        if (isAGVSConnectRestored || isVMSConnectRestored) {
            setTimeout(() => {
                window.location.reload();
            }, 3000);
        }

        if (!agvsAlive || !vmsAlive) {
            if (!agvsAlive) bus.emit('agvs-disconnected');
            if (!vmsAlive) ShowAlertDialog(`VMS系統斷線_VMS Disconnected`);
        }
    }, 5000);
}

export function StopSignalIRHubsConnections() {
    if (agvsHubConnection) agvsHubConnection.stop();
    if (vmsHubConnection) vmsHubConnection.stop();
}

export function Startup() {
    userStore.commit('setUserID', user_id);
    fetchOptions();
    StartHubsConnection();
    setTimeout(() => {
        CheckBackendConnectStatus();
    }, 5000);
}
