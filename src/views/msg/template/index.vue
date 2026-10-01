<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="85px">
      <el-form-item label="模板官方ID" prop="officalId">
        <el-input v-model="queryParams.officalId" placeholder="请输入模板官方ID" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="模板名称" prop="templateName">
        <el-input v-model="queryParams.templateName" placeholder="请输入模板名称" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="通知方式" prop="noticeMethod">
        <el-select v-model="queryParams.noticeMethod" placeholder="请选择通知方式" clearable size="small">
          <el-option v-for="dict in noticeMethodOptions" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="cyan" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd" v-hasPermi="['msg:template:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" icon="el-icon-edit" size="mini" :disabled="single" @click="handleUpdate" v-hasPermi="['msg:template:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete" v-hasPermi="['msg:template:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" icon="el-icon-download" size="mini" @click="handleExport" v-hasPermi="['msg:template:export']">导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" border :data="templateList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="模板名称" align="center" prop="templateName" />
      <el-table-column label="模板官方ID" align="center" prop="officalId" />
      <el-table-column label="模板内容" align="center" prop="content" show-overflow-tooltip/>
      <el-table-column label="通知方式" align="center" prop="noticeMethod" :formatter="noticeMethodFormat" />
      <el-table-column label="公众号|云账户" align="center" prop="officalAccountName" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180"/>
      <el-table-column label="修改时间" align="center" prop="updateTime" width="180"/>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改消息模板对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="110px">
        <el-form-item label="通知方式" prop="noticeMethod">
          <el-select v-model="form.noticeMethod" placeholder="请选择通知方式" class="ec-form-select">
            <el-option v-for="dict in noticeMethodOptions" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="form.noticeMethod=='1' ? '云账户' : '公众号'" prop="officalAccountId">
          <el-select v-model="form.officalAccountId" placeholder="请选择" class="ec-form-select" :disabled="form.id!=null">
            <el-option v-for="item in templateAccountOptions" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="模板名称" prop="templateName">
          <el-input v-model="form.templateName" placeholder="请输入模板名称" />
        </el-form-item>
        <el-form-item label="模板官方ID" prop="officalId">
          <el-input v-model="form.officalId" placeholder="请输入模板官方ID" />
        </el-form-item>
        <el-form-item label="模板内容" prop="content">
          <el-input v-model="form.content" type="textarea" :rows="5" placeholder="请输入内容" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" :loading="submitLoading" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listTemplate, getTemplate, delTemplate, addTemplate, updateTemplate, exportTemplate } from "@/api/msg/template";
import { listAllOfficalAccount } from '@/api/msg/wechat/officalAccount';
import { listAllSmsCloudAccount } from "@/api/msg/sms/cloudAccount";
export default {
  name: "Template",
  components: {
  },
  data() {
    return {
      // 提交加载
      submitLoading:false,
      // 删除信息
      delName:"",
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
      // 消息模板表格数据
      templateList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 通知方式字典
      noticeMethodOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        templateName: null,
        officalId: null,
        content: null,
        noticeMethod: null,
        officalAccountId: null,
        tenantId: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        templateName: [
          { required: true, message: "模板名称不能为空", trigger: "blur" }
        ],
        content: [
          { required: true, message: "模板内容不能为空", trigger: "blur" }
        ],
        noticeMethod: [
          { required: true, message: "通知方式不能为空", trigger: "change" }
        ],
        officalId: [
          { required: true, message: "官方模板ID不能为空", trigger: "change" }
        ],
        officalAccountId: [
          { required: true, message: "公众号|云账户不能为空", trigger: "change" }
        ]
      },
      // 公众号列表
      officalAccountList: [],
      // 短信云账户列表
      smsCloudAccountList: [],
      // 模板账户选择项目
      templateAccountOptions: []
    };
  },
  watch: {
    'form.noticeMethod': {
      handler(newVal, oldVal) {
        if(this.form.id == null){
          this.form.officalAccountId = null;
          this.handleNoticeMethodChange(newVal)
        }
      },
      immediate: true
    }
  },
  created() {
    this.getList();
    this.getDicts("msg_notice_method").then(response => {
      this.noticeMethodOptions = response.data;
    });
    this.listAllOfficalAccount();
    this.listAllSmsCloudAccount();
  },
  methods: {
    /** 查询消息模板列表 */
    getList() {
      this.loading = true;
      listTemplate(this.queryParams).then(response => {
        this.templateList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    /** 查询所有微信公众号 */
    listAllOfficalAccount() {
      listAllOfficalAccount().then(res => {
        this.officalAccountList = res.data
      })
    },
    // 查询所有短信云账户
    listAllSmsCloudAccount() {
      listAllSmsCloudAccount().then(res => {
        this.smsCloudAccountList = res.data
      })
    },
    // 通知方式字典翻译
    noticeMethodFormat(row, column) {
      return this.selectDictLabel(this.noticeMethodOptions, row.noticeMethod);
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
        templateName: null,
        officalId: null,
        content: null,
        noticeMethod: null,
        officalAccountId: null,
        createTime: null,
        updateTime: null,
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
      this.delName = selection.map(item => item.templateName)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加消息模板";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getTemplate(id).then(response => {
        this.form = response.data;
        this.handleNoticeMethodChange(this.form.noticeMethod)
        this.open = true;
        this.title = "修改消息模板";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.submitLoading = true;
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateTemplate(this.form).then(response => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.submitLoading = false;
              this.getList();
            });
          } else {
            addTemplate(this.form).then(response => {
              this.msgSuccess("新增成功");
              this.open = false;
              this.submitLoading = false;
              this.getList();
            });
          }
        }else {
          this.submitLoading = false;
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$confirm('是否确认删除消息模板名称为"' + this.delName + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return delTemplate(ids);
      }).then(() => {
        this.getList();
        this.msgSuccess("删除成功");
      })
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm('是否确认导出所有消息模板数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return exportTemplate(queryParams);
      }).then(response => {
        this.download(response.msg);
      })
    },
    /**通知方式变化 */
    handleNoticeMethodChange(newVal) {
      if (!newVal) {
        this.templateAccountOptions = [];
        return;
      }
      switch (newVal) {
        case '1':
          this.templateAccountOptions = this.smsCloudAccountList.map(item => {
            return {
              value: `${item.id}`,
              label: `${item.appName}`,
            };
          })
          break;
        case '3':
          this.templateAccountOptions = this.officalAccountList.map(item => {
            return {
              value: `${item.id}`,
              label: `${item.appName}`,
            };
          })
          break;
        case '2':
        case '4':
          this.msgError('只有短信和微信需要配置消息模板')
          this.form.noticeMethod = '1';
      }
    }
  }
};
</script>
