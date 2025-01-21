<template>
    <div>
        <div class="d-flex border-bottom pb-2 mb-2">
            <el-button type="primary" @click="save">儲存</el-button>
            <el-button @click="getOptionsFromServer">重新載入</el-button>
            <el-button type="info" @click="addNewOption">新增</el-button>
        </div>
        <el-table :data="sortedOptions" border size="large" v-loading="loading" :row-style="getRowStyle">
            <el-table-column label="ZoneID" prop="ZoneID" width="150"></el-table-column>
            <el-table-column label="顯示名稱" prop="DisplayZoneName" width="150">
                <template #default="scope">
                    <el-input v-model="scope.row.DisplayZoneName"></el-input>
                </template>
            </el-table-column>
            <el-table-column label="門檻值" width="190">
                <template #header>
                    <span>門檻值</span>
                    <el-tooltip content="當可用空Tray數量小於門檻值時，會發送通知訊息。若門檻值為0，效果等同於不啟用提醒。" placement="top">
                        <el-icon class="ms-2">
                            <InfoFilled />
                        </el-icon>
                    </el-tooltip>
                </template>
                <template #default="scope">
                    <el-input-number v-model="scope.row.ThresHoldValue"></el-input-number>
                </template>
            </el-table-column>
            <el-table-column label="通知訊息模板">
                <template #header>
                    <span>通知訊息模板</span>
                    <el-tooltip content="可用變數: {AvailableNumber} - 當前可用數量" placement="top">
                        <el-icon class="ms-2">
                            <InfoFilled />
                        </el-icon>
                    </el-tooltip>
                </template>
                <template #default="scope">
                    <el-input v-model="scope.row.NotifyMessageTemplate"></el-input>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="100">
                <template #default="scope">
                    <el-button
                        type="danger"
                        size="small"
                        @click="deleteOption(scope.$index)"> 刪除 </el-button>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>
<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue'
import { InfoFilled } from '@element-plus/icons-vue'
import { GetZoneLowLevelNotifySetting, SetZoneLowLevelNotifySetting } from '@/api/WIPAPI'
import { ElMessageBox, ElMessage } from 'element-plus'
const loading = ref(false)
var options = ref([])
const props = defineProps({
    opened: {
        type: Boolean,
        default: false
    }
})

const sortedOptions = computed(() => {
    return [...options.value].sort((a, b) => a.ZoneID.localeCompare(b.ZoneID))
})

watch(() => props.opened, () => {
    if (props.opened) {
        getOptionsFromServer()
    }
})

/**從後端取得資料 */
const getOptionsFromServer = () => {
    loading.value = true
    GetZoneLowLevelNotifySetting().then(data => {
        options.value = data
    }).finally(() => {
        setTimeout(() => {
            loading.value = false
        }, 500)
    })
};

onMounted(() => {
    getOptionsFromServer()
})

const getRowStyle = (row, rowIndex) => {
    return row.IsNewAdded ? { backgroundColor: '#ffa66a' } : {}
}

const addNewOption = () => {

    ElMessageBox.prompt('請輸入Zone ID', '新增Zone設定', {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        inputPattern: /^[A-Za-z0-9]+$/,
        inputErrorMessage: 'Zone ID只能包含英數字'
    }).then(({ value }) => {
        if (options.value.some(opt => opt.ZoneID === value)) {
            ElMessage.error('此Zone ID已存在')
            return
        }

        options.value.push({
            ZoneID: value,
            DisplayZoneName: 'Name of ' + value,
            ThresHoldValue: 0,
            NotifyMessageTemplate: '可用的Tray盤數即將不足，請補空Tray! 當前數量:{AvailableNumber}',
            IsNewAdded: true
        })
    })
}

const deleteOption = (index) => {
    const _zoneID = sortedOptions.value[index].ZoneID
    const targetIndex = options.value.findIndex(opt => opt.ZoneID === _zoneID)
    if (targetIndex !== -1) {
        options.value.splice(targetIndex, 1)
    }
}

const save = () => {

    let mappedOptions = {}
    options.value.forEach(opt => {
        mappedOptions[opt.ZoneID] = {
            DisplayZoneName: opt.DisplayZoneName,
            ThresHoldValue: opt.ThresHoldValue,
            NotifyMessageTemplate: opt.NotifyMessageTemplate
        }
    })
    SetZoneLowLevelNotifySetting(mappedOptions).then(data => {
        getOptionsFromServer()
        ElMessage.success('儲存成功')
    }).catch(error => {
        ElMessage.error('儲存失敗')
    })
}

</script>
<style lang="scss" scoped></style>