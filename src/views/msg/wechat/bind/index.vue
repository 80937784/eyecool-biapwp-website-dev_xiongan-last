<template>
  <div class="app-container">
    <el-form ref="form" :model="form" :rules="rules" label-width="70px">
      <el-form-item label="已绑定" prop="oldPhone" v-if="form.oldPhone" required>
        <el-input :value="form.oldPhone" disabled></el-input>
      </el-form-item>
      <el-form-item label="手机号" prop="phone">
        <el-input v-model="form.phone" placeholder="手机号" />
      </el-form-item>
      <el-form-item label="验证码" prop="captchaContent">
        <el-input v-model="form.captchaContent" placeholder="验证码">
          <template slot="append">
            <el-button @click="handleGetCaptcha()">点击获取</el-button>
          </template>
        </el-input>
      </el-form-item>
    </el-form>
    <div class="ec-footer">
      <el-button type="primary" @click="submitForm">绑定</el-button>
      <el-button @click="cancel">重置</el-button>
    </div>
  </div>
</template>
<script>
import { bindPhone, getCaptcha } from "@/api/msg/wechat/officalAccountUser";
export default {
  name: "BindPhone",
  data() {
    return {
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        phone: [
          { required: true, message: "手机号不能为空", trigger: "blur" }
        ],
        captchaContent: [
          { required: true, message: "验证码不能为空", trigger: "blur" }
        ]
      },
    };
  },
  watch: {
    '$route': {
      // val是改变之后的路由，oldVal是改变之前的val
      handler: function (val, oldVal) {
        this.reset()
        this.form.oldPhone = val.query.phone;
        this.form.appId = val.query.appId;
        this.form.openId = val.query.openId;
      },
      // 深度观察监听
      deep: true,
      immediate: true
    }
  },
  created() {
  },
  methods: {
    // 表单重置
    reset() {
      this.form = {
        oldPhone: null,
        phone: null,
        captchaContent: null,
        appId: null,
        openId: null
      };
      this.resetForm("form");
    },
    /**提交表单 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          bindPhone(this.form).then(res => {
            this.msgSuccess(res.msg);
          })
        }
      });
    },
    // 取消提交
    cancel() {
      this.reset();
    },
    /**获取验证码 */
    handleGetCaptcha() {
      if (!this.form.phone) {
        this.$refs.form.validateField('phone');
        return;
      }
      if (this.form.phone == this.form.oldPhone) {
        this.msgError('请使用新手机号绑定');
        return;
      }
      getCaptcha(this.form).then(res => {
        this.msgSuccess(res.msg)
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.app-container {
  width: calc(100% - 10px);
  height: 100%;
  margin: 20px auto;
  .ec-footer {
    text-align: center;
  }
}
</style>