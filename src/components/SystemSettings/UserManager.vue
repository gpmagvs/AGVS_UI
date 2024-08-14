<template>
  <div class="user-manager p-2">
    <div class="d-flex flex-row">
      <OperatieButtonSet @save="SaveSetting" @restore="HandleRestoreBtnClicked"></OperatieButtonSet>
      <span class="flex-fill"></span>
      <el-button
        @click="() => {
          NewUser = {
            UserName: '',
            Password: '',
            Role: 1
          },
            AddNewUserDialogShow = true
        }"
        style="font-weight: bold;font-size: 16px;"
        type="primary"
        size="large"
      >新增使用者</el-button>
    </div>
    <div class="border">
      <el-table
        :data="UserData"
        empty-text="沒有使用者"
        size="large"
        :header-cell-style="tableHeaderStyle"
        border
      >
        <el-table-column label="使用者名稱" prop="UserName" width="180"></el-table-column>
        <el-table-column label="使用者密碼" prop="Password" width="220">
          <template #default="scope">
            <div>
              <el-input type="Password" v-model="scope.row.Password" show-password></el-input>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="使用者群組" prop="Role" width="180">
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
        <el-table-column label="操作" min-width="120">
          <template #default="scope">
            <div>
              <el-button
                @click="()=>{
                  PermissionSettingSender.userName=scope.row.UserName;
                  PermissionSettingSender.role=scope.row.Role;
                showPermissionSettingDrawer=true;
              }"
              >權限設定</el-button>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="120">
          <template #default="scope">
            <div>
              <el-button @click="DeleteUser(scope.row)" type="danger">刪除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-drawer v-model="showPermissionSettingDrawer" :size="600" custom-class="permission-drawer">
      <template #header="{ titleId, titleClass }">
        <div>
          <h3>使用者權限設定</h3>
          <h4 class="user-name">[{{ PermissionSettingSender.userName }}]</h4>
        </div>
      </template>
      <div style="position: relative; top:-60px">
        <PermissionSetting :PermissionSettingSender="PermissionSettingSender"></PermissionSetting>
      </div>
    </el-drawer>
    <el-dialog v-model="AddNewUserDialogShow" width="500" title="新增使用者" draggable>
      <div>
        <el-form>
          <el-form-item label="使用者名稱">
            <el-input v-model="NewUser.UserName" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="使用者密碼">
            <el-input v-model="NewUser.Password" type="password" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="使用者群組">
            <el-select v-model="NewUser.Role">
              <el-option
                v-for="role in RoleOptions"
                :key="role.value"
                :value="role.value"
                :label="role.label"
              ></el-option>
            </el-select>
          </el-form-item>
          <b-button
            :disabled="NewUser.UserName == '' || NewUser.Password == ''"
            @click="HandleAddNewUserClick"
            class="w-100"
            variant="primary"
          >新增</b-button>
        </el-form>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import OperatieButtonSet from './OperatieButtonSet.vue';
import PermissionSetting from './PermissionSetting.vue';
import { Modify, GetUsers, Delete, Add } from '@/api/UserAPI'
import Notifier from '@/api/NotifyHelper'
import { tableHeaderStyle } from '@/ViewModels/GlobalStyles'
export default {
  components: {
    OperatieButtonSet, PermissionSetting
  },

  data() {
    return {
      tableHeaderStyle,
      AddNewUserDialogShow: false,
      showPermissionSettingDrawer: false,
      UserData: [
        {
          UserName: "jinwei",
          Password: "1020",
          Role: 2
        },
        {
          UserName: "eng",
          Password: "tset-pw2",
          Role: 1
        },
        {
          UserName: "test",
          Password: "tset-pw3",
          Role: 0
        }
      ],
      NewUser: {
        UserName: "eng",
        Password: "tset-pw2",
        Role: 1
      },
      OriginUserData: {},
      RoleOptions: [
        {
          label: "Operator",
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
      ],
      PermissionSettingSender: {
        userName: '',
        role: -1
      }
    }
  },
  mounted() {
    this.DownloadUsers();
  },
  methods: {
    async DeleteUser(userDto) {
      this.$swal.fire(
        {
          text: `確定要刪除使用者-${userDto.UserName} ?`,
          title: '刪除使用者',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'OK',
          customClass: 'my-sweetalert'
        }).then(async (res) => {
          if (!res.isConfirmed)
            return;
          await Delete(userDto.UserName);
          this.DownloadUsers();
          Notifier.Danger(`使用者-${userDto.UserName}已刪除`, 'top', 1000);

        })
    },
    async DownloadUsers() {
      this.UserData = await GetUsers();
      this.SaveAsOriginUserData();
    },
    async SaveSetting() {
      var response = await Modify(this.UserData);
      if (response.Success) {
        Notifier.Success("使用者資料修改成功", 'bottom', 3000);
      } else
        Notifier.Danger("使用者資料修改失敗", 'bottom', 3000);
    },
    async HandleRestoreBtnClicked() {
      this.$swal.fire(
        {
          text: '',
          title: '確定要載入預設值?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'OK',
          customClass: 'my-sweetalert'
        }).then((res) => {
          if (!res.isConfirmed)
            return
          this.DownloadUsers();
          Notifier.Success("使用者資料已重新載入", 'top', 2000);
        })
    },
    SaveAsOriginUserData() {
      this.OriginUserData = JSON.parse(JSON.stringify(this.UserData));
    },
    async HandleAddNewUserClick() {
      var result = await Add(this.NewUser);
      this.AddNewUserDialogShow = false;
      if (!result.Success) {
        this.$swal.fire(
          {
            text: `${result.Message}`,
            title: `使用者新增失敗`,
            icon: 'warning',
            showCancelButton: false,
            confirmButtonText: 'OK',
            customClass: 'my-sweetalert'
          }).then(() => {
            this.AddNewUserDialogShow = true;
          })
      } else {
        this.$swal.fire(
          {
            text: '',
            title: `使用者 ${this.NewUser.UserName}-新增成功`,
            icon: 'success',
            showCancelButton: false,
            confirmButtonText: 'OK',
            customClass: 'my-sweetalert'
          })
      }
      this.DownloadUsers();

    }
  },
}
</script>
<style lang="scss" scoped>
.user-manager {
  .permission-drawer {
    :deep(.el-drawer__header) {
      margin-bottom: 0;
      padding: 16px 20px;
      border-bottom: 1px solid #e4e7ed;
    }

    .drawer-header {
      display: flex;
      flex-direction: column;
      align-items: center;

      h4 {
        font-size: 22px;
        color: #303133;
        margin: 0 0 8px 0;
      }

      .user-name {
        font-size: 21px;
        color: #409eff;
        font-weight: bold;
      }
    }
  }
}
</style>