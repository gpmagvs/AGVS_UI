/**設備數據模型 */
export default class EQStatusDIDto {
    constructor(eqType) {
        this.EqType = eqType;

        // 初始化属性
        this.IsConnected = false;
        this.EQName = '';
        this.MainStatus = 0;
        this.TransferStatus = 0;
        this.Load_Request = false;
        this.Unload_Request = false;
        this.Port_Exist = false;
        this.Up_Pose = false;
        this.Down_Pose = false;
        this.Eqp_Status_Down = false;
        this.Eqp_Status_Run = false;
        this.Eqp_Status_Idle = false;
        this.Cmd_Reserve_Up = false;
        this.Cmd_Reserve_Low = false;
        this.To_EQ_Up = false;
        this.To_EQ_Low = false;
        this.HS_EQ_L_REQ = false;
        this.HS_EQ_U_REQ = false;
        this.HS_EQ_READY = false;
        this.HS_EQ_UP_READY = false;
        this.HS_EQ_LOW_READY = false;
        this.HS_EQ_BUSY = false;
        this.HS_AGV_VALID = false;
        this.HS_AGV_TR_REQ = false;
        this.HS_AGV_BUSY = false;
        this.HS_AGV_READY = false;
        this.HS_AGV_COMPT = false;
        this.Region = '';
        this.Tag = 0;
        this.Full_CST = false;
        this.Empty_CST = false;
        this.To_EQ_Full_CST = false;
        this.To_EQ_Empty_CST = false;
        this.IsMaintaining = false;
        this.IsPartsReplacing = false;
    }
}
