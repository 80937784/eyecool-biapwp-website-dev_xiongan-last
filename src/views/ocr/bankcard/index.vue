<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="场景编码" prop="channelCode">
        <el-input v-model="queryParams.channelCode" placeholder="请输入场景编码" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="银行名称" prop="bankCardBankName">
        <el-input v-model="queryParams.bankCardBankName" placeholder="请输入银行名称" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="识别结果" prop="result">
        <el-select v-model="queryParams.result" class="ec-form-select" size="small">
          <el-option v-for="dict in resultOptions" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="cyan" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="warning" icon="el-icon-download" size="mini" @click="handleExport" v-hasPermi="['ocr:bankcard:export']">导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" border :data="logList" @selection-change="handleSelectionChange" :default-sort = "{prop: 'receivedTime', order: 'descending'}">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="业务流水号" align="center" prop="receivedSeq" />
      <el-table-column label="请求时间" align="center" prop="receivedTime" width="180" sortable />
      <el-table-column label="场景编码" align="center" prop="channelCode" />
      <el-table-column label="有效期" align="center" prop="bankCardExpiryDate" />
      <el-table-column label="银行名称" align="center" prop="bankCardBankName" />
      <el-table-column label="卡号" align="center" prop="bankCardNumber" />
      <el-table-column label="识别结果" align="center" prop="result" :formatter="resultFormat" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="100">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-info" @click="handleDetail(scope.row)" v-hasPermi="['ocr:bankcard:query']">详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改银行卡OCR识别记录对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body :close-on-click-modal="false">
      <el-form ref="form" :model="form" label-width="85px" disabled>
        <el-form-item label="业务流水号" prop="receivedSeq">
          <el-input v-model="form.receivedSeq" />
        </el-form-item>
        <el-form-item label="请求时间" prop="receivedTime">
          <el-input v-model="form.receivedTime" />
        </el-form-item>
        <el-form-item label="场景编码" prop="channelCode">
          <el-input v-model="form.channelCode" />
        </el-form-item>
        <el-form-item label="证件照" prop="sceneImageUrl">
          <el-image :src="form.sceneImageUrl"></el-image>
        </el-form-item>
        <el-form-item label="有效期" prop="bankCardExpiryDate">
          <el-input v-model="form.bankCardExpiryDate" />
        </el-form-item>
        <el-form-item label="银行名称" prop="bankCardBankName">
          <el-input v-model="form.bankCardBankName" />
        </el-form-item>
        <el-form-item label="银行编号" prop="bankCardBankCode">
          <el-input v-model="form.bankCardBankCode" />
        </el-form-item>
        <el-form-item label="卡名" prop="bankCardName">
          <el-input v-model="form.bankCardName" />
        </el-form-item>
        <el-form-item label="卡号" prop="bankCardNumber">
          <el-input v-model="form.bankCardNumber" />
        </el-form-item>
        <el-form-item label="识别结果" prop="result">
          <el-select v-model="form.result" class="ec-form-select">
            <el-option v-for="dict in resultOptions" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { listLog, getLog, exportLog } from "@/api/ocr/bankcard";
import { asynctaskResult } from "@/api/common/asynctask";
import hasLoading from '@/utils/loading.js'
export default {
  name: "BankCard",
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
      // 银行卡OCR识别记录表格数据
      logList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        channelCode: null,
        bankCardBankName: null,
        result: null,
        tenantId: null
      },
      // 表单参数
      form: {},
      // 结果(0通过，1未通过)字典
      resultOptions: []
    };
  },
  created() {
    this.getDicts("bio_result").then(response => {
      this.resultOptions = response.data;
    });
    this.getList();
    this.getDicts("bio_result").then(response => {
      this.resultOptions = response.data;
    });
  },
  methods: {
    /** 查询银行卡OCR识别记录列表 */
    getList() {
      this.loading = true;
      listLog(this.queryParams).then(response => {
        this.logList = response.rows;
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
        handleSeq: null,
        receivedSeq: null,
        receivedTime: null,
        type: null,
        typeId: null,
        channelCode: null,
        sceneImageUrl: null,
        sceneImageName: null,
        bankCardExpiryDate: null,
        bankCardBankName: null,
        bankCardBankCode: null,
        bankCardName: null,
        bankCardType: null,
        bankCardNumber: null,
        result: null,
        tenantId: null
      };
      this.resetForm("form");
    },
    resultFormat(row, column) {
      return this.selectDictLabel(this.resultOptions, row.result);
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
    /** 详情按钮操作 */
    handleDetail(row) {
      this.reset();
      const id = row.id || this.ids
      getLog(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "银行卡OCR识别记录详情";
      });
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm('是否确认导出所有银行卡OCR识别记录数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return exportLog(queryParams);
      }).then(response => {
         hasLoading.start();
        // this.OPEN_PROGRESS();
        let taskId = response.msg;
        this.checkExportTask(taskId, (filename) => {
          this.download(filename);
        });
        // this.download(response.msg);
      })
    },
      /**检测导出任务执行结果 */
    checkExportTask(taskId, callback) {
      this.getExportTaskResult(taskId).then(res => {
        let filename = res.msg;
        if (filename && filename.length) {
          // this.CHANGE_PERCENTAGE();
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

    // 结果(0通过，1未通过)字典翻译
    resultFormat(row, column) {
      return this.selectDictLabel(this.resultOptions, row.result);
    },
  }
};
</script>
