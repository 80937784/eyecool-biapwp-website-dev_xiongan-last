<template>
    <div class="box">
        <Header :title="title" :titleShow="titleShow" />
        <div class="form_box">
            <div class="title">{{title}}</div>
            <div class="form">
                <el-form ref="loginForm" label-position="top" label-width="80px" :rules="loginRules" :model="loginForm" @submit.native.prevent>
                    <el-form-item prop="username" label="账号">
                        <el-input v-model="loginForm.username" placeholder="请输入用户名"></el-input>
                    </el-form-item>
                    <el-form-item prop="password" label="密码">
                        <el-input v-model="loginForm.password" :type="passwordShow?'password':'text'" placeholder="请输入您的账号密码">
                            <img slot="suffix" @click="openPassword" class="password_img" :src="passwordShow?require('../../assets/login/eye_open.png'):require('../../assets/login/eye_close.png')" alt="">
                        </el-input>
                    </el-form-item>
                    <el-form-item prop="code" label="验证码">
                        <div class="code_box">
                            <el-input v-model="loginForm.code" style="width:247px" @keyup.enter.native="submitLogin" placeholder="请输入验证码"></el-input>
                            <div class="code_image">
                                <el-image :src="codeUrl" @click="getCode" style="width: 100%; height: 100%" fit="fill" class="login-code-img" />
                            </div>
                        </div> 
                    </el-form-item>
                    <el-form-item>
                        <div class="save_password">
                            <el-checkbox v-model="loginForm.rememberMe">记住密码</el-checkbox>
                            <span @click="pushForget">忘记密码</span>
                        </div> 
                    </el-form-item>
                </el-form>
            </div>
            <div class="button">
                <el-button class="buttons" @keyup.enter="submitLogin" :loading="loading" @click="submitLogin">登 录</el-button>
            </div>
            <div class="change_info" @click="openMessage">
                切换生物信息登录
            </div>
        </div>
    </div>
</template>
<script>
import { encrypt, decrypt } from '@/utils/jsencrypt'
import { getCodeImg,getValid } from "@/api/login";
import Cookies from "js-cookie";
import Header from "./components/Header.vue";
import axios from 'axios'
export default {
    components: {
        Header
    },
    watch: {
        /** 监控路由实现路由的重定向 */
        $route: {
        handler: function (route) {
            this.redirect = route.query && route.query.redirect;
            this.redirect_type = route.query && route.query.redirect_type
        },
        immediate: true
        }
    },
    data () {
        // 用户名的有效性验证
        const validatorUsername = (rule, value, callback)=> {
            getValid({userName:this.loginForm.username}).then(res=> {
                if(res.data) {
                    callback();
                }else {
                    callback(new Error("用户名不存在"))
                }
            })
        };
        const validatorPassword = (rule, value, callback)=> {
              if (/[\u4E00-\u9FA5]/g.test(value)) {
               callback(new Error('密码不能输入汉字'));
             } else {
               callback();
             }
        };
        return {
            // header标题显示
            titleShow:true,
            title:null,
            // 显示隐藏密码
            passwordShow:true,
            // 登录按钮加载
            loading:false,
            // 验证码图片
            codeUrl: "",
            // 路由重定向参数
            redirect:undefined,
            redirect_type:undefined,
            // 登录表单
            loginForm: {
                rememberMe:false,
                uuid:'',
                username: '',
                password: '',
                code: ''
            },
            // 登录表单验证规则
            loginRules: {
                username: [
                    { required: true, trigger: "blur", message: "用户名不能为空" },
                    {required: true, validator:validatorUsername,trigger:"blur"}
                ],
                password: [
                    { required: true, trigger: "blur", message: "密码不能为空" },
                    {validator:validatorPassword,trigger:"blur"}
                ],
                code: [{ required: true, trigger: "change", message: "验证码不能为空" }]
            },
        }
    },
    mounted () {
        // 首次进入先获取验证图片
        this.getCode();
        this.getTitle();
    },
    methods: {
        /** 获取title */
        getTitle() {
            axios.get('config/index.json').then(res=> {
                this.title = res.data.name;
                this.titleShow = res.data.show;
            })
        },
        /** 显示或密码 */
        openPassword() {
            this.passwordShow = !this.passwordShow
        },
        /** 获取验证码 */
        getCode() {
            getCodeImg().then(res => {
                console.log(res);
                this.codeUrl = "data:image/gif;base64," + res.img;
                this.loginForm.uuid = res.uuid;
            });
        },
        /** 获取cookie */
        getCookie() {
            const username = Cookies.get("username");
            const password = Cookies.get("password");
            const rememberMe = Cookies.get('rememberMe')
            this.loginForm = {
                username: username === undefined ? this.loginForm.username : username,
                password: password === undefined ? this.loginForm.password : decrypt(password),
                rememberMe: rememberMe === undefined ? false : Boolean(rememberMe)
            };
        },
        /** 生物信息登录 */
        openMessage() {
            this.$router.push({
                path:"/biological",
                query:{
                    username:this.loginForm.username
                }
            })
        },
        /** 登录 */
        submitLogin() {
            this.$refs.loginForm.validate(valid => {
                if (valid) {
                
                this.loading = true;
                if (this.loginForm.rememberMe) {
                    Cookies.set("username", this.loginForm.username, { expires: 30 });
                    Cookies.set("password", encrypt(this.loginForm.password), { expires: 30 });
                    Cookies.set('rememberMe', this.loginForm.rememberMe, { expires: 30 });
                } else {
                    Cookies.remove("username");
                    Cookies.remove("password");
                    Cookies.remove('rememberMe');
                }
                this.$store
                    .dispatch("Login", this.loginForm)
                    .then(() => { 
                        if (this.redirect_type === 'out') {
                            location.href = this.redirect;
                            return;
                        }
                        this.$router.push({ path: this.redirect || "/" },(e)=>{console.log(e)})
                    })
                    .catch(() => {
                    this.loading = false;
                    this.getCode();
                    });
                }
            });
        },
        /** 忘记密码 */
        pushForget() {
            this.$router.push({
                path:'/passwordforget',
            })
        }
    }
}
</script>
<style lang="scss" scoped>

