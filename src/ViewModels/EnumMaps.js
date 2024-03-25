
/**AGV通訊方式 */
export const ProtocolDisplay = {
    0: 'TCP/Socket',
    1: 'RESTFul API'
}

/**AGV主狀態 */
export const MainStatusDisplay = {
    0: { label: 'UNKNOWN', labelCN: '未知', color: 'rgb(64, 158, 255)' },
    1: { label: 'IDLE', labelCN: '閒置', color: 'orange' },
    2: { label: 'RUN', labelCN: '執行', color: 'green' },
    3: { label: 'DOWN', labelCN: '當機', color: 'red' },
    4: { label: 'Charging', labelCN: '充電', color: 'blue' },
}

/**AGV車款 */
export const VehicleModelDisplay = {
    0: { label: 'FORK', labelCN: '叉車', color: 'rgb(64, 158, 255)' },
    1: { label: 'YUNTECH-FORK', labelCN: '叉車(雲科)', color: 'orange' },
    2: { label: 'INSPECTOIN', labelCN: '巡檢', color: 'green' },
    3: { label: 'SUBMARINE', labelCN: '潛盾', color: 'red' },
    4: { label: 'PARTS', labelCN: 'Parts', color: 'blue' },
}