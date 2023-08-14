export function GetTaskStateType(state_code) {
    //success",", "info", "warning", "danger", ""],
    if (state_code == 1 || state_code == 2 || state_code == 3) //Running
        return 'warning'
    else if (state_code == 4) //等待
        return 'success'
    else if (state_code == 6 | state_code == 7) //FAILURE
        return 'danger'
    else
        return 'info'         //Failure
}