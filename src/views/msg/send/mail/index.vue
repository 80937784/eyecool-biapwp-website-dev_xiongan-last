<template>
  <div class="app-container">
    <el-form ref="form" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="邮件类型" prop="mailType">
        <el-select v-model="form.mailType" placeholder="请选择邮件类型" class="ec-form-select">
          <el-option v-for="item in mailTypeOptions" :key="item.dictValue" :label="item.dictLabel" :value="item.dictValue">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="发件邮箱" prop="from">
        <el-input v-model="form.from" placeholder="请输入发件邮箱" />
      </el-form-item>
      <el-form-item label="收件邮箱" prop="toMailStr">
        <el-input v-model="form.toMailStr" placeholder="多个邮箱使用,分隔" />
      </el-form-item>
      <el-form-item label="抄送邮箱" prop="ccMailStr">
        <el-input v-model="form.ccMailStr" placeholder="多个邮箱使用,分隔" />
      </el-form-item>
      <el-form-item label="邮件主题" prop="subject">
        <el-input v-model="form.subject" placeholder="请填写邮件主题" />
      </el-form-item>
      <el-form-item label="邮件内容" prop="content">
        <el-input v-model="form.content" type="textarea" :rows="4" placeholder="请填写邮件内容(普通文本或者HTML)" />
      </el-form-item>
      <el-form-item label="邮件附件" prop="file">
        <upload-file ref="importUpload" :imgFile="false" v-model="form.file" accept="*" :uploadPath="uploadUrl" name="files" @success="handleImportFileSuccess" drag />
      </el-form-item>
    </el-form>
    <div class="ec-footer">
      <el-button type="primary" @click="submitForm">发 送</el-button>
      <el-button @click="cancel">重 置</el-button>
    </div>
  </div>
</template>
<script>
import { sendMail } from "@/api/msg/send/sendmsg";
import UploadFile from '@/components/UploadFile';
export default {
  name: "SendMail",
  components: {
    UploadFile
  },
  data() {
    return {
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        mailType: [
          { required: true, message: "邮件类型不能为空", trigger: "change" }
        ],
        from: [
          { required: true, message: "发件邮箱不能为空", trigger: "blur" }
        ],
        toMailStr: [
          { required: true, message: "收件邮箱不能为空", trigger: "blur" }
        ],
        subject: [
          { required: true, message: "邮件主题不能为空", trigger: "blur" }
        ],
        content: [
          { required: true, message: "邮件内容不能为空", trigger: "blur" }
        ]
      },
      /**邮件类型选项 */
      mailTypeOptions: [],
    };
  },
  computed: {
    uploadUrl() {
      return "/msg/send/mail?mailType=" + this.form.mailType + "&from=" + this.form.from + "&toMailStr=" + this.form.toMailStr + "&subject=" + this.form.subject + "&content=" + this.form.content;
    }
  },
  created() {
    this.reset();
    this.getDicts("msg_mail_type").then(response => {
      this.mailTypeOptions = response.data;
    });
  },
  methods: {
    // 表单重置
    reset() {
      this.form = {
        mailType: '1',
        from: null,
        toMailStr: null,
        ccMailStr: null,
        subject: null,
        content: null,
        file: null
      };
      this.resetForm("form");
    },
    /**提交表单 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.file) {
            this.$refs.importUpload.submit();
          } else {
            sendMail(this.form).then(res => {
              if (res.data.statusCode == '0') {
                this.msgSuccess('发送成功');
                this.reset();
              } else {
                this.msgError(res.data.errmsg);
              }
            })
          }
        }
      });
    },
    // 取消提交
    cancel() {
      this.$refs.importUpload.cancel();
      this.reset();
    },
    /**文件上传成功处理 */
    handleImportFileSuccess(res) {
      if (res.data.statusCode == '0') {
        this.msgSuccess('发送成功');
        this.reset();
      } else {
        this.msgError(res.data.errmsg);
      }
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