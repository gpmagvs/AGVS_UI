<template>
  <div class="home-view-header fixed-top text-light">
    <div class="agv-name bg-primary d-flex justify-content-center">
      <div class="w-25 border">
        <span>GPM AGV</span>
      </div>
      <div class="w-25 border">
        <span>{{ AGVName }}</span>
      </div>
      <div class="w-25 border">
        <span v-text="UserName"></span>
      </div>
      <div class="w-25 border bg-info" @dblclick="HandleAppVersionClick" @contextmenu="HandleVersionDivContextMenu">
        <span v-text="APPVersion"></span>
      </div>
    </div>
    <BatteryGroupVue></BatteryGroupVue>
  </div>
</template>

<script>
import { AGVStatusStore, UserStore } from '@/store'
import BatteryGroupVue from '@/components/Battery/BatteryGroup.vue'
export default {

  components: {
    BatteryGroupVue,
  },
  data() {
    return {
    }
  },
  computed: {
    AGVName() {
      return AGVStatusStore.getters.AGVName;
    },
    APPVersion() {
      return AGVStatusStore.getters.AGVStatus.APPVersion;
    },
    UserName() {
      return UserStore.getters.CurrentUserName
    },

  },
  methods: {
    HandleAppVersionClick() {
      this.$swal.fire({
        title: 'VERSION INFORMATION',
        text: 'version\r\n<br></br>version'
      })
    },
    HandleVersionDivContextMenu(event){
      
    }
  },
  mounted() {

  },
}
</script>

<style lang="scss" >
.home-view-header {
  .agv-name {
    font-weight: 900;
    font-size: 20px;
    letter-spacing: 2px;
    font-family: Verdana, Geneva, Tahoma, sans-serif;
  }
}
</style>