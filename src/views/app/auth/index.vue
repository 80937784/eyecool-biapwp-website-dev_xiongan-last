<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="应用信息" prop="appId">
        <el-select v-model="queryParams.appId" placeholder="请选择应用信息" clearable size="small">
          <el-option v-for="item in appInfoList" :key="item.id" :label="item.appDesc" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="交易接口" prop="transCode">
        <el-select v-model="queryParams.transCode" placeholder="请选择交易接口" clearable size="small">
          <el-option v-for="dict in transCodeOptions" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="cyan" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd" v-hasPermi="['app:auth:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" icon="el-icon-edit" size="mini" :disabled="single" @click="handleUpdate" v-hasPermi="['app:auth:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete" v-hasPermi="['app:auth:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" icon="el-icon-download" size="mini" @click="handleExport" v-hasPermi="['app:auth:export']">导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" border :data="authList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="应用信息" align="center" prop="appDesc" />
      <el-table-column label="接口交易码" align="center" prop="transCode" />
      <el-table-column label="接口描述" align="center" prop="transCode" :formatter="transCodeFormat" />
      <el-table-column label="有效截止时间" align="center" prop="transEndTime" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180"/>
      <el-table-column label="修改时间" align="center" prop="updateTime" width="180"/>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改应用接口授权对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="700px" append-to-body :close-on-click-modal="false">
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="选择应用" prop="appId">
          <el-select v-model="form.appId" placeholder="请选择应用信息" clearable class="ec-form-select" :disabled="form.id!=null">
            <el-option v-for="item in appInfoList" :key="item.id" :label="item.appDesc" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="交易接口" prop="transCode">
          <el-select v-model="form.transCode" placeholder="请选择交易接口" multiple filterable clearable collapse-tags class="ec-form-select" :disabled="form.id!=null">
            <el-option v-for="dict in transCodeOptions" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue">
              <span style="float: left">{{ dict.dictLabel }}</span>
              <span style="float: left; color: #8492a6; font-size: 13px">【{{ dict.dictValue }}】</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="截止时间" prop="transEndTime">
          <el-date-picker clearable size="small" style="width: 100%" v-model="form.transEndTime" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" placeholder="选择截止时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input type="textarea" v-model="form.remark" maxlength="150" placeholder="请输入备注" />
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
import { listAuth, getAuth, delAuth, addAuth, updateAuth, exportAuth, listTenantInteraface } from "@/api/app/auth";
import { listAllInfo } from "@/api/app/info";

export default {
  name: "Auth",
  components: {
  },
  data() {
    return {
      // 提交加载
      submitLoading:false,
      // 遮罩层
      loading: true,
      // 删除名称
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
      // 应用接口授权表格数据
      authList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 接口交易码字典
      transCodeOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        appId: null,
        transCode: null,
        transEndTime: null,
        tenantId: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        appId: [
          { required: true, message: "应用信息不能为空", trigger: "change" }
        ],
        transCode: [
          { required: true, message: "交易接口不能为空", trigger: "change" }
        ],
        transEndTime: [
          { required: true, message: "截止时间不能为空", trigger: "change" }
        ]
      },
      // 所有应用系统列表
      appInfoList: []
    };
  },
  watch: {
    '$route': {
      // val是改变之后的路由，oldVal是改变之前的val
      handler: function (val, oldVal) {
        if (val.name !== 'Auth') {
          return;
        }
        if (val.params.appId) {
          this.queryParams.appId = val.params.appId;
        }
        this.getList();
      },
      // 深度观察监听
      deep: true,
      immediate: true
    }
  },
  created() {
    this.listAllAppInfo();
    this.listTenantInteraface();
  },
  methods: {
    /** 查询应用接口授权列表 */
    getList() {
      this.loading = true;
      listAuth(this.queryParams).then(response => {
        this.authList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    /**查询所有应用 */
    listAllAppInfo() {
      this.appInfoList = []
      listAllInfo().then(res => {
        this.appInfoList = res.data;
      })
    },
    // 查询租户所有接口列表
    listTenantInteraface() {
      listTenantInteraface().then(res => {
        this.transCodeOptions = res.data
      })
    },
    // 接口交易码字典翻译
    transCodeFormat(row, column) {
      return this.selectDictLabel(this.transCodeOptions, row.transCode);
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
        transCode: null,
        transEndTime: null,
        remark: null,
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
      this.deviceName = selection.map(item => item.transCode)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加应用接口授权";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getAuth(id).then(response => {
        this.form = response.data;
        this.form.transCode = [this.form.transCode];
        this.open = true;
        this.title = "修改应用接口授权";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        this.submitLoading = true;
        if (valid) {
          const data = JSON.parse(JSON.stringify(this.form));
          data.transCode = this.form.transCode.join();
          if (this.form.id != null) {
            updateAuth(data).then(response => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.submitLoading = false;
              this.getList();
            }).catch(()=> {
              this.submitLoading = false;
            });
          } else {
            addAuth(data).then(response => {
              this.msgSuccess("新增成功");
              this.open = false;
              this.submitLoading = false;
              this.getList();
            }).catch(()=> {
              this.submitLoading = false;
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$confirm('是否确认删除接口交易码为"' + this.deviceName + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return delAuth(ids);
      }).then(() => {
        this.getList();
        this.msgSuccess("删除成功");
      })
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm('是否确认导出所有应用接口授权数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return exportAuth(queryParams);
      }).then(response => {
        this.download(response.msg);
      })
    }
  }
};
</script>
