var param = {
<<<<<<< HEAD
  type: 'jw',
  // backend_host: 'http://192.168.0.103:7025',
  get backend_host() {
    if (process.env.NODE_ENV == 'development') {
      return 'http://127.0.0.1:5216'
      return 'http://192.168.0.55:5216'
      return 'http://172.17.19.100:5216'
      return 'http://192.168.0.2:5216'
      return 'http://192.168.0.1:5216'
=======
  /**後端Server URL */
  get backend_host() {
    if (process.env.NODE_ENV == 'development') {
      return 'http://192.168.0.55:7025'
      return 'http://192.168.206.129:7025'
      return 'http://127.0.0.1:7025'
      return 'http://192.168.0.103:7025'
      return 'http://192.168.1.100:7025'
      return 'http://10.22.141.218:7025'
      return 'http://192.168.0.200:7000'
>>>>>>> ae44f2291e3361fe9e9cbc8a15ef35f6dcc8c6c7
    } else {
      return `${window.location.protocol}//${window.location.host}`
    }
  },
<<<<<<< HEAD
  get backend_ws_host() {
    return this.backend_host.replace('http', 'ws')
  },
  get vms_host() {
    return this.backend_host.replace('5216', '5036')
  },
  get vms_ws_host() {
    return this.vms_host.replace('http', 'ws')
  },
}

export const version = '1.0.0'
=======

  /**ROS Bridge Server Weboscket URL */
  get ros_bridge_url() {
    if (process.env.NODE_ENV == 'development') {
      return 'ws://127.0.0.1:9090'
      return 'ws://192.168.1.100:9090'
      return 'ws://192.168.1.100:9090'
      return 'ws://10.22.141.219:9090'
    } else {
      return `ws://${window.location.hostname}:9090`
    }
  }
}
>>>>>>> ae44f2291e3361fe9e9cbc8a15ef35f6dcc8c6c7
export default param
