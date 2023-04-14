import param from '@/gpm_param'
import bus from '@/event-bus'
var backend_ws_host = param.backend_host.replace('http', 'ws')

class WebSocketHelp {
  constructor(ws_path, ws_host) {
    bus.on('/ws_force_close', () => {
      this.Close()
    })

    if (ws_path.startsWith('/')) {
      ws_path = ws_path.substr(1)
    }
    this.ws_path = ws_path
    if (ws_host == undefined) {
      this.ws_url = `${backend_ws_host}/${this.ws_path}`
    } else {
      this.ws_url = `${ws_host}/${this.ws_path}`
    }
  }

  Connect() {
    console.info(`Try Connect to : ${this.ws_url}`)
    const socket = new WebSocket(`${this.ws_url}`)
    socket.onopen = () => {
      console.info('ws opened')
      this.SendAliveCheck()
    }
    this.wssocket = socket
  }

  Close() {
    clearInterval(this.alive_check_timer)

    if (this.wssocket) {
      this.wssocket.close()
    }
  }
  set onclose(ev) {
    this.wssocket.onclose = ev
  }
  get onclose() {
    return this.wssocket.onclose
  }

  set onopen(ev) {
    this.wssocket.onopen = ev
  }
  get onopen() {
    return this.wssocket.onopen
  }

  set onmessage(ev) {
    this.wssocket.onmessage = ev
  }
  get onmessage() {
    return this.wssocket.onmessage
  }

  SendAliveCheck() {
    this.alive_check_timer = setInterval(() => {
      this.wssocket.send('alive')
    }, 100)
  }
}

export default WebSocketHelp
