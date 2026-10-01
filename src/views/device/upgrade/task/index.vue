<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="70px">
      <el-form-item label="设备编码" prop="deviceNo">
        <el-input v-model="queryParams.deviceNo" placeholder="请输入设备编码" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="APP名称" prop="appName">
        <el-input v-model="queryParams.appName" placeholder="请输入APP名称" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="APP版本" prop="appVersion">
        <el-input v-model="queryParams.appVersion" placeholder="请输入APP版本号" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="执行结果" prop="executeResult">
        <el-select size="small" class="ec-form-select" v-model="queryParams.executeResult" clearable>
          <el-option v-for="item in taskResultOptions" :key="item.dictValue" :label="item.dictLabel" :value="item.dictValue">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="cyan" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd" v-hasPermi="['device:upgradeTask:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete" v-hasPermi="['device:upgradeTask:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" icon="el-icon-download" size="mini" @click="handleExport" v-hasPermi="['device:upgradeTask:export']">导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" border :data="upgradeTaskList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="设备编码" align="center" prop="deviceNo">
        <template slot-scope="scope">
          <el-tooltip class="item" effect="dark" :disabled="scope.row.deviceNo !=null" content="设备已删除" placement="top">
            <span>{{scope.row.deviceNo ? scope.row.deviceNo : '-'}}</span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="设备名称" align="center" prop="deviceName">
        <template slot-scope="scope">
          <el-tooltip class="item" effect="dark" :disabled="scope.row.deviceName !=null" content="设备已删除" placement="top">
            <span>{{scope.row.deviceName ? scope.row.deviceName : '-'}}</span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="APP名称_版本" align="center" prop="appName">
        <template slot-scope="scope">
          <el-tooltip class="item" effect="dark" :disabled="scope.row.appName != null" content="版本已删除" placement="top">
            <span>{{scope.row.appName ? scope.row.appName+'_'+scope.row.appVersion : '-'}}</span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="执行次数" align="center" prop="executeCount" />
      <el-table-column label="任务排序" align="center" prop="taskIndex" />
      <el-table-column label="执行结果" align="center" prop="executeResult" :formatter="taskResultFormat" />
      <el-table-column label="开始时间" align="center" prop="upgradeTime" width="180"/>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180"/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="180">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-info" @click="handleShowDetail(scope.row)" v-hasPermi="['device:upgradeTask:query']">详情</el-button>
          <el-button size="mini" type="text" icon="el-icon-document" @click="handleShowTaskLog(scope.row)">日志</el-button>
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleSkip(scope.row)" v-hasPermi="['device:upgradeTask:edit']">跳过</el-button>
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleRelease(scope.row)">发布</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改升级任务对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="700px" append-to-body :close-on-click-modal="false">
      <el-form ref="form" :model="form" :rules="rules" label-width="90px" :disabled="isShowDetailDialog">
        <template v-if="!isShowDetailDialog">
          <el-form-item label="选择版本" prop="versionId">
            <el-select class="ec-form-select" v-model="form.versionId" filterable remote reserve-keyword clearable placeholder="请输入APP名称远程检索" :remote-method="remoteQueryDeviceVersion" :loading="remoteSelectLoading">
              <el-option v-for="item in deviceVersionOptions" :key="item.id" :label="item.appName + '_' + item.version" :value="item.id">
                <span style="float: left">{{ item.appName }}</span>
                <span style="float: left; font-size: 13px">_{{ item.version }}</span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="选择设备" prop="deviceNo">
            <el-input v-model="form.deviceNo" placeholder="请点击右侧图标选择设备" disabled>
              <el-button slot="append" icon="el-icon-search" @click="handleSelectDevice"></el-button>
            </el-input>
          </el-form-item>
        </template>
        <template v-else>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="设备编码" prop="deviceNo">
                <el-input v-model="form.deviceNo" />
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
              <el-form-item label="APP版本" prop="appName">
                <el-input :value="form.appName ? form.appName + '_' + form.appVersion : ''" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="任务排序" prop="taskIndex">
                <el-input v-model="form.taskIndex" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="发布次数" prop="pubCount">
                <el-input v-model="form.pubCount" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="执行次数" prop="executeCount">
                <el-input v-model="form.executeCount" />
              </el-form-item>
            </el-col>
          </el-row>
        </template>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="升级上限" prop="upgradeCountLimit">
              <el-input type="number" v-model="form.upgradeCountLimit" placeholder="请输入升级次数上限">
                <template slot="append">次</template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="开始时间" prop="upgradeTime">
              <el-date-picker clearable style="width: 100%" v-model="form.upgradeTime" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" placeholder="选择升级开始时间">
              </el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12" v-if="isShowDetailDialog">
            <el-form-item label="执行结果" prop="executeResult">
              <el-input :value="taskResultFormat(form)" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="降级安装" prop="rollbackInstall">
              <el-switch v-model="form.rollbackInstall" active-color="#13ce66" inactive-color="#ccc">
              </el-switch>
            </el-form-item>
          </el-col>
        </el-row>
        <template v-if="isShowDetailDialog">
          <el-row :gutter="20" >
            <el-col :span="12">
              <el-form-item label="创建人" prop="createBy">
                <el-input v-model="form.createBy" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="创建时间" prop="createTime">
                <el-input v-model="form.createTime" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="修改人" prop="updateBy">
                <el-input v-model="form.updateBy" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="修改时间" prop="updateTime">
                <el-input v-model="form.updateTime" />
              </el-form-item>
            </el-col>
          </el-row>
        </template>
      </el-form>
      <div slot="footer" class="dialog-footer" v-if="!isShowDetailDialog">
        <el-button type="primary" :loading="submitLoading" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
    <!-- 选择设备 -->
    <list-device :opens="selectDeviceOpen" :versionId="form.versionId" @select-over="handleSelectOver" @close="deviceClose"></list-device>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { listUpgradeTask, getUpgradeTask, delUpgradeTask, addUpgradeTask, updateUpgradeTask, exportUpgradeTask, publishTask } from "@/api/device/upgrade/task";
import { listAllVersion } from "@/api/device/upgrade/version";
import ListDevice from '@/views/components/device/list-device.vue';
export default {
  name: "UpgradeTask",
  components: {
    ListDevice
  },
  data() {
    return {
      // 提交加载
      submitLoading:false,
      // 遮罩层
      loading: true,
      // 删除名称
      deviceName:"",
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
      // 升级任务表格数据
      upgradeTaskList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        orderByColumn: 'task_index',
        isAsc: 'desc',
        deviceNo: null,
        appName: null,
        appVersion: null,
        executeResult: null,
        tenantId: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        versionId: [
          { required: true, message: "APP版本不能为空", trigger: "change" }
        ],
        deviceNo: [
          { required: true, message: "设备不能为空", trigger: "change" }
        ],
        upgradeCountLimit: [
          { required: true, message: "升级次数上限不能为空", trigger: "blur" }
        ],
        rollbackInstall: [
          { required: true, message: "是否降级安装不能为空", trigger: "change" }
        ],
        upgradeTime: [
          { required: true, message: "升级开始时间不能为空", trigger: "change" }
        ]
      },
      // 执行结果选项
      taskResultOptions: [],
      // 设备版本信息选项 
      deviceVersionOptions: [],
      // 远程检索版本loading
      remoteSelectLoading: false,
      // 打开选择设备窗口
      selectDeviceOpen: false,
      // 是否展示详情弹窗
      isShowDetailDialog: false

    };
  },
  computed: {
    ...mapGetters([
      'isTenantUser', 'tenantEnabled'
    ])
  },
  watch: {
    'form.versionId': {
      handler(newval, oldVal) {
        if (this.form.id == null) {
          this.form.deviceId = null
          this.form.deviceNo = null
        }
      }
    }
  },
  created() {
    this.getList();
    this.getDicts("device_upgrade_result").then(response => {
      this.taskResultOptions = response.data;
    });
  },
  methods: {
    /** 关闭弹窗 */
    deviceClose() {
      this.selectDeviceOpen = false;
    },
    /** 查询升级任务列表 */
    getList() {
      this.loading = true;
      listUpgradeTask(this.queryParams).then(response => {
        this.upgradeTaskList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    close() {
      this.selectDeviceOpen = false;
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        versionId: null,
        deviceId: null,
        deviceNo: null,
        deviceName: null,
        appName: null,
        appVersion: null,
        upgradeTime: null,
        upgradeCountLimit: 3,
        executeCount: null,
        pubCount: null,
        taskIndex: null,
        executeResult: null,
        rollbackInstall: false,
        createBy: null,
        updateBy: null,
        createTime: null,
        updateTime: null,
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
      this.deviceName = selection.map(item=>item.deviceName)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.isShowDetailDialog = false;
      this.open = true;
      this.title = "添加升级任务";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      this.isShowDetailDialog = false;
      const id = row.id || this.ids
      getUpgradeTask(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改升级任务";
      });
    },
    /** 发布 */
    async handleRelease(row) {
      const data = await publishTask(row.id);
      if(data.code == 200) {
        this.msgSuccess("发布成功");
      }
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          this.submitLoading = true;
          if (this.form.id != null) {
            updateUpgradeTask(this.form).then(response => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.submitLoading = false;
              this.getList();
            }).catch(()=>this.submitLoading = false);
          } else {
            addUpgradeTask(this.form).then(response => {
              this.msgSuccess("新增成功");
              this.open = false;
              this.submitLoading = false;
              this.getList();
            }).catch(()=>this.submitLoading = false);;
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$confirm('是否确认删除设备名称为"' + this.deviceName + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return delUpgradeTask(ids);
      }).then(() => {
        this.getList();
        this.msgSuccess("删除成功");
      })
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm('是否确认导出所有升级任务数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return exportUpgradeTask(queryParams);
      }).then(response => {
        this.download(response.msg);
      })
    },
    /**处理跳过  */
    handleSkip(row) {
      if (row.executeResult !== '1') {
        this.msgError('只有待执行任务可以跳过');
        return;
      }
      this.$confirm('是否确认跳过该升级任务?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return updateUpgradeTask({ id: row.id, executeResult: '4' });
      }).then(() => {
        this.getList();
        this.msgSuccess("任务已跳过");
      })
    },
    /**详情展示 */
    handleShowDetail(row) {
      this.reset();
      this.isShowDetailDialog = true;
      getUpgradeTask(row.id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "升级任务详情";
      });
    },
    /**查看日志 */
    handleShowTaskLog(row){
      this.$router.push({path:'/device/upgrade/upgradelog', query: {taskId: row.id}})
    },
    // 执行结果字典翻译
    taskResultFormat(row, column) {
      return this.selectDictLabel(this.taskResultOptions, row.executeResult);
    },
    /**远程检索版本信息 */
    remoteQueryDeviceVersion(val) {
      this.remoteSelectLoading = true
      this.deviceVersionOptions = [];
      if (!val) {
        this.remoteSelectLoading = false
        return
      }
      listAllVersion({ appName: val, enabled: true }).then(res => {
        this.remoteSelectLoading = false
        this.deviceVersionOptions = res.data
      })
    },
    /**选择设备 */
    handleSelectDevice() {
      if (!this.form.versionId) {
        this.$refs.form.validateField('versionId');
        this.msgInfo('请先选择版本');
        return;
      }
      this.selectDeviceOpen = true;
    },
    /**选择设备完毕回调 */
    handleSelectOver(deviceInfos) {
      if (!deviceInfos || !deviceInfos.length) {
        return;
      }
      const deviceIds = deviceInfos.map(item => item.id).join();
      const deviceNos = deviceInfos.map(item => item.deviceNo).join();
      this.form.deviceId = deviceIds;
      this.form.deviceNo = deviceNos;
    }
  }
};
</script>
