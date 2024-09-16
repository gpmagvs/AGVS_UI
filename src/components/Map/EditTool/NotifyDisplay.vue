<template>
  <div class="map-notify">
    <el-alert
      class="notify-text"
      v-if="EditorOption.EditAction == 'add-station'"
      title="使用滑鼠[右鍵]點擊地圖新增點位"
      type="success"
      :closable="false"
    />
    <el-alert
      class="notify-text"
      v-if="EditorOption.EditAction == 'edit-station'"
      title="使用滑鼠[右鍵]選擇欲編輯之點位"
      type="success"
      :closable="false"
    />
    <el-alert
      class="notify-text"
      v-if="EditorOption.EditAction == 'remove-station'"
      title="使用滑鼠[左鍵]選擇欲刪除之點位"
      type="error"
      :closable="false"
    />
    <el-alert
      class="notify-text"
      v-if="EditorOption.EditAction == 'add-path' && EditorOption.AddPathMode.Direction == 'one-direction'"
      title="使用滑鼠[左鍵]點擊地圖上任意兩個點位以新增一條單行道"
      type="success"
      :closable="false"
    />
    <el-alert
      class="notify-text"
      v-if="EditorOption.EditAction == 'add-path' && EditorOption.AddPathMode.Direction == 'bi-direction'"
      title="使用滑鼠[左鍵]點擊地圖上任意兩個點位以新增一條雙向道"
      type="success"
      :closable="false"
    />
    <el-alert
      class="notify-text"
      v-if="EditorOption.EditAction == 'edit-path'"
      title="使用滑鼠[右鍵]選擇欲編輯之路徑"
      type="success"
      :closable="false"
    />
    <el-alert
      class="notify-text"
      v-if="EditorOption.EditAction == 'remove-path'"
      title="使用滑鼠[左鍵]選擇欲刪除之路徑"
      type="error"
      :closable="false"
    />
    <el-alert
      class="notify-text"
      v-if="EditorOption.EditAction == 'add-forbid-region'"
      :title="`使用滑鼠[左鍵/右鍵]在地圖上繪製[${EditorOption.AddRegionMode.Mode == 'forbid' ? '禁制' : '通行'}]區(按下[ESC]可取消繪製)`"
      type="success"
    />
    <el-alert
      class="notify-text"
      v-if="EditorOption.EditAction == 'edit-forbid-region'"
      title="使用滑鼠[左鍵]在地圖上選取欲編輯之管制區)"
      type="success"
    />
    <el-alert
      class="notify-text"
      v-if="EditorOption.EditAction == 'remove-forbid-region'"
      title="使用滑鼠[左鍵]在地圖上點擊欲刪除之管制區"
      type="error"
    />
    <el-alert
      class="notify-text"
      v-if="DragBackgroundImageMode"
      title="使用滑鼠[右鍵]點擊並拖曳背景圖片進行位置調整"
      type="error"
    />
  </div>
</template>

<script>
export default {
  props: {
    DragBackgroundImageMode: {
      type: Boolean,
      default: false
    },
    EditorOption: {
      type: Object,
      default() {
        return {
          // EditMode: 'view',
          EditMode: 'edit',
          EditAction: 'none',
          AddPathMode: {
            Direction: 'one-direction'
          },
          AddRegionMode: {
            Mode: 'forbid' //forbid;passible
          }
        }
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.map-notify {
  .notify-text {
    ::v-deep .el-alert__title {
      font-size: 20px;
      letter-spacing: 2px;
    }
  }
}
</style>