<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="85px">
      <el-form-item label="业务流水号" prop="receivedSeq">
        <el-input v-model="queryParams.receivedSeq" placeholder="请输入业务流水号" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="通知方式" prop="noticeMethod">
        <el-select v-model="queryParams.noticeMethod" placeholder="请选择通知方式" clearable size="small">
          <el-option v-for="dict in noticeMethodOptions" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue" />
        </el-select>
      </el-form-item>
      <el-form-item label="消息主题" prop="msgSubject">
        <el-input v-model="queryParams.msgSubject" placeholder="请输入消息主题" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="cyan" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="warning" icon="el-icon-download" size="mini" @click="handleExport" v-hasPermi="['msg:log:export']">导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" border :data="logList" @selection-change="handleSelectionChange">
      <el-table-column label="业务流水号" align="center" prop="receivedSeq" />
      <el-table-column label="通知方式" align="center" prop="noticeMethod" :formatter="noticeMethodFormat" />
      <el-table-column label="消息主题" align="center" prop="msgSubject" />
      <el-table-column label="消息内容" align="center" prop="msgContent" />
      <el-table-column label="收件人标识" align="center" prop="toUser" show-overflow-tooltip />
      <el-table-column label="公众(企业)号" align="center" prop="officalAccountName" />
      <el-table-column label="场景标识" align="center" prop="sceneRemark" />
      <el-table-column label="发送状态" align="center" prop="resultStatus" :formatter="resultStatusFormat" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180"/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-info" @click="handleShowDetail(scope.row)" v-hasPermi="['msg:log:query']">详情</el-button>
          <el-button size="mini" type="text" icon="el-icon-paperclip" @click="handleShowAnnex(scope.row)" v-hasPermi="['msg:log:query']">附件</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改消息日志对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="700px" append-to-body :close-on-click-modal="false">
      <el-form ref="form" :model="form" label-width="100px" :disabled="true">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="业务流水号" prop="receivedSeq">
              <el-input v-model="form.receivedSeq" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="消息主题" prop="msgSubject">
              <el-input v-model="form.msgSubject" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="公众号名称" prop="officalAccountName">
              <el-input v-model="form.officalAccountName" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="场景标识" prop="sceneRemark">
              <el-input v-model="form.sceneRemark" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="发信人标识" prop="fromUser">
              <el-input v-model="form.fromUser" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="创建时间" prop="createTime">
              <el-input v-model="form.createTime" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="收件人标识" prop="toUser">
          <el-input v-model="form.toUser" />
        </el-form-item>
        <el-form-item label="消息内容" prop="msgContent">
          <el-input v-model="form.msgContent" :rows="1" type="textarea" />
        </el-form-item>
        <el-form-item label="结果json" prop="jsonResponse" v-if="form.jsonResponse !=null">
           <vue-json-editor :value="JSON.parse(form.jsonResponse)" :showBtns="false" mode="view" lang="zh"/>
        </el-form-item>
        <el-form-item label="错误信息" prop="errMsg">
          <el-input v-model="form.errMsg" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="包含附件">
              <el-radio-group v-model="form.hasAnnex">
                <el-radio v-for="dict in hasAnnexOptions" :key="dict.dictValue" :label="dict.dictValue">{{dict.dictLabel}}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="发送状态">
              <el-radio-group v-model="form.resultStatus">
                <el-radio v-for="dict in resultStatusOptions" :key="dict.dictValue" :label="dict.dictValue">{{dict.dictLabel}}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="通知方式">
          <el-radio-group v-model="form.noticeMethod">
            <el-radio v-for="dict in noticeMethodOptions" :key="dict.dictValue" :label="dict.dictValue">{{dict.dictLabel}}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { listLog, getLog, exportLog } from "@/api/msg/log/msglog";
import vueJsonEditor from 'vue-json-editor'
export default {
  name: "Log",
  components: {
    vueJsonEditor
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 消息日志表格数据
      logList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 通知方式字典
      noticeMethodOptions: [],
      // 是否包含附件字典
      hasAnnexOptions: [],
      // 发送状态字典
      resultStatusOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        receivedSeq: null,
        noticeMethod: null,
        msgSubject: null,
        tenantId: null
      },
      // 表单参数
      form: {},
    };
  },
  created() {
    this.getList();
    this.getDicts("msg_notice_method").then(response => {
      this.noticeMethodOptions = response.data;
    });
    this.getDicts("sys_yes_no").then(response => {
      this.hasAnnexOptions = response.data;
    });
    this.getDicts("msg_result").then(response => {
      this.resultStatusOptions = response.data;
    });
  },
  methods: {
    /** 查询消息日志列表 */
    getList() {
      this.loading = true;
      listLog(this.queryParams).then(response => {
        this.logList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 通知方式字典翻译
    noticeMethodFormat(row, column) {
      return this.selectDictLabel(this.noticeMethodOptions, row.noticeMethod);
    },
    // 是否包含附件字典翻译
    hasAnnexFormat(row, column) {
      return this.selectDictLabel(this.hasAnnexOptions, row.hasAnnex);
    },
    // 发送状态字典翻译
    resultStatusFormat(row, column) {
      return this.selectDictLabel(this.resultStatusOptions, row.resultStatus);
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        receivedSeq: null,
        noticeMethod: null,
        msgSubject: null,
        msgContent: null,
        hasAnnex: "N",
        fromUser: null,
        toUser: null,
        officalAccountId: null,
        officalAccountName: null,
        sceneRemark: null,
        resultStatus: "0",
        errMsg: null,
        jsonResponse: null,
        createTime: null,
        tenantId: null
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm('是否确认导出所有消息日志数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return exportLog(queryParams);
      }).then(response => {
        this.download(response.msg);
      })
    },
    /**显示详细信息 */
    handleShowDetail(row) {
      this.reset()
      getLog(row.id).then(res => {
        this.form = res.data;
        this.title = '日志详细信息'
        this.open = true;
      })
    },
    // 查看附件 
    handleShowAnnex(row){
      if(row.hasAnnex == 'N'){
        this.msgInfo('此消息没有附件')
        return
      }
      this.$router.push({name:'Logannex', query:{logId:row.id}})
    }
  }
};
</script>
