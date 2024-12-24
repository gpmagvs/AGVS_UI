/**AGV狀態ViewModel */
class clsAGVStateDto {
  constructor(dto) {
    if (dto == undefined) {
      this.AGV_Name = ''
      this.AGV_ID = ''
      this.AGV_Description = ''
      this.Model = '0'
      this.Simulation = false
      /** IDLE = 1, RUN=2, DOWN=3, Charging=4, Unknown=5 */
      this.MainStatus = 0
      this.OnlineStatus = 0
      this.CurrentLocation = ''
      this.CurrentCarrierID = ''
      this.BatteryLevel_1 = 0
      this.BatteryLevel_2 = 0
      this.TaskName = ''
      this.TaskRunStatus = 0
      this.TaskRunAction = 0
      this.Theta = 0
      this.Connected = false
      this.StationName = ''
      this.Group = 0
      this.IsCharging = false
      this.Protocol = 0
      this.IP = '127.0.0.1'
      this.Port = 7025
      this.TaskSourceStationName = ""
      this.TaskDestineStationName = ""
      this.TransferProcess = 0
      this.CurrentAction = 0
      this.TaskRunAction = 0
      this.TaskETA = "9999-12-31T23:59:59.9999999"
      this.IsExecutingOrder = false
      this.VehicleLength = 145
      this.VehicleWidth = 70
      this.LowBatLvThreshold = 70
      this.MiddleBatLvThreshold = 70
      this.HighBatLvThreshold = 70
      this.UIOptions = {

      }
      this.AppVersion = "1.0.0"

    } else {
      this.AGV_Name = dto.AGV_Name
      this.AGV_ID = dto.AGV_ID
      this.AGV_Description = dto.AGV_Description
      this.Model = dto.Model
      this.MainStatus = dto.MainStatus
      this.OnlineStatus = dto.OnlineStatus
      this.CurrentLocation = dto.CurrentLocation
      this.CurrentCarrierID = dto.CurrentCarrierID
      this.BatteryLevel_1 = dto.BatteryLevel_1
      this.BatteryLevel_2 = dto.BatteryLevel_2
      this.TaskName = dto.TaskName
      this.TaskRunStatus = dto.TaskRunStatus
      this.TaskRunAction = dto.TaskRunAction
      this.Theta = dto.Theta
      this.Connected = dto.Connected
      this.Simulation = dto.Simulation
      this.StationName = dto.StationName
      this.Group = dto.Group
      this.IsCharging = dto.IsCharging
      this.Protocol = dto.Protocol
      this.IP = dto.IP
      this.Port = dto.Port
      this.TaskSourceStationName = dto.TaskSourceStationName
      this.TaskDestineStationName = dto.TaskDestineStationName
      this.TransferProcess = dto.TransferProcess
      this.CurrentAction = dto.CurrentAction
      this.TaskRunAction = dto.TaskRunAction
      this.TaskETA = dto.TaskETA
      this.IsExecutingOrder = dto.IsExecutingOrder
      this.VehicleLength = dto.VehicleLength
      this.VehicleWidth = dto.VehicleWidth
      this.UIOptions = dto.UIOptions
      this.LowBatLvThreshold = dto.LowBatLvThreshold
      this.MiddleBatLvThreshold = dto.MiddleBatLvThreshold
      this.HighBatLvThreshold = dto.HighBatLvThreshold
      this.AppVersion = dto.AppVersion
    }
  }
}

export default clsAGVStateDto
