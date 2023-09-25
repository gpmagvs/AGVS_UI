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

