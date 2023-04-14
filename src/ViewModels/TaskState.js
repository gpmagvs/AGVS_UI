import moment from 'moment'

class clsTaskState {
  constructor(task) {
    this.TaskName = task.TaskName
    this.State = task.State
    this.TaskDispatchData = task.TaskDispatchData
    this.RecieveTime = task.RecieveTime
    this.DispatcherName = task.DispatcherName
  }
  get RecieveTime_Formated() {
    return moment(this.RecieveTime).format('HH:mm:ss')
  }
  get StateName() {
    switch (this.State) {
      case 0:
        return '等待'
      case 1:
        return '執行中'
      case 2:
        return '完成'
      case 3:
        return '失敗'
      default:
        return '等待'
    }
  }
}

class clsTaskDispatchDto {
  constructor() {
    this.TaskName = ''
    this.DesignatedAGVName = ''
    this.ACTIONS = {
      MOVE: 0,
      LOAD: 1,
      UNLOAD: 2,
      CHARGE: 3,
      CARRY: 4,
    }
    this.Action = this.ACTIONS.MOVE
    this.From_Station = ''
    this.From_Slot = ''
    this.To_Station = ''
    this.To_Slot = ''
    this.Carrier_ID = ''
    this.Priority = 50
  }

  get ActionName() {
    switch (this.Action) {
      case 0:
        return '移動'
      case 1:
        return '放貨'
      case 2:
        return '取貨'
      case 3:
        return '充電'
      case 4:
        return '搬運'
      default:
        return 'Unknown'
    }
  }
}

export default clsTaskState
