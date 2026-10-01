<template>
    <div class="box">
        <Header />
        <div class="form_box">
            <header>
                <div class="title">生物识别信息登录</div>
                <div class="tabs">
                    <div class="item" @click="changeTab(index)" v-for="(data,index) in tabs" :style="{'borderColor':activeIndex == index ? '#F56704' : ''}" :key="index">
                        <img :src="activeIndex == index ?data.activeImg : data.img" alt="">
                        <span :style="{'color':activeIndex == index ? '#F56704' :''}">{{data.title}}</span>
                    </div>
                </div>    
            </header>
            <nav v-if="noneUsername">
                <el-form ref="loginForm" label-position="top" label-width="80px" :rules="loginRules" :model="loginForm" @submit.native.prevent>
                    <el-form-item prop="username" label="用户名">
                        <el-input v-model="loginForm.username" @keyup.enter.native="bioLogin" placeholder="请输入用户名"></el-input>
                    </el-form-item>
                </el-form>
                <div class="button">
                    <button @click="bioLogin">生物信息登录</button>
                </div>
            </nav>
            <div v-else class="nav_body">
                <nav v-if="activeIndex == 0"><face-iris :bioUsername="username" /></nav>
                <nav v-if="activeIndex == 1"><Face :bioUsername="username"/></nav>
                <nav v-if="activeIndex == 2"><Iris :bioUsername="username"/></nav>
                <nav v-if="activeIndex == 3"><Finger :bioUsername="username"/></nav>
            </div>
            <footer>
                <div class="tips">使用多模态信息认证登录，请先<el-link type="warning" @click="downloadSysSdkFiles" style="font-size:15px;color:#FF6600">安装插件</el-link></div>
                <div class="change_info" @click="openMessage">切换密码登录</div>
            </footer>
        </div>
        <!-- 插件弹窗 -->
        <el-dialog :visible="showDownloadDialog" width="50%" append-to-body :close-on-click-modal="false" @close="closeDownloadDialog">
        <el-table :data="lastSysSdkFiles">
            <el-table-column label="文件名称" align="center" prop="fileName" />
            <el-table-column label="文件MD5" align="center" prop="md5" />
            <el-table-column label="Sdk类型" align="center" prop="sdkType">
            </el-table-column>
            <el-table-column label="版本排序" align="center" prop="sortedNo">
            <template slot-scope="scope">
                <el-tag type="warning" size="medium">{{ scope.row.sortedNo }}</el-tag>
            </template>
            </el-table-column>
            <el-table-column label="创建时间" align="center" prop="createTime" />
            <el-table-column label="修改时间" align="center" prop="updateTime" />
            <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
            <template slot-scope="scope">
                <el-button size="mini" type="text" icon="el-icon-download" @click="handleDownloadSdkFile(scope.row)">附件下载</el-button>
            </template>
            </el-table-column>
        </el-table>
        </el-dialog>
    </div>
