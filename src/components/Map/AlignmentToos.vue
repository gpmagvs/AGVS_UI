<template>
  <div class="align-tool border">
    <i class="bi bi-three-dots-vertical"></i>
    <button @click="alignDown" class="btn align-btn" aria-label="向上">
      <i class="bi bi-align-top"></i>
    </button>
    <button @click="alignUp" class="btn align-btn" aria-label="向下">
      <i class="bi bi-align-bottom"></i>
    </button>
    <button @click="alignLeft" class="btn align-btn" aria-label="靠左">
      <i class="bi bi-align-start"></i>
    </button>
    <button @click="alignRight" class="btn align-btn" aria-label="靠右">
      <i class="bi bi-align-end"></i>
    </button>
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
    /**coordination|router */
    map_display_mode: {
      type: String,
      default: 'coordination'
    }
  },
  computed: {
    firstFeatureData() {
      return this.selectedFeatures[0].get('data');
    },

    minX() {
      return Math.min(...this.selectedFeatures.map(feature => {
        const data = feature.get('data');
        return this.map_display_mode === 'coordination' ? data.X : data.Graph.X; // 根據模式選擇
      })); // 計算所有元素的最小 X
    },
    maxX() {
      return Math.max(...this.selectedFeatures.map(feature => {
        const data = feature.get('data');
        return this.map_display_mode === 'coordination' ? data.X : data.Graph.X; // 根據模式選擇
      })); // 計算所有元素的最大 X
    },
    minY() {
      return Math.min(...this.selectedFeatures.map(feature => {
        const data = feature.get('data');
        return this.map_display_mode === 'coordination' ? data.Y : data.Graph.Y; // 根據模式選擇
      })); // 計算所有元素的最小 Y
    },
    maxY() {
      return Math.max(...this.selectedFeatures.map(feature => {
        const data = feature.get('data');
        return this.map_display_mode === 'coordination' ? data.Y : data.Graph.Y; // 根據模式選擇
      })); // 計算所有元素的最大 Y
    },
  },
  methods: {
    alignDown() {
      const maxY = this.maxY;
      this.selectedFeatures.forEach(feature => {
        const data = feature.get('data');
        if (this.map_display_mode === 'coordination') {
          data.Y = maxY; // Align to max Y
        } else {
          data.Graph.Y = maxY; // 其他模式的對齊邏輯
        }
        feature.set('data', data);
      });
      console.log('Aligning Down');
      this._InvokeRestorePt();
    },
    alignUp() {
      const minY = this.minY;
      this.selectedFeatures.forEach(feature => {
        const data = feature.get('data');
        if (this.map_display_mode === 'coordination') {
          data.Y = minY; // Align to min Y
        } else {
          data.Graph.Y = minY; // 其他模式的對齊邏輯
        }
        feature.set('data', data);
      });
      console.log('Aligning Up');
      this._InvokeRestorePt();
    },
    alignLeft() {
      const minX = this.minX;
      this.selectedFeatures.forEach(feature => {
        const data = feature.get('data');
        if (this.map_display_mode === 'coordination') {
          data.X = minX; // Align to min X
        } else {
          data.Graph.X = minX; // 其他模式的對齊邏輯
        }
        feature.set('data', data);
      });
      console.log('Aligning Left');
      this._InvokeRestorePt();
    },
    alignRight() {
      const maxX = this.maxX;
      this.selectedFeatures.forEach(feature => {
        const data = feature.get('data');
        if (this.map_display_mode === 'coordination') {
          data.X = maxX; // Align to max X
        } else {
          data.Graph.X = maxX; // 其他模式的對齊邏輯
        }
        feature.set('data', data);
      });
      console.log('Aligning Right');
      this._InvokeRestorePt();
    },
    _InvokeRestorePt() {
      bus.emit('restore_points_by_multi_point_changed');
    }
  }
}
</script>

<style scoped>
.align-tool {
  display: flex; /* 使用 flexbox 進行排列 */
  gap: 1px; /* 按鈕之間的間距 */
  border-radius: 3px;
  background-color: white;
}

.align-btn {
  transition: background-color 0.3s; /* 添加過渡效果 */
}

.align-btn:hover {
  background-color: rgb(13, 110, 253); /* hover 時的背景顏色 */
  color: white; /* 可選：改變文字顏色以提高可讀性 */
}
</style>
