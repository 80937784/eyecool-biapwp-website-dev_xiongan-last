<template>
  <div class="component-upload-file">
    <el-upload
            ref="upload"
            :headers="headers"
            :action="uploadUrl"
            :accept="accept"
            :name="name"
            :auto-upload="false"
            :multiple="false"
            :on-success="handleUploadSuccess"
            :before-upload="handleBeforeUpload"
            :on-change="handleUploadChange"
            :on-remove="handleUploadRemove"
            :on-error="handleUploadError"
            :show-file-list="drag"
            :drag="drag"
            :data="attachData"
            :list-type="drag ? '' : 'picture-card'"
            style="display: inline-block; vertical-align: top">
            <i v-if="drag" class="el-icon-upload"></i>
            <div v-if="drag" class="el-upload__text">
              将文件拖到此处，或
              <em>点击上传</em>
            </div>
            <div slot="tip" v-if="tip" class="el-upload__tip">{{tip}}</div>
            <template v-if="!drag">
              <div style="width:100%; height:100%;">
                <img v-if="value" :src="'data:image/jpg;base64,'+ value" class="avatar" />
                <i v-else class="el-icon-plus avatar-uploader-icon"></i>
              </div>
            </template>
        
    </el-upload>
  </div>
</template>

<script>
import { getToken } from "@/utils/auth";
const Base64 = require('js-base64').Base64
export default {
  components: {},
  data() {
    return {
      uploadFileList:[]
    };
  },
  computed: {
    uploadUrl() {
      return process.env.VUE_APP_BASE_API + this.uploadPath // 上传的文件服务器地址
    },
    headers() {
      return  {
        Authorization: "Bearer " + getToken(),
        ClientCredential: "Basic " + Base64.encode(this.clientCredential)
      }
    },
  },
  props: {
    drag: {
      type: Boolean,
      default: false
    },
    name:{
      type: String,
      default: 'file'
    },
    accept:{
      type: String,
      default:'',
    },
    uploadPath: {
      type: String,
      default: '/common/upload',
    },
    imgFile:{
      type: Boolean,
      default: true
    },
    tip:{
      type: String,
      default: ''
    },
    value: {
      type: String,
      default: "",
    },
    showFailInfo: {
      type: Boolean,
      default: true
    },
    attachData: {
      type: Object,
      default: _ => {
        return {}
      }
    }
  },
  methods: {
    /**上传成功回调 */
    handleUploadSuccess(res, file, fileList) {
      this.loading.close();
      if(res.code == 200){
         this.$emit('success', res)
      } else{
        if(this.showFailInfo){
          let errmsg = res.msg ? res.msg : '导入失败'
          this.$alert(errmsg, "导入结果",{ dangerouslyUseHTMLString: true });
        }
        this.$emit('fail', res)
      }
      this.cancel();
    },
    /**上传之前回调 */
    handleBeforeUpload() {
      this.loading = this.$loading({
        lock: true,
        text: "上传中",
        background: "rgba(0, 0, 0, 0.7)",
      });
    },
    /**上传错误 */
    handleUploadError() {
      this.uploadedFiles = [];
      this.$message({
        type: "error",
        message: "上传失败",
      });
      this.$emit('fail');
      this.loading.close();
    },
    /**上传改变回调 */
    handleUploadChange(file, fileList) {
      // 验证文件数量，替换后仅保留第一个文件
      if (fileList.length > 1) {
        fileList.splice(0, 1);
      }
      if (!this.imgFile) {
        this.$emit("input", file ? file.name : null);
        return;
      }
      this.getBase64(file.raw).then((res) => {
        const params = res.split(",");
        if (params.length > 0) {
          this.$emit("input", params[1]);
        } else {
          this.$emit("input", null);
        }
        this.$refs.upload.clearFiles();
      });
    },
    /**移除上传文件回调 */
    handleUploadRemove(file, fileList) {
      this.cancel();
    },
    // 获取图片转base64
    getBase64(file) {
      return new Promise(function (resolve, reject) {
        const reader = new FileReader()
        let imgResult = ''
        reader.readAsDataURL(file)
        reader.onload = function () {
          imgResult = reader.result
        }
        reader.onerror = function (error) {
          reject(error)
        }
        reader.onloadend = function () {
          resolve(imgResult)
        }
      })
    },
    /** 手动提交上传 */
    submit() {
      this.$refs.upload.submit();
    },
    /** 取消上传 */
    cancel() {
      this.$refs.upload.clearFiles();
      this.$emit("input", null);
    },
  },
};
</script>

<style scoped lang="scss">
.avatar {
  width: 100%;
  height: 100%;
}
</style>