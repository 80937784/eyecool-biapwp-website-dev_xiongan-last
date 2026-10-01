<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="场景编码" prop="channelCode">
        <el-input v-model="queryParams.channelCode" placeholder="请输入场景编码" clearable size="small" @keyup.enter.native="handleQuery" />
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
        <el-button type="warning" icon="el-icon-download" size="mini" @click="handleExport" v-hasPermi="['ocr:busilic:export']">导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" border :data="logList" @selection-change="handleSelectionChange" :default-sort = "{prop: 'receivedTime', order: 'descending'}">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="业务流水号" align="center" prop="receivedSeq" />
      <el-table-column label="请求时间" align="center" prop="receivedTime" width="180" sortable/>
      <el-table-column label="场景编码" align="center" prop="channelCode" />
      <el-table-column label="注册号" align="center" prop="busiLicRegisteredNo" />
      <el-table-column label="营业执照税号" align="center" prop="busiLicTaxNo" />
      <el-table-column label="公司名称" align="center" prop="busiLicName" />
      <el-table-column label="法定代表人" align="center" prop="busiLicOwner" />
      <el-table-column label="注册资金" align="center" prop="busiLicRegisteredCapital" />
      <el-table-column label="识别结果" align="center" prop="result" :formatter="resultFormat" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="100">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-info" @click="handleDetail(scope.row)" v-hasPermi="['ocr:busilic:query']">详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改营业执照OCR识别记录对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="800px" append-to-body :close-on-click-modal="false">
      <el-form ref="form" :model="form" label-width="120px" disabled>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="业务流水号" prop="receivedSeq">
              <el-input v-model="form.receivedSeq" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="请求时间" prop="receivedTime">
              <el-input v-model="form.receivedTime" />
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
            <el-form-item label="识别结果" prop="result">
              <el-select v-model="form.result" class="ec-form-select">
                <el-option v-for="dict in resultOptions" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="待识别证件照" prop="sceneImageUrl">
              <el-image :src="form.sceneImageUrl"></el-image>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="注册号" prop="busiLicRegisteredNo">
              <el-input v-model="form.busiLicRegisteredNo" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="营业执照签发号" prop="busiLicOriginationNo">
              <el-input v-model="form.busiLicOriginationNo" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="营业执照税号" prop="busiLicTaxNo">
              <el-input v-model="form.busiLicTaxNo" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="社会保险证号" prop="busiLicSocialInsuranceNo">
              <el-input v-model="form.busiLicSocialInsuranceNo" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="营业执照统计号" prop="busiLicStatisticNo">
              <el-input v-model="form.busiLicStatisticNo" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="公司名称" prop="busiLicName">
              <el-input v-model="form.busiLicName" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="公司地址" prop="busiLicAddress">
              <el-input v-model="form.busiLicAddress" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="法定代表人" prop="busiLicOwner">
              <el-input v-model="form.busiLicOwner" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="组成形式" prop="busiLicForm">
              <el-input v-model="form.busiLicForm" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="注册资金" prop="busiLicRegisteredCapital">
              <el-input v-model="form.busiLicRegisteredCapital" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="注册日期" prop="busiLicRegistryDate">
              <el-input v-model="form.busiLicRegistryDate" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="过期日期" prop="busiLicExpiryDate">
              <el-input v-model="form.busiLicExpiryDate" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="经营范围" prop="busiLicScope">
              <el-input v-model="form.busiLicScope" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="签发机关" prop="busiLicIssureAuthority">
              <el-input v-model="form.busiLicIssureAuthority" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="签发日期" prop="busiLicIssureDate">
              <el-input v-model="form.busiLicIssureDate" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="营业执照二维码" prop="busiLicQrCode">
              <el-input v-model="form.busiLicQrCode" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { listLog, getLog, exportLog } from "@/api/ocr/busilic";
import { asynctaskResult } from "@/api/common/asynctask";
import hasLoading from '@/utils/loading.js'

export default {
  name: "BusiLic",
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
      // 营业执照OCR识别记录表格数据
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
    /** 查询营业执照OCR识别记录列表 */
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
        busiLicRegisteredNo: null,
        busiLicOriginationNo: null,
        busiLicTaxNo: null,
        busiLicSocialInsuranceNo: null,
        busiLicStatisticNo: null,
        busiLicName: null,
        busiLicType: null,
        busiLicAddress: null,
        busiLicOwner: null,
        busiLicForm: null,
        busiLicRegisteredCapital: null,
        busiLicRegistryDate: null,
        busiLicExpiryDate: null,
        busiLicScope: null,
        busiLicIssureAuthority: null,
        busiLicIssureDate: null,
        busiLicQrCode: null,
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
        this.title = "营业执照OCR识别记录详情";
      });
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm('是否确认导出所有营业执照OCR识别记录数据项?', "警告", {
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