<template>
  <div class="ec-face-collect">
    <el-row>
      <el-col :span="isAutoCollect? 24 : 14">
        <img id="previewImg" :class="{'ec-collect-img':true, 'no-margin': isAutoCollect}" :src="'data:image/jpeg;base64,' + this.previewImgData" :width="previewWidth" :height="previewHeight" alt="previewImg" :onerror="defaultImg" />
      </el-col>
      <el-col :span="8" v-if="!isAutoCollect">
        <img id="captureImg" class="ec-collect-img" :src="'data:image/jpeg;base64,' + this.imgData" :width="imgWidth" :height="imgHeight" alt="captureImg" :onerror="defaultImg" />
      </el-col>
    </el-row>
    <div class="ec-collect-msg">{{collectMsg}}</div>
    <template v-if="!isAutoCollect">
      <el-button type="primary" size="mini" @click="openCamera" :disabled="openCameraBtnDisable">打开设备</el-button>
      <el-button type="warning" size="mini" @click="closeCamera" :disabled="closeCameraBtnDisable">关闭设备</el-button>
      <el-button type="success" size="mini" @click="handeCollect" :disabled="captureBtnDisable">图像采集</el-button>
    </template>
  </div>
</template>
<script>
import { EcFaceWs } from "@/utils/biosdk/face/CameraHelperWS";
export default {
  name: "FaceCollect",
  data() {
    return {
      // 采集提示消息
      collectMsg: null,
      // 预览图片
      previewImgData: null,
      // 图片Base64
      imgData: null,
      // 禁用打开设备按钮
      openCameraBtnDisable: false,
      // 禁用关闭设备按钮
      closeCameraBtnDisable: true,
      // 禁用采集按钮
      captureBtnDisable: true
    }
  },
  props: {
    // 预览宽度
    previewWidth: {
      type: Number,
      default: 180
    },
    // 预览高度
    previewHeight: {
      type: Number,
      default: 180
    },
    // 图片宽度
    imgWidth: {
      type: Number,
      default: 135
    },
    // 图片高度
    imgHeight: {
      type: Number,
      default: 180
    },
    // 是否模板照
    isTemplateImg: {
      type: Boolean,
      default: true
    },
    // 模板照图片
    value: {
      type: String,
      default: null
    },
    // 是否自动采集
    isAutoCollect: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    defaultImg() {
      return (
        'this.src="' + require("@/assets/image/auth-face.png") + '"'
      );
    }
  },
  created() {
    this.imgData = this.value
    this.initConnect();
  },
  beforeDestroy() {
    this.closeCamera();
    this.disConnect();
  },
  methods: {
    // 初始化人脸采集websocket服务连接
    initConnect() {
      EcFaceWs.connect(() => {
        this.collectMsg = "人脸采集服务连接成功！"
        console.log('人脸采集服务连接成功！')
        // 自动采集
        if (this.isAutoCollect) {
          this.openCamera();
        }
      }, () => {
        this.collectMsg = "人脸采集服务连接失败，请检查是否安装插件！"
        console.log('人脸采集服务连接失败！')
      });
    },
    // 断开人脸采集websocket服务
    disConnect() {
      EcFaceWs.disconnect();
    },
    // 采集人脸
    handeCollect() {
      this.checklive();
    },
    // 打开摄像头
    openCamera() {
      EcFaceWs.openCam(() => {
        this.openCameraBtnDisable = true
        this.closeCameraBtnDisable = false
        this.captureBtnDisable = false
        this.collectMsg = "摄像头已打开, 请采集人脸..."
        EcFaceWs.previewImg((data) => {
          this.previewImgData = data;
        });
        // 自动采集
        if (this.isAutoCollect) {
          this.checklive();
        }
      }, (errCode, errMsg) => {
        if (errCode == -11) {
          this.openCameraBtnDisable = true
          this.closeCameraBtnDisable = false
          this.captureBtnDisable = false
          this.collectMsg = "摄像头已打开, 请采集人脸..."
          EcFaceWs.previewImg((data) => {
            this.previewImgData = data;
          });
          // 自动采集
          if (this.isAutoCollect) {
            this.checklive();
          }
          return
        }
        this.collectMsg = `${errCode}:${errMsg}`
        this.openCameraBtnDisable = false
        this.closeCameraBtnDisable = true
        this.captureBtnDisable = true
      });
    },
    // 关闭设备
    closeCamera() {
      EcFaceWs.closeCam(() => {
        this.collectMsg = "摄像头已关闭"
        this.openCameraBtnDisable = false
        this.closeCameraBtnDisable = true
        this.captureBtnDisable = true
      });
    },
    // 执行检活
    checklive() {
      this.captureBtnDisable = true
      this.collectMsg = "人脸采集中..."
      EcFaceWs.faceCheck((data) => {
        this.imgData = data
        this.captureBtnDisable = false
        this.collectMsg = "人脸图像采集成功！"
        this.$emit("input", data);
        this.$emit("collect-result", true);
        // 自动采集
        if (this.isAutoCollect) {
          this.closeCamera();
        }
      }, (errCode, errMsg) => {
        this.collectMsg = `${errCode}:${errMsg}`
        this.$emit("collect-result", false);
      });
    }
  }
};
</script>
<style lang="scss" scoped>
.ec-collect-img {
  background-color: rgb(60, 67, 91);
  border: 1px solid rgb(60, 67, 91);
  margin-right: 0 !important;
}
.ec-collect-msg {
  line-height: 30px;
}
</style>
