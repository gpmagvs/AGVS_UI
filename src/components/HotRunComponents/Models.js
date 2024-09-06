
export class RegularUnloadSettings {
    constructor() {
        this.LoadRequestAlwaysOnEqNames = [];
        this.UnloadRequestsSettings = [new UnloadRequestOpts()]
    }
}
export class UnloadRequestOpts {
    constructor(EqName = "", UnloadRequestInterval = 10, DelayTimeWhenScriptStart = 10) {
        this.EqName = EqName;
        this.UnloadRequestInterval = UnloadRequestInterval;
        this.DelayTimeWhenScriptStart = DelayTimeWhenScriptStart;
    }
}