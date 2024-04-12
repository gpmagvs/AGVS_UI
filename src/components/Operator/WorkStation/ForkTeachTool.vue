<template>
  <div class="teach-tool">
    <el-dialog width="50%" :modal="false" draggable v-model="show" :title="title_">
      <div style="position:relative; top:-41px">
        <div class="border-bottom my-2 text-start">
          <div class="d-flex">
            <div>
              <div class="height-text">{{ input_label_text }}</div>
              <input id="teach-val-input" v-model="input_sum" @change="HandleInputChanged" />
            </div>
            <div class="mx-3" v-if="!is_modify_tagNumber">
              <div class="height-text">Pose</div>
              <div class="goal-val">{{ goal.pose }}</div>
            </div>
          </div>
          <el-button @click="HandleForkMoveBtnClick" type="primary">{{ $t('Move Fork There') }}</el-button>
        </div>
        <div class>
          <SimpleKeyboardVue KeyboardVue keyboard_type="number" @onKeyPress="KeyboardInputChanged"></SimpleKeyboardVue>
          <div class="text-start border-top py-2">
            <div class="d-flex">
              <h6>牙叉位置調整</h6>
              <span class="mx-3">
                <span>當前高度:</span>
                {{ current_position }}
                <span>cm</span>
              </span>
            </div>
            <div class="d-flex">
              <div class="button-group d-flex p-1">
                <el-button @click="ForkAction('home')">Home</el-button>
                <el-button @click="ForkAction('stop')" type="danger">STOP</el-button>
              </div>
              <div>
                <div class="button-group d-flex p-1">
                  <el-button @click="ForkPositionAdjust(0.1)">+1mm</el-button>
                  <el-button @click="ForkPositionAdjust(0.5)">+5mm</el-button>
                  <el-button @click="ForkPositionAdjust(-0.1)">-1mm</el-button>
                  <el-button @click="ForkPositionAdjust(-0.5)">-5mm</el-button>
                </div>
                <div class="button-group d-flex p-1">
                  <el-button @click="ForkPositionAdjust(1)">+1cm</el-button>
                  <el-button @click="ForkPositionAdjust(5)">+5cm</el-button>
                  <el-button @click="ForkPositionAdjust(-1)">-1cm</el-button>
                  <el-button @click="ForkPositionAdjust(-5)">-5cm</el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import SimpleKeyboardVue from '@/components/Tools/SimpleKeyboard.vue';
import { ForkAPI } from '@/api/VMSAPI.js'
import { AGVStatusStore } from '@/store';
export default {
  components: {
    SimpleKeyboardVue,
  },
  data() {
    return {
      show: false,
      number: 0.0,
      input_sum: '',
      title_: '',
      goal: {
        tag: 0,
        layer: 0,
        pose: 0,
        value: 0
      }
    }
  },
  watch: {
    input_sum: {
      immediate: true,
      deep: true,
      handler(newValue, oldValue) {
        var num = parseFloat(newValue + '')
        if (!isNaN(num)) {
          this.number = num
          this.goal.value = num
          this.$emit('onValueChanged', this.goal)

          if (this.is_modify_tagNumber)
            this.goal.tag = num
        }
      }
    }
  },
  computed: {
    input_label_text() {
      return this.is_modify_tagNumber ? 'Tag Number' : 'HEIGHT'
    },
    is_modify_tagNumber() {
      return this.goal.pose == undefined
    },
    title_() {

      return 'Tag ' + (this.is_modify_tagNumber ? this.goal.tag : this.goal.tag + '-Layer ' + this.goal.layer);
    },
    current_position() {
      return AGVStatusStore.getters.ForkHeight
    }
  },
  methods: {
    Show(info) {
      this.goal = info
      this.input_sum = this.goal.value + ''
      this.number = this.goal.value
      this.show = true
    },
    HandleForkMoveBtnClick() {
      this.$swal.fire(
        {
          text: '請確認牙叉上方/下方是否有障礙物!',
          title: '確定要將牙叉移動至此位置?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'OK',
          customClass: 'my-sweetalert'
        }).then(res => {
          if (res.isConfirmed) {
            setTimeout(async () => {
              var response = await ForkAPI.Action('pose', this.number, 1)
              if (!response.confirm) {
                this.$swal.fire(
                  {
                    text: '',
                    title: response.message,
                    icon: 'error',
                    showCancelButton: false,
                    confirmButtonText: 'OK',
                    customClass: 'my-sweetalert'
                  })
              }
            }, 100);

          }
        })
    },
    async ForkPositionAdjust(position_delta) {
      //confirm = result.success, message = result.message 
      var response = await ForkAPI.Action('increase', position_delta, 1)
      if (!response.confirm) {
        this.$swal.fire(
          {
            text: '',
            title: response.message,
            icon: 'error',
            showCancelButton: false,
            confirmButtonText: 'OK',
            customClass: 'my-sweetalert'
          })
      }
    },
    async ForkAction(action) {
      if (action == 'home') {
        this.$swal.fire(
          {
            text: '',
            title: '確定要將牙叉移至Home點?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'OK',
            customClass: 'my-sweetalert'
          }).then(async (ret) => {
            if (!ret.isConfirmed)
              return;
            await ForkAPI.Action(action)
          })
      } else {
        await ForkAPI.Action(action)
      }
    },
    HandleInputChanged() {

    },
    KeyboardInputChanged(e) {
      if (e == 'back') {

        var remain_char_num = this.input_sum.length - 1;
        this.input_sum = this.input_sum.substring(0, remain_char_num)
        if (this.input_sum == '')
          this.input_sum = '0'
      } else {
        if (this.is_modify_tagNumber && e == '.')
          return;
        if (this.input_sum == '0')
          this.input_sum = ''
        this.input_sum += e;
      }

    }
  },
}
</script>

<style lang="scss" scoped>
.teach-tool {
  .height-text {
    font-weight: 500;
    font-size: 20px;
  }

  .height-text,
  #teach-val-input {
    margin: 5px;
  }

  .goal-val {
    color: grey;
  }

  .goal-val,
  #teach-val-input {
    font-size: 40px;
  }

  #teach-val-input {
    text-align: left;
    height: 56px;
    width: 200px;
    text-align: left;
    border-radius: 4px;
    background-color: aliceblue;
    border: 2px solid grey;
  }

  .button-group {
    button {
      width: 60px;
    }
  }
}
</style>