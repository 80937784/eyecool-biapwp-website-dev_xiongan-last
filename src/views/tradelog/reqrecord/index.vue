<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="交易码" prop="transCode">
        <el-input v-model="queryParams.transCode" placeholder="请输入交易码" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="交易标题" prop="transTitle">
        <el-input v-model="queryParams.transTitle" placeholder="请输入交易标题" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="客户端IP" prop="clientIp">
        <el-input v-model="queryParams.clientIp" placeholder="请输入客户端IP" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="状态码" prop="statusCode">
        <el-input v-model="queryParams.statusCode" placeholder="请输入状态码" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="场景编码" prop="channelCode">
        <el-input v-model="queryParams.channelCode" placeholder="请输入场景编码" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="请求时间">
        <el-date-picker v-model="dateRange" size="small" style="width: 240px" value-format="yyyy-MM-dd" type="daterange" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="cyan" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" border :data="reqrecordList" @selection-change="handleSelectionChange" :default-sort = "{prop: 'receivedTime', order: 'descending'}">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="交易码" align="center" prop="transCode" show-overflow-tooltip />
      <el-table-column label="交易标题" align="center" prop="transTitle" show-overflow-tooltip />
      <el-table-column label="客户端IP" align="center" prop="clientIp" />
      <el-table-column label="请求时间" align="center" prop="receivedTime" width="180" sortable/>
      <el-table-column label="耗时(ms)" align="center" prop="timeUsed" width="100"/>
      <el-table-column label="状态码" align="center" prop="statusCode" width="100"/>
      <el-table-column label="场景编码" align="center" prop="channelCode" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="100">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-info" @click="handleShowDetail(scope.row)" v-hasPermi="['tradelog:reqrecord:query']">详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改接口交易请求记录对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="800px" append-to-body :close-on-click-modal="false">
      <el-form ref="form" :model="form" label-width="100px" disabled>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="接口交易码" prop="transCode">
              <el-input v-model="form.transCode" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="交易标题" prop="transTitle">
              <el-input v-model="form.transTitle" />
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
            <el-form-item label="状态码" prop="statusCode">
              <el-input v-model="form.statusCode" />
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
            <el-form-item label="响应时间" prop="sendTime">
              <el-input v-model="form.sendTime" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="客户端IP" prop="clientIp">
              <el-input v-model="form.clientIp" />
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
            <el-form-item label="请求路径" prop="transUrl">
              <el-input v-model="form.transUrl" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="处理方法" prop="classMethod">
              <el-input v-model="form.classMethod" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="请求报文">
          <vue-json-editor :value="parseJson(form.recordDetail.requestMsg)" :showBtns="false" mode="view" lang="zh" v-if="form.recordDetail" />
          <el-input value="未记录" v-else />
        </el-form-item>
        <el-form-item label="响应报文">
          <vue-json-editor :value="parseJson(form.recordDetail.responseMsg)" :showBtns="false" mode="view" lang="zh" v-if="form.recordDetail" />
          <el-input value="未记录" v-else />
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import vueJsonEditor from 'vue-json-editor'
import { listReqrecord, getReqrecord } from "@/api/tradelog/reqrecord";

export default {
  name: "Reqrecord",
  components: {
    vueJsonEditor
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
      // 接口交易请求记录表格数据
      reqrecordList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 日期范围
      dateRange: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        orderByColumn: 'received_time',
        isAsc: 'desc',
        transCode: null,
        transTitle: null,
        clientIp: null,
        statusCode: null,
        channelCode: null,
        tenantId: null
      },
      // 表单参数
      form: {}
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询接口交易请求记录列表 */
    getList() {
      this.loading = true;
      listReqrecord(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
        this.reqrecordList = response.rows;
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
        transCode: null,
        transTitle: null,
        receivedTime: null,
        clientIp: null,
        sendTime: null,
        timeUsed: null,
        statusCode: null,
        transUrl: null,
        classMethod: null,
        channelCode: null,
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
      getReqrecord(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "接口报文详情";
      });
    },
    /** JSON转换 */
    parseJson(str) {
      if (typeof str == 'string') {
        try {
          var obj = JSON.parse(str);
          return typeof obj == 'object' && obj ? obj : { 'unexpected': str }
        } catch (e) {
          console.log('error：' + str + '!!!' + e);
          return { 'unexpected': str };
        }
      }
    }
  }
};
</script>
