var param = {
  type: 'jw',
  // backend_host: 'http://192.168.0.103:7025',
  get backend_host() {
    if (process.env.NODE_ENV == 'development') {
      return 'http://192.168.0.1:5216'
      return 'http://192.168.10.100:5216'
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
}

export const version = '1.0.0'
export default param
