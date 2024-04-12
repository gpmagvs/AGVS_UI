<template>
  <div class="cst-reader-view">
    <div class="opt border-bottom py-3">
      <b-button :disabled="triggering" class="mx-1" variant="primary" @click="TriggerHandle(200)">
        <span>Read Tray</span>
      </b-button>
      <b-button v-if="hasCstReader" :disabled="triggering" class="mx-1" variant="primary" @click="TriggerHandle(201)">
        <span>Read Rack</span>
      </b-button>
      <b-button :disabled="!triggering" variant="danger" @click="StopHandle">STOP</b-button>
    </div>
    <div class="p-3">
      <img ref="image" src="/tray.jpg" height="400" alt="QR Code" />
      <!-- <div class="barcode_select"></div> -->
      <div
        v-show="qrCodeValue != ''"
        v-loading="triggering"
        v-bind:class="qrCodeValue"
        class="barcode-tooltip">{{ qrCodeValue }}</div>
    </div>
    <div class="image-show">
      <img :src="imageSrc" />
    </div>
  </div>
</template>
<script>
import { TriggerCSTReaderWithCargoType, StopCSTReader } from '@/api/VMSAPI'
import { SystemSettingsStore } from '@/store'
import bus from '@/event-bus.js'
export default {
  data() {
    return {
      imageSrc: "",
      triggering: false,
      qrCodeValue: ""
    }
  },
  mounted() {
    bus.on('remove_cst', () => {
      this.qrCodeValue = '';
    })
    // setInterval(() => {
    //   this.fetchImage();
    // }, 1000);;
  },
  computed: {

    agvSettings() {
      return SystemSettingsStore.getters.Settings;
    },
    hasCstReader() {
      return this.agvSettings.HasRackCstReader
    }
  },
  methods: {
    async fetchImage() {
      try {
        var response = await fetch('http://192.168.0.103:1180/liveimage.jpg', {
          cache: 'no-store'
        })
        if (!response.ok) {
          throw new Error('network error');
        }
        const blob = await response.blob();
        this.imageSrc = URL.createObjectURL(blob);
      } catch (error) {

      }
    },
    async TriggerHandle(_type = 200) {
      this.qrCodeValue = "Triggering";
      this.triggering = true;
      var barcode = await TriggerCSTReaderWithCargoType(_type)
      if (this.triggering) {
        this.qrCodeValue = barcode;
        this.triggering = false;
      }
    },

    async StopHandle() {
      this.qrCodeValue = "";
      await StopCSTReader()
      this.triggering = false;
    }
  },
}
</script>
<style lang='scss'>
.opt {
  padding-top: 10px;

  button {
    height: 80px;
    width: 200px;
    font-size: 30px;
    font-weight: bold;
  }
}

.barcode-tooltip {
  z-index: 12;
  color: #0d6efd;
  position: relative;
  top: -225px;
  font-size: 47px;
  font-weight: bold;
  border: 3px solid white;
  background-color: white;
  opacity: 0.5;
}

.barcode_select {
  position: absolute;
  top: 288px;
  left: 419px;
  z-index: 12;
  color: white;
  border: 3px solid red;
  height: 100px;
  width: 30px;
  border-radius: 10px;
  transform: rotate(0.02turn);
}

.ERROR {
  color: red;
}

.Triggering {
  color: rgb(73, 73, 73);
  height: 80px;
}
</style>