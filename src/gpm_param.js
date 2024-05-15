var param = {
  type: 'jw',
  // backend_host: 'http://192.168.0.103:7025',
  get backend_host() {
    if (process.env.NODE_ENV == 'development') {
      return 'https://localhost:5216'
      return 'http://192.168.0.1:5216'
      return 'http://192.168.0.2:5216'
      return 'http://192.168.0.55:5216'
      return 'http://192.168.0.192:5216'
      return 'http://192.168.0.55:5216'
      return 'http://172.17.19.100:5216'
    } else {
      return `${window.location.protocol}//${window.location.host}`
    }
  },
  get backend_ws_host() {
    return this.backend_host.replace('http', 'ws')
  },
  get vms_host() {
    return this.backend_host.replace('5216', '5036')
  },
  get vms_ws_host() {
    return this.vms_host.replace('http', 'ws')
  },
  get agvsystem_notify_url() {
    return this.backend_host + '/api/event'
  }
}

export const version = '1.0.0'
export default param
