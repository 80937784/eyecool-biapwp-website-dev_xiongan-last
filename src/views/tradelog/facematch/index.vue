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
      <el-form-item label="设备编码" prop="deviceCode">
        <el-input v-model="queryParams.deviceCode" placeholder="请输入设备编码" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="设备名称" prop="deviceName">
        <el-input v-model="queryParams.deviceName" placeholder="请输入设备名称" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="设备型号" prop="deviceModel">
        <el-input v-model="queryParams.deviceModel" placeholder="请输入设备型号编码" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="比对结果" prop="result">
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
        <el-button type="warning" icon="el-icon-download" size="mini" @click="exportTipVisible = true" v-hasPermi="['tradelog:facematch:export']">导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" border :data="facematchList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="业务流水号" align="center" prop="receivedSeq" show-overflow-tooltip />
      <el-table-column label="人员标识" align="center" prop="uniqueId" />
      <el-table-column label="场景编码" align="center" prop="channelCode" />
      <el-table-column label="检活结果" align="center" prop="checkliveResult" :formatter="checkliveResultFormat" />
      <el-table-column label="比对结果" align="center" prop="result" :formatter="resultFormat" />
      <el-table-column label="请求时间" align="center" prop="receivedTime" width="180" />
      <el-table-column label="耗时(ms)" align="center" prop="timeUsed" />
      <el-table-column label="设备编码" align="center" prop="deviceCode" />
      <el-table-column label="温度(℃)" align="center" prop="temperature" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="120">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-info" @click="handleShowDetail(scope.row)" v-hasPermi="['tradelog:facematch:query']">详情</el-button>
          <el-button size="mini" type="text" icon="el-icon-message-solid" @click="handleShowHealthlog(scope.row)">健康码</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改人脸比对日志对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="800px" append-to-body :close-on-click-modal="false">
      <el-form ref="form" :model="form" label-width="110px" disabled>
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
            <el-form-item label="场景编码" prop="channelCode">
              <el-input v-model="form.channelCode" />
            </el-form-item>
          </el-col>
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
            <el-form-item label="检活分值" prop="checkliveScore">
              <el-input v-model="form.checkliveScore" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="检活结果" prop="checkliveResult">
              <el-select v-model="form.checkliveResult" class="ec-form-select">
                <el-option v-for="dict in resultOptions" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" v-if="form.healthCodeLog">
          <el-col :span="12">
            <el-form-item label="健康码描述">
              <el-input v-model="form.healthCodeLog.message" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="健康码耗时">
              <el-input v-model="form.healthCodeLog.timeUsed" />
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
              <el-input v-model="form.timeUsed" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="现场照">
              <img :src="'data:image/jpeg;base64,' + form.sceneImageBase64" width="120" height="160">
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="底库照">
              <img :src="'data:image/jpeg;base64,' + form.stockImageBase64" width="120" height="160">
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="芯片照">
              <img :src="'data:image/jpeg;base64,' + form.chipImageBase64" width="120" height="160">
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联网核查照">
              <img :src="'data:image/jpeg;base64,' + form.onlineImageBase64" width="120" height="160">
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="现场照与联网核查照比对分值" prop="sceneOnlineScore" class="ec-form-item--two">
              <el-input v-model="form.sceneOnlineScore" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="现场照与芯片照比对分值" prop="sceneChipScore" class="ec-form-item--two">
              <el-input v-model="form.sceneChipScore" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="现场照与底库照比对分值" prop="sceneStockScore" class="ec-form-item--two">
              <el-input v-model="form.sceneStockScore" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联网核查照与芯片照比对分值" prop="onlineChipScore" class="ec-form-item--two">
              <el-input v-model="form.onlineChipScore" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="现场照与联网核查照比对结果" prop="sceneOnlineResult" class="ec-form-item--two">
              <el-select v-model="form.sceneOnlineResult" class="ec-form-select">
                <el-option v-for="dict in resultOptions" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="现场照与芯片照比对结果" prop="sceneChipResult" class="ec-form-item--two">
              <el-select v-model="form.sceneChipResult" class="ec-form-select">
                <el-option v-for="dict in resultOptions" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="现场照与库底库照比对结果" prop="sceneStockResult" class="ec-form-item--two">
              <el-select v-model="form.sceneStockResult" class="ec-form-select">
                <el-option v-for=" dict in resultOptions" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联网核查照与芯片照比对结果" prop="onlineChipResult" class="ec-form-item--two">
              <el-select v-model="form.onlineChipResult" class="ec-form-select">
                <el-option v-for="dict in resultOptions" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="设备编码" prop="deviceCode">
                <el-input v-model="form.deviceCode" />
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
              <el-form-item label="设备型号" prop="deviceModel">
                <el-input v-model="form.deviceModel" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="设备IP" prop="deviceIp">
                <el-input v-model="form.deviceIp" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="设备经度" prop="deviceLongitude">
                <el-input v-model="form.deviceLongitude" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="设备维度" prop="deviceDimension">
                <el-input v-model="form.deviceDimension" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="设备方向" prop="deviceDirection">
                <el-select v-model="form.deviceDirection" class="ec-form-select">
                  <el-option v-for="dict in deviceDirectionOptions" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue"></el-option>
                </el-select>
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
              <el-form-item label="温度下限" prop="temperatureFloor">
                <el-input v-model="form.temperatureFloor" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="温度上限" prop="temperatureTop">
                <el-input v-model="form.temperatureTop" />
              </el-form-item>
            </el-col>
          </el-row>
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
import { listFacematch, getFacematch, exportFacematch } from "@/api/tradelog/facematch";
import { asynctaskResult } from "@/api/common/asynctask";
import hasLoading from '@/utils/loading.js'
import Treeselect from "@riophae/vue-treeselect";
import { treeselect } from "@/api/system/dept";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
export default {
  name: "Facematch",
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
      // 人脸比对日志表格数据
      facematchList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 比对结果(0通过，1未通过)字典
      resultOptions: [],
      // 设备方向(IN:进，OUT:出，UNKNOWN:未知)字典
      deviceDirectionOptions: [],
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
        deviceCode: null,
        deviceModel: null,
        deviceName: null,
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
    this.getDicts("bio_result").then(response => {
      this.resultOptions = response.data;
    });
    this.getDicts("device_direction").then(response => {
      this.deviceDirectionOptions = response.data;
    });
    this.getTreeselect();
  },
  methods: {
    /** 查询人脸比对日志列表 */
    getList () {
      this.loading = true;
      listFacematch(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
        this.facematchList = response.rows;
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
    // 现场照检活结果字典翻译
    checkliveResultFormat (row, column) {
      return this.selectDictLabel(this.resultOptions, row.checkliveResult);
    },
    // 比对结果(0通过，1未通过)字典翻译
    resultFormat (row, column) {
      return this.selectDictLabel(this.resultOptions, row.result);
    },
    // 设备方向(IN:进，OUT:出，UNKNOWN:未知)字典翻译
    deviceDirectionFormat (row, column) {
      return this.selectDictLabel(this.deviceDirectionOptions, row.deviceDirection);
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
        healthcodeLogId: null,
        uniqueId: null,
        deptId: null,
        channelCode: null,
        sceneImage: null,
        onlineImage: null,
        chipImage: null,
        stockImage: null,
        sceneVideo: null,
        sceneOnlineScore: null,
        sceneChipScore: null,
        sceneStockScore: null,
        onlineChipScore: null,
        checkliveScore: null,
        sceneOnlineResult: null,
        sceneChipResult: null,
        sceneStockResult: null,
        onlineChipResult: null,
        checkliveResult: null,
        result: null,
        temperature: null,
        temperatureFloor: null,
        temperatureTop: null,
        deviceCode: null,
        deviceName: null,
        deviceModel: null,
        deviceIp: null,
        deviceLongitude: null,
        deviceDimension: null,
        deviceDirection: null,
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
    /** 详情按钮操作 */
    handleShowDetail (row) {
      this.reset();
      const id = row.id
      getFacematch(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "人脸比对日志详情";
      });
    },
    /** 导出按钮操作 */
    handleExport () {
      this.exportTipVisible = false
      const queryParams = Object.assign({ exportLatestOnly: this.exportLatestOnly }, this.queryParams);
      exportFacematch(queryParams).then(response => {
        hasLoading.start();
        let taskId = response.msg;
        this.checkExportTask(taskId, (filename) => {
          this.download(filename);
        });
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
    // 查看健康码
    handleShowHealthlog (row) {
      if (!row.healthcodeLogId) {
        this.msgInfo('此交易没有健康码信息!')
        return
      }
      this.$router.push({ name: 'Healthcode', query: { healthcodeLogId: row.healthcodeLogId } })
    }
  }
};
</script>
