import param from '@/gpm_param'
import bus from '@/event-bus'
var backend_ws_host = param.backend_host.replace('http', 'ws')

class WebSocketHelp {
  constructor(ws_path, ws_host) {
    this.wssocket = null
    this.closed_actived = false
    this.previousWsState = WebSocket.CLOSED
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

    socket.onerror = (ev) => {
      console.info(`Try Connect to : ${this.ws_url} ON ＥＲＲＯＲ FAIL`)
    }
    this.wssocket = socket

  }
  /**重新連線 */
  ReconnectWorker() {
    console.info(`[Reconnect] Try Connect to : ${this.ws_url}`)
    this.wssocket = new WebSocket(`${this.ws_url}`)

    this.wssocket.onmessage = this.onmessageHandler
    this.wssocket.onclose = this.oncloseHandler
    this.wssocket.onopen = this.onopenHandler
  }

  Close() {
    this.closed_actived = true
    clearInterval(this.alive_check_timer)
    if (this.wssocket) {
      this.wssocket.close()
    }
  }
  set onclose(ev) {
    this.oncloseHandler = ev
    this.wssocket.onclose = ev
  }
  get onclose() {
    return this.wssocket.onclose
  }

  set onopen(ev) {
    this.onopenHandler = ev
    this.wssocket.onopen = ev
  }
  get onopen() {
    return this.wssocket.onopen
  }

  set onmessage(ev) {
    this.onmessageHandler = ev
    this.wssocket.onmessage = ev
  }
  get onmessage() {
    return this.wssocket.onmessage
  }


}

export default WebSocketHelp
