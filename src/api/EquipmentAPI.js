import axios from 'axios'
import param from '@/gpm_param'

var axios_entity = axios.create({
  baseURL: param.backend_host,
})

export async function GetEQData() {
  var ret = await axios_entity.get(`/api/Equipment/GetEQData`)
  return ret.data;
}


/**GetEQSettings */
export async function GetEQOptions() {
  var ret = await axios_entity.get(`/api/Equipment/GetEQOptions`)
  return ret.data;
}
/**GetEQSettings */
export async function GetWIPOptions() {
  var ret = await axios_entity.get(`/api/Equipment/GetWIPOptions`)
  return ret.data;
}
/**Save EQ Options */
export async function SaveEQOptions(options) {
  var ret = await axios_entity.post(`/api/Equipment/SaveEQOptions`,
    options,
    {
      headers: {
        'Content-Type': 'application/json'
      }
    })
  return ret.data;
}

/**通訊測試 */
export async function ConnectTest(conn_options) {
  var ret = await axios_entity.post(`/api/Equipment/ConnectTest`, conn_options)
  return ret.data;
}

export async function GetEQInfoByTag(tagID) {
  var ret = await axios_entity.get(`/api/Equipment/GetEQInfoByTag?Tag=${tagID}`)
  return ret.data;
}
export async function SetAGVHandshakeIO(EQName, SignalName, State) {
  var url = `/api/Equipment/AgvHsSignal?EqName=${encodeURIComponent(EQName)}&SignalName=${encodeURIComponent(SignalName)}&State=${State}`; //避免帶有特殊符號的時候字串參數會不完整
  var ret = await axios_entity.post(url)
  return ret.data;
}

export async function SetToFullRackStatus(eqName, state) {
  var url = `/api/Equipment/SetToFullRackStatus?EqName=${encodeURIComponent(eqName)}&&State=${state}`; //避免帶有特殊符號的時候字串參數會不完整
  var ret = await axios_entity.post(url)
  return ret.data;
}
export async function SetToEmptyRackStatus(eqName, state) {
  var url = `/api/Equipment/SetToEmptyRackStatus?EqName=${encodeURIComponent(eqName)}&&State=${state}`; //避免帶有特殊符號的時候字串參數會不完整
  var ret = await axios_entity.post(url)
  return ret.data;

}
export async function SetToFullRackStatusByEqTag(eqTag, state) {
  var url = `/api/Equipment/SetToFullRackStatusByEqTag?eqTag=${eqTag}&&State=${state}`; //避免帶有特殊符號的時候字串參數會不完整
  var ret = await axios_entity.post(url)
  return ret.data;
}
export async function SetToEmptyRackStatusByEqTag(eqTag, state) {
  var url = `/api/Equipment/SetToEmptyRackStatusByEqTag?eqTag=${eqTag}&&State=${state}`; //避免帶有特殊符號的時候字串參數會不完整
  var ret = await axios_entity.post(url)
  return ret.data;

}
/**從後端下載EQ GROUP 配置JSON */
export async function DownloadEQGroupConfiguration() {
  var url = `/api/Equipment/EqGroups`; //避免帶有特殊符號的時候字串參數會不完整
  var ret = await axios_entity.get(url)
  return ret.data;
}
/**儲存EQ GROUP 配置*/
export async function SaveEqGroupsConfigs(configs) {
  var url = `/api/Equipment/SaveEqGroupsConfigs`; //避免帶有特殊符號的時候字串參數會不完整
  var ret = await axios_entity.post(url, configs)
  return ret.data;
}

/**CheckMapPointsIsEqTypeButNoEqSetup*/
export async function CheckMapPointsIsEqTypeButNoEqSetup() {
  var url = `/api/Equipment/CheckMapPointsIsEqTypeButNoEqSetup`; //避免帶有特殊符號的時候字串參數會不完整
  var ret = await axios_entity.get(url)
  return ret.data;
}



