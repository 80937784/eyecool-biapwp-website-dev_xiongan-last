<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="型号编码" prop="modelCode">
        <el-input v-model="queryParams.modelCode" placeholder="请输入设备型号编码" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="型号名称" prop="modelName">
        <el-input v-model="queryParams.modelName" placeholder="请输入设备型号名称" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="cyan" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5" v-if="!isTenantUser">
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd" v-hasPermi="['device:model:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5" v-if="!isTenantUser">
        <el-button type="success" icon="el-icon-edit" size="mini" :disabled="single" @click="handleUpdate" v-hasPermi="['device:model:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5" v-if="!isTenantUser">
        <el-button type="danger" icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete" v-hasPermi="['device:model:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" icon="el-icon-download" size="mini" @click="handleExport" v-hasPermi="['device:model:export']">导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" border :data="modelList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="型号编码" align="center" prop="modelCode" width="180"/>
      <el-table-column label="型号名称" align="center" prop="modelName" />
      <el-table-column label="型号描述" align="center" prop="modelDesc" :show-overflow-tooltip="true" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180"/>
      <el-table-column label="修改时间" align="center" prop="updateTime" width="180"/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="100">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-info" @click="handleShowDetail(scope.row)" v-hasPermi="['device:model:query']">详细</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改设备型号信息对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="700px" append-to-body :close-on-click-modal="false">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px" :disabled="isShowDetailDialog">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="型号编码" prop="modelCode">
              <el-input v-model="form.modelCode" placeholder="请输入设备型号编码" :disabled="form.id !=null" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="型号名称" prop="modelName">
              <el-input v-model="form.modelName" placeholder="请输入设备型号名称" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" v-if="isShowDetailDialog">
          <el-col :span="12">
            <el-form-item label="创建人" prop="createBy">
              <el-input v-model="form.createBy" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="创建时间" prop="createTime">
              <el-input v-model="form.createTime" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" v-if="isShowDetailDialog">
          <el-col :span="12">
            <el-form-item label="修改人" prop="updateBy">
              <el-input v-model="form.updateBy" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="修改时间" prop="updateTime">
              <el-input v-model="form.updateTime" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="型号描述" prop="modelDesc">
              <el-input v-model="form.modelDesc" type="textarea" placeholder="请输入内容" />
            </el-form-item>
          </el-col>
        </el-row>
         <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="外观图片" v-if="!isShowDetailDialog">
              <upload-file  v-model="form.imageBase64" accept=".jpg,.jpeg,.png" />
            </el-form-item>
            <el-form-item label="外观图片" v-if="isShowDetailDialog && form.imageBase64" >
              <img :src="'data:image/jpeg;base64,' + form.imageBase64" width="100%"/>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer" v-if="!isShowDetailDialog">
        <el-button type="primary" :loading="submitLoading" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { listModel, getModel, delModel, addModel, updateModel, exportModel } from "@/api/device/model";
import UploadFile from '@/components/UploadFile';
export default {
  name: "DeviceModel",
  components: {
    UploadFile,
  },
  data() {
    return {
      // 提交加载
      submitLoading:false,
      // 遮罩层
      loading: true,
      // 型号名称
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
      // 设备型号信息表格数据
      modelList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        modelCode: null,
        modelName: null,
        tenantId: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        modelCode: [
          { required: true, message: "设备型号编码不能为空", trigger: "blur" }
        ],
        modelName: [
          { required: true, message: "设备型号名称不能为空", trigger: "blur" }
        ],
      },
      // 是否是详情展示
      isShowDetailDialog: false
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
    /** 查询设备型号信息列表 */
    getList() {
      this.loading = true;
      listModel(this.queryParams).then(response => {
        this.modelList = response.rows;
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
        modelCode: null,
        modelName: null,
        exteriorImage: null,
        imageBase64: null,
        modelDesc: null,
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
      this.deviceName = selection.map(item=>item.modelName)
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.isShowDetailDialog = false
      this.open = true;
      this.title = "添加设备型号信息";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      this.isShowDetailDialog = false
      const id = row.id || this.ids
      getModel(id).then(response => {
        this.form = response.data;
        this.form.imageBase64 = null;
        this.open = true;
        this.title = "修改设备型号信息";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.submitLoading = true;
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateModel(this.form).then(response => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
              this.submitLoading = false;
            });
          } else {
            addModel(this.form).then(response => {
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
      this.$confirm('是否确认删除型号名称为"' + this.deviceName + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return delModel(ids);
      }).then(() => {
        this.getList();
        this.msgSuccess("删除成功");
      })
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm('是否确认导出所有设备型号信息数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return exportModel(queryParams);
      }).then(response => {
        this.download(response.msg);
      })
    },
    /**显示详情信息 */
    handleShowDetail(row) {
      this.reset();
      const id = row.id || this.ids
      getModel(id).then(response => {
        this.form = response.data;
        this.title = "设备型号详细信息";
        this.isShowDetailDialog = true;
        this.open = true;
      });
    },
  }
};
</script>
