<template>
    <div class="vehicles">
        <b-card no-body>
            <b-tabs pills vertical justified nav-class="my-nav" content-class="my-nav-tabs">
                <b-tab title="車輛列表" active>
                    <div class="">
                        <VehicleControlVue v-if="isDeveloperUser"></VehicleControlVue>
                        <VehicleListTable></VehicleListTable>
                    </div>
                </b-tab>
                <b-tab title="維修保養">
                    <div class="">
                        <VehicleMaintain></VehicleMaintain>
                    </div>
                </b-tab>
                <b-tab title="新增車輛">
                    <div class="">
                        <AddVehicle></AddVehicle>
                    </div>
                </b-tab>
            </b-tabs>
        </b-card>
    </div>
</template>
<script>
import AddVehicle from '@/components/Vehicle/AddVehicle.vue'
import VehicleListTable from '@/components/Vehicle/VehicleListTable.vue'
import VehicleMaintain from '@/components/Vehicle/VehicleMaintain.vue'
import VehicleControlVue from '@/components/Vehicle/VehicleControl.vue'
import { userStore } from '@/store'
export default {
    components: {
        AddVehicle, VehicleMaintain, VehicleListTable, VehicleControlVue
    },
    data() {
        return {
            test: 'AV'
        }
    },
    computed: {
        isDeveloperUser() {
            return userStore.getters.IsDeveloperLogining
        }
    },
}
</script>
<styles lang="scss" scoped>
.vehicles {
    margin-top: 20px;
    padding: 5px;

    .vehicle-nav-item {
        color: red;
    }


}
</styles>