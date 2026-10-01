<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="70px">
      <el-form-item label="设备编号" prop="deviceNo">
        <el-input v-model="queryParams.deviceNo" placeholder="请输入设备编号" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="设备名称" prop="deviceName">
        <el-input v-model="queryParams.deviceName" placeholder="请输入设备名称" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="APP名称" prop="afterAppName">
        <el-input v-model="queryParams.afterAppName" placeholder="请输入升级后APP名称" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="APP版本" prop="afterVersion">
        <el-input v-model="queryParams.afterVersion" placeholder="请输入升级后APP版本号" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="更新状态" prop="upgradeStatus">
        <el-select v-model="queryParams.upgradeStatus" placeholder="请选择更新状态" clearable size="small">
          <el-option v-for="item in upgradeStatusOptions" :key="item.dictValue" :label="item.dictLabel" :value="item.dictValue">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="cyan" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="warning" icon="el-icon-download" size="mini" @click="handleExport" v-hasPermi="['device:upgradelog:export']">导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" border :data="upgradelogList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="设备编号" align="center" prop="deviceNo" />
      <el-table-column label="设备名称" align="center" prop="deviceName" />
      <el-table-column label="原始版本" align="center" prop="beforeAppName">
        <template slot-scope="scope">
          <span>{{scope.row.beforeAppName ? scope.row.beforeAppName+'_'+scope.row.beforeVersion : '-'}}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新版本" align="center" prop="afterAppName">
        <template slot-scope="scope">
          <span>{{scope.row.afterAppName ? scope.row.afterAppName+'_'+scope.row.afterVersion : '-'}}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新状态" align="center" prop="upgradeStatus" :formatter="upgradeStatusFormat" />
      <el-table-column label="升级耗时(s)" align="center" prop="timeUsed">
        <template slot-scope="scope">
          <span>{{scope.row.timeUsed ? scope.row.timeUsed : '-'}}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180"/>
      <el-table-column label="修改时间" align="center" prop="updateTime" width="180"/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="100">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-info" @click="handleShowDetail(scope.row)" v-hasPermi="['device:upgradelog:query']">详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改升级日志对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="700px" append-to-body :close-on-click-modal="false">
      <el-form ref="form" :model="form" label-width="110px" disabled>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="设备编号" prop="deviceNo">
              <el-input v-model="form.deviceNo" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="设备名称" prop="deviceName">
              <el-input v-model="form.deviceName" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="原始版本" prop="beforeAppName">
              <el-input :value="form.beforeAppName ? form.beforeAppName + '_' + form.beforeVersion : '-'" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="更新版本" prop="afterAppName">
              <el-input :value="form.afterAppName ? form.afterAppName + '_' + form.afterVersion : '-'" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="设备时间" prop="clientTime">
              <el-input :value="form.clientTime" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="升级耗时" prop="timeUsed">
              <el-input v-model="form.timeUsed">
                <span slot="append">秒</span>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="后端时间" prop="serverTime">
              <el-input :value="form.serverTime" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="更新状态" prop="upgradeStatus">
              <el-select v-model="form.upgradeStatus" size="small" class="ec-form-select">
                <el-option v-for="item in upgradeStatusOptions" :key="item.dictValue" :label="item.dictLabel" :value="item.dictValue">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="创建时间" prop="createTime">
              <el-input v-model="form.createTime" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="修改时间" prop="updateTime">
              <el-input v-model="form.updateTime" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="结果说明" prop="failReason">
          <el-input v-model="form.failReason" type="textarea" />
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { listUpgradelog, getUpgradelog, exportUpgradelog } from "@/api/device/upgrade/log";

export default {
  name: "Upgradelog",
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
      // 升级日志表格数据
      upgradelogList: [],
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
        deviceNo: null,
        deviceName: null,
        afterAppName: null,
        afterVersion: null,
        upgradeStatus: null,
        taskId: null
      },
      // 表单参数
      form: {},
      // 更新状态选项
      upgradeStatusOptions: []
    };
  },
  created() {
    this.getList();
    this.getDicts("device_upgrade_status").then(response => {
      this.upgradeStatusOptions = response.data;
    });
  },
  methods: {
    /** 查询升级日志列表 */
    getList() {
      this.loading = true;
      const taskId = this.$route.query.taskId;
      if (taskId) {
        this.queryParams.taskId = taskId;
      }
      listUpgradelog(this.queryParams).then(response => {
        this.upgradelogList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        taskId: null,
        deviceNo: null,
        deviceName: null,
        beforeAppName: null,
        afterAppName: null,
        beforeVersion: null,
        afterVersion: null,
        upgradeStatus: "0",
        clientTime: null,
        serverTime: null,
        timeUsed: null,
        failReason: null,
        createTime: null,
        updateTime: null,
        batchDate: null,
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
      this.multiple = !selection.length
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm('是否确认导出所有升级日志数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return exportUpgradelog(queryParams);
      }).then(response => {
        this.download(response.msg);
      })
    },
    /**详情展示 */
    handleShowDetail(row) {
      this.reset();
      getUpgradelog(row.id).then(res => {
        this.form = res.data;
        this.open = true;
        this.title = "升级日志详情";
      })
    },
    // 更新状态字典翻译
    upgradeStatusFormat(row, column) {
      return this.selectDictLabel(this.upgradeStatusOptions, row.upgradeStatus);
    }
  }
};
</script>
