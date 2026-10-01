<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="12">
        <el-form ref="form" :model="form" :rules="rules" label-width="120px">
          <el-form-item label="媒体类型" prop="mediaType">
            <el-select v-model="form.mediaType" placeholder="请选择邮件类型" class="ec-form-select">
              <el-option v-for="item in mediaTypeOptions" :key="item.dictValue" :label="item.dictLabel" :value="item.dictValue">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="选择团队" prop="corpId">
            <el-select v-model="form.corpId" placeholder="请选择团队" class="ec-form-select">
              <el-option v-for="item in dingTeamList" :key="item.corpId" :label="item.teamName" :value="item.corpId">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="选择应用" prop="appKey">
            <el-select v-model="form.appKey" placeholder="请选择应用" class="ec-form-select">
              <el-option v-for="item in dingAppList" :key="item.appKey" :label="item.appName" :value="item.appKey">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="媒体文件" prop="file">
            <upload-file ref="importUpload" :imgFile="false" :showFailInfo="false" v-model="form.file" accept="*" :uploadPath="uploadUrl" name="file" @success="handleImportFileSuccess" @fail="handleUploadFail" drag />
          </el-form-item>
        </el-form>
        <div class="ec-footer">
          <el-button type="primary" @click="submitForm">发 送</el-button>
          <el-button @click="cancel">重 置</el-button>
        </div>
      </el-col>
      <el-col :span="12">
        <el-form label-width="120px"> 
          <el-form-item label="返回媒体数据">
            <vue-json-editor :value="uplodaResult" :showBtns="false" mode="view" lang="zh" />
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>

  </div>
</template>
<script>
import { listAllDingTeam } from "@/api/msg/dingtalk/team";
import { listAllDingApplication } from "@/api/msg/dingtalk/application";
import UploadFile from '@/components/UploadFile';
import vueJsonEditor from 'vue-json-editor'
export default {
  name: "SendMail",
  components: {
    UploadFile,
    vueJsonEditor
  },
  data() {
    return {
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        mediaType: [
          { required: true, message: "媒体类型不能为空", trigger: "change" }
        ],
        corpId: [
          { required: true, message: "团队不能为空", trigger: "change" }
        ],
        appKey: [
          { required: true, message: "应用不能为空", trigger: "change" }
        ],
        file: [
          { required: true, message: "媒体文件不能为空", trigger: "change" }
        ],
      },
      // 媒体类型选项
      mediaTypeOptions: [],
      // 钉钉团队列表
      dingTeamList: [],
      // 钉钉应用列表
      dingAppList: [],
      // 上传结果
      uplodaResult: {}
    };
  },
  computed: {
    uploadUrl() {
      return "/msg/send/dingtalk/upload?mediaType=" + this.form.mediaType + "&corpId=" + this.form.corpId + "&appKey=" + this.form.appKey + "&agentId=" + this.form.agentId;
    }
  },
  watch: {
    'form.corpId': {
      handler(newVal, oldVal) {
        this.form.appkey = null;
        if (!newVal) {
          this.dingAppList = [];
          return;
        }
        let teamId = this.dingTeamList.filter(item => item.corpId == newVal)[0].id;
        listAllDingApplication({ teamId: teamId }).then(res => {
          this.dingAppList = res.data
        })
      }
    },
    'form.appKey': {
      handler(newVal, oldVal) {
        if (!newVal) {
          this.form.agentId = null;
          return;
        }
        this.form.agentId = this.dingAppList.filter(item => item.appKey == newVal)[0].agentId;
      },
      immediate: true
    },
  },
  created() {
    this.reset();
    this.getDicts("msg_dingtalk_media_type").then(response => {
      this.mediaTypeOptions = response.data;
    });
    this.listAllDingTeamList();
  },
  methods: {
    /** 查询所有钉钉团队 */
    listAllDingTeamList() {
      listAllDingTeam().then(res => {
        this.dingTeamList = res.data
      })
    },
    // 表单重置
    reset() {
      this.form = {
        mediaType: null,
        corpId: null,
        agentId: null,
        appKey: null,
        file: null
      };
      this.resetForm("form");
    },
    /**提交表单 */
    submitForm() {
      this.uplodaResult = {};
      this.$refs["form"].validate(valid => {
        if (valid) {
          this.$refs.importUpload.submit();
        }
      });
    },
    // 取消提交
    cancel() {
      this.$refs.importUpload.cancel();
      this.uplodaResult = {};
      this.reset();
    },
    /**文件上传成功处理 */
    handleImportFileSuccess(res) {
      this.msgSuccess('上传成功');
      this.uplodaResult = res.data;
      this.reset();
    },
    /**文件上传失败 */
    handleUploadFail(res) {
      this.msgError(res.msg);
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