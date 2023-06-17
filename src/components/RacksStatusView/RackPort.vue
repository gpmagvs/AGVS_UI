<template>
  <div class="rack-port rounded">
    <div class="bg-primary text-light border-bottom">{{ PortNameDisplay}}</div>
    <div class="item">
      <div class="title">Carrier ID</div>
      <div class="values d-flex">
        <el-input type="text" disabled size="small" v-model="port_info.CstID"></el-input>
        <el-tooltip placement="top-start" content="複製到剪貼簿">
          <i
            v-if="port_info.CstID!=''"
            @click="CopyText(port_info.CstID)"
            class="copy-button copy-icon bi bi-clipboard"
          ></i>
        </el-tooltip>
      </div>
    </div>
    <div class="item">
      <div class="title">Exist Sensor</div>
      <div class="values d-flex">
        <div class="exist-sensor round my-1" v-bind:style="{backgroundColor:'rgb(255, 50, 0)'}"></div>
        <div class="exist-sensor round my-1 mx-3" v-bind:style="{backgroundColor:'lime'}"></div>
      </div>
      <!-- <div class="values">{{ port_info.CstExist }}</div> -->
    </div>
    <div class="item">
      <div class="title">Install Time</div>
      <div class="values">2023/10/20 19:33:33</div>
    </div>
    <div class="item">
      <div class="title"></div>
      <div class="values">BBB</div>
    </div>
    <div class="item">
      <el-button
        ref="modify_btn"
        @click="CstIDEditHandle"
        class="m-1 w-100"
        size="small"
      >{{ModifyButtonText}}</el-button>
    </div>
  </div>
</template>

<script>
import Clipboard from 'clipboard'
import { ElNotification, ElMessage, ElMessageBox } from 'element-plus'

export default {
  props: {
    rack_name: {
      type: String,
      default: ""
    },
    port_info: {
      type: Object,
      default() {
        return {
          Name: '7',
          Index: 0,
          CstExist: true
        }
      }
    },
  },
  computed: {
    PortNameDisplay() {
      return `${this.rack_name}-${this.port_info.Index} (Port ${this.port_info.Index})`
    },
    ModifyButtonText() {
      return this.port_info.CstID != '' ? '修改帳籍' : '新增帳籍';
    }
  },
  methods: {
    CstIDEditHandle() {
      ElMessageBox.prompt('Carrier ID', {
        title: `${this.ModifyButtonText} : ${this.PortNameDisplay}`,
        draggable: true,
        inputValue: this.port_info.CstID,
        type: 'warning'

      }).then((msg_data) => {
        console.info(msg_data)
        this.port_info.CstID = msg_data.value
      }).catch(() => {

      })
    },
    CopyText(text) {
      const clipboard = new Clipboard('.copy-button', {
        text: () => text
      });
      clipboard.on('success', () => {
        ElNotification({
          title: text,
          message: "已複製到剪貼簿",
          duration: 1500
        })
        clipboard.destroy();
      });

      clipboard.on('error', () => {
        clipboard.destroy();
      });
    }
  },
}
</script>

<style lang="scss">
.rack-port {
  width: 300px;
  height: 175px;
  //   background-color: rgb(236, 236, 236);
  border: 2px solid grey;
  margin: 2px;
  .item {
    display: flex;
    flex-direction: row;
    margin: 0px;
    border-block: 1px dashed grey;
    .title {
      font-size: 14px;
      width: 40%;
      font-weight: bold;
      padding: 3px;
      text-align: start;
    }
    .values {
      text-align: center;
      text-align: center;
    }
    
    .exist-sensor {
      width: 15px;
      height: 15px;
      border: 2px solid grey;
    }
  }
}
</style>