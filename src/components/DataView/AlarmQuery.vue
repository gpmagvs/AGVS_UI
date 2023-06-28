<template>
    <div class="alarm-query">
        <el-table :data="alarms" border :row-class-name="row_state_class_name" size="small">
            <el-table-column label="發生時間" prop="Time" width="160">
                <!-- <template #default="scope">{{ formatTime(scope.row.Time) }}</template> -->
            </el-table-column>
            <el-table-column label="AGV名稱" prop="Equipment_Name" width="120"></el-table-column>
            <el-table-column label="警報碼" prop="AlarmCode" width="120"></el-table-column>
            <el-table-column label="警報描述" prop="Description_En">
                <template #default="scope">
                    <div>{{ scope.row.Description_En }}({{ scope.row.Description_Zh }})</div>
                </template>
            </el-table-column>
            <el-table-column label="警報類型" prop="Level" width="120">
                <template #default="scope">
                    <div>{{ scope.row.Level == 1 ? 'ALARM' : 'WARNING' }}</div>
                </template>
            </el-table-column>
            <el-table-column label="任務名稱" prop="Task_Name" width="160"></el-table-column>
            <el-table-column label="發生地點" prop="OccurLocation" width="120"></el-table-column>
            <el-table-column label="持續時間" prop="Duration" width="120"></el-table-column>
            <el-table-column label="清除警報人員" prop="ResetAalrmMemberName" width="120"></el-table-column>
        </el-table>
    </div>
</template>

<script>
import { QueryALL, Query } from '@/api/AlarmAPI.js'
export default {
    data() {
        return {
            alarms: [
                {
                    Time: "2023-05-29T13:57:19.0723227",
                    Level: 1,
                    Source: 0,
                    AlarmCode: 2,
                    Description_Zh: "車載管理系統斷線",
                    Description_En: "VMS Disconnect",
                    OccurLocation: "",
                    Equipment_Name: "VMS",
                    Task_Name: "",
                    Duration: 43,
                    Checked: true,
                    ResetAalrmMemberName: "AliveChecker"
                },

            ]
        }
    },
    mounted() {
        QueryALL().then(alarms=> this.alarms=alarms);
    },
    methods: {
        onmessage(ev) {
            this.alarms = JSON.parse(ev.data)
        },
        row_state_class_name({ row, rowIndex }) {
            return row.Level == 1 ? 'ALARM' : 'WARNING';
        }
    },

}
</script>

<style lang="scss" scoped>
.alarm-query{
    overflow-y: scroll;
}
.alarm-view {
    text-align: left;
    padding: 8px;

    .el-table {
        .WARNING {
            background: rgb(255, 210, 6);
            color: black;
        }

        .ALARM {
            background: rgb(250, 72, 72);
            color: white;
        }
    }
}
</style>