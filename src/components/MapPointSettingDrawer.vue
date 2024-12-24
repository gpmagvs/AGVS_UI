<template>
  <div class="map-point-setting-drawer">
    <el-drawer
      v-model="show"
      size="35%"
      :close-on-press-escape="true"
      :close-on-click-modal="true"
      :show-close="false"
      :modal="true"
      modal-class="modal-style"
      :before-close="CancelBtnClickHandle"
    >
      <template #header>
        <div class="header border-bottom">
          <h3>點位設定-{{ index }}</h3>
        </div>
      </template>
      <div class="draw-content w-100 px-2">
        <div class="text-start py-2 d-flex">
          <!-- <b-button variant="danger" @click="CancelBtnClickHandle">離開</b-button> -->
          <b-button variant="danger" @click="CancelBtnClickHandle">離開</b-button>
          <b-button variant="primary" @click="SaveBtnClickHandle">儲存</b-button>
          <div v-show="true" class="text-start d-flex">
            <b-button size="sm" variant="primary" @click="Regist">註冊</b-button>
            <b-button size="sm" variant="danger" @click="Unregist">解註冊</b-button>
          </div>
        </div>
        <div class="settings px-2">
          <el-collapse v-model="activeNames" :accordion="true">
            <el-collapse-item title="基本設定" name="1">
              <el-form label-width="120px" label-position="left">
                <el-form-item label="Point Index">
                  <el-input v-model="index" disabled></el-input>
                </el-form-item>
                <el-form-item label="顯示名稱">
                  <div>
                    <el-input v-model="pointData_editing.Graph.Display"></el-input>
                  </div>
                  <div>
                    <el-button
                      v-show="IsEQPoint"
                      @click="pointData_editing.Graph.Display = BindingEQInfo.Name"
                    >使用繫連的EQ名稱</el-button>
                  </div>
                </el-form-item>
                <el-form-item v-if="IsWorkStation" label="顯示圖示">
                  <div class="d-flex mx-1 py-4 bg-light w-100" style="flex-wrap:wrap;height:200px">
                    <div
                      class="icon-container mx-2"
                      style="width:64px;height:84px"
                      v-for="path in EqIcons"
                      :key="path"
                    >
                      <el-image
                        v-bind:style="{
                        border: path == pointData_editing.Graph.ImageName ? '4px solid rgb(41, 215, 92)' : ''
                      }"
                        style="width: 64px; height: 64px;padding:3px;border-radius:8px;cursor:pointer"
                        :src="path"
                        :zoom-rate="1.2"
                        :max-scale="7"
                        :min-scale="0.2"
                        fit="cover"
                        @click="HandleImageClick(path)"
                      >
                        <template #error>
                          <div class="image-slot">錯誤</div>
                        </template>
                      </el-image>
                      <div
                        squared
                        class="image-name-display"
                        style="position:relative;bottom:26px;width:100%;"
                        @click="HandleImageClick(path)"
                      >{{ path.split('/').pop() }}</div>
                      <!-- <b-button squared class="delete-btn" style="position:relative;bottom:26px;width:100%;" variant="danger" size="sm" @click="HandleIconDelete(path)">刪除</b-button> -->
                    </div>
                    <!-- Upload images preview2-->
                    <el-image
                      v-for="path in fileList"
                      :key="path"
                      v-bind:style="{
                      border: path.url == pointData_editing.Graph.ImageName ? '3px solid rgb(49, 132, 253)' : ''
                    }"
                      style="width: 64px; height: 64px;padding:3px;border-radius:8px;cursor:pointer;border:1px dashed red"
                      :src="path.url"
                      :zoom-rate="1.2"
                      :max-scale="7"
                      :min-scale="0.2"
                      fit="cover"
                      @click="HandleImageClick(path)"
                    />
                    <el-upload
                      v-model:file-list="fileList"
                      :action="icon_upload_url"
                      list-type="picture-card"
                      :auto-upload="true"
                      :on-success="OnIconUploadSuccess"
                      :show-file-list="false"
                    >上傳圖示</el-upload>
                    <!-- <div v-for="path in IconGroup.EqIcons" :key="path">{{ path }}</div> -->
                  </div>
                </el-form-item>
                <el-form-item label="Tag">
                  <div class="tag">
                    <div>
                      <span>ID</span>
                      <el-input v-model.number="pointData_editing.TagNumber"></el-input>
                    </div>
                    <div>
                      <span>X</span>
                      <el-input v-model="pointData_editing.X"></el-input>
                    </div>
                    <div>
                      <span>Y</span>
                      <el-input v-model="pointData_editing.Y"></el-input>
                    </div>
                  </div>
                </el-form-item>
                <el-form-item label="站點類型">
                  <el-select v-model="pointData_editing.StationType" @change="StationTypeOnChange">
                    <el-option
                      v-for="pt_type in stationTypes"
                      :key="pt_type.value"
                      :label="pt_type.label"
                      :value="pt_type.value"
                    ></el-option>
                  </el-select>
                  <div v-show="IsEQPoint">
                    <el-input disabled v-model="BindingEQInfo.Name"></el-input>
                  </div>
                </el-form-item>
                <el-form-item label="角度">
                  <el-input-number v-model="pointData_editing.Direction"></el-input-number>
                </el-form-item>
                <el-form-item label="避車角度">
                  <el-input-number v-model="pointData_editing.Direction_Avoid"></el-input-number>
                  <div class="mx-2 d-flex">
                    <div>
                      <label class="mx-2" for>等待進入區域時使用此角度</label>
                      <el-checkbox
                        v-model="pointData_editing.UseAvoidThetaWhenStopAtWaitingPointOfEntryRegion"
                      ></el-checkbox>
                    </div>
                    <div>
                      <label class="mx-2" for>交管停等中使用此角度</label>
                      <el-checkbox
                        v-model="pointData_editing.AlwayTurnToAvoidThetaWhenWaitingTrafficControl"
                      ></el-checkbox>
                    </div>
                  </div>
                </el-form-item>
                <el-form-item v-if="pointData_editing.StationType != 0" label="二次定位點角度">
                  <el-input-number v-model="pointData_editing.Direction_Secondary_Point"></el-input-number>
                </el-form-item>
                <el-form-item label="雷射模式">
                  <el-input-number v-model="pointData_editing.LsrMode" :step="1"></el-input-number>
                  <i
                    class="bi bi-question-circle information"
                    @click="HandleLaserModeInfoIconClick"
                  ></i>
                </el-form-item>
                <el-form-item label="速度">
                  <el-input-number v-model="pointData_editing.Speed" :step="0.1" :precision="1"></el-input-number>
                </el-form-item>
                <el-form-item label="AGV閃避模式">
                  <el-select v-model="pointData_editing.DodgeMode">
                    <el-option label="0" :value="0"></el-option>
                    <el-option label="1" :value="1"></el-option>
                    <el-option label="2" :value="2"></el-option>
                    <el-option label="3" :value="3"></el-option>
                    <el-option label="4-一般道路橫向移動(巡檢AGV)" :value="4"></el-option>
                    <el-option label="5-電池交換橫向移動(巡檢AGV)" :value="5"></el-option>
                    <el-option label="6" :value="6"></el-option>
                    <el-option label="7" :value="7"></el-option>
                    <el-option label="8" :value="8"></el-option>
                    <el-option label="9" :value="9"></el-option>
                    <el-option label="10-取消任務時Pass站點(用於避免與WIP內AGV旋轉干涉)" :value="10"></el-option>
                    <el-option label="11-地標輔助修正(用於轉角或長走道起點，AGV會追Tag中心)" :value="11"></el-option>
                    <el-option label="12-里程計輔助定位(用於窄道)" :value="12"></el-option>
                    <el-option label="13" :value="13"></el-option>
                    <el-option label="14-里程計輔助定位、偵測色帶(用於窄道、脫離色帶會上報異常)" :value="14"></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="Direction">
                  <el-select v-model="pointData_editing.SpinMode">
                    <el-option label="0-可旋轉" :value="0"></el-option>
                    <el-option label="1-不可旋轉" :value="1"></el-option>
                    <el-option label="2-向右旋轉" :value="2"></el-option>
                    <el-option label="3-向左旋轉" :value="3"></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item v-if="IsWorkStation" label="任務權重">
                  <el-input-number :min="1" v-model="pointData_editing.PriorityOfTask"></el-input-number>
                </el-form-item>
              </el-form>
            </el-collapse-item>
            <el-collapse-item title="功能設定" name="2">
              <div class="d-flex flex-column">
                <el-checkbox v-model="pointData_editing.Enable" label="啟用"></el-checkbox>
                <el-checkbox v-model="pointData_editing.IsTrafficCheckPoint" label="交管檢查點"></el-checkbox>
                <el-checkbox v-model="pointData_editing.IsStandbyPoint" label="停駐點"></el-checkbox>
                <el-checkbox v-model="pointData_editing.IsSegment" label="二次定位點"></el-checkbox>
                <el-checkbox v-model="pointData_editing.IsParking" label="可停車點"></el-checkbox>
                <el-checkbox v-model="pointData_editing.IsAvoid" label="避車點"></el-checkbox>
                <el-checkbox v-model="pointData_editing.IsVirtualPoint" label="虛擬點"></el-checkbox>
                <el-checkbox v-model="pointData_editing.IsAutoDoor" label="自動門"></el-checkbox>
                <el-checkbox v-model="pointData_editing.IsExtinguishing" label="消防設備"></el-checkbox>
                <el-checkbox v-model="pointData_editing.IsNarrowPath" label="窄道"></el-checkbox>
                <div class="d-flex">
                  <el-checkbox
                    v-model="pointData_editing.IsHighestPriorityStation"
                    label="最高優先執行任務站點"
                  ></el-checkbox>
                  <el-tooltip content="最高優先執行任務站點，系統會優先執行此站點的任務，且路權會優先給予。" placement="bottom">
                    <i class="bi bi-question-circle information"></i>
                  </el-tooltip>
                </div>
              </div>
            </el-collapse-item>
            <el-collapse-item title="註冊點" name="3">
              <div class="text-start">
                <el-button
                  @click="() => {
                  RegistersTable.push({
                    index: undefined,
                    tag: undefined,
                    name: undefined
                  })
                }"
                >新增</el-button>
              </div>
              <el-table row-key="index" height="320px" border :data="RegistersTable">
                <el-table-column label="Index" prop="index">
                  <template #default="scope">
                    <div>
                      <el-select @change="HandleIndexSelected(scope.row)" v-model="scope.row.index">
                        <el-option
                          v-for="pt in pointsOptions"
                          :key="pt.index"
                          :label="pt.index"
                          :value="pt.index"
                        ></el-option>
                      </el-select>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="Tag" prop="tag"></el-table-column>
                <el-table-column label="Name" prop="name"></el-table-column>
                <el-table-column label="Name">
                  <template #default="scope">
                    <el-button
                      @click="() => {
                        RegistersTable.splice(RegistersTable.indexOf(scope.row), 1)
                      }"
                      type="danger"
                      size="small"
                    >移除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-collapse-item>
            <el-collapse-item title="分區設定" name="4">
              <el-form>
                <el-form-item label="所屬區域">
                  <RegionsSelector v-model="pointData_editing.Region"></RegionsSelector>
                </el-form-item>
              </el-form>
            </el-collapse-item>

            <el-collapse-item title="顯示設定" name="5">
              <el-form>
                <el-form-item label="Text Offset">
                  <div class="d-flex text-offset">
                    <span class="mx-3">X</span>
                    <el-input
                      class="mx-2"
                      type="number"
                      v-model="pointData_editing.Graph.textOffsetX"
                    ></el-input>
                    <span class="mx-3">Y</span>
                    <el-input
                      class="mx-2"
                      type="number"
                      v-model="pointData_editing.Graph.textOffsetY"
                    ></el-input>
                  </div>
                </el-form-item>
                <el-form-item label="Rack顯示">
                  <div class="d-flex text-offset">
                    <span class="mx-3">X</span>
                    <el-input
                      class="mx-2"
                      type="number"
                      v-model="pointData_editing.Graph.rackDisplay.OffsetX"
                    ></el-input>
                    <span class="mx-3">Y</span>
                    <el-input
                      class="mx-2"
                      type="number"
                      v-model="pointData_editing.Graph.rackDisplay.OffsetY"
                    ></el-input>
                    <span class="mx-3">Rotation</span>
                    <el-input
                      class="mx-2"
                      type="number"
                      v-model="pointData_editing.Graph.rackDisplay.Rotation"
                    ></el-input>
                  </div>
                </el-form-item>
              </el-form>
            </el-collapse-item>

            <el-collapse-item
              title="進出點位設定"
              v-if="pointData_editing.StationType == 3 || pointData_editing.StationType == 7"
              name="6"
            >
              <el-form>
                <el-form-item label="進入點">
                  <el-input-number v-model="pointData_editing.TagOfInPoint"></el-input-number>
                </el-form-item>
                <el-form-item label="退出點">
                  <el-input-number v-model="pointData_editing.TagOfOutPoint"></el-input-number>
                </el-form-item>
              </el-form>
            </el-collapse-item>
          </el-collapse>
        </div>
      </div>
    </el-drawer>
  </div>
