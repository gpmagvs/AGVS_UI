<template>
  <div>
    <el-divider content-position="left">腳本</el-divider>
    {{ selected_regular_unload_settings }}
    <div class="p-2 text-start">
      <div class="w-100 border-bottom my-1">
        <el-button @click="HandleSaveBtnClick" type="primary">儲存腳本設定</el-button>
        <el-button
          class="my-1"
          type="danger"
          @click="() => {
            hotRunScripts.push({
              no: hotRunScripts.length + 1,
              agv_name: undefined,
              loop_num: 10,
              finish_num: 0,
              action_num: 9,
              state: 'IDLE',
              actions: []
            })
          }"
        >新增動作</el-button>
      </div>
      <el-table row-key="scriptID" :data="hotRunScripts" :default-expand-all="false" border>
        <el-table-column label="NO." prop="no" width="60" align="center"></el-table-column>
        <el-table-column label="ID" prop="scriptID" width="210" align="center"></el-table-column>
        <el-table-column label="隨機搬運" prop="IsRandomCarryRun" align="center">
          <template #default="scope">
            <el-checkbox v-model="scope.row.IsRandomCarryRun"></el-checkbox>
          </template>
        </el-table-column>
        <el-table-column label="定期出貨模擬" prop="IsRegularUnloadRequst" align="center">
          <template #default="scope">
            <el-checkbox v-model="scope.row.IsRegularUnloadRequst"></el-checkbox>
          </template>
        </el-table-column>
        <el-table-column label="執行AGV" prop="agv_name" width="150">
          <template #default="scope">
            <div>
              <el-select :disabled="scope.row.IsRandomCarryRun" v-model="scope.row.agv_name">
                <el-option
                  v-for="agv_name in AgvNameList"
                  :key="agv_name"
                  :label="agv_name"
                  :value="agv_name"
                ></el-option>
              </el-select>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="狀態" prop="state" width="120" align="center">
          <template #default="scope">
            <div>
              <el-tag
                effect="dark"
                :type="scope.row.state == 'Running' ? 'success' : 'warning'"
              >{{ scope.row.state }}</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="已完成次數" prop="finish_num" width="100" align="center">
          <template #default="scope">
            <div>{{ scope.row.finish_num }}/{{ scope.row.loop_num }}</div>
          </template>
        </el-table-column>
        <el-table-column label="Loop次數" prop="finish_num" width="120" align="center">
          <template #default="scope">
            <el-input-number
              :disabled="scope.row.IsRandomCarryRun"
              size="small"
              style="width:80px"
              :step="1"
              :precision="0"
              v-model="scope.row.loop_num"
            ></el-input-number>
          </template>
        </el-table-column>
        <el-table-column label="動作數" width="180">
          <template #default="scope">
            <div>
              <span class="mx-2">{{ scope.row.actions.length }}</span>

              <el-button
                :disabled="scope.row.IsRandomCarryRun"
                size="small"
                @click="() => {
                  if(scope.row.IsRegularUnloadRequst){
                    HandleRegularULDScriptActionBtnClick(scope.row.RegularLoadSettings);
                    
                  }else{
                    action_drawer_visible = true;
                  }
                  selected_script_name = scope.row.agv_name;
                  selected_script_actions = scope.row.actions;
                }"
              >{{ scope.row.IsRegularUnloadRequst?'設備出入料設定':'動作設定' }}</el-button>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="Comment" width="240">
          <template #default="scope">
            <el-input v-model="scope.row.comment"></el-input>
          </template>
        </el-table-column>
        <el-table-column label="即時資訊" prop="RealTimeMessage" width="auto"></el-table-column>
        <el-table-column>
          <template #default="scope">
            <div>
              <el-button
                :type="scope.row.state == 'Running' ? 'danger' : 'success'"
                size="small"
                @click="HandleStartBtnClick(scope.row)"
              >{{ scope.row.state == 'Running' ? '中止' : '執行' }}</el-button>
              <el-button size="small" @click="HandleDeleteScript(scope.row)" type="danger">刪除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <el-drawer v-model="action_drawer_visible" direction="rtl" size="60%">
        <template #header="{ titleId, titleClass }">
          <h4
            class="text-danger px-5 text-center"
            :id="titleId"
            :class="titleClass"
          >HOT RUN Actions Setting : {{ selected_script_name }}</h4>
        </template>
        <div class="px-2 text-start">
          <el-button
            class="mx-2"
            type="danger"
            @click="() => {
            selected_script_actions.push({
              no: selected_script_actions.length + 1,
              action: 'move',
              source_tag: undefined,
              destine_tag: undefined
            })
          }"
          >新增動作</el-button>
          <el-button class="mx-2" @click="HandleSaveBtnClickInDrawer" type="primary">儲存設定</el-button>
          <el-table
            row-key="no"
            style="width:1024px"
            border
            class="m-2"
            :data="selected_script_actions"
          >
            <el-table-column width="50">
              <template #default="scope">
                <div class="text-start w-100">
                  <el-button class="w-100" size="small" @click="action_move_up(scope.row)">▲</el-button>
                  <el-button class="w-100" size="small" @click="action_move_down(scope.row)">▼</el-button>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="NO." prop="no" width="60" align="center"></el-table-column>
            <el-table-column label="動作" prop="action" width="120">
              <template #default="scope">
                <el-select class="w-100" v-model="scope.row.action" placeholder="請選擇Action">
                  <el-option label="移動" value="move"></el-option>
                  <el-option label="停車" value="park"></el-option>
                  <el-option label="搬運" value="carry"></el-option>
                  <el-option label="放貨" value="load"></el-option>
                  <el-option label="取貨" value="unload"></el-option>
                  <el-option label="充電" value="charge"></el-option>
                  <el-option label="巡檢量測" value="measure"></el-option>
                  <el-option label="交換電池" value="exchangebattery"></el-option>
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="起點" prop="source_tag" width="250">
              <template #default="scope">
                <el-select
                  :disabled="scope.row.action != 'carry'"
                  class="w-100"
                  v-model="scope.row.source_tag"
                  placeholder="請選擇起點"
                >
                  <el-option
                    v-for="option in GetOption(scope.row.action)"
                    :key="option"
                    :label="option.name"
                    :value="option.tag"
                  ></el-option>
                </el-select>
                <el-select
                  v-if="slotSelectable(scope.row.action)"
                  :disabled="scope.row.action != 'carry'"
                  class="w-100"
                  v-model="scope.row.source_slot"
                  placeholder="請選擇Slot"
                >
                  <el-option
                    v-for="option in SlotOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  ></el-option>
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="卡匣ID" width="150">
              <template #default="scope">
                <el-input
                  :disabled="scope.row.action != 'carry' && scope.row.action != 'unload'"
                  v-model="scope.row.cst_id"
                ></el-input>
              </template>
            </el-table-column>
            <el-table-column label="終點" prop="destine_tag" width="250">
              <template #default="scope">
                <div v-if="scope.row.action != 'measure'">
                  <el-select class="w-100" v-model="scope.row.destine_tag" placeholder="請選擇終點">
                    <el-option
                      v-for="option in GetOption(scope.row.action)"
                      :key="option"
                      :label="option.name"
                      :value="option.tag"
                    ></el-option>
                  </el-select>
                  <el-select
                    v-if="slotSelectable(scope.row.action)"
                    class="w-100"
                    v-model="scope.row.destine_slot"
                    placeholder="請選擇Slot"
                  >
                    <el-option
                      v-for="option in SlotOptions"
                      :key="option.value"
                      :label="option.label"
                      :value="option.value"
                    ></el-option>
                  </el-select>
                </div>
                <div v-else>
                  <el-select class="w-100" v-model="scope.row.destine_name" placeholder="請選擇終點">
                    <el-option
                      v-for="option in GetOption(scope.row.action)"
                      :key="option"
                      :label="option.name"
                      :value="option.tag"
                    ></el-option>
                  </el-select>
                </div>
              </template>
            </el-table-column>
            <el-table-column>
              <template #default="scope">
                <el-button
                  @click="HandleDeleteHotRunAction(scope.row)"
                  size="small"
                  type="danger"
                >Delete</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-drawer>
      <el-drawer v-model="regular_unload_settings_drawer_visible" direction="rtl" size="60%">
        <ReqularUnloadHotRunSettings
          ref="RegularSettings"
          :regular_unload_settings="selected_regular_unload_settings"
        ></ReqularUnloadHotRunSettings>
      </el-drawer>
    </div>
    <el-divider content-position="left">進階設置</el-divider>
    <div class="w-100 bg-light px-2 text-start">
      <!-- <div class="w-100 border-bottom py-1 my-1">
        <el-button @click="HandleSaveBtnClick" type="primary">儲存設定</el-button>
      </div>-->
      <el-form label-position="left">
        <el-form-item label="*不接受隨機搬運任務AGV清單" class="d-flex">
          <el-select class="flex-fill" multiple v-model="noJoinRamdomCarryScriptAGVList">
            <el-option v-for="agv in AgvNameList" :key="agv" :label="agv" :value="agv"></el-option>
          </el-select>
          <el-button @click="HandleSaveNoJoinRamdomCarryTaskAGVList" type="primary">儲存設定</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script>
