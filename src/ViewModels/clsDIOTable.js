class clsDIOTable {
  Inputs
  Outputs
<<<<<<< HEAD
  constructor() {
=======
  IsE84HsUseEmulator
  constructor() {
    this.IsE84HsUseEmulator = false
>>>>>>> ae44f2291e3361fe9e9cbc8a15ef35f6dcc8c6c7
    this.Inputs = [
      new clsRegister('X0000', 'name1'),
      new clsRegister('X0001', 'name2'),
    ]
    this.Outputs = [
      new clsRegister('Y0000', 'name1'),
      new clsRegister('Y0001', 'name2'),
    ]
  }
}

export class clsRegister {
  constructor(address_display, name) {
    this.address_display = address_display
<<<<<<< HEAD
    this.name = name
  }
  address = 0
  address_display = ''
  name = ''
  State = false
  DigitalType = 0
}

=======
    this.Name = name
  }
  Address = 0
  address_display = ''
  Name = ''
  State = false
  DigitalType = 0

}

/**DO 輸出選項 */
export const DO_ITEMS = [
  { label: "", value: "" },
  { label: "Unknown", value: "Unknown" },
  { label: "EMU_EQ_L_REQ", value: "EMU_EQ_L_REQ" },
  { label: "EMU_EQ_U_REQ", value: "EMU_EQ_U_REQ" },
  { label: "EMU_EQ_READY", value: "EMU_EQ_READY" },
  { label: "EMU_EQ_UP_READY", value: "EMU_EQ_UP_READY" },
  { label: "EMU_EQ_LOW_READY", value: "EMU_EQ_LOW_READY" },
  { label: "EMU_EQ_BUSY", value: "EMU_EQ_BUSY" },
  { label: "EMU_EQ_GO", value: "EMU_EQ_GO" },
  { label: "Recharge_Circuit", value: "Recharge_Circuit" },
  { label: "Motor_Safety_Relay", value: "Motor_Safety_Relay" },
  { label: "Safety_Relays_Reset", value: "Safety_Relays_Reset" },
  { label: "Horizon_Motor_Stop", value: "Horizon_Motor_Stop" },
  { label: "Horizon_Motor_Free", value: "Horizon_Motor_Free" },
  { label: "Horizon_Motor_Reset", value: "Horizon_Motor_Reset" },
  { label: "Horizon_Motor_Brake", value: "Horizon_Motor_Brake" },
  { label: "Vertical_Motor_Stop", value: "Vertical_Motor_Stop" },
  { label: "Vertical_Motor_Free", value: "Vertical_Motor_Free" },
  { label: "Vertical_Motor_Reset", value: "Vertical_Motor_Reset" },
  { label: "Front_LsrBypass", value: "Front_LsrBypass" },
  { label: "Back_LsrBypass", value: "Back_LsrBypass" },
  { label: "Left_LsrBypass", value: "Left_LsrBypass" },
  { label: "Right_LsrBypass", value: "Right_LsrBypass" },
  { label: "Fork_Under_Pressing_SensorBypass", value: "Fork_Under_Pressing_SensorBypass" },
  { label: "Vertical_Belt_SensorBypass", value: "Vertical_Belt_SensorBypass" },
  { label: "AGV_DiractionLight_Front", value: "AGV_DiractionLight_Front" },
  { label: "AGV_DiractionLight_Back", value: "AGV_DiractionLight_Back" },
  { label: "AGV_DiractionLight_R", value: "AGV_DiractionLight_R" },
  { label: "AGV_DiractionLight_Y", value: "AGV_DiractionLight_Y" },
  { label: "AGV_DiractionLight_G", value: "AGV_DiractionLight_G" },
  { label: "AGV_DiractionLight_B", value: "AGV_DiractionLight_B" },
  { label: "AGV_DiractionLight_Left", value: "AGV_DiractionLight_Left" },
  { label: "AGV_DiractionLight_Right", value: "AGV_DiractionLight_Right" },
  { label: "AGV_DiractionLight_Left_2", value: "AGV_DiractionLight_Left_2" },
  { label: "AGV_DiractionLight_Right_2", value: "AGV_DiractionLight_Right_2" },
  { label: "Vertical_Hardware_limit_bypass", value: "Vertical_Hardware_limit_bypass" },
  { label: "AGV_VALID", value: "AGV_VALID" },
  { label: "AGV_READY", value: "AGV_READY" },
  { label: "AGV_TR_REQ", value: "AGV_TR_REQ" },
  { label: "AGV_BUSY", value: "AGV_BUSY" },
  { label: "AGV_COMPT", value: "AGV_COMPT" },
  { label: "AGV_L_REQ", value: "AGV_L_REQ" },
  { label: "AGV_U_REQ", value: "AGV_U_REQ" },
  { label: "AGV_CS_0", value: "AGV_CS_0" },
  { label: "AGV_CS_1", value: "AGV_CS_1" },
  { label: "AGV_Check_REQ", value: "AGV_Check_REQ" },
  { label: "TO_EQ_Low", value: "TO_EQ_Low" },
  { label: "TO_EQ_Up", value: "TO_EQ_Up" },
  { label: "CMD_reserve_Up", value: "CMD_reserve_Up" },
  { label: "CMD_reserve_Low", value: "CMD_reserve_Low" },
  { label: "Front_Protection_Sensor_IN_1", value: "Front_Protection_Sensor_IN_1" },
  { label: "Front_Protection_Sensor_CIN_1", value: "Front_Protection_Sensor_CIN_1" },
  { label: "Front_Protection_Sensor_IN_2", value: "Front_Protection_Sensor_IN_2" },
  { label: "Front_Protection_Sensor_CIN_2", value: "Front_Protection_Sensor_CIN_2" },
  { label: "Front_Protection_Sensor_IN_3", value: "Front_Protection_Sensor_IN_3" },
  { label: "Front_Protection_Sensor_CIN_3", value: "Front_Protection_Sensor_CIN_3" },
  { label: "Front_Protection_Sensor_IN_4", value: "Front_Protection_Sensor_IN_4" },
  { label: "Front_Protection_Sensor_CIN_4", value: "Front_Protection_Sensor_CIN_4" },
  { label: "Back_Protection_Sensor_IN_1", value: "Back_Protection_Sensor_IN_1" },
  { label: "Back_Protection_Sensor_CIN_1", value: "Back_Protection_Sensor_CIN_1" },
  { label: "Back_Protection_Sensor_IN_2", value: "Back_Protection_Sensor_IN_2" },
  { label: "Back_Protection_Sensor_CIN_2", value: "Back_Protection_Sensor_CIN_2" },
  { label: "Back_Protection_Sensor_IN_3", value: "Back_Protection_Sensor_IN_3" },
  { label: "Back_Protection_Sensor_CIN_3", value: "Back_Protection_Sensor_CIN_3" },
  { label: "Back_Protection_Sensor_IN_4", value: "Back_Protection_Sensor_IN_4" },
  { label: "Back_Protection_Sensor_CIN_4", value: "Back_Protection_Sensor_CIN_4" },
  { label: "Left_Protection_Sensor_IN_1", value: "Left_Protection_Sensor_IN_1" },
  { label: "Left_Protection_Sensor_IN_2", value: "Left_Protection_Sensor_IN_2" },
  { label: "Left_Protection_Sensor_IN_3", value: "Left_Protection_Sensor_IN_3" },
  { label: "Left_Protection_Sensor_IN_4", value: "Left_Protection_Sensor_IN_4" },
  { label: "Ultrasound_Bypass", value: "Ultrasound_Bypass" },
  { label: "N2_Open", value: "N2_Open" },
  { label: "Instrument_Servo_On", value: "Instrument_Servo_On" },
  { label: "Battery_2_Lock", value: "Battery_2_Lock" },
  { label: "Battery_2_Unlock", value: "Battery_2_Unlock" },
  { label: "Battery_1_Lock", value: "Battery_1_Lock" },
  { label: "Battery_1_Unlock", value: "Battery_1_Unlock" },
  { label: "Battery_1_Electricity_Interrupt", value: "Battery_1_Electricity_Interrupt" },
  { label: "Battery_2_Electricity_Interrupt", value: "Battery_2_Electricity_Interrupt" },
  { label: "Infrared_Door_1", value: "Infrared_Door_1" },
  { label: "Infrared_PW_2", value: "Infrared_PW_2" },
  { label: "Infrared_PW_1", value: "Infrared_PW_1" },
  { label: "Infrared_PW_0", value: "Infrared_PW_0" },
  { label: "Infrared_Door_2", value: "Infrared_Door_2" },
  { label: "Fork_Extend", value: "Fork_Extend" },
  { label: "Fork_Shortend", value: "Fork_Shortend" },
];


