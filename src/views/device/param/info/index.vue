<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="参数编码" prop="paramCode">
        <el-input v-model="queryParams.paramCode" placeholder="请输入设备参数编码" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="参数名称" prop="paramName">
        <el-input v-model="queryParams.paramName" placeholder="请输入设备参数名称" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="cyan" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5" v-if="!isTenantUser">
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd" v-hasPermi="['device:paraminfo:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5" v-if="!isTenantUser">
        <el-button type="success" icon="el-icon-edit" size="mini" :disabled="single" @click="handleUpdate" v-hasPermi="['device:paraminfo:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5" v-if="!isTenantUser">
        <el-button type="danger" icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete" v-hasPermi="['device:paraminfo:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" icon="el-icon-download" size="mini" @click="handleExport" v-hasPermi="['device:paraminfo:export']">导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" border :data="paramList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="参数编码" align="center" prop="paramCode" width="240" />
      <el-table-column label="参数名称" align="center" prop="paramName" />
      <el-table-column label="参数描述" align="center" prop="paramDesc" :show-overflow-tooltip="true" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180" />
      <el-table-column label="修改时间" align="center" prop="updateTime" width="180" />
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改设备参数信息对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body :close-on-click-modal="false">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="参数编码" prop="paramCode">
          <el-input v-model="form.paramCode" placeholder="请输入设备参数编码" :disabled="form.id != null" />
        </el-form-item>
        <el-form-item label="参数名称" prop="paramName">
          <el-input v-model="form.paramName" placeholder="请输入设备参数名称" />
        </el-form-item>
        <el-form-item label="参数描述" prop="paramDesc">
          <el-input v-model="form.paramDesc" type="textarea" :rows="4" placeholder="请输入内容" />
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
import { mapGetters } from 'vuex';
import { listParam, getParam, delParam, addParam, updateParam, exportParam } from "@/api/device/param/info";

export default {
  name: "DeviceParam",
  components: {
  },
  data() {
    return {
      // 提交加载
      submitLoading:false,
      // 遮罩层
      loading: true,
      // 型号名称
      deviceName: "",
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
      // 设备参数信息表格数据
      paramList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        paramCode: null,
        paramName: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        paramCode: [
          { required: true, message: "设备参数编码不能为空", trigger: "blur" }
        ],
        paramName: [
          { required: true, message: "设备参数名称不能为空", trigger: "blur" }
        ],
      }
    };
  },
  computed: {
    ...mapGetters([
      'isTenantUser', 'tenantEnabled'
    ])
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询设备参数信息列表 */
    getList() {
      this.loading = true;
      listParam(this.queryParams).then(response => {
        this.paramList = response.rows;
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
        paramCode: null,
        paramName: null,
        paramDesc: null,
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
      this.ids = selection.map(item => item.id)
      this.single = selection.length !== 1
      this.deviceName = selection.map(item => item.paramName)
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加设备参数信息";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getParam(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改设备参数信息";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          this.submitLoading = true;
          if (this.form.id != null) {
            updateParam(this.form).then(response => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.submitLoading = false;
              this.getList();
            }).catch(()=> this.submitLoading = false);
          } else {
            addParam(this.form).then(response => {
              this.msgSuccess("新增成功");
              this.open = false;
              this.submitLoading = false;
              this.getList();
            }).catch(()=> this.submitLoading = false);
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$confirm('是否确认删除参数名称为"' + this.deviceName + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return delParam(ids);
      }).then(() => {
        this.getList();
        this.msgSuccess("删除成功");
      })
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm('是否确认导出所有设备参数信息数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return exportParam(queryParams);
      }).then(response => {
        this.download(response.msg);
      })
    }
  }
};
</script>
