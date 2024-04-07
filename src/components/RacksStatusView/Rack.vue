<template>
    <div class="rack p-3">
        <div class="d-flex flex-row" v-for="_row in rowAry" :key="'row-' + _row">
            <RackPortImageVue
                v-for="_col in colAry" :key="'col-' + _col"
                v-bind:class="_col > 1 ? 'shit-left' : ''"
                :col="_col"
                :row="_row"
                :hasRack="CargoExist(_col, _row)"
                :CarrierID="CarrierID(_col, _row)"
                @on-port-click="HandlePortClicked"
                :isBottom="_row == 0"></RackPortImageVue>
        </div>
    </div>
    <!-- <el-divider>Selected-Rack</el-divider>
    <p>{{ RackData }}</p>
    <el-divider>Racks</el-divider>
    <p>{{ RacksData }}</p> -->
</template>
<script>
import RackPortImageVue from './RackPortImage.vue';
import { EqStore } from '@/store'

export default {
    components: {
        RackPortImageVue
    },
    props: {
        rackName: {
            type: String,
            default: ""
        },
        isEdit: {
            type: Boolean,
            default: false
        },
        editProps: {
            type: Object,
            default() {
                return {
                    col: 1,
                    row: 1
                }
            }
        }
    },
    data() {
        return {
            col: 3,
            row: 3,
        }
    },
    computed: {
        colOfRack() {
            if (this.isEdit) {
                return this.editProps.col
            }

            if (this.RackData)
                return this.RackData.Columns
            else
                return 0
        },
        rowOfRack() {
            if (this.isEdit) {
                return this.editProps.row
            }
            if (this.RackData)
                return this.RackData.Rows
            else
                return 0
        },
        rowAry() {
            const array = [];
            for (let i = this.rowOfRack - 1; i >= 0; i--) {
                array.push(i);
            }
            return array;
        },
        colAry() {
            const array = [];
            for (let i = 0; i < this.colOfRack; i++) {
                array.push(i);
            }
            return array;
        },
        RacksData() {
            return EqStore.getters.WIPData
        },
        RackData() {
            return this.RacksData.find(dat => dat.WIPName == this.rackName)
        }

    },
    methods: {
        HandlePortClicked(payload) {
            alert(JSON.stringify(payload))
        },
        GetPortByColRow(col, row) {
            if (!this.RackData || !this.RackData.Ports) return undefined;
            return this.RackData.Ports.find(dat => dat.Properties.Row == row && dat.Properties.Column == col);
        },
        CargoExist(col, row) {
            if (this.isEdit) return false;

            var port = this.GetPortByColRow(col, row);
            if (!port) return false;
            return port.CargoExist;
        },
        CarrierID(col, row) {
            if (this.isEdit) return "";

            var port = this.GetPortByColRow(col, row);
            if (!port) return false;
            return port.CarrierID;
        }
    },
    mounted() {

    },
}
</script>
<style lang="scss" scoped>
.rack {
    // box-shadow: 23px 2px 213px 23px grey;
}
</style>