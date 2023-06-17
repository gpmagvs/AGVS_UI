import axios from 'axios'
import param from '@/gpm_param'

var axios_entity = axios.create({
  baseURL: param.backend_host,
})

/**GetEQSettings */
export async function GetEQOptions() {
  var ret= await axios_entity.get(`/api/Equipment/GetEQOptions`)
  return ret.data;
}

/**GetEQSettings */
export async function SaveEQOptions(options) {
    var ret= await axios_entity.post(`/api/Equipment/SaveEQOptions`,options)
    return ret.data;
  }

/**通訊測試 */
export async function ConnectTest(conn_options){
    var ret= await axios_entity.post(`/api/Equipment/ConnectTest`,conn_options)
    return ret.data;
}

export async function GetEQInfoByTag(tagID){
    var ret= await axios_entity.get(`/api/Equipment/GetEQInfoByTag?Tag=${tagID}`)
    return ret.data;
}

/**設備模擬器API */
export const EmuAPI ={

  /**設定為Load狀態 */
  async SetAsLoadState(EQName){
    var encodedValue = encodeURIComponent(EQName); //避免帶有特殊符號的時候字串參數會不完整
    var ret= await axios_entity.post(`/api/Equipment/Emu/AsLoadState?EqName=${encodedValue}`)
    return ret.data;
  },
  /**設定為Unload狀態 */
  async SetAsUnloadState(EQName){
    var encodedValue = encodeURIComponent(EQName);
    var ret= await axios_entity.post(`/api/Equipment/Emu/AsUnloadState?EqName=${encodedValue}`)
    return ret.data;
  }
  

}