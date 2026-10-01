<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="85px">
      <el-form-item label="业务流水号" prop="receivedSeq">
        <el-input v-model="queryParams.receivedSeq" placeholder="请输入业务流水号" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="人员标识" prop="uniqueId">
        <el-input v-model="queryParams.uniqueId" placeholder="请输入人员标识" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="结果" prop="result">
        <el-select v-model="queryParams.result" placeholder="请选择结果" clearable size="small">
          <el-option v-for="dict in resultOptions" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue" />
        </el-select>
      </el-form-item>
      <el-form-item label="设备编号" prop="deviceCode">
        <el-input v-model="queryParams.deviceCode" placeholder="请输入设备编号" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="请求时间">
        <el-date-picker v-model="dateRange" size="small" style="width: 240px" value-format="yyyy-MM-dd" type="daterange" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="cyan" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="warning" icon="el-icon-download" size="mini" @click="handleExport" v-hasPermi="['tradelog:healthcode:export']">导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" border :data="healthcodeList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="业务流水号" align="center" prop="receivedSeq" />
      <el-table-column label="人员标识" align="center" prop="uniqueId" />
      <el-table-column label="结果" align="center" prop="result" :formatter="resultFormat" />
      <el-table-column label="设备编号" align="center" prop="deviceCode" />
      <el-table-column label="温度(℃)" align="center" prop="temperature" />
      <el-table-column label="区域" align="center" prop="region" />
      <el-table-column label="请求时间" align="center" prop="receivedTime" width="180" />
      <el-table-column label="用时ms" align="center" prop="timeUsed" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="120">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-info" @click="handleShowDetail(scope.row)" v-hasPermi="['tradelog:healthcode:query']">详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改健康码请求对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="700px" append-to-body :close-on-click-modal="false">
      <el-form ref="form" :model="form" label-width="85px" disabled>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="业务流水号" prop="receivedSeq">
              <el-input v-model="form.receivedSeq" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="人员标识" prop="uniqueId">
              <el-input v-model="form.uniqueId" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="结果" prop="result">
              <el-select v-model="form.result" class="ec-form-select">
                <el-option v-for="dict in resultOptions" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结果描述" prop="message">
              <el-input v-model="form.message" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="设备编号" prop="deviceCode">
              <el-input v-model="form.deviceCode" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="温度(℃)" prop="temperature">
              <el-input v-model="form.temperature" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="车牌号" prop="carNo">
              <el-input v-model="form.carNo" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="区域" prop="region">
              <el-input v-model="form.region" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="请求时间" prop="receivedTime">
              <el-input v-model="form.receivedTime" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="耗时(ms)" prop="timeUsed">
              <el-input v-model="form.timeUsed" placeholder="请输入耗时(ms)" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { listHealthcode, getHealthcode, exportHealthcode } from "@/api/tradelog/healthcode";
import { asynctaskResult } from "@/api/common/asynctask";
import hasLoading from '@/utils/loading.js'
export default {
  name: "Healthcode",
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
      // 健康码请求表格数据
      healthcodeList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 结果字典
      resultOptions: [],
      // 日期范围
      dateRange: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        orderByColumn: 'received_time',
        isAsc: 'desc',
        id: null,
        receivedSeq: null,
        uniqueId: null,
        result: null,
        deviceCode: null,
        tenantId: null
      },
      // 表单参数
      form: {}
    };
  },
  created() {
    this.getList();
    this.getDicts("bio_result").then(response => {
      this.resultOptions = response.data;
    });
  },
  methods: {
    /** 查询健康码请求列表 */
    getList() {
      this.loading = true;
      const healthcodeLogId = this.$route.query.healthcodeLogId;
      if (healthcodeLogId) {
        this.queryParams.id = healthcodeLogId;
      }
      listHealthcode(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
        this.healthcodeList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 结果字典翻译
    resultFormat(row, column) {
      return this.selectDictLabel(this.resultOptions, row.result);
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
        receivedSeq: null,
        uniqueId: null,
        receivedTime: null,
        result: null,
        message: null,
        deviceCode: null,
        temperature: null,
        carNo: null,
        region: null,
        timeUsed: null,
        createTime: null,
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
      this.dateRange = [];
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 详情操作 */
    handleShowDetail(row) {
      this.reset();
      const id = row.id
      getHealthcode(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "健康码日志详情";
      });
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm('是否确认导出所有健康码请求数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return exportHealthcode(queryParams);
      }).then(response => {  
          hasLoading.start();
          let taskId = response.msg;
          this.checkExportTask(taskId, (filename) => {
            this.download(filename);
          });
        })
    },
     /**检测导出任务执行结果 */
    checkExportTask(taskId, callback) {
      this.getExportTaskResult(taskId).then(res => { 
        let filename = res.msg;
        if (filename && filename.length) {
          hasLoading.end();
          callback(filename);
          return;
        }
        setTimeout(() => {
          this.checkExportTask(taskId, callback);
        }, 100);
      }).catch(()=> hasLoading.end());
    },
    /**获取异步任务执行结果 */
    async getExportTaskResult(taskId) {
      return await asynctaskResult(taskId).then(res => {
        return res.data;
      });
    },
  }
};
</script>