</template>
<script>
import { GetEQInfoByTag } from '@/api/EquipmentAPI.js';
import { pointTypes } from '@/api/MapAPI.js'
import { MapPointModel } from '@/components/Map/mapjs';
import { MapStore } from './Map/store';
import RegionsSelector from '@/components/RegionsSelector.vue'
import MapAPI from '@/api/MapAPI'
import { ElNotification } from 'element-plus'

export default {
  components: {
    RegionsSelector
  },
  data() {
    return {
      show: false,
      index: -1,
      pointData: {},
      pointData_editing: new MapPointModel(),
      RegistersTable: [
        {
          index: 0,
          tag: 1,
          name: '1'

        }
      ],
      activeNames: [],
      BindingEQInfo: {
        ConnOptions: {
          ConnMethod: 0,
          IP: "127.0.0.1",
          Port: 503,
          ComPort: "COM1"
        },
        Name: "LDULD#2",
        TagID: 2
      },
      fileList: [],
      AOIEqIcons: [
        "/images/qv.png",
        "/images/aoi.png",
        "/images/aos.png",
        "/images/VRS.png",
        "/images/fac-robot2.png"
      ]
    }
  },
  mounted() {
  },
  computed: {
    hasAnyChange() {
      var ori_ = JSON.stringify(this.pointData)
      var current_ = JSON.stringify(this.pointData_editing)
      return ori_ != current_;
    },
    IsEQPoint() {
      return this.pointData_editing.StationType == 1;
    },
    IsWorkStation() {
      return this.pointData_editing.StationType != 0;
    },
    stationTypes() {
      return pointTypes;
    },
    potinFullName() {
      return `[${this.index}] ${this.pointData.Name}`
    },
    pointsOptions() {
      return MapStore.getters.AllPointsOptions;
    },
    icon_upload_url() {
      return 'http://localhost:5216/api/map/IconUpload'
    },
    EqIcons() {
      return [
        "/images/eq-icon.png",
        "/images/rack.png",
        "/images/qv.png",
        "/images/aoi.png",
        "/images/aos.png",
        "/images/VRS.png",
        "/images/fac-robot2.png"
      ]
    }
  },
  methods: {
    async Show(ptObj) {
      if (!ptObj.point)
        return;
      this.index = ptObj.index
      this.pointData = ptObj.point
      this.pointData_editing = JSON.parse(JSON.stringify(ptObj.point))
      this.InitRegisterTableData();

      if (this.IsEQPoint)//EQ
      {
        this.BindingEQInfo = await GetEQInfoByTag(this.pointData.TagNumber);
      }
      this.show = true;
      setTimeout(() => {
        this.$emit('OnPointSettingChanged', { index: this.index, pointData: this.pointData_editing })
      }, 500);
    },
    InitRegisterTableData() {
      this.RegistersTable = []
      var registersIndexes = this.pointData_editing.RegistsPointIndexs //點位的INDEX列表
      if (registersIndexes) {
        registersIndexes.forEach(async (index) => {
          var registedPointData = await MapStore.dispatch('GetMapPointByIndex', index);
          if (registedPointData) {
            this.RegistersTable.push({
              index: index,
              tag: registedPointData.TagNumber,
              name: registedPointData.Name
            })
          }
        });
      }

    },
    ResetRegistPointIndexData() {
      this.pointData_editing.RegistsPointIndexs = this.RegistersTable.map(dat => dat.index)
    },
    async StationTypeOnChange(e) {
      if (e == 1) {
        this.BindingEQInfo = await GetEQInfoByTag(this.pointData.TagNumber);
      }
    },

    SaveBtnClickHandle() {
      var imageScale = 0.45;
      var imageSize = [64, 64];
      if (this.AOIEqIcons.includes(this.pointData_editing.Graph.ImageName)) {
        imageScale = 0.20;
        imageSize = [470, 470];
      }
      this.pointData_editing.Graph.ImageSize = imageSize;
      this.pointData_editing.Graph.ImageScale = imageScale;

      this.ResetRegistPointIndexData();
      this.$emit('OnPointSettingChanged', { index: this.index, pointData: this.pointData_editing })
      ElNotification({
        title: 'Success',
        message: `${this.potinFullName} 站點設定已暫存，請記得儲存圖資`,
        duration: 1000
      })
      this.pointData = this.pointData_editing;
    },
    CheckTagRepeat() {
      if (this.pointData_editing.TagNumber == this.pointData.TagNumber) {
        return false;
      }
      var _sameTagCount = this.pointsOptions.filter(pt => pt.tag + '' == this.pointData_editing.TagNumber + '')
      alert(JSON.stringify(_sameTagCount))
      return _sameTagCount.length == 1;
    },
    CancelBtnClickHandle() {
      if (this.hasAnyChange) {
        this.show = false;
        this.$swal.fire({
          title: '點位尚未儲存',
          text: `點位-${this.potinFullName} 設定值變更但尚未儲存，確定要離開?`,
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: '確定',
          customClass: 'my-sweetalert'
        }).then((result) => {
          this.show = !result.isConfirmed;
          if (!this.show) {
            this.$emit('OnLeve')
            this.$emit('OnPointSettingChanged', { index: this.index, pointData: this.pointData })
          }
        })

      } else {
        this.show = false;
        this.$emit('OnLeve')
      }
    },
    async Regist() {
      var response = await MapAPI.Regist(this.pointData_editing.TagNumber);
      var success = response.result;
      //            return Ok(new { result = result, message = err_msg });
      this.show = false;
      this.$swal.fire(
        {
          text: '',
          title: `${this.pointData_editing.TagNumber} ${success ? '註冊成功' : '註冊失敗'}`,
          icon: success ? 'success' : 'error',
          showCancelButton: false,
          confirmButtonText: 'OK',
          customClass: 'my-sweetalert'
        }).then(res => {
          this.show = true;
        })
    },
    async Unregist() {
      var response = await MapAPI.Unregist(this.pointData_editing.TagNumber)
      var success = response.result;

      this.show = false;
      //            return Ok(new { result = result, message = err_msg });
      this.$swal.fire(
        {
          text: '',
          title: `${this.pointData_editing.TagNumber} ${success ? '解除註冊成功' : '解除註冊失敗'}`,
          icon: success ? 'success' : 'error',
          showCancelButton: false,
          confirmButtonText: 'OK',
          customClass: 'my-sweetalert'
        }).then(res => {
          this.show = true;
        })
    },
    HandleIndexSelected(pt) {
      var index = pt.index
      MapStore.dispatch('GetMapPointByIndex', index).then(point_Selected => {
        pt.tag = point_Selected.TagNumber;
        pt.name = point_Selected.Name;
      })

    },
    HandleDodgeModeInfoIconClick() {
      this.show = false;
      this.$swal.fire(
        {
          html: '<div class="text-start">4:一般道路橫向移動(巡檢AGV)<br>5:電池交換橫向移動(巡檢AGV)<br>10:取消任務時Pass站點(用於避免與WIP內AGV旋轉干涉)<br>11:地標輔助修正(用於轉角或長走道起點，AGV會追Tag中心)<br>12:里程計輔助定位(用於窄道)<br>14:里程計輔助定位、偵測色帶(用於窄道、脫離色帶會上報異常)</div>',
          title: 'Dodge Mode',
          icon: 'information',
          showCancelButton: false,
          customClass: 'my-sweetalert'
        }).then(() => {
          this.show = true
        })
    },
    HandleSpinModeInfoIconClick() {
      this.show = false;
      this.$swal.fire(
        {
          html: '<div class="text-start">0:不可旋轉<br>1:可旋轉<br>2:向右旋轉<br>3:向左旋轉</div>',
          title: 'Spin Mode',
          icon: 'information',
          showCancelButton: false,
          customClass: 'my-sweetalert'
        }).then(() => {
          this.show = true
        })
    },
    HandleLaserModeInfoIconClick() {
      this.show = false;
      this.$swal.fire(
        {
          html: '<div class="text-start">0:Bypass<br>1:Normal<br>2:二次定位<br>3:Normal_Short<br>5:Turning<br>7:Loading<br>10:Special<br>12:Narrow(窄道)<br>13:Norrow_Long</div>',
          title: 'Laser Mode',
          icon: 'information',
          showCancelButton: false,
          customClass: 'my-sweetalert'
        }).then(() => {
          this.show = true
        })
    },
    HandleImageClick(path) {
      this.pointData_editing.Graph.ImageName = path;
    },
    HandleUploadIconBtnClick() {

    },
    OnIconUploadPreview(file) {
      console.info(file)
    },
    OnIconUploadSuccess(response, uploadFile, uploadFiles) {
      console.info(response);
      this.fileList = [];
      MapStore.dispatch('DownloadMapData')
    },
    HandleIconDelete(path) {
      MapStore.dispatch('DeleteIcon', path);
      MapStore.dispatch('DownloadMapData')
    }

  },
}
</script>
<style lang="scss" scoped>
.map-point-setting-drawer {
  .modal-style {
    opacity: 0.3;
  }

  z-index: 2;

  .icon-container {
    .delete-btn {
      opacity: 0;
    }
  }

  .icon-container:hover {
    border: 1px solid blue;
    border-radius: 5px;

    .delete-btn {
      opacity: 0.8;
    }
  }

  .draw-content {
    top: 67px;
    position: absolute;
    height: 100%;

    .settings {
      height: 800px;
      overflow-y: scroll;
    }

    button {
      width: 120px;
      margin-right: 3px;
    }
  }

  .tag {
    display: flex;
    flex-direction: row;

    div {
      display: flex;
      flex-direction: row;
      margin: 3px;
    }
  }

  .information {
    font-size: 16px;
    margin: auto 10px;
    cursor: pointer;
  }
  .text-offset {
  }
}
</style>