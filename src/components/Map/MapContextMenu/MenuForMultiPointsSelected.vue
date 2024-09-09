<template>
  <div class="map-right-click-menu">
    <button @click="Delete">刪除</button>
    <button @click="SetDisabled">禁用</button>
    <button @click="SetEnabled">啟用</button>
    <!-- <span class="text-light">{{ agvState }}</span> -->
  </div>
</template>
  

<script>
import { Feature } from 'ol';
import bus from '@/event-bus';
export default {
  props: {
    selectedFeatures: {
      type: Array,
      default() {
        return [new Feature()]
      }
    },
  },
  computed: {
    countOfFeatures() {
      return this.selectedFeatures.length;
    }
  },
  methods: {
    SetDisabled() {
      this.selectedFeatures.forEach(_feature => {
        var ptdata = _feature.get('data');
        ptdata.Enable = false;
        _feature.set('data', ptdata);
      });
      this._InvokeRestorePt();
    },
    SetEnabled() {
      this.selectedFeatures.forEach(_feature => {
        var ptdata = _feature.get('data');
        ptdata.Enable = true;
        _feature.set('data', ptdata);
      });
      this._InvokeRestorePt();
    },
    Delete() {
      this.$emit('onDelete')
      this.$swal.fire(
        {
          text: '',
          title: `確定要刪除[${this.countOfFeatures}]個點位?`,
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'OK',
          customClass: 'my-sweetalert'
        }).then(res => {
          if (res.isConfirmed) {
            bus.emit('delete-multi-points')
          }
        })
    },
    _InvokeRestorePt() {
      bus.emit('restore_points_by_multi_point_changed')
    }
  },
}
</script>

<style lang="scss">
</style>