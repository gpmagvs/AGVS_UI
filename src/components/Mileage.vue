<template>
  <div class="mileage">
    <div>
      {{mileage}}
      <span>km</span>
    </div>
    <!-- <div>{{ time }}</div> -->
  </div>
</template>

<script>
import moment from 'moment'
import bus from '@/event-bus.js'
export default {
  data() {
    return {
      val: 1.23,
      time: '2022/12/12 19:00:09'
    }
  },
  computed: {
    mileage() {
      return this.val.toFixed(3)
    }
  },
  mounted() {
    bus.on('/mileage', (data) => {
      this.val = data;
    });
    setInterval(() => {
      this.time = moment(Date.now()).format('yyyy/MM/DD HH:mm:ss');
    }, 1000);
  },
}
</script>

<style lang="scss">
.mileage {
  font-size: 20px;
  span {
    font-size: smaller;
  }
}
</style>