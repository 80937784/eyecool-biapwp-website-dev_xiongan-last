<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="检活结果" prop="checkliveResult">
        <el-select v-model="queryParams.checkliveResult" placeholder="请选择结果" clearable size="small">
          <el-option v-for="dict in checkliveResultOptions" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="cyan" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="warning" icon="el-icon-download" size="mini" @click="handleExport" v-hasPermi="['tradelog:checklive:export']">导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="checkliveList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="请求时间" align="center" prop="receivedTime" />
      <el-table-column label="场景编码" align="center" prop="channelCode" />
      <el-table-column label="检活类型" align="center">
        <template slot-scope="scope">
          <span>{{scope.row.sceneVideo ? '视频' : '照片'}}</span>
        </template>
      </el-table-column>
      <el-table-column label="检活分值" align="center" prop="checkliveScore" />
      <el-table-column label="结果信息" align="center" prop="checkliveMsg" />
      <el-table-column label="检活结果" align="center" prop="checkliveResult" :formatter="checkliveResultFormat" />
      <el-table-column label="检活阈值" align="center" prop="threshold" />
      <el-table-column label="耗时(ms)" align="center" prop="timeUsed" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="120">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-info" @click="handleShowDetail(scope.row)" v-hasPermi="['tradelog:checklive:query']">详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改人员人脸检活日志对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="700px" append-to-body :close-on-click-modal="false">
      <el-form ref="form" :model="form" label-width="100px" :disabled="true">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="检活结果" prop="checkliveResult">
              <el-select v-model="form.checkliveResult" class="ec-form-select">
                <el-option v-for="dict in checkliveResultOptions" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="检活分值" prop="checkliveScore">
              <el-input v-model="form.checkliveScore" />
            </el-form-item>
            <el-form-item label="检活阈值" prop="threshold">
              <el-input v-model="form.threshold" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="form.sceneVideo ? '最优帧照片' : '现场照'">
              <img :src="'data:image/jpeg;base64,' + form.sceneImageBase64" width="120" height="160">
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
            <el-form-item label="结果信息" prop="checkliveMsg">
              <el-input v-model="form.checkliveMsg" />
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
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { listChecklive, getChecklive, exportChecklive } from "@/api/tradelog/checklive";
import { asynctaskResult } from "@/api/common/asynctask";
import hasLoading from '@/utils/loading.js'
export default {
  name: "Checklive",
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
      // 人员人脸检活日志表格数据
      checkliveList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 检活结果(0通过，1未通过)字典
      checkliveResultOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        channelCode: null,
        checkliveResult: null,
        tenantId: null
      },
      // 表单参数
      form: {}
    };
  },
  created() {
    this.getList();
    this.getDicts("bio_result").then(response => {
      this.checkliveResultOptions = response.data;
    });
  },
  methods: {
    /** 查询人员人脸检活日志列表 */
    getList() {
      this.loading = true;
      listChecklive(this.queryParams).then(response => {
        this.checkliveList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 检活结果(0通过，1未通过)字典翻译
    checkliveResultFormat(row, column) {
      return this.selectDictLabel(this.checkliveResultOptions, row.checkliveResult);
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
        channelCode: null,
        sceneImage: null,
        sceneVideo: null,
        checkliveScore: null,
        checkliveMsg: null,
        checkliveResult: null,
        threshold: null,
        receivedTime: null,
        timeUsed: null,
        serverId: null,
        algsVersion: null,
        vendorCode: null,
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
    handleShowDetail(row) {
      this.reset();
      const id = row.id
      getChecklive(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "检活日志详情";
      });
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm('是否确认导出所有人员人脸检活日志数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return exportChecklive(queryParams);
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
