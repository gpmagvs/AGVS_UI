<template>
  <div class="user-manager my-2">
    <div class="d-flex flex-row">
      <OperatieButtonSet @save="SaveSetting" @restore="RestoreConfirmDialogShow=true"></OperatieButtonSet>
      <span class="flex-fill"></span>
      <el-button type="default" size="large">新增用戶</el-button>
    </div>
    <div class="border">
      <el-table :data="UserData" empty-text="沒有用戶" size="large">
        <el-table-column label="User Name" prop="Username"></el-table-column>
        <el-table-column label="Password" prop="Password">
          <template #default="scope">
            <div>
              <el-input v-model="scope.row.Password"></el-input>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="Role" prop="Role">
          <template #default="scope">
            <div>
              <el-select v-model="scope.row.Role">
                <el-option
                  v-for="role in RoleOptions"
                  :key="role.value"
                  :value="role.value"
                  :label="role.label"
                ></el-option>
              </el-select>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="scope">
            <div>
              <el-button @click="DeleteUser(scope.row)" type="danger">刪除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <b-modal
        v-model="RestoreConfirmDialogShow"
        title="Restore"
        :centered="true"
        @ok="RestoreSetting"
      >
        <p>確定要取消當前修改?</p>
      </b-modal>
    </div>
  </div>
</template>

<script>
import OperatieButtonSet from './OperatieButtonSet.vue'
import { Modify, GetUsers } from '@/api/UserAPI'
import Notifier from '@/api/NotifyHelper'
export default {
  components: {
    OperatieButtonSet,
  },
  data() {
    return {
      RestoreConfirmDialogShow: false,
      UserData: [
        {
          Username: "jinwei",
          Password: "1020",
          Role: 2
        },
        {
          Username: "eng",
          Password: "tset-pw2",
          Role: 1
        },
        {
          Username: "test",
          Password: "tset-pw3",
          Role: 0
        }
      ],
      OriginUserData: {},
      RoleOptions: [
        {
          label: "訪客",
          value: 0
        },
        {
          label: "工程師",
          value: 1
        },
        {
          label: "開發人員",
          value: 2
        }
      ]
    }
  },
  methods: {
    DeleteUser(userDto) {

    },
    async DownloadUsers() {
      this.UserData = await GetUsers();
      this.SaveAsOriginUserData();
    },
    async SaveSetting() {
      var response = await Modify(this.UserData);
      if (response.Success) {
        Notifier.Success("用戶資料修改成功", 'bottom', 3000);
      } else
        Notifier.Danger("用戶資料修改失敗", 'bottom', 3000);
    },
    RestoreSetting() {

    },
    SaveAsOriginUserData() {
      this.OriginUserData = JSON.parse(JSON.stringify(this.UserData));
    }
  },
}
</script>

<style>
</style>