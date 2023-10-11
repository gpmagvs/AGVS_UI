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