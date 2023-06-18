<template>
  <div class="task-allocation">
    <el-drawer
      v-model="show"
      :header="false"
      size="100%"
      direction="ltr"
      :modal="true"
      :z-index="123"
      @closed="HandleDrawerClosed"
    >
      <template #header>
        <h3>Local任務派送-車輛:{{ clsAgvStatus.AGV_Name }}</h3>
      </template>
      <div class="drawer-content my-1 p-1 border-top" v-loading="wait_task_confirm">
        <div class="d-flex flex-row">
          <el-form label-width="100px" label-position="left" size="large">
            <el-form-item label="AGV">
              <el-input disabled v-model="clsAgvStatus.AGV_Name"></el-input>
            </el-form-item>
            <el-form-item label="Action">
              <el-select
                class="w-100"
                v-model="selectedAction"
                placeholder="請選擇Action"
                @change="ActionChangeHandler"
              >
                <el-option label="移動" value="move"></el-option>
                <el-option label="停車" value="park"></el-option>
                <el-option label="搬運" value="carry"></el-option>
                <el-option label="放貨" value="load"></el-option>
                <el-option label="取貨" value="unload"></el-option>
                <el-option label="充電" value="charge"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item :label="From_Lable_display">
              <el-select
                class="w-100"
                v-model="selectedTag"
                placeholder="選擇站點"
                @click="TagsOptionsInit"
              >
                <el-option v-for="tag in tags" :key="tag.tag" :label="tag.name" :value="tag.tag"></el-option>
              </el-select>
            </el-form-item>

            <el-form-item v-if="selectedAction === 'carry'" :label="To">
              <el-select
                class="w-100"
                v-model="selectedToTag"
                placeholder="選擇站點"
                @click="TagsOptionsInit"
              >
                <el-option v-for="tag in tags" :key="tag.tag" :label="tag.name" :value="tag.tag"></el-option>
              </el-select>
            </el-form-item>

            <el-form-item
              v-if="selectedAction === 'carry'|selectedAction === 'load'|selectedAction === 'unload'"
              label="Cassttle ID"
            >
              <el-input class="w-100" v-model="Cst_ID_Input" placeholder="請選擇cst_id"></el-input>
            </el-form-item>
            <el-form-item>
              <b-button
                class="w-100 my-2"
                @click="TaskDeliveryBtnClickHandle"
                variant="primary"
              >派送任務</b-button>
              <b-button class="w-100" @click="TaskDeliveryBtnClickHandle" variant="default">預覽路徑</b-button>
            </el-form-item>
          </el-form>
          <MapShowVue
            ref="_map"
            class="flex-fill mx-2"
            style="height:800px"
            :task_allocatable="true"
            @loaded="OnMapLoaded"
            @onStationClick="MapStationClicked"
          ></MapShowVue>
        </div>
        <div v-if="selectedAction=='charge'" class="img charge"></div>
        <div v-else class="img delivery"></div>
      </div>
    </el-drawer>

    <!--Modals-->
    <div class="modals">
      <b-modal
        @ok="TaskDeliveryHandle"
        v-model="confirm_dialog_show"
        :centered="true"
        title="Task Delivery"
        header-bg-variant="primary"
        header-text-variant="light"
        :z-index="9999"
      >
        <p>
          <span>Action:{{ selectedAction }}</span>
        </p>
        <p>確定要派送此任務?</p>
      </b-modal>

      <b-modal
        v-model="notify_dialog_show"
        :centered="true"
        title="Warning"
        :ok-only="true"
        header-bg-variant="warning"
        header-text-variant="light"
      >
        <p>
          <span>{{ notify_text }}</span>
        </p>
      </b-modal>
    </div>
  </div>
</template>

