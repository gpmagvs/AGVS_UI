/**資料查詢通用參數 */
class clsQueryOptions {
    constructor() {
        this.AGVName = "ALL";
        this.Result = 0; //0 Success,1 Fail, 2 ALL
        this.StartTimeStr = "";
        this.EndTimeStr = "";
        this.DataNumPerPage = 15;
        this.Page = 1;
    }
}
export default clsQueryOptions