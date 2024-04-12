<template>
    <div class="d-flex flex-column bg-light m-2 w-100">
        <b-tabs @activate-tab="TabSelectChange">
            <b-tab title="X"></b-tab>
            <b-tab title="Y"></b-tab>
        </b-tabs>
        <div class="d-flex py-2">
            <el-button @click="Save" size="large">儲存-{{ regionName }}</el-button>
        </div>
        <div class="border">
            <el-table border row-key="index" :data="tableData" height="600">
                <el-table-column prop="index" label="Index" min-width="20"></el-table-column>
                <el-table-column prop="address" label="Address"></el-table-column>
                <el-table-column prop="name" label="Name">
                    <template #default="scope">
                        <el-select-v2
                            v-model="scope.row.name"
                            filterable
                            :options="GetSelectOptions"
                            placeholder="Please select" clearable
                            style="width: 300px" />
                    </template>
                </el-table-column>
            </el-table>
        </div>
    </div>
</template>
<script>
import { DO_ITEMS, DI_ITEMS } from '@/ViewModels/clsDIOTable.js'
import { DIOStore } from '@/store'
import { DIO } from '@/api/VMSAPI'
export default {

    data() {
        return {
            regionName: "X",
            tableData: []
        }
    },
    computed: {
        GetSelectOptions() {
            if (this.regionName == "X") {
                return DI_ITEMS
            } else if (this.regionName == "Y") {
                return DO_ITEMS
            }
        },
        GetCurrentIORegistState() {
            var obj = DIOStore.getters.DIOStates
            if (this.regionName == "X") {
                return obj.Inputs
            } else if (this.regionName == "Y") {
                return obj.Outputs
            }
        },
        DataToStore() {
            var data = {}
            for (let index = 0; index < this.tableData.length; index++) {
                const element = this.tableData[index];
                data[index] = element && element.name ? element.name : ''
            }
            console.log(data)
            return data;
        }
    },
    methods: {
        InitData() {
            setTimeout(() => {
                this.tableData = []
                var regists = this.GetCurrentIORegistState;
                for (let index = 0; index < 64; index++) {
                    var regist = regists[index];
                    this.tableData.push({
                        index: `${index}`,
                        address: `${this.regionName}${index.toString(16).toUpperCase()}`,
                        name: regist ? regist.Name : ''
                    })
                }
            }, 300)
        },
        TabSelectChange(pag) {
            this.regionName = pag == 0 ? "X" : "Y";
            this.InitData();
        },
        Save() {
            this.$swal.fire(
                {
                    title: '確定要儲存此設定?',
                    text: '',
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonText: 'OK',
                    customClass: 'my-sweetalert'
                }).then(async (ret) => {
                    if (!ret.isConfirmed)
                        return;
                    var result = { confirm: false, message: '' }
                    if (this.regionName == "X") {
                        result = await DIO.UpdateInputMap(this.DataToStore);
                    } else {
                        result = await DIO.UpdateOutputMap(this.DataToStore);
                    }
                    this.$swal.fire(
                        {
                            title: result.confirm ? '修改成功' : '修改失敗',
                            text: result.message,
                            icon: result.confirm ? 'success' : 'error',
                            showCancelButton: false,
                            confirmButtonText: 'OK',
                            customClass: 'my-sweetalert'
                        })
                })
        }

    },
    mounted() {
        this.InitData();
    },
}
</script>
<style></style>