/**DI 輸入選項 */
export const DI_ITEMS = [
  { label: "", value: "" },
  { label: "Unknown", value: "Unknown" },
  { label: "EMO", value: "EMO" },
  { label: "EMO_Button", value: "EMO_Button" },
  { label: "EMO_Button_2", value: "EMO_Button_2" },
  { label: "Bumper_Sensor", value: "Bumper_Sensor" },
  { label: "Panel_Reset_PB", value: "Panel_Reset_PB" },
  { label: "Horizon_Motor_Switch", value: "Horizon_Motor_Switch" },
  { label: "Vertical_Motor_Switch", value: "Vertical_Motor_Switch" },
  { label: "Monitor_Switch", value: "Monitor_Switch" },
  { label: "Fork_Extend_Exist_Sensor", value: "Fork_Extend_Exist_Sensor" },
  { label: "Fork_Short_Exist_Sensor", value: "Fork_Short_Exist_Sensor" },
  { label: "RACK_Exist_Sensor_1", value: "RACK_Exist_Sensor_1" },
  { label: "RACK_Exist_Sensor_2", value: "RACK_Exist_Sensor_2" },
  { label: "TRAY_Exist_Sensor_1", value: "TRAY_Exist_Sensor_1" },
  { label: "TRAY_Exist_Sensor_2", value: "TRAY_Exist_Sensor_2" },
  { label: "TRAY_Exist_Sensor_3", value: "TRAY_Exist_Sensor_3" },
  { label: "TRAY_Exist_Sensor_4", value: "TRAY_Exist_Sensor_4" },
  { label: "Fork_Frontend_Abstacle_Sensor", value: "Fork_Frontend_Abstacle_Sensor" },
  { label: "Fork_Under_Pressing_Sensor", value: "Fork_Under_Pressing_Sensor" },
  { label: "Horizon_Motor_Alarm_1", value: "Horizon_Motor_Alarm_1" },
  { label: "Horizon_Motor_Alarm_2", value: "Horizon_Motor_Alarm_2" },
  { label: "Horizon_Motor_Alarm_3", value: "Horizon_Motor_Alarm_3" },
  { label: "Horizon_Motor_Alarm_4", value: "Horizon_Motor_Alarm_4" },
  { label: "Horizon_Motor_Error_1", value: "Horizon_Motor_Error_1" },
  { label: "Horizon_Motor_Error_2", value: "Horizon_Motor_Error_2" },
  { label: "Horizon_Motor_Error_3", value: "Horizon_Motor_Error_3" },
  { label: "Horizon_Motor_Error_4", value: "Horizon_Motor_Error_4" },
  { label: "Horizon_Motor_Busy_1", value: "Horizon_Motor_Busy_1" },
  { label: "Horizon_Motor_Busy_2", value: "Horizon_Motor_Busy_2" },
  { label: "Horizon_Motor_Busy_3", value: "Horizon_Motor_Busy_3" },
  { label: "Horizon_Motor_Busy_4", value: "Horizon_Motor_Busy_4" },
  { label: "Vertical_Motor_Alarm", value: "Vertical_Motor_Alarm" },
  { label: "Vertical_Motor_Busy", value: "Vertical_Motor_Busy" },
  { label: "Vertical_Home_Pos", value: "Vertical_Home_Pos" },
  { label: "Vertical_Up_Pose", value: "Vertical_Up_Pose" },
  { label: "Vertical_Down_Pose", value: "Vertical_Down_Pose" },
  { label: "Vertical_Up_Hardware_limit", value: "Vertical_Up_Hardware_limit" },
  { label: "Vertical_Down_Hardware_limit", value: "Vertical_Down_Hardware_limit" },
  { label: "Vertical_Belt_Sensor", value: "Vertical_Belt_Sensor" },
  { label: "EQ_L_REQ", value: "EQ_L_REQ" },
  { label: "EQ_U_REQ", value: "EQ_U_REQ" },
  { label: "EQ_READY", value: "EQ_READY" },
  { label: "EQ_UP_READY", value: "EQ_UP_READY" },
  { label: "EQ_LOW_READY", value: "EQ_LOW_READY" },
  { label: "EQ_BUSY", value: "EQ_BUSY" },
  { label: "EQ_GO", value: "EQ_GO" },
  { label: "EQ_COMPT", value: "EQ_COMPT" },
  { label: "EQ_VALID", value: "EQ_VALID" },
  { label: "EQ_TR_REQ", value: "EQ_TR_REQ" },
  { label: "EQ_Check_Result", value: "EQ_Check_Result" },
  { label: "EQ_Check_Ready", value: "EQ_Check_Ready" },
  { label: "FrontProtection_Obstacle_Sensor", value: "FrontProtection_Obstacle_Sensor" },
  { label: "FrontProtection_Area_Sensor_1", value: "FrontProtection_Area_Sensor_1" },
  { label: "FrontProtection_Area_Sensor_2", value: "FrontProtection_Area_Sensor_2" },
  { label: "FrontProtection_Area_Sensor_3", value: "FrontProtection_Area_Sensor_3" },
  { label: "FrontProtection_Area_Sensor_4", value: "FrontProtection_Area_Sensor_4" },
  { label: "BackProtection_Area_Sensor_1", value: "BackProtection_Area_Sensor_1" },
  { label: "BackProtection_Area_Sensor_2", value: "BackProtection_Area_Sensor_2" },
  { label: "BackProtection_Area_Sensor_3", value: "BackProtection_Area_Sensor_3" },
  { label: "BackProtection_Area_Sensor_4", value: "BackProtection_Area_Sensor_4" },
  { label: "LeftProtection_Area_Sensor_1", value: "LeftProtection_Area_Sensor_1" },
  { label: "LeftProtection_Area_Sensor_2", value: "LeftProtection_Area_Sensor_2" },
  { label: "LeftProtection_Area_Sensor_3", value: "LeftProtection_Area_Sensor_3" },
  { label: "RightProtection_Area_Sensor_1", value: "RightProtection_Area_Sensor_1" },
  { label: "RightProtection_Area_Sensor_2", value: "RightProtection_Area_Sensor_2" },
  { label: "RightProtection_Area_Sensor_3", value: "RightProtection_Area_Sensor_3" },
  { label: "Battery_2_Exist_1", value: "Battery_2_Exist_1" },
  { label: "Battery_2_Exist_2", value: "Battery_2_Exist_2" },
  { label: "Battery_2_Exist_3", value: "Battery_2_Exist_3" },
  { label: "Battery_2_Exist_4", value: "Battery_2_Exist_4" },
  { label: "Battery_1_Exist_1", value: "Battery_1_Exist_1" },
  { label: "Battery_1_Exist_2", value: "Battery_1_Exist_2" },
  { label: "Battery_1_Exist_3", value: "Battery_1_Exist_3" },
  { label: "Battery_1_Exist_4", value: "Battery_1_Exist_4" },
  { label: "Battery_1_Lock_Sensor", value: "Battery_1_Lock_Sensor" },
  { label: "Battery_1_Unlock_Sensor", value: "Battery_1_Unlock_Sensor" },
  { label: "Battery_2_Lock_Sensor", value: "Battery_2_Lock_Sensor" },
  { label: "Battery_2_Unlock_Sensor", value: "Battery_2_Unlock_Sensor" },
  { label: "SMS_Error", value: "SMS_Error" },
  { label: "Ground_Hole_CCD_1", value: "Ground_Hole_CCD_1" },
  { label: "Ground_Hole_CCD_2", value: "Ground_Hole_CCD_2" },
  { label: "Ground_Hole_CCD_3", value: "Ground_Hole_CCD_3" },
  { label: "Ground_Hole_CCD_4", value: "Ground_Hole_CCD_4" },
  { label: "Ground_Hole_Sensor_1", value: "Ground_Hole_Sensor_1" },
  { label: "Ground_Hole_Sensor_2", value: "Ground_Hole_Sensor_2" },
  { label: "Ground_Hole_Sensor_3", value: "Ground_Hole_Sensor_3" },
  { label: "Ground_Hole_Sensor_4", value: "Ground_Hole_Sensor_4" },
  { label: "Smoke_Sensor_1", value: "Smoke_Sensor_1" },
  { label: "N2_Sensor", value: "N2_Sensor" },
  { label: "Up_Cargo_Exist_Sernsor", value: "Up_Cargo_Exist_Sernsor" },
  { label: "Down_Cargo_Exist_Sernsor", value: "Down_Cargo_Exist_Sernsor" },
  { label: "Safty_PLC_Output", value: "Safty_PLC_Output" },
  { label: "Front_Right_Ultrasound_Sensor", value: "Front_Right_Ultrasound_Sensor" },
  { label: "Back_Left_Ultrasound_Sensor", value: "Back_Left_Ultrasound_Sensor" },
  { label: "Limit_Switch_Sensor", value: "Limit_Switch_Sensor" },
];

>>>>>>> ae44f2291e3361fe9e9cbc8a15ef35f6dcc8c6c7
export default clsDIOTable
