<template>
    <div class="box">
        <Header />
        <div class="form_box">
            <div class="title">
                    <div class="steps">
                        <div class="step">
                            <span :style="{'color':isNext == 1?'#FF6600':''}">账号验证</span>
                            <div class="cicle" :style="{'background':isNext == 1?'#FF6600':''}">1</div>
                        </div>
                        <div class="line"></div>
                        <div class="step">
                            <span :style="{'color':isNext == 2?'#FF6600':''}">重置密码</span>
                            <div class="cicle" :style="{'background':isNext == 2?'#FF6600':''}">2</div>
                        </div>
                    </div>
            </div>
            <div class="body" v-if="isNext == 1">
                <div class="tips">您可以使用申请时填写的手机号找回密码</div>
                <div class="form">
                    <el-form ref="loginForm" label-position="top" label-width="80px" :rules="loginRules" :model="loginForm">
                        <el-form-item prop="userName" label="用户名">
                            <el-input v-model="loginForm.userName" placeholder="请输入用户名（手机号、姓名、公司名称）"></el-input>
                        </el-form-item>
                        <el-form-item prop="phone" label="手机号">
                            <el-input v-model="loginForm.phone" type="number" placeholder="请输入手机号码"></el-input>
                        </el-form-item>
                        <el-form-item prop="captcha" label="验证码">
                            <div class="code_box">
                                <el-input v-model="loginForm.captcha" style="width:247px" placeholder="请输入验证码"></el-input>
                                <div class="code_image">
                                    <el-button class="codebutton" :disabled="codeName != '获取验证码'" :loading="codeLoading" @click="getCode">{{codeName}}</el-button>
                                </div>
                            </div> 
                        </el-form-item>
                    </el-form>
                </div>
                <div class="button">
                    <el-button class="cancel" @click="cancel" type="info">取 消</el-button>
                    <el-button class="buttons" :loading="loading" @click="hasNext">下一步</el-button>
                </div>
            </div>
            <div class="body" v-if="isNext == 2">
                <div class="tips">重置密码</div>
                <div class="form">
                    <el-form ref="loginForms" label-position="top" label-width="80px" :rules="loginRules" :model="loginForms">
                        <el-form-item prop="newPassword">
                        <el-input v-model="loginForms.newPassword" type="password" placeholder="请输入新密码"></el-input>
                        <div class="psdtips">密码由8～16位字母、数字、特殊字符组成</div>
                        </el-form-item>
                        <el-form-item prop="confirmPassword">
                        <el-input v-model="loginForms.confirmPassword" type="password" placeholder="请再次输入密码"></el-input>
                        <div class="psdtips">密码由8～16位字母、数字、特殊字符组成</div>
                        </el-form-item>
                    </el-form>
                </div>
                <div class="button">
                    <el-button class="cancel" @click="substep" type="info">上一步</el-button>
                    <el-button class="buttons" :loading="loading" @click="confirmMsg">确 定</el-button>
                </div>
            </div> 
        </div>
    </div>
