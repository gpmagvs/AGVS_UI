<template>
  <div class="map-right-click-menu">
    <button v-if="agvState.OnlineStatus==1" :disabled="isAGVDown" @click="OfflineRequest">下線</button>
    <button v-else :disabled="isAGVDown" @click="OnlineRequest">上線</button>
    <button @click="InitVehicle">初始化</button>
    <button @click="AlarmReset">異常復歸</button>
    <button @click="EMO">EMO</button>
    <button @click="RemoveCarrierID">移除卡匣</button>
    <button @click="EMO">定位</button>
    <button @click="OpenMaintainPage()">車輛保養</button>
    <button class="text-danger" @click="UnregisterFromNetwork()">解除路網註冊</button>
    <!-- <span class="text-light">{{ agvState }}</span> -->
  </div>
</template>
  

<script>
import { agv_states_store } from '@/store';
import { EmuAPI, OnlineRequest, OfflineRequest, UnregisterFromNetwork } from '@/api/VMSAPI';
import { EMO, Initialize, RemoveCargoID, AlarmReset } from '@/api/VehicleAPI'
export default {
  props: {
    agvName: {
      type: String,
      default: ""
    },
  },
  computed: {
    agvState() {
      return agv_states_store.state.agv_states.find(agv => agv.AGV_Name == this.agvName);
    },
    agvHost() {
      if (!this.agvState)
        return 'http://localhost:7025'
      return `http://${this.agvState.IP}:${this.agvState.Port}`
    },
    isSimulation() {
      if (!this.agvState)
        return true;
      return this.agvState.Simulation;
    },
    isAGVDown() {
      if (!this.agvState)
        return true;
      return this.agvState.MainStatus == 3;
    }
  },
  methods: {
    async InitVehicle() {
      if (this.isSimulation) {
        await EmuAPI.Initialize(this.agvName);
      } else {
        try {
          await Initialize(this.agvHost)
        } catch (error) {
          this.HandleAPIRequstError(error);
        } finally {

        }
      }
    },
    async AlarmReset() {
      if (this.isSimulation) {
        await EmuAPI.Initialize(this.agvName);
      } else {
        try {
          await AlarmReset(this.agvHost)
        } catch (error) {
          this.HandleAPIRequstError(error);
        } finally {

        }
      }
    },
    async EMO() {
      if (this.isSimulation) {
        await EmuAPI.EMO(this.agvName);
      } else {
        try {
          await EMO(this.agvHost)
        } catch (error) {
          this.HandleAPIRequstError(error);
        } finally {

        }
      }
    },
    async RemoveCarrierID() {
      if (this.isSimulation) {
        await EmuAPI.RemoveCargo(this.agvName);
      } else {
        try {
          await RemoveCargoID(this.agvHost)
        } catch (error) {
          this.HandleAPIRequstError(error);
        }
        finally {

        }
      }
    },
    OnlineRequest() {
      OnlineRequest(this.agvName);
    },
    OfflineRequest() {
      OfflineRequest(this.agvName);
    },
    OpenMaintainPage() {
      this.$router.push(`/vehicle?tab=1`)
    },
    HandleAPIRequstError(error) {
      this.$swal.fire(
        {
          text: '',
          title: error.message,
          icon: 'error',
          showCancelButton: false,
          confirmButtonText: 'OK',
          customClass: 'my-sweetalert'
        })
    },
    async UnregisterFromNetwork() {
      this.$swal.fire({
        text: `確定要解除[${this.agvName}]路網註冊嗎？`,
        title: '',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: '確定',
        customClass: 'my-sweetalert'
      }).then(async (res) => {
        if (res.isConfirmed) {
          try {
            await UnregisterFromNetwork(this.agvName);
          } catch (error) {
            this.$swal.fire({
              text: error.message,
              title: '',
              icon: 'error',
              showCancelButton: false,
              confirmButtonText: 'OK',
              customClass: 'my-sweetalert'
            })
          }
        }
      })
    }

  },
}
</script>

<style lang="scss">
</style>