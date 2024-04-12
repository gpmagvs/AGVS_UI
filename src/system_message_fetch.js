import WebSocketHelp from "./api/WebSocketHepler";
import { SystemMsgStore } from '@/store'
import bus from "./event-bus";
var ws = new WebSocketHelp('ws/Sys_Messages');
ws.Connect();
ws.onmessage = (ev) => {

    var sysmessages = JSON.parse(ev.data)
    sysmessages.forEach(sysmessage => {
        bus.emit('system_msg_updated', sysmessage)
    });
    //SystemMsgStore.dispatch('Update', sysmessage)
}
