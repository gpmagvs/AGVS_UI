/**
 * Rack儲格的屬性
 */
class RackPortProperty {
    constructor() {
        this.Notes = {
            ProductionQualityStore: "該PORT可存放OK/NG產品設定(0:僅可放OK產品 | 1: NG:僅可放NG產品)",
            CargoTypeStore: "該PORT可存放的貨物種類(0:Tray | 1: Rack | 2:Mixed)"
        };

        this.Row = 0;
        this.Column = 0;
        this.PortNo = "1";
        this.ProductionQualityStore = "OK"; // Enum PRUDUCTION_QUALITY
        this.CargoTypeStore = "MIXED"; // Enum CARGO_TYPE
        this.PortEnable = "Enable"; // Enum Port_Enable
        this.IOLocation = new clsPortIOLocation();
        this.EQInstall = new clsPortUseToEQProperty();

        this.HasTrayDirectionSensor = false;
        this.HasTraySensor = true;
        this.HasRackSensor = true;
        this.StoragePriority = 0;
    }

    get ID() {
        return `${this.Row}-${this.Column}`;
    }
}

class clsPortUseToEQProperty {
    constructor() {
        /**
         * Just like QX Converter or GPM LawDrop(?)
         */
        this.IsUseForEQ = false;
        this.BindingEQName = "";
    }
}

class clsPortIOLocation {
    constructor() {
        // X-Input
        this.Tray_Sensor1 = 0;
        this.Tray_Sensor2 = 0;
        this.Box_Sensor1 = 0;
        this.Box_Sensor2 = 0;
        this.Tray_Direction_Sensor = 0;
        this.Rack_Area_Sensor = 0;
    }
}

export default RackPortProperty;