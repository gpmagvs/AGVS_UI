import param from './gpm_param'
import { ElMessage } from 'element-plus'
import bus from './event-bus'
import { userStore } from './store';
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
            // ElMessage.success({
            //     message: 'Notification Connect to AGVS'
            // })
        }
        agvsNotifyWs.onmessage = (evt) => {
            if (!isWindowShowing)
                return;
            var data = evt.data;
            let notify = new NotifyMessage()
            Object.assign(notify, JSON.parse(data))
            console.info(notify.message)

            if (notify.message === 'Map-Point-Enabled-Property-Changed') {
                bus.emit('Map-Point-Enabled-Property-Changed')
            }

            if (notify.message.includes('system_mode-')) {
                bus.emit('reload-system-modes-from-server')
            }

            if (notify.show) {
                ElMessage({
                    title: "AGVSystem " + notify.evt,
                    type: notify.typeStr,
                    message: notify.message,
                    duration: 2000
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
            // ElMessage.success({
            //     message: 'Notification Connect to VMS'
            // })
        }
        vmsNotifyWs.onmessage = (evt) => {
            if (!isWindowShowing)
                return;
            var data = evt.data;
            let notify = new NotifyMessage()
            Object.assign(notify, JSON.parse(data))

            const isCarryOrderFailMsg = notify.message.includes('carry-order-failure');

            if (isCarryOrderFailMsg && userStore.getters.IsOPLogining) {

                const msgObj = JSON.parse(notify.message);
                bus.emit('swal-notify-invoke', {
                    title: '搬運任務失敗',
                    icon: 'error',
                    html: `<div class="text-danger font-weight-bold">${msgObj.message_Zh}<p>${msgObj.message_En}</p></div>`,
                    showCancelButton: false,
                    confirmButtonText: 'OK',
                    customClass: 'my-sweetalert'
                });
                return;
            }


            if (notify.message === 'Map-Point-Enabled-Property-Changed') {
                bus.emit('Map-Point-Enabled-Property-Changed')
            }
            if (notify.message === 'Update-Maintain-State') {
                bus.emit('Update-Maintain-State');
            }

            if (notify.show) {
                ElMessage({
                    type: notify.typeStr,
                    message: notify.message,
                    duration: 2000
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