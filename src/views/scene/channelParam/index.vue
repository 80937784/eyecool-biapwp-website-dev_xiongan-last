<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="选择渠道" prop="channelId">
        <el-select size="small" class="ec-form-select" v-model="queryParams.channelId" clearable filterable reserve-keyword placeholder="请输入渠道名称检索">
          <el-option v-for="item in channelSelectOptions" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="参数编码" prop="paramCode">
        <el-input v-model="queryParams.paramCode" placeholder="请输入参数编码" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="认证类型" prop="bioAttestType">
        <el-select v-model="queryParams.bioAttestType" placeholder="请选择认证类型" clearable size="small">
          <el-option v-for="dict in bioAttestTypeOptions" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="cyan" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd" v-hasPermi="['scene:channelParam:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" icon="el-icon-edit" size="mini" :disabled="single" @click="handleUpdate" v-hasPermi="['scene:channelParam:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete" v-hasPermi="['scene:channelParam:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" icon="el-icon-download" size="mini" @click="handleExport" v-hasPermi="['scene:channelParam:export']">导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" border :data="channelParamList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="渠道名称" align="center" prop="channelName" />
      <el-table-column label="参数名称" align="center" prop="paramName" />
      <el-table-column label="参数编码" align="center" prop="paramCode" />
      <el-table-column label="参数键值" align="center" prop="paramValue" width="120"/>
      <el-table-column label="认证类型" align="center" prop="bioAttestType" width="120">
        <template slot-scope="scope">
          <div>{{handleShowAttestType(scope.row.bioAttestType)}}</div>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" show-overflow-tooltip />
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改渠道参数对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body :close-on-click-modal="false">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="选择渠道" prop="channelId" v-if="form.id == null">
          <el-select class="ec-form-select" v-model="form.channelId" filterable reserve-keyword placeholder="请输入渠道名称检索">
            <el-option v-for="item in channelSelectOptions" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="渠道名称" prop="channelName" v-if="form.id!=null">
          <el-input v-model="form.channelName" disabled />
        </el-form-item>
        <el-form-item label="认证类型" prop="bioAttestType">
          <el-select v-model="form.bioAttestType" placeholder="请选择认证类型" clearable size="small" class="ec-form-select" :disabled="form.id!=null" @change="handleChangeBioAttestType">
            <el-option v-for="dict in bioAttestTypeOptions" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue" />
          </el-select>
        </el-form-item>
        <el-form-item label="参数名称" prop="paramCode" v-if="form.id==null">
          <el-select v-model="form.paramCode" placeholder="请选择参数" clearable size="small" class="ec-form-select" @change="handleChangeParamKey">
            <el-option v-for="item in paramKeyOptions" :key="item.code" :label="item.name" :value="item.code" />
          </el-select>
        </el-form-item>
        <el-form-item label="参数名称" prop="paramName" v-if="form.id!=null">
          <el-input v-model="form.paramName" disabled />
        </el-form-item>
        <el-form-item label="参数键值" prop="paramValue">
          <el-input v-model="form.paramValue" placeholder="请输入参数键值" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="4" disabled />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { listChannelParam, getChannelParam, delChannelParam, addChannelParam, updateChannelParam, exportChannelParam, keyList } from "@/api/scene/channelParam";
import { listAllChannel } from "@/api/scene/channel";
export default {
  name: "ChannelParam",
  components: {
  },
  data() {
    return {
      // 删除标识
      delName:"",
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
      // 渠道参数表格数据
      channelParamList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        channelId: null,
        paramCode: null,
        bioAttestType: null,
        tenantId: null
      },
      // 表单参数
      form: {},
      // 保存表单遮罩
      formLoading: false,
      // 表单校验
      rules: {
        channelId: [
          { required: true, message: "渠道不能为空", trigger: "change" }
        ],
        paramCode: [
          { required: true, message: "参数编码不能为空", trigger: "blur" }
        ],
        paramValue: [
          { required: true, message: "参数键值不能为空", trigger: "blur" }
        ],
        bioAttestType: [
          { required: true, message: "认证类型不能为空", trigger: "change" }
        ],
      },
      // 渠道列表
      channelSelectOptions: [],
      // 表单选中渠道的渠道编码
      selectedChannelCode: null,
      // 认证类型列表
      bioAttestTypeOptions: [],
      // 参数Key列表
      paramKeyOptions: []
    };
  },
  computed: {
    ...mapGetters([
      'isTenantUser', 'tenantEnabled'
    ])
  },
  watch: {
    'queryParams.tenantId': {
      handler(newVal, oldVal) {
        this.listAllChannel();
      }
    }
  },
  created() {
    this.getDicts("channel_bio_attest_type").then(response => {
      this.bioAttestTypeOptions = response.data;
    });
    this.listAllChannel();
    this.getList();
  },
  methods: {
    /** 查询渠道参数列表 */
    getList() {
      this.loading = true;
      listChannelParam(this.queryParams).then(response => {
        this.channelParamList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    /** 查询所有渠道列表 */
    listAllChannel() {
      this.channelSelectOptions = [];
      listAllChannel({ tenantId: this.queryParams.tenantId }).then(response => {
        if (response.data && response.data.length) {
          this.channelSelectOptions = response.data.map(item => {
            return { value: `${item.id}`, label: `${item.channelName}`, channelCode: `${item.channelCode}` };
          });
        }
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
        channelId: null,
        paramCode: null,
        paramName: null,
        paramValue: null,
        bioAttestType: null,
        remark: null,
        createBy: null,
        updateBy: null,
        createTime: null,
        updateTime: null,
        batchDate: null,
        tenantId: null
      };
      this.paramKeyOptions = [];
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.queryParams.channelId = null;
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.delName = selection.map(item => item.channelName)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.queryParams.tenantId = null;
      this.open = true;
      this.title = "添加渠道参数";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      this.queryParams.tenantId = null;
      const id = row.id || this.ids
      getChannelParam(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改渠道参数";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.formLoading = true
      this.$refs["form"].validate(valid => {
        if (!valid) {
          this.formLoading = false
          return
        }
        if (this.form.id != null) {
          updateChannelParam(this.form).then(response => {
            this.msgSuccess("修改成功");
            this.open = false;
            this.formLoading = false
            this.getList();
          }).catch(err => {
            this.formLoading = false;
          });
        } else {
          addChannelParam(this.form).then(response => {
            this.msgSuccess("新增成功");
            this.open = false;
            this.formLoading = false
            this.getList();
          }).catch(err => {
            this.formLoading = false;
          });
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$confirm('是否确认删除渠道名称为"' + this.delName + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return delChannelParam(ids);
      }).then(() => {
        this.getList();
        this.msgSuccess("删除成功");
      })
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm('是否确认导出所有渠道参数数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return exportChannelParam(queryParams);
      }).then(response => {
        this.download(response.msg);
      })
    },
    /** 认证类型改变事件回调 */
    handleChangeBioAttestType(val) {
      this.form.paramCode = null;
      keyList({ bioAttestType: val }).then(response => {
        this.paramKeyOptions = response.data;
      })
    },
    /** 参数选择改变事件回调 */
    handleChangeParamKey(val) {
      const selectParamKey = this.paramKeyOptions.filter(item => item.code == val);
      if (selectParamKey && selectParamKey.length) {
        this.$set(this.form, 'remark', selectParamKey[0].desc)
        this.$set(this.form, 'paramName', selectParamKey[0].name)
      } else {
        this.form.remark = null;
        this.form.paramName = null;
      }
    },
    /**生物类型显示转换 */
    handleShowAttestType(val) {
      return this.selectDictLabel(this.bioAttestTypeOptions, val);
    },
  }
};
</script>
