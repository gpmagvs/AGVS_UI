<<<<<<< HEAD
import bus from './event-bus'
import { GetFrontendOptions } from './api/SystemAPI';
import { userStore } from './store';
var idleTime = 0
GetFrontendOptions().then(options => {
    var interval = setInterval(() => {
        idleTime += 1;
        if (idleTime >= options.WebUserLogoutExipreTime) {
            if (userStore.getters.IsLogin) {
                userStore.dispatch('logout', null)
                bus.emit('auto_logout_notify_invoke', "");
            }

            resetTimer();
        }
    }, 1000);

})
=======
import { UserStore } from './store';
var idleTime = 0
var interval = setInterval(() => {
    idleTime += 1;
    if (idleTime >= 300) {
        UserStore.dispatch('Logout')
        location.reload()
        resetTimer()
    }
}, 1000);

>>>>>>> ae44f2291e3361fe9e9cbc8a15ef35f6dcc8c6c7
document.addEventListener('touchstart', resetTimer);
document.addEventListener('touchmove', resetTimer);
document.addEventListener('touchend', resetTimer);
document.addEventListener('mousemove', resetTimer);
document.addEventListener('mousedown', resetTimer)
document.addEventListener('keydown', resetTimer);

function resetTimer() {
    idleTime = 0;
}