import axios from 'axios'
import param from '@/gpm_param'
var axios_entity = axios.create({
    baseURL: param.vms_host,
})

const apiMap = {
    GetSettings: 'api/VehicleMaintain',
    ResetCurrentVal: 'api/VehicleMaintain/ResetCurrentValue',
    SettingMaintainValue: 'api/VehicleMaintain/SettingMaintainValue',
}

const VehicleMaintainAPI = {

    GetSettings: async () => {
        var result = await axios_entity.get(`${apiMap.GetSettings}`);
        return result.data;
    },
    /**重設當前數值 */
    ResetCurrentValue: async (agvName = 'AGV_001', item = 100) => {
        var result = await axios_entity.post(`${apiMap.ResetCurrentVal}?agvName=${agvName}&item=${item}`);
        return result.data;
    },
    /**設定保養里程數值 */
    SettingMaintainValue: async (agvName = 'AGV_001', item = 100, value = 0.0) => {
        var result = await axios_entity.post(`${apiMap.SettingMaintainValue}?agvName=${agvName}&item=${item}&value=${value}`);
        return result.data;
    }
}

export default VehicleMaintainAPI;