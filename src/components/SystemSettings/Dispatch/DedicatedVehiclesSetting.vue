<template>
  <div class="w-100 m-2" style="height: 90vh;">
    <div class="d-flex border-bottom my-1 py-2">
      <el-button type="success" @click="handleSaveButtonClicked">儲存</el-button>
      <el-button type="info" @click="handleAddButtonClicked">新增</el-button>
      <el-button type="primary" @click="downloadFromBackend">Reload</el-button>
      <!-- <span class="mx-2">{{ selectedStationIndex }}</span> -->
    </div>
    <div class="d-flex h-100" v-loading="isLoading">
      <el-table class="w-100" :data="tableData" border size="large">
        <el-table-column label="站點名稱" prop="eqName" width="220">
          <template #default="scope">
            <el-select
              filterable
              v-model="scope.row.tag"
              placeholder="站點"
              @change="handleEqNameChange(scope.row)"
            >
              <el-option
                v-for="item in eqStationOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
                <span>
                  <el-tag effect="dark" type="info">{{ item.value }}</el-tag>
                </span>
                <span class="mx-2">{{ item.label }}</span>
              </el-option>
            </el-select>
          </template>
        </el-table-column>
        <!-- <el-table-column label="Tag" prop="tag" width="60"></el-table-column> -->
        <el-table-column prop="dedicatedStation">
          <template #header>
            <div class="d-flex justify-content-start">
              <span class="mx-2">優先指派之充電站/停車位</span>
              <el-tooltip content="選擇車輛時，將優先指派停在這些站點的車輛(將依距離目的地遠近進行指派)" placement="right">
                <i class="bi bi-info-circle text-primary"></i>
              </el-tooltip>
            </div>
          </template>
          <template #default="scope">
            <div class="d-flex">
              <el-select
                v-model="scope.row.dedicatedStations"
                multiple
                filterable
                clearable
                placeholder="站點"
                @focus="handleDedicatedStationSelectFocus(scope.row)"
              >
                <el-option
                  v-for="item in stationOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                  <span>
                    <el-tag effect="dark" type="info" v-if="item.type == 'charge'">充電站</el-tag>
                    <el-tag effect="dark" type="success" v-if="item.type == 'parkable'">停車位</el-tag>
                  </span>
                  <span class="mx-2">{{ item.label }}</span>
                </el-option>
              </el-select>
              <el-button
                class="text-primary"
                text
                @click="handleMapSelectButtonClicked(scope.row)"
              >從地圖選擇</el-button>
            </div>
          </template>
        </el-table-column>
        <el-table-column width="100">
          <template #default="scope">
            <el-button type="danger" @click="handleDeleteButtonClicked(scope.row)">刪除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="bg-light w-100 border" v-if="mapShow">
        <div class="d-flex justify-content-between">
          <el-button text type="primary" @click="()=>{offMapFeatureClicked();mapShow = false}">
            <i class="bi bi-chevron-double-right"></i>
          </el-button>
          <div class="d-flex px-2">
            <div
              :style="{
                backgroundColor: mapHighLightColor,
                width: '40px', 
                height: '15px',
                fontWeight: 'bold',
                borderRadius: '5px',
                'margin-top': '5px'
                }"
            ></div>
            <span class="mx-2 text-primary">可選擇的站點</span>
          </div>
        </div>
        <Map
          class="bg-light border"
          ref="map"
          id="dedicated_vehicles_map"
          :editable="false"
          :agv_show="false"
          :station_show="true"
          :rackInfoShow="false"
          :eq_lduld_status_show="false"
        ></Map>
      </div>
    </div>
  </div>
</template>

<script>
import { MapStore } from '@/components/Map/store';
import Map from '@/components/Map/Map.vue';
import bus from '@/event-bus';
import { DispatchAPI } from '@/api/VMSAPI';
import { ElMessage } from 'element-plus';
export default {
  components: {
    Map
  },
  data() {
    return {
      tableData: [
        // {
        //   tag: 2,
        //   dedicatedStations: []
        // }
      ],
      selectedStationIndex: null,
      mapShow: false,
      isLoading: false,
      mapHighLightColor: 'lime'
    }
  },
  computed: {
    eqStationOptions() {
      return MapStore.getters.AllEqStation.map(item => {
        return {
          value: item.tag,
          label: item.name_display,
        }
      })
    },
    stationOptions() {

      const _chargeStationOptions = MapStore.getters.AllChargeStation.map(item => {
        return {
          value: item.tag,
          label: item.name_display,
          type: 'charge'
        }
      })
      const _parkableStationOptions = MapStore.getters.AllParkableStationOptions
        .filter(item => !_chargeStationOptions.find(ct => ct.value == item.tag))
        .map(item => {
          return {
            value: item.tag,
            label: item.name_display,
            type: 'parkable'
          }
        })
      return [..._chargeStationOptions, ..._parkableStationOptions]
    }
  },
  methods: {

    downloadFromBackend() {
      this.isLoading = true;
      DispatchAPI.GetEQStationDedicatedSetting().then(res => {
        this.tableData = res;
        setTimeout(() => {
          this.isLoading = false;
        }, 400);
      })
    },

    handleSaveButtonClicked() {
      DispatchAPI.SetEQStationDedicatedSetting(this.tableData).then(res => {
        this.$swal.fire({
          text: '儲存成功',
          icon: 'success',
          showCancelButton: false,
          confirmButtonText: 'OK',
          customClass: 'my-sweetalert'
        })
      })
    },
    handleAddButtonClicked() {
      this.tableData.push({
        eqName: '',
        dedicatedStations: []
      })
    },
    handleDeleteButtonClicked(row) {
      this.tableData.splice(this.tableData.findIndex(item => item.eqName == row.eqName && item.dedicatedStations == row.dedicatedStations), 1)
    },
    handleEqNameChange(row) {
      //alert(row.eqName)
      if (this.tableData.filter(item => item.eqName == row.eqName).length > 1) {
        this.$swal.fire(
          {
            text: '已經有此站點',
            title: '',
            icon: 'warning',
            showCancelButton: false,
            confirmButtonText: 'OK',
            customClass: 'my-sweetalert'
          })
        row.eqName = ''

      }
      this.selectedStationIndex = this.tableData.findIndex(item => item.eqName == row.eqName);

    },
    handleMapSelectButtonClicked(row) {
      this.offMapFeatureClicked()
      bus.on('/map/feature_clicked', this.handleMapFeatureClicked)
      this.selectedStationIndex = this.tableData.findIndex(item => item.eqName == row.eqName && item.dedicatedStations == row.dedicatedStations);
      this.mapShow = true;
      setTimeout(() => {
        const _tags = this.stationOptions.map(item => item.value);
        this.$refs.map.HighLightSpeficFeatureWithTags(_tags, this.mapHighLightColor);
      }, 300);
    },
    handleMapFeatureClicked(feature) {
      //alert(feature.get('data').Graph.Display)
      const _ptData = feature.get('data');
      if (!_ptData)
        return;
      let _dedicatedStations = this.tableData[this.selectedStationIndex].dedicatedStations;
      const _tag = _ptData.TagNumber;
      const _isTagSelectable = this.stationOptions.find(item => item.value == _tag);
      if (_dedicatedStations.includes(_tag)) {
        ElMessage.warning('已經選擇過此站點')
        return;
      }
      if (_isTagSelectable) {
        _dedicatedStations.push(_tag)
      }
    },
    offMapFeatureClicked() {
      bus.off('/map/feature_clicked', this.handleMapFeatureClicked)
    },
    handleDedicatedStationSelectFocus(row) {
      this.selectedStationIndex = this.tableData.findIndex(item => item.eqName == row.eqName);
    }
  },
  mounted() {
    this.downloadFromBackend();
  }
}
</script>

<style>
</style>