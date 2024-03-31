<template>
  <div class="my-2 py-1 border-bottom d-flex flex-row">
    <!-- Set a button that invokes selecting an image -->

    <el-button type="button" @click="()=>{
      $refs.fileInput.click();
    }">選擇圖片</el-button>
    <input
      type="file"
      ref="fileInput"
      @change="selectFile"
      accept="image/jpg, image/jpeg, image/png, image/gif"
      style="display: none;"
    />
    <el-button>Reset</el-button>
    <el-button>Clear</el-button>
    <span class="flex-fill"></span>
    <el-button @click="getResult" type="primary">裁剪</el-button>
  </div>
  <div class>
    <VuePictureCropper
      :boxStyle="{
        width: '100%',
        height: '100%',
        backgroundColor: '#f8f8f8',
        margin: 'auto',
      }"
      :img="pic"
      :options="{
        viewMode: 0,
        dragMode: 'crop',
        
      }"
      @ready="ready"
    />
    <!-- Crop result preview -->
    <div v-if="result.dataURL && result.blobURL">
      <el-divider></el-divider>
      <div class="w-100">
        <el-button @click="UseCropedImgClick" class="text-end">確定使用此圖片</el-button>
      </div>
      <el-slider
        :min="0.1"
        :max="1"
        :step="0.05"
        v-model="previewImgScale"
        @change="OnPreviewImgSliderChanged"
      ></el-slider>
      {{result.blobURL}}
      <div class="preview">
        <img v-bind:style="previewImgStyle" :src="result.blobURL" />
      </div>
    </div>
  </div>
</template>
  
  <script>
import VuePictureCropper, { cropper } from 'vue-picture-cropper'

export default {
  components: {
    VuePictureCropper,
  },
  props: {
    pic_used: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      pic: "/images/eq-icon.png",
      ori_pic: '',
      result: {
        dataURL: '',
        blobURL: '',
        file: undefined
      },
      previewImgScale: 0.5,
      previewImgStyle: {
        transform: 'scale(0.5)',
        transformOrigin: 'top left'
      },
      uploadFile: undefined
    }
  },
  watch: {
    pic_used(newInput, old) {
      console.log(newInput, old)

    }
  },
  methods: {
    UseCropedImgClick() {
      this.$emit('onCropDone', this.result)
    },
    ready() {

    },
    crop() {
      cropper.crop()

    },
    OnPreviewImgSliderChanged() {
      this.previewImgStyle.transform = `scale(${this.previewImgScale})`
    },
    async getResult() {
      if (!cropper) return
      const base64 = cropper.getDataURL()
      const blob = await cropper.getBlob()
      if (!blob) return

      const file = await cropper.getFile({
        fileName: this.uploadFile.name.split(".")[0],
      })

      console.log({ base64, blob, file })
      this.result.dataURL = base64
      this.result.blobURL = URL.createObjectURL(blob)
      this.result.file = file
    },
    selectFile(e) {
      // Reset last selection and results
      this.pic = ''
      this.result.dataURL = ''
      this.result.blobURL = ''

      // Get selected files
      const { files } = e.target
      if (!files || !files.length) return

      // Convert to dataURL and pass to the cropper component
      const file = files[0]
      debugger
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        this.uploadFile = file;
        // Update the picture source of the `img` prop
        this.pic = String(reader.result)
        // Clear selected files of input element
        if (!this.$refs.uploadInput) return
        this.$refs.uploadInput.value = ''
      }
    },
  },

}
  </script>
  
  <style>
</style>