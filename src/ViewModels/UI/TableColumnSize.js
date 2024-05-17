export class TableColumnSize {
    constructor(propName = "''", width = 100) {
        this.propName = propName;
        this.width = width;
    }
}

export function SaveTableColumnSizeSettingsToStorage(key, settings = [new TableColumnSize()]) {
    localStorage.setItem(key, JSON.stringify(settings))
}

export function ReStoreTableColumnSizeSettingsFromStorage(key) {
    var settings = [new TableColumnSize()]
    let jsonStr = localStorage.getItem(key);
    if (jsonStr) {
        Object.assign(settings, JSON.parse(jsonStr))

    }
    return settings;
}