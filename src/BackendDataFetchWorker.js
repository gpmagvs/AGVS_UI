import { EqStore, agv_states_store, userStore, TaskStore, AlarmStore, UIStore } from "./store";
import { MapStore } from '@/components/Map/store'
import param from "./gpm_param";
import clsAGVStateDto from "@/ViewModels/clsAGVStateDto.js"
import { GetEQOptions, GetWIPOptions } from '@/api/EquipmentAPI.js';
import { Throttle } from '@/api/Common/UtilityTools.js'

import * as signalR from "@microsoft/signalr";
import { MessagePackHubProtocol } from "@microsoft/signalr-protocol-msgpack";
var agvsHubConnection = null;
var vmsHubConnection = null;
function StartHubsConnection() {
    let hubUrls = param.hubs;
    agvsHubConnection = new signalR.HubConnectionBuilder()
        .withUrl(hubUrls.agvs)
        .withAutomaticReconnect([0, 2000, 1000, 5000])
        .build();

    vmsHubConnection = new signalR.HubConnectionBuilder()
        .withUrl(hubUrls.vms)
        .withAutomaticReconnect([0, 2000, 1000, 5000])
        .build();

    agvsHubConnection.on("ReceiveData", (user, data) => {
        EqStore.commit('setData', data.EQStatus)
        agv_states_store.commit('setHotRunStates', data.HotRun)
        TaskStore.commit('StoreTaskData', data.TaskData);
        AlarmStore.commit('StoreAlarmData', data.UncheckedAlarm);
        MapStore.commit('setControledPathesBySystem', data.ControledPathesByTraffic)
        UIStore.commit('SetVMSAlive', data.VMSAliveCheck);
    });

    vmsHubConnection.on("ReceiveData", (user, data) => {
        if (data.VMSStatus) {
            agv_states_store.commit('storeAgvStates', data.VMSStatus)
            console.log('storeAgvStates', data.VMSStatus);
        }
        MapStore.commit('setAGVDynamicPathInfo', data.AGVNaviPathsInfoVM);
        MapStore.commit('setOtherAGVLocateInfo', data.OtherAGVLocations);
    });

    vmsHubConnection.onreconnected((connectionId) => {
        console.log(`VMS Hub Connection reestablished. Connected with connectionId "${connectionId}".`);
    });
    try {
        agvsHubConnection.start();
        console.log("AGVS SignalR connected");
    } catch (err) {
        console.error("AGVS SignalR connection error: ", err);
    }
    try {
        vmsHubConnection.start();
        console.log("VMS SignalR connected");
    } catch (err) {
        console.error("VMS SignalR connection error: ", err);
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

var user_id = generateRandomUserID(10);
userStore.commit('setUserID', user_id);

GetEQOptions().then(option => EqStore.commit('EqOptions', option));
GetWIPOptions().then(option => EqStore.commit('WIPOptions', option));
StartHubsConnection();