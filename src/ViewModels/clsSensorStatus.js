class clsSensorStatus {
    constructor(Name = 'unknown', x = 0, y = 0, texstPosition = 'left-top', x_offset = 0) {
        this.name = Name
        this.status = 0 //0:normal,1:warning, 2:alarm
        this.active = true //是否啟用 如果是bypass=>false
        this.visible = true //是否顯示
        this.always_show_info = false //是否顯示
        this.error_code = 0
        this.position = {
            x: x,
            y: y,
            x_offset: x_offset
        };
        this.textPosition = texstPosition
        this.info_show_style = {
            line1: {
                x_length: 120,
                rotation: 0
            },

        }
        this.module_data = ""

    }
}
export default clsSensorStatus;