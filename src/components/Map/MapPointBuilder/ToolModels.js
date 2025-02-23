/**工具元件選擇狀態模型 */
export class ToolSelect {
    constructor(sourceName = '', defaultSelectComponentName = '') {
        this.source = sourceName;
        this.selectedComponentName = defaultSelectComponentName;
    }
    isAddPoint() {
        return this.source == 'add-point'
    }

    getStationTypeWithComponentSelected() {
        if (this.selectedComponentName == 'normal-point')
            return 0;
        else if (this.selectedComponentName == 'eq-point')
            return 1;
        else if (this.selectedComponentName == 'stocker-point')
            return 2;
        else if (this.selectedComponentName == 'charge-station-point')
            return 3;
        else if (this.selectedComponentName == 'rack-point')
            return 4;
        else if (this.selectedComponentName == 'auto-door-point')
            return 33;
        else
            return 0;
    }

    getGeneralNameByStationType() {
        if (this.selectedComponentName == 'normal-point')
            return '一般點位';
        else if (this.selectedComponentName == 'eq-point')
            return '設備';
        else if (this.selectedComponentName == 'stocker-point')
            return 'Stocker';
        else if (this.selectedComponentName == 'charge-station-point')
            return '充電站';
        else if (this.selectedComponentName == 'rack-point')
            return 'Rack';
        else if (this.selectedComponentName == 'auto-door-point')
            return '自動門';
        else
            return '一般點位';
    }
}