</template>
<script>
import { getCode,getValid,pwdReset } from "@/api/login";
import Header from "../components/Header.vue";
export default {
    components: {
        Header
    },
    data () {
        // 验证用户名是否存在
        const validatorUsername = (rule, value, callback)=> {
            getValid({userName:this.loginForm.userName}).then(res=> {
                if(res.data) {
                    callback();
                }else {
                    callback(new Error("用户名不存在"))
                }
            })
        };
        // 验证手机号长度
        const phoneValidator = (rule, value, callback)=> {
            if(value.length != 11) {
                callback(new Error("手机号格式不正确"))
            }else {
                callback();
            }
        };
        // 密码输入的一致性
        const equalToPassword = (rule, value, callback) => {
            if (this.loginForms.newPassword !== value) {
                callback(new Error("两次输入的密码不一致"));
            } else {
                callback();
            }
        };
        // 验证密码格式
        const passwordCheck = (rule, value, callback) => {
            let reg = /(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[\W_]).{8,16}/;
            if(reg.test(value)){
                callback();
            }else {
                callback(new Error("密码格式必须包含大小写、数字、特殊字符，并且长度在8-16之间"));
            }
        };
        return {
            code:null,
            // 获取验证码倒计时
            codeLoading:false,
            // 验证码
            codeName:"获取验证码",
            // 下一步控制
            isNext:1,
            // 确定按钮加载
            loading:false,
            // 第一步表单数据
            loginForm: {
                userName: '',
                phone: '',
                captcha: '', 
            },
            // 下一步表单数据
            loginForms:{
                newPassword:'',
                confirmPassword:''
            },
            // 表单验证规则
            loginRules: {
                userName: [
                    { required: true, trigger: "blur", message: "用户名不能为空" },
                    {required: true, validator:validatorUsername,trigger:"blur"}
                ],
                phone: [
                    { required: true, trigger: "blur", message: "手机号不能为空" },
                    {required: true, validator:phoneValidator,trigger:"blur"}
                ],
                captcha: [
                    { required: true, trigger: "blur", message: "验证码不能为空" },
                    // { required: true, validator: equalCode, trigger: "blur", },
                ],
                newPassword: [
                    { required: true, trigger: "blur", message: "新密码不能为空" },
                    { min: 8, max: 16, message: "长度在 8 到 16 个字符", trigger: "blur" },
                    {required:true,validator:passwordCheck,trigger:"blur"}
                ],
                confirmPassword: [
                    { required: true, trigger: "blur", message: "再次输入密码不能为空" },
                    { required: true, validator: equalToPassword, trigger: "blur" }
                ]
            },
        }
    },
    mounted () {
    },
    methods: {
        /** 获取验证码 */
        getCode() {
            let reg =/(1[3-9]\d{9}$)/;
             if(!reg.test(this.loginForm.phone)){
               this.msgError("手机号格式错误");
               return
            }
            this.codeLoading = true;
            let obj = {
                userName:this.loginForm.userName,
                phone:this.loginForm.phone
            };
            getCode(obj).then(res => {
               this.msgSuccess("验证码发送成功");
               this.code = res.data;
               this.codeLoading = false;
               this.countDown();
            }).catch(()=> this.codeLoading = false);
        },
        /** 倒计时 */
        countDown() {
            this.codeName = '60s';
            let interval = setInterval(() => {
                this.codeName = (parseInt(this.codeName)-1) + 's';
                if(parseInt(this.codeName) <= 0) {
                    clearInterval(interval);
                    this.codeName = "获取验证码";
                }
            }, 1000);
        },
        /** 重置表单及步骤条 */
        reset() {
            this.isNext = 1;
            this.$refs.loginForm.resetFields();
            this.$refs.loginForms.resetFields();
        },
        /** 取消 */
        cancel() {
            this.$router.push('/login');
            this.reset();
        },
        /** 上一步 */
        substep() {
            this.isNext = 1;
        },
        /** 下一步 */
        hasNext() {
            this.$refs["loginForm"].validate(valid=> {
                if(valid) {
                    this.isNext = 2;
                }
            })
        },
        /** 确认 */
        confirmMsg() {
            this.$refs["loginForms"].validate(valid=> {
                if (valid) {
                    this.loading = true;
                    let obj = {
                        userName:this.loginForm.userName,
                        phone:this.loginForm.phone,
                        captcha:this.loginForm.captcha,
                        newPassword:this.loginForms.newPassword
                    };
                    pwdReset(obj).then(res=> {
                        this.msgSuccess("密码重置成功");
                        this.$router.push('/login');
                        this.isNext = 1;
                        this.reset();
                        this.loading = false;
                    }).catch(()=> this.loading = false)
                }
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
.psdtips {
    font-family: PingFangSC-Regular;
    font-size: 12px;
    color: #7B7D89;
    letter-spacing: 0;
    font-weight: 400;
    margin-top: 5px;
    height: 20px;
    line-height: 20px;
}
.body {
    padding: 0 100px 58px;
    box-sizing: border-box;
    .tips {
        text-align: center;
        font-family: PingFangSC-Light;
        font-size: 14px;
        color: #FF6600;
        letter-spacing: 0;
        font-weight: 200;
        margin-top: 20px;
    }
    .codebutton {
        width: 100%;
        height: 42px;
        color: white;
        background-color: #F89C5C;
    }
    .codebutton:hover {
        background-color: #f8b07c;
    }
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
        top: 45%;
        left: 50%;
        transform: translate(-50%,-50%);
        .title {
            height: 137px;
            background-color: #FFFAF6;
            border-bottom: 3px solid #FF6600;
            display: flex;
            align-items: center;
            justify-content: center;
            .steps {
                display: flex;
                justify-content: center;
                width: 100%;
                align-items: center;
                .step {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    span {
                        font-family: PingFangSC-Regular;
                        font-size: 12px;
                        color: #B5B5B5;
                        letter-spacing: 0;
                        font-weight: 400;
                    }
                    .cicle {
                        width: 33px;
                        height: 33px;
                        background: #D8D8D8;
                        border-radius: 50%;
                        font-family: PingFangSC-Medium;
                        font-size: 18px;
                        color: #FFFFFF;
                        letter-spacing: 0;
                        font-weight: 500;
                        text-align: center;
                        line-height: 33px;
                        margin-top: 7px;
                    }
                }
                .line {
                    width: 140px;
                    height: 1px;
                    opacity: 0.18;
                    background: #D8D8D8;
                    border: 1px solid #979797;
                    margin-top: 20px;
                }
            }
        }
        .form {
            margin-top: 20px;
            .code_box {
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            .code_image {
                width: 127px;
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
            display: flex;
            align-items: center;
            margin-top: 40px;
            justify-content: space-around;
            .buttons {
                width: 140px;
                height: 40px;
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
            .cancel {
                width: 140px;
                height: 40px;
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
                background: linear-gradient(113deg, #f89719 0%, #fa7a25 100%);
            }
        }
    }
}
</style>