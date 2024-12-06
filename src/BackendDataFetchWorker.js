import { EqStore, agv_states_store, userStore, TaskStore, AlarmStore, UIStore } from "./store";
import store from "./store";
import { MapStore } from '@/components/Map/store'
import param from "./gpm_param";
import { GetEQOptions, GetWIPOptions } from '@/api/EquipmentAPI.js';
import { ElMessage } from "element-plus";

import * as signalR from "@microsoft/signalr";
let channel = new BroadcastChannel('agvschannel');
let leaderExist = false;
let isLeader = false;
// import { MessagePackHubProtocol } from "@microsoft/signalr-protocol-msgpack";
var agvsHubConnection = null;
var vmsHubConnection = null;
var secs_platformHubConnection = null;
var agvsStoreTimout = undefined;
var vmsStoreTimout = undefined;
var isWindowShowing = true;
var _previousAGVSData;
var _previousVMSData;
let agvsTimeStamp = Date.now();
let vmsTimeStamp = Date.now();
import bus from "./event-bus";
let isVMSDataFetchDelayDetected = true;
let isAGVSDataFetchDelayDetected = true;


function StoreAGVSData(data) {
    // console.log('timeStamp', timeStamp);
    if (!data)
        return;

    const timeStamp = data.TimeStamp;
    _previousAGVSData = data;
    agvsTimeStamp = timeStamp;
    // if (!isWindowShowing)
    //     return;
    // if (agvsStoreTimout) {
    //     clearTimeout(agvsStoreTimout);
    // }
    agv_states_store.commit('setHotRunStates', data.HotRun)
    EqStore.commit('setData', data.EQStatus)
    TaskStore.commit('StoreTaskData', data.TaskData);
    AlarmStore.commit('StoreAlarmData', data.UncheckedAlarm);
    MapStore.commit('setControledPathesBySystem', data.ControledPathesByTraffic)
    UIStore.commit('SetVMSAlive', data.VMSAliveCheck);

}

function StoreVMSData(data) {
    if (!data)
        return;

    const timeStamp = data.TimeStamp;
    _previousVMSData = data;
    vmsTimeStamp = timeStamp;
    // if (!isWindowShowing)
    //     return;

    if (data.VMSStatus) {
        agv_states_store.commit('storeAgvStates', data.VMSStatus)
    }
    if (data.VehicleBatteryStatus) {
        agv_states_store.commit('setVehiclesBatteryStatus', data.VehicleBatteryStatus)
    }
    MapStore.commit('setAGVDynamicPathInfo', data.AGVNaviPathsInfoVM);
    MapStore.commit('setOtherAGVLocateInfo', data.OtherAGVLocations);
    // if (vmsStoreTimout) {
    //     clearTimeout(agvsStoreTimout);
    // }
    // vmsStoreTimout = setTimeout(() => {
    //     if (data.VMSStatus) {
    //         agv_states_store.commit('storeAgvStates', data.VMSStatus)
    //     }
    //     MapStore.commit('setAGVDynamicPathInfo', data.AGVNaviPathsInfoVM);
    //     MapStore.commit('setOtherAGVLocateInfo', data.OtherAGVLocations);
    // }, 50);

}

function StartHubsConnection() {
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

    //HostMessage
    secs_platformHubConnection.on('HostMessage', msg => {
        bus.emit('secs-host-message', msg);
    })

    secs_platformHubConnection.onreconnected(() => {
        console.log(`SECS Platform Hub Connection reestablished. Connected with connectionId "${connectionId}".`);
    });

    try {
        agvsHubConnection.start();
    } catch (err) {
        console.error("AGVS SignalR connection error: ", err);
    }
    try {
        vmsHubConnection.start();
    } catch (err) {
        console.error("VMS SignalR connection error: ", err);
    }
    try {
        secs_platformHubConnection.start();
    } catch (err) {
        console.error("SECS Platform SignalR connection error: ", err);
    }
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

export function StopSignalIRHubsConnections() {
    if (agvsHubConnection)
        agvsHubConnection.stop();
    if (vmsHubConnection)
        vmsHubConnection.stop();
}

var user_id = generateRandomUserID(10);
userStore.commit('setUserID', user_id);

GetEQOptions().then(option => EqStore.commit('EqOptions', option));
GetWIPOptions().then(option => EqStore.commit('WIPOptions', option));

function StartHeartBeatSend() {
    channel.postMessage({
        type: 'heartbeat',
    });

    setInterval(() => {
        channel.postMessage({
            type: 'heartbeat',
        });

        channel.postMessage({
            type: 'data',
            source: 'agvs',
            payload: _previousAGVSData
        })

    }, 50);

    setInterval(() => {
        channel.postMessage({
            type: 'data',
            source: 'vms',
            payload: _previousVMSData
        })
    }, 100);
}

function BecomeLeader() {
    isLeader = true;
    StartHeartBeatSend();
    StartHubsConnection();
}

var _firstFetchFromLeader = true;
var lastHeartbeatTime = Date.now();
var heartbeatTimer = undefined
function StartWithLeaderCheck() {

    // channel.onmessage = (event) => {
    //     if (event.data.type == 'heartbeat') {

    //         if (!heartbeatTimer) {
    //             heartbeatTimer = setInterval(() => {
    //                 if (!isLeader && isWindowShowing && Date.now() - lastHeartbeatTime > 2000) {
    //                     clearInterval(heartbeatTimer);
    //                     BecomeLeader();
    //                 }
    //             }, 400);
    //         }
    //         // console.info('hearbeat from leader');
    //         leaderExist = true
    //         lastHeartbeatTime = Date.now();
    //     }
    //     if (event.data.type == 'data' && !isLeader) {
    //         leaderExist = true
    //         fff();
    //         _firstFetchFromLeader = false;
    //     }

    //     function fff() {
    //         var source = event.data.source;
    //         var data = event.data.payload;
    //         // console.info('data from leader', source, data);
    //         if (source == 'agvs') {
    //             StoreAGVSData(data);
    //         } else if (source == 'vms') {
    //             StoreVMSData(data);
    //         }
    //     }
    // }
    setTimeout(() => {
        BecomeLeader();
    }, 100);
}

function ShowAlertDialog(message) {
    bus.emit('on-data-fetch-delay-detected', message);
}

async function AGVSAliveCheck() {
    return await fetch(param.backend_host + '/api/system/alivecheck')
        .then(response => {
            return true;
        })
        .catch(error => {
            console.error('AGVS alive check error', error);
            return false;
        })
}

async function VMSAliveCheck() {
    return await fetch(param.vms_host + '/api/system/alivecheck')
        .then(response => {
            return true;
        })
        .catch(error => {
            console.error('VMS alive check error', error);
            return false;
        })
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
            if (!agvsAlive)
                bus.emit('agvs-disconnected');
            if (!vmsAlive)
                ShowAlertDialog(`VMS系統斷線_VMS Disconnected`);
        }
    }, 5000);
}
//StartHubsConnection();
StartWithLeaderCheck();

setTimeout(() => {
    CheckBackendConnectStatus();
}, 5000);