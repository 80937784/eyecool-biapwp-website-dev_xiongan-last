<template>
  <div class="app-container">
    <el-form ref="form" :model="form" :rules="rules" label-width="120px">
      <el-form-item label="消息类型" prop="msgType">
        <el-select v-model="form.msgType" placeholder="请选择邮件类型" class="ec-form-select">
          <el-option v-for="item in msgTypeOptions" :key="item.dictValue" :label="item.dictLabel" :value="item.dictValue">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="发送全部用户" prop="toAllUser">
        <el-radio-group v-model="form.toAllUser">
          <el-radio v-for="dict in yesOrNoStatus" :key="dict.dictValue" :label="dict.dictValue">{{dict.dictLabel}}</el-radio>
        </el-radio-group>
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
      <el-form-item label="用户手机" prop="phoneStr" v-if="form.toAllUser=='N'" :rules="[{ required: true, message: '是否发送全部用户不能为空', trigger: 'change'}]">
        <el-input v-model="form.phoneStr" placeholder="请输入手机号，多个用','隔开" />
      </el-form-item>
      <el-form-item label="信息主题" prop="msgSubject">
        <el-input v-model="form.msgSubject" placeholder="仅用于平台存储，不作为消息内容发送" />
      </el-form-item>
      <el-form-item label="信息标题" prop="title" v-if="form.msgType=='link' || form.msgType=='markdown'" :rules="[{required: true, message: '信息标题不能为空', trigger: 'blur'}]">
        <el-input v-model="form.title" placeholder="请填写信息标题" />
      </el-form-item>
      <el-form-item label="点击链接" prop="messageUrl" v-if="form.msgType=='link'" :rules="[{required: true, message: '点击链接不能为空', trigger: 'blur'}]">
        <el-input v-model="form.messageUrl" placeholder="请输入点击链接地址,例如 http://www.baidu.com" />
      </el-form-item>
      <el-form-item label="图片地址" prop="picUrl" v-if="form.msgType=='link'" :rules="[{required: true, message: '点击链接不能为空', trigger: 'blur'}]">
        <el-input v-model="form.picUrl" placeholder="请输入图片地址(mediaId，通过媒体上传获取)，例如 @lALOACZwe2Rk" />
      </el-form-item>
      <el-form-item label="信息内容" prop="text" v-if="form.msgType=='text' || form.msgType=='link' || form.msgType=='markdown'" :rules="[{required: true, message: '信息内容不能为空', trigger: 'blur'}]">
        <el-input v-model="form.text" type="textarea" :placeholder="form.msgType=='markdown'? '请输入markdown源码内容,具体要求见:https://ding-doc.dingtalk.com/doc#/serverapi2/ye8tup' : '请输入信息'" />
      </el-form-item>
      <el-form-item label="Media_ID" prop="mediaId" v-if="form.msgType=='file' || form.msgType=='voice' || form.msgType=='image'" :rules="[{required: true, message: 'Media_ID不能为空', trigger: 'blur'}]">
        <el-input v-model="form.mediaId" placeholder="请输入图片地址(mediaId，通过媒体上传获取)，例如 @lALOACZwe2Rk" />
      </el-form-item>
      <el-form-item label="语音时长" prop="duration" v-if="form.msgType=='voice'" :rules="[{required: true, message: '语音时长不能为空', trigger: 'blur'}]">
        <el-input-number :controls="false" :min="0" v-model="form.duration" placeholder="请输入语音时长(单位s，通过媒体上传获取)，例如 11" />
      </el-form-item>
    </el-form>
    <div class="ec-footer">
      <el-button type="primary" @click="submitForm">发 送</el-button>
      <el-button @click="cancel">重 置</el-button>
    </div>
  </div>
</template>
<script>
import { sendDingtalk } from "@/api/msg/send/sendmsg";
import { listAllDingTeam } from "@/api/msg/dingtalk/team";
import { listAllDingApplication } from "@/api/msg/dingtalk/application";
export default {
  name: "SendMail",
  components: {
  },
  data() {
    return {
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        msgType: [
          { required: true, message: "消息类型不能为空", trigger: "change" }
        ],
        corpId: [
          { required: true, message: "团队不能为空", trigger: "change" }
        ],
        appKey: [
          { required: true, message: "应用不能为空", trigger: "change" }
        ],
        phoneStr: [
          { required: true, message: "用户手机不能为空", trigger: "blur" }
        ],
        msgSubject: [
          { required: true, message: "信息主题不能为空", trigger: "blur" }
        ],
      },
      // 消息类型选项
      msgTypeOptions: [],
      // 是否选项
      yesOrNoStatus: [],
      // 钉钉团队列表
      dingTeamList: [],
      // 钉钉应用列表
      dingAppList: []
    };
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
    this.getDicts("msg_dingtalk_type").then(response => {
      this.msgTypeOptions = response.data;
    });
    this.getDicts("sys_yes_no").then(response => {
      this.yesOrNoStatus = response.data;
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
        msgType: 'text',
        toAllUser: 'N',
        corpId: null,
        agentId: null,
        appKey: null,
        phoneStr: null,
        msgSubject: null,
        title: null,
        messageUrl: null,
        picUrl: null,
        text: null,
        mediaId: null,
        duration: null
      };
      this.resetForm("form");
    },
    /**提交表单 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          sendDingtalk(this.form).then(res => {
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
    },
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