<template>
  <div v-if="IsAnyAGVNeedToMOVE" class="move_agv_notify">
    <el-badge :value="NeedToMoveAGVNum" class="item">
      <el-button @click="HandleBtnClick" style="font-size:large" plain type="warning" size="large">
        <el-icon>
          <Warning />
        </el-icon>
        <span class="mx-1">移車提示</span>
      </el-button>
    </el-badge>
    <div>
      <el-dialog draggable width="400" :modal="false" title="移車" v-model="DialogVisible">
        <el-table row-key="AgvName" :data="WattingAGVInfo">
          <el-table-column label="被阻車輛" prop="AgvName"></el-table-column>
          <el-table-column label="當前地點" prop="AgvName">
            <template #default="scope">
              <div>{{GetCurrentLocInfoByTag(scope.row.Tag)}}</div>
            </template>
          </el-table-column>
          <el-table-column label="被阻地點" prop="AgvName">
            <template #default="scope">
              <div>{{ scope.row.WaitingInfo.WaitingPoint.Name }}</div>
            </template>
          </el-table-column>
        </el-table>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import { MapStore } from '@/components/Map/store'
import { ElNotification } from 'element-plus'
import { Warning } from '@element-plus/icons-vue'
export default {
  components: {
    Warning,
  },
  data() {
    return {
      DialogVisible: false
    }
  },
  computed: {
    IsAnyAGVNeedToMOVE() {

      return this.NeedToMoveAGVNum > 0;
    },
    WattingAGVInfo() {
      var AGVNavInfo = MapStore.getters.AGVNavInfo.AGVDisplays;
      var WattingAGVInfo = AGVNavInfo.filter(agv => agv.WaitingInfo.IsWaiting)
      return WattingAGVInfo;
    },
    NeedToMoveAGVNum() {
      return this.WattingAGVInfo.length
    }
  },
  methods: {
    HandleBtnClick() {
      this.DialogVisible = true;
    },
    GetCurrentLocInfoByTag(tag) {
      var points = MapStore.getters.MapData.Points;
      var pt = Object.values(points).find(pt => pt.TagNumber == tag)
      return `${pt.TagNumber}:${pt.Name}`

    }
  },
}
</script>

<style lang="scss" scoped>
.move_agv_notify {
  position: fixed;
  bottom: 43px;
  right: 23px;
  z-index: 9990;
  .item {
    font-size: 14px;
  }
}
</style>