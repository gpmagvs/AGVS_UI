<template>
  <div class="task-delivery">
    <div v-if="false" class="my-1 d-flex">
      <div>
        <div class="item">
          <div class="title">動作</div>
          <el-select v-model="selectedAction" placeholder="請選擇Action">
            <el-option label="移動" value="None"></el-option>
            <el-option label="停車" value="Park"></el-option>
            <el-option label="搬運" value="Carry"></el-option>
            <el-option label="Load" value="Load"></el-option>
            <el-option label="Unload" value="Unload"></el-option>
            <el-option label="充電" value="Charge"></el-option>
          </el-select>
          <div class="text-start mx-1">
            <b-button @click="TaskDeliveryBtnClickHandle" variant="primary" block>派送任務</b-button>
          </div>
          <!-- Move To Position -->
        </div>
        <!-- For Movable -->
        <div
          v-if="selectedAction === 'None' | selectedAction === 'Unload' | selectedAction === 'Load' | selectedAction === 'Charge' | selectedAction === 'Park'">
          <div class="item">
            <div class="title">目的地</div>
            <el-select
              @click="GetNormalStationTagsFromMap()"
              v-model="selectedToTag"
              placeholder="請選擇目的地">
              <el-option v-for="tag in tags" :key="tag.id" :label="tag.name" :value="tag.id"></el-option>
            </el-select>
          </div>
        </div>
        <div v-else>
          <div class="d-flex">
            <div class="item">
              <div class="title">起點</div>
              <el-select v-model="selectedTag" placeholder="請選擇起點">
                <el-option v-for="tag in tags" :key="tag.id" :label="tag.name" :value="tag.id"></el-option>
              </el-select>
            </div>
            <div class="item">
              <div class="title mx-1">終點</div>
              <el-select v-model="selectedToTag" placeholder="請選擇終點">
                <el-option v-for="tag in tags" :key="tag.id" :label="tag.name" :value="tag.id"></el-option>
              </el-select>
            </div>
          </div>
          <div class="item">
            <div class="title">載物ID</div>
            <el-input v-model="selectedCst" placeholder="請輸入載物ID"></el-input>
          </div>
        </div>
      </div>
      <div class="bg-light item d-flex justify-content-end">
        <b-button v-if="IsGodUse" @click="() => { MoveTestPanel.Show() }" variant="danger">移動測試</b-button>
      </div>
    </div>
    <MapShowVue
      :task_allocatable="true"
      @OnFeatureClicked="MapFeatureClickedHandle"
      class="flex-fill"
      style="height:600px"
      ref="map"></MapShowVue>
    <el-drawer v-model="ShowTaskAllocateDrawer" direction="btt" :size="IsInspectAGV ? '50%' : ''">
      <template #header>
        <h2 class="text-start"> {{ GetTitleText(SelectedFeature) }}<div v-if="SelectedFeatureIsVirtualPt" class="text-danger"> 虛擬點不可為終點站</div>
        </h2>
        <h6>{{ SelectedFeatureCoordination }}</h6>
      </template>
      <div class="px-1 d-flex flex-row justify-content-around">
        <b-button
          class="my-1 action-button"
          variant="primary"
          @click="handleTaskAllocatModeMenuClick('None')"
          :disabled="!SelectedFeatureMovable || SelectedFeatureIsVirtualPt">
          <i class="bi bi-arrows-move"></i>移動 </b-button>
        <b-button
          class="my-1 action-button"
          variant="primary"
          @click="handleTaskAllocatModeMenuClick('Load')"
          :disabled="!SelectedFeatureLDULDable">
          <i class="bi bi-box-arrow-up-right"></i>放貨 </b-button>
        <b-button
          class="my-1 action-button"
          variant="primary"
          @click="handleTaskAllocatModeMenuClick('Unload')"
          :disabled="!SelectedFeatureLDULDable">
          <i class="bi bi-box-arrow-in-down-left"></i>取貨 </b-button>
        <b-button
          v-if="!SelectedFeatureBatExchangable"
          class="my-1 action-button"
          variant="warning"
          @click="handleTaskAllocatModeMenuClick('Charge')"
          :disabled="!SelectedFeatureChargable">
          <i class="bi bi-battery-charging"></i>充電 </b-button>
        <b-button
          v-if="SelectedFeatureBatExchangable"
          class="my-1 action-button"
          variant="warning"
          @click="handleTaskAllocatModeMenuClick('ExchangeBattery')"
          :disabled="!SelectedFeatureBatExchangable">
          <i class="bi bi-battery-charging"></i>交換電池 </b-button>
      </div>
      <div v-if="IsInspectAGV" class="px-1 d-flex flex-row justify-content-around">
        <b-button
          class="my-1 action-button"
          variant="info"
          @click="HandleLocatingBtnClick">
          <i class="bi bi-crosshair"></i>定位</b-button>
      </div>
    </el-drawer>
    <MoveTestDrawer ref="move_test"></MoveTestDrawer>
    <b-modal
      @ok="TaskDeliveryHandle"
      v-model="confirm_dialog_show"
      :centered="true"
      title="Task Delivery"
      header-bg-variant="primary"
      header-text-variant="light">
      <p>
        <span>Action:{{ selectedAction }}</span>
      </p>
      <p>{{ $t('VMSTask.TaskDelivery.DDD') }}?</p>
    </b-modal>
    <b-modal
      v-model="notify_dialog_show"
      :centered="true"
      title="Warning"
      :ok-only="true"
      header-bg-variant="warning"
      header-text-variant="light">
      <p>
        <span>{{ notify_text }}</span>
      </p>
    </b-modal>
  </div>
