<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="85px">
      <el-form-item label="业务流水号" prop="receivedSeq">
        <el-input v-model="queryParams.receivedSeq" placeholder="请输入业务流水号" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="人员标识" prop="uniqueId">
        <el-input v-model="queryParams.uniqueId" placeholder="请输入人员唯一标识" clearable size="small" @keyup.enter.native="handleQuery" />
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
      <el-form-item label="比对结果" prop="result">
        <el-select v-model="queryParams.result" placeholder="请选择结果" clearable size="small">
          <el-option v-for="dict in resultOptions" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue" />
        </el-select>
      </el-form-item>
      <el-form-item label="设备编码" prop="deviceSn">
        <el-input v-model="queryParams.deviceSn" placeholder="请输入设备编码" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="设备型号" prop="deviceModel">
        <el-input v-model="queryParams.deviceModel" placeholder="请输入设备型号编码" clearable size="small" @keyup.enter.native="handleQuery" />
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
        <el-button type="warning" icon="el-icon-download" size="mini" @click="exportTipVisible = true" v-hasPermi="['tradelog:faceirisMatch:export']">导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="faceirisMatchList" @selection-change="handleSelectionChange" border>
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="业务流水号" align="center" prop="receivedSeq" show-overflow-tooltip />
      <el-table-column label="人员标识" align="center" prop="uniqueId" />
      <el-table-column label="场景编码" align="center" prop="channelCode" />
      <el-table-column label="比对模式" align="center" prop="matchMode" :formatter="matchModeFormat" />
      <el-table-column label="比对分数" align="center" prop="matchScore" />
      <el-table-column label="比对结果" align="center" prop="result" :formatter="resultFormat" />
      <el-table-column label="请求时间" align="center" prop="receivedTime" />
      <el-table-column label="耗时(ms)" align="center" prop="timeUsed" />
      <el-table-column label="温度" align="center" prop="temperature" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-info" @click="handleShowDetail(scope.row)" v-hasPermi="['tradelog:faceirisSearch:query']">详情</el-button>
          <el-button size="mini" type="text" icon="el-icon-message-solid" @click="handleShowHealthlog(scope.row)">健康码</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改人脸虹膜多模态比对日志对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="800px" append-to-body :close-on-click-modal="false">
      <el-form ref="form" :model="form" label-width="85px" disabled>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="业务流水号" prop="receivedSeq">
              <el-input v-model="form.receivedSeq" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="场景编码" prop="channelCode">
              <el-input v-model="form.channelCode" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="人员标识" prop="uniqueId">
              <el-input v-model="form.uniqueId" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="比对模式" prop="matchMode">
              <el-select v-model="form.matchMode" class="ec-form-select">
                <el-option v-for="dict in matchModeOptions" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="人脸现场照">
              <img :src="'data:image/jpeg;base64,' + form.sceneFaceImageBase64" width="120" height="160">
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="虹膜现场照">
              <img :src="'data:image/jpeg;base64,' + form.sceneIrisImageBase64" width="200" height="160">
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="人脸底库照">
              <img :src="'data:image/jpeg;base64,' + form.stockFaceImageBase64" width="120" height="160">
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="虹膜底库照">
              <img :src="'data:image/jpeg;base64,' + form.stockIrisImageBase64" width="200" height="160">
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="人脸分数" prop="sceneFaceScore">
              <el-input v-model="form.sceneFaceScore" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="虹膜分数" prop="sceneIrisScore">
              <el-input v-model="form.sceneIrisScore" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="人脸用时" prop="faceTimeUsed">
              <el-input v-model="form.faceTimeUsed" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="虹膜用时" prop="irisTimeUsed">
              <el-input v-model="form.irisTimeUsed" />
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
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="比对分数" prop="matchScore">
              <el-input v-model="form.matchScore" />
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
            <el-form-item label="设备编码" prop="deviceSn">
              <el-input v-model="form.deviceSn" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="设备型号" prop="deviceModel">
              <el-input v-model="form.deviceModel" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="设备名称" prop="deviceName">
              <el-input v-model="form.deviceName" />
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
        <el-form-item label="备注" prop="remark">
          <el-input type="textarea" v-model="form.remark" />
        </el-form-item>
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
import { listFaceirisMatch, getFaceirisMatch, exportFaceirisMatch } from "@/api/tradelog/faceirisMatch";
import { asynctaskResult } from "@/api/common/asynctask";
import Treeselect from "@riophae/vue-treeselect";
import { treeselect } from "@/api/system/dept";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import hasLoading from '@/utils/loading.js'
export default {
  name: "FaceirisMatch",
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
      // 人脸虹膜多模态比对日志表格数据
      faceirisMatchList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 比对模式字典matchMode字典
      matchModeOptions: [],
      // 检活结果(0通过，1未通过)字典
      checkliveResultOptions: [],
      // 结果(0通过，1未通过)字典
      resultOptions: [],
      // 设备方向(IN:进，OUT:出，UNKNOWN：未知)字典
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
        subTreasuryCode: null,
        result: null,
        deviceSn: null,
        deviceModel: null,
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
    this.getDicts("match_mode").then(response => {
      this.matchModeOptions = response.data;
    });
    this.getDicts("bio_result").then(response => {
      this.checkliveResultOptions = response.data;
    });
    this.getDicts("bio_result").then(response => {
      this.resultOptions = response.data;
    });
    this.getDicts("device_direction").then(response => {
      this.deviceDirectionOptions = response.data;
    });
    this.getTreeselect();
  },
  methods: {
    /** 查询人脸虹膜多模态比对日志列表 */
    getList () {
      this.loading = true;
      listFaceirisMatch(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
        this.faceirisMatchList = response.rows;
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
    // 比对模式字典matchMode字典
    matchModeFormat (row, column) {
      return this.selectDictLabel(this.matchModeOptions, row.matchMode);
    },
    // 检活结果(0通过，1未通过)字典翻译
    checkliveResultFormat (row, column) {
      return this.selectDictLabel(this.checkliveResultOptions, row.checkliveResult);
    },
    // 结果(0通过，1未通过)字典翻译
    resultFormat (row, column) {
      return this.selectDictLabel(this.resultOptions, row.result);
    },
    // 设备方向(IN:进，OUT:出，UNKNOWN：未知)字典翻译
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
        deptName: null,
        personName: null,
        channelCode: null,
        sceneFaceImage: null,
        sceneIrisImage: null,
        sceneFaceScore: null,
        sceneIrisScore: null,
        stockFaceImage: null,
        stockIrisImage: null,
        matchMode: null,
        matchScore: null,
        checkliveScore: null,
        checkliveResult: null,
        result: null,
        receivedTime: null,
        timeUsed: null,
        faceTimeUsed: null,
        irisTimeUsed: null,
        temperature: null,
        temperatureFloor: null,
        temperatureTop: null,
        deviceSn: null,
        deviceModel: null,
        deviceName: null,
        deviceIp: null,
        deviceLongitude: null,
        deviceDimension: null,
        deviceDirection: null,
        serverId: null,
        createTime: null,
        batchDate: null,
        remark: null,
        tenantId: null,
        temperatureResult: null
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
    /** 详情操作 */
    handleShowDetail (row) {
      this.reset();
      const id = row.id
      getFaceirisMatch(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "人脸虹膜比对日志详情";
      });
    },
    /** 导出按钮操作 */
    handleExport () {
      this.exportTipVisible = false
      const queryParams = Object.assign({ exportLatestOnly: this.exportLatestOnly }, this.queryParams);
      exportFaceirisMatch(queryParams).then(response => {
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
