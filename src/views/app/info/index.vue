<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="应用名称" prop="appDesc">
        <el-input v-model="queryParams.appDesc" placeholder="请输入应用名称" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="AppKey" prop="appKey">
        <el-input v-model="queryParams.appKey" placeholder="请输入应用AppKey" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="cyan" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd" v-hasPermi="['app:info:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete" v-hasPermi="['app:info:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" icon="el-icon-download" size="mini" @click="handleExport" v-hasPermi="['app:info:export']">导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" border :data="infoList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="应用名称" align="center" prop="appDesc" />
      <el-table-column label="AppKey" align="center" prop="appKey"/>
      <el-table-column label="AppSecrect" align="center" prop="appSecret" :min-width="130" />
      <el-table-column label="是否内置" align="center" prop="builtIn" :formatter="builtInFormat"/>
      <el-table-column label="备注" align="center" prop="remark"  :show-overflow-tooltip="true" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180"/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="100">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-s-unfold" @click="handleShowAuthInterface(scope.row)" v-hasPermi="['app:auth:list']">授权接口</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改应用系统信息对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body :close-on-click-modal="false">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="应用名称" prop="appDesc">
          <el-input v-model="form.appDesc" placeholder="请输入应用名称" />
        </el-form-item>
        <el-form-item label="备注信息" prop="remark">
          <el-input type="textarea" v-model="form.remark" maxlength="150" placeholder="请输入备注信息" />
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
import { listInfo, getInfo, delInfo, addInfo, exportInfo } from "@/api/app/info";

export default {
  name: "Info",
  components: {
  },
  data() {
    return {
      // 提交加载
      submitLoading:false,
      // 遮罩层
      loading: true,
      // 删除选中名称
      deviceName:"",
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
      // 应用系统信息表格数据
      infoList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 是否内置字典
      builtInOptions: [],
      // 状态字典
      statusOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        appKey: null,
        appSecret: null,
        appDesc: null,
        builtIn: null,
        status: null,
        tenantId: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        appDesc: [
          { required: true, message: "应用名称不能为空", trigger: "blur" },
          {required:true, max:20 ,trigger: "blur",message: "应用名称不能超过20个字符", }
        ]
      }
    };
  },
  created() {
    this.getList();
    this.getDicts("sys_yes_no").then(response => {
      this.builtInOptions = response.data;
    });
    this.getDicts("sys_normal_disable").then(response => {
      this.statusOptions = response.data;
    });
  },
  methods: {
    /** 查询应用系统信息列表 */
    getList() {
      this.loading = true;
      listInfo(this.queryParams).then(response => {
        this.infoList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 是否内置字典翻译
    builtInFormat(row, column) {
      return this.selectDictLabel(this.builtInOptions, row.builtIn);
    },
    // 状态字典翻译
    statusFormat(row, column) {
      return this.selectDictLabel(this.statusOptions, row.status);
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
        appKey: null,
        appSecret: null,
        appDesc: null,
        builtIn: "N",
        remark: null,
        status: "0",
        createBy: null,
        updateBy: null,
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
      console.log(selection);
      this.ids = selection.map(item => item.id)
      this.deviceName = selection.map(item=>item.appDesc)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加应用系统信息";
    },
    /** 提交按钮 */
    submitForm() {
      this.submitLoading = true;
      this.$refs["form"].validate(valid => {
        if (valid) {
          addInfo(this.form).then(response => {
            this.msgSuccess("新增成功");
            this.open = false;
            this.submitLoading = false;
            this.getList();
          });
        }else {
          this.submitLoading = false;
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$confirm('是否确认删除应用名称为"' + this.deviceName + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return delInfo(ids);
      }).then(() => {
        this.getList();
        this.msgSuccess("删除成功");
      })
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm('是否确认导出所有应用系统信息数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return exportInfo(queryParams);
      }).then(response => {
        this.download(response.msg);
      })
    },
    /**查看授权接口 */
    handleShowAuthInterface(row){
      this.$router.push({name:'Auth', params: {appId: row.id}});
    }
  }
};
</script>