<script>
import Notifier from '@/api/NotifyHelper';
import bus from '@/event-bus';
import clsAGVStateDto from '@/ViewModels/clsAGVStateDto';
import MapShowVue from '../MapShow.vue';
import { TaskAllocation, clsMoveTaskData, clsLoadTaskData, clsUnloadTaskData, clsCarryTaskData, clsChargeTaskData } from '@/api/TaskAllocation'
import { GetPointTypeNameByTypeNum } from '@/api/MapAPI.js'
export default {
  components: {
    MapShowVue
  },
  data() {
    return {
      show: false,
      clsAgvStatus: new clsAGVStateDto(),
      confirm_dialog_show: false,
      notify_dialog_show: false,
      wait_task_confirm: false,
      notify_text: '',
      selectedAction: 'move', // 選擇的Action
      selectedTag: '', // 選擇的tag_id
      Cst_ID_Input: '123', // 選擇的cst_id
      selectedToTag: '', // 選擇的to_tag
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
      csts: [ // cst_id選項
        { tag: 1, name: '' },
      ]
    }
  },
  computed: {
    From_Lable_display() {
      if (this.selectedAction === 'move' | this.selectedAction === 'park')
        return "目的地"
      else return 'From'
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
    NormalStations() {
      return this.Map.GetNormalStations()
    },
    Map() {
      return this.$refs['_map'];
    }
  },
  methods: {
    ActionChangeHandler(action) {

      this.selectedTag = undefined;
      if (action == 'move')
        this.Map.Highlight('normal');
      if (action == 'carry' | action == 'load' | action == 'unload')
        this.Map.Highlight('eq');
      if (action == 'charge')
        this.Map.Highlight('charge');
    },
    TagSelectClick() {
      this.TagsOptionsInit();
    },
    TagsOptionsInit() {
      this.moveable_tags = [];
      this.stock_tags = [];
      this.chargable_tags = [];

      var NormalStations = this.Map.GetNormalStations()
      var StockStations = this.Map.GetLDULDableStations()


      if (NormalStations) {
        this.moveable_tags = NormalStations.map(st => ({
          tag: st.TagNumber,
          name: `(${GetPointTypeNameByTypeNum(st.StationType)})${st.Name}[Tag=${st.TagNumber}]`
        }))
        this.moveable_tags.sort((a, b) => a.tag - b.tag);
      }
      if (StockStations) {
        this.stock_tags = StockStations.map(st => ({
          tag: st.TagNumber,
          name: `(${GetPointTypeNameByTypeNum(st.StationType)})${st.Name}[Tag=${st.TagNumber}]`
        }))
        this.stock_tags.sort((a, b) => a.tag - b.tag);
      }


      var ChargeStations = this.$refs["_map"].GetChargeStations()
      if (ChargeStations) {
        this.chargable_tags = ChargeStations.map(st => ({
          tag: st.TagNumber,
          name: `(${GetPointTypeNameByTypeNum(st.StationType)})${st.Name}[Tag=${st.TagNumber}]`
        }))
        this.chargable_tags.sort((a, b) => a.tag - b.tag);
      }
    },
    TaskDeliveryBtnClickHandle() {
      if (this.selectedTag == '' | this.selectedTag == undefined) {
        this.notify_text = '尚未選擇目的地';
        this.notify_dialog_show = true;
        return;
      }
      if (this.selectedAction == 'carry' && (this.selectedToTag == '' | this.selectedToTag == undefined)) {
        this.notify_text = '尚未選擇目的地';
        this.notify_dialog_show = true;
        return;
      }
      if ((this.selectedAction == 'carry' | this.selectedAction == 'load' | this.selectedAction == 'unload') && (this.Cst_ID_Input == '' | this.Cst_ID_Input == undefined)) {
        this.notify_text = '尚未選擇CST ID';
        this.notify_dialog_show = true;
        return;
      }
      this.confirm_dialog_show = true;
    },
    async TaskDeliveryHandle() {
      // TaskAllocation.Task();
      this.wait_task_confirm = true
      var agv_name = this.clsAgvStatus.AGV_Name;
      var response = { confirm: true, message: '' }

      if (this.selectedAction == 'move') {
        response = await TaskAllocation.MoveTask(new clsMoveTaskData(agv_name, this.selectedTag));
      }

      if (this.selectedAction == 'load') {
        response = await TaskAllocation.LoadTask(new clsLoadTaskData(agv_name, this.selectedTag, 1, this.Cst_ID_Input));
      }

      if (this.selectedAction == 'unload') {
        response = await TaskAllocation.UnloadTask(new clsUnloadTaskData(agv_name, this.selectedTag, 69, this.Cst_ID_Input));
      }

      if (this.selectedAction == 'carry') {
        response = await TaskAllocation.CarryTask(new clsCarryTaskData(agv_name, this.selectedTag, 69, this.selectedToTag, 6699, this.Cst_ID_Input));
      }
      if (this.selectedAction == 'charge') {
        response = await TaskAllocation.ChargeTask(new clsChargeTaskData(agv_name, this.selectedTag));
      }
      this.wait_task_confirm = false;
      if (!response.confirm) {
        this.$swal.fire({
          title: '任務派送失敗!',
          text: response.message,
          icon: 'error',
          showCancelButton: false,
          showConfirmButton: true,
          confirmButtonText: 'OK',
          customClass: 'my-sweetalert',
        })
      }
      else {
        Notifier.Success('任務已派送', 'top', 3000);
        setTimeout(() => {
          this.show = false;
        }, 400);
      }

    },
    HandleDrawerClosed() {
    },
    OnMapLoaded() {
      this.Map.Highlight('normal')
      this.TagsOptionsInit();
    },
    MapStationClicked(MapPoint) {
      // alert(MapPoint.TagNumber)
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
        this.selectedTag = MapPoint.TagNumber
    }
  },
  mounted() {
    // var timer_ = setInterval(() => {
    //   if (this.Map) {
    //     this.Map.HightlightAGV(this.clsAgvStatus.AGV_Name)
    //     this.Map.Highlight('normal');
    //     clearInterval(timer_)
    //   }
    // }, 100);
    bus.on('bus-show-task-allocation', (clsAgvStatus) => {
      this.clsAgvStatus = clsAgvStatus;
      this.show = true;
      setTimeout(() => {
        this.Map.HightlightAGV(this.clsAgvStatus.AGV_Name)
      }, 1000);

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
    .img {
      width: 200px;
      height: 200px;
      position: absolute;
      bottom: 30px;
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