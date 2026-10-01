<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="85px">
      <el-form-item label="业务流水号" prop="receivedSeq">
        <el-input v-model="queryParams.receivedSeq" placeholder="请输入业务流水号" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="人员标识" prop="uniqueId">
        <el-input v-model="queryParams.uniqueId" placeholder="请输入人员标识" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="选择部门" prop="deptId">
        <treeselect v-model="queryParams.deptId" style="width:230px" :options="deptOptions" :show-count="true" placeholder="请选择部门" />
      </el-form-item>
      <el-form-item label="场景编码" prop="channelCode">
        <el-input v-model="queryParams.channelCode" placeholder="请输入场景编码" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="子场景编码" prop="subTreasuryCode">
        <el-input v-model="queryParams.subTreasuryCode" placeholder="请输入子场景编码" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="结果" prop="result">
        <el-select v-model="queryParams.result" placeholder="请选择结果" clearable size="small">
          <el-option v-for="dict in resultOptions" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue" />
        </el-select>
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
        <el-button type="warning" icon="el-icon-download" size="mini" @click="exportTipVisible = true" v-hasPermi="['tradelog:fingerVeinSearch:export']">导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" border :data="fingersearchList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="业务流水号" align="center" prop="receivedSeq" />
      <el-table-column label="人员标识" align="center" prop="uniqueId" />
      <el-table-column label="场景编码" align="center" prop="channelCode" />
      <el-table-column label="结果" align="center" prop="result" :formatter="resultFormat" />
      <el-table-column label="请求时间" align="center" prop="receivedTime" width="180" />
      <el-table-column label="耗时(ms)" align="center" prop="timeUsed" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="120">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-info" @click="handleShowDetail(scope.row)" v-hasPermi="['tradelog:fingerVeinSearch:query']">详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改指纹搜索日志对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="800px" append-to-body :close-on-click-modal="false">
      <el-form ref="form" :model="form" label-width="85px" disabled>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="业务流水号" prop="receivedSeq">
              <el-input v-model="form.receivedSeq" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="日志类型" prop="sceneType">
              <el-select v-model="form.sceneType" class="ec-form-select">
                <el-option v-for="dict in sceneTypeOptions" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="场景编码" prop="channelCode">
              <el-input v-model="form.channelCode" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="子场景编码" prop="subTreasuryCode">
              <el-input v-model="form.subTreasuryCode" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="子场景名称" prop="subTreasuryName">
              <el-input v-model="form.subTreasuryName" />
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
            <el-form-item label="比对结果" prop="result">
              <el-select v-model="form.result" class="ec-form-select">
                <el-option v-for="dict in resultOptions" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue"></el-option>
              </el-select>
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
    <el-dialog title="导出提示" :visible.sync="exportTipVisible" width="30%">
      <div style="margin-bottom: 30px;">是否仅导出符合条件的最新识别记录？</div>
      <div>
        <el-radio v-model="exportLatestOnly" :label="true" border>是</el-radio>
        <el-radio v-model="exportLatestOnly" :label="false" border>否</el-radio>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="exportTipVisible = false">取消</el-button>
        <el-button type="primary" @click="handleExport">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getFingerVeinList, getFingerVeinListDetail, exprotFingerVein } from "@/api/tradelog/fingerveinsearch";
import { asynctaskResult } from "@/api/common/asynctask";
import hasLoading from '@/utils/loading.js'
import Treeselect from "@riophae/vue-treeselect";
import { treeselect } from "@/api/system/dept";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
export default {
  name: "Fingersearch",
  components: { Treeselect },
  data () {
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
      // 指纹搜索日志表格数据
      fingersearchList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 类型(数据字典 1：基础入库1:N，2：比对接口1:N，3：日志回传)字典
      sceneTypeOptions: [],
      // 手指编码字典
      fingerNoOptions: [],
      // 结果字典
      resultOptions: [],
      // 日期范围
      dateRange: [],
      // 部门树选项
      deptOptions: undefined,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        orderByColumn: 'received_time',
        isAsc: 'desc',
        receivedSeq: null,
        uniqueId: null,
        channelCode: null,
        subTreasuryCode: null,
        result: null,
        tenantId: null
      },
      // 表单参数
      form: {},
      // 导出选择框
      exportTipVisible: false,
      exportLatestOnly: true
    };
  },
  created () {
    this.getList();
    this.getDicts("search_log_type").then(response => {
      this.sceneTypeOptions = response.data;
    });
    this.getDicts("bio_finger_code").then(response => {
      this.fingerNoOptions = response.data;
    });
    this.getDicts("bio_result").then(response => {
      this.resultOptions = response.data;
    });
    this.getTreeselect();
  },
  methods: {
    /** 查询指纹搜索日志列表 */
    getList () {
      this.loading = true;
      getFingerVeinList(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
        this.fingersearchList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    /** 查询部门下拉树结构 */
    getTreeselect () {
      treeselect().then(response => {
        this.deptOptions = response.data;
      });
    },
    // 类型(数据字典 1：基础入库1:N，2：比对接口1:N，3：日志回传)字典翻译
    sceneTypeFormat (row, column) {
      return this.selectDictLabel(this.sceneTypeOptions, row.sceneType);
    },
    // 手指编码字典翻译
    fingerNoFormat (row, column) {
      return this.selectDictLabel(this.fingerNoOptions, row.fingerNo);
    },
    // 结果字典翻译
    resultFormat (row, column) {
      return this.selectDictLabel(this.resultOptions, row.result);
    },
    // 取消按钮
    cancel () {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset () {
      this.form = {
        id: null,
        receivedSeq: null,
        sceneType: null,
        uniqueId: null,
        deptId: null,
        channelCode: null,
        subTreasuryCode: null,
        subTreasuryName: null,
        fingerNo: null,
        sceneImage: null,
        stockImage: null,
        sceneStockScore: null,
        result: null,
        receivedTime: null,
        timeUsed: null,
        serverId: null,
        vendorCode: null,
        algsVersion: null,
        createTime: null,
        batchDate: null,
        tenantId: null
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery () {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery () {
      this.dateRange = [];
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange (selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 详情展示操作 */
    handleShowDetail (row) {
      this.reset();
      const id = row.id || this.ids
      getFingerVeinListDetail(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "指静脉搜索日志详情";
      });
    },
    /** 导出按钮操作 */
    handleExport () {
      this.exportTipVisible = false
      const queryParams = Object.assign({ exportLatestOnly: this.exportLatestOnly }, this.queryParams);
      exprotFingerVein(queryParams).then(response => {
        //   hasLoading.start();
        //   let taskId = response.msg;
        //   this.checkExportTask(taskId, (filename) => {
        this.download(response.msg);
        //   });
      })
    },
    /**检测导出任务执行结果 */
    checkExportTask (taskId, callback) {
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
      }).catch(() => hasLoading.end());
    },
    /**获取异步任务执行结果 */
    async getExportTaskResult (taskId) {
      return await asynctaskResult(taskId).then(res => {
        return res.data;
      });
    },
  }
};
</script>
