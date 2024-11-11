<template>
  <div class="vehicle-list-table">
    <el-skeleton :loading="!showTable" animated></el-skeleton>
    <el-table
      header-cell-class-name="my-el-table-cell-class"
      row-key="AGV_Name"
      border
      :header-cell-style="tableHeaderStyle"
      :data="GetAGVStatesData"
      size="large"
      v-if="showTable"
    >
      <el-table-column label="AGV ID" prop="AGV_Name" width="130" align="center"></el-table-column>
      <el-table-column label="類型" prop="Model" width="90" align="center">
        <template #default="scope">
          <el-tag effect="dark">{{ VehicleModels[scope.row.Model].labelCN }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="當前狀態" prop="MainStatus" width="110" align="center">
        <template #default="scope">
          <el-tag v-if="!scope.row.Connected" effect="dark" type="danger">斷線</el-tag>
          <el-tag
            v-else
            effect="dark"
            :color="AGVMainStatus[scope.row.MainStatus].color"
          >{{ AGVMainStatus[scope.row.MainStatus].label }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="當前位置" prop="CurrentLocation" align="center" width="100"></el-table-column>
      <el-table-column label="通訊方式" prop="Protocol" width="120" align="center">
        <template #default="scope">
          <el-tag>{{ ProtocolText[scope.row.Protocol] }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="IP" prop="IP" width="150" align="center"></el-table-column>
      <el-table-column label="PORT" prop="Port" width="90"></el-table-column>
      <el-table-column label="車長(cm)" prop="VehicleLength" width="100" align="center"></el-table-column>
      <el-table-column label="車寬(cm)" prop="VehicleWidth" width="100" align="center"></el-table-column>
      <el-table-column label="版本號" prop="AppVersion" width="120" align="center">
        <template #default="scope">
          <el-tag>{{ scope.row.AppVersion }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="啟用模擬" prop="Simulation" width="100" align="center">
        <template #default="scope">
          <el-checkbox :disabled="true" v-model="scope.row.Simulation"></el-checkbox>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="Operations" min-width="160">
        <template #default="scope">
          <el-button size="small" @click.prevent="edit_row(scope.row)">編輯</el-button>
          <el-button
            size="small"
            @click.prevent="show_traffic_control_settings_drawer(scope.row)"
          >交管設置</el-button>
          <el-button type="danger" size="small" @click.prevent="delete_row(scope.row)">刪除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-drawer :z-index="1" v-model="ShowEditAGVPropertyDrawer">
      <template #header="{}">
        <h3 class="text-start">{{ drawerText }}</h3>
      </template>
      <div class>
        <AddVehicle ref="AgvPropertyEditor" mode="edit"></AddVehicle>
      </div>
    </el-drawer>

    <el-drawer
      title="交管設置"
      append-to-body
      :z-index="1"
      v-model="ShowVechicleTrafficControlSettingsDrawer"
    >
      <VechicleTrafficControlSettings :agv_row="selectAGVProertyToEdit"></VechicleTrafficControlSettings>
    </el-drawer>
  </div>
</template>
<script>
import { agv_states_store } from '@/store';
import AddVehicle from './AddVehicle.vue';
import VechicleTrafficControlSettings from './VechicleTrafficControlSettings.vue';
import { ProtocolDisplay, MainStatusDisplay, VehicleModelDisplay } from '@/ViewModels/EnumMaps.js'
import { VehicleManagerAPI } from '@/api/VMSAPI'
export default {
  components: {
    AddVehicle,
    VechicleTrafficControlSettings
  },
  inject: ['tableHeaderStyle'],
  data() {
    return {
      table: [],
      showTable: false,
      selectAGVProertyToEdit: {},
      ShowEditAGVPropertyDrawer: false,
      ShowVechicleTrafficControlSettingsDrawer: false
    }
  },
  computed: {
    GetAGVStatesData() {
      return agv_states_store.getters.AGVStatesData;
    },
    ProtocolText() {
      return ProtocolDisplay
    },
    AGVMainStatus() {
      return MainStatusDisplay
    },
    VehicleModels() {
      return VehicleModelDisplay
    },
    drawerText() {
      return this.selectAGVProertyToEdit.AGV_Name
    }
  },
  methods: {
    edit_row(agv_row) {
      this.selectAGVProertyToEdit = agv_row;
      this.ShowEditAGVPropertyDrawer = true;
      setTimeout(() => {
        this.$refs['AgvPropertyEditor'].UpdatePayload(agv_row);
      }, 1);
    },
    async delete_row(agv_row) {
      var _DeleteVehicleAction = async () => {
        var result = await VehicleManagerAPI.DeleteVehicle(agv_row.AGV_Name);
        if (result.confirm) {
          this.$swal.fire(
            {
              text: '',
              title: '刪除車輛成功',
              icon: 'success',
              showCancelButton: false,
              confirmButtonText: 'OK',
              customClass: 'my-sweetalert'
            })
        }
        else {
          this.$swal.fire(
            {
              text: result.message,
              title: '刪除車輛失敗',
              icon: 'error',
              showCancelButton: false,
              confirmButtonText: 'OK',
              customClass: 'my-sweetalert'
            })
        }
      }
      this.$swal.fire(
        {
          text: '',
          title: `確定要刪除車輛-${agv_row.AGV_Name}?`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'OK',
          customClass: 'my-sweetalert'
        }).then(ret => {
          if (!ret.isConfirmed)
            return;
          _DeleteVehicleAction()
        })


    },
    show_traffic_control_settings_drawer(agv_row) {
      this.selectAGVProertyToEdit = agv_row;
      this.ShowVechicleTrafficControlSettingsDrawer = true;
    }
  },
  mounted() {
    setTimeout(() => {
      this.showTable = true
    }, 1000)
  }
}
</script>
<style scoped>
.my-el-table-row-class {
  background-color: red;
}
</style>