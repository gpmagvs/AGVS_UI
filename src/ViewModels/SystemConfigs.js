export class AGVSSystemConfigs {
    BaseOnKGSWebAGVSystem = false;
    FieldName = "UMTC-S15F";
    DBConnection = "Server=127.0.0.1;Database=GPMAGVs_V3;User Id=sa;Password=12345678;Encrypt=False";
    PartsAGVSDBConnection = "Server=127.0.0.1;Database=AGVS_Info;User Id=sa;Password=Tsmc12345678;Encrypt=False;MultipleActiveResultSets=True;Connection Lifetime=1;Min Pool Size=5;Max Pool Size=50;MultipleActiveResultSets=True;";
    KGSWebAGVSystemDBConnection = "Server=127.0.0.1;Database=WebAGVSystem;User Id=sa;Password=12345678;Encrypt=False;MultipleActiveResultSets=True;Connection Lifetime=1;Min Pool Size=5;Max Pool Size=50;MultipleActiveResultSets=True;";
    VMSHost = "http://localhost:5036";
    AGVSHost = "http://localhost:5216";
    VMSTcpServerIP = "192.168.0.1";
    VMSTcpServerPort = 5500;
    WebUserLogoutExipreTime = 3600;
    MapConfigs = {
        MapFolder: "C://AGVS//Map",
        CurrentMapFileName: "Map_UMTC_5F_SMK_OVEN.json",
        MapRegionConfigFile: "C://AGVS//Map//MapRegions.json",
        MapFileFullName: "C://AGVS//Map\\Map_UMTC_5F_SMK_OVEN.json"
    };
    EQManagementConfigs = {
        UseEQEmu: false,
        EquipmentManagementConfigFolder: "C://AGVS//EquipmentManagement",
        DisableEntryPointWhenEQMaintaining: false,
        DisableEntryPointWhenEQPartsReplacing: false,
        TransferToNGPortWhenCarrierIDMissmatch: false
    };
    AutoModeConfigs = {
        AGVIdleTimeUplimitToExecuteChargeTask: 3
    };
    AutoSendDailyData = {
        SavePath: "C:\\DailyData\\",
        SaveTime: 1
    };
    clsAGVS_Print_Data = {
        SavePath: "C:\\AGVS_Print_Data\\"
    };
    AGVUpdateFileFolder = "C:\\AGVS\\AGV_Update";
    LogFolder = "C:\\AGVSLog";
    TrobleShootingFolder = "D:\\Program\\AGVSystem\\bin\\Debug\\net6.0\\Resources\\";
    MaterialBufferLevelMonitor = {
        MonitorSwitch: false,
        LevelThreshold: 0
    };
    LinkPartsAGVSystem = false;
    OrderState = {
        TaskNoExecutedTimeout: 20
    };
}