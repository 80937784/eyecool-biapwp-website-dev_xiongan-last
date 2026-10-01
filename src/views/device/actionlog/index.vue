<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="设备名称" prop="deviceName">
        <el-input v-model="queryParams.deviceName" placeholder="请输入设备名称" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="设备编号" prop="deviceNo">
        <el-input v-model="queryParams.deviceNo" placeholder="请输入设备编号" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="场景编码" prop="channelCode">
        <el-select class="ec-form-select" v-model="queryParams.channelCode" clearable filterable reserve-keyword placeholder="请输入场景名称检索">
          <el-option v-for="item in channelSelectOptions" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="型号编码" prop="modelCode">
        <el-select class="ec-form-select" v-model="queryParams.modelCode" clearable filterable reserve-keyword placeholder="请输入型号名称检索">
          <el-option v-for="item in modelSelectOptions" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="动作类型" prop="actionType">
        <el-select v-model="queryParams.actionType" placeholder="请选择动作类型" clearable size="small">
          <el-option v-for="dict in actionTypeOptions" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="cyan" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="warning" icon="el-icon-download" size="mini" @click="handleExport" v-hasPermi="['device:actionlog:export']">导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" border :data="actionlogList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="设备编号" align="center" prop="deviceNo" />
      <el-table-column label="设备名称" align="center" prop="deviceName" />
      <el-table-column label="场景编码" align="center" prop="channelCode" />
      <el-table-column label="型号编码" align="center" prop="modelCode" />
      <el-table-column label="动作类型" align="center" prop="actionType" :formatter="actionTypeFormat" />
      <el-table-column label="动作时间" align="center" prop="createTime" width="180"/>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />
  </div>
</template>

<script>
import { listActionlog, getActionlog, exportActionlog } from "@/api/device/actionlog";
import { listAllModel } from "@/api/device/model";
import { listAllChannel } from "@/api/scene/channel";
export default {
  name: "Actionlog",
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
      // 设备动作日志表格数据
      actionlogList: [],
      // 动作类型字典
      actionTypeOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        deviceName: null,
        deviceNo: null,
        channelCode: null,
        modelCode: null,
        actionType: null,
        tenantId: null
      },
      // 型号编码列表
      modelSelectOptions: [],
      // 场景列表
      channelSelectOptions: []
    };
  },
  created() {
    this.getList();
    this.getDicts("device_action_type").then(response => {
      this.actionTypeOptions = response.data;
    });
    this.listAllModel();
    this.listAllChannel();
  },
  methods: {
    /** 查询设备动作日志列表 */
    getList() {
      this.loading = true;
      listActionlog(this.queryParams).then(response => {
        this.actionlogList = response.rows;
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
    /** 查询所有场景列表 */
    listAllChannel() {
      this.channelSelectOptions = []
      listAllChannel().then(response => {
        if (response.data && response.data.length) {
          this.channelSelectOptions = response.data.map(item => {
            return {
              value: `${item.channelCode}`,
              label: `${item.channelName}`,
              channelId: `${item.id}`,
            };
          });
        }
      });
    },
    // 动作类型字典翻译
    actionTypeFormat(row, column) {
      return this.selectDictLabel(this.actionTypeOptions, row.actionType);
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
      this.$confirm('是否确认导出所有设备动作日志数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return exportActionlog(queryParams);
      }).then(response => {
        this.download(response.msg);
      })
    }
  }
};
</script>
