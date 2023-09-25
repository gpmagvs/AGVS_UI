import axios from 'axios'
import param from '@/gpm_param'
import clsQueryOptions from './Common/clsQueryOptions';
var axios_entity = axios.create({
    baseURL: param.backend_host,
})


/**查詢儀器量測結果 */
export async function Query(option = clsQueryOptions) {
    var response = await axios_entity.post('/api/InstrumentMeasure', option);
    return response.data;
}

/**取得排程量測資料 */
export async function GetSchedules() {
    var response = await axios_entity.get('/api/InstrumentMeasure/GetMeasureSchedules');
    return response.data;
}
/**刪除排程 */
export async function DeleteSchedule(time, agv_name) {
    var response = await axios_entity.delete(`/api/InstrumentMeasure/DeleteSchedule?time=${time}&agv_name=${agv_name}`);
    return response.data;
}
/**新增排程量測 */
export async function AddNewMeasureSchedule(schedule) {
    var response = await axios_entity.post('/api/InstrumentMeasure/AddNewMeasureSchedule', schedule);
    return response.data;
}