</template>
<script>
import FaceIris from "./modules/FaceIris";
import Face from "./modules/Face";
import Iris from "./modules/Iris";
import Finger from "./modules/Finger";
import { getValid } from "@/api/login";
import { selectLastSdkUploads, sdkDownloadUnsafe } from "@/api/tool/sdkFile";
import Header from "../components/Header.vue";
export default {
    components: {
        // 多模态
        FaceIris,
        // 人脸
        Face,
        // 虹膜
        Iris,
        // 指纹
        Finger,
        Header
    },
    mounted () {
        // 如果登陆首页已经填写用户名，则将数据进行传递，反之不然
        let username = this.$route.query.username;
        this.loginForm.username = username;
    },
    data () {
        // 用户名的有效性
        const validatorUsername = (rule, value, callback)=> {
            getValid({userName:this.loginForm.username}).then(res=> {
                if(res.data) {
                    callback();
                }else {
                    callback(new Error("用户名不存在"))
                }
            })
        };
        return {
            // 弹窗控制
            showDownloadDialog:false,
            // 弹窗表格
            lastSysSdkFiles:[],
            // 填写username后的弹窗控制
            noneUsername:true,
            // 顶部tab高亮控制
            activeIndex:0,
            // 验证规则
            loginRules:{
                username: [
                    { required: true, trigger: "blur", message: "用户名不能为空" },
                    {required: true, validator:validatorUsername,trigger:"blur"}
                ],
            },
            // 顶部tabs
            tabs:[
                {
                    title:"多模态登录",
                    img:require("../../../assets/login/fi2.png"),
                    activeImg:require("../../../assets/login/fi.png"),
                },
                {
                    title:"人脸登录",
                    img:require("../../../assets/login/face2.png"),
                    activeImg:require("../../../assets/login/face.png"),
                },
                {
                    title:"虹膜登录",
                    img:require("../../../assets/login/ir2.png"),
                    activeImg:require("../../../assets/login/ir.png"),
                },
                {
                    title:"指纹登录",
                    img:require("../../../assets/login/finger2.png"),
                    activeImg:require("../../../assets/login/finger.png"),
                }
            ],
            // 用户名表单
            loginForm: {
                username: '',
            },
            // 父传子时传递的username
            username:''
        }
    },
    methods: {
        /** 生物信息登录 */
        openMessage() {
            this.$router.push("/login")
        },
        /** tab切换 */
        changeTab(index) {
            this.activeIndex = index;
        },
        /** 生物识别登录 */
        bioLogin() {
            this.$refs['loginForm'].validate(valid=> {
                if(valid) {
                    this.username = this.loginForm.username;
                    this.noneUsername = false;
                    this.$refs.loginForm.resetFields();
                }
            }) 
        },
        /** 打开插件弹窗 */
        downloadSysSdkFiles() {
            this.showDownloadDialog = true;
            selectLastSdkUploads().then((response) => {
                this.lastSysSdkFiles = response.rows;
            })
        },
        /** 下载插件 */
        handleDownloadSdkFile(row) {
            sdkDownloadUnsafe(row.id);
        },
        /** 关闭弹窗 */
        closeDownloadDialog() {
            this.showDownloadDialog = false;
        }
    }
}
</script>
<style lang="scss" scoped>
/deep/ .el-input__inner {
    height: 42px;
    border: 1px solid #D5D8DC;
    border-radius: 4px;
}
/deep/ .el-tabs__header {
    height: 80px;
}
/deep/ .el-tabs__nav-wrap{
    height: 80px;
}
.box {
    width: 100%;
    height: 100vh;
    background-color: #f2f2f2;
    background-image: url('../../../assets/login/background.png');
    background-repeat: no-repeat;
    background-size: 100% 100%;
    .form_box {
        width: 578px;
        background: #FFFFFF;
        box-shadow: 0px 6px 80px 0px rgba(0,0,0,0.08);
        border-radius: 8px;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%,-50%);
        header {
            width: 100%;
            height: 135px;
            background: #FBFBFB;
            border-radius: 8px 8px 0 0;
            padding: 22px;
            box-sizing: border-box;
            border-bottom: 1px solid #dddcdc;
            position: relative;
            .title {
                text-align: center;
                font-family: PingFangSC-Regular;
                font-size: 16px;
                color: #999999;
                letter-spacing: 0.44px;
                font-weight: 400;
            }
            .tabs {
                margin-top: 20px;
                display: flex;
                align-items: center;
                justify-content: space-around;
                padding: 0 100px;
                box-sizing: border-box;
                position: absolute;
                bottom: 0;
                left: 0;
                width: 100%;
                img {
                    width: 50px;
                    height: 50px;
                }
                .item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding-bottom: 11px;
                    border-bottom: 2px solid #FBFBFB;
                    cursor: pointer;
                    width: 60px;
                    span {
                        font-family: PingFangSC-Regular;
                        font-size: 12px;
                        color: #8F909B;
                        letter-spacing: 0;
                        font-weight: 400;
                    }
                }
            }
        }
        nav {
            padding: 30px 130px;
            box-sizing: border-box;
            min-height: 250px;
            .button {
                text-align: center;
                margin-top: 30px;
                button {
                    width: 274px;
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
        }
        footer {
            padding-bottom: 30px;
            .tips {
                text-align: center;
                font-family: PingFangSC-Thin;
                font-size: 14px;
                color: #919191;
                letter-spacing: 0;
                line-height: 20px;
                font-weight: 200;
                display: flex;
                align-items: center;
                width: 100%;
                justify-content: center;
            }
            .change_info {
                font-family: PingFangSC-Light;
                font-size: 14px;
                color: #FF6600;
                letter-spacing: 0;
                font-weight: 200;
                text-align: center;
                margin-top: 18px;
                cursor: pointer;
                transition: all .3s;
            }
            .change_info:hover {
                color: #f88f48;
            }
        }
    }
}

</style>