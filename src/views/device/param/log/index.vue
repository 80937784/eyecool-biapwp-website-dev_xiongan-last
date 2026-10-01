<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="设备编号" prop="deviceNo">
        <el-input v-model="queryParams.deviceNo" placeholder="请输入设备编号" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="参数编码" prop="paramCode">
        <el-input v-model="queryParams.paramCode" placeholder="请输入参数编码" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="cyan" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd" v-hasPermi="['device:paramlog:add']">下发</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" icon="el-icon-download" size="mini" @click="handleExport" v-hasPermi="['device:paramlog:export']">导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" border :data="paramlogList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="设备编号" align="center" prop="deviceNo" />
      <el-table-column label="参数编码" align="center" prop="paramCode" />
      <el-table-column label="参数值" align="center" prop="paramValue" />
      <el-table-column label="下发结果" align="center" prop="distributeResult" :formatter="distributeResultFormat" />
      <el-table-column label="下发排序" align="center" prop="sortIndex" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180"/>
      <el-table-column label="修改时间" align="center" prop="updateTime" width="180"/>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改参数下发日志对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="800px" append-to-body :close-on-click-modal="false">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="选择设备" prop="deviceNo">
          <el-input v-model="form.deviceNo" placeholder="请点击右侧图标选择设备" disabled>
            <el-button slot="append" icon="el-icon-search" @click="handleSelectDevice"></el-button>
          </el-input>
        </el-form-item>
        <el-form-item label="选择参数" prop="paramCode">
          <el-select class="ec-form-select" v-model="form.paramCode" clearable filterable reserve-keyword multiple collapse-tags placeholder="请输入参数名称检索">
            <el-option v-for="item in paramSelectOptions" :key="item.value" :label="item.label" :value="item.value">
              <span style="float: left">{{ item.label }}</span>
              <span style="float: left; color: #8492a6; font-size: 13px">【{{ item.value }}】</span>
            </el-option>
          </el-select>
        </el-form-item>
        <template v-for="(item, index) in distributeParams">
          <el-col :span="12" :key="index">
            <el-form-item :label="item.label" :prop="item.value" :rules="[{ required: true, message: '参数不能为空', trigger: 'blur' }]">
              <el-input v-model="form[item.value]" :placeholder="item.paramDesc" :title="item.paramDesc">
              </el-input>
            </el-form-item>
          </el-col>

        </template>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" :loading="submitLoading" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
    <!-- 选择设备 -->
    <list-device :opens="selectDeviceOpen" :selSingleModel="true" :forUpgrade="false" @select-over="handleSelectOver" @close="selectDeviceOpen=false"></list-device>
  </div>
</template>

<script>
import { listParamlog, getParamlog, addParamlog, exportParamlog } from "@/api/device/param/log";
import { listAllParamModelRel } from "@/api/device/param/relation";
import ListDevice from '@/views/components/device/list-device.vue';
export default {
  name: "Paramlog",
  components: {
    ListDevice
  },
  data() {
    return {
      // 提交加载
      submitLoading:false,
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
      // 参数下发日志表格数据
      paramlogList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        deviceNo: null,
        paramCode: null,
        tenantId: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        deviceNo: [
          { required: true, message: "设备编号不能为空", trigger: "blur" }
        ],
        paramCode: [
          { required: true, message: "参数编码不能为空", trigger: "blur" }
        ],
        paramValue: [
          { required: true, message: "参数值不能为空", trigger: "blur" }
        ]
      },
      // 打开选择设备窗口
      selectDeviceOpen: false,
      // 参数列表
      paramSelectOptions: [],
      // 下发设备的型号
      distributeDeviceModelCode: null,
       // 下发结果字典
      distributeResultOptions: [],
    };
  },
  watch: {
    distributeDeviceModelCode: {
      handler(newVal, oldVal) {
        this.listAllParamInfo()
      }
    }
  },
  computed: {
    distributeParams() {
      if (!this.form.paramCode || !this.form.paramCode.length) {
        return [];
      }
      return this.paramSelectOptions.filter(item => this.form.paramCode.findIndex(el => el == item.value) != -1);
    }
  },
  created() {
    this.getList();
    this.getDicts("device_config_result").then(response => {
      this.distributeResultOptions = response.data;
    });
  },
  methods: {
    /** 查询参数下发日志列表 */
    getList() {
      this.loading = true;
      listParamlog(this.queryParams).then(response => {
        this.paramlogList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    /** 查询所有参数列表 */
    listAllParamInfo() {
      this.paramSelectOptions = [];
      if (!this.distributeDeviceModelCode) {
        return;
      }
      listAllParamModelRel(this.distributeDeviceModelCode).then(response => {
        if (response.data && response.data.length) {
          this.paramSelectOptions = response.data.map(item => {
            return {
              value: `${item.paramCode}`,
              label: `${item.paramName}`,
              paramDesc: `${item.paramDesc}`,
            };
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
        deviceNo: null,
        paramCode: null,
        paramValue: null,
        distributeResult: null,
        sortIndex: null,
        createTime: null,
        updateTime: null,
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
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "参数下发";
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          this.submitLoading = true;
          const data = {
            deviceNo: this.form.deviceNo,
            params: {}
          }
          this.form.paramCode.forEach(key => {
            data.params[key] = this.form[key]
          })
          addParamlog(data).then(response => {
            this.msgSuccess(response.msg);
            this.open = false;
            this.getList();
            this.submitLoading = false;
          }).catch(()=>this.submitLoading = false);
        }
      });
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm('是否确认导出所有参数下发日志数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return exportParamlog(queryParams);
      }).then(response => {
        this.download(response.msg);
      })
    },
    /**选择设备 */
    handleSelectDevice() {
      this.selectDeviceOpen = true;
    },
    /**选择设备完毕回调 */
    handleSelectOver(deviceInfos) {
      if (!deviceInfos || !deviceInfos.length) {
        return;
      }
      const deviceNos = deviceInfos.map(item => item.deviceNo).join();
      this.form.deviceNo = deviceNos;
      this.distributeDeviceModelCode = deviceInfos.map(item => item.deviceModelCode)[0]
    },
    // 下发结果字典翻译
    distributeResultFormat(row, column) {
      if(row.distributeResult == null) {
        return '未返回';
      }
      return this.selectDictLabel(this.distributeResultOptions, row.distributeResult);
    },
  }
};
</script>
