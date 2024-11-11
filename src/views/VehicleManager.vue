<template>
  <div class="vehicles">
    <b-card no-body>
      <b-tabs
        v-model="activedTab"
        pills
        vertical
        justified
        nav-class="my-nav"
        content-class="my-nav-tabs"
      >
        <b-tab title="車輛列表">
          <div class>
            <VehicleListTable></VehicleListTable>
            <VehicleControlVue v-if="isDeveloperUser"></VehicleControlVue>
          </div>
        </b-tab>
        <b-tab title="維修保養">
          <div class>
            <VehicleMaintain></VehicleMaintain>
          </div>
        </b-tab>
        <b-tab title="新增車輛">
          <div class>
            <AddVehicle></AddVehicle>
          </div>
        </b-tab>
      </b-tabs>
    </b-card>
  </div>
</template>
<script>
import AddVehicle from '@/components/Vehicle/AddVehicle.vue'
import VehicleListTable from '@/components/Vehicle/VehicleListTable.vue'
import VehicleMaintain from '@/components/Vehicle/VehicleMaintain.vue'
import VehicleControlVue from '@/components/Vehicle/VehicleControl.vue'
import { userStore } from '@/store'
import { watch } from 'vue'
import { useRoute } from 'vue-router'
export default {
  components: {
    AddVehicle, VehicleMaintain, VehicleListTable, VehicleControlVue
  },
  data() {
    return {
      test: 'AV',
      activedTab: 0,
    }
  },
  computed: {
    isDeveloperUser() {
      return userStore.getters.IsDeveloperLogining
    }
  },
  methods: {
    determineActivedTab() {
      const tabAssign = this.$route.query['tab'];
      if (tabAssign) {
        this.activedTab = tabAssign;
      }
      //   alert();
    }
  },
  mounted() {
    this.determineActivedTab();
    const route = useRoute()
    watch(
      () => route.path,
      (newValue, oldValue) => {
        if (newValue == this.$route.path) {
          this.determineActivedTab();
        }
      }
    )
  },

}
</script>
<styles lang="scss" scoped>
.vehicles {
  margin-top: 20px;
  padding: 5px;

  .vehicle-nav-item {
    color: red;
  }
}
</styles>