/deep/ .el-form-item__label {
    font-family: PingFangSC-Regular;
    font-size: 14px;
    color: #666666;
    letter-spacing: 0;
    font-weight: 400;
    line-height: 16px;
}
/deep/ .el-input__inner {
    height: 42px;
    border: 1px solid #D5D8DC;
    border-radius: 4px;
}
/deep/ .el-checkbox__input.is-checked + .el-checkbox__label {
    color: #FF6600;
}
/deep/ .el-checkbox__input.is-checked .el-checkbox__inner {
    background-color: #FF6600;
    border-color: #FF6600;
}
/deep/ .el-checkbox__input.is-focus .el-checkbox__inner {
    border-color: #FF6600;
}
.password_img {
    width: 16px;
    height: 16px;
    cursor: pointer;
    display: block;
    margin-top: 14px;
    margin-right: 10px;
}
.box {
    width: 100%;
    height: 100vh;
    background-color: white;
    background-image: url('../../assets/login/background.png');
    background-repeat: no-repeat;
    background-size: 100% 100%;
    .form_box {
        width: 578px;
        height: 576px;
        background: #FFFFFF;
        // box-shadow: 0px 6px 80px 0px rgba(0,0,0,0.08);
        border-radius: 8px;
        position: absolute;
        top: 140px;
        left: 50%;
        transform: translate(-50%);
        padding: 58px 100px;
        box-sizing: border-box;
        .title {
            font-family: PingFangSC-Medium;
            font-size: 24px;
            color: #666666;
            letter-spacing: 0.67px;
            font-weight: 500;
            text-align: center;
        }
        .form {
            margin-top: 40px;
            .code_box {
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            .code_image {
                width: 147px;
                height: 42px;
                margin-left: 10px;
            }
            .save_password {
                display: flex;
                justify-content: space-around;
                padding: 0 80px;
                box-sizing: border-box;
                color: #333333;
                span {
                    cursor: pointer;
                    transition: all .3s;
                }
                span:hover {
                    color: #FF6600;
                }
            }
            
        }
        .button {
            text-align: center;
            .buttons {
                width: 274px;
                height: 46px;
                background-image: linear-gradient(113deg, #FF9000 0%, #FF6600 100%);
                border-radius: 4px;
                text-align: center;
                // line-height: 46px;
                font-family: PingFangSC-Medium;
                font-size: 16px;
                color: #FFFFFF;
                border:none;
                cursor: pointer;
                outline: none;
            }
            .buttons:hover {
                background: linear-gradient(113deg, #FF6600 0%, #FF9000 100%);
            }
        }
        .change_info {
                font-family: PingFangSC-Light;
                font-size: 14px;
                color: #FF6600;
                letter-spacing: 0;
                font-weight: 200;
                text-align: center;
                margin-top: 20px;
                cursor: pointer;
                transition: all .3s;
        }
        .change_info:hover {
            color: #f88f48;
        }
    }
}
</style>