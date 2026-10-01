<template>
  <div class="ec-faceiris-collect">
    <el-row>
      <el-col :span="isAutoCollect? 24 : 14">
        <img id="previewImg" :class="{'ec-collect-img':true, 'no-margin': isAutoCollect}" :src="'data:image/jpg;base64,' + irisPreviewImg" width="332px" height="187px" style="zoom:0.8" alt="irisPreviewImg" :onerror="defaultImg" />
        <img id="previewImg" :class="{'ec-collect-img':true, 'no-margin': isAutoCollect}" :src="'data:image/jpg;base64,' + previewImgData" :width="previewWidth" :height="previewHeight" style="zoom:0.8" alt="previewImg" :onerror="defaultImg" />
      </el-col>
      <el-col :span="8" v-if="!isAutoCollect">
        <img v-if="!bioData.faceImgBase64" class="ec-collect-img" :src="'data:image/jpg;base64,'" :width="irisImgWidth" :height="irisImgHeight + faceImgHeight" alt="captureImg" :onerror="defaultImg" />
        <template v-else>
          <img class="ec-collect-img" :src="'data:image/jpg;base64,' + bioData.irisImgBase64" :width="irisImgWidth" :height="irisImgHeight" alt="captureImg" :onerror="defaultImg" />
          <img class="ec-collect-img" :src="'data:image/jpg;base64,' + bioData.faceImgBase64" :width="faceImgWidth" :height="faceImgHeight" alt="captureImg" :onerror="defaultImg" />
        </template>
      </el-col>
    </el-row>
    <div class="ec-collect-msg">{{collectMsg}}</div>
    <p style="text-align:left;font-size:14px;color:#E6A23C">提示:虹膜图像必须为非镜像图片！</p>
    <template v-if="!isAutoCollect">
      <el-button type="primary" size="mini" @click="openDev" :disabled="openCameraBtnDisable">打开设备</el-button>
      <el-button type="warning" size="mini" @click="closeDev" :disabled="closeCameraBtnDisable">关闭设备</el-button>
      <el-button type="success" size="mini" @click="handeCollect" :disabled="captureBtnDisable">图像采集</el-button>
    </template>
  </div>
</template>
<script>
import { HelperWS } from "@/utils/biosdk/faceiris/FaceIrisWS";
import axios from "axios";
export default {
  name: "FaceIrisCollect",
  mounted () {
    console.log(HelperWS);
  },
  data() {
    return {
      // 采集提示消息
      collectMsg: null,
      // 预览图片
      previewImgData: null,
      irisPreviewImg:null,
      // 生物信息
      bioData: {
        irisImgBase64: null,
        faceImgBase64: null,
        irisFeature: null,
      },
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
      default: 332
    },
    // 预览高度
    previewHeight: {
      type: Number,
      default: 332
    },
    // 图片宽度
    irisImgWidth: {
      type: Number,
      default: 180
    },
    faceImgWidth: {
      type: Number,
      default: 180
    },
    // 图片高度
    irisImgHeight: {
      type: Number,
      default: 80
    },
    faceImgHeight: {
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
      type: Object,
      default: _ => {
        return {}
      }
    },
    // 是否自动采集
    isAutoCollect: {
      type: Boolean,
      default: false
    },
    // 登录采集或注册采集
    isLoginCap: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    defaultImg() {
      return (
        'this.src="' + require("@/assets/image/faceiris.svg") + '"'
      );
    }
  },
  created() {
    this.bioData = this.value
    this.initConnect();
  },
  beforeDestroy() {
    this.closeDev();
    this.disConnect();
  },
  methods: {
    // 初始化人脸采集websocket服务连接
    initConnect() {
      HelperWS.connect(() => {
        this.collectMsg = "人脸虹膜采集服务连接成功！"
        console.log('人脸虹膜采集服务连接成功！')
        // 自动采集
        if (this.isAutoCollect) {
          this.openDev();
        }
      }, () => {
        this.collectMsg = "人脸虹膜采集服务连接失败，请检查是否安装插件！"
        console.log('人脸虹膜采集服务连接失败！')
      });
    },
    // 断开人脸采集websocket服务
    disConnect() {
      HelperWS.disconnect();
    },
    // 采集人脸
    handeCollect() {
      this.capture();
    },
    // 打开摄像头
    async openDev() {
      const res = await axios.get("config/SDKConfig.json");
      const image_rotate = res.data.image_rotate || 0;
      HelperWS.openDevice({"flip_left_right_saved":image_rotate},() => {
        this.openCameraBtnDisable = true
        this.closeCameraBtnDisable = false
        this.captureBtnDisable = false
        this.collectMsg = "摄像头已打开, 请采集人脸虹膜..."
        // HelperWS.previewImg((data) => {
        //   this.previewImgData = data;
        // });
        // 自动采集
        if (this.isAutoCollect) {
          this.capture();
        }
      }, (ret) => {
        this.collectMsg = "打开设备失败:"+ret
        this.openCameraBtnDisable = false
        this.closeCameraBtnDisable = true
        this.captureBtnDisable = true
      },(data)=> {
        const arrayData = data.split("$&");
        this.previewImgData = arrayData[0];
        this.irisPreviewImg = arrayData[2];
      });
    },
    // 关闭设备
    closeDev() {
      HelperWS.closeDevice(() => {
        this.collectMsg = "摄像头已关闭"
        this.openCameraBtnDisable = false
        this.closeCameraBtnDisable = true
        this.captureBtnDisable = true
      });
    },
    // 执行采集
    capture() {
      this.captureBtnDisable = true
      this.collectMsg = "人脸虹膜采集中..."
      // 超时时间
      const timeout = 15
    //   特征比对类型，1为单眼，2为双眼
      const eyeFlag = 2
      if(this.isLoginCap){
        HelperWS.irisFaceCapture(timeout,(data) => {
          const arrayData = data.split("$&");
          this.bioData = {
            irisImgBase64: arrayData[0],
            faceImgBase64: arrayData[2],
            irisFeature:  arrayData[1],
          }
          this.captureBtnDisable = false
          this.collectMsg = "人脸虹膜图像采集成功！"
          this.$emit("input", this.bioData);
          this.$emit("collect-result", true);
          // 自动采集
          if (this.isAutoCollect) {
            this.closeDev();
          }
        }, (error) => {
            console.log(error);
            this.collectMsg = "多模态采集失败";
            // this.collectMsg = `${errCode}:${errMsg}`
            this.$emit("collect-result", false);
        });
      }else{
        HelperWS.irisFaceEnroll(eyeFlag,timeout,(data) => {
        const arrayData = data.split("$&");
        this.bioData = {
           irisImgBase64: arrayData[0],
           faceImgBase64: arrayData[2],
           irisFeature:  arrayData[1],
        }
        this.captureBtnDisable = false
        this.collectMsg = "人脸虹膜图像采集成功！"
        this.$emit("input", this.bioData);
        this.$emit("collect-result", true);
        // 自动采集
        if (this.isAutoCollect) {
          this.closeDev();
        }
      }, (error) => {
          console.log(error);
          this.collectMsg = "多模态注册失败";
        // this.collectMsg = `${errCode}:${errMsg}`
        this.$emit("collect-result", false);
      });
      }
    },
  }
};
</script>
<style lang="scss" scoped>
.ec-collect-img {
  background-color: rgb(60, 67, 91);
  display: block;
  margin-right: 0 !important;
}
.ec-collect-msg {
  line-height: 30px;
}
</style>
