<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="110px">
      <el-form-item label="SMTP服务地址" prop="host">
        <el-input v-model="queryParams.host" placeholder="请输入SMTP服务地址" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="登录用户名" prop="username">
        <el-input v-model="queryParams.username" placeholder="请输入登录用户名" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="发件邮箱" prop="emailAddr">
        <el-input v-model="queryParams.emailAddr" placeholder="请输入发件邮箱" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="cyan" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd" v-hasPermi="['msg:mailProperty:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" icon="el-icon-edit" size="mini" :disabled="single" @click="handleUpdate" v-hasPermi="['msg:mailProperty:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete" v-hasPermi="['msg:mailProperty:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" icon="el-icon-download" size="mini" @click="handleExport" v-hasPermi="['msg:mailProperty:export']">导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" border :data="mailPropertyList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="SMTP服务地址" align="center" prop="host" />
      <el-table-column label="SMTP服务端口" align="center" prop="port" />
      <el-table-column label="登录用户名" align="center" prop="username" />
      <el-table-column label="登录授权码" align="center" prop="password" />
      <el-table-column label="发件邮箱" align="center" prop="emailAddr" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180" />
      <el-table-column label="修改时间" align="center" prop="updateTime" width="180" />
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改邮箱配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body :close-on-click-modal="false">
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="SMTP服务地址" prop="host">
          <el-input v-model="form.host" placeholder="请输入SMTP服务地址" />
        </el-form-item>
        <el-form-item label="SMTP服务端口" prop="port">
          <el-input-number :min="0" :step="1" :controls="false" v-model="form.port" placeholder="请输入SMTP服务端口" style="width:100%" />
        </el-form-item>
        <el-form-item label="登录用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入登录用户名" />
        </el-form-item>
        <el-form-item label="登录授权码" prop="password">
          <el-input v-model="form.password" placeholder="请输入登录授权码" />
        </el-form-item>
        <el-form-item label="发件邮箱" prop="emailAddr">
          <el-input v-model="form.emailAddr" placeholder="请输入发件邮箱" />
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
import { listMailProperty, getMailProperty, delMailProperty, addMailProperty, updateMailProperty, exportMailProperty } from "@/api/msg/mail/mailProperty";

export default {
  name: "MailProperty",
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
      // 邮箱配置表格数据
      mailPropertyList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        host: null,
        port: null,
        username: null,
        password: null,
        emailAddr: null,
        tenantId: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        host: [
          { required: true, message: "SMTP服务地址不能为空", trigger: "blur" }
        ],
        port: [
          { required: true, message: "SMTP服务端口不能为空", trigger: "blur" }
        ],
        username: [
          { required: true, message: "登录用户名不能为空", trigger: "blur" }
        ],
        password: [
          { required: true, message: "登录授权码不能为空", trigger: "blur" }
        ],
        emailAddr: [
          { required: true, message: "发件邮箱不能为空", trigger: "blur" }
        ],
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询邮箱配置列表 */
    getList() {
      this.loading = true;
      listMailProperty(this.queryParams).then(response => {
        this.mailPropertyList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
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
        host: null,
        port: 25,
        username: null,
        password: null,
        emailAddr: null,
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
      this.delName = selection.map(item => item.username)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加邮箱配置";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getMailProperty(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改邮箱配置";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          this.submitLoading = true;
          if (this.form.id != null) {
            updateMailProperty(this.form).then(response => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.submitLoading = false;
              this.getList();
            }).catch(()=>this.submitLoading = false);
          } else {
            addMailProperty(this.form).then(response => {
              this.msgSuccess("新增成功");
              this.open = false;
              this.submitLoading = false;
              this.getList();
            }).catch(()=>this.submitLoading = false);
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$confirm('是否确认删除登录用户名为"' + this.delName + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return delMailProperty(ids);
      }).then(() => {
        this.getList();
        this.msgSuccess("删除成功");
      })
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm('是否确认导出所有邮箱配置数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return exportMailProperty(queryParams);
      }).then(response => {
        this.download(response.msg);
      })
    }
  }
};
</script>
