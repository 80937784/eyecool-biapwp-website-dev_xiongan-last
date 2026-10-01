<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px" @submit.native.prevent>
      <el-form-item label="源文件名" prop="fileName">
        <el-input v-model="queryParams.fileName" placeholder="请输入源文件名" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="cyan" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="warning" icon="el-icon-download" size="mini" @click="handleExport" v-hasPermi="['msg:logannex:export']">导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" border :data="logannexList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="消息日志ID" align="center" prop="logId" width="240"/>
      <el-table-column label="源文件名" align="center" prop="fileName">
        <template slot-scope="scope">
          <span @click="handleDownload(scope.row)" class="link-type">{{scope.row.fileName}}</span>
        </template>
      </el-table-column>
      <el-table-column label="文件MD5" align="center" prop="fileMd5" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180"/>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />
  </div>
</template>

<script>
import { listLogannex, getLogannex, exportLogannex } from "@/api/msg/log/logannex";
import { downLoadZip } from "@/utils/zipdownload";
export default {
  name: "Logannex",
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
      // 消息日志附件表格数据
      logannexList: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        logId: null,
        fileName: null,
        tenantId: null
      },
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询消息日志附件列表 */
    getList() {
      this.loading = true;
      const logId = this.$route.query.logId;
      if (logId) {
        this.queryParams.logId = logId;
      }
      listLogannex(this.queryParams).then(response => {
        this.logannexList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
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
      this.$confirm('是否确认导出所有消息日志附件数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return exportLogannex(queryParams);
      }).then(response => {
        this.download(response.msg);
      })
    },
    /**下载 */
    handleDownload(row) {
      downLoadZip('/msg/logannex/download/' + row.id, null);
    }
  }
};
</script>
