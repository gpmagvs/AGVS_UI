var param = {
  get backend_host() {
    if (process.env.NODE_ENV == 'development') {
      return 'http://127.0.0.1:7025'
      return 'http://10.22.141.219:7025'
    } else {
      return `${window.location.protocol}//${window.location.host}`
    }
  },
}
export const version = '23.9.8.1'
export default param
