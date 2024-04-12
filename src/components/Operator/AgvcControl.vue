<template>
  <div class="agv-control">
    <div class="d-flex flex-row">
      <div class="information" style="width:260px">
        <el-form label-position="top">
          <div class="row div-container mx-1 my-2">
            <label class="text-start border-bottom">Tag ID</label>
            <el-form-item class="my-2">
              <b-form-input
                v-if="!IsInspectionAGV"
                size="sm"
                disabled
                v-model="vms_data.BCR_State_MoveBase.tagID"
                :state="vms_data.BCR_State_MoveBase.tagID > 0">
              </b-form-input>
              <b-form-input
                v-else
                size="sm"
                disabled
                v-model="vms_data.Last_Visited_Tag"
                :state="vms_data.Last_Visited_Tag > 0">
              </b-form-input>
            </el-form-item>
          </div>
          <div class="row div-container mx-1 my-2">
            <label class="text-start border-bottom">{{ $t('offset') }}</label>
            <el-form-item class="col-6" label="X">
              <b-form-input size="sm" disabled v-model.number="vms_data.BCR_State_MoveBase.xValue"></b-form-input>
            </el-form-item>
            <el-form-item class="col-6" label="Y">
              <b-form-input size="sm" disabled v-model.number="vms_data.BCR_State_MoveBase.yValue"></b-form-input>
            </el-form-item>
          </div>
          <div class="row div-container mx-1 my-2">
            <label class="text-start border-bottom">{{ $t('angle') }}</label>
            <el-form-item class="my-2">
              <b-form-input size="sm" disabled v-model.number="vms_data.BCR_State_MoveBase.theta"></b-form-input>
            </el-form-item>
          </div>
          <!-- <div class="row div-container mx-1 my-2">
            <label class="text-start border-bottom">速度資訊</label>
            <el-form-item class="col-6" label="Linear X">
              <b-form-input size="sm" disabled v-model.number="vms_data.LinearSpeed"></b-form-input>
            </el-form-item>
            <el-form-item class="col-6" label="Angular Z">
              <b-form-input size="sm" disabled v-model.number="vms_data.AngularSpeed"></b-form-input>
            </el-form-item>
          </div>-->
          <div v-if="enabled" class="row div-container mx-1 my-2">
            <label class="text-start border-bottom">位置上報</label>
            <b-button @click="HandleUpload">Upload</b-button>
          </div>
          <!-- <b-button variant="primary" @click="FindTagBtnHandler">Auto Find Tag</b-button> -->
        </el-form>
      </div>
      <agvc_control_panel></agvc_control_panel>
    </div>
  </div>
</template>

<script>
import bus from '@/event-bus.js'
import VMSData from '@/ViewModels/VMSData';
import agvc_control_panel from './AgvcControlPanel'
import { FindTagCenter } from '@/api/VMSAPI'
import MapAPI from '@/api/MapAPI.js'

export default {
  components: {
    agvc_control_panel,
  },
  props: {
    ModuleInformation: {
      type: Object,
      default() {
        return {

        }
      }
    },
    enabled: {
      type: Boolean,
      default: false
    },
    super_user: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      vms_data: new VMSData(),
    }
  },
  computed: {
    TagID() {
      if (this.ModuleInformation.reader == undefined) {
        return -1;
      } else {
        return this.ModuleInformation.reader.tagID;
      }
    },
    IsInspectionAGV() {
      return this.vms_data.Agv_Type == 2;
    }
  },
  methods: {
    async FindTagBtnHandler() {
      var response = await FindTagCenter();

    },
    async HandleUpload() {
      var agvname = this.vms_data.CarName;
      var tag = this.vms_data.Tag;
      var x = this.vms_data.Pose.position.x;
      var y = this.vms_data.Pose.position.y;
      var theta = this.vms_data.Angle;
      var response = await MapAPI.UploadCoordination(agvname, tag, x, y, theta);
      if (response) {
        this.$swal.fire(
          {
            text: '位置上報成功',
            title: '位置上報',
            icon: 'information',
            showCancelButton: false,
            confirmButtonText: 'OK',
            customClass: 'my-sweetalert'
          })
      } else {
        this.$swal.fire(
          {
            text: '位置上報失敗',
            title: '位置上報',
            icon: 'error',
            showCancelButton: false,
            confirmButtonText: 'OK',
            customClass: 'my-sweetalert'
          })
      }
    }
  },
  mounted() {
    bus.on('/vms_data', (vms_data) => {
      this.vms_data = vms_data
    });
  },
}
</script>

<style scoped lang="scss">
.agv-control {

  .information {
    .div-container {
      // background-color: #f1f1f1;
      border: 1px solid rgb(202, 202, 202);
    }

    label {
      background-color: #f1f1f1;
      color: rgb(48, 48, 48);
      border-start-start-radius: 3px;
      border-start-end-radius: 3px;
    }
  }
}
</style>
