<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="85px">
      <el-form-item label="微应用名称" prop="appName">
        <el-input v-model="queryParams.appName" placeholder="请输入微应用名称" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="团队名称" prop="teamName">
        <el-input v-model="queryParams.teamName" placeholder="请输入团队名称" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="cyan" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd" v-hasPermi="['msg:dingApplication:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" icon="el-icon-edit" size="mini" :disabled="single" @click="handleUpdate" v-hasPermi="['msg:dingApplication:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete" v-hasPermi="['msg:dingApplication:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" icon="el-icon-download" size="mini" @click="handleExport" v-hasPermi="['msg:dingApplication:export']">导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" border :data="dingApplicationList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="团队名称" align="center" prop="teamName" />
      <el-table-column label="微应用名称" align="center" prop="appName" />
      <el-table-column label="agentId" align="center" prop="agentId" />
      <el-table-column label="AppKey" align="center" prop="appKey" />
      <el-table-column label="AppSecrect" align="center" prop="appSecrect" show-overflow-tooltip />
      <el-table-column label="微应用简介" align="center" prop="shortDes" show-overflow-tooltip />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180"/>
      <el-table-column label="修改时间" align="center" prop="updateTime" width="180"/>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改钉钉微应用对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body :close-on-click-modal="false">
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="选择团队" prop="teamId">
          <el-select v-model="form.teamId" placeholder="请选择团队" class="ec-form-select" :disabled="form.id!=null">
            <el-option v-for="item in dingTeamList" :key="item.id" :label="item.teamName" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="微应用名称" prop="appName">
          <el-input v-model="form.appName" placeholder="请输入微应用名称" />
        </el-form-item>
        <el-form-item label="agentId" prop="agentId">
          <el-input v-model="form.agentId" placeholder="请输入微应用agentId" :disabled="form.id!=null" />
        </el-form-item>
        <el-form-item label="AppKey" prop="appKey">
          <el-input v-model="form.appKey" placeholder="请输入微应用AppKey" :disabled="form.id!=null" />
        </el-form-item>
        <el-form-item label="AppSecrect" prop="appSecrect">
          <el-input v-model="form.appSecrect" placeholder="请输入微应用AppSecrect" />
        </el-form-item>
        <el-form-item label="微应用简介" prop="shortDes">
          <el-input v-model="form.shortDes" type="textarea" placeholder="请输入微应用简介" />
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
import { listDingApplication, getDingApplication, delDingApplication, addDingApplication, updateDingApplication, exportDingApplication } from "@/api/msg/dingtalk/application";
import { listAllDingTeam } from "@/api/msg/dingtalk/team";
export default {
  name: "DingApplication",
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
      // 钉钉微应用表格数据
      dingApplicationList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        teamName: null,
        appName: null,
        tenantId: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        teamId: [
          { required: true, message: "团队(企业)不能为空", trigger: "blur" }
        ],
        corpId: [
          { required: true, message: "团队(企业)CorpId不能为空", trigger: "blur" }
        ],
        appName: [
          { required: true, message: "微应用名称不能为空", trigger: "blur" }
        ],
        agentId: [
          { required: true, message: "微应用agentId不能为空", trigger: "blur" }
        ],
        appKey: [
          { required: true, message: "微应用AppKey不能为空", trigger: "blur" }
        ],
        appSecrect: [
          { required: true, message: "微应用AppSecrect不能为空", trigger: "blur" }
        ],
      },
      // 钉钉团队列表
      dingTeamList: []
    };
  },
  watch: {
    'form.teamId': {
      handler(newVal, oldVal) {
        if (!newVal) {
          this.$set(this.form, 'corpId', null);
          return;
        }
        let teamInfo = this.dingTeamList.filter(item => item.id == newVal)[0];
        this.$set(this.form, 'corpId', teamInfo.corpId);
      }
    }
  },
  created() {
    this.getList();
    this.listAllDingTeamList();
  },
  methods: {
    /** 查询钉钉微应用列表 */
    getList() {
      this.loading = true;
      listDingApplication(this.queryParams).then(response => {
        this.dingApplicationList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    /** 查询所有钉钉团队 */
    listAllDingTeamList() {
      listAllDingTeam().then(res => {
        this.dingTeamList = res.data
      })
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
        teamId: null,
        corpId: null,
        appName: null,
        agentId: null,
        appKey: null,
        appSecrect: null,
        shortDes: null,
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
      this.delName = selection.map(item => item.teamName)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加钉钉微应用";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getDingApplication(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改钉钉微应用";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        this.submitLoading = true;
        if (valid) {
          if (this.form.id != null) {
            updateDingApplication(this.form).then(response => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.submitLoading = false;
              this.getList();
            });
          } else {
            addDingApplication(this.form).then(response => {
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
      this.$confirm('是否确认删除钉钉微应用团队名称为"' + this.delName + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return delDingApplication(ids);
      }).then(() => {
        this.getList();
        this.msgSuccess("删除成功");
      })
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm('是否确认导出所有钉钉微应用数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return exportDingApplication(queryParams);
      }).then(response => {
        this.download(response.msg);
      })
    }
  }
};
</script>
