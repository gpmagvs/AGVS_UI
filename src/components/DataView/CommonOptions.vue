<!--  -->
<template>
    <div class='common-options'>
        <div class="options d-flex">
            <div class="block">
                <div class="title">{{ $t('AGVLocus.StartTime') }}</div>
                <div class="control">
                    <el-date-picker v-model="OPTIONS.StartTimeStr" type="date"
                        :placeholder="$t('AGVLocus.SelectStartDate')" />
                </div>
            </div>
            <div class="block">
                <div class="title">{{ $t('AGVLocus.EndTime') }}</div>
                <div class="control">
                    <el-date-picker v-model="OPTIONS.EndTimeStr" type="date"
                        :placeholder="$t('AGVLocus.SelectEndDate')" />
                </div>
            </div>
            <div class="block">
                <div class="title">AGV</div>
                <div class="control">
                    <el-select v-model="OPTIONS.AGVName">
                        <el-option v-for="name in AGVNameList" :key="name" :label="name" :value="name"></el-option>
                    </el-select>
                </div>
            </div>
            <div class="block">
                <div class="title">{{ $t('InstrumentMeasureQuery.MeasureResult') }}</div>
                <div class="control">
                    <el-select v-model="OPTIONS.Result">
                        <el-option v-for="option in Results" :key="option.value" :label="option.label"
                            :value="option.value"></el-option>
                    </el-select>
                </div>
            </div>
            <div class="block">
                <div class="title"></div>
                <div class="my-4">
                    <b-button @click="HandleQueryBtnClick" variant="primary">{{ $t('AGVLocus.Search') }}</b-button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import clsQueryOptions from '@/api/Common/clsQueryOptions';
import { agv_states_store } from '@/store';
export default {
    components: {},
    props: {
        Results: {
            type: Array,
            default() {
                return [
                    {
                        value: 2,
                        label: "ALL"
                    },
                    {
                        value: 0,
                        label: "成功"
                    }, {
                        value: 1,
                        label: "失敗"
                    },]
            }
        }
    },
    data() {
        return {
            OPTIONS: new clsQueryOptions(),

        };
    },
    computed: {
        AGVNameList() {
            var list = ["ALL"];
            agv_states_store.getters.AGVNameList.forEach(element => {

                list.push(element)
            });
            return list;
        }
    },
    watch: {},
    methods: {
        HandleQueryBtnClick() {
            this.OPTIONS.Page = 1;
            this.$emit('OnQueryBtnClick', this.OPTIONS)
        }
    },
    mounted() {
    },
}
</script>
<style lang='scss' scoped>
.common-options {
    .block {
        margin: 3px;

        .title {
            text-align: left;
            font-weight: bold;
            font-size: 20px;
        }
    }

}
</style>