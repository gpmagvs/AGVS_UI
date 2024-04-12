import param from '@/gpm_param'
import bus from '@/event-bus'
var backend_ws_host = param.backend_host.replace('http', 'ws')

class WebSocketHelp {
  constructor(ws_path, ws_host) {
    this.wssocket = null
    this.closed_actived = false
    this.previousWsState = WebSocket.CLOSED
<<<<<<< HEAD
=======
    this.connected = false;
>>>>>>> ae44f2291e3361fe9e9cbc8a15ef35f6dcc8c6c7
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
<<<<<<< HEAD
    const socket = new WebSocket(`${this.ws_url}`)

    socket.onerror = (ev) => {
      console.info(`Try Connect to : ${this.ws_url} ON ＥＲＲＯＲ FAIL`)
    }
    this.wssocket = socket

  }
  /**重新連線 */
  ReconnectWorker() {
    this.wssocket = new WebSocket(`${this.ws_url}`)
=======
    console.info(`Try Connect to : ${this.ws_url}`)
    const socket = new WebSocket(`${this.ws_url}`)
    //this.SendAliveCheck()
    socket.onerror = (ev) => {
      this.connected = false;
      console.info(`Try Connect to : ${this.ws_url} ON ＥＲＲＯＲ FAIL`)
    }
    this.wssocket = socket
  }
  /**重新連線 */
  ReconnectWorker() {

    console.info(`[Reconnect] Try Connect to : ${this.ws_url}`)
    this.wssocket = new WebSocket(`${this.ws_url}`)

>>>>>>> ae44f2291e3361fe9e9cbc8a15ef35f6dcc8c6c7
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
<<<<<<< HEAD

  set onerror(ev) {
    this.onopenHandler = ev
    this.wssocket.onerror = ev
  }
  get onerror() {
    return this.wssocket.onerror
  }

=======
>>>>>>> ae44f2291e3361fe9e9cbc8a15ef35f6dcc8c6c7
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

<<<<<<< HEAD

=======
>>>>>>> ae44f2291e3361fe9e9cbc8a15ef35f6dcc8c6c7
  set onmessage(ev) {
    this.onmessageHandler = ev
    this.wssocket.onmessage = ev
  }
  get onmessage() {
    return this.wssocket.onmessage
  }

<<<<<<< HEAD

=======
  SendAliveCheck() {
    this.alive_check_timer = setInterval(() => {
      if (this.wssocket) {
        if (this.wssocket.readyState == WebSocket.CONNECTING) {

        }
        else {
          if (this.wssocket.readyState == WebSocket.OPEN) {
            this.wssocket.send('alive')
          }

          if (
            this.wssocket.readyState != this.previousWsState &&
            this.wssocket.readyState == WebSocket.CLOSED
          ) {
            this.ReconnectWorker()
          }
        }
        this.previousWsState = this.wssocket.readyState
      }
    }, 1000)
  }
>>>>>>> ae44f2291e3361fe9e9cbc8a15ef35f6dcc8c6c7
}

export default WebSocketHelp
