/**AGV狀態ViewModel */
class clsAGVStateDto {
  constructor(dto) {
    if (dto == undefined) {
      this.AGV_Name = ''
      this.AGV_Description = ''
      this.Model = ''
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
      this.IP = '127.0.0.1'
      this.Port = 7025
      this.TaskSourceStationName = ""
      this.TaskDestineStationName = ""
      this.TransferProcess = 0
      this.OrderAction = 0
      this.TaskETA = ""
    } else {
      this.AGV_Name = dto.AGV_Name
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
      this.StationName = dto.StationName
      this.Group = dto.Group
      this.IsCharging = dto.IsCharging
      this.IP = dto.IP
      this.Port = dto.Port
      this.TaskSourceStationName = dto.TaskSourceStationName
      this.TaskDestineStationName = dto.TaskDestineStationName
      this.TransferProcess = dto.TransferProcess
      this.OrderAction = dto.OrderAction
      this.TaskETA = dto.TaskETA
    }
  }
}

export default clsAGVStateDto
