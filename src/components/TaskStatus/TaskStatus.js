/**Get Task State Type */
export function GetTaskStateType(state_code) {
    //success",", "info", "warning", "danger", ""],
    if (state_code == 1 || state_code == 2 || state_code == 3 || state_code == 4) //Running
        return 'success'
    else if (state_code == 6) //FAILURE
        return 'danger'
    else if (state_code == 7) //Cancel
        return 'warning'
    else
        return 'info'         //Failure
}

/**Task Action Tag Types */
export const TaskActionTagTypes = {
    0: 'info', //移動
    1: 'primary', //取貨
    7: 'primary', //放貨
    8: 'success', //充電
    9: 'primary', //搬運
    default: 'info'
}

/**All Task Actions */
export const TaskActionFileterOptions = [
    { text: '移動', value: 0 },
    { text: '取貨', value: 1 },
    { text: '放貨', value: 7 },
    { text: '充電', value: 8 },
    { text: '搬運', value: 9 },
]

/**All Task States */
export const TaskStateOptions = [
    { text: '執行中', value: 1 },
    { text: '完成', value: 4 },
    { text: '等待中', value: 5 },
    { text: '失敗', value: 6 },
    { text: '取消', value: 7 },
]

/**Filter TaskStateOptions to only include running states (excludes completed, failed and cancelled states) */
export const RunningTaskStateOptions = TaskStateOptions.filter(option => ![4, 6, 7].includes(option.value))

/**Filter TaskStateOptions to only include completed states (completed, failed and cancelled states) */
export const CompletedTaskStateOptions = TaskStateOptions.filter(option => [4, 6, 7].includes(option.value))