/**設備模擬器API */
export const EmuAPI = {

  /**設定為Load狀態 */
  async SetState(EQName, State) {
    var url = `/api/Equipment/Emu/State?EqName=${encodeURIComponent(EQName)}&State=${State}`; //避免帶有特殊符號的時候字串參數會不完整
    var ret = await axios_entity.get(url)
    return ret.data;
  },
  async EQDownStatusSimulation(tag, state) {
    var url = `/api/Equipment/Emu/EQDownStatusSimulation?TagNumber=${tag}&isDown=${state}`;
    var ret = await axios_entity.get(url)
    return ret.data;
  },
  async SwitchMaintainstate(tag, state) {
    var url = `/api/Equipment/Emu/MaintainStatusSimulation?TagNumber=${tag}&isMaintain=${state}`;
    var ret = await axios_entity.get(url)
    return ret.data;
  },
  async SwitchPartsReplacing(tag, state) {
    var url = `/api/Equipment/Emu/PartsReplcingSimulation?TagNumber=${tag}&isPartsReplcing=${state}`;
    var ret = await axios_entity.get(url)
    return ret.data;
  },
  /**設定所有EQ為Load狀態 */
  async EQAllLoad() {
    var url = `/api/Equipment/Emu/AllLoad`;
    var ret = await axios_entity.get(url)
    return ret.data;
  },
  /**設定所有EQ為Busy狀態 */
  async EQAllBusy() {
    var url = `/api/Equipment/Emu/AllBusy`;
    var ret = await axios_entity.get(url)
    return ret.data;
  },

  async SetEQHsSignal(EQName, SignalName, State) {
    var url = `/api/Equipment/Emu/HsSignal?EqName=${encodeURIComponent(EQName)}&SignalName=${encodeURIComponent(SignalName)}&State=${State}`; //避免帶有特殊符號的時候字串參數會不完整
    var ret = await axios_entity.get(url)
    return ret.data;
  },
  async SetUpPose(EQName) {
    var url = `/api/Equipment/Emu/SetUpPose?EqName=${encodeURIComponent(EQName)}`; //避免帶有特殊符號的時候字串參數會不完整
    var ret = await axios_entity.get(url)
    return ret.data;
  },
  async SetDownPose(EQName) {
    var url = `/api/Equipment/Emu/SetDownPose?EqName=${encodeURIComponent(EQName)}`; //避免帶有特殊符號的時候字串參數會不完整
    var ret = await axios_entity.get(url)
    return ret.data;
  },
  async SetUnknownPose(EQName) {
    var url = `/api/Equipment/Emu/SetUnknownPose?EqName=${encodeURIComponent(EQName)}`; //避免帶有特殊符號的時候字串參數會不完整
    var ret = await axios_entity.get(url)
    return ret.data;
  },

}

export const RackEmuAPI = {
  async SetSensorState(rack_name, port_id, cargo_type, sensor_number, state) {
    var url = `/api/WIPEmu/SetSensorState?rack_id=${rack_name}&port_id=${port_id}&cargo_type=${cargo_type}&sensor_number=${sensor_number}&state=${state}`;
    var ret = await axios_entity.get(url)
    return ret.data;
  }
}


export const ChargerAPI = {
  async SetCurveSetting(charge_station_name, item, value) {
    var url = `/api/Equipment/ChargeStation/Settings?EqName=${encodeURIComponent(charge_station_name)}&Item=${encodeURIComponent(item)}&Value=${value}`; //避免帶有特殊符號的時候字串參數會不完整
    var ret = await axios_entity.get(url)
    return ret.data
  },
  async SaveUsableAGVSetting(stationName, AGVList) {
    var url = `/api/Equipment/ChargeStation/SaveUsableAGVSetting?ChargeStationName=${encodeURIComponent(stationName)}`; //避免帶有特殊符號的時候字串參數會不完整
    var ret = await axios_entity.post(url, AGVList)
    return ret.data
  },
  async ModifyTagNumber(stationName, newTag) {
    var url = `/api/Equipment/ChargeStation/ModifyTagNumber?ChargeStationName=${encodeURIComponent(stationName)}`; //避免帶有特殊符號的時候字串參數會不完整
    var ret = await axios_entity.post(url, [newTag])
    return ret.data
  }
}