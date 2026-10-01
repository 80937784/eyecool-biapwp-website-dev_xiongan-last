<template>
    <div class="box">
        <Header />
        <div class="form_box">
            <div class="title">修改密码</div>
            <div class="form">
                <el-form ref="loginForm" label-position="top" label-width="80px" :rules="loginRules" :model="loginForm">
                    <el-form-item prop="oldPassword">
                        <el-input v-model="loginForm.oldPassword" type="password" placeholder="请输入原始密码"></el-input>
                    </el-form-item>
                    <el-form-item prop="newPassword">
                        <el-input v-model="loginForm.newPassword" type="password" placeholder="请输入新密码"></el-input>
                        <div class="tips">密码由8～16位字母、数字、特殊字符组成</div>
                    </el-form-item>
                    <el-form-item prop="confirmPassword">
                       <el-input v-model="loginForm.confirmPassword" type="password" placeholder="请再次输入密码"></el-input>
                       <div class="tips">密码由8～16位字母、数字、特殊字符组成</div>
                    </el-form-item>
                </el-form>
            </div>
            <div class="button">
                <el-button class="cancel" @click="cancle" type="info">取 消</el-button>
                <el-button class="buttons" :loading="loading" @click="hasChange">确认修改</el-button>
            </div>
        </div>
    </div>
</template>
<script>
import {upgradePwd} from '@/api/login'
import Header from "../components/Header.vue";
export default {
    components: {
        Header
    },
    data () {
        // 密码校验
        const equalToPassword = (rule, value, callback) => {
            if (this.loginForm.newPassword !== value) {
                callback(new Error("两次输入的密码不一致"));
            } else {
                callback();
            }
        };
        // 密码格式校验
        const passwordCheck = (rule, value, callback) => {
            let reg = /(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[\W_]).{8,20}/;
            if(reg.test(value)){
                callback();
            }else {
                callback(new Error("密码格式必须包含大小写、数字、特殊字符，并且长度在8-20之间"));
            }
        };
        return {
            // 确认修改按钮加载
            loading:false,
            // 表单
            loginForm: {
                userName:'',
                oldPassword: '',
                newPassword: '',
                confirmPassword: ''
            },
            // 表单规则
            loginRules: {
                oldPassword: [
                    { required: true, trigger: "blur", message: "原始密码不能为空" }
                ],
                newPassword: [
                    { required: true, trigger: "blur", message: "新密码不能为空" },
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
        // 从上个页面将用户名代取来
        this.loginForm.userName = this.$route.query.username;
    },
    methods: {
        /** 确认修改 */
       hasChange() {
           this.$refs["loginForm"].validate(valid => {
                if (valid) {
                    this.loading = true;
                    let obj = {
                        userName:this.loginForm.userName,
                        oldPassword:this.loginForm.oldPassword,
                        newPassword:this.loginForm.newPassword
                    };
                    upgradePwd(obj).then(res=> {
                        this.msgSuccess("修改密码成功");
                        this.$router.push('/login');
                        this.loading = false;
                    }).catch(()=> this.loading = false)
                }
            });
       },
       /** 取消 */
       cancle() {
           this.$router.push('/login');
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
.tips {
    font-family: PingFangSC-Regular;
    font-size: 12px;
    color: #7B7D89;
    letter-spacing: 0;
    font-weight: 400;
    margin-top: 5px;
    height: 20px;
    line-height: 20px;
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
        height: 576px;
        background: #FFFFFF;
        box-shadow: 0px 6px 80px 0px rgba(0,0,0,0.08);
        border-radius: 8px;
        position: absolute;
        top: 45%;
        left: 50%;
        transform: translate(-50%,-50%);
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
            
        }
        .button {
            display: flex;
            align-items: center;
            margin-top: 40px;
            justify-content: space-between;
            .buttons {
                width: 158px;
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
            .cancel {
                width: 158px;
                height: 46px;
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
    }
}
</style>