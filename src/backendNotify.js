import param from './gpm_param'
import { ElNotification } from 'element-plus'
import bus from './event-bus'

class NotifyMessage {
    constructor() {
        this.type = 0 //0:info , 1:warning, 2:error, 3:success
        this.evt = ''
        this.message = ''
        this.show = true
    }
    get typeStr() {
        switch (this.type) {
            case 0:
                return 'info';
            case 1:
                return 'warning';
            case 2:
                return 'error';
            case 3:
                return 'success'
            default:
                return 'info'
        }
    }
}


let agvsNotifyWs = new WebSocket(param.backend_ws_host + '/api/event');
let vmsNotifyWs = new WebSocket(param.vms_ws_host + '/api/event');
agvsNotifyWs.onmessage = (evt) => {
    var data = evt.data;
    let notify = new NotifyMessage()
    Object.assign(notify, JSON.parse(data))
    if (notify.message === 'Map-Point-Enabled-Property-Changed') {
        bus.emit('Map-Point-Enabled-Property-Changed')
    }
    if (notify.show) {
        ElNotification({
            title: "AGVSystem " + notify.evt,
            type: notify.typeStr,
            message: notify.message
        })
    }
}
vmsNotifyWs.onmessage = (evt) => {
    var data = evt.data;
    let notify = new NotifyMessage()
    Object.assign(notify, JSON.parse(data))
    if (notify.message === 'Map-Point-Enabled-Property-Changed') {
        bus.emit('Map-Point-Enabled-Property-Changed')
    }
    if (notify.show) {
        ElNotification({
            title: "VMS " + notify.evt,
            type: notify.typeStr,
            message: notify.message
        })
    }
}