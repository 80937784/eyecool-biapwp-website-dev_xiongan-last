<template>
  <div class="app-container">
    <el-form ref="form" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="发送模式" prop="msgType">
        <el-select v-model="form.msgType" placeholder="请选择发送模式" class="ec-form-select">
          <el-option v-for="item in msgTypeOptions" :key="item.dictValue" :label="item.dictLabel" :value="item.dictValue">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="公众号" prop="appId">
        <el-select v-model="form.appId" placeholder="请选择公众号" class="ec-form-select">
          <el-option v-for="item in officalAccountList" :key="item.id" :label="item.appName" :value="item.appId">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="微信用户" prop="phoneStr">
        <el-input v-model="form.phoneStr" placeholder="请输入绑定的手机号，多个手机号使用','分隔" />
      </el-form-item>
      <el-form-item label="信息主题" prop="msgSubject">
        <el-input v-model="form.msgSubject" placeholder="仅用作平台存储，不作为短信内容发送" />
      </el-form-item>
      <template v-if="form.msgType == '2'">
        <el-form-item label="官方模板ID" prop="templateId" :rules="[{ required: true, message: '模板ID不能为空', trigger: 'blur' }]">
          <el-input v-model="form.templateId" placeholder="请输入官方模板ID" />
        </el-form-item>
        <el-form-item label="跳转URL" prop="redirectUrl">
          <el-input v-model="form.redirectUrl" placeholder="请输入点击内容后的跳转地址，例如http://www.baidu.com，可以为空" />
        </el-form-item>
        <el-form-item label="模板数据" prop="templateDataStr" :rules="[{ required: true, message: '模板数据不能为空', trigger: 'blur' }]">
          <el-input v-model="form.templateDataStr" type="textarea" placeholder="请输入内容" :rows="4" />
        </el-form-item>
      </template>
      <template v-else-if="form.msgType == '1'">
        <el-form-item label="信息内容" prop="txtContent" :rules="[{ required: true, message: '信息内容不能为空', trigger: 'blur' }]">
          <el-input v-model="form.txtContent" type="textarea" placeholder="请输入内容" :rows="4" />
        </el-form-item>
      </template>
      <div class="ec-tip" v-if="form.msgType == '2'" v-html="tipText">
      </div>
      <div class="ec-tip-alert" v-if="form.msgType == '1'" v-html="tipTextAlert"></div>
    </el-form>
    <div class="ec-footer">
      <el-button type="primary" @click="submitForm">发 送</el-button>
      <el-button @click="cancel">重 置</el-button>
    </div>
  </div>
</template>
<script>
import { sendWeixin } from "@/api/msg/send/sendmsg";
import { listAllOfficalAccount } from "@/api/msg/wechat/officalAccount";
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
          { required: true, message: "公众号不能为空", trigger: "change" }
        ],
        phoneStr: [
          { required: true, message: "微信用户手机号不能为空", trigger: "blur" }
        ],
        msgSubject: [
          { required: true, message: "信息主题不能为空", trigger: "blur" }
        ]
      },
      /**发送模式选项 */
      msgTypeOptions: [],
      // 公众号列表
      officalAccountList: [],
      // 提示消息
      tipText: '1、如果消息模板为<br /> 工号：{{sno.DATA}}<br /> 姓名：{{name.DATA}}<br /> 体温：{{temperature.DATA}}<br /> 2、则模板数据为<br />[{"key":"sno","value":"1001","color":"#000"},{"key":"name","value":"jack","color":"#999"},{"key":"temperature","value":"36.5℃","color":"#999"}]',
      tipTextAlert: '普通发送方式需要用户优先在公众号中发送过消息，否则会发送失败:<br/>45015:回复时间超过限制',

    };
  },
  created() {
    this.reset();
    this.getDicts("msg_type").then(response => {
      this.msgTypeOptions = response.data;
    });
    this.listAllOfficalAccount()
  },
  methods: {
    /**查询所有短信云账户 */
    listAllOfficalAccount() {
      listAllOfficalAccount().then(res => {
        this.officalAccountList = res.data
      })
    },
    // 表单重置
    reset() {
      this.form = {
        msgType: '1',
        appId: null,
        phoneStr: null,
        msgSubject: null,
        txtContent: null,
        redirectUrl: null,
        templateId: null,
        templateDataStr: null
      };
      this.resetForm("form");
    },
    /**提交表单 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          sendWeixin(this.form).then(res => {
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
    margin-bottom: 20px;
  }
  .ec-tip-alert {
    font-size: 14px;
    color: red;
    padding-left: 100px;
    margin-bottom: 20px;
  }
  .ec-footer {
    text-align: center;
  }
}
</style>