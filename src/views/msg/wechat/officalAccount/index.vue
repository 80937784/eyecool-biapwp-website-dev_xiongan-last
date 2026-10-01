<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="85px" @submit.native.prevent>
      <el-form-item label="公众号名称" prop="appName">
        <el-input v-model="queryParams.appName" placeholder="请输入公众号名称" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="cyan" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd" v-hasPermi="['msg:officalAccount:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" icon="el-icon-edit" size="mini" :disabled="single" @click="handleUpdate" v-hasPermi="['msg:officalAccount:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete" v-hasPermi="['msg:officalAccount:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" icon="el-icon-download" size="mini" @click="handleExport" v-hasPermi="['msg:officalAccount:export']">导出</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button icon="el-icon-upload2" size="mini" @click="handleImport" v-hasPermi="['msg:officalAccount:export']">导入</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" border :data="officalAccountList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="AppId" align="center" prop="appId" width="240"/>
      <el-table-column label="AppSecrect" align="center" prop="appSecrect" />
      <el-table-column label="公众号名称" align="center" prop="appName" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180"/>
      <el-table-column label="修改时间" align="center" prop="updateTime" width="180"/>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改微信公众号对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body :close-on-click-modal="false">
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="公众号名称" prop="appName" >
          <el-input v-model="form.appName" placeholder="请输入内容"/>
        </el-form-item>
        <el-form-item label="AppId" prop="appId">
          <el-input v-model="form.appId" placeholder="请输入内容" :disabled="form.id!=null"/>
        </el-form-item>
        <el-form-item label="AppSecrect" prop="appSecrect">
          <el-input v-model="form.appSecrect" placeholder="请输入内容" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" :loading="submitLoading" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
    <!-- 导入对话框 -->
    <el-dialog :title="upload.title" :visible.sync="upload.open" width="600px" append-to-body :close-on-click-modal="false">
      <el-form ref="uploadForm" :model="upload" :rules="uploadFormRules" label-width="80px">
        <el-form-item label="上传文件" prop="file">
          <upload-file ref="importUpload" :imgFile="false" v-model="upload.file" accept=".txt, .text" :uploadPath="upload.url" name="file" @fail="handleFail"  @success="handleImportFileSuccess" drag />
          <div>
            <!-- <el-link type="info" style="font-size:12px" @click="importTemplate">下载模板</el-link> -->
          </div>
        </el-form-item>
        <div style="color:red; line-height: 18px; font-size: 12px;padding-left: 35px;">提示：1、仅允许导入“txt"格式文件！
          <span style="padding-left: 36px; display: block;">
            2、文件名称必须以MP_开头<br />
          </span>
        </div>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" :loading="exportLoading" @click="submitFileForm">确 定</el-button>
        <el-button @click="cancelFileForm">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listOfficalAccount, getOfficalAccount, delOfficalAccount, addOfficalAccount, updateOfficalAccount, exportOfficalAccount } from "@/api/msg/wechat/officalAccount";
import UploadFile from '@/components/UploadFile';
export default {
  name: "OfficalAccount",
  components: {
    UploadFile
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
      // 微信公众号表格数据
      officalAccountList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        appId: null,
        appSecrect: null,
        appName: null,
        tenantId: null
      },
      upload: {
        // 文件（用于表单校验）
        file: null,
        // 是否显示弹出层
        open: false,
        // 弹出层标题
        title: "",
        // 是否覆盖更新
        updateSupport: false,
        // 上传的地址
        url: "/msg/officalAccount/uploadMpAuthFile"
      },
      exportLoading:false,
      uploadFormRules: {
        file: [
          { required: true, message: "文件不能为空", trigger: ["change", "blur"] }
        ]
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        appId: [
          { required: true, message: "AppId不能为空", trigger: "blur" }
        ],
        appSecrect: [
          { required: true, message: "AppSecrect不能为空", trigger: "blur" }
        ],
        appName: [
          { required: true, message: "公众号名称不能为空", trigger: "blur" }
        ],
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询微信公众号列表 */
    getList() {
      this.loading = true;
      listOfficalAccount(this.queryParams).then(response => {
        this.officalAccountList = response.rows;
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
        appId: null,
        appSecrect: null,
        appName: null,
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
      this.delName = selection.map(item => item.appId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加微信公众号";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getOfficalAccount(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改微信公众号";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.submitLoading = true;
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateOfficalAccount(this.form).then(response => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.submitLoading = false;
              this.getList();
            });
          } else {
            addOfficalAccount(this.form).then(response => {
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
      this.$confirm('是否确认删除AppId为"' + this.delName + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return delOfficalAccount(ids);
      }).then(() => {
        this.getList();
        this.msgSuccess("删除成功");
      })
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm('是否确认导出所有微信公众号数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return exportOfficalAccount(queryParams);
      }).then(response => {
        this.download(response.msg);
      })
    },
    /** 导入按钮操作 */
    handleImport() {
      this.upload.title = "导入";
      this.upload.open = true;
    },
    /**导入文件上传成功处理 */
    handleImportFileSuccess(res) {
      this.upload.open = false;
      this.exportLoading = false;
      this.msgSuccess("文件导入成功");
    },
    /** 导入失败 */
    handleFail() {
      this.exportLoading = false;
    },
    /**提交上传导入文件 */
    submitFileForm() {
      // this.exportLoading = true;
      this.$refs["uploadForm"].validate(valid => {
        if (!valid) {
          this.exportLoading = false;
          return;
        }
        this.$refs.importUpload.submit();
      });
    },
    /**取消导入上传*/
    cancelFileForm() {
      this.$refs.importUpload.cancel();
      this.upload.open = false;
    },
  }
};
</script>
