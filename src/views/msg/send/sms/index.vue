<template>
  <div class="app-container">
    <el-form ref="form" :model="form" :rules="rules" label-width="100px" @submit.native.prevent>
      <el-form-item label="发送模式" prop="msgType">
        <el-select v-model="form.msgType" placeholder="请选择发送模式" class="ec-form-select">
          <el-option v-for="item in msgTypeOptions" :key="item.dictValue" :label="item.dictLabel" :value="item.dictValue">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="云账户" prop="appId">
        <el-select v-model="form.appId" placeholder="请选择云账户" class="ec-form-select">
          <el-option v-for="item in smsCloudAccountList" :key="item.id" :label="item.appName" :value="item.appId">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="收件人" prop="toUserPhoneStr">
        <el-input v-model="form.toUserPhoneStr" placeholder="多个手机号使用,分隔" />
      </el-form-item>
      <el-form-item label="信息主题" prop="msgSubject">
        <el-input v-model="form.msgSubject" placeholder="仅用作平台存储，不作为短信内容发送" />
      </el-form-item>
      <template v-if="form.msgType == '2'">
        <el-form-item label="短信签名" prop="sign" :rules="[{ required: true, message: '短信签名不能为空', trigger: 'blur' }]">
          <el-input v-model="form.sign" placeholder="请输入短信签名" />
        </el-form-item>
        <el-form-item label="官方模板ID" prop="templateId" :rules="[{ required: true, message: '模板ID不能为空', trigger: 'blur' }]">
          <el-input v-model="form.templateId" placeholder="请输入官方模板ID" />
        </el-form-item>
        <el-form-item label="模板数据" prop="templateParamStr" :rules="[{ required: true, message: '模板数据不能为空', trigger: 'blur' }]">
          <el-input v-model="form.templateParamStr" type="textarea" placeholder="请输入内容" :rows="8" />
        </el-form-item>
      </template>
      <template v-else-if="form.msgType == '1'">
        <el-form-item label="信息内容" prop="msgContent" :rules="[{ required: true, message: '信息内容不能为空', trigger: 'blur' }]">
          <el-input v-model="form.msgContent" type="textarea" placeholder="请输入内容" :rows="8" />
        </el-form-item>
      </template>
      <div class="ec-tip">
        <div v-if="form.msgType == '1'">
          明确指定内容，短信签名请在内容中以【】的方式添加到信息内容中。<br />
          信息内容，必须与申请的模板格式一致，否则将返回错误。<br />
          例如：<br />
          1、短信签名：&nbsp;&nbsp;眼神科技研发中心<br />
          2、短信模板：&nbsp;&nbsp;您的校验码是{1}，请于{2}分钟内正确输入。<br />
          3、信息内容：&nbsp;&nbsp;【眼神科技研发中心】您的校验码是1234，请于5分钟内正确输入。
        </div>
        <div v-else-if="form.msgType == '2'">
          模板数据，多个使用,隔开。例如：<br />
          1、模板ID对应模板： 您的校验码是{1}，请于{2}分钟内正确输入。<br />
          2、模板数据为：1234,5
        </div>
      </div>
    </el-form>
    <div class="ec-footer">
      <el-button type="primary" @click="submitForm">发 送</el-button>
      <el-button @click="cancel">重 置</el-button>
    </div>
  </div>
</template>
<script>
import { sendSms } from "@/api/msg/send/sendmsg";
import { listAllSmsCloudAccount } from "@/api/msg/sms/cloudAccount";
export default {
  name: "SendSms",
  components: {
  },
  data() {
    return {
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        msgType: [
          { required: true, message: "发送模式不能为空", trigger: "change" }
        ],
        appId: [
          { required: true, message: "云账户不能为空", trigger: "change" }
        ],
        toUserPhoneStr: [
          { required: true, message: "收件人不能为空", trigger: "blur" }
        ],
        msgSubject: [
          { required: true, message: "信息主题不能为空", trigger: "blur" }
        ]
      },
      /**发送模式选项 */
      msgTypeOptions: [],
      // 云账户列表
      smsCloudAccountList: [],
    };
  },
  created() {
    this.reset();
    this.getDicts("msg_type").then(response => {
      this.msgTypeOptions = response.data;
    });
    this.listAllSmsCloudAccount()
  },
  methods: {
    /**查询所有短信云账户 */
    listAllSmsCloudAccount() {
      listAllSmsCloudAccount().then(res => {
        this.smsCloudAccountList = res.data
      })
    },
    // 表单重置
    reset() {
      this.form = {
        msgType: '2',
        appId: null,
        toUserPhoneStr: null,
        msgSubject: null,
        msgContent: null,
        sign: null,
        templateId: null,
        templateParamStr: null
      };
      this.resetForm("form");
    },
    /**提交表单 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          sendSms(this.form).then(res => {
            if (res.data.statusCode == '0') {
              this.msgSuccess('发送成功');
              this.reset();
            } else {
              this.msgError(res.data.errmsg)
            }
          })
        }
      });
    },
    // 取消提交
    cancel() {
      this.reset();
    }
  }
}
</script>
<style lang="scss" scoped>
.app-container {
  width: calc(100% - 40px);
  height: 100%;
  border: 1px solid #ccc;
  margin: 20px auto;
  .ec-tip {
    font-size: 14px;
    color: #ccc;
    padding-left: 100px;
  }
  .ec-footer {
    text-align: center;
  }
}
</style>