</template>
<script>
import Notifier from '@/api/NotifyHelper';
import { NavigationAPI, InspectionAGVAPI } from '@/api/VMSAPI';
import MapShowVue from './MapShow.vue';
import { UserStore, AGVStatusStore } from '@/store';
import MoveTestDrawer from './MoveTestDrawer.vue'
import bus from '@/event-bus.js'
import { Feature } from 'ol';
import clsLocalization from '@/ViewModels/InspectionAGV/clsLocalization';
export default {
  components: {
    MapShowVue, MoveTestDrawer
  },
  data() {
    return {
      confirm_dialog_show: false,
      notify_dialog_show: false,
      ShowTaskAllocateDrawer: false,
      SelectedFeature: new Feature(), //從map 點選的feature物件
      notify_text: '',

      selectedAction: 'None', // 選擇的Action
      selectedTag: '', // 選擇的tag_id
      selectedCst: '', // 選擇的cst_id
      selectedToTag: '', // 選擇的to_tag
      moveable_tags: [ // tag_id選項
        { id: 1, name: '標籤1' },
        { id: 2, name: '標籤2' },
        { id: 3, name: '標籤3' },
        { id: 4, name: '標籤4' },
        { id: 5, name: '標籤5' },
      ],
      parkable_tags: [ // tag_id選項
        { id: 1, name: '標籤1' },
        { id: 2, name: '標籤2' },
        { id: 3, name: '標籤3' },
        { id: 4, name: '標籤4' },
        { id: 5, name: '標籤5' },
      ],
      chargable_tags: [ // tag_id選項
        { id: 50, name: '充電站(TAG-50)' },
        { id: 70, name: '充電站(TAG-70)' },
      ],
      batExchangable_tags: [ // tag_id選項
        { id: 50, name: '充電站(TAG-50)' },
        { id: 70, name: '充電站(TAG-70)' },
      ],
      lduldable_tags: [ // tag_id選項
        { id: 50, name: '充電站(TAG-50)' },
        { id: 70, name: '充電站(TAG-70)' },
      ],
      csts: [ // cst_id選項
        { id: 1, name: '客戶1' },
        { id: 2, name: '客戶2' },
        { id: 3, name: '客戶3' },
        { id: 4, name: '客戶4' },
        { id: 5, name: '客戶5' },
      ],
    };
  },
  computed: {
    IsGodUse() {
      return UserStore.getters.IsGodUser;
    },
    IsInspectAGV() {
      return AGVStatusStore.getters.IsInspectionAGV;
    },
    From_Lable_display() {
      if (this.selectedAction === 'None' | this.selectedAction === 'Park')
        return "目的地"
      else return 'From'
    },
    tags() {
      if (this.selectedAction == 'None')
        return this.moveable_tags;

      else if (this.selectedAction == 'Charge')
        return this.chargable_tags;
      else
        return this.parkable_tags;
    },
    SelectedFeatureMovable() {
      if (!this.SelectedFeature)
        return false;
      this.GetNormalStationTagsFromMap();
      var l = this.moveable_tags.filter(i => i.id == this.SelectedFeature.getId())
      return l.length == 1;
    },
    SelectedFeatureCoordination() {
      if (!this.SelectedFeature)
        return ""
      var geom = this.SelectedFeature.getGeometry();
      if (!geom)
        return ""

      return geom.getCoordinates();
    },
    SelectedFeatureIsVirtualPt() {
      if (!this.SelectedFeature)
        return false;
      return this.SelectedFeature.get('isVirtual');
    },
    SelectedFeatureLDULDable() {
      if (!this.SelectedFeature)
        return false;
      this.GetLDULDStationTagsFromMap();
      var l = this.lduldable_tags.filter(i => i.id == this.SelectedFeature.getId())
      return l.length == 1;
    },
    SelectedFeatureChargable() {
      if (!this.SelectedFeature)
        return false;
      this.GetChargeStationTagsFromMap();
      var l = this.chargable_tags.filter(i => i.id == this.SelectedFeature.getId())
      return l.length == 1;
    },
    SelectedFeatureBatExchangable() {
      if (!this.SelectedFeature)
        return false;
      this.GetBatExchangerStationTagsFromMap();
      var l = this.batExchangable_tags.filter(i => i.id == this.SelectedFeature.getId())
      return l.length == 1;
    },
    ActionText() {
      if (this.selectedAction == 'None')
        return '移動';
      if (this.selectedAction == 'Charge')
        return '充電';
      if (this.selectedAction == 'Load')
        return '放貨';
      if (this.selectedAction == 'Unload')
        return '取貨';
      if (this.selectedAction == 'ExchangeBattery')
        return '電池交換';
    },
    MoveTestPanel() {
      return this.$refs['move_test']
    }
  },
  methods: {
    async HandleLocatingBtnClick() {
      var tag = this.SelectedFeature.getId();
      var coordinate = this.SelectedFeatureCoordination;
      var x = coordinate[0];
      var y = coordinate[1];
      await InspectionAGVAPI.Localization(new clsLocalization(tag, x, y, -1))
    },
    GetTitleText(feature) {
      if (!feature)
        return "";

      var _station_name = feature.get('name')
      var _tag = feature.getId()
      return `${_station_name} (Tag-${_tag})`
    },
    TaskDeliveryBtnClickHandle() {

      if (this.selectedAction == 'Carry' && (this.selectedToTag == '' | this.selectedToTag == undefined)) {
        this.notify_text = '尚未選擇目的地';
        this.notify_dialog_show = true;
        return;
      }
      if ((this.selectedAction == 'Carry' | this.selectedAction == 'Load' | this.selectedAction == 'Unload') && (this.selectedCst == '' | this.selectedCst == undefined)) {
        this.notify_text = '尚未選擇CST ID';
        this.notify_dialog_show = true;
        return;
      }
      this.confirm_dialog_show = true;
    },
    async TaskDeliveryHandle() {

      var response = await NavigationAPI.Action(this.selectedAction, this.selectedTag, this.selectedToTag, this.selectedCst)
      console.info(response);
      if (response.accpet) {
        Notifier.Success("任務已派送");
        var tags = response.path.map(v => v.Point_ID);
        console.info(tags);
        this.$refs.map.UpdateNavPathRender(response.agv_name, tags);
      }
      else {
        this.$swal.fire({
          title: '任務派送失敗',
          text: `${response.error_message}`,
          icon: 'error',
          showCancelButton: false,
          confirmButtonText: 'OK',
          customClass: 'my-sweetalert'
        })
      }
      //Notifier.Danger(`任務派送失敗:${response.error_message}`, "bottom", 5000);

    },
    GetNormalStationTagsFromMap() {
      var normal_stations = this.$refs['map'].GetNormalStations();
      function compare(a, b) {
        if (a.TagNumber < b.TagNumber) {
          return -1;
        }
        if (a.TagNumber > b.TagNumber) {
          return 1;
        }
        return 0;
      }
      normal_stations.sort(compare);
      this.moveable_tags = [];
      normal_stations.forEach(station => {

        this.moveable_tags.push({
          id: station.TagNumber,
          name: '(Normal)' + station.TagNumber
        });
      })

    },
    GetChargeStationTagsFromMap() {
      var charge_stations = this.$refs['map'].GetChargeStations();
      console.info(charge_stations);

      function compare(a, b) {
        if (a.TagNumber < b.TagNumber) {
          return -1;
        }
        if (a.TagNumber > b.TagNumber) {
          return 1;
        }
        return 0;
      }
      charge_stations.sort(compare);
      this.chargable_tags = [];
      charge_stations.forEach(station => {

        this.chargable_tags.push({
          id: station.TagNumber,
          name: '(Charge)' + station.TagNumber
        });
      })

    },
    GetBatExchangerStationTagsFromMap() {
      var batexchanger_stations = this.$refs['map'].GetBatExchangerStations();
      console.info(batexchanger_stations);

      function compare(a, b) {
        if (a.TagNumber < b.TagNumber) {
          return -1;
        }
        if (a.TagNumber > b.TagNumber) {
          return 1;
        }
        return 0;
      }
      batexchanger_stations.sort(compare);
      this.batExchangable_tags = [];
      batexchanger_stations.forEach(station => {

        this.batExchangable_tags.push({
          id: station.TagNumber,
          name: '(Bat_Exchange)' + station.TagNumber
        });
      })

    },
    GetLDULDStationTagsFromMap() {
      var lduld_stations = this.$refs['map'].GetSTKStations();
      function compare(a, b) {
        if (a.TagNumber < b.TagNumber) {
          return -1;
        }
        if (a.TagNumber > b.TagNumber) {
          return 1;
        }
        return 0;
      }
      lduld_stations.sort(compare);
      this.lduldable_tags = [];
      lduld_stations.forEach(station => {

        this.lduldable_tags.push({
          id: station.TagNumber,
          name: '(LDULD)' + station.TagNumber
        });
      })

    },
    handleTaskAllocatModeMenuClick(action) {
      this.selectedAction = action;
      this.selectedToTag = this.SelectedFeature.getId();
      this.ShowTaskAllocateDrawer = false;
      this.$swal.fire({
        title: `${this.$t('VMSTask.TaskDelivery.TaskDispatchConfirm')}`,
        text: `確定要執行${this.ActionText} 任務?(Tag ${this.selectedToTag})`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: '確認',
        customClass: 'my-sweetalert'
      }).then(result => {
        if (result.isConfirmed) {
          this.TaskDeliveryHandle();
        }
      })

    },
    MapFeatureClickedHandle(feature) {
      if (feature.get('station_type')) {
        // this.SelectedFeature.get('data').IsVirtual
        this.SelectedFeature = feature
        if (this.SelectedFeature)
          this.ShowTaskAllocateDrawer = true;
      }
    }
  },
  mounted() {
    this.moveable_tags = [];
    this.parkable_tags = [];
    for (let index = 43; index <= 71; index += 2) {
      this.moveable_tags.push({
        id: index,
        name: index
      });

    }
    for (let index = 42; index <= 80; index += 2) {
      this.parkable_tags.push({
        id: index,
        name: index
      });

    }
  },
};
</script>
<style scoped lang="scss">
.task-delivery {
  padding: 10px;
  height: auto;

  .item {
    display: flex;
    flex-direction: row;
    margin: 10px auto;

    .title {
      width: 70px;
      text-align: left;
    }
  }

  .action-button {
    font-size: 40px;
    width: 240px;
    height: 80px;
  }
}
</style>