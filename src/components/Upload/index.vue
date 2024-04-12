<template>
  <div>
    <el-upload
      class="upload-demo"
      ref="upload"
      :action="action_api"
      :on-preview="handlePreview"
      :on-remove="handleRemove"
      :file-list="fileList"
      :auto-upload="false"
      :on-success="handleUploadSuccess"
      :on-error="handleUploadError"
      multiple>
      <el-button ref="select_file" type="primary">選擇更新檔</el-button>
    </el-upload>
    <el-button id="upload-button" @click="submitUpload">上傳</el-button>
    <div>共 {{ fileList.length }}個檔案，已完成上傳 {{ uploaded_cnt }}</div>
  </div>
</template>
<script>
import param from '@/gpm_param'
export default {
  data() {
    return {
      fileList: [],
      uploaded_cnt: 0,
      percent: 0
    }
  },
  computed: {
    action_api() {
      return `${param.backend_host}/api/Upload`
    },

  },
  methods: {
    submitUpload() {
      this.uploaded_cnt = 0;
      this.$refs.upload.submit();
    },
    handleRemove(file, fileList) {
      console.log(file, fileList);
    },
    handlePreview(file) {
      console.log(file);
    },
    handleUploadSuccess(response, file, fileList) {
      this.uploaded_cnt += 1;
      this.percent = this.uploaded_cnt / this.fileList.length & 100
      //   this.$swal.fire(
      //     {
      //       text: `${response}/${fileList.length}`,
      //       title: `檔案已上傳至車載電腦 `,
      //       icon: 'success',
      //       showCancelButton: false,
      //       confirmButtonText: 'OK',
      //       customClass: 'my-sweetalert'
      //     })
    },
    handleUploadError(error, uploadFile, uploadFiles) {
      this.$swal.fire(
        {
          text: uploadFile.filename,
          title: '',
          icon: 'error',
          showCancelButton: false,
          confirmButtonText: 'OK',
          customClass: 'my-sweetalert'
        })
    }
  },
}
</script>
<style lang="scss" scoped>
#upload-button {
  position: absolute;
  top: 85px;
  right: 133px;
}
</style>