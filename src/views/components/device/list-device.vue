<template>
  <el-dialog title="选择设备" :visible.sync="open" width="50%" :before-close="close" append-to-body :close-on-click-modal="false">

    <!--设备数据-->
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="设备编号" prop="deviceNo">
        <el-input v-model="queryParams.deviceNo" placeholder="请输入设备编号(SN)" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="设备名称" prop="deviceName">
        <el-input v-model="queryParams.deviceName" placeholder="请输入设备名称" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="设备型号" prop="deviceModelCode">
        <el-select size="small" v-model="queryParams.deviceModelCode" clearable filterable reserve-keyword placeholder="请输入型号名称检索">
          <el-option v-for="item in modelSelectOptions" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="所属场景" prop="channelCode">
        <el-select size="small" v-model="queryParams.channelCode" clearable filterable reserve-keyword placeholder="请输入场景名称检索">
          <el-option v-for="item in channelSelectOptions" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="选择区域" prop="areaId">
        <treeselect v-model="queryParams.areaId" :options="areaOptions" :show-count="true" placeholder="请选择归属区域" style="width: 200px;" />
      </el-form-item>
      <el-form-item>
        <el-button type="cyan" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" border :data="infoList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="设备编号" align="center" prop="deviceNo" />
      <el-table-column label="设备名称" align="center" prop="deviceName" />
      <el-table-column label="型号编码" align="center" prop="deviceModelCode" />
      <el-table-column label="场景编码" align="center" prop="channelCode" />
      <el-table-column label="在线状态" align="center" prop="deviceState">
        <template slot-scope="scope">
          <div :class="{'ec-online-status': true, 'online': scope.row.deviceState== '1', 'offline': scope.row.deviceState== '2'}" :title="deviceOnlineStateFormat(scope.row)"></div>
        </template>
      </el-table-column>
      <el-table-column label="安装地点" align="center" prop="deviceAddr" show-overflow-tooltip />
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submitSelect()">确 定</el-button>
      <el-button @click="close()">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { listUpgradeDevice, listInfo } from "@/api/device/info";
import { treeselect } from "@/api/area/model";
import { listAllChannel } from "@/api/scene/channel";
import { listAllModel } from "@/api/device/model";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
export default {
  name: "ListDevice",
  components: {
    Treeselect
  },
  data() {
    return {
      // 显示隐藏弹窗
      open:false,
      // 遮罩层
      loading: true,
      // 选中数组
      selections: [],
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 设备信息表格数据
      infoList: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        deviceNo: null,
        deviceName: null,
        deviceModelCode: null,
        channelCode: null,
        areaId: null,
      },
      // 场景列表
      channelSelectOptions: [],
      // 型号列表
      modelSelectOptions: [],
      // 设备在线状态
      deviceOnlineStateOptions: [],
      // 区域树选项
      areaOptions: [],
    };
  },
  props: {
    // 是否显示弹窗
    opens: {
      type: Boolean,
      default: false
    },
    // 版本主键
    versionId: {
      type: String,
      default: null
    },
    // 是否是版本升级
    forUpgrade: {
      type: Boolean,
      default: true
    },
    // 选择单个型号
    selSingleModel: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    opens: {
        handler(val) {
          console.log(val);
          this.open = val;
          this.getList();
        },
        immediate:true
    }
  },
  created() {
    this.getList();
    this.getTreeselect();
    this.listAllChannel();
    this.listAllModel();
    this.getDicts("client_device_type").then(response => {
      this.deviceTypeOptions = response.data;
    });
    this.getDicts("device_online_state").then(response => {
      this.deviceOnlineStateOptions = response.data;
    });
  },
  methods: {
    /** 查询设备信息列表 */
    getList() {
      if (this.forUpgrade && !this.versionId) {
        this.infoList = [];
        this.total = 0;
        return;
      }
      this.loading = true;
      if (this.forUpgrade) {
        listUpgradeDevice(this.versionId, this.queryParams).then(response => {
          this.infoList = response.rows;
          this.total = response.total;
          this.loading = false;
        });
      } else {
        listInfo(this.queryParams).then(response => {
          this.infoList = response.rows;
          this.total = response.total;
          this.loading = false;
        });
      }
    },
    /** 查询所有场景列表 */
    listAllChannel() {
      this.channelSelectOptions = []
      listAllChannel().then(response => {
        if (response.data && response.data.length) {
          this.channelSelectOptions = response.data.map(item => {
            return {
              value: `${item.channelCode}`,
              label: `${item.channelName}`,
              channelId: `${item.id}`,
            };
          });
        }
      });
    },
    /** 查询所有型号列表 */
    listAllModel() {
      listAllModel().then(response => {
        if (response.data && response.data.length) {
          this.modelSelectOptions = response.data.map(item => {
            return {
              value: `${item.modelCode}`,
              label: `${item.modelName}`
            };
          });
        }
      });
    },
    /** 查询区域下拉树结构 */
    getTreeselect() {
      treeselect().then(response => {
        this.areaOptions = response.data;
      });
    },
    // 在线状态字典翻译
    deviceOnlineStateFormat(row, column) {
      return this.selectDictLabel(this.deviceOnlineStateOptions, row.deviceState);
    },
    // 设备类型字典翻译
    deviceTypeFormat(row, column) {
      return this.selectDictLabel(this.deviceTypeOptions, row.deviceType);
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.queryParams.areaId = null;
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.selections = selection;
    },
    // 提交选择
    submitSelect() {
      if (!this.selections || !this.selections.length) {
        this.msgError('请至少选择一条数据');
        return;
      }
      if (this.selSingleModel) {
        let modelArray = Array.from(new Set(this.selections.map(item => item.deviceModelCode)));
        if (modelArray.length > 1) {
          this.msgError('只能选择单个型号的设备');
          return;
        }
      }
      this.$emit('select-over', this.selections)
      this.close()
    },
    // 关闭弹窗
    close() {
      Object.assign(this.$data, this.$options.data())
      this.open = false;
      this.$emit('close')
    }
  }
};
</script>
<style lang="scss" scoped>
.ec-online-status {
  width: 15px;
  height: 15px;
  border-radius: 50%;
  position: relative;
  float: left;
  left: calc(50% - 8px);
  &.online {
    background-color: #05f570;
  }
  &.offline {
    background-color: red;
  }
}
</style>