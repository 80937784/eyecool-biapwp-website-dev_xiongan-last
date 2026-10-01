<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="人员标识" prop="uniqueId">
        <el-input v-model="queryParams.uniqueId" placeholder="请输入人员标识" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="数据来源" prop="datasource">
        <el-select v-model="queryParams.datasource" placeholder="数据来源" clearable size="small" style="width: 200px">
          <el-option v-for="dict in datasourceOptions" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="状态" clearable size="small" style="width: 200px">
          <el-option v-for="dict in statusOptions" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="cyan" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="danger" icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete" v-hasPermi="['basedata:fingerVein:remove']">删除</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" border :data="fingerList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="人员标识" align="center" prop="uniqueId">
        <template slot-scope="scope">
          <router-link :to="{name:'Personinfo', params:{uniqueId: scope.row.uniqueId}}">
            <span class="link-type">{{scope.row.uniqueId}}</span>
          </router-link>
        </template>
      </el-table-column>
      <el-table-column label="特征MD5" align="center" prop="featureMd5">
      </el-table-column>
      <el-table-column label="是否加密" align="center" prop="encrypted">
        <template slot-scope="scope">
          <div>{{handleShowEncrypted(scope.row.encrypted)}}</div>
        </template>
      </el-table-column>
      <el-table-column label="数据来源" align="center" prop="datasource">
        <template slot-scope="scope">
          <div>{{handleShowDatasource(scope.row.datasource)}}</div>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status">
        <template slot-scope="scope">
          <div>{{handleShowStatus(scope.row.status)}}</div>
        </template>
      </el-table-column>
      <el-table-column label="操作时间" align="center" prop="createTime">
        <template slot-scope="scope">
          {{scope | changeTime}}
        </template>
      </el-table-column>
      <!-- <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="100">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-info" @click="handleShowDetail(scope.row)" v-hasPermi="['basedata:finger:query']">详细</el-button>
        </template>
      </el-table-column> -->
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getFingerVeinList, delFingerVeinList } from "@/api/basedata/fingervein";
import moment from "moment"
export default {
  name: "Fingervein",
  filters: {
    changeTime (scope) {
      const createTime = scope.row.createTime;
      const updateTime = scope.row.updateTime;
      if (updateTime) return moment(updateTime).format('yyyy-MM-DD hh:mm:ss');
      return moment(createTime).format('yyyy-MM-DD hh:mm:ss');
    }
  },
  data () {
    return {
      fingerList: [],
      // uniquedId数组
      uniqueIdOptions: [],
      // 远程搜索加载
      selectLoading: false,
      // 删除名称
      fingerName: "",
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
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        uniqueId: null,
        fingerNo: null,
        datasource: null,
        status: '0',
        tenantId: null
      },
      // 数据来源数据字典
      datasourceOptions: [],
      // 状态数据字典
      statusOptions: [],
      // 是否加密数据字典
      encryptedOptions: [],
    };
  },
  computed: {
    ...mapGetters([
      'isTenantUser', 'tenantEnabled'
    ])
  },
  created () {
    this.getDicts("apply_data_source").then(response => {
      this.datasourceOptions = response.data;
    });
    this.getDicts("sys_normal_disable").then(response => {
      this.statusOptions = response.data;
    });
    this.getDicts("apply_encrypted").then(response => {
      this.encryptedOptions = response.data;
    });
    this.getDicts("bio_finger_code").then(response => {
      this.fingerCodeOptions = response.data;
    });

    this.getList();
  },
  methods: {
    selectChange (val) {
      console.log(this.form.uniqueId);
      console.log(val);
    },
    /** 过滤人员标识远程搜索 */
    remoteMethod (query) {
      if (query !== '') {
        this.selectLoading = true;
        getUniqueId({ name: query }).then(res => {
          console.log(res);
          this.selectLoading = false;
          this.uniqueIdOptions = res.rows;
        })
      } else {
        this.uniqueIdOptions = [];
      }
    },
    /** 查询指纹图像信息列表 */
    getList () {
      this.loading = true;
      getFingerVeinList(this.queryParams).then(response => {
        this.fingerList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
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
        personId: null,
        uniqueId: null,
        fingerNo: null,
        featureMd5: null,
        qualityScore: null,
        imageUrl: null,
        encrypted: null,
        remark: null,
        status: "0",
        createBy: null,
        updateBy: null,
        createTime: null,
        updateTime: null,
        batchDate: null,
        tenantId: null,
        imgBase64: null
      };
      this.fingerCollectType = 'fingerLocal';
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery () {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery () {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange (selection) {
      this.ids = selection.map(item => item.id)
      this.fingerName = selection.map(item => item.uniqueId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 删除按钮操作 */
    handleDelete (row) {
      const ids = row.id || this.ids;
      this.$confirm('是否确认删除人员标识为"' + this.fingerName + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return delFingerVeinList(ids);
      }).then(() => {
        this.getList();
        this.msgSuccess("删除成功");
      })
    },

    /** 数据来源显示转换 */
    handleShowDatasource (val) {
      return this.selectDictLabel(this.datasourceOptions, val);
    },
    /** 状态显示转换 */
    handleShowStatus (val) {
      return this.selectDictLabel(this.statusOptions, val);
    },
    /**是否加密显示转换 */
    handleShowEncrypted (val) {
      return this.selectDictLabel(this.encryptedOptions, val);
    }
  }
};
</script>
<style lang="scss" scoped>
.ec-edit-tip {
  color: red;
  font-size: 12px;
  text-align: center;
}
</style>
<style lang="scss">
.hide {
  .el-upload--picture-card {
    display: none;
  }
}
</style>