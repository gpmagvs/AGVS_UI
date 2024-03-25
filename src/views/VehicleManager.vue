<template>
    <div class="vehicles">
        <b-card no-body>
            <b-tabs pills vertical justified nav-class="my-nav" content-class="my-nav-tabs">
                <b-tab title="車輛列表" active>
                    <div class="">
                        <VehicleListTable></VehicleListTable>
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
export default {
    components: {
        AddVehicle, VehicleListTable
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