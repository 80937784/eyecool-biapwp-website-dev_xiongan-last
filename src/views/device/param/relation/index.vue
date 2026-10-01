<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="型号编码" prop="modelCode">
        <el-select class="ec-form-select" v-model="queryParams.modelCode" clearable filterable reserve-keyword placeholder="请输入型号名称检索">
          <el-option v-for="item in modelSelectOptions" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="参数编码" prop="paramCode">
        <el-input v-model="queryParams.paramCode" placeholder="请输入设备参数编码" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="cyan" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5" v-if="!isTenantUser">
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd" v-hasPermi="['device:paramModelRel:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5" v-if="!isTenantUser">
        <el-button type="danger" icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete" v-hasPermi="['device:paramModelRel:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" icon="el-icon-download" size="mini" @click="handleExport" v-hasPermi="['device:paramModelRel:export']">导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" border :data="paramModelRelList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="型号编码" align="center" prop="modelCode" width="160" />
      <el-table-column label="参数编码" align="center" prop="paramCode" width="240" />
      <el-table-column label="参数名称" align="center" prop="paramName" />
      <el-table-column label="参数说明" align="center" prop="paramDesc" :show-overflow-tooltip="true" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180" />
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改参数型号关系对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="700px" append-to-body :close-on-click-modal="false">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="设备型号" prop="modelCode">
          <el-select class="ec-form-select" v-model="form.modelCode" clearable filterable reserve-keyword placeholder="请输入型号名称检索">
            <el-option v-for="item in modelSelectOptions" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="设备参数" prop="paramCode">
          <el-select class="ec-form-select" v-model="form.paramCode" clearable filterable reserve-keyword multiple collapse-tags placeholder="请输入参数名称检索">
            <el-option v-for="item in paramSelectOptions" :key="item.value" :label="item.label" :value="item.value">
              <span style="float: left">{{ item.label }}</span>
              <span style="float: left; color: #8492a6; font-size: 13px">【{{ item.value }}】</span>
            </el-option>
          </el-select>
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
import { listParamModelRel, getParamModelRel, delParamModelRel, addParamModelRel, updateParamModelRel, exportParamModelRel } from "@/api/device/param/relation";
import { listAllModel } from "@/api/device/model";
import { listAllParamInfo } from "@/api/device/param/info";

export default {
  name: "ParamModelRel",
  components: {
  },
  data() {
    return {
      // 提交加载
      submitLoading:false,
      // 遮罩层
      loading: true,
      // 删除选中名称
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
      // 参数型号关系表格数据
      paramModelRelList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        modelCode: null,
        paramCode: null,
        tenantId: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        modelCode: [
          { required: true, message: "设备型号不能为空", trigger: "change" }
        ],
        paramCode: [
          { required: true, message: "设备参数不能为空", trigger: "change" }
        ],
      },
      // 型号列表
      modelSelectOptions: [],
      // 参数列表
      paramSelectOptions: [],
    };
  },
  computed: {
    ...mapGetters([
      'isTenantUser', 'tenantEnabled'
    ])
  },
  created() {
    this.getList();
    this.listAllModel();
  },
  watch: {
    'form.modelCode': {
      handler(newVal, oldVal) {
        this.form.paramCode = null;
        this.listAllParamInfo()
      }
    }
  },
  methods: {
    /** 查询参数型号关系列表 */
    getList() {
      this.loading = true;
      listParamModelRel(this.queryParams).then(response => {
        this.paramModelRelList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    /** 查询所有型号列表 */
    listAllModel() {
      listAllModel().then(response => {
        if (response.data && response.data.length) {
          this.modelSelectOptions = response.data.map(item => {
            return {
              value: `${item.modelCode}`,
              label: `${item.modelName}`
            };
          });
        }
      });
    },
    /** 查询所有参数列表 */
    listAllParamInfo() {
      this.paramSelectOptions = [];
      if (!this.form.modelCode) {
        return;
      }
      listAllParamInfo(this.form.modelCode).then(response => {
        if (response.data && response.data.length) {
          this.paramSelectOptions = response.data.map(item => {
            return {
              value: `${item.paramCode}`,
              label: `${item.paramName}`,
              paramDesc: `${item.paramDesc}`,
            };
          });
        }
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
        modelCode: null,
        paramCode: null,
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
      this.deviceName = selection.map(item => item.paramName)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加参数型号关系";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getParamModelRel(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改参数型号关系";
      });
    },
    /** 提交按钮 */
    submitForm() { 
      this.$refs["form"].validate(valid => {
        if (valid) {
          this.submitLoading = true;
          if (this.form.id != null) {
            updateParamModelRel(this.form).then(response => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.submitLoading = false;
              this.getList();
            }).catch(()=> this.submitLoading = false);
          } else {
            const data = {
              modelCode: this.form.modelCode,
              paramCode: this.form.paramCode.join()
            };
            addParamModelRel(data).then(response => {
              this.msgSuccess("新增成功");
              this.open = false;
              this.submitLoading = false;
              this.getList();
            }).catch(()=> this.submitLoading = false);;
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
        return delParamModelRel(ids);
      }).then(() => {
        this.getList();
        this.msgSuccess("删除成功");
      })
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm('是否确认导出所有参数型号关系数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return exportParamModelRel(queryParams);
      }).then(response => {
        this.download(response.msg);
      })
    }
  }
};
</script>