import moment from 'moment'

class clsTaskState {
  constructor(task) {
    this.TaskName = task.TaskName
    this.State = task.State
    this.StateName = task.StateName
    this.RecieveTime = task.RecieveTime
    this.FinishTime = task.FinishTime
    this.DispatcherName = task.DispatcherName
    this.DesignatedAGVName = task.DesignatedAGVName
    this.ACTIONS = {
      MOVE: 0,
      LOAD: 1,
      UNLOAD: 2,
      CHARGE: 3,
      CARRY: 4,
    }
    this.Action = task.Action
    this.From_Station = task.From_Station
    this.From_Slot = task.From_Slot
    this.To_Station = task.To_Station
    this.To_Slot = task.To_Slot
    this.Carrier_ID = task.Carrier_ID
    this.Priority = task.Priority
  }
  get RecieveTime_Formated() {
    return moment(this.RecieveTime).format('HH:mm:ss')
  }
  get FinishTime_Formated() {
    return moment(this.FinishTime).format('HH:mm:ss')
  }

  get ActionName() {
    switch (this.Action) {
      case 0:
        return '移動'
      case 1:
        return '取貨'
      case 2:
        return '取貨並停車'
      case 3:
        return '前進'
      case 4:
        return '後退'
      case 7:
        return '放貨'
      case 8:
        return '充電'
      case 9:
        return '搬運'
      case 12:
        return '停車'
      default:
        return 'Unknown'
    }
  }
}

export default clsTaskState
