<template>
  <div class="task-allocation">
    <el-drawer
      v-model="show"
      :header="false"
      size="100%"
      direction="btt"
      :modal="true"
      z-index="123"
    >
      <template #header>
        <h3>Task Allocation-{{ clsAgvStatus.AGV_Name }}</h3>
      </template>
      <div class="drawer-content my-1 px-1">
        <div class="d-flex flex-row">
          <el-form label-width="100px" label-position="left" size="large">
            <el-form-item label="AGV">
              <el-input disabled v-model="clsAgvStatus.AGV_Name"></el-input>
            </el-form-item>
            <el-form-item label="Action">
              <el-select class="w-100" v-model="selectedAction" placeholder="請選擇Action">
                <el-option label="移動" value="move"></el-option>
                <el-option label="停車" value="park"></el-option>
                <el-option label="搬運" value="carry"></el-option>
                <el-option label="Load" value="load"></el-option>
                <el-option label="Unload" value="unload"></el-option>
                <el-option label="充電" value="charge"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item :label="From_Lable_display">
              <el-select class="w-100" v-model="selectedTag" placeholder="請選擇tag_id">
                <el-option v-for="tag in tags" :key="tag.id" :label="tag.name" :value="tag.id"></el-option>
              </el-select>
            </el-form-item>

            <el-form-item v-if="selectedAction === 'carry'" :label="To">
              <el-select class="w-100" v-model="selectedToTag" placeholder="請選擇to_tag">
                <el-option v-for="tag in tags" :key="tag.id" :label="tag.name" :value="tag.id"></el-option>
              </el-select>
            </el-form-item>

            <el-form-item
              v-if="selectedAction === 'carry'|selectedAction === 'load'|selectedAction === 'unload'"
              label="Cassttle ID"
            >
              <el-select class="w-100" v-model="selectedCst" placeholder="請選擇cst_id">
                <el-option v-for="cst in csts" :key="cst.id" :label="cst.name" :value="cst.id"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item>
              <b-button class="w-100" @click="TaskDeliveryBtnClickHandle" variant="primary">派送任務</b-button>
            </el-form-item>
          </el-form>
          <MapShowVue class="flex-fill mx-2" style="height:800px"></MapShowVue>
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
import { clsAgvStatus } from '@/ViewModels/WebViewModels';
import MapShowVue from '../MapShow.vue';
export default {
  components: {
    MapShowVue
  },
  data() {
    return {
      show: false,
      clsAgvStatus: new clsAgvStatus(),
      confirm_dialog_show: false,
      notify_dialog_show: false,
      notify_text: '',
      selectedAction: 'move', // 選擇的Action
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
      csts: [ // cst_id選項
        { id: 1, name: '客戶1' },
        { id: 2, name: '客戶2' },
        { id: 3, name: '客戶3' },
        { id: 4, name: '客戶4' },
        { id: 5, name: '客戶5' },
      ],
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
      else
        return this.parkable_tags;
    }
  },
  methods: {
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
      if ((this.selectedAction == 'carry' | this.selectedAction == 'load' | this.selectedAction == 'unload') && (this.selectedCst == '' | this.selectedCst == undefined)) {
        this.notify_text = '尚未選擇CST ID';
        this.notify_dialog_show = true;
        return;
      }
      this.confirm_dialog_show = true;
    },
    TaskDeliveryHandle() {
      //派送成功狀態
      Notifier.Success('任務已派送', 'top', 3000);
      this.show = false;
    }
  },
  mounted() {
    bus.on('bus-show-task-allocation', (clsAgvStatus) => {
      this.clsAgvStatus = clsAgvStatus;
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
    .img {
      width: 200px;
      height: 200px;
      position: absolute;
      bottom: 0;
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