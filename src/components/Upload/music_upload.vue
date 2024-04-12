<template>
    <div class="d-flex">
        <el-upload
            class="upload-music"
            ref="upload"
            :action="action_api"
            :file-list="fileList"
            :auto-upload="false"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError">
            <el-button ref="select_file" type="primary">選擇音檔</el-button>
        </el-upload>
        <el-button id="upload-button" @click="submitUpload">上傳</el-button>
    </div>
</template>
<script>
import param from '@/gpm_param'

export default {
    data() {
        return {
            fileList: [],
            uploaded_cnt: 0,
            percent: 0,
        }
    },
    props: {
        music_type: {
            type: String,
            default: 'Action'
        },
    },
    computed: {
        action_api() {
            return `${param.backend_host}/api/Sounds/UploadMusicFile?sound=${this.music_type}`
        },

    },
    methods: {
        submitUpload() {
            this.uploaded_cnt = 0;
            this.$refs.upload.submit();
        },
        handleUploadSuccess(response, file, fileList) {
            this.uploaded_cnt += 1;
            this.percent = this.uploaded_cnt / this.fileList.length & 100
            var success = response.success
            var message = response.message
            this.$swal.fire(
                {
                    title: `${message}`,
                    icon: success ? 'success' : 'error',
                    showCancelButton: false,
                    confirmButtonText: 'OK',
                    customClass: 'my-sweetalert'
                })
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
<style></style>