import { watch } from 'vue'
import { userStore, agv_states_store } from '@/store';
import { MapStore } from '@/components/Map/store'
import { SaveHotRunSettings, GetHotRunSettings, StartHotRun, StopHotRun } from '@/api/TaskAllocation'
import ReqularUnloadHotRunSettings from '@/components/HotRunComponents/ReqularUnloadHotRunSettings.vue';
import axios from 'axios';
import param from '@/gpm_param';
import { ElMessage } from 'element-plus';
export default {
  components: {
    ReqularUnloadHotRunSettings,
  },
  data() {
    return {
      hotRunScripts: [
        {
          no: 1,
          scriptID: '',
          agv_name: 'AGV_001',
          loop_num: 10,
          finish_num: 0,
          state: 'IDLE',
          RealTimeMessage: '',
          IsRandomCarryRun: false,
          actions: [
            {
              no: 1,
              action: 'move',
              source_tag: 0,
              source_slot: 0,
              destine_tag: 2,
              destine_slot: 0,
              cst_id: "",
            },
            {
              no: 2,
              action: 'move',
              source_tag: 0,
              destine_tag: 2,
              cst_id: "",
            }
          ]
        },

      ],
      action_drawer_visible: false,
      regular_unload_settings_drawer_visible: false,
      selected_script_name: '123',
      selected_script_actions: [],
      selected_regular_unload_settings: {},
      noJoinRamdomCarryScriptAGVList: []
    }

  },
  methods: {
    GetOption(action) {
      if (action == 'move')
        return this.moveable_tags
      if (action == 'park')
        return this.parkable_tags
      if (action == 'load' || action == 'unload' || action == 'carry')
        return this.stock_tags
      if (action == 'charge' || action == 'exchangebattery')
        return this.chargable_tags
      if (action == 'measure')
        return this.bay_tags
    },
    action_move_up(action_data) {
      var index = this.selected_script_actions.indexOf(action_data)
      //alert(index)
      if (index == 0)
        return;
      this.selected_script_actions = this.move_element_up(this.selected_script_actions, index)
      //0->1
      //   [0,1,2]

    },
    action_move_down(action_data) {
      var index = this.selected_script_actions.indexOf(action_data)
      //alert(index)
      if (index == this.selected_script_actions.length - 1)
        return;
      this.selected_script_actions = this.move_element_down(this.selected_script_actions, index)

    },
    move_element_up(arr, n) {
      if (n > 0 && n < arr.length) {
        const temp = arr[n]
        arr.splice(n, 1)
        arr.splice(n - 1, 0, temp);

        for (let index = 0; index < arr.length; index++) {
          arr[index].no = index + 1
        }

        return arr;
      }
    },
    move_element_down(arr, n) {
      if (n >= 0 && n < arr.length - 1) {
        const temp = arr[n]
        arr.splice(n, 1)
        arr.splice(n + 1, 0, temp);

        for (let index = 0; index < arr.length; index++) {
          arr[index].no = index + 1
        }
        return arr;
      }
    },
    slotSelectable(action) {
      return action == "carry" || action == "unload" || action == "load";
    },
    async HandleStartBtnClick(script) {
      if (script.state == 'IDLE') {

        this.$swal.fire(
          {
            text: '',
            title: '執行Hot Run ?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'OK',
            customClass: 'my-sweetalert'
          }).then(async (res) => {
            if (res.isConfirmed) {
              var response = await StartHotRun(script.scriptID)
              if (!response.confirm) {
                this.$swal.fire(
                  {
                    text: response.message,
                    title: '無法執行HOT RUN',
                    icon: 'error',
                    showCancelButton: false,
                    confirmButtonText: 'OK',
                    customClass: 'my-sweetalert'
                  })
              } else {
                this.$swal.fire(
                  {
                    text: '',
                    title: 'HOT RUN Start!',
                    icon: 'success',
                    showCancelButton: false,
                    confirmButtonText: 'OK',
                    customClass: 'my-sweetalert'
                  })
              }

            }
          })
      } else {
        this.$swal.fire(
          {
            text: '',
            title: '確定要終止?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'OK',
            customClass: 'my-sweetalert'
          }).then(res => {
            if (res.isConfirmed) {
              StopHotRun(script.scriptID)
            }
          })
      }
    },
    async HandleSaveBtnClick() {
      this.hotRunScripts.forEach(element => {
        if (!element.RealTimeMessage)
          element.RealTimeMessage = ''
      });
      var response = await SaveHotRunSettings(this.hotRunScripts)
      this.$swal.fire(
        {
          text: response.result ? '' : response.message,
          title: response.result ? '儲存成功' : '儲存失敗',
          icon: response.result ? 'success' : 'error',
          showCancelButton: false,
          confirmButtonText: 'OK',
          customClass: 'my-sweetalert',
          timer: response.result ? 1000 : undefined
        })

      if (response.result) {
        setTimeout(() => {
          location.reload();
        }, 1000);
      }
    },
    async HandleSaveBtnClickInDrawer() {
      this.action_drawer_visible = false
      setTimeout(async () => {
        await this.HandleSaveBtnClick();
        setTimeout(() => {
          this.action_drawer_visible = true;
        }, 1000);
      }, 100);
    },
    HandleDeleteHotRunAction(action) {
      var index = this.selected_script_actions.indexOf(action)
      this.selected_script_actions.splice(index, 1)
    },
    HandleDeleteScript(row) {
      this.$swal.fire(
        {
          text: '',
          title: '確定要刪除此腳本?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'OK',
          customClass: 'my-sweetalert'
        }).then(res => {
          if (res.isConfirmed) {
            if (row.state == 'Running') {
              StopHotRun(row.no)
            }
            this.hotRunScripts.splice(this.hotRunScripts.indexOf(row), 1);
            for (let index = 0; index < this.hotRunScripts.length; index++) {
              this.hotRunScripts[index].no = index + 1
            }
          }
        })
    },
    HandleRegularULDScriptActionBtnClick(RegularLoadSettings) {
      this.selected_regular_unload_settings = RegularLoadSettings
      this.regular_unload_settings_drawer_visible = true;
      setTimeout(() => {
        this.$refs['RegularSettings'].update(this.selected_regular_unload_settings);
      }, 100);
    },
    async HandleSaveNoJoinRamdomCarryTaskAGVList() {
      var _axios = axios.create({
        baseURL: `${param.vms_host}`
      })
      var response = await _axios.post('/api/task/SettingNoRunRandomCarryHotRunAGVList', this.noJoinRamdomCarryScriptAGVList);
      if (response.data) {
        ElMessage.success({
          message: '設置成功'
        })
      }

    }
  },
  computed: {
    AgvNameList() {
      return agv_states_store.getters.AGVNameList
    },
    moveable_tags() { return MapStore.getters.AllNormalStationOptions },
    stock_tags() { return MapStore.getters.AllEqStation },
    chargable_tags() { return MapStore.getters.AllChargeStation },
    parkable_tags() { return MapStore.getters.AllParkingStationOptions },
    bay_tags() {
      var bay_data = MapStore.getters.BaysData;
      return Object.keys(bay_data).map(bay_name => ({
        tag: bay_name,
        name: bay_name
      }))
    },
    hot_run_states() {
      return agv_states_store.getters.HotRunStates
    },
    SlotOptions() {
      return [
        { value: 0, label: "第1層" },
        { value: 1, label: "第2層" },
        { value: 2, label: "第3層" }
      ]
    }
  },
  mounted() {

    setTimeout(async () => {

      this.hotRunScripts = await GetHotRunSettings();

      watch(() => this.hot_run_states, (newValue, oldValue) => {
        if (!newValue)
          return;
        for (let index = 0; index < newValue.length; index++) {
          const _script = newValue[index];
          var script_exist = this.hotRunScripts.find(scr => scr.scriptID === _script.scriptID);
          // console.log(_script.scriptID, _script.RealTimeMessage)
          if (script_exist) {
            // console.log(script_exist.scriptID, script_exist.RealTimeMessage)
            script_exist.state = _script.state;
            script_exist.finish_num = _script.finish_num;
            script_exist.RealTimeMessage = _script.RealTimeMessage;
          }
        }

      }, { deep: true, immediate: true })
    }, 100);
  },
}
</script>
<style lang="scss" scoped>
.settings-content {
  div {
    margin: 2px;
    font-weight: bold;
  }
}
</style>