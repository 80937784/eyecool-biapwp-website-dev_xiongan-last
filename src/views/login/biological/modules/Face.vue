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
import { EcFaceWs } from "@/utils/biosdk/face/CameraHelperWS";
export default {
    data () {
        return {
            // 展示图片
            previewImgData:require("../../../../assets/login/face_area.png"),
            // 展示信息
            collectMsg:"正在连接人脸登录服务",
            // 登录表单
            bioLoginForm: {
                bioUsername: this.bioUsername,
                bioLoginType: "face",
                bioData: ""
            },
        }
    },
    props:{
        // 父传子的username
        bioUsername:{
            require:true,
            type:String
        }
    },
    created () {
        this.initConnect();
        console.log(this.bioUsername);
    },
    beforeDestroy() {
        this.closeCamera();
        this.disConnect();
    },
    methods: {
        // 关闭设备
        closeCamera() {
        EcFaceWs.closeCam(() => {
            this.collectMsg = "摄像头已关闭"
        });
        },
        // 断开人脸采集websocket服务
        disConnect() {
        EcFaceWs.disconnect();
        },
        // 初始化人脸采集websocket服务连接
        initConnect() {
            EcFaceWs.connect(() => {
                this.collectMsg = "人脸采集服务连接成功！"
                console.log('人脸采集服务连接成功！')  
                this.openCamera();          
            }, () => {
                this.collectMsg = "人脸采集服务连接失败，请检查是否安装插件！"
                console.log('人脸采集服务连接失败！')
            });
        },
        // 打开摄像头
        openCamera() {
        EcFaceWs.openCam(() => {
                this.collectMsg = "摄像头已打开, 请采集人脸..."
                EcFaceWs.previewImg((data) => {
                this.previewImgData = 'data:image/jpeg;base64,' + data;
                });       
                this.checklive();
            }, (errCode, errMsg) => {
                if (errCode == -11) {
                    this.collectMsg = "摄像头已打开, 请采集人脸..."
                    EcFaceWs.previewImg((data) => {
                        this.previewImgData ='data:image/jpeg;base64,' + data;
                    });
                    this.checklive();
                    return
                }
                this.collectMsg = `${errCode}:${errMsg}`
            });
        },
        // 执行检活
        checklive() {
            this.collectMsg = "人脸采集中..."
            EcFaceWs.faceCheck((data) => {
                this.bioLoginForm.bioData = data;
                this.collectMsg = "人脸图像采集成功！"
                this.closeCamera();
                this.bioLogin();
            }, (errCode, errMsg) => {
                this.collectMsg = `${errCode}:${errMsg},请返回重新登录！`
            });
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