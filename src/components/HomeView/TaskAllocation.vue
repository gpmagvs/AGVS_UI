<template>
  <div class="task-allocation">
    <el-drawer
      :show-close="false"
      v-model="show"
      :header="false"
      size="95%"
      direction="btt"
      :modal="false"
      :z-index="123"
      @closed="HandleDrawerClosed">
      <template #header>
        <div class="d-flex">
          <el-button
            @click="() => { show = false }"
            size="large"
            style="margin-left:53px;font-size:larger;"
            type="primary">←返回(ESC)</el-button>
          <h3 class="flex-fill text-center">Local任務派送-車輛:{{ selectedAGVName }}</h3>
        </div>
      </template>
      <div class="drawer-content border-top" v-loading="wait_task_confirm">
        <div class="d-flex flex-row py-1 w-100 h-100">
          <el-form label-width="100px" label-position="left" size="large" style="width:500px">
            <el-form-item label="AGV車輛選擇">
              <el-select class="w-100" v-model="selectedAGVName">
                <el-option v-for="agv_name in AgvNameList" :key="agv_name.value" :label="agv_name.label" :value="agv_name.value"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="AGV任務動作">
              <el-select v-if="agv_type != 2" class="w-100" v-model="selectedAction" placeholder="請選擇Action" @change="ActionChangeHandler">
                <el-option label="移動" value="move"></el-option>
                <el-option label="停車" value="park"></el-option>
                <el-option label="搬運" value="carry"></el-option>
                <el-option label="放貨" value="load"></el-option>
                <el-option label="取貨" value="unload"></el-option>
                <el-option label="充電" value="charge"></el-option>
                <el-option v-if="IsDeveloper" label="巡檢量測" value="measure"></el-option>
              </el-select>
              <!-- 巡檢AGV使用 -->
              <el-select v-else class="w-100" v-model="selectedAction" placeholder="請選擇Action" @change="ActionChangeHandler">
                <el-option label="移動" value="move"></el-option>
                <el-option label="交換電池" value="exchange_battery"></el-option>
                <el-option label="巡檢量測" value="measure"></el-option>
                <el-option label="進Bay" value="in-bay"></el-option>
                <el-option label="出Bay" value="out-bay"></el-option>
                <!-- <el-option label="停車" value="park"></el-option> -->
                <!-- <el-option label="搬運" value="carry"></el-option>
                <el-option label="放貨" value="load"></el-option>
                <el-option label="取貨" value="unload"></el-option>
                <el-option label="充電" value="charge"></el-option>-->
              </el-select>
            </el-form-item>
            <!--  -->
            <el-form-item label="起點" v-if="selectedAction == 'carry'">
              <el-select class="w-100" v-model="sourceTag" @change="HandleFromSelectChanged" placeholder="選擇站點">
                <el-option v-for="tag in tags" :key="tag.tag" :label="tag.name" :value="tag.tag"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="目的地">
              <el-select class="w-100" v-model="destinTag" placeholder="選擇站點">
                <el-option v-for="tag in DetermineDestinOptions()" :key="tag.tag" :label="tag.name" :value="tag.tag"></el-option>
              </el-select>
            </el-form-item>
            <!--  -->
            <el-form-item v-if="selectedAction === 'carry' | selectedAction === 'unload'" label="貨物ID">
              <el-input class="w-100" v-model="Cst_ID_Input" autocomplete></el-input>
            </el-form-item>
            <el-form-item>
              <b-button class="w-100 my-2" @click="TaskDeliveryBtnClickHandle" variant="primary">派送任務</b-button>
              <!-- <b-button class="w-100" @click="HandleNavPathPreviewBtnClick" variant="default">預覽路徑</b-button> -->
            </el-form-item>
            <el-form-item v-if="IsDeveloper" label="Bypass 設備狀態檢查">
              <el-checkbox class="w-100" v-model="bypass_eq_status_check"></el-checkbox>
            </el-form-item>
          </el-form>
          <Map canva_height="750px" id="task_allocation_map" class="w-100 border rounded mx-2" ref="_map"></Map>
        </div>
        <div v-if="selectedAction == 'charge'" class="img charge"></div>
        <div v-else class="img delivery"></div>
      </div>
    </el-drawer>
  </div>
</template>
<script>
import Notifier from '@/api/NotifyHelper';
import bus from '@/event-bus';
import clsAGVStateDto from '@/ViewModels/clsAGVStateDto';
import Map from '@/components/Map/Map.vue'
import { MapStore } from '@/components/Map/store'
import { TaskAllocation, clsMoveTaskData, clsMeasureTaskData, clsLoadTaskData, clsUnloadTaskData, clsCarryTaskData, clsExangeBatteryTaskData, clsChargeTaskData, clsParkTaskData } from '@/api/TaskAllocation'
import { userStore, agv_states_store, agvs_settings_store } from '@/store';
import { MapPointModel } from '@/components/Map/mapjs';
import { GetEQOptions } from '@/api/EquipmentAPI'
export default {
  components: {
    Map
  },
  data() {
    return {
      show: false,
      clsAgvStatus: new clsAGVStateDto(),
      confirm_dialog_show: false,
      notify_dialog_show: false,
      wait_task_confirm: false,
      bypass_eq_status_check: false,
      notify_text: '',
      selectedAGVName: '',
      selectedAction: 'move', // 選擇的Action
      sourceTag: '', // 選擇的tag_id
      destinTag: '', // 選擇的to_tag
      Cst_ID_Input: '', // 選擇的cst_id
      moveable_tags: [ // tag_id選項
        { tag: 1, name: '標籤1' },
      ],
      parkable_tags: [ // tag_id選項
      ],
      stock_tags: [
        { tag: 1, name: '標籤1' },
        { tag: 2, name: '標籤2' },
      ],
      chargable_tags: [ // tag_id選項
        { tag: 50, name: '充電站(TAG-50)' },
        { tag: 70, name: '充電站(TAG-70)' },
      ],
      downstream_tags: [
        { tag: 1, name: '標籤1' },
        { tag: 2, name: '標籤2' }
      ],
      csts: [ // cst_id選項
        { tag: 1, name: '' },
      ],
      agv_type: 0,
      equipments_options: undefined
    }
  },
  computed: {
    Map() {
      return this.$refs['_map']
    },

    AgvNameList() {
      var namelist = [];
      if (agvs_settings_store.getters.IsRunMode) {
        namelist.push({ value: '', label: this.$t('auto-choise-vehicle') });
        if (this.IsDeveloper)
          createdAgvNameOptions(namelist);
      }
      else {
        createdAgvNameOptions(namelist);
      }

      function createdAgvNameOptions(namelist) {
        agv_states_store.getters.AGVNameList.forEach(element => {
          namelist.push({
            value: element,
            label: element
          });
        });
      }
      return namelist;
    },
    tags() {
      if (this.selectedAction == 'move')
        return this.moveable_tags;
      else if (this.selectedAction == 'charge')
        return this.chargable_tags;
      else if (this.selectedAction == 'load' | this.selectedAction == 'unload' | this.selectedAction == 'carry') {
        return this.stock_tags;
      }
      else
        return this.parkable_tags;
    },

    IsDeveloper() {
      return userStore.getters.IsDeveloperLogining;
    },
    IsUserLogin() {
      return userStore.getters.level != 0
    },
    bay_names() {

      var bay_data = MapStore.getters.BaysData;
      return Object.keys(bay_data).map(bay_name => ({
        tag: bay_name,
        name: bay_name
      }))

    },
    exchanger_options() {
      return MapStore.getters.AllExangeBatteryStation;
    }
  },
  methods: {
    ActionChangeHandler(action) {

      this.sourceTag = undefined;
      this.destinTag = undefined;
      var highlight_color = 'blue'
      if (action == 'move')
        this.Map.HighLightFeaturesByStationType(0, highlight_color);
      if (action == 'carry' | action == 'load' | action == 'unload')
        this.Map.HighLightFeaturesByStationType(1, highlight_color);
      if (action == 'charge')
        this.Map.HighLightFeaturesByStationType(3, highlight_color);
    },
    HandleNavPathPreviewBtnClick() {
    },
    DetermineDestinOptions() {

      if (this.selectedAction == 'measure')
        return this.bay_names;
      else if (this.selectedAction == 'carry')
        return this.downstream_tags;
      else if (this.selectedAction == 'exchange_battery')
        return this.exchanger_options;
      else
        return this.tags;

    },
    TaskDeliveryBtnClickHandle() {
      if (!this.selectedAGVName && !agvs_settings_store.getters.IsRunMode) {
        this.$swal.fire(
          {
            text: '',
            title: '尚未選擇車輛',
            icon: 'warning',
            showCancelButton: false,
            confirmButtonText: 'OK',
            customClass: 'my-sweetalert'
          })
        return;
      }
      if (!this.selectedAction) {
        this.$swal.fire(
          {
            text: '',
            title: '尚未選擇動作',
            icon: 'warning',
            showCancelButton: false,
            confirmButtonText: 'OK',
            customClass: 'my-sweetalert'
          })
        return;
      }
      if (this.destinTag == '' | this.destinTag == undefined) {
        this.$swal.fire(
          {
            text: '',
            title: '尚未選擇目的地',
            icon: 'warning',
            showCancelButton: false,
            confirmButtonText: 'OK',
            customClass: 'my-sweetalert'
          })

        return;
      }

      if (this.selectedAction == 'carry' && (this.sourceTag == '' | this.sourceTag == undefined)) {
        this.$swal.fire(
          {
            text: '',
            title: '尚未選擇起點',
            icon: 'warning',
            showCancelButton: false,
            confirmButtonText: 'OK',
            customClass: 'my-sweetalert'
          })
        return;
      }
      // if ((this.selectedAction == 'carry' | this.selectedAction == 'load' | this.selectedAction == 'unload') && (this.Cst_ID_Input == '' | this.Cst_ID_Input == undefined)) {
      //   this.$swal.fire(
      //     {
      //       text: '',
      //       title: '尚未填寫/選擇CST ID',
      //       icon: 'warning',
      //       showCancelButton: false,
      //       confirmButtonText: 'OK',
      //       customClass: 'my-sweetalert'
      //     })
      //   return;
      // }
      var destinName = this.destinTag
      this.$swal.fire(
        {
          title: '確定要派送此任務?',
          text: `${this.selectedAGVName} 執行 ${this.selectedAction.toUpperCase()} 任務,終點:${destinName}`,
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: '確定',
          cancelButtonText: '取消',
          customClass: 'dispatch-order-sweet-alert'
        }).then(res => {
          if (res.isConfirmed) {
            this.TaskDeliveryHandle()
          }
        })
    },
    async TaskDeliveryHandle() {
      // TaskAllocation.Task();
      if (userStore.getters.level == 0)
        this.bypass_eq_status_check = false;
      this.wait_task_confirm = true
      var response = { confirm: true, message: '' }

      if (this.selectedAction == 'move') {
        response = await TaskAllocation.MoveTask(new clsMoveTaskData(this.selectedAGVName, this.destinTag, 50));
      }

      if (this.selectedAction == 'measure') {
        response = await TaskAllocation.MeasureTask(new clsMeasureTaskData(this.selectedAGVName, this.destinTag));
      }
      if (this.selectedAction == 'load') {
        response = await TaskAllocation.LoadTask(new clsLoadTaskData(this.selectedAGVName, this.destinTag, 1, this.Cst_ID_Input, 50, this.bypass_eq_status_check));
      }

      if (this.selectedAction == 'unload') {
        response = await TaskAllocation.UnloadTask(new clsUnloadTaskData(this.selectedAGVName, this.destinTag, 1, this.Cst_ID_Input, 50, this.bypass_eq_status_check));
      }

      if (this.selectedAction == 'carry') {
        response = await TaskAllocation.CarryTask(new clsCarryTaskData(this.selectedAGVName, this.sourceTag, 1, this.destinTag, 1, this.Cst_ID_Input, 50, this.bypass_eq_status_check));
      }
      if (this.selectedAction == 'exchange_battery') {
        response = await TaskAllocation.ExangeBatteryTask(new clsExangeBatteryTaskData(this.selectedAGVName, this.destinTag, 50, this.bypass_eq_status_check));
      }
      if (this.selectedAction == 'charge') {
        response = await TaskAllocation.ChargeTask(new clsChargeTaskData(this.selectedAGVName, this.destinTag, 50, this.bypass_eq_status_check));
      }
      if (this.selectedAction == 'park') {
        response = await TaskAllocation.ParkTask(new clsParkTaskData(this.selectedAGVName, this.destinTag, 50, this.bypass_eq_status_check));
      }
      this.wait_task_confirm = false;
      if (response.status != 200) {
        const is_Unauthorized = response.status == 401;
        this.$swal.fire({
          title: is_Unauthorized ? '須重新進行登入' : '任務派送失敗!',
          text: is_Unauthorized ? '' : response.mesage,
          icon: 'error',
          showCancelButton: false,
          showConfirmButton: true,
          confirmButtonText: 'OK',
          customClass: 'my-sweetalert',
        }).then(res => {
          if (is_Unauthorized) {
            this.show = false;
            userStore.dispatch('logout', '')
            bus.emit('/show-login-view-invoke')

          }
        })


      }
      else {
        //{confirm:true,message:''}
        if (response.data.confirm) {
          Notifier.Success(`任務-[${this.selectedAction.toUpperCase()}] 已派送!`, 'bottom', 2000);
          setTimeout(() => {
            this.show = false;
          }, 400);
        } else {
          this.$swal.fire(
            {
              text: response.data.message,
              title: '任務派送失敗!',
              icon: 'error',
              showCancelButton: false,
              confirmButtonText: 'OK',
              customClass: 'my-sweetalert'
            })
        }
      }

    },
    HandleDrawerClosed() {
    },

    MapStationClicked(MapPoint) {
      // alert(MapPoint.TagNumber)
      if (!MapPoint)
        return;
      var _station_type = MapPoint.StationType
      if (_station_type == 0)
        this.selectedAction = 'move'
      if (_station_type == 1)
        this.selectedAction = 'unload'
      if (_station_type == 3)
        this.selectedAction = 'charge'


      var option = this.tags.findLast(tag => tag.tag == MapPoint.TagNumber);
      console.info(option)
      if (option)
        this.sourceTag = MapPoint.TagNumber
    },
    async HandleFromSelectChanged(source_tag) {
      this.destinTag = undefined
      this.downstream_tags = [];
      this.equipments_options = await GetEQOptions();
      var source_eq = this.equipments_options.find(eq => eq.TagID == source_tag)
      if (source_eq) {
        var downstream_eq_names = source_eq.ValidDownStreamEndPointNames
        console.info(downstream_eq_names)
        var downstread_eq_options = this.equipments_options.filter(eq => downstream_eq_names.includes(eq.Name))
        console.info(downstread_eq_options)
        Object.values(downstread_eq_options).forEach(element => {
          this.downstream_tags.push({
            tag: element.TagID,
            name: `${element.Name}(Tag=${element.TagID})`
          })
        });
      }
    }
  },
  mounted() {
    bus.on('bus-show-task-allocation', (data = { agv_name: undefined, agv_type: 0, action: '', station_data: new MapPointModel() }) => {
      if (!this.IsUserLogin && !agvs_settings_store.getters.IsRunMode) {
        setTimeout(() => {

          this.$swal.fire(
            {
              text: '',
              title: '請先進行登入',
              icon: 'warning',
              showCancelButton: false,
              confirmButtonText: 'OK',
              customClass: 'my-sweetalert'
            }).then(() => {

              bus.emit('/show-login-view-invoke')
            })

        }, 200);
        return;
      }
      this.agv_type = data.agv_type
      this.sourceTag = undefined;
      this.destinTag = undefined;
      this.selectedAGVName = agvs_settings_store.getters.IsRunMode ? '' : undefined;
      this.moveable_tags = MapStore.getters.AllNormalStationOptions
      this.stock_tags = MapStore.getters.AllEqStation
      this.chargable_tags = MapStore.getters.AllChargeStation
      this.parkable_tags = MapStore.getters.AllParkingStationOptions

      this.selectedAction = data.action
      if (data.agv_name) {
        this.selectedAGVName = data.agv_name;
      }

      if (data.station_data) {

        if (this.selectedAction == 'carry') {
          this.sourceTag = data.station_data.TagNumber
          this.HandleFromSelectChanged(this.sourceTag)
        }
        else {
          this.destinTag = data.station_data.TagNumber
        }
      }
      this.show = true;
    })
  },
}
</script>
<style lang="scss" scoped>
.task-allocation {
  .item {
    display: flex;
    flex-direction: row;
    padding-left: 50px;

    .title {
      width: 120px;
    }
  }

  .drawer-content {
    height: 100%;
    width: 100%;
    padding-left: 76px;
    position: absolute;
    top: 67px;

    .img {
      width: 200px;
      height: 200px;
      position: absolute;
      bottom: 86px;
      opacity: 0.2;
      background-repeat: no-repeat;
      background-size: cover;
    }

    .delivery {
      background-image: url("@/assets/images/fast-delivery.png");
    }

    .charge {
      background-image: url("@/assets/images/charging-station.png");
    }
  }
}
</style>