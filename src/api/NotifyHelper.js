import { showNotify, closeNotify } from 'vant'
import 'vant/es/toast/style'
import 'vant/es/notify/style'

let Notifier = {
  Success(msg, position = 'bottom', duration = 3000) {
    showNotify({
      message: msg,
      position: position,
      type: 'success',
      duration: duration,
      background: 'rgba(7, 193, 96,0.7)',
      onclick: () => {
        closeNotify()
      },
    })
  },
  Primary(msg, position = 'top', duration = 3000) {
    showNotify({
      message: msg,
      position: position,
      type: 'primary',
      duration: duration,
      onclick: () => {
        closeNotify()
      },
    })
  },

  Danger(msg, position = 'top', duration = 3000) {
    showNotify({
      message: msg,
      position: position,
      type: 'danger',
      duration: duration,
      onclick: () => {
        closeNotify()
      },
    })
  },
  Warning(msg, position = 'top', duration = 3000) {
    showNotify({
      message: msg,
      position: position,
      type: 'warning',
      duration: duration,

      onclick: () => {
        closeNotify()
      },
    })
  },
}

export default Notifier
