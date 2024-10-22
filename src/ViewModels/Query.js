class DataQueryCondition {
    constructor() {
        this.CurrentPage = 1;
        this.DataNumberPerPage = 20;
        this.StartTime = new Date(0); // DateTime.MinValue equivalent
        this.EndTime = new Date(0);   // DateTime.MinValue equivalent
        this.AgvName = "";
        this.TaskName = "";
        this.Description = "";
    }
}

export class TaskQueryCondition extends DataQueryCondition {
    constructor() {
        super();
        this.TaskResult = TaskQueryCondition.TASK_RUN_STATUS.UNKNOWN;
        this.ActionType = TaskQueryCondition.ACTION_TYPE.Unknown;
    }
}

TaskQueryCondition.TASK_RUN_STATUS = {
    NO_MISSION: 0,
    NAVIGATING: 1,
    REACH_POINT_OF_TRAJECTORY: 2,
    ACTION_START: 3,
    ACTION_FINISH: 4,
    WAIT: 5,
    FAILURE: 6,
    CANCEL: 7,
    UNKNOWN: 500
};

TaskQueryCondition.ACTION_TYPE = {
    None: 0,
    Unload: 1,
    LoadAndPark: 2,
    Forward: 3,
    Backward: 4,
    FaB: 5,
    Measure: 6,
    Load: 7,
    Charge: 8,
    Carry: 9,
    Discharge: 10,
    Escape: 11,
    Park: 12,
    Unpark: 13,
    ExchangeBattery: 14,
    Hold: 15,
    Break: 16,
    Unknown: 500,
    NoAction: 999
};

export class AlarmQueryCondition extends DataQueryCondition {
    constructor() {
        super();
        this.AlarmType = AlarmQueryCondition.ALARM_TYPE_QUERY.ALL;
    }
}

AlarmQueryCondition.ALARM_TYPE_QUERY = {
    ALL: 'ALL',
    ALARM: 'ALARM',
    WARNING: 'WARNING'
};