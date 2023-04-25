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
      this.BatteryLevel = 0
      this.TaskName = ''
      this.TaskRunStatus = 0
      this.TaskRunAction = 0
      this.Theta = 0
      this.Connected = false
    } else {
      this.AGV_Name = dto.AGV_Name
      this.AGV_Description = dto.AGV_Description
      this.Model = dto.Model
      this.MainStatus = dto.MainStatus
      this.OnlineStatus = dto.OnlineStatus
      this.CurrentLocation = dto.CurrentLocation
      this.CurrentCarrierID = dto.CurrentCarrierID
      this.BatteryLevel = dto.BatteryLevel
      this.TaskName = dto.TaskName
      this.TaskRunStatus = dto.TaskRunStatus
      this.TaskRunAction = dto.TaskRunAction
      this.Theta = dto.Theta
      this.Connected = dto.Connected
    }
  }
}

export default clsAGVStateDto
