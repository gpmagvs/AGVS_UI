/**設備參數 */
export class DeviceConfig {
    constructor() {
        this.Notes = {
            "Accept_AGV_Type": "允許進行任務之車輛種類(0:所有車種,1:叉車AGV, 2:潛盾AGV)",
            "EQAcceeptCargoType": "設備可移載的貨物種類(0:不限, 200:子母框, 201:Tray)",
            "CheckRackContentStateIOSignal": "空框/實框IO訊號檢查(目前僅 UMTC S1/5F專案須將此設為true, false:不檢查,true:檢查)"
        };
        this.Enable = true;
        this.ConnOptions = new ConnOptions();
        this.Name = "EQP";
        this.DeviceID = "SYS2341G23";
        this.TagID = 0;
        this.EqType = 0;
        this.LdULdType = 2;
        this.LoadUnloadCargoMode = 0;
        this.EQAcceeptCargoType = 200;
        this.Accept_AGV_Type = 0;
        this.Region = "";
        this.ValidDownStreamEndPointNames = [];
        this.IOLocation = {
            "Load_Request": 0,
            "Unload_Request": 1,
            "Port_Exist": 2,
            "Eqp_Status_Down": 5,
            "Eqp_Status_Run": 8,
            "Eqp_Status_Idle": 9,
            "HS_EQ_L_REQ": 10,
            "HS_EQ_U_REQ": 11,
            "HS_EQ_READY": 12,
            "HS_EQ_UP_READY": 13,
            "HS_EQ_LOW_READY": 14,
            "Up_Pose": 3,
            "Down_Pose": 4,
            "HS_EQ_BUSY": 15,
            "Empty_CST": 16,
            "Full_CST": 17,
            "Eqp_Maintaining": 7,
            "Eqp_PartsReplacing": 8,
            "To_EQ_Up": 0,
            "To_EQ_Low": 1,
            "HS_AGV_VALID": 8,
            "HS_AGV_TR_REQ": 9,
            "HS_AGV_BUSY": 11,
            "HS_AGV_COMPT": 12,
            "CMD_Reserve_Up": 2,
            "CMD_Reserve_Low": 3,
            "HS_AGV_READY": 10,
            "To_EQ_Empty_CST": 9,
            "To_EQ_Full_CST": 10
        };
        this.PLCOptionJsonFile = null;
        this.InstalledCargoID = "";
        this.Height = 0;
        this.CheckRackContentStateIOSignal = false;
        this.IsEmulation = true;
        this.EmulationMode = 0;
        this.AcceptTransferTag = [];
        this.IsNeedStorageMonitor = false;
        this.StorageMonitorPriority = 0;
        this.index = 0;
        this.HasCstSteeringMechanism = false;
        this.IsOneOfDualPorts = false;
        this.AllowUnloadPortTypeNumber = 0;
        this.AnotherPortTagNumber = 0;
    }
}

export class ConnOptions {
    constructor() {
        this.Notes = {
            "ConnMethod": "0:MODBUS_TCP | 1:MODBUS_RTU | 2:TCPIP | 3:SERIAL_PORT | 4:MX | 5:MC",
            "IO_VALUE_TYPE": "0:INPUT | 1:INPUT_REGISTER"
        };
        this.ConnMethod = 0;
        this.IP = "127.0.0.1";
        this.Port = 502;
        this.AGVModbusGatewayPort = 502;
        this.ComPort = "COM1";
        this.IsPLCAddress_Base_1 = false;
        this.Input_StartRegister = 0;
        this.Input_RegisterNum = 16;
        this.Output_Start_Address = 0;
        this.IO_Value_Type = 0;
    }
}