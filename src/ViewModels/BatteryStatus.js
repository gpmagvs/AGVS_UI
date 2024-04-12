class BatteryStatus {
<<<<<<< HEAD
  BatteryLevel = 0
  IsCharging = false
  ChargeCurrent = 0.0
}
=======
  BatteryLevel = 3
  IsCharging = false
  ChargeCurrent = 0.0
  IsError = true
  CircuitOpened = false
  BatteryID = 0
  SensorInfo = new BatteryPositionInfoVM()
  constructor(level) {
    this.BatteryLevel = level
  }
}

class BatteryPositionInfoVM {
  IsExistSensor1ON = false
  IsExistSensor2ON = false
  IsDockingSensor1ON = false
  IsDockingSensor2ON = false
  IsLockSensorON = false
  IsUnlockSensorON = false
}

>>>>>>> ae44f2291e3361fe9e9cbc8a15ef35f6dcc8c6c7
export default BatteryStatus
