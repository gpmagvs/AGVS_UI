<template>
    <div class="racks-manager">
        <b-card no-body>
            <b-tabs pills vertical justified nav-class="my-nav" content-class="my-nav-tabs">
                <b-tab title="RACK列表" active>
                    <div class="">
                        <RackListTable></RackListTable>
                    </div>
                </b-tab>
                <b-tab title="新增RACK">
                    <div class="">
                        <AddRack></AddRack>
                    </div>
                </b-tab>
            </b-tabs>
        </b-card>
    </div>
</template>
<script>
import AddRack from '@/components/RacksStatusView/AddRack.vue'
import RackListTable from '@/components/RacksStatusView/RackListTable.vue'
export default {
    components: {
        AddRack, RackListTable
    },
    data() {
        return {
            test: 'AV'
        }
    },
}
</script>
<styles lang="scss" scoped>
.racks-manager {
    margin-top: 20px;
    padding: 5px;

    .vehicle-nav-item {
        color: red;
    }


}
</styles>