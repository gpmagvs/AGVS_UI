import axios from 'axios'
import param from '@/gpm_param'
var _axios = axios.create({
   baseURL: param.backend_host,
})

/**取得前端網頁設定參數 */
export async function GetFrontendOptions() {
   var ret = await _axios.get(`api/System/WebSite`);
   return ret.data;
}



/**取得模式設定狀態(RUNMODE, HOST_CONN, HOST_OPERATION ) */
export async function GetOperationStates(mode = 0 | 1) {
   var ret = await _axios.get(`api/system/OperationStates`);
   return ret.data;
}


/**運轉模式切換。
 * 0:Maintain
 * 1:Run
 */
export async function RunMode(mode = 0 | 1, forecing_change = false) {
   var ret = await _axios.post(`api/system/runmode?mode=${mode}&forecing_change=${forecing_change}`);
   return ret.data;
}

/**Host Online/Offline模式切換。
 * 0:Offline
 * 1:Online
 */
export async function HostConnMode(mode = 0 | 1) {
   var ret = await _axios.post(`api/system/hostconn?mode=${mode}`);
   return ret.data;
}

/**HOST Local/Remote模式切換。
 * 0:Local
 * 1:Remote
 */
export async function HostOperationMode(mode = 0 | 1) {
   var ret = await _axios.post(`api/system/hostoperation?mode=${mode}`);
   return ret.data;
}

