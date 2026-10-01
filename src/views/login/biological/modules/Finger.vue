<template>
    <div>
        <div class="img">
            <img :src="previewImgData" alt="">
        </div>
        <div class="tips">{{collectMsg}}</div>
        <div class="button"><button @click="$router.push('login')">返回</button></div>
    </div>
</template>
<script>
import { EcFingerWs } from "@/utils/biosdk/finger/FingerprintHelperWS";
export default {
    data () {
        return {
            previewImgData:require("../../../../assets/login/finger_area.png"),
            collectMsg:"正在连接指纹登录服务",
            bioLoginForm: {
                bioUsername: this.bioUsername,
                bioLoginType: "finger",
                bioData: ""
            },
        }
    },
    computed: {
        imgIdx() {
            return 1; // 0注册图，1特征图
        }
    },
    props:{
        bioUsername:{
            require:true,
            type:String
        }
    },
    created() {
        this.initConnect();
    },
    beforeDestroy() {
        this.disConnect();
    },
    methods: {
        // 初始化指纹采集websocket服务连接
        initConnect() {
        EcFingerWs.connect(() => {
            this.collectMsg = "指纹采集服务连接成功！"
            console.log('指纹采集服务连接成功！') 
            this.handeCollect();  
        }, () => {
            this.collectMsg = "指纹采集服务连接失败，请检查是否安装插件！"
        });
        },
        // 断开指纹采集websocket服务
        disConnect() {
        EcFingerWs.disconnect();
        },
        // 采集指纹
        handeCollect() {
        this.getTempletGA();
        },
        // 获取GA指纹模板
        getTempletGA() {
        this.collectMsg = "请采集指纹..."
        EcFingerWs.FPIGetFeatureGA(this.succCallback, this.failCallback);
        },
        succCallback() {
        let format = 1;	// 0raw, 1bmp, 2wsq 只有bmp可以显示，raw和wsq均不可显示
        this.collectMsg = "指纹采集成功"
        EcFingerWs.FPIGetImageDataGA((imgBase64) => {
            this.previewImgData = 'data:image/jpeg;base64,' + imgBase64;
            this.bioLoginForm.bioData = imgBase64;
            this.bioLogin();
        }, (code, msg) => {
            this.collectMsg = `${code}:${msg}`
        }, this.imgIdx, format);
        },
        failCallback(code, msg) {
            this.collectMsg = `${code}:${msg},请返回重新登录！`;
        },
        // 登录
        bioLogin() {
            this.$store.dispatch("BioLogin", this.bioLoginForm)
            .then(() => {
              if (this.redirect_type === 'out') {
                location.href = this.redirect;
                return;
              }
              this.$router.push({ path: this.redirect || "/" });
            })
            .catch(() => {
              this.$router.push('/login');
            });
        }
    }
}
</script>
<style lang="scss" scoped>
.img {
    width: 100%;
    img {
        width: 100%;
        height: 280px;
    }
}
.tips {
    width: 100%;
    height: 44px;
    margin-top: 14px;
    background: #FBFBFB;
    text-align: center;
    font-family: PingFangSC-Regular;
    font-size: 14px;
    color: #F57821;
    letter-spacing: 0;
    font-weight: 400;
    line-height: 44px;
}
.button {
    text-align: center;
    margin-top: 24px;
    button {
        width: 100%;
        height: 46px;
        background-image: linear-gradient(113deg, #FF9000 0%, #FF6600 100%);
        border-radius: 4px;
        text-align: center;
        line-height: 40px;
        font-family: PingFangSC-Medium;
        font-size: 16px;
        color: #FFFFFF;
        border:none;
        cursor: pointer;
        outline: none;
    }
    button:hover {
        background: linear-gradient(113deg, #FF6600 0%, #FF9000 100%);
    }
}
</style>