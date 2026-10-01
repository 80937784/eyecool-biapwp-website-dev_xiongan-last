<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="导入批次" prop="batchNum">
        <el-input v-model="queryParams.batchNum" placeholder="请输入批次号" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="批次说明" prop="batchDesc">
        <el-input v-model="queryParams.batchDesc" placeholder="请输入批次说明" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
     <!--  <el-form-item label="导入租户" prop="tenantId">
        <el-input v-model="queryParams.tenantId" placeholder="请输入导入租户ID" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item> -->
      <el-form-item>
        <el-button type="cyan" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="warning" icon="el-icon-download" size="mini" @click="handleExport" v-hasPermi="['device:batchlog:export']">导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" border :data="batchlogList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="导入批次" align="center" prop="batchNum" />
      <el-table-column label="导入租户" align="center" prop="tenantId" v-if="tenantEnabled" />
      <el-table-column label="批次说明" align="center" prop="batchDesc" :show-overflow-tooltip="true" />
      <el-table-column label="是否已回滚" align="center" prop="rollbacked" width="120">
        <template slot-scope="scope">
          <span>{{ scope.row.rollbacked ? '是' : '否'}}</span>
        </template>
      </el-table-column>
      <el-table-column label="回滚时间" align="center" prop="rollbackTime" width="180" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180"/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="180">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-info" @click="handleShowDetail(scope.row)" v-hasPermi="['device:batchlog:query']">详情</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleRollBack(scope.row)" v-hasPermi="['device:batchlog:rollback']">回滚</el-button>
          <el-button size="mini" type="text" icon="el-icon-s-unfold" @click="showBatchDeviceList(scope.row)" v-hasPermi="['device:info:list']">设备</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改设备批次对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="700px" append-to-body>
      <el-form ref="form" :model="form" label-width="80px" disabled>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="导入批次" prop="batchNum">
              <el-input v-model="form.batchNum" />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="tenantEnabled">
            <el-form-item label="导入租户" prop="tenantId">
              <el-input v-model="form.tenantId" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="是否回滚" prop="rollbacked">
              <el-input :value="form.rollbacked ? '是' : '否'" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="回滚时间" prop="rollbackTime">
              <el-input v-model="form.rollbackTime" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
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
        <el-form-item label="批次说明" prop="batchDesc">
          <el-input type="textarea" v-model="form.batchDesc" />
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { listBatchlog, getBatchlog, rollbackBatch, exportBatchlog } from "@/api/device/batchlog";

export default {
  name: "Batchlog",
  components: {
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
      // 设备批次表格数据
      batchlogList: [],
      form: {},
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        orderByColumn: 'create_time',
        isAsc: 'desc',
        batchNum: null,
        batchDesc: null,
        tenantId: null
      },
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
    /** 查询设备批次列表 */
    getList() {
      this.loading = true;
      listBatchlog(this.queryParams).then(response => {
        this.batchlogList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        batchNum: null,
        tenantId: null,
        batchDesc: null,
        rollbacked: null,
        rollbackTime: null,
        createTime: null,
        createBy: null,
        updateTime: null,
        updateBy: null
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
      this.$confirm('是否确认导出所有设备批次数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return exportBatchlog(queryParams);
      }).then(response => {
        this.download(response.msg);
      })
    },
    /**显示详情信息 */
    handleShowDetail(row) {
      this.reset();
      const id = row.id || this.ids
      getBatchlog(id).then(response => {
        this.form = response.data;
        this.title = "批次详细信息";
        this.open = true;
      });
    },
    /**导入回滚 */
    handleRollBack(row) {
      if (row.rollbacked == true) {
        this.msgError('批次[' + row.batchNum + ']设备已被回滚删除，请勿重复操作！');
        return;
      }
      this.$confirm('是否确认回滚删除[' + row.batchNum + ']批次导入设备?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return rollbackBatch(row.batchNum);
      }).then(() => {
        this.getList();
        this.msgSuccess("设备批次回滚删除成功");
      })
    },
    /**查看批次导入设备列表 */
    showBatchDeviceList(row){
       if (row.rollbacked == true) {
        this.msgInfo('批次[' + row.batchNum + ']设备不存在，已被回滚删除！');
        return;
      }
      this.$router.push({name:'Info', params:{tenantId:row.tenantId, importBatchNum: row.batchNum }})
    }
  }
};
</script>
