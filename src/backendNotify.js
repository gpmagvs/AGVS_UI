import param from './gpm_param'
import { ElNotification } from 'element-plus'
import bus from './event-bus'
var isWindowShowing = true;
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

function InitWSNotification(agvs = true, vms = true) {

    if (agvs) {

        let agvsNotifyWs = new WebSocket(param.backend_ws_host + '/api/event');

        agvsNotifyWs.onopen = (evt) => {
            ElNotification.success({
                message: 'Notification Connect to AGVS'
            })
        }
        agvsNotifyWs.onmessage = (evt) => {
            if (!isWindowShowing)
                return;
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
        agvsNotifyWs.onclose = (evt) => {
            setTimeout(() => {

                // ElNotification.error({
                //     message: 'Notification Disconnect to AGVS'
                // })
                InitWSNotification(true, false);
            }, 1000);
        }
    }

    if (vms) {

        let vmsNotifyWs = new WebSocket(param.vms_ws_host + '/api/event');

        vmsNotifyWs.onopen = (evt) => {
            ElNotification.success({
                message: 'Notification Connect to VMS'
            })
        }
        vmsNotifyWs.onmessage = (evt) => {
            if (!isWindowShowing)
                return;
            var data = evt.data;
            let notify = new NotifyMessage()
            Object.assign(notify, JSON.parse(data))
            if (notify.message === 'Map-Point-Enabled-Property-Changed') {
                bus.emit('Map-Point-Enabled-Property-Changed')
            }
            if (notify.message === 'Update-Maintain-State') {
                bus.emit('Update-Maintain-State');
            }

            if (notify.show) {
                ElNotification({
                    title: "VMS " + notify.evt,
                    type: notify.typeStr,
                    message: notify.message
                })
            }
        }
        vmsNotifyWs.onclose = (evt) => {
            setTimeout(() => {
                InitWSNotification(false, true);
                // ElNotification.error({
                //     message: 'Notification Disconnect to VMS'
                // })
            }, 1000);
        }
    }
}
document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') {
        isWindowShowing = true;
        console.log('Tab is active');
    } else {
        isWindowShowing = false;
        console.log('Tab is inactive');
    }
});
InitWSNotification();