<template>
  <div class="ec-iris-collect">
    <img class="ec-collect-img" :src="'data:image/jpeg;base64,' + imageShow" :width="imgWidth" :height="imgHeight" alt="previewImg" :onerror="defaultImg" />
    <div class="ec-collect-msg">{{collectMsg}}</div>
    <p style="text-align:left;font-size:14px;color:#E6A23C">提示:虹膜图像必须为非镜像图片！</p>
    <el-button type="primary" class="ec-collect-btn" :disabled="disabledBtn" v-if="!isAutoCollect" size="mini" @click="handeCollect">开始采集</el-button>
  </div>
</template>
<script>
import { EcIrisWs } from "@/utils/biosdk/iris/IrisHelperWS";
import axios from "axios";
export default {
  data() {
    return {
      // 采集提示消息
      collectMsg: null,
      // 图片信息
      bioData: {
        imageBase64: null,
        feature: null
      },
      imageShow:null,
      // 禁用采集按钮
      disabledBtn: false
    }
  },
  props: {
    // 图片宽度
    imgWidth: {
      type: Number,
      default: 400
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
      type: Object,
      default: _ => {
        return {
          imgBase64: null,
          feature: null
        }
      }
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
        'this.src="' + require("@/assets/image/iris-bg2.png") + '"'
      );
    }
  },
  created() {
    this.bioData = this.value;
    this.initConnect();
  },
  beforeDestroy() {
    this.disConnect();
  },
  methods: {
    // 初始化虹膜采集websocket服务连接
    initConnect() {
      EcIrisWs.connect(() => {
        this.collectMsg = "虹膜采集服务连接成功！"
        console.log('虹膜采集服务连接成功！')
        // 自动采集
        if (this.isAutoCollect) {
          this.handeCollect()
        }
      }, () => {
        this.collectMsg = "虹膜采集服务连接失败，请检查是否安装插件！"
        console.log('虹膜采集服务连接失败！')
      });
    },
    // 断开虹膜采集websocket服务
    disConnect() {
      EcIrisWs.disconnect();
    },
    // 采集虹膜
    handeCollect() {
      this.openIrisCamera();
    },
    // 打开采集摄像头
    async openIrisCamera() {
      this.disabledBtn = true
      this.imgData = null;
      const res = await axios.get("config/SDKConfig.json");
      const image_rotate = res.data.image_rotate || 0;
      EcIrisWs.openIrisCamera({image_rotate},() => {
        this.collectMsg = "采集虹膜..."
        EcIrisWs.previewImg((data) => {
          this.imageShow = data;
        })
        EcIrisWs.startRegisterCap((imagedata, feature) => {
          console.log(imagedata);
          this.bioData = {
            imageBase64: imagedata,
            feature: feature
          }
          this.disabledBtn = false;
          this.collectMsg = "虹膜采集成功"
          console.log(this.bioData);
          this.$emit('input', this.bioData)
          this.$emit("collect-result", true);
          EcIrisWs.closeIrisCamera()
        },(data)=> {
          this.collectMsg = data[3];
          this.disabledBtn = false;
        });
      }, (errCode, errMsg) => {
        this.collectMsg = `${errCode}:${errMsg}`
        this.disabledBtn = false
        this.$emit("collect-result", false);
      });
    },
  }
}
</script>
<style lang="scss" scoped>
.ec-collect-msg {
  line-height: 30px;
